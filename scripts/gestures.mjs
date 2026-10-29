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
  // Clear the saved track first, so one check's drop doesn't leak into the next page load.
  await page.evaluate(() => localStorage.clear()).catch(() => {});
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
check('Driving: pull reveals too (Q22, 2026-10-28)', param('customize') === 'revealed', `customize=${param('customize')}`);


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

// Second finger (resting thumb) moving while the first pulls must not move the bar.
{
  await open();
  const c = await barCentre();
  const cdp = await page.context().newCDPSession(page);
  const send = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
  const ys = [];
  await send('touchStart', [{ x: c.x, y: c.y, id: 1 }]);
  for (let i = 1; i <= 6; i++) await send('touchMove', [{ x: c.x, y: c.y - i * 8, id: 1 }]);
  await send('touchStart', [{ x: c.x, y: c.y - 48, id: 1 }, { x: c.x + 200, y: c.y + 40, id: 2 }]);
  for (let i = 1; i <= 8; i++) {
    await send('touchMove', [{ x: c.x, y: c.y - 48 - i * 2, id: 1 }, { x: c.x + 200, y: c.y + 40 - i * 25, id: 2 }]);
    ys.push(await liftY());
  }
  await send('touchEnd', []);
  await page.waitForTimeout(500);
  check('touch: a second finger moving does not drive the pull', param('customize') === null && ys.every((v) => v > -30), ys.map(Math.round).join(','));
}

// --- 8.2 Customize mode ---
const editorVisible = () => page.getByText('Drag Icons to Panel to Customize').isVisible();
const dotCount = () => page.locator('[class*="editFrame"] [class*="_dot_"]').count();
const enterEditing = async () => {
  await page.waitForTimeout(700); // any close choreography still running
  await drag(await barCentre(), 0, -150);
  await page.getByRole('button', { name: 'Customize' }).click();
  await page.waitForTimeout(800); // open choreography (picker lands at 0.6s)
};
await open();
await enterEditing();
check('Customize opens the editor', (await editorVisible()) && param('customize') === 'editing', page.url());
await page.getByRole('button', { name: 'Done' }).click();
await page.waitForTimeout(1200); // close choreography (0.25s)
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
check('removed widget loses its on-track bar in the picker', (await page.locator('[data-picker-app="music"] [data-on-track]').count()) === 0);
check('last widget has no X (never empty, Q18)', (await page.getByRole('button', { name: /^Remove / }).count()) === 0 && param('widgets') === 'tire', `widgets=${param('widgets')}`);
await page.getByRole('button', { name: 'Done' }).click();
await page.waitForTimeout(500);
check('bar shows the remaining widget after Done', await page.locator('[data-widget="tire"]').first().isVisible());

await open('car=full');
await enterEditing();
check('Customize in Full stays Full + editor', param('car') === 'full' && (await editorVisible()), page.url());
await tap(750, 400); // on the picker card (Full: moved with the bar, 433 right / 29 up)
check('Full: tap on the picker does nothing', param('customize') === 'editing', page.url());
await tap(1650, 500); // empty car canvas
await page.waitForTimeout(500);
check('Full: tap off the cards closes, stays Full', param('customize') === null && param('car') === 'full' && !(await editorVisible()), page.url());

await open('customize=editing');
const inertPreview = await page.evaluate(() => {
  const b = document.querySelector('[data-track-widget="music"] button');
  return !!b?.closest('[inert]');
});
check('edit-mode widgets are previews (inert)', inertPreview, 'music card buttons are live');

// --- 8.3 Drag & drop (editor = panel coords; the viewport is 1:1 with design px) ---
/** Gap centres at page 0 (track 0 centred): left of card 0 / right of card 0. Card centre y 817. */
const GAP = { left: 52, right: 558, y: 790 };
const ghostGone = () => page.locator('[data-drag-ghost]').count().then((n) => n === 0);
const pickerIcon = async (id) => {
  const b = await page.locator(`[data-picker-app="${id}"] button > :first-child`).boundingBox();
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
};
/** Drag a picker app to (x, y), wait `dwell` ms there, release. */
const dragApp = async (id, to, dwell = 500) => {
  const from = await pickerIcon(id);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y - 80, { steps: 12 });
  await page.mouse.move(to.x, to.y, { steps: 6 });
  await page.waitForTimeout(dwell);
  const target = await page.locator('[data-drop-target]').getAttribute('data-drop-target').catch(() => null);
  await page.mouse.up();
  await page.waitForTimeout(800);
  return target;
};

