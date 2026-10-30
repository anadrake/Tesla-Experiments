// Fidelity check: how close does a built state look to its Figma mock? (Phase 10)
// Usage: node scripts/fidelity.mjs --only name1,name2 [--base http://localhost:5173/] [--max 8]
// Needs the dev server. For each state in scripts/states.json with a `ref` (design-ref/<ref>):
//   - shoots the app at 1920×1200,
//   - if the ref is a whole Figma frame with the bezel (`refFrame: true`, 2032×1328 at any scale), crops the display
//     out of it (display at 56,51 — 1920×1200),
//   - scales both to the ref's resolution, compares per region (`regions` in the state, else a 4×3 grid; display px)
//     and prints, per region, the share of pixels that visibly differ (colour difference > 12%, or the state's
//     `tolerance` — e.g. Dark settings, whose grey background differs from the refs on purpose; a mean would be
//     diluted by the shared background). Regions over --max % (default 8) get ✗.
//   - writes shots/fidelity/<name>.png: app | Figma | diff heat map, regions outlined.
// Text that differs on purpose (clock, dates) shows up as small diffs — read the heat map, not just the numbers.
import { chromium } from 'playwright-core';
import { mkdirSync, readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const arg = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const base = arg('--base') ?? 'http://localhost:5173/';
const only = arg('--only')?.split(',');
const max = Number(arg('--max') ?? 8);

const { states } = JSON.parse(readFileSync(new URL('./states.json', import.meta.url)));
const targets = states.filter((s) => s.ref && (!only || only.includes(s.name)));
if (!targets.length) {
  console.error('No states with a `ref` matched.');
  process.exit(1);
}
mkdirSync('shots/fidelity', { recursive: true });

const FRAME = { width: 2032, height: 1328, display: { left: 56, top: 51, width: 1920, height: 1200 } };
const grid = () => {
  const r = {};
  for (let y = 0; y < 3; y++) for (let x = 0; x < 4; x++) r[`r${y}c${x}`] = [x * 480, y * 400, 480, 400];
  return r;
};

const browser = await chromium.launch({ channel: 'chrome' });
const app = await browser.newPage({ viewport: { width: 1920, height: 1200 } });
const lab = await browser.newPage();
let failed = 0;

for (const s of targets) {
  await app.goto(`${base}?${s.query}`, { waitUntil: 'networkidle' });
  await app.evaluate(() => document.fonts.ready);
  await app.waitForTimeout(700);
  const shot = (await app.screenshot()).toString('base64');
  const ref = readFileSync(`design-ref/${s.ref}`).toString('base64');
  const regions = s.regions ?? grid();
  const result = await lab.evaluate(
    async ({ shot, ref, regions, frame, isFrame, tol }) => {
      const load = (b64) =>
        new Promise((res) => {
          const i = new Image();
          i.onload = () => res(i);
          i.src = `data:image/png;base64,${b64}`;
        });
      const [a, f] = await Promise.all([load(shot), load(ref)]);
      // Figma display area inside the ref (scaled), and the scale from display px to ref px.
      const k = isFrame ? f.naturalWidth / frame.width : f.naturalWidth / 1920;
      const src = isFrame
        ? { x: frame.display.left * k, y: frame.display.top * k, w: 1920 * k, h: 1200 * k }
        : { x: 0, y: 0, w: f.naturalWidth, h: f.naturalHeight };
      const W = Math.round(src.w);
      const H = Math.round(src.h);
      const draw = (img, sx, sy, sw, sh) => {
        const c = new OffscreenCanvas(W, H);
        const g = c.getContext('2d');
        g.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
        return g.getImageData(0, 0, W, H);
      };
      const A = draw(a, 0, 0, a.naturalWidth, a.naturalHeight);
      const F = draw(f, src.x, src.y, src.w, src.h);
      const D = new ImageData(W, H);
      const px = new Float32Array(W * H);
      for (let i = 0; i < W * H; i++) {
        const o = i * 4;
        const d = (Math.abs(A.data[o] - F.data[o]) + Math.abs(A.data[o + 1] - F.data[o + 1]) + Math.abs(A.data[o + 2] - F.data[o + 2])) / 765;
        px[i] = d;
        const v = Math.min(255, d * 255 * 3);
        D.data[o] = v;
        D.data[o + 1] = 40;
        D.data[o + 2] = 255 - v;
        D.data[o + 3] = 255;
      }
      const s = W / 1920;
      const scores = {};
      for (const [name, [x, y, w, h]] of Object.entries(regions)) {
        let sum = 0;
        let n = 0;
        for (let yy = Math.round(y * s); yy < Math.round((y + h) * s); yy++)
          for (let xx = Math.round(x * s); xx < Math.round((x + w) * s); xx++) {
            sum += px[yy * W + xx] > tol ? 1 : 0;
            n++;
          }
        scores[name] = n ? (100 * sum) / n : 0;
      }
      // Side by side: app | Figma | diff, with the regions outlined.
      const out = new OffscreenCanvas(W * 3, H);
      const g = out.getContext('2d');
      g.putImageData(A, 0, 0);
      g.putImageData(F, W, 0);
      g.putImageData(D, W * 2, 0);
      g.strokeStyle = '#ff00aa';
      g.lineWidth = 2;
      g.font = '14px sans-serif';
      g.fillStyle = '#ff00aa';
      for (const [name, [x, y, w, h]] of Object.entries(regions))
        for (let p = 0; p < 3; p++) {
          g.strokeRect(p * W + x * s, y * s, w * s, h * s);
          if (p === 2) g.fillText(`${name} ${scores[name].toFixed(1)}%`, p * W + x * s + 4, y * s + 16);
        }
      const blob = await out.convertToBlob({ type: 'image/png' });
      const buf = new Uint8Array(await blob.arrayBuffer());
      let bin = '';
      for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
      return { scores, png: btoa(bin) };
    },
    { shot, ref, regions, frame: FRAME, isFrame: !!s.refFrame, tol: s.tolerance ?? 0.12 },
  );
  const { writeFileSync } = await import('node:fs');
  writeFileSync(`shots/fidelity/${s.name}.png`, Buffer.from(result.png, 'base64'));
  const line = Object.entries(result.scores)
    .map(([k, v]) => `${v > max ? '✗' : '✓'} ${k} ${v.toFixed(1)}%`)
    .join('  ');
  const bad = Object.values(result.scores).some((v) => v > max);
  if (bad) failed++;
  console.log(`${bad ? '✗' : '✓'} ${s.name}: ${line}`);
}
await browser.close();
console.log(`\nHeat maps: shots/fidelity/. ${failed ? `${failed} state(s) over ${max}%.` : 'All within threshold.'}`);
process.exitCode = failed ? 1 : 0;
