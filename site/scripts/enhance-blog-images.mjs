#!/usr/bin/env node

import { mkdir, readdir, copyFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

const ROOT = path.resolve(process.cwd());
const DEFAULT_INPUT = path.join(ROOT, 'site', 'assets', 'images', 'blog');
const DEFAULT_OUTPUT = path.join(ROOT, 'site', 'assets', 'images', 'blog-enhanced');
const SUPPORTED = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

const options = parseArgs(process.argv.slice(2));

if (options.help) {
  printHelp();
  process.exit(0);
}

const inputDir = path.resolve(options.input ?? DEFAULT_INPUT);
const outputDir = path.resolve(options.output ?? DEFAULT_OUTPUT);

if (options.inPlace && !options.write) {
  fail('--in-place only makes sense together with --write.');
}

if (options.inPlace && options.output) {
  fail('--output cannot be combined with --in-place.');
}

const files = await findImages(inputDir);
if (files.length === 0) fail(`No supported images found in ${inputDir}`);

const results = [];
for (const file of files) {
  try {
    const metrics = await analyze(file);
    const correction = chooseCorrection(metrics, options);
    results.push({
      file: path.relative(inputDir, file).replaceAll('\\', '/'),
      ...metrics,
      ...correction,
    });
  } catch (error) {
    results.push({
      file: path.relative(inputDir, file).replaceAll('\\', '/'),
      selected: false,
      reason: 'error',
      error: error.message,
    });
  }
}

printSummary(results, options);

if (options.report) {
  const reportPath = path.resolve(options.report);
  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify({ inputDir, options, results }, null, 2)}\n`);
  console.log(`\nReport written to ${reportPath}`);
}

if (options.write) {
  const selected = results.filter((result) => result.selected && !result.error);
  if (selected.length === 0) {
    console.log('\nNothing met the correction thresholds; no files were written.');
  } else {
    await applyCorrections(selected, inputDir, outputDir, options);
  }
}

function parseArgs(args) {
  const parsed = {
    write: false,
    inPlace: false,
    includeMuted: true,
    maxBrightness: 1.2,
    maxSaturation: 1.14,
    quality: 90,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const next = () => {
      const value = args[index + 1];
      if (!value || value.startsWith('--')) fail(`Missing value after ${arg}`);
      index += 1;
      return value;
    };

    switch (arg) {
      case '--write': parsed.write = true; break;
      case '--in-place': parsed.inPlace = true; break;
      case '--no-muted': parsed.includeMuted = false; break;
      case '--input': parsed.input = next(); break;
      case '--output': parsed.output = next(); break;
      case '--report': parsed.report = next(); break;
      case '--max-brightness': parsed.maxBrightness = numberArg(next(), arg, 1, 1.35); break;
      case '--max-saturation': parsed.maxSaturation = numberArg(next(), arg, 1, 1.3); break;
      case '--quality': parsed.quality = numberArg(next(), arg, 70, 100); break;
      case '--help':
      case '-h': parsed.help = true; break;
      default: fail(`Unknown option: ${arg}`);
    }
  }

  return parsed;
}

function numberArg(value, name, minimum, maximum) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < minimum || number > maximum) {
    fail(`${name} must be between ${minimum} and ${maximum}.`);
  }
  return number;
}

async function findImages(directory) {
  const found = [];

  async function walk(current) {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(fullPath);
      else if (entry.isFile() && SUPPORTED.has(path.extname(entry.name).toLowerCase())) found.push(fullPath);
    }
  }

  await walk(directory);
  return found.sort((left, right) => left.localeCompare(right));
}

async function analyze(file) {
  const { data, info } = await sharp(file, { failOn: 'none' })
    .rotate()
    .resize({ width: 320, height: 320, fit: 'inside', withoutEnlargement: true })
    .removeAlpha()
    .toColourspace('srgb')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const luminances = new Float32Array(info.width * info.height);
  const saturations = new Float32Array(info.width * info.height);
  let luminanceTotal = 0;
  let saturationTotal = 0;

  for (let pixel = 0, offset = 0; pixel < luminances.length; pixel += 1, offset += info.channels) {
    const red = srgbToLinear(data[offset] / 255);
    const green = srgbToLinear(data[offset + 1] / 255);
    const blue = srgbToLinear(data[offset + 2] / 255);
    const luminance = (0.2126 * red) + (0.7152 * green) + (0.0722 * blue);
    const maximum = Math.max(data[offset], data[offset + 1], data[offset + 2]) / 255;
    const minimum = Math.min(data[offset], data[offset + 1], data[offset + 2]) / 255;
    const saturation = maximum === 0 ? 0 : (maximum - minimum) / maximum;
    luminances[pixel] = luminance;
    saturations[pixel] = saturation;
    luminanceTotal += luminance;
    saturationTotal += saturation;
  }

  luminances.sort();
  saturations.sort();

  return {
    width: info.width,
    height: info.height,
    meanLuminance: round(luminanceTotal / luminances.length),
    p10Luminance: round(percentile(luminances, 0.1)),
    medianLuminance: round(percentile(luminances, 0.5)),
    p90Luminance: round(percentile(luminances, 0.9)),
    meanSaturation: round(saturationTotal / saturations.length),
    p90Saturation: round(percentile(saturations, 0.9)),
  };
}

function chooseCorrection(metrics, config) {
  // Require both a low middle tone and a low average. This avoids treating a
  // naturally contrasty image (night sky, silhouette, concert) as misexposed.
  const darkScore = clamp(
    (clamp((0.17 - metrics.meanLuminance) / 0.12) * 0.55)
      + (clamp((0.12 - metrics.medianLuminance) / 0.09) * 0.45),
  );
  const hasColourToRecover = metrics.p90Saturation >= 0.22;
  const mutedScore = config.includeMuted && hasColourToRecover
    ? clamp((0.18 - metrics.meanSaturation) / 0.12)
    : 0;

  const selectedForDarkness = darkScore >= 0.18;
  const selectedForMutedColour = mutedScore >= 0.35 && metrics.meanLuminance < 0.42;
  const selected = selectedForDarkness || selectedForMutedColour;
  const brightness = selectedForDarkness
    ? round(1 + (darkScore * (config.maxBrightness - 1)))
    : 1;
  const saturationNeed = Math.max(mutedScore, selectedForDarkness ? 0.18 : 0);
  const saturation = selected && hasColourToRecover
    ? round(1 + (saturationNeed * (config.maxSaturation - 1)))
    : 1;

  return {
    selected,
    reason: selectedForDarkness && selectedForMutedColour
      ? 'dark+muted'
      : selectedForDarkness
        ? 'dark'
        : selectedForMutedColour
          ? 'muted'
          : 'healthy',
    darkScore: round(darkScore),
    mutedScore: round(mutedScore),
    brightness,
    saturation,
  };
}

async function applyCorrections(selected, sourceRoot, previewRoot, config) {
  const backupRoot = path.join(sourceRoot, '.enhance-backup', timestamp());

  for (const result of selected) {
    const source = path.join(sourceRoot, result.file);
    const destination = config.inPlace ? source : path.join(previewRoot, result.file);
    await mkdir(path.dirname(destination), { recursive: true });

    if (config.inPlace) {
      const backup = path.join(backupRoot, result.file);
      await mkdir(path.dirname(backup), { recursive: true });
      await copyFile(source, backup);
    }

    const temporary = `${destination}.enhancing-${process.pid}`;
    let pipeline = sharp(source, { failOn: 'none' })
      .rotate()
      .modulate({ brightness: result.brightness, saturation: result.saturation })
      .withMetadata();

    const extension = path.extname(source).toLowerCase();
    if (extension === '.jpg' || extension === '.jpeg') {
      pipeline = pipeline.jpeg({ quality: config.quality, mozjpeg: true });
    } else if (extension === '.png') {
      pipeline = pipeline.png({ compressionLevel: 9 });
    } else if (extension === '.webp') {
      pipeline = pipeline.webp({ quality: config.quality });
    } else if (extension === '.avif') {
      pipeline = pipeline.avif({ quality: config.quality });
    }

    try {
      await pipeline.toFile(temporary);
      await rm(destination, { force: true });
      await rename(temporary, destination);
    } catch (error) {
      await rm(temporary, { force: true });
      throw error;
    }
  }

  if (config.inPlace) {
    console.log(`\nEnhanced ${selected.length} images in place.`);
    console.log(`Originals backed up to ${backupRoot}`);
  } else {
    console.log(`\nWrote ${selected.length} enhanced previews to ${previewRoot}`);
    console.log('The source images were not changed.');
  }
}

function printSummary(results, config) {
  const failed = results.filter((result) => result.error);
  const selected = results.filter((result) => result.selected);
  const rows = selected
    .sort((left, right) => (right.darkScore + right.mutedScore) - (left.darkScore + left.mutedScore))
    .map((result) => ({
      file: result.file,
      reason: result.reason,
      luminance: result.meanLuminance,
      saturation: result.meanSaturation,
      brightness: `${result.brightness}x`,
      colour: `${result.saturation}x`,
    }));

  console.log(`Scanned ${results.length} images: ${selected.length} selected, ${results.length - selected.length - failed.length} healthy, ${failed.length} errors.`);
  if (rows.length) {
    console.table(rows.slice(0, 40));
    if (rows.length > 40) console.log(`...and ${rows.length - 40} more. Use --report <file> for the full decision list.`);
  }
  if (failed.length) console.table(failed.map(({ file, error }) => ({ file, error })));
  if (!config.write) console.log('\nDry run only. Add --write for non-destructive previews, or --write --in-place to replace with backups.');
}

function percentile(sorted, fraction) {
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))];
}

function srgbToLinear(value) {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function clamp(value) {
  return Math.min(1, Math.max(0, value));
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}

function timestamp() {
  return new Date().toISOString().replaceAll(':', '-').replace(/\.\d{3}Z$/, 'Z');
}

function printHelp() {
  console.log(`Usage: node site/scripts/enhance-blog-images.mjs [options]

Audits blog photos and gently corrects images that are unusually dark or muted.
The default is a read-only dry run.

Options:
  --write                 Write selected images to a preview directory
  --in-place              Replace source images (requires --write; creates backups)
  --input <directory>     Source directory (default: site/assets/images/blog)
  --output <directory>    Preview directory (default: site/assets/images/blog-enhanced)
  --report <file>         Save complete metrics and decisions as JSON
  --no-muted              Correct darkness only, not muted colour
  --max-brightness <n>    Maximum brightness multiplier, 1-1.35 (default: 1.2)
  --max-saturation <n>    Maximum saturation multiplier, 1-1.3 (default: 1.14)
  --quality <n>           Output quality, 70-100 (default: 90)
  -h, --help              Show this help`);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