await open('customize=editing');
await page.mouse.move(...Object.values(await pickerIcon('phone')));
await page.mouse.down();
await page.mouse.move(GAP.right, GAP.y, { steps: 3 }); // straight in, then read the bar before the slot opens
await page.waitForTimeout(60);
const early = await page.locator('[data-drop-target]').getAttribute('data-drop-target').catch(() => null);
await page.waitForTimeout(500);
const late = await page.locator('[data-drop-target]').getAttribute('data-drop-target').catch(() => null);
const tileHidden = await page.locator('[data-picker-app="phone"]').evaluate((el) => getComputedStyle(el).visibility === 'hidden');
check('drag near a gap: insertion bar, then drop slot', early === 'bar' && late === 'slot', `${early} → ${late}`);
check('the dragged app leaves its picker tile', tileHidden);
await page.mouse.up();
await page.waitForTimeout(800);
check('drop inserts it there and pages to it', param('widgets') === 'music,phone,odometer,tire' && param('widget') === '1', page.url());
check('…the icon is gone and the tile is back', (await ghostGone()) && (await page.locator('[data-picker-app="phone"]').isVisible()));
await page.waitForTimeout(200);
check('…its picker tile now shows the on-track bar', (await page.locator('[data-picker-app="phone"] [data-on-track]').count()) === 1 && (await page.locator('[data-picker-app="calendar"] [data-on-track]').count()) === 0);

await open('customize=editing');
await dragApp('energy', { x: 1200, y: 600 }); // over the map
check('drop outside the track floats back (no change)', param('widgets') === null && (await ghostGone()), page.url());
await dragApp('energy', { x: 315, y: 817 }); // on the centred card, between the gaps
check('drop on a card (not a gap) floats back', param('widgets') === null && (await ghostGone()), page.url());

await open('customize=editing');
await page.mouse.click(...Object.values(await pickerIcon('energy')));
check('tapping a picker app does nothing', param('widgets') === null && param('customize') === 'editing', page.url());

