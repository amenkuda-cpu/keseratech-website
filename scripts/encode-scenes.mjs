// Encodes the scroll-scene clips (robotic arm, crane, sprinkler) for scroll scrubbing.
//
// Sources: .cache/scenes/<id>.mov (or .mp4), and optionally .cache/scenes/<id>-mobile.mov for a
// purpose-made 9:16 version. Without one, the phone version is a centre crop of the main clip.
//
// Scrubbing means seeking to any frame on every scroll tick, so every 4th frame is a keyframe
// (-g 4). That keeps seeking quick at a fraction of the size of all-keyframe (-g 1) files.
// The clips carry an "AI 生成" (AI-generated) label in the bottom-right corner; the desktop crop
// keeps 88 % of the frame from the top-left area, which removes it. Phone crops are centred and
// stop above it.
//
// Outputs, per clip, in public/scenes/:
//   <id>.mp4 + <id>.webm             1280x720 (sprinkler 960x540), desktop
//   <id>-mobile.mp4 + -mobile.webm   540x960, phones under 768 px
//   <id>.webp + <id>-mobile.webp     posters (first frame)
//
// Run: node scripts/encode-scenes.mjs [id ...]   (needs ffmpeg on PATH)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const SRC = path.join(root, '.cache', 'scenes');
const OUT = path.join(root, 'public', 'scenes');
fs.mkdirSync(OUT, { recursive: true });

const IDS = ['robotic-arm', 'crane', 'sprinkler'];
const only = process.argv.slice(2);
const find = (name) => ['.mov', '.mp4', '.webm'].map((e) => path.join(SRC, name + e)).find((f) => fs.existsSync(f));

// Desktop: 88 % crop, 0.5 % in from the left and 4.5 % down, so the right 11 % and bottom 7.5 % fall away.
const DESKTOP = (w, h) => `crop=trunc(iw*0.88/2)*2:trunc(ih*0.88/2)*2:trunc(iw*0.005):trunc(ih*0.045),scale=${w}:${h}:flags=lanczos`;
// The sprinkler source is only 832x464, so it is not upscaled past 960x540.
const SIZE = { sprinkler: [960, 540] };
// Phone from a landscape clip: full width of a 9:16 window, centred, top 92 % of the height.
const PHONE_FROM_WIDE = 'crop=trunc(ih*0.92*9/16/2)*2:trunc(ih*0.92/2)*2:(iw-ih*0.92*9/16)/2:0,scale=540:960:flags=lanczos';
const PHONE_FROM_TALL = 'scale=540:960:force_original_aspect_ratio=increase:flags=lanczos,crop=540:960';

const ff = (args) => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
const kb = (f) => `${Math.round(fs.statSync(f).size / 1024)} KB`;

/** `crf` is the H.264 quality (lower = better, bigger); VP9 uses crf + 18 on its own scale. */
function encode(input, vf, base, crf) {
  const mp4 = path.join(OUT, `${base}.mp4`);
  const webm = path.join(OUT, `${base}.webm`);
  ff(['-i', input, '-vf', `${vf},fps=30`, '-an', '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', String(crf), '-g', '4', '-keyint_min', '4', '-sc_threshold', '0', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4]);
  ff(['-i', input, '-vf', `${vf},fps=30`, '-an', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', String(crf + 18), '-g', '4', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '4', webm]);
  const png = path.join(SRC, `${base}-poster.png`);
  ff(['-i', mp4, '-frames:v', '1', png]);
  return sharp(png).webp({ quality: 78 }).toFile(path.join(OUT, `${base}.webp`)).then(() => console.log(base.padEnd(22), 'mp4', kb(mp4), '· webm', kb(webm)));
}

for (const id of IDS.filter((x) => !only.length || only.includes(x))) {
  const main = find(id);
  if (!main) {
    console.warn(`skip ${id}: no source in .cache/scenes`);
    continue;
  }
  await encode(main, DESKTOP(...(SIZE[id] ?? [1280, 720])), id, 28);
  const tall = find(`${id}-mobile`);
  await encode(tall ?? main, tall ? PHONE_FROM_TALL : PHONE_FROM_WIDE, `${id}-mobile`, 30);
}
