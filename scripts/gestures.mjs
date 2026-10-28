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

const liftY = () =>
  page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('[class*="_lift_"]')).transform).m42);
/** Like drag, but samples the bar's lift after every move (to catch bounces / fights). */
const dragSampled = async (from, dx, dy, steps = 30, release = true) => {
  const ys = [];
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(from.x + (dx * i) / steps, from.y + (dy * i) / steps);
    ys.push(await liftY());
  }
  if (release) {
    await page.mouse.up();
    await page.waitForTimeout(500);
  }
  return ys;
};
/** Real touch events through CDP (Safari-like scroll decisions: the list is touch-action pan-x). */
const touchDrag = async (from, dx, dy, steps = 12) => {
  const cdp = await page.context().newCDPSession(page);
  const pt = (x, y) => [{ x, y, id: 1 }];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(from.x, from.y) });
  for (let i = 1; i <= steps; i++)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(from.x + (dx * i) / steps, from.y + (dy * i) / steps) });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(500);
};
const mono = (ys, dir) => ys.every((v, i) => i === 0 || dir * (v - ys[i - 1]) >= -0.5);

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


// --- 8.1 fixes: no bounce / fights, diagonal + touch ---
await open();
let ys = await dragSampled(await barCentre(), 0, -260, 40, false);
await page.waitForTimeout(500); // finger still down, far past the let-off
const held = await liftY();
await page.mouse.up();
await page.waitForTimeout(400);
check('pull before let-off is smooth (monotonic up)', mono(ys.slice(0, 15), -1), ys.slice(0, 15).map(Math.round).join(','));
check('after the snap the bar holds at the lift (no follow / bounce)', Math.abs(held + 64) < 1.5, `y=${held}`);
check('release after snap stays revealed', param('customize') === 'revealed' && Math.abs((await liftY()) + 64) < 1.5, `y=${await liftY()}`);

// Pull down immediately, while the snap spring may still be running.
await tap(1200, 600);
await drag(await barCentre(), 0, -150, 6);
ys = await dragSampled(await barCentre(), 0, 120, 30);
check('swipe down right after snapping closes', param('customize') === null, `customize=${param('customize')}`);
check('…and moves down without fighting the spring', mono(ys.slice(0, 12), 1), ys.slice(0, 12).map(Math.round).join(','));

await drag(await barCentre(), 0, -150);
await drag(await barCentre(), 60, 110); // diagonal swipe down
check('diagonal swipe down closes', param('customize') === null, `customize=${param('customize')}`);

await touchDrag(await barCentre(), 40, -160);
check('touch: diagonal pull up reveals (not stolen by native scroll)', param('customize') === 'revealed', `customize=${param('customize')}`);
await touchDrag(await barCentre(), -40, 120);
check('touch: swipe down closes', param('customize') === null, `customize=${param('customize')}`);
const scrollBefore = await page.evaluate(() => document.querySelector('[class*="_list_"]').scrollLeft);
await touchDrag(await barCentre(), -300, 10);
const scrollAfter = await page.evaluate(() => document.querySelector('[class*="_list_"]').scrollLeft);
check('touch: horizontal swipe still pages the widgets', scrollAfter > scrollBefore && param('customize') === null, `${scrollBefore}→${scrollAfter}`);

check('no page errors', errors.length === 0, errors.join(' | '));
await browser.close();
process.exitCode = failed ? 1 : 0;
