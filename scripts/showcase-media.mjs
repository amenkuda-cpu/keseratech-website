// Builds the home page showcase clips from Mixkit originals (Mixkit Stock Video Free License:
// free for commercial use, no attribution required, no watermark).
// Each clip is trimmed to its best moment, colour-graded slightly for a consistent cinematic look,
// encoded as silent H.264 (1280x720, fast start) and given a WebP poster for the first frame.
//
// Run: node scripts/showcase-media.mjs   (needs ffmpeg on PATH; downloads originals to .cache/showcase)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const CACHE = path.join(root, '.cache', 'showcase');
const OUT = path.join(root, 'public', 'showcase');
fs.mkdirSync(CACHE, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

// id: Mixkit clip id · src: original file · start/length: seconds to keep · lift: brighten dark footage
export const CLIPS = [
  { id: 'builder', mixkit: 23228, src: 'https://assets.mixkit.co/videos/23228/23228-720.mp4', start: 0.4, length: 6.8 },
  { id: 'robot-arm', mixkit: 47258, src: 'https://assets.mixkit.co/videos/47258/47258-720.mp4', start: 7, length: 7 },
  { id: 'wind-engineer', mixkit: 24129, src: 'https://assets.mixkit.co/videos/24129/24129-720.mp4', start: 1, length: 7 },
  { id: 'robot-planting', mixkit: 47260, src: 'https://assets.mixkit.co/videos/47260/47260-720.mp4', start: 6, length: 7 },
];

const UA = { 'User-Agent': 'Mozilla/5.0 (KeseraSite)' };

for (const c of CLIPS) {
  const raw = path.join(CACHE, `${c.mixkit}.mp4`);
  if (!fs.existsSync(raw)) {
    const res = await fetch(c.src, { headers: UA });
    if (!res.ok) throw new Error(`${c.id}: ${res.status}`);
    fs.writeFileSync(raw, Buffer.from(await res.arrayBuffer()));
  }
  const grade = [
    'scale=1280:720:force_original_aspect_ratio=increase:flags=lanczos',
    'crop=1280:720',
    c.lift ? 'eq=brightness=0.06:contrast=1.08:saturation=0.95:gamma=1.18' : 'eq=contrast=1.06:saturation=0.94',
    // a gentle warm/teal split for a consistent look across different sources
    'colorbalance=rs=0.02:bs=-0.02:rh=0.03:bh=-0.03',
    'fps=25',
  ].join(',');
  const mp4 = path.join(OUT, `${c.id}.mp4`);
  execFileSync('ffmpeg', [
    '-v', 'error', '-y', '-ss', String(c.start), '-t', String(c.length), '-i', raw,
    '-vf', grade, '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-profile:v', 'high',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4,
  ]);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', mp4, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '78', path.join(OUT, `${c.id}.webp`)]);
  console.log(c.id, (fs.statSync(mp4).size / 1e6).toFixed(2), 'MB');
}
