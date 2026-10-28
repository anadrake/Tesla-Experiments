// Drives the widget-customization gestures with real pointer events and checks the result (via the URL deep-link state).
// Usage: node scripts/gestures.mjs [--base http://localhost:5173/]   (needs the dev server)
// Each check prints ✓/✗; exit code 1 if any fail. Add a check per new gesture (Phase 8.x).
import { chromium } from 'playwright-core';

const args = process.argv.slice(2);
const base = args[args.indexOf('--base') + 1] && args.includes('--base') ? args[args.indexOf('--base') + 1] : 'http://localhost:5173/';

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1920, height: 1200 } }); // 1:1 with design px
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
let failed = 0;

const check = (name, ok, detail = '') => {
  console.log(`${ok ? '✓' : '✗'} ${name}${ok ? '' : `  — ${detail}`}`);
  if (!ok) failed++;
};
const param = (k) => new URL(page.url()).searchParams.get(k);
const open = async (query = '') => {
  await page.goto(`${base}?mode=light&${query}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.waitForTimeout(300);
};
/** Centre of the active widget card. */
const barCentre = async () => {
  const box = await page.locator('[data-widget]').first().boundingBox();
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};
/** Press, move by (dx, dy) in steps, release. */
const drag = async (from, dx, dy, steps = 20) => {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + dx, from.y + dy, { steps });
  await page.mouse.up();
  await page.waitForTimeout(500); // springs settle
};
const tap = async (x, y) => {
  await page.mouse.click(x, y);
  await page.waitForTimeout(300);
};
const customizeOpacity = () =>
  page.evaluate(() => getComputedStyle(document.querySelector('[class*="customizeSlot"]')).opacity);

// --- 8.1 Pull-up ---
await open();
await drag(await barCentre(), 0, -40);
check('short pull springs back', param('customize') === null, `customize=${param('customize')}`);

await drag(await barCentre(), 0, -150);
check('long pull past let-off reveals', param('customize') === 'revealed', `customize=${param('customize')}`);
check('Customize button visible', Number(await customizeOpacity()) > 0.95, `opacity ${await customizeOpacity()}`);

await tap(1200, 600); // map
check('tap map dismisses', param('customize') === null, `customize=${param('customize')}`);
check('…and the map tap did nothing else', param('nav') === null && param('car') === null, page.url());

await drag(await barCentre(), 0, -150);
await tap(300, 600); // car render (would normally open Full)
check('tap car dismisses without opening Full', param('customize') === null && param('car') === null, page.url());

await drag(await barCentre(), 0, -150);
await drag(await barCentre(), 0, 100);
check('pull down hides', param('customize') === null, `customize=${param('customize')}`);

await drag(await barCentre(), 0, -150);
await drag(await barCentre(), 0, 20);
check('small pull down springs back to revealed', param('customize') === 'revealed', `customize=${param('customize')}`);
await tap(1200, 600);

await drag(await barCentre(), 0, -150, 2);
check('fast flick (2 moves) reveals', param('customize') === 'revealed', `customize=${param('customize')}`);
await tap(1200, 600);

await drag(await barCentre(), -200, -30);
check('horizontal swipe does not reveal', param('customize') === null, `customize=${param('customize')}`);

const playLabel = () => page.locator('[data-widget="music"] button[aria-label*="Pause"], [data-widget="music"] button[aria-label*="Play"]').first().getAttribute('aria-label');
const before = await playLabel();
await page.locator('[data-widget="music"] button[aria-label*="Pause"], [data-widget="music"] button[aria-label*="Play"]').first().click();
await page.waitForTimeout(200);
check('play/pause still taps', (await playLabel()) !== before, `${before} → ${await playLabel()}`);

const btn = await page.locator('[data-widget="music"] button[aria-label="Next"]').boundingBox();
const playBefore = await playLabel();
await drag({ x: btn.x + btn.width / 2, y: btn.y + btn.height / 2 }, 0, -150);
check('pull starting on a button reveals, without pressing it', param('customize') === 'revealed' && (await playLabel()) === playBefore, page.url());
await page.getByRole('button', { name: 'Customize' }).click();
await page.waitForTimeout(300);
check('Customize → editing', param('customize') === 'editing', `customize=${param('customize')}`);

await open('car=full');
await drag(await barCentre(), 0, -150);
check('Full view: pull reveals (Q22)', param('customize') === 'revealed', `customize=${param('customize')}`);

await open('nav=navigating');
await drag(await barCentre(), 0, -150);
check('Driving: pull does nothing', param('customize') === null, `customize=${param('customize')}`);

check('no page errors', errors.length === 0, errors.join(' | '));
await browser.close();
process.exitCode = failed ? 1 : 0;
