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

// --- 8.2 Customize mode ---
const editorVisible = () => page.getByText('Drag Icons to Panel to Customize').isVisible();
const dotCount = () => page.locator('[class*="editFrame"] [class*="_dot_"]').count();
const enterEditing = async () => {
  await drag(await barCentre(), 0, -150);
  await page.getByRole('button', { name: 'Customize' }).click();
  await page.waitForTimeout(400);
};
await open();
await enterEditing();
check('Customize opens the editor', (await editorVisible()) && param('customize') === 'editing', page.url());
await page.getByRole('button', { name: 'Done' }).click();
await page.waitForTimeout(500);
check('Done closes it and the bar comes back', !(await editorVisible()) && param('customize') === null && Math.abs(await liftY()) < 1, `y=${await liftY()}`);

await enterEditing();
await tap(1200, 600);
check('tap outside the panel (map) closes, swallowed', param('customize') === null && param('nav') === null, page.url());

await enterEditing();
await tap(300, 150); // panel, outside the editor cards
check('tap inside the panel (not a card) does nothing', param('customize') === 'editing' && param('car') === null, page.url());
await tap(500, 1150); // control bar → outside the panel
check('tap control bar closes', param('customize') === null && param('overlay') === null, page.url());

await enterEditing();
const view = await page.locator('[class*="editFrame"] [class*="_view_"]').boundingBox();
const viewC = { x: view.x + view.width / 2, y: view.y + view.height / 2 };
await drag(viewC, -150, 0);
check('swipe the edit track → next widget', param('widget') === '1', `widget=${param('widget')}`);
await drag(viewC, 150, 0);
check('swipe back', param('widget') === null, `widget=${param('widget')}`);

await page.getByRole('button', { name: 'Remove Music' }).click();
await page.waitForTimeout(600);
check('X removes the centred widget', param('widgets') === 'odometer,tire' && (await dotCount()) === 2, `widgets=${param('widgets')} dots=${await dotCount()}`);
check('…saved for reload (Q24)', (await page.evaluate(() => localStorage.getItem('hud.widgetTrack'))) === 'odometer,tire');
await page.getByRole('button', { name: /^Remove / }).click();
await page.waitForTimeout(600);
check('last widget has no X (never empty, Q18)', (await page.getByRole('button', { name: /^Remove / }).count()) === 0 && param('widgets') === 'tire', `widgets=${param('widgets')}`);
await page.getByRole('button', { name: 'Done' }).click();
await page.waitForTimeout(500);
check('bar shows the remaining widget after Done', await page.locator('[data-widget="tire"]').first().isVisible());

await open('car=full');
await enterEditing();
check('Customize from Full → Panel + editor', param('car') === null && (await editorVisible()), page.url());

await open('customize=editing');
const inertPreview = await page.evaluate(() => {
  const b = document.querySelector('[data-track-widget="music"] button');
  return !!b?.closest('[inert]');
});
check('edit-mode widgets are previews (inert)', inertPreview, 'music card buttons are live');

check('no page errors', errors.length === 0, errors.join(' | '));
await browser.close();
process.exitCode = failed ? 1 : 0;
