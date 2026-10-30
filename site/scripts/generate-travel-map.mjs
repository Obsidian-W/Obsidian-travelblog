// Rebuild with: node site/scripts/generate-travel-map.mjs
// Geometry: existing Natural Earth / world-atlas 1:110m TopoJSON.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const topology = JSON.parse(fs.readFileSync(path.join(site, 'data/countries-110m.json'), 'utf8'));
const regionSource = JSON.parse(fs.readFileSync(path.join(site, 'data/travel_map_regions_source.json'), 'utf8'));
const exploredRegions = JSON.parse(fs.readFileSync(path.join(site, 'data/travel_map_explored.json'), 'utf8'));
// Preserve the destinations highlighted on the previous visited-countries map.
const visited = {
  ET:231, KE:404, MA:504, RE:638, RW:646, TZ:834, TN:788, UG:800,
  AM:51, AZ:31, KH:116, CN:156, GE:268, IN:356, ID:360,
  JP:392, KZ:398, KG:417, LA:418, NP:524, PH:608, KR:410,
  TW:158, TJ:762, TH:764, TR:792, TM:795, AE:784, UZ:860, VN:704,
  AT:40, BE:56, CZ:203, DK:208, FR:250, DE:276, HU:348, IS:352,
  IT:380, LV:428, LI:438, LU:442, MT:470, NL:528, PL:616, RU:643,
  SK:703, ES:724, SE:752, CH:756, VA:336, CU:192, DO:214, MX:484,
  US:840, AR:32, BO:68, CL:152, PE:604, AU:36, NZ:554,
};
const names = Object.fromEntries(['en', 'fr'].map(lang => [lang, new Intl.DisplayNames([lang], {type:'region'})]));
const shortNames = { TR:{en:'Turkey',fr:'Turquie'} };
const markers = { RE:[55.53,-21.12], LI:[9.55,47.16], MT:[14.38,35.94], VA:[12.45,41.90] };
const metadata = Object.fromEntries(Object.entries(visited).map(([code,id]) => [String(id).padStart(3,'0'), {
  code, visited:true, names:shortNames[code] ?? { en:names.en.of(code), fr:names.fr.of(code) },
  aliases:[names.en.of(code),names.fr.of(code),...Object.values(shortNames[code] ?? {})],
}]));
metadata['156'].aliases.push('Hong Kong', 'Macau', 'Macao');
function decode(index) {
  let x=0,y=0;
  const arc = topology.arcs[index < 0 ? ~index : index].map(([dx,dy]) => {
    x+=dx; y+=dy;
    return [x*topology.transform.scale[0]+topology.transform.translate[0], y*topology.transform.scale[1]+topology.transform.translate[1]];
  });
  return index < 0 ? arc.reverse() : arc;
}
function ring(indices) { return indices.flatMap((index,i) => decode(index).slice(i ? 1 : 0)); }
function clip(points, boundary, keepGreater) {
  const result=[];
  for(let i=0;i<points.length;i++) {
    const a=points[(i+points.length-1)%points.length], b=points[i];
    const insideA=keepGreater ? a[0]>=boundary : a[0]<=boundary;
    const insideB=keepGreater ? b[0]>=boundary : b[0]<=boundary;
    if(insideA !== insideB) result.push([boundary,a[1]+(b[1]-a[1])*(boundary-a[0])/(b[0]-a[0])]);
    if(insideB) result.push(b);
  }
  return result;
}
function project([lon,lat]) { return [(lon+180)*3,(84-lat)*3]; }
function polygonPath(points) {
  // Unwrap and clip at the date line so Russia and Fiji never cross the map.
  const unwrapped=[];
  for(const [lon,lat] of points) {
    let x=lon, previous=unwrapped.at(-1)?.[0] ?? lon;
    while(x-previous>180) x-=360;
    while(x-previous < -180) x+=360;
    unwrapped.push([x,lat]);
  }
  return [-360,0,360].map(offset => {
    let p=unwrapped.map(([x,y])=>[x+offset,y]);
    p=clip(clip(p,-180,true),180,false);
    if(p.length<3) return '';
    return p.map((point,i)=>`${i?'L':'M'}${project(point).map(n=>n.toFixed(1)).join(',')}`).join('')+'Z';
  }).join('');
}
const countries=topology.objects.countries.geometries.filter(g=>g.id !== '010').map(g=> {
  const id=String(g.id).padStart(3,'0');
  const polygons=g.type==='Polygon' ? [g.arcs] : g.arcs;
  return {id, aliases:[g.properties.name], names:{en:g.properties.name,fr:g.properties.name}, ...metadata[id],
    d:polygons.flatMap(p=>p.map(indices=>polygonPath(ring(indices)))).join('')};
});
for(const [code,coordinates] of Object.entries(markers)) {
  const id=String(visited[code]).padStart(3,'0');
  if(!countries.some(c=>c.id===id)) countries.push({id,...metadata[id],point:project(coordinates)});
}
const parents = {CHN:'CN', AUS:'AU', USA:'US', HKG:'CN', MAC:'CN'};
for (const country of countries.filter(c => ['CN','AU','US'].includes(c.code))) {
  const features = regionSource.features.filter(f => parents[f.properties.adm0_a3] === country.code);
  const groups = new Map();
  for (const feature of features) {
    const p = feature.properties;
    const id = p.adm0_a3 === 'HKG' ? 'CN-HK' : p.adm0_a3 === 'MAC' ? 'CN-MO' : p.iso_3166_2;
    if (!groups.has(id)) {
      const name = id === 'CN-HK' ? 'Hong Kong' : id === 'CN-MO' ? 'Macau' : id === 'CN-XZ' ? 'Tibet' : p.name_en || p.name;
      groups.set(id, {id, parent:country.id, parentCode:country.code,
        names:{en:name,fr:id === 'CN-HK' ? 'Hong Kong' : id === 'CN-MO' ? 'Macao' : id === 'CN-XZ' ? 'Tibet' : p.name_fr || name},
        explored:Object.hasOwn(exploredRegions,id), articleSlugs:exploredRegions[id] ?? [], d:''});
    }
    groups.get(id).d += feature.geometry.coordinates.flatMap(poly => poly.map(polygonPath)).join('');
  }
  country.regions = [...groups.values()];
  // Use the same coastlines for the base and subdivisions, without overlay seams.
  country.d = country.regions.map(r => r.d).join('');
  for (const region of country.regions) {
    if (region.id === 'CN-HK') region.point = project([114.17,22.32]);
    if (region.id === 'CN-MO') region.point = project([113.54,22.20]);
  }
}
fs.writeFileSync(path.join(site,'data/travel_map.json'),JSON.stringify(countries));
console.log(`Generated ${countries.length} destinations; ${countries.filter(c=>c.visited).length} visited.`);
