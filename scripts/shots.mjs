// Screenshots every state in scripts/states.json → shots/<name>.png (1920×1200, 1:1 with Figma).
// Usage: npm run shots [-- --base http://localhost:5173] [--only name1,name2] [--ipad]
//   --ipad also captures at iPad Pro 13" landscape (1376×1032) to check letterboxing.
// Uses your installed Google Chrome (playwright-core, no browser download).
import { chromium } from 'playwright-core';
import { readFileSync, mkdirSync } from 'node:fs';

const args = process.argv.slice(2);
const arg = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const base = arg('--base') ?? 'http://localhost:5173/';
const only = arg('--only')?.split(',');
const ipad = args.includes('--ipad');

const { states } = JSON.parse(readFileSync(new URL('./states.json', import.meta.url)));
const targets = only ? states.filter((s) => only.includes(s.name)) : states;
mkdirSync('shots', { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const viewports = [{ suffix: '', width: 1920, height: 1200 }];
if (ipad) viewports.push({ suffix: '.ipad', width: 1376, height: 1032 });

const errors = [];
for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  page.on('pageerror', (e) => errors.push(`${e.message}`));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  for (const s of targets) {
    await page.goto(`${base}?${s.query}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(700); // let entry animations settle (longest token = 600ms)
    const file = `shots/${s.name}${vp.suffix}.png`;
    await page.screenshot({ path: file });
    console.log('✓', file);
  }
  await page.close();
}
await browser.close();
if (errors.length) {
  console.error('\nConsole/page errors:\n' + [...new Set(errors)].join('\n'));
  process.exitCode = 1;
}
