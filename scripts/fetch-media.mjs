// Downloads the Pexels photos and videos listed in src/content/media-sources.json and prepares them for the web.
// Pexels licence: free for commercial use, no attribution required (https://www.pexels.com/license/).
// Every asset gets the same gentle grade (slightly warm, slightly softened saturation) so photos from
// different photographers read as one set.
//   photos -> public/media/<id>.webp   (within 2000x1500, WebP q72; next/image serves smaller sizes)
//   videos -> public/media/<id>.mp4    (1280x720, silent H.264, fast start) + <id>.webp poster
// Sizes are written to src/content/media-dimensions.json.
//
// Run: node scripts/fetch-media.mjs   (needs ffmpeg on PATH; originals are cached in .cache/media)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const CACHE = path.join(root, '.cache', 'media');
const OUT = path.join(root, 'public', 'media');
const DIMS = path.join(root, 'src', 'content', 'media-dimensions.json');
fs.mkdirSync(CACHE, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

const sources = JSON.parse(fs.readFileSync(path.join(root, 'src', 'content', 'media-sources.json'), 'utf8'));
// With ids (`node scripts/fetch-media.mjs id1 id2`), only those assets are processed and the other sizes are kept.
const only = process.argv.slice(2);
const dims = only.length && fs.existsSync(DIMS) ? JSON.parse(fs.readFileSync(DIMS, 'utf8')) : {};

async function download(url, file) {
  if (fs.existsSync(file)) return;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

/** The shared grade: a touch warmer, a touch less saturated, gentle contrast. */
const grade = (img) => img.modulate({ saturation: 0.9 }).linear([1.04, 1.0, 0.95], [1, 0, -3]);

for (const s of sources.filter((x) => !only.length || only.includes(x.id))) {
  if (s.kind === 'photo') {
    const raw = path.join(CACHE, `${s.pexelsId}.jpg`);
    await download(`https://images.pexels.com/photos/${s.pexelsId}/pexels-photo-${s.pexelsId}.jpeg?auto=compress&cs=tinysrgb&w=2400`, raw);
    const out = path.join(OUT, `${s.id}.webp`);
    const info = await grade(sharp(raw).rotate().resize({ width: 2000, height: 1500, fit: 'inside', withoutEnlargement: true })).webp({ quality: 72, effort: 6 }).toFile(out);
    dims[s.id] = { width: info.width, height: info.height };
  } else {
    const raw = path.join(CACHE, `${s.pexelsId}.mp4`);
    await download(s.file, raw);
    const out = path.join(OUT, `${s.id}.mp4`);
    // Optional per-clip "width"/"height"/"crf" in media-sources.json, for clips shown large.
    const [w, h, crf] = [s.width ?? 1280, s.height ?? 720, s.crf ?? 29];
    const vf = [
      `scale=${w}:${h}:force_original_aspect_ratio=increase:flags=lanczos`,
      `crop=${w}:${h}`,
      'eq=contrast=1.04:saturation=0.9',
      'colorbalance=rs=0.03:bs=-0.03:rh=0.03:bh=-0.03',
      'fps=25',
    ].join(',');
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-ss', String(s.start), '-t', String(s.length), '-i', raw, '-vf', vf, '-an',
      '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]);
    const poster = path.join(CACHE, `${s.id}-poster.png`);
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', out, '-frames:v', '1', poster]);
    await sharp(poster).webp({ quality: 74 }).toFile(path.join(OUT, `${s.id}.webp`));
    dims[s.id] = { width: w, height: h };
  }
  const size = (f) => (fs.statSync(path.join(OUT, f)).size / 1024).toFixed(0) + ' KB';
  console.log(s.id.padEnd(22), s.kind === 'photo' ? size(`${s.id}.webp`) : `${size(`${s.id}.mp4`)} + poster ${size(`${s.id}.webp`)}`);
}

fs.writeFileSync(DIMS, JSON.stringify(dims, null, 2) + '\n');
