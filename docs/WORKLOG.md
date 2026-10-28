# Tesla Center HUD — Working Log

Running record of feedback, decisions, discussions and learnings. Newest entries at the top of each section.
**Each new session: read "Current state" + "Open questions" first; skip history unless needed.**

---

## Current state
- **Phase:** 8 — Widget customization: plan approved 2026-10-27 (docs/PLAN.md › Phase 8); 8.0 ✅ data model · 8.1 ✅ pull-up (iPad-tested after bounce fix) · 8.2 ✅ Customize mode layout + delete. Next: Anastasiya tests 8.2 on iPad, then 8.3 drag & drop. P0–7 ✅ done. Live site: https://anadrake.github.io/Tesla-Experiments/
- **Last session:** 2026-10-27 — post-P7 tweaks: location tag back to "San Francisco, CA" (Q17), 2× bigger map (2×2 JPG grid) so you can pinch out, Safari warped-map fix, blue route line, Settings search opens the keyboard, Car status Full restyle from Figma (darker canvas bg, 6% reflection, masked floor shadow), Settings from Full → Panel, swipe down from the top of Settings closes it
- **Next step:** Anastasiya pushes + tests on iPad — not yet verified with real touch: map pinch/pan, Settings swipe-to-close, keyboard typing in Settings search. Then new features (customisable dock, more Settings pages, Settings search filtering — deferred "not now")
- **Carry-over:** read Notes page (`310:79790`) in pieces (whole-page fetch fails) — still not done

