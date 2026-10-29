// Frame-time eval: runs the main animations with the CPU throttled (≈ iPad budget) and reports, per scenario,
// frames, mean / p95 / worst frame (ms), frames over 2× budget, and where main-thread time went (script / style /
// layout / paint). Usage: node scripts/perf.mjs [--cpu 4] [--only a,b] [--mode dark]   (needs the dev server)
import { chromium } from 'playwright-core';

const args = process.argv.slice(2);
const arg = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const base = arg('--base', 'http://localhost:5173/');
const cpu = Number(arg('--cpu', 4));
const only = arg('--only', '')?.split(',').filter(Boolean);
const mode = arg('--mode', 'light');

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1366, height: 1024 } }); // iPad Pro 12.9 CSS px → stage scaled
const cdp = await page.context().newCDPSession(page);

const open = async (q = '') => {
  await page.goto(`${base}?mode=${mode}&${q}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${base}?mode=${mode}&${q}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
};
// Store actions need the dev server (window.hud); against a production build those scenarios are skipped.
const hud = (fn) => page.evaluate(`window.hud && (${fn})(window.hud.getState())`);
const barCentre = async () => {
  const b = await page.locator('[data-widget]').first().boundingBox();
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
};

/** Record frame times + trace categories while `run` executes, for `ms` after it starts. */
async function measure(name, setup, run, ms = 1200) {
  if (only.length && !only.includes(name)) return;
  await open(setup);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
  await page.evaluate(() => {
    window.__frames = [];
    let last = performance.now();
    const tick = (t) => {
      window.__frames.push(t - last);
      last = t;
      if (window.__frames.length < 2000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await cdp.send('Tracing.start', {
    categories: 'devtools.timeline,disabled-by-default-devtools.timeline',
    transferMode: 'ReturnAsStream',
  });
  await page.waitForTimeout(100);
  await page.evaluate(() => (window.__frames = []));
  const t0 = Date.now();
  await run();
  const left = ms - (Date.now() - t0);
  if (left > 0) await page.waitForTimeout(left);
  const frames = await page.evaluate(() => window.__frames.slice(1));
  const events = await stopTrace();
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  const sorted = [...frames].sort((a, b) => a - b);
  const p = (q) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))] ?? 0;
  const mean = frames.reduce((a, b) => a + b, 0) / (frames.length || 1);
  const sum = (names) =>
    events.filter((e) => names.includes(e.name) && e.ph === 'X').reduce((a, e) => a + (e.dur ?? 0), 0) / 1000;
  console.log(
    `${name.padEnd(22)} frames ${String(frames.length).padStart(4)}  mean ${mean.toFixed(1).padStart(5)}  p95 ${p(0.95).toFixed(1).padStart(5)}  worst ${sorted.at(-1)?.toFixed(0).padStart(4)}  >33ms ${String(frames.filter((f) => f > 33.4).length).padStart(3)}` +
      `  | script ${sum(['FunctionCall', 'EvaluateScript', 'TimerFire', 'FireAnimationFrame', 'EventDispatch']).toFixed(0).padStart(5)}  style ${sum(['UpdateLayoutTree', 'RecalculateStyles']).toFixed(0).padStart(4)}  layout ${sum(['Layout']).toFixed(0).padStart(4)}  paint ${sum(['Paint', 'PaintImage', 'RasterTask', 'Rasterize']).toFixed(0).padStart(5)}  composite ${sum(['CompositeLayers', 'UpdateLayer', 'Layerize']).toFixed(0).padStart(4)}`,
  );
}

async function stopTrace() {
  const done = new Promise((r) => cdp.once('Tracing.tracingComplete', r));
  await cdp.send('Tracing.end');
  const { stream } = await done;
  let data = '';
  for (;;) {
    const { data: chunk, eof } = await cdp.send('IO.read', { handle: stream });
    data += chunk;
    if (eof) break;
  }
  await cdp.send('IO.close', { handle: stream });
  const json = JSON.parse(data);
  return json.traceEvents ?? json;
}

console.log(`CPU ×${cpu}, ${mode}. Frame budget 16.7ms (60Hz). Times in ms.`);
await measure('idle', '', async () => {}, 1000);
await measure('panel→full', '', () => hud((s) => s.setCarView('full')));
await measure('full→panel', 'car=full', () => hud((s) => s.setCarView('panel')));
await measure('panel→collapsed', '', () => hud((s) => s.setCarView('collapsed')));
await measure('day→night', '', () => hud((s) => s.toggleMode()), 1400);
await measure('widget pull', '', async () => {
  const c = await barCentre();
  await page.mouse.move(c.x, c.y);
  await page.mouse.down();
  await page.mouse.move(c.x, c.y - 120, { steps: 30 });
  await page.mouse.up();
});
await measure('widget swipe', '', async () => {
  const c = await barCentre();
  await page.mouse.move(c.x, c.y);
  await page.mouse.down();
  await page.mouse.move(c.x - 300, c.y, { steps: 30 });
  await page.mouse.up();
});
await measure('move drag', '', async () => {
  const c = await barCentre();
  await page.mouse.move(c.x, c.y);
  await page.mouse.down();
  await page.mouse.move(c.x, c.y - 160, { steps: 20 });
  await page.waitForTimeout(400);
  await page.mouse.move(c.x + 600, c.y, { steps: 40 });
  await page.mouse.up();
}, 2200);
await measure('settings open', '', () => hud((s) => s.toggleSettings()));
await measure('map pan', '', async () => {
  await page.mouse.move(1000, 400);
  await page.mouse.down();
  await page.mouse.move(800, 300, { steps: 40 });
  await page.mouse.up();
});
await browser.close();
