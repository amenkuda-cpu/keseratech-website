// Turns the scroll-scene clips into frame sequences: numbered WebP stills that the page draws onto a
// canvas as you scroll (see src/animations/scroll-scenes.ts).
//
// Why frames, not video: scroll scrubbing a <video> means a seek on every scroll step, and each
// seek makes the decoder rebuild a frame from the last keyframe. That feels laggy and draggy on
// ordinary laptops. Drawing an already-loaded still is near-instant, so the scene follows the
// scroll exactly. This is how scroll-driven product pages are usually built.
//
// Sources (not committed; kept in .cache/):
//   .cache/scenes/robotic-arm.mov, .cache/scenes/crane.mov    AI-generated clips supplied by Kesera
//   .cache/media/4817951.mp4                                   Pexels EV charging clip (Gustavo Fring)
// Optional purpose-made 9:16 sources: .cache/scenes/<id>-mobile.mov
//
// The arm and crane carry an "AI 生成" label in the bottom-right corner. The desktop crop keeps 88 %
// of the frame from the top-left area, which removes it; phone crops are centred and stop above it.
//
// Outputs, per scene, in public/scenes/<id>/:
//   d/0001.webp ...   1280x720 desktop frames (12 per second of clip)
//   m/0001.webp ...   540x960 phone frames (under 768 px wide)
// and the frame counts in src/content/scene-frames.json.
//
// Run: node scripts/encode-scenes.mjs [id ...]   (needs ffmpeg on PATH)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const CACHE = path.join(root, '.cache');
const OUT = path.join(root, 'public', 'scenes');
const COUNTS = path.join(root, 'src', 'content', 'scene-frames.json');

/** Frames per second of clip. 12 gives a frame every few pixels of scroll, at a sensible download size. */
const FPS = 12;
/** WebP quality for desktop / phone frames. */
const QUALITY = { d: 60, m: 58 };

// Desktop: 88 % crop, 0.5 % in from the left and 4.5 % down (drops the AI label), then 1280x720.
const WIDE_NO_LABEL = 'crop=trunc(iw*0.88/2)*2:trunc(ih*0.88/2)*2:trunc(iw*0.005):trunc(ih*0.045),scale=1280:720:flags=lanczos';
// Phone from a landscape clip: a 9:16 window across the top 92 % of the height, at `x` (0-1) across.
const TALL_FROM_WIDE = (x = 0.5) => `crop=trunc(ih*0.92*9/16/2)*2:trunc(ih*0.92/2)*2:(iw-ih*0.92*9/16)*${x}:0,scale=540:960:flags=lanczos`;
const TALL_FROM_TALL = 'scale=540:960:force_original_aspect_ratio=increase:flags=lanczos,crop=540:960';
// The site's shared grade for Pexels footage (see fetch-media.mjs).
const GRADE = 'eq=contrast=1.04:saturation=0.9,colorbalance=rs=0.03:bs=-0.03:rh=0.03:bh=-0.03';
const WIDE_COVER = 'scale=1280:720:force_original_aspect_ratio=increase:flags=lanczos,crop=1280:720';

const SCENES = {
  'robotic-arm': { src: 'scenes/robotic-arm.mov', d: WIDE_NO_LABEL, m: TALL_FROM_WIDE() },
  crane: { src: 'scenes/crane.mov', d: WIDE_NO_LABEL, m: TALL_FROM_WIDE() },
  // The charging port sits right of centre, so the phone crop is shifted right to keep it in frame.
  'ev-charging': { src: 'media/4817951.mp4', start: 5, length: 8, d: `${WIDE_COVER},${GRADE}`, m: `${TALL_FROM_WIDE(0.78)},${GRADE}` },
};

const ff = (args) => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
const only = process.argv.slice(2);
const counts = fs.existsSync(COUNTS) ? JSON.parse(fs.readFileSync(COUNTS, 'utf8')) : {};

for (const [id, s] of Object.entries(SCENES)) {
  if (only.length && !only.includes(id)) continue;
  const src = path.join(CACHE, s.src);
  if (!fs.existsSync(src)) {
    console.warn(`skip ${id}: ${src} not found`);
    continue;
  }
  const tall = ['.mov', '.mp4'].map((e) => path.join(CACHE, 'scenes', `${id}-mobile${e}`)).find((f) => fs.existsSync(f));
  const cut = s.start !== undefined ? ['-ss', String(s.start), '-t', String(s.length)] : [];
  counts[id] = {};
  for (const [variant, input, vf] of [['d', src, s.d], ['m', tall ?? src, tall ? TALL_FROM_TALL : s.m]]) {
    const dir = path.join(OUT, id, variant);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    ff([...cut, '-i', input, '-vf', `${vf},fps=${FPS}`, '-an', '-c:v', 'libwebp', '-quality', String(QUALITY[variant]), '-compression_level', '6', path.join(dir, '%04d.webp')]);
    const files = fs.readdirSync(dir);
    const kb = files.reduce((sum, f) => sum + fs.statSync(path.join(dir, f)).size, 0) / 1024;
    counts[id][variant] = files.length;
    console.log(`${id.padEnd(12)} ${variant}  ${String(files.length).padStart(3)} frames  ${Math.round(kb)} KB`);
  }
}

fs.writeFileSync(COUNTS, JSON.stringify(counts, null, 2) + '\n');
