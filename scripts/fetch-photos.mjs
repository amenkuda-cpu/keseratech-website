// Downloads the openly licensed reference photos listed in src/content/photo-sources.json
// into public/photos/<id>.jpg (max 2000px wide). Credits and licences live in that JSON and are
// shown on the site next to every photo. Run: node scripts/fetch-photos.mjs
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require(require.resolve('sharp', { paths: [path.dirname(require.resolve('next/package.json'))] }));
const UA = { 'User-Agent': 'KeseraSite/1.0 (info@keseratech.com)' };
const root = path.dirname(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')));
const sources = JSON.parse(fs.readFileSync(path.join(root, 'src/content/photo-sources.json'), 'utf8'));
const out = path.join(root, 'public/photos');
fs.mkdirSync(out, { recursive: true });

async function commonsUrl(file) {
  const api = `https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(file)}&prop=imageinfo&iiprop=url&iiurlwidth=2000`;
  const j = await (await fetch(api, { headers: UA })).json();
  const info = Object.values(j.query.pages)[0].imageinfo[0];
  return info.thumburl ?? info.url;
}

const dims = {};
for (const s of sources) {
  const target = path.join(out, `${s.id}.jpg`);
  if (!fs.existsSync(target)) {
    const url = s.file ? await commonsUrl(s.file) : s.download;
    const res = await fetch(url, { headers: UA });
    if (!res.ok) throw new Error(`${s.id}: ${res.status} ${url}`);
    await sharp(Buffer.from(await res.arrayBuffer()))
      .rotate()
      .resize({ width: 2000, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .withMetadata({ exif: {} })
      .toFile(target);
  }
  const m = await sharp(target).metadata();
  dims[s.id] = { width: m.width, height: m.height };
  console.log(s.id, m.width, 'x', m.height);
}
fs.writeFileSync(path.join(root, 'src/content/photo-dimensions.json'), JSON.stringify(dims, null, 2) + '\n');