await open('customize=editing');
const flashSamples = [];
{
  const from = await pickerIcon('music');
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(GAP.right, GAP.y, { steps: 12 });
  await page.waitForTimeout(500);
  await page.mouse.up();
  for (let i = 0; i < 12; i++) {
    flashSamples.push(await page.locator('[data-track-widget="music"] > *').evaluate((el) => Number(getComputedStyle(el).opacity)));
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(800);
}
check('duplicate next to itself: no change', param('widgets') === null && (await ghostGone()), page.url());
check('…and its card blinks', Math.min(...flashSamples) < 0.6, flashSamples.map((v) => v.toFixed(2)).join(','));

await open('customize=editing');
await dragApp('tire', { x: GAP.right, y: GAP.y });
check('duplicate into another gap moves it', param('widgets') === 'music,tire,odometer' && param('widget') === '1', page.url());
check('…and it ends up centred, like a newly added app', await page.locator('[data-track-widget="tire"]').boundingBox().then((b) => Math.abs(b.x - 62) < 15));

await open('customize=editing&widget=1');
await dragApp('music', { x: GAP.right, y: GAP.y }); // Music (left of the centred card) → right of it: page stays 1
check('move from left to right of the centred card pages to it', param('widgets') === 'odometer,music,tire' && (await page.locator('[data-track-widget="music"]').boundingBox().then((b) => Math.abs(b.x - 62) < 15)), page.url());

await open('customize=editing');
{
  // Hold the centred card 0.3s → lifted; drag to the right end → the track pages; drop in the gap after Odometer.
  await page.mouse.move(315, 817);
  await page.mouse.down();
  await page.waitForTimeout(450);
  const lifted = (await page.locator('[data-drag-ghost="music"]').count()) === 1;
  check('hold a track card 0.3s → it lifts', lifted);
  await page.mouse.move(610, 817, { steps: 10 });
  await page.waitForTimeout(900);
  const stripMoved = await page.locator('[data-track-widget="odometer"]').boundingBox().then((b) => Math.abs(b.x + b.width / 2 - 315) < 60); // the lit gap next to it nudges it aside a little
  check('…dragging it to the track end pages the track', param('widget') === '1' && stripMoved, page.url());
  await page.mouse.move(GAP.right, GAP.y, { steps: 6 });
  await page.waitForTimeout(200);
  await page.mouse.up();
  await page.waitForTimeout(900);
}
check('…dropped in a gap: reordered', param('widgets') === 'odometer,music,tire' && param('widget') === '1' && (await ghostGone()), page.url());

await open('customize=editing&widget=2');
{
  // Move the last card to the front: hold at the left end until the track reaches the start — the front gap
  // must light up there even though the finger is in the edge zone (nothing further to page to).
  await page.mouse.move(315, 817);
  await page.mouse.down();
  await page.waitForTimeout(450);
  await page.mouse.move(24, 817, { steps: 10 });
  await page.waitForTimeout(1700);
  const bar = await page.locator('[data-drop-target]').count();
  await page.mouse.up();
  await page.waitForTimeout(900);
  check('reorder to the front: the first gap lights up at the start', bar === 1 && param('widgets') === 'tire,music,odometer' && (param('widget') ?? '0') === '0', page.url());
}

await open('customize=editing&widget=1');
{
  await page.mouse.move(315, 817);
  await page.mouse.down();
  await page.waitForTimeout(450);
  // Both gaps in view are its own — nudging toward the left end pages quickly and the next gap lights up.
  await page.mouse.move(80, 700, { steps: 8 }); // toward the left end, above the frame
  await page.waitForTimeout(600);
  const t = await page.locator('[data-drop-target]').count();
  await page.mouse.up();
  await page.waitForTimeout(900);
  check('held card: a nudge toward an end pages fast and lights the next gap', t === 1 && param('widgets') === 'odometer,music,tire', `targets ${t} ${page.url()}`);
}

await open('customize=editing');
{
  const from = await pickerIcon('energy');
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(250, 610, { steps: 10 }); // ~200px from the left gap, above the frame
  await page.waitForTimeout(120);
  const t = await page.locator('[data-drop-target]').count();
  await page.mouse.up();
  await page.waitForTimeout(800);
  check('picker app: the bar shows from further away (above the frame, ~200px off)', t === 1, `targets ${t}`);
}

await open('customize=editing');
await drag({ x: 315, y: 817 }, -200, 0, 10); // quick swipe on a card is still paging, not a hold
check('a quick swipe on a card still pages', param('widget') === '1' && param('widgets') === null, page.url());

await open('customize=editing');
{
  await page.mouse.move(315, 817);
  await page.mouse.down();
  await page.waitForTimeout(450);
  await page.mouse.move(330, 830, { steps: 4 });
  await page.mouse.up();
  await page.waitForTimeout(800);
}
check('held card dropped where it was: no change', param('widgets') === null && (await ghostGone()), page.url());

await open('customize=editing');
await page.mouse.click(...Object.values(await pickerIcon('phone')));
check('picker tile press state clears after a tap', (await page.locator('[data-picker-app="phone"] button[data-pressed]').count()) === 0);

// Driving: Customize works there too (Anastasiya, 2026-10-28) — pull the bar up, tap Customize.
await open('nav=navigating');
await drag(await barCentre(), 0, -140);
await page.getByRole('button', { name: 'Customize' }).click();
await page.waitForTimeout(500);
check('driving: pull up → Customize opens the editor', (await editorVisible()) && param('customize') === 'editing', page.url());

// 8.4 Reduce Motion: the editor fades in place — the frame doesn't grow and the picker isn't wiped in.
await page.emulateMedia({ reducedMotion: 'reduce' });
await open('customize=revealed');
{
  const sizes = page.evaluate(
    () =>
      new Promise((res) => {
        const out = [];
        const t0 = performance.now();
        const f = () => {
          const bg = document.querySelector('[class*="frameBg"]');
          const clip = document.querySelector('[class*="pickerClip"]');
          if (bg) out.push(`${Math.round(bg.getBoundingClientRect().height)}/${Math.round(clip.getBoundingClientRect().height)}`);
          if (performance.now() - t0 < 500) requestAnimationFrame(f);
          else res([...new Set(out)]);
        };
        f();
      }),
  );
  await page.getByRole('button', { name: 'Customize' }).click();
  const seen = await sizes;
  check('reduce motion: editor opens without growing (frame / picker clip fixed)', seen.length === 1 && seen[0] === '322/670', seen.join(' '));
  const tile = await pickerIcon('phone');
  await page.mouse.move(tile.x, tile.y);
  await page.mouse.down();
  await page.mouse.move(tile.x + 20, tile.y + 20, { steps: 3 });
  await page.mouse.move(565, 817, { steps: 12 }); // the gap right of the centred card
  await page.waitForTimeout(450);
  await page.mouse.up();
  await page.waitForTimeout(300);
  check('reduce motion: drop still inserts, icon gone', param('widgets') === 'music,phone,odometer,tire' && (await ghostGone()), page.url());
}
await page.emulateMedia({ reducedMotion: 'no-preference' });

// --- 9.1 Swipe down collapses the bar to the pill of the widget showing (Q26) ---
const pill = () => page.locator('button[aria-label^="Expand"]');
/** Centre of the visible widget window (barCentre measures the first page, off-screen when paged). */
const windowCentre = async () => {
  const box = await page.locator('[class*="_window_"]').first().boundingBox();
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};
await open('widgets=music,odometer,tire,energy&widget=3');
await drag(await windowCentre(), 0, 30);
check('short swipe down springs back', param('bar') === null && Math.abs(await liftY()) < 1, `bar=${param('bar')} y=${await liftY()}`);
await drag(await windowCentre(), 0, 140);
check('swipe down collapses to the showing widget’s pill', param('bar') === 'collapsed' && (await pill().getAttribute('data-widget')) === 'energy', page.url());
check('…page remembered', param('widget') === '3', `widget=${param('widget')}`);
const pillBox = await pill().boundingBox();
await drag({ x: pillBox.x + pillBox.width / 2, y: pillBox.y + 32 }, 0, -140);
check('pulling up on the pill does nothing (no Customize)', param('bar') === 'collapsed' && param('customize') === null, page.url());
await tap(pillBox.x + pillBox.width / 2, pillBox.y + 32);
check('tap the pill reopens on the same widget', param('bar') === null && param('widget') === '3' && (await page.locator('section[data-widget="energy"]').isVisible()), page.url());
await touchDrag(await windowCentre(), 4, 140);
check('touch: swipe down collapses', param('bar') === 'collapsed', `bar=${param('bar')}`);
await open('');
await drag(await barCentre(), 0, -140);
await drag(await barCentre(), 0, 140);
check('swipe down while Customize is revealed only hides it', param('customize') === null && param('bar') === null, page.url());
await tap(...(await page.locator('[data-widget="music"] button[aria-label="Collapse music"]').boundingBox().then((b) => [b.x + 40, b.y + 40])));
check('album art tap collapses to the music pill', param('bar') === 'collapsed' && (await pill().getAttribute('data-widget')) === 'music', page.url());

// --- 9.2 Start Self-Driving: press feedback only (Q32) ---
const selfDrive = () => page.getByRole('button', { name: 'Start Self-Driving' });
const tapSelfDrive = async () => {
  const b = await selfDrive().boundingBox();
  await tap(b.x + b.width / 2, b.y + b.height / 2);
};
for (const [label, query] of [
  ['Parked Panel', ''],
  ['Parked Full', 'car=full'],
  ['Driving Panel', 'nav=navigating'],
  ['Driving rail', 'nav=navigating&car=collapsed'],
]) {
  await open(query);
  const before = page.url();
  await tapSelfDrive();
  check(`Self-Driving tap does nothing (${label})`, page.url() === before, `${before} → ${page.url()}`);
}
// Role queries ignore `inert` (see Learnings), so check the layer itself.
const selfDriveInert = () => selfDrive().evaluate((el) => !!el.closest('[inert]'));
await open('nav=navigating&car=full');
check('Self-Driving hidden + inert in Driving Full', await selfDriveInert(), page.url());
await open('car=collapsed');
check('Self-Driving hidden + inert in the Parked rail', await selfDriveInert(), page.url());

check('no page errors', errors.length === 0, errors.join(' | '));
await browser.close();
process.exitCode = failed ? 1 : 0;
