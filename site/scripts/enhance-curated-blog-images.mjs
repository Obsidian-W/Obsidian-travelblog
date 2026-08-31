#!/usr/bin/env node

import { mkdir, readdir, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

const sourceRoot = path.resolve('site/assets/images/blog');
const outputRoot = path.resolve('site/assets/images/blog-enhanced');
const phonePrefixes = ['azer', 'georgia', 'armenia', 'japan', 'korea', 'moscow', 'uae', 'philipines', 'taiwan', 'nz', 'aus', 'indo'];
const olderPrefixes = ['prague', 'krakow', 'sweden', 'denmark'];
const supported = /\.(jpe?g|png|webp|avif)$/i;

const files = (await readdir(sourceRoot))
  .filter((file) => supported.test(file))
  .map((file) => ({
    file,
    profile: matches(file, phonePrefixes) ? 'phone' : matches(file, olderPrefixes) ? 'older' : null,
  }))
  .filter(({ profile }) => profile)
  .sort((left, right) => left.file.localeCompare(right.file, undefined, { numeric: true }));

await mkdir(outputRoot, { recursive: true });

const results = [];
for (const item of files) {
  const source = path.join(sourceRoot, item.file);
  const destination = path.join(outputRoot, item.file);
  const metadata = await sharp(source).metadata();
  const before = await analyze(source);
  const adjustment = chooseAdjustment(before, item.profile);
  await render(source, destination, metadata, adjustment, item.profile);
  let after = await analyze(destination);
  const outputMetadata = await sharp(destination).metadata();

  if (metadata.width !== outputMetadata.width || metadata.height !== outputMetadata.height) {
    await rm(destination, { force: true });
    throw new Error(`Dimension check failed for ${item.file}`);
  }
  if ((metadata.orientation ?? 1) !== (outputMetadata.orientation ?? 1)) {
    await rm(destination, { force: true });
    throw new Error(`Orientation check failed for ${item.file}`);
  }

  // Gamma preserves the white point. This guard additionally catches any
  // unexpected highlight clipping introduced during colour conversion/JPEG encoding.
  const addedClipping = after.clippedFraction - before.clippedFraction;
  if (addedClipping > 0.004) {
    const safer = {
      ...adjustment,
      gamma: 1 + ((adjustment.gamma - 1) * 0.5),
      saturation: 1 + ((adjustment.saturation - 1) * 0.5),
    };
    await render(source, destination, metadata, safer, item.profile);
    Object.assign(adjustment, safer);
    after = await analyze(destination);
  }

  results.push({
    file: item.file,
    profile: item.profile,
    gamma: round(adjustment.gamma),
    saturation: round(adjustment.saturation),
    sourceMean: before.meanLuminance,
    outputMean: after.meanLuminance,
  });
}

console.log(`Enhanced ${results.filter(({ profile }) => profile === 'phone').length} phone-setting images.`);
console.log(`Enhanced ${results.filter(({ profile }) => profile === 'older').length} older images.`);
console.log(`Outputs: ${outputRoot}`);
console.table(results);

function matches(file, prefixes) {
  const stem = path.parse(file).name.toLowerCase();
  return prefixes.some((prefix) => stem.startsWith(prefix));
}

function chooseAdjustment(metrics, profile) {
  const meanNeed = clamp((0.26 - metrics.meanLuminance) / 0.22);
  const middleNeed = clamp((0.20 - metrics.medianLuminance) / 0.17);

  if (profile === 'phone') {
    // A gentle nonlinear lift: shadows and middle tones move more than highlights,
    // while black and white points remain fixed.
    const gamma = 1.025 + (meanNeed * 0.11) + (middleNeed * 0.105);
    const colourNeed = clamp((0.25 - metrics.meanSaturation) / 0.20);
    return {
      gamma: Math.min(1.24, gamma),
      saturation: 1 + (colourNeed * 0.035),
    };
  }

  // Older photos receive much less tonal change; the main improvement is mild,
  // edge-aware sharpening during the high-quality re-encode.
  return {
    gamma: Math.min(1.11, 1.01 + (meanNeed * 0.045) + (middleNeed * 0.055)),
    saturation: 1 + (clamp((0.20 - metrics.meanSaturation) / 0.16) * 0.02),
  };
}

async function render(source, destination, metadata, adjustment, profile) {
  const temporary = `${destination}.curated-${process.pid}`;
  let pipeline = sharp(source, { failOn: 'none' });

  // Keep the input encoding unchanged and apply only the output-side gamma.
  // This lifts shadows/midtones while pinning pure black and white.
  if (adjustment.gamma > 1.001) pipeline = pipeline.gamma(1, adjustment.gamma);
  if (adjustment.saturation > 1.001) pipeline = pipeline.modulate({ saturation: adjustment.saturation });
  if (profile === 'older') {
    pipeline = pipeline.sharpen({ sigma: 0.6, m1: 0.35, m2: 0.7, x1: 2, y2: 10, y3: 20 });
  }

  pipeline = pipeline.withMetadata({ orientation: metadata.orientation ?? 1 });
  const extension = path.extname(source).toLowerCase();
  if (extension === '.jpg' || extension === '.jpeg') {
    pipeline = pipeline.jpeg({
      quality: profile === 'older' ? 95 : 93,
      chromaSubsampling: '4:4:4',
      mozjpeg: true,
    });
  } else if (extension === '.png') {
    pipeline = pipeline.png({ compressionLevel: 9 });
  } else if (extension === '.webp') {
    pipeline = pipeline.webp({ quality: 93, smartSubsample: true });
  } else if (extension === '.avif') {
    pipeline = pipeline.avif({ quality: 90 });
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

async function analyze(file) {
  const { data, info } = await sharp(file, { failOn: 'none' })
    .resize({ width: 320, height: 320, fit: 'inside', withoutEnlargement: true })
    .removeAlpha()
    .toColourspace('srgb')
    .raw()
    .toBuffer({ resolveWithObject: true });
  const luminances = new Float32Array(info.width * info.height);
  let luminanceTotal = 0;
  let saturationTotal = 0;
  let clipped = 0;

  for (let pixel = 0, offset = 0; pixel < luminances.length; pixel += 1, offset += info.channels) {
    const red = data[offset] / 255;
    const green = data[offset + 1] / 255;
    const blue = data[offset + 2] / 255;
    const linearRed = srgbToLinear(red);
    const linearGreen = srgbToLinear(green);
    const linearBlue = srgbToLinear(blue);
    const luminance = (0.2126 * linearRed) + (0.7152 * linearGreen) + (0.0722 * linearBlue);
    const maximum = Math.max(red, green, blue);
    const minimum = Math.min(red, green, blue);
    luminances[pixel] = luminance;
    luminanceTotal += luminance;
    saturationTotal += maximum === 0 ? 0 : (maximum - minimum) / maximum;
    if (maximum >= 1) clipped += 1;
  }

  luminances.sort();
  return {
    meanLuminance: round(luminanceTotal / luminances.length),
    medianLuminance: round(luminances[Math.floor(luminances.length / 2)]),
    meanSaturation: round(saturationTotal / luminances.length),
    clippedFraction: round(clipped / luminances.length),
  };
}

function srgbToLinear(value) {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function clamp(value) {
  return Math.max(0, Math.min(1, value));
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}
