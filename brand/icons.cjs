// Favicon, Apple touch icon and social image from the extracted artwork (run after extract.cjs).
const path = require('path');
const sharp = require(require.resolve('sharp', { paths: [path.dirname(require.resolve('next/package.json'))] }));
const pub = (f) => path.join(__dirname, '..', 'public', 'brand', f);
const app = (f) => path.join(__dirname, '..', 'src', 'app', f);
const BG = '#05060b';

async function icon(size, out, pad) {
  const mark = await sharp(pub('kesera-mark.png')).resize({ width: Math.round(size * (1 - pad * 2)) }).toBuffer();
  const m = await sharp(mark).metadata();
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: mark, left: Math.round((size - m.width) / 2), top: Math.round((size - m.height) / 2) }])
    .png().toFile(out);
}

(async () => {
  await icon(512, app('icon.png'), 0.16);
  await icon(180, app('apple-icon.png'), 0.18);
  const W = 1200, H = 630;
  const lockup = await sharp(pub('kesera-lockup-tagline.png')).resize({ width: 640 }).toBuffer();
  const lm = await sharp(lockup).metadata();
  const line = Buffer.from(`<svg width="${W}" height="40" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g"><stop offset="0" stop-color="#1a86fa" stop-opacity="0"/><stop offset=".5" stop-color="#9fd4ff"/><stop offset="1" stop-color="#1a86fa" stop-opacity="0"/></linearGradient><radialGradient id="r"><stop offset="0" stop-color="#5aa9ff" stop-opacity=".5"/><stop offset="1" stop-color="#5aa9ff" stop-opacity="0"/></radialGradient></defs><ellipse cx="600" cy="20" rx="260" ry="14" fill="url(#r)"/><rect x="0" y="19" width="${W}" height="2" fill="url(#g)"/></svg>`);
  await sharp({ create: { width: W, height: H, channels: 4, background: BG } })
    .composite([
      { input: lockup, left: Math.round((W - lm.width) / 2), top: 200 },
      { input: line, left: 0, top: 470 },
    ])
    .png().toFile(app('opengraph-image.png'));
  console.log('icons written');
})();