## Open questions
| # | Question | Status |
|---|---|---|
| Q1 | iPad fit | ✅ Scale-to-fit 1920×1200 with bars |
| Q2 | Map | ✅ Static Figma map image + drag/pinch pan-zoom |
| Q3 | D / Esc on touch | ✅ Start in iPad's light/dark; tap clock toggles Day/Night; Esc covered by existing close taps |
| Q4 | Repo / IP | ✅ Public repo, keep art, "design concept, not affiliated with Tesla" note in README + app |
| Q5 | Parked ⇄ Driving switch | ✅ Tap PRND in the status bar |
| Q6 | Map Driving vs Navigating | ✅ Intentional duplicates — driving = navigating for now; keep as-is |
| Q7 | Car callouts order | ✅ Part name small on top, **state bold** below ("Frunk / **Open**", "Trunk / **Open**") — on every screen |
| Q9 | ✅ Fixed in Figma (Light border-subtle now #e0e0e0). Tokens: `border-subtle` is #414141 in both modes (darker than `border-default` in Light; same as `surface-panel` in Dark, so invisible on panels). `surface-selected` = `surface-sunken` in Light. Intended? | open — low priority, revisit when a component uses them |
| Q10 | Clock live vs static | ✅ Keep live — "nice addition" |
| Q11 | Widget dots | ✅ Dots appear while swiping and fade out after ~1.5s idle |
| Q12 | Favorite star | ✅ Toggles; on = `icon-strong`, off = `icon-muted` (no Figma active state) |
| Q13 | Trip ⇄ Driving | ✅ Starting a trip switches the panel to Driving; End Trip goes back to Parked |
| Q14 | ✅ Blue on-state approved. Climate tiles in Quick Actions toggle, but App Tile has no On state in Figma. Built: glyph turns blue when on (`--color-icon-active`: blue/600 light, blue/300 dark). | ✅ |
| Q15 | Search page copy | ✅ Real copy: Night Shift, Text Size, Sentry Mode (+ Ask each time), 24-Hour Clock, Show Battery Percentage, Distance Units, Auto High Beam (shares `controls.autoHighBeam` with the Controls tile) |
| Q16 | Undesigned categories | ✅ "Coming soon" body (category icon + "<Category> — coming soon" + "This section hasn't been designed yet.") |
| Q17 | Location tag: Figma says "San Francisco, CA" but the map (old and new) is Culver City / LA. Built "Culver City, CA". | ✅ 2026-10-27: use "San Francisco, CA" as in Figma (map art stays Culver City) |
| Q18 | Customization: X deletes the centred widget? Minimum 1 widget? | ✅ X deletes; the track can never be empty (last widget has no X). **Later (not now):** if Music was deleted and music starts playing, the Music widget appears on the track only while it plays |
| Q19 | Reorder on the track | ✅ Hold 0.3s → widget enters a dragged state (lifts up a bit), then drag; a plain swipe still pages |
| Q20 | Drop targets + duplicates | ✅ You only ever drop into a **gap**, never onto a widget. Getting near a gap shows the blue insertion strip previewing the drop. Duplicate dropped into a gap touching its own position = no-op + flash + float back; any other gap = move. Picker always shows every app |
| Q21 | How long the revealed Customize button stays | ✅ Until tap elsewhere / pull down; no timer |
| Q22 | Where you can customize | ✅ Panel **and** the expanded car view (Full / Car status), same gesture. Not in the Collapsed rail. Driving not covered → assume Parked only |
| Q23 | Sketch fidelity | ✅ Build with existing tokens/components, derive Dark |
| Q24 | Persist the track | ✅ Yes (localStorage) |
| Q8 | Car status top bar | ✅ Not intentional. Status bar elements keep the same size on every screen; on expand/collapse they only move and hide/reveal |

## Decisions
- 2026-10-27 — P8.2 Customize mode (`src/components/Customize/`), over the car panel in panel coords per sketch 4802:103107: picker card at 18,307 (599w, Body/L title, App Tiles, 391 divider = `border-default`, assumed); edit frame 16,670 598×322 clipped, X top 12, track cards 486.43×155.66 = the 600×192 widget at 0.8107, 20 gap, centred with neighbours peeking (own pointer pager, swipe ≥60px pages); label Body/M at 240, dots at 293 always on; Done replaces Customize at 1012. Edit cards are inert previews; placeholder widgets drawn unscaled on the card (as in the sketch). X removes the centred widget (card fades/shrinks out, 0.4s), no X on the last one (Q18). Done or a tap outside the car panel closes (tap swallowed — incl. the clock's Day/Night tap); taps elsewhere in the panel do nothing (no Full / collapse). Customize from Full → Panel; editing closes Quick Actions / Settings / keyboard. Enter: picker drops in from −24px + fade, edit frame scales from 0.96 (`transition.open`); exit mirrors (`transition.close`).
- 2026-10-27 — P8.1 fix (bounce + unreliable swipe-down): (1) after the snap the bar no longer follows the finger (the old 0.15× "hold" stretch made it jump past −64 and spring back on release); (2) a new drag stops any running spring and starts from where the bar actually is (spring and finger were both writing y); (3) iPad: a non-passive `touchmove` claims mostly-vertical touches (`preventDefault` once a touch moves 6px and isn't clearly sideways, |dx| > 1.3|dy|) so Safari can't turn a slightly diagonal pull on the `pan-x` list into a scroll and cancel the drag; diagonal pulls now count as vertical.
- 2026-10-27 — P8.1 pull-up (`WidgetBar/usePullUp.ts`, all feel constants at the top): after a 10px axis slop a vertical pull moves the bar at 0.4× the finger ("heavy"); at 80px of finger travel it lets off and snaps up to the revealed lift (64px, sketch anchor 848 → 784) with `springSnap` (new non-Figma motion token: k500 c28, a little overshoot) and holds; release earlier → springs back (`spring`). Revealed: pull down 56px → snaps closed. Horizontal stays native paging. The Customize button (sketch 4766:97815: surface-floating, 12/24 padding, radius-md, panel shadow without spread → new `--elevation-panel-tight`, Body/L, content-primary text instead of the sketch's black) rises 16px + fades in with the lift, 20px under the bar; hit area extended to 64px. Tap anywhere outside the bar → hides, and that tap is swallowed (doesn't open Full / act on the map). Works in Panel and Full (Q22); off while collapsed or driving. `?customize=revealed|editing`. Customize tap → `editing` (UI is 8.2).
- 2026-10-27 — P8.0: widget track is data (`widgetTrack` ids, `widgetPage` = index). Registry `WidgetBar/registry.tsx` = one row per picker app (Quick Actions, Music, Odometer, Tire · Calendar, Camera, Energy Usage). No designed widget → placeholder card "<App> Widget Coming Soon" (icon + Body/M) and an icon chicklet in the rails. Deep link `?widgets=a,b,c`; the track persists in localStorage `hud.widgetTrack` (URL wins, so shots stay reproducible; a URL track isn't saved until it's edited). Music pill only applies while Music is on the track. Picker glyphs from the sketch tiles → `src/assets/widgets/`; Energy pictogram is a stretched PNG fill, as in Figma.
- 2026-10-27 — Widget customization flow (Figma Sketches `4766:94038`): phased plan 8.0–8.4 drafted in PLAN.md; two reviewer runs per phase (fidelity + function) and a new Playwright gesture script.
- 2026-10-27 — Swipe down from the top of Settings (top 112px, header height) closes it (Anastasiya). The window follows the finger; >160px or a quick flick closes, otherwise it springs back. The drag only takes over after 10px down, so taps on the top nav items still work.
- 2026-10-27 — Opening Settings from the Full car view switches the car panel to Panel first (Anastasiya); closing Settings stays on Panel.
- 2026-10-27 — Car status Full (Figma update by Anastasiya): bg is `surface/canvas` in every size (Dark #171717, Light #fafafa; was `surface/panel`); reflection 6% opacity at x450; floor "shadow · full" is a 2556×678 ellipse, blur 70.7, under Figma's "Mask group" alpha radial gradient (faint under the car → solid at the edges). The mask box is larger than the ellipse (Figma mask-no-clip), so code wraps the blurred ellipse in a %-sized mask box — a mask on the ellipse itself clipped its blur into a hard arc. design-ref car-status-{light,dark} re-captured.
- 2026-10-27 — Settings search field opens the shared Keyboard over the bottom of the screen (Anastasiya). Typing goes to the field (focus ring + caret like Navigate); Enter, a page switch, the car icon or a map tap closes it. Results aren't filtered yet — the Search page still shows its Figma highlights. Deep link `?settings=search&keyboard=1`.
- 2026-10-27 — Route line is the primary blue (`--color-map-route` → `--color-action-primary-bg-default`), not Figma's yellow (Anastasiya).
- 2026-10-27 — P7 map: open data, no API key (Anastasiya). `scripts/render-map.mjs` renders OpenFreeMap (OSM) Positron tiles recoloured to the Figma Light/Dark palette, 1.75× symbol/line scale, zoom 15.9, no building footprints, at 3920px; route = OSRM driving route on Washington Blvd → `routeData.json` (route polyline, car + heading, destination in tile px). Route drawn as SVG polyline (pathLength draw), only destination pin + car arrow (Figma's generic pins didn't match real geography). "© OpenStreetMap contributors" credit on the map (ODbL). Re-run the script to re-style or move the trip.
- 2026-10-27 — Bigger map so you can pinch out (Anastasiya). The map is now 3920 design px (2× the Figma 1960 canvas, which stays its centre, so the default view is unchanged) at 1.5 image px per design px, split into a 2×2 grid of JPGs per theme (one 5880px image is too heavy for iPad Safari). Pinch-out stops where the map just fills the viewport (~0.43–0.6× depending on layout). Pins and arrow scale with the map.
- 2026-10-27 — P6b: Pedals / Display / Lights built per Figma with real copy replacing placeholder rows (Q15 applied). Shared keys keep pages in sync: `controls.headlights` + `controls.autoHighBeam` (Controls ⇄ Lights ⇄ Search), `controls.brightness` + `controls.brightnessAuto` (Controls ⇄ Display), `display.nightShift` (Search ⇄ Display). Display › Appearance (Light / Dark / Auto) drives the real app mode via the Day/Night dissolve. Latching buttons (Front Fog, Ambient Lights, Screen Clean Mode, Auto) = Primary when on, Secondary when off.
- 2026-10-27 — P6a: Settings window (car icon) = navtree + Settings Panel at (630, 64), slides up (slow + standard); one overlay at a time with keyboard / Quick Actions; closes on car icon, map/panel tap. All controls store values in `settings[key]` via `useSetting` (deep link `?settings=<page>`). Select has no menu design → a tap steps to the next option. Brightness "Auto" toggles primary ⇄ secondary. Tokens synced to current Figma vars (Light icon-default #757575, border-subtle #e0e0e0; new content-accent, control-track-off, control-knob, action-secondary, size-control-sm/md, Label/Overline).
- 2026-10-27 — P5: dock = pinned (Phone, Music, Bluetooth, Spotify, Camera) · All apps · divider · recents (Zoom, Calendar) — static lists for now. All apps toggles Quick Actions (Move in from bottom, base + enter; exit base + exit). Closes on: All apps again, map tap, panel → Car status, opening the keyboard (one overlay at a time; opening QA also closes the keyboard). Climate tiles toggle (state kept); app tiles press only. Deep link `?overlay=apps`.
- 2026-10-26 — P4: driving ≡ navigating (`isDriving` selector). PRND tap toggles P ⇄ D = start trip (default destination) / end trip, from any panel size. Driving panel: road scene (Car Render Scene=Driving), speed 80px + speed-limit sign + compact Direction Primary (0.644), telltales without seatbelt. Collapsed while driving = 220 rail with enlarged speed/sign and the 200px Chicklet (Figma Map Driving · Expanded). Car status while driving shows **Trip Card / Active** (Figma shows Search there — consistent with driving = navigating). Parked ⇄ Driving cross-fades the scene (0.4s). Hidden Car status trip card is `inert`.
- 2026-10-26 — P3: nav state idle → typing → navigating (deep link `?nav=`). Keyboard uses the Keyboard component's own spec (duration/slow + easing/enter) over the read-me's 0.25s. Tap map closes the keyboard; expanding the panel closes it too ("overlay slides away"); typing over an active trip resumes it on close. Enter: destination = typed text, else "Tesla Headquarters". Car status Navigate → map + keyboard; Home / Work → start trip. Route draws outward from the car (0.6s enter); turn list + trip card morph in from 0% / +40px (0.4s standard). Nav arrow rotated −27° along the route (as in the reference).
- 2026-10-26 — Active widget lives in the store (`widgetPage`, deep link `?widget=`). Collapsed rail (116) shows the **Mini Chicklet** of that widget (Music 92², Odometer 96×92, Tire 98²); the 200px Chicklet doesn't fit the rail — reserved for a wider collapsed size if one is designed later. Expanding restores the list on the same widget.
- 2026-10-26 — Collapsed panel built now (was P4): width 116 (from the Map Parked · Expanded screen; the component notes say 220/102 — the screen wins). Handle = transparent 64×320 hit area over the grab pill; only a left drag that STARTS on it collapses. Collapsed tap / drag right → Panel. Music becomes the 92×92 Mini Chicklet. Map left edge animates 630 → 116 with tiles re-centred (same as Figma's re-centred map instance). Panel uses pointer capture so drags can end outside it.
- 2026-10-26 — P2: Panel ⇄ Full morph = per-layer rects from Figma (Panel: Map Parked; Full: Car status) animated with left/top/width/height/opacity, 0.4s standard. Same images in both modes (Car Render has no Light/Dark variants). Full bg = `surface-panel` with the `sunken` floor ellipse. Callout text 14/16 in both sizes. Collapsed 220px panel + handle drag moved to P4 (with Expanded screens).
- 2026-10-26 — P1: Day/Night dissolve = 0.6s CSS color transitions on every element while `html.mode-switching` is set; map tiles cross-fade by opacity. (View Transitions was tried first and dropped: it routes all taps to the page root mid-transition, so rapid clock taps were lost.) Top-bar gradient snaps rather than fades (gradients can't transition) — minor. Clock is live (Q10). Light `--color-surface-glass` set to neutral-50 · 80% (see bugs).
- 2026-10-26 — **Push to `main` after every phase** (standing approval from Anastasiya), starting with Phase 0.
- 2026-10-26 — **Plan approved.** Q7: callouts show part small / state bold everywhere (Figma Map-panel "Open / Frunk" is the inconsistent one). Phase 0 started.
- 2026-10-26 — Q5: PRND tap toggles Parked ⇄ Driving. Q6: Map Driving and Navigating stay duplicates. Q8: one status bar component, fixed element sizes; expand/collapse animates position + visibility only (Figma's enlarged Car status bar is drift, don't copy).
- 2026-10-26 — Q1–Q4 answered (see table): scale-to-fit, static map w/ pan-zoom, tap-clock Day/Night + follow iPad setting, public repo w/ concept note.
- 2026-10-26 — Plan doc + working log live in `docs/`; build happens only after plan is agreed.
- 2026-10-26 — Bezel art excluded; render the 1920×1200 display only (per brief).

## Feedback from Anastasiya
- 2026-10-27 — 8.1 on iPad: dragging up / back down sometimes makes the bar bounce up and down weirdly; swiping down on the widget doesn't always close. Fixed (see Decisions); real-touch fix needs re-testing on iPad.
- 2026-10-27 — Q18–Q20 answered (customization: delete/min 1, hold-to-lift reorder, gap-only drops). Future note: Music widget reappears while music plays even if deleted.
- 2026-10-27 — Q15: make the Search page copy real. Q16: add a coming-soon state for undesigned settings categories.
- 2026-10-27 — Updated Control Bar in Figma: Quick Actions open from the **All apps** icon; apps right of the divider = recently used; apps left of All apps = customizable (functionality later).
- 2026-10-27 — Dark mode, Driving: expanding to Car status shouldn't lighten the background; keep the panel's dark. Done via app token `--color-bg-car-status-driving` (Light = surface-panel unchanged, Dark = surface-canvas). Parked Car status unchanged. Side effect: the compact turn card is now visible in Dark.
- 2026-10-26 — While driving, the map search field should read "Search Along Route" instead of "Navigate". Done (placeholder + accessible label).
- 2026-10-26 — Q13: starting a trip switches to Driving, End Trip back to Parked.
- 2026-10-26 — Widget bar should remember which widget was scrolled to and show that widget's chicklet form when the car panel is collapsed (Figma has Chicklet + Mini Chicklet for Music / Odometer / Tire Pressure).
- 2026-10-26 — Dragging left from the car panel handle should minimize the panel into its collapsed state (pulled forward from P4).
- 2026-10-26 — Q11: widget dots only while scrolling, fade after idle. Q12: favorite should toggle.
- 2026-10-26 — P1 review: looks good. Keep the live clock. **Map image feels small** → generate a bigger, nicer map with Snazzy Maps (snazzymaps.com) styling — scheduled for Phase 7, not now.
- 2026-10-26 — Initial brief: working iPad prototype from GitHub, match Figma visuals/UX/layout/interactions/motion, easy to extend via vibe coding, phased plan first, keep this log, reviewer agent checks every step, ask about design intent, Figma prototype may have bugs — don't assume inconsistencies are correct.

## Figma bugs / inconsistencies found
- Customize sketches: in "Tap customize" (4802:103107) the first card sits ~35px left of centre in the edit frame, while "dropped" (4802:104649) is centred. Built centred (normal pager). Picker title has a double space ("Panel  to") — built single.
- Map Driving screen visually identical to Navigating → not a bug, intentional duplicate (Q6)
- Car status callout label/value order flips between Frunk and Trunk. → Q7
- Car status status bar has enlarged time/temp/profile → **bug**; use Map-screen sizes (Q8)
- ~~Car status driving (Dark): compact turn card invisible (same grey as bg)~~ — resolved by the darker Driving Car status bg (2026-10-27).
- `--color-state-pressed-overlay` (App Tile Pressed) has no readable Dark value; 8% black is invisible on the dark glass → assumed 8% white in Dark.
- design-ref PNGs predate the 2026-10-27 Control Bar update (old dock with Theater/TuneIn) — compare the dock against Figma `4273:375`, not the refs.
- Dock divider is #858585 (no token) → built with `--color-border-default`.
- Car status driving shows Trip Card / Search while the panel is Driving — built Active instead (driving = navigating).
- `--color-surface-inverse` has no Dark value in the variables we can read → assumed #f0f0f0 (only used by the music Chicklet progress strip).
- Collapsed Driving rail scales speed ×1.83 and the limit sign ×1.98 (different factors) — matched as-is.
- Keyboard timing: component says duration/slow (0.4s) + easing/enter; Screens read-me says opening controls = 0.25s. Built 0.4s per component.
- Keyboard screen field shows "Tesla Supercharger" but the Navigating trip card shows "Tesla Headquarters". Built: card shows whatever was typed.
- `--color-surface-glass` resolves to `#000000f2` in BOTH modes via get_variable_defs, but the Light map ref shows a near-white location tag and the component's own fallback is neutral-50 · 80%. Built Light = `#f6f6f6cc`. Likely a missing Light value on the variable.

## Learnings
- iOS Safari decides native scrolling on the first touchmove; a `touch-action: pan-x` list will cancel a slightly diagonal pointer drag (`pointercancel`). Claim the gesture with a non-passive `touchmove` + `preventDefault`. Chrome/CDP touch doesn't reproduce this — verify on the iPad.
- Before driving a motion value from the finger, `stop()` it: a running spring keeps writing and fights `set()`.
- Window capture-phase `pointerdown` + `stopPropagation` runs before React's root listener, so a "dismiss-only" tap never reaches the app; also swallow the click that follows (once, short window).
- In a drag that locks after a slop, don't `return` on the locking move — coalesced fast flicks may never send another move.
- CSS `mask-image` clips to the element's own border box, so masking a blurred element cuts its blur off in a hard edge. Put the mask on a larger wrapper (like Figma's mask group) and the blurred shape inside it.
- Swipe-to-close on a Motion element: drive `y` with a `useMotionValue` (start it at the enter offset so the open animation still runs), capture the pointer only after a small threshold so child taps keep working, and spring back with `animate(y, 0, …)`.
- Don't lay out big images in a CSS grid with `1fr` tracks: `1fr` has an `auto` minimum, and Safari sized the tracks from the images' natural 2940px, so the live map looked warped on iPad (Chrome was fine). Give each map image explicit px boxes.
- Render-map framing: the route must end inside the 1960 tile or the pin is unreachable (pan is clamped to the tile). If you move `DESTINATION`, adjust `CAR_FRACTION` so the car stays at `CAR_TILE_PX` on the same road.
- Figma Screens "Read me" documents the whole prototype wiring and motion tokens — treat as the UX spec.
- Display = 1920×1080 stage (Left 630 / Main / Overlay slots) + 120px control bar = 1920×1200.
- Tokens are clean Figma variables (`--color-*`, `--space-*`, `--radius-*`, `--font-size-*`, `--size-*`) with Light/Dark modes; Inter font.
- Screens page metadata is ~170k chars — never fetch whole pages; target node IDs. Foundations page (`342:18279`) is small and has the full Motion spec.
- Motion spec (Foundations): instant 100 / fast 150 / base 250 / slow 400 / deliberate 600ms; standard `cubic-bezier(.2,0,0,1)`, enter `(0,0,.2,1)`, exit `(.4,0,1,1)`, spring m1 k300 c30.
- Figma letterSpacing values are percent (1 → 0.01em). Map labels use Source Sans 3; everything else Inter.
- Primitive yellow/500 `#FFBD0A` (Figma's route line; we use primary blue now) and teal/500 have no semantic token yet.
- Stage: centering a 1920px box with CSS grid fails when it's wider than the viewport (track grows) — use absolute + translate(-50%,-50%) scale().
- Repo renamed to `Tesla-Experiments` (local folder + remote URL keep old spelling; GitHub redirects). Pages must be enabled (Settings › Pages › Source: GitHub Actions) or deploy-pages fails.
- Git CLI on this Mac has no GitHub login (no gh, no SSH key); Anastasiya pushes via GitHub Desktop. Phase 0 pushed 2026-10-26 (`84cc715`).
- Status bar items are split in Figma: PRND + battery live in the Car panel; lock/time/temp/profile/airbag in the Map Top Bar.
- Map holds turn list + trip card at 0% opacity (offset 40px) so State=Driving morphs them in — mirror this in P3.
- Control Bar is pinned to Dark in Figma → `data-mode="dark"` on its root.
- Glyph SVGs come with mode-resolved colors → render via `Icon` (CSS mask) + token color. Map/top-bar icons = `--color-icon-strong`.
- Component SVG exports carry page background + doc card → see COMPONENTS.md "Asset notes".
- Motion layout/layoutId animations measure in screen px → wrong inside the scaled Stage. Use explicit `animate` targets in design px; measure with offsetWidth (unscaled).
- Figma inconsistency: Car Status Panel description says Collapsed = 220 (size/panel/collapsed) or 102, but the Expanded screen uses 116. Built 116.
- Car Status Panel keeps Panel + Full layers in one component (hidden layers at 0%) — the metadata of the Car status instance gives Full rects directly.
- Widget bar: Music collapses to a 382×64 pill (Spotify · title · ↑); music Mini/Chicklet sizes exist for Collapsed panel (P4).
- `docs/ICONS.md` = full icon node index (Icons page is big; don't re-read).
- Vite inlines small SVGs as data URLs — select images by class, not by `src`, in tests.
- A broad `.tiles img { width: 100% }` rule stretched the route image (wrong angle) — scope image rules to their class.
- Nav maneuver icons are two-tone → `ThemedSvg` (raw SVG with hex → token swap); masks only work for one color.
- Pointer capture on the panel steals `click` from child buttons — controls must opt out of the panel gesture *before* capture.
- Playwright role queries ignore `inert`; scope locators (e.g. to the Map region) in tests.
- Scrolling flex columns squash children (flex-shrink 1) instead of scrolling — set `flex-shrink: 0` on scroll-body children.
- In a page, an element with `id="map"` is also `window.map` (named access) — don't use that name for globals.
- `npm run shots` uses installed Google Chrome via playwright-core (no browser download).
- Key node IDs: Map Parked L/D `4300:1022`/`4300:1216`; Car status L/D `4300:18`/`4300:714`; Navigating L/D `4300:2833`/`4300:3474`; Quick actions L/D `4300:2105`/`4300:2520`; Settings Controls L/D `4300:21356`/`4300:21841`.

## Phase history
- **Phase 8.2 (2026-10-27):** Customize mode: picker, edit frame with peeking track, X delete, Done / outside-tap close, Full → Panel. `npm run gestures` 38 checks. Reviews: fidelity PASS WITH ISSUES → fixed placeholder paragraph margin (sat 17px high); function PASS WITH ISSUES → fixed `?customize=editing` deep link bypassing the editing rules (stayed in Full / left Quick Actions open). Picker tiles inert until 8.3.
- **Phase 8.1 (2026-10-27):** pull-up gesture with bow physics, Customize button, tap-outside dismiss, `scripts/gestures.mjs` (real pointer events; 16 checks). Reviews: fidelity PASS WITH ISSUES (named the click-swallow timer) · function PASS WITH ISSUES → fixed: a fast flick arriving as 1–2 pointer moves didn't reveal (the locking move now counts). Open for 8.2: a tap outside while editing currently resets to off — decide with the editing panel. Not verified: real-finger feel on iPad (0.4× weight, 80px let-off, overshoot).
- **Phase 8.0 (2026-10-27):** widget registry + track data model, placeholder widget/chicklets, `?widgets=` + persistence, sketch refs `design-ref/customize-*`. Reviews: fidelity PASS; function PASS WITH ISSUES (low) → fixed music pill without Music, URL normalised on load. Not verified: real finger swipe (tool limit).
- **Post-P7 tweaks (2026-10-27):** see Decisions dated 2026-10-27 (map size/Safari fix, route colour, Settings search keyboard, Car status Full restyle, Settings from Full, swipe-to-close). Verified with screenshots + synthetic pointer tests in the browser; no reviewer run (small, targeted changes).
- **Phase 7 (2026-10-27):** @fontsource fonts, PWA icons/manifest, reduced-motion, OSM map tiles + OSRM route, README guide. QA sweep (reviewer, iPad + 1920, all states): PASS WITH ISSUES → fixed: destination off the tile (trip shortened to 34.0291,-118.3809, car fraction 0.56); OSM credit illegible → glass chip stacked above the location tag. Left as-is: label fragments at map edges (tile content). Not verified by tools: real-touch pinch/pan, keyboard typing walk.
### Phase 6b — Pedals & Steering, Display, Lights (2026-10-27)
- Built: three pages with real copy, shared keyed settings across pages, Appearance driving the real app mode, ToggleButton + full-width segmented.
- Review: PASS WITH ISSUES (low). Brightness/Auto sync verified manually. Slider default 50% vs Display ref 25% (Figma inconsistency, logged).
### Phase 6a — Settings window, Controls, Search (2026-10-27)
- Built: Settings window (car icon), navtree (14 categories), Settings Panel header + scrolling body, Controls + Search pages, settings control library (tiles, switch, checkbox, segmented, select, slider, button, field group, setting row…) with keyed persistence.
- Review: PASS WITH ISSUES. Fixed: scroll body squashed the Search field (44 → 64px). Remaining ≈15px vertical offset on Search vs ref (within ref measuring error). Reviewer's aria-current note was wrong (present).
### Phase 5 — Quick Actions + updated dock (2026-10-27)
- Built: new dock (pinned · All apps · divider · recents), Quick Actions overlay (climate toggles, app grid), App Tile, one-overlay-at-a-time rules, map/panel close.
- Review: PASS WITH ISSUES (low). Fixed: toggled glyph contrast on dark (new `--color-icon-active`). Reviewer's dialog-role note was wrong (role + label present); console items were stale HMR.
### Phase 4 — Driving (2026-10-26)
- Built: Driving panel (road scene, speed, limit sign, compact turn card, 3 telltales, PRND D), Car status Driving (scaled scene, active trip card), 220 Driving rail (enlarged speed/sign, large Chicklets), PRND toggle everywhere, trip start/end ⇄ Driving.
- Fixed during build: PRND in the rail lost its tap to the panel's pointer capture; hidden Car status trip card now `inert`.
- Review: PASS WITH ISSUES (low, mostly stale HMR console noise). Not verified: real swipe on widgets (tool limit), iPad feel.
### Phase 3 — Navigation flow (2026-10-26)
- Built: Keyboard overlay + Key, Navigate field Default/Focused, Enter → Navigating (route draw, pins, nav arrow, turn list, active trip card), End Trip, Car status Navigate/Home/Work, tap map to close, typing over a trip resumes it.
- Review: PASS WITH ISSUES (low). Pointer-capture error was a stale hot-reload module (guard already in place). Hex values in ThemedSvg/TripCardActive are source→token maps (intended). Keyboard shots show an empty focused field (no preset text) — intended.
- Not verified on iPad: pinch with route, key press feel.
### Phase 2 follow-up — Collapsed panel + Map Parked · Expanded (2026-10-26)
- Built: 116px rail (PRND, gauge under PRND, telltales, grab pill, Mini Chicklet), handle drag-left to collapse, tap/drag-right back, map widens with re-centred tiles, status items follow the map edge.
- Review: PASS WITH ISSUES. Fixed: pointer capture guarded (lib/pointer.ts). Watch on iPad: one unreproduced missed handle-drag ~0.7s after expanding. Known: Google "Map data ©" strip is baked into the Figma tile image at its far edge → goes away with the P7 map.
### Phase 2 — Car panel, widget bar, Car status (2026-10-26)
- Built: Car Status Panel (PRND, battery, telltales, car render, callouts, grab pill), Dynamic Widget Bar (Music with play/pause + collapse pill, Odometer, Tire Pressure, swipe), Trip Card / Search, Car status Full view with tap/drag morph, StatusCluster (Q8). Icon index → docs/ICONS.md.
- Review: PASS WITH ISSUES (all low). Fixed: panel floor shadow 40px lower. Kept: reflection 15% (= Figma). Open: Q11 dots, Q12 favorite.
- Not verified on iPad: touch swipe on widgets, drag feel.
### Phase 1 — Display Shell, Map, Control Bar, Day/Night (2026-10-26)
- Built: DisplayShell slots, Control Bar (pinned dark, steppers 60–84, dock, volume), Map (themed 2× tiles, drag + pinch, top bar, Navigate field, map controls, location tag, airbag badge), tap-clock Day/Night, Icon/Pressable/Stepper components.
- Review: PASS WITH ISSUES. Fixed: rapid clock taps lost (switched dissolve off View Transitions), clock had no press feedback, pinch now zooms about the fingers, letterbox color tokenized.
- Not verified on a real iPad yet: pinch feel, dissolve smoothness.
### Phase 0 — Foundation & tooling (2026-10-26)
- Built: Vite/React/TS scaffold, Light/Dark + motion tokens, text styles, scaled letterboxed Stage, iPad hardening + PWA manifest/icons, URL deep links (`?mode=`), Pages deploy workflow, `npm run shots`, 30 design-ref PNGs, CLAUDE.md, COMPONENTS.md, hud-reviewer agent.
- Review: PASS WITH ISSUES (all low). Fixed: Stage now refits on rotation/visualViewport; tsbuildinfo ignored. Deferred to Phase 7: self-host fonts for offline home-screen use; maskable icon.
- Reviewer noted for Phase 1: control bar is black in both modes; dark left panel is a ~#242424 gradient, not canvas.
- Note: new agent files are picked up next session; this session ran the reviewer as a general-purpose Sonnet agent following `.claude/agents/hud-reviewer.md`.
