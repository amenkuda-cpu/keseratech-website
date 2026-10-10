// Cuts the Kesera Technologies wordmark out of the supplied artwork as transparent PNGs.
// The letterforms are copied pixel for pixel; only the dark backdrop is removed.
const path = require('path');
const sharp = require(require.resolve('sharp', { paths: [path.dirname(require.resolve('next/package.json'))] }));

const SRC = path.join(__dirname, 'kesera-logo-source.jpg');
const OUT = path.join(__dirname, '..', 'public', 'brand');
// Text rows in the artwork: KESERA, TECHNOLOGIES, the tagline with its two rules.
const BANDS = [[478, 643], [676, 711], [755, 769]];
const BG = [1, 6, 24]; // the backdrop colour around the text
const FLOOR = 38; // brightness at or below this is backdrop

async function main() {
  const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const bright = (x, y) => { const i = (y * W + x) * 3; return Math.max(data[i], data[i + 1], data[i + 2]); };
  const xBounds = (y0, y1) => {
    let a = W, b = 0;
    for (let y = y0; y <= y1; y++) for (let x = 0; x < W; x++) if (bright(x, y) > 120) { a = Math.min(a, x); b = Math.max(b, x); }
    return [a, b];
  };
  const cut = async (name, y0, y1, pad = 10, xr) => {
    const [xa, xb] = xr ?? xBounds(y0, y1);
    const left = Math.max(0, xa - pad), top = Math.max(0, y0 - pad);
    const width = Math.min(W - left, xb - xa + 1 + pad * 2), height = y1 - y0 + 1 + pad * 2;
    const out = Buffer.alloc(width * height * 4);
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const sy = top + y;
      const si = (sy * W + (left + x)) * 3, di = (y * width + x) * 4;
      const inBand = BANDS.some(([a, b]) => sy >= a - 4 && sy <= b + 4);
      const r = data[si], g = data[si + 1], bl = data[si + 2];
      const m = inBand ? Math.max(r, g, bl) : 0;
      const a = Math.max(0, Math.min(1, (m - FLOOR) / (235 - FLOOR)));
      const un = (c, bg) => (a > 0 ? Math.max(0, Math.min(255, Math.round((c - bg * (1 - a)) / a))) : 0);
      out[di] = un(r, BG[0]); out[di + 1] = un(g, BG[1]); out[di + 2] = un(bl, BG[2]); out[di + 3] = Math.round(a * 255);
    }
    await sharp(out, { raw: { width, height, channels: 4 } }).png({ compressionLevel: 9 }).toFile(path.join(OUT, name));
    console.log(name, width, height);
  };
  await cut('kesera-lockup.png', 478, 711, 12); // KESERA + TECHNOLOGIES
  await cut('kesera-lockup-tagline.png', 478, 769, 12); // with the tagline
  // The A with its dot: the last glyph of the KESERA row (the K's stroke runs into the E, so it can't be cut alone).
  const cols = [];
  for (let x = 0; x < W; x++) { let on = false; for (let y = 478; y <= 643; y++) if (bright(x, y) > 120) { on = true; break; } cols.push(on); }
  const runs = []; let s = -1; cols.forEach((on, x) => { if (on && s < 0) s = x; if (!on && s >= 0) { runs.push([s, x - 1]); s = -1; } });
  console.log('glyph runs', JSON.stringify(runs));
  const [a0, a1] = runs[runs.length - 1];
  await cut('kesera-mark.png', 478, 643, 8, [a0 + 8, a1]); // no padding on the left, where the R ends close by
}
main();
