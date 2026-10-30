# Tesla Center HUD — Phased Build Plan

**Status:** ✅ Approved 2026-10-26. Phases 0–7 done. (Asset export moved from P0 into the phase that first uses each asset.)
**Source of truth:** [Figma — Tesla Dashboard UI Component Library](https://www.figma.com/design/L4iGjQC6AbgfNfqCAxQnh9/) (file key `L4iGjQC6AbgfNfqCAxQnh9`)
**Working log:** [WORKLOG.md](WORKLOG.md) — feedback, decisions, learnings, Figma bugs.

---

## 1. Goal

A tap-driven, web-based prototype of the Tesla center display that:

- runs on iPad Pro (Safari, added to Home Screen for full-screen), published from GitHub (GitHub Pages)
- matches the Figma visuals, layout, UX flows, interactions and motion (no bezel art)
- is structured so future vibe-coding sessions can add screens/components cheaply

## 2. What the Figma file contains (surveyed)

| Figma page | What it gives us |
|---|---|
| Foundations | Tokens as variables: color (Light/Dark modes), type scale (Inter), spacing, radius, icon/touch sizes, elevation, motion |
| Icons / Controls | Buttons, switches, checkboxes, tiles, selects, segmented controls, keys |
| Shell & System | Display Shell: status bar, **Left** slot (630px panel), **Main** slot, **Overlay** slot, control bar (120px) with climate + dock + volume |
| Vehicle Visualization | Car Status Panel (Parked/Driving × Panel/Full), car renders, frunk/trunk/lock callouts |
| Dynamic Widget Bar | Music bar (play/pause, collapse/expand), navigate card |
| Map & Navigation | Map, map controls, search field, turn list, trip card, route |
| Settings | Settings window, nav tree, settings panes |
| Screens | 15 screens × Light/Dark (see §3), plus a "Read me" with prototype wiring + motion rules |

Display canvas is **1920×1200** (1080 stage + 120 control bar).

### Motion tokens (from Figma read-me)
| Use | Duration | Easing |
|---|---|---|
| Press | 0.1s | — |
| Toggles, tab switches | 0.15s | standard |
| Opening controls (keyboard, quick actions, cards) | 0.25s | enter |
| Screen changes / panel morph | 0.4s | standard |
| Day/Night dissolve | 0.6s | — |

Named animation styles: Fade in, Fade out, Slide up in, Slide in from left, Pop in, Route draw.

## 3. Screen & flow inventory (target functionality)

Screens: Map Parked · Map Driving · Car status · Car status Driving · Map Parked Expanded · Map Driving Expanded · Navigating · Navigating Expanded · Keyboard · Quick actions · Settings (Search, Controls, Pedals & Steering, Display, Lights).

Flows (from the Figma prototype read-me):
1. Navigate field → keyboard slides up → Enter → Navigating (turn list + trip card animate in, route draws) → End Trip → Map
2. Dock app icons → Quick Actions slides up; tap dock or map to close
3. Car icon (bottom-left) → Settings/Controls; nav tree switches panes; car icon or map closes
4. Temperature chevrons 60–84°F, driver + passenger, persist across screens
5. Day/Night toggle (Figma: `D` key) with 0.6s dissolve; `Esc` → Map
6. Drag or tap the left car panel → morphs to full view (Car status from Parked, full road view from Driving); drag/tap again to collapse. If an overlay is open, it slides away as the panel expands
7. Component-level: buttons/keys/nav items press; switches/checkboxes/tiles toggle; selects open; search focuses; music play/pause; tap album art collapses/expands music bar

## 4. Technical approach (proposed)

| Concern | Proposal | Why |
|---|---|---|
| Stack | **Vite + React + TypeScript** | Component model maps 1:1 to Figma components; best for incremental vibe coding |
| Styling | CSS Modules + **CSS custom properties generated from Figma variables** (light + dark) | Day/Night = swap one attribute; tokens match Figma names |
| Motion | **Motion (framer-motion)** — `layoutId` for the car-panel morph (≈ Smart Animate), presets for the Figma animation styles | Smart-Animate-like morphs are hard by hand |
| State | One small store (Zustand): `mode`, `driveState`, `screen`, `overlay`, `settingsPane`, `temps`, `music`, `trip` | Every flow is a state change → easy to reason about and extend |
| Deep links | URL params mirror state (`?screen=nav&mode=dark&overlay=keyboard`) | Lets the reviewer agent and you jump straight to any state |
| Fit to iPad | Render at native 1920×1200 and **scale-to-fit** the viewport (see Q1) | Pixel-faithful to Figma at every screen size |
| iPad hardening | PWA manifest (standalone), disable pinch/double-tap zoom, text selection, long-press callouts, rubber-band scroll; landscape-only notice | Feels like an app, not a webpage |
| Assets | Export car renders, map, album art, app icons from Figma once → `public/assets/` as optimized WebP/SVG | No repeated Figma calls |
| Deploy | GitHub Actions → GitHub Pages on push to `main` | Open the URL on iPad |
| Dev on iPad | `npm run dev -- --host` → open LAN URL on iPad | Live testing while building |

### Proposed folder layout
```
src/
  tokens/        tokens.css (light/dark), motion.ts
  components/    one folder per Figma component (Button, Tile, Switch, MusicBar, …)
  shell/         DisplayShell, StatusBar, ControlBar, slots
  screens/       Map, CarStatus, Navigating, Settings/*
  overlays/      Keyboard, QuickActions, SettingsWindow, TurnList, TripCard
  state/         store.ts (+ url sync)
docs/            PLAN.md, WORKLOG.md, COMPONENTS.md (Figma ↔ code map)
design-ref/      cached Figma screenshots per screen/mode (reviewer compares against these)
scripts/         shots.ts (Playwright: screenshots every state for review)
.claude/agents/  hud-reviewer.md
CLAUDE.md        conventions + how to add a screen (short, read every session)
```

## 5. Phases

Each phase ends with the **checkpoint loop**: build → `hud-reviewer` agent checks visuals + functionality → I fix → you test on iPad → log in WORKLOG → commit → next phase.
Rough size: S ≈ one short session, M ≈ one full session.

### Phase 0 — Foundation & tooling (M)
- Scaffold Vite/React/TS, Inter font, lint/format
- Pull Figma variables (Light **and** Dark) → `tokens.css`; motion tokens → `motion.ts`
- Scaled 1920×1200 stage, iPad hardening, PWA manifest
- GitHub Pages deploy action
- Capture `design-ref/` screenshots for all 15 screens × 2 modes (≤1280px, once)
- Export shared assets (car renders, map, icons, album art)
- `CLAUDE.md`, `docs/COMPONENTS.md`, `hud-reviewer` agent, `scripts/shots.ts`
- ✅ Done when: an empty dark/light stage with correct background deploys and opens full-screen on your iPad

### Phase 1 — Display Shell + Day/Night (M)
- Status bar (PRND, battery, lock, time, temp, profile, airbag badge)
- Control bar: car icon, climate (60–84°F chevrons, shared state), dock icons, volume
- Left / Main / Overlay slots; static map in Main with map controls (compass, globe, traffic, pin, charging)
- Day/Night switch with 0.6s dissolve (tap clock; default = iPad light/dark setting)
- Status bar is **one component with fixed element sizes** on every screen; screens only reposition / show / hide its items (Q8)
- ✅ Done when: Map Parked (Light + Dark) matches design-ref, temps work

### Phase 2 — Car panel + Music bar + Car status morph (M)
- Car Status Panel (Parked): car render, frunk/trunk/lock callouts, charge-port icon, drag handle
- Music bar: play/pause, prev/next press, album-art collapse/expand
- Tap or drag car panel → morph to Car status full view (0.4s) and back; Navigate card on Car status
- During the morph, status-bar items slide to their new positions and fade in/out — they never resize (Q8)
- ✅ Done when: Map Parked ⇄ Car status works by tap and drag, smooth on iPad

### Phase 3 — Navigation flow (M)
- Navigate field → Keyboard (slide up 0.25s), key presses
- Enter → Navigating: turn list + trip card animate in, route draw, red nav arrow
- End Trip → Map; `⋯` menu (TBD)
- ✅ Done when: full flow 1 works end-to-end in both modes

### Phase 4 — Driving mode (S–M)
- Map Driving, driving left panel (speed, speed limit, next-turn card, lane/road viz)
- Car status Driving (full road view) via tap/drag; Navigating Expanded, Map Driving Expanded, **Map Parked Expanded**
- ~~Collapsed panel~~ ✅ built in P2 follow-up (Parked). P4 adds the Driving variant of Collapsed + Map Driving / Navigating Expanded.
- Tap PRND in the status bar toggles Parked ⇄ Driving (Q5)
- Map Driving and Navigating are intentional duplicates for now — build once, reuse (Q6)
- ✅ Done when: all driving screens reachable and matching design-ref

### Phase 5 — Quick Actions (S)
- Dock → Quick Actions slide up; quick-control tiles (defrost, seat, steering heat, wipers) toggle; app grid presses
- Close on dock or map tap; overlay slides away if car panel expands
- ✅ Done when: flow 2 works

### Phase 6 — Settings (M–L, may split 6a/6b)
- Settings window + nav tree (all items press; 5 panes built)
- 6a: Controls + Search · 6b: Pedals & Steering, Display, Lights
- Control components: segmented, tile toggle, switch, checkbox, select, slider (brightness)
- ✅ Done when: flow 3 works, every control in the 5 panes is interactive

### Phase 7 — Polish & handoff (S–M)
- **New map imagery** (Anastasiya, P1 feedback): bigger, nicer map styled with [Snazzy Maps](https://snazzymaps.com/) — Light + Dark styles matching the Figma tiles' palette, rendered large enough for pinch zoom (≥ 2× the 1960px canvas, maybe tiled). Open: how to render it (Google Static Maps API needs a key + has size limits; alternative = a MapLibre style with the Snazzy palette, captured to images) — decide at the start of P7. Route line / pins in P3 must be re-aligned to the new image.
- Self-host fonts for offline home-screen use; maskable icon (from P0 review)
- Motion fidelity pass against Figma timelines; 60fps check on iPad
- On-device QA sweep, fix list from WORKLOG
- README: how to run, deploy, and add a new screen (vibe-coding guide)
- ✅ Done when: you sign off

## 6. The reviewer agent (`.claude/agents/hud-reviewer.md`)

- **Runs after every phase** (and on request). Read-only — reports, never edits.
- **Visual check:** runs `scripts/shots.ts` to capture each state touched in the phase (Light + Dark), compares against `design-ref/` side by side: layout/spacing, color tokens, type, icon size, missing/extra elements.
- **Functional check:** walks the phase's flow checklist in the built-in browser using tap/click: every tappable element responds, state transitions correct, deep links work, no console errors.
- **Motion check:** verifies durations/easings used come from `motion.ts`, not hard-coded values.
- **Output:** pass/fail table + ranked issues, and flags anything where *Figma itself looks inconsistent* (so we ask you rather than copy a bug).
- Model: Sonnet (cheaper than me, good at visual diffing).

## 7. Token-efficiency rules

1. **One phase per session.** Start each session by reading `CLAUDE.md` + the WORKLOG "Current state" section only — not the whole history.
2. **Cache Figma once.** design-ref screenshots + exported assets + tokens are committed in Phase 0; later phases only call `get_design_context` on the specific component nodes they build.
3. **Small screenshots.** ≤1024px for comparison; zoom into regions only when a detail is disputed.
4. **Build components once, reuse.** `COMPONENTS.md` maps Figma node IDs → code files so nobody re-reads Figma for something already built.
5. **Reviewer is scoped** to the phase's screens/flows, not the whole app.
6. **WORKLOG stays lean:** decisions + feedback in bullet form; old phases get collapsed to a summary.

## 8. Things you may have missed (please confirm)

1. **Aspect ratio** — ✅ scale-to-fit with bars (Q1)
2. **Keyboard-only triggers** — ✅ tap clock for Day/Night; Esc covered by close taps (Q3)
3. **Map** — ✅ static Figma image with drag + pinch pan/zoom (Q2)
4. **Parked ⇄ Driving switching** — ✅ tap PRND (Q5)
5. **Dark-mode tokens** — must be pulled explicitly from the Dark frames; I'll verify every Light token has a Dark counterpart.
6. **Public repo & IP** — ✅ public repo, keep art, "design concept, not affiliated with Tesla" note in README + app (Q4)
7. **Safari chrome** — full-screen feel only works via "Add to Home Screen"; I'll add the manifest + icon.
8. **Unbuilt states** — nav-tree items other than the 5 designed panes (Charging, Autopilot, Locks, …), the `⋯` trip menu, app tiles, map control buttons: proposal = press feedback only, no destination, until designed.
9. **Persistence** — should temps/mode/music survive a reload? Proposal: yes, via localStorage (cheap).
10. **Haptics/sound** — iPad Safari has no haptics API; press feedback will be visual only.

### Possible Figma bugs spotted so far (not copying blindly)
- ~~Map Driving ≈ Navigating~~ — intentional duplicates (Q6)
- **Callout label order** inconsistent: Car status shows "Open / Frunk" and "Trunk / Open" (label/value flipped between the two). → Q7 open
- ~~Car status top bar~~ — confirmed drift; use Map-screen sizes (Q8)
- Notes page couldn't be read in one pass (too large) — will read in chunks in Phase 0.

## 9. Open questions → see WORKLOG "Open questions"

---

# Phase 8 — Widget customization (✅ approved 2026-10-27)

**Source:** Figma Sketches `4766:94038` (6 light-mode wireframes, 2026-10-27):
Default `4802:103110` → Swipe up exposes Customize `4802:103109` → Tap customize `4802:103107` → Drag widget (insertion bar) `4802:103108` → Drag widget (slot opens) `4802:103453` → Dropped, placeholder widget `4802:104649`.
Sketches are wireframes: build with existing tokens/components (Dark derived from Light tokens), ask where intent is unclear.

## The flow
1. **Pull up** on the widget bar (Panel size **and** Full car view, Q22; Parked only). Heavy at first, then it "lets off" and snaps up into place (compound bow). The bar lifts and a **Customize** button appears under it. Release early → springs back.
2. **Customize** → edit mode: picker card ("Drag Icons to Panel to Customize": Quick Actions, Music, Odometer, Tire Pressure · divider · Calendar, Camera, Energy Usage); track shrinks (486px cards, neighbours peek), close **X** above the centred widget, its name below, dots always visible, **Done** under the panel.
3. **Drag** an icon from the picker onto the track: blue insertion bar between widgets, then the gap opens into a blue drop slot; drop → widget inserted (placeholder "<App> Widget Coming Soon" for apps without a widget). Drop outside → icon floats back.
4. **Drop targets are gaps only** (never onto a widget). Nearing a gap shows the blue insertion strip; it then opens into the slot. **Already on the track:** a gap touching its own position → nothing changes, its widget flashes a few times while the icon floats back; any other gap → moves it there (Q20).
5. **Delete** with X (no X on the last widget — the track is never empty, Q18). **Reorder:** hold a track widget 0.3s → it lifts (dragged state), then drag to a gap (Q19).
   *Later, not in Phase 8:* a deleted Music widget reappears while music is playing. **Done** or tap outside the panel → exit.

## Architecture
- `store.ts`: `widgetTrack: WidgetId[]` (default `music, odometer, tire`), `widgetPage` becomes an index into it; `customize: 'off' | 'revealed' | 'editing'`; actions `insertWidget / moveWidget / removeWidget`.
- `components/WidgetBar/registry.ts`: one entry per app — `{ id, label, icon, Widget, Chicklet? }`. Missing `Widget` → `PlaceholderWidget`. Adding a real widget later = one registry line.
- `components/WidgetBar/` gets `usePullUp` (gesture + bow physics), `WidgetPicker`, `CustomizeTrack`, `useDragDrop` (pointer-driven, works in the scaled Stage — design px, not screen px).
- `motion.ts`: new `spring.snap` (stiffer, light overshoot) for the let-off snap and float-back; `flash` keyframes for the duplicate warning. Logged as new motion tokens (Figma has one spring).
- `url.ts`: `?customize=revealed|editing&widgets=music,energy,…`; `states.json` entries per state.
- `scripts/gestures.mjs` (new): Playwright script that drives pull-up, drag-insert, duplicate drop, reorder and delete with real pointer events and asserts the store — the reviewer runs it every phase.

## Phases (each ends: reviewer agents → fix → you test on iPad → WORKLOG → commit + push)

### 8.0 — References & data model (S)
- Save the 6 sketches to `design-ref/customize-*.png`; pull exact specs (sizes, spacing, icon nodes) for the picker, track and buttons; export Energy Usage / Quick Actions / Odometer / Tire icons.
- Widget registry + `widgetTrack` in the store; track renders from it (placeholder widget + chicklet). No visible change with the default track.
- Review: **regression** — existing widget states still match; `?widgets=` deep link renders a placeholder.

### 8.1 — Pull-up gesture + Customize button (M)
- Axis-locked gesture on the widget bar: horizontal stays native scroll-snap paging, vertical (after ~10px) takes over.
- Bow curve: resistance ramps up to a "let-off" point (~55% of travel), then the bar snaps to the revealed position with `spring.snap`; below it, release springs back. Constants in one place to tune on iPad.
- Revealed state: Customize button under the bar; pull down / tap elsewhere hides it.
- Review: shots of `customize-revealed`; gesture script checks early release → back, past let-off → revealed, horizontal swipe still pages.

### 8.2 — Customize mode layout (M)
- Picker card, shrunken track with peek, X / label / dots, Done; enter + exit transitions (`transition.open/close`); Light + Dark.
- Delete with X (card collapses, track closes the gap). Done / map tap / panel tap outside → exit.
- Panel morph, collapse and the other overlays are blocked/closed while editing.
- Review: `customize-editing-{light,dark}` vs sketch 3; delete flow; exit paths.

### 8.3 — Drag & drop (L)
- Lift icon from the picker (follows the finger in design px), insertion bar → slot opens → drop inserts and pages to the new widget; edge auto-scroll while dragging near the track ends; drop outside floats back.
- Duplicate rule (move vs. no-op + flash ×3 + float back). Reorder by dragging a track widget.
- Review: `customize-drag-*` vs sketches 4–6; gesture script covers insert, duplicate-adjacent, duplicate-move, reorder, cancel.

### 8.4 — Integration & polish (S)
- Chicklets for new widgets in the Collapsed/Driving rail, persistence, reduced motion, Driving behaviour, COMPONENTS/README/WORKLOG.
- Full reviewer sweep (all states, iPad letterbox) + regression of earlier phases.

## Review agents per phase
Two `hud-reviewer` runs in parallel after each phase:
1. **Fidelity** — `npm run shots` of the phase's states vs `design-ref/customize-*` (and Figma nodes above); Light + Dark; token/motion grep.
2. **Function** — runs `scripts/gestures.mjs`, then walks the flows by hand in the built-in browser at iPad size; edge cases listed in the phase.
I triage both reports, fix, and log the result in WORKLOG before you test on the iPad.

---

# Phase 9 — Full widget set, Self-Driving, map peek, move widget (✅ answers in 2026-10-28 — Q25–Q35 resolved, ready for 9.0)

**Sources (Figma, file `L4iGjQC6AbgfNfqCAxQnh9`):**
- **Update 1 — widget set:** `4889:51206` "Dynamic Widget Bar - New Set". Base components `.Widget / new full set` `4899:2892` (Widget = Music · Odometer · Tire · Energy · Calendar · Phone · Quick Actions × Size = Open 600×192 / Collapsed pill / Chicklet / Mini Chicklet), list `4899:2999`, page indicator (7 dots) `4899:2998`, size review `4901:8483`. Light only.
- **Update 2 — map peek + Self-Driving:** Sketches › "Update 2": New Map Light `4889:37991`, Dark `4889:37992` (Car status Full with a round masked map top-right, "Mask group" 647×660). Start Self-Driving button (`Self Drive` instance, 240×86) on Vehicle › Car Status Panel `4268:3115`: Parked Panel, Parking Sensors Panel, Driving Panel, Driving Collapsed 220, Parked Full. Car Render has `Mode=FSD` variants `4266:2711` / `4266:2782` (blue path).
- **Update 3b — move from the Collapsed rail (last step, 9.6):** `4923:59013` (widget on the map, drop field 88×232 in the 116 rail) and its row on Sketches.
- **Update 3 — move widget:** Sketches › "Update 3". Panel row: pull up `4889:38248` → move fields `4889:40694` → dragged `4889:41114` → snapped onto the map `4889:41518`. Full row: `4889:43675` → `4889:43676` → `4889:43677` → snaps + "smart shuffle" `4889:43408` (also `4889:41922`).

## Sub-phases (each ends: 2 reviewer runs → fix → you test on iPad → WORKLOG → commit + push)
Rough size: S ≈ short session, M ≈ one session, L ≈ one long session. **One sub-phase per session.**

### 9.0 — References & specs (S) ✅ 2026-10-28 → `docs/SPECS-P9.md`, 14 refs in `design-ref/`, tokens `border-accent`, `action-primary-transparent-bg-default`, `chart-over-rated`
- Save small refs to `design-ref/`: `widgets-set-light` (size review `4901:8483`), `map-peek-{light,dark}`, `move-panel-{1..4}`, `move-full-{1..4}`, `self-drive-states` (`4268:3115`). One screenshot each, ≤1024px.
- `get_design_context` **only on the 4 new base components' Open size** (`4899:2637` Energy, `4899:2696` Calendar, `4899:2736` Phone, `4899:2800` Quick Actions) + the Self Drive instance + the map Mask group. Pull Collapsed / Chicklet / Mini from metadata + screenshot unless they need more.
- Diff the refreshed Music / Odometer / Tire against what's built (pills are 382 wide — Q27; Odometer chicklet 186) → list for 9.1.
- New tokens if any (Light **and** Dark). COMPONENTS.md rows.
- Review: none (no UI change) — I check the refs list against Figma.

### 9.1 — New widgets: Energy, Calendar, Phone, Quick Actions (M–L) ✅ 2026-10-28 (reviewed; iPad test pending)
- `InfoWidgets.tsx` → one file per widget (`EnergyWidget`, `CalendarWidget`, `PhoneWidget`, `QuickActionsWidget`) with Open / Collapsed / Chicklet / Mini; set `Widget` + sizes in `registry.tsx` (the "Coming soon" placeholder stays for future apps).
- Collapse (Q26): **swipe down on the widget** collapses the whole bar to the pill of the widget that was showing; the page is remembered; tapping the pill opens the bar back on that widget. Every widget gets its 382×64 pill (Music already has one). Swipe down while the Customize button is revealed still just hides the button (P8.1).
- Apply any Music / Odometer / Tire refresh from 9.0; dots handle up to 7 pages.
- Widgets are **static concept images** (Q25): no taps inside them beyond paging / collapse / Customize. Built as real layout from tokens (not bitmaps) so Light/Dark both work.
- Dark derived from tokens (Q28). Energy chart = SVG.
- States: `widget-{energy,calendar,phone,quickActions}-{light,dark}`, plus collapsed / chicklet (Driving rail) / mini (Collapsed rail), and the Customize track showing real widgets.
- Review: fidelity (shots vs `widgets-set-light`) + function (paging, rails, Customize track/drag still pass `npm run gestures`).

### 9.2 — Start Self-Driving button (S–M) ✅ 2026-10-28 (reviewed; iPad test pending)
- New `SelfDriveButton` component; placed per state: Parked Panel (top-right), Driving Panel (right of the turn card), Driving Collapsed 220 rail (above the chicklet), Parked Full (beside the telltales). Moves with the panel morph like the other status items.
- Tap does **nothing** (Q32) — standard press feedback only, no state. Shown only where Figma has it (not Driving Full / Parked 116 rail).
- States: `selfdrive-{parked,driving,full,rail}-{light,dark}`.
- Review: fidelity + function (morph Panel ⇄ Full ⇄ Collapsed keeps it in place, Parked ⇄ Driving).

### 9.3 — Map peek in Car status Full (M) ✅ 2026-10-28 (reviewed; iPad test pending)
- Round masked map in the top-right of the Full view: the **live** map tiles + route layer inside the mask (Q29), so routed / not routed and Light / Dark follow the app state, Parked and Driving. **Not** pannable / pinchable.
- Mask: midway between the Light and Dark comps (Q30) ≈ 694×698 at (1383, −197); soft edge from the Mask group. Appears / disappears with the Panel ⇄ Full morph.
- Tap → opens the map: car view morphs Full → Panel (Q29/Q31).
- States: `map-peek-{idle,routed}-{parked,driving}-{light,dark}` (8).
- Review: fidelity (vs `map-peek-*`) + function (start / end trip while in Full updates the peek, morph in/out, no pan/pinch in the peek).

### 9.4 — Move widget (L) ✅ 2026-10-28 (reviewed; iPad test pending)
- Store: where the widget bar lives — Panel: `panel | map` (docked on the map beside the trip card); Full: `left | right` of the Navigate / trip card. Persisted like the track; `?widgetDock=`.
- Gesture (Q33): keep holding the pull-up past the Customize reveal → after a beat the widget **pops out, like out of a socket** (quick lift + scale overshoot with `springSnap`, shadow grows) and move mode starts. Move mode: Done replaces Customize, grey drop fields at the origin and the target(s), widget follows the finger (lifted, panel shadow), snaps into the nearest field on release, otherwise floats back. Full: dropping right of the card "smart-shuffles" the card left so the pair stays centred.
- Reuse `Customize/drag.ts` pieces (finger-based targeting, `springSnap`, `reducible()`); new checks in `scripts/gestures.mjs` (pop out, drop on map, drop back, cancel, Full shuffle).
- Map drop field sits in the **same spot as during a trip** (beside where the trip card is), with or without a trip (Q34). Position is **saved** (localStorage, URL wins) (Q35). Moving is **disabled from the Collapsed rail** until 9.6.
- Review: fidelity (vs `move-*`) + function (gesture script + manual walk at iPad size).

### 9.5 — Integration sweep (S) ✅ 2026-10-29
- Reduce Motion for 9.2–9.4, README/COMPONENTS/WORKLOG, full reviewer sweep of all states + regression of P8 (`npm run gestures`), iPad letterbox shots.

### 9.6 — Move widget from the Collapsed rail (M) — last ✅ 2026-10-29 (reviewed; iPad test pending)
- Per `4923:59013` and its row: widget docked on the map while the panel is collapsed; drop field in the 116 rail. Re-enable the gesture there; extend `gestures.mjs`.
- Review: fidelity + function, then a final P8/P9 regression run.

# Phase 10 — Settings 2026 + Front Climate (✅ approved 2026-10-29 — Q41–Q44)

**Source:** Figma page `4931:2` "↳ Settings & Climate · Photo Build" (Anastasiya). Read-me `4944:28019`: 19 categories × Light / Dark, Front Climate Light / Dark, reusable photo rows / sliders / header / long toggle, 10 climate symbols (on / off), 18 new colour variables + 6 type styles.
Never fetch the page whole (260k chars) — node IDs below.

- **Screens (Light / Dark, 2032×1328 frames):** Controls `4938:28190`/`28221` · Dynamics `28253`/`28284` · Charging `28316`/`28347` · Self-Driving `28379`/`28410` · Locks `28442`/`28473` · Lights `28505`/`28536` · Seats `28568`/`28599` · Display `28631`/`28662` · Schedule `28694`/`28725` · Safety `28757`/`28788` · Service `28820`/`28851` · Software `28883`/`28914` · Navigation `28946`/`28977` · Trips `29009`/`29040` · Profiles `29072`/`29103` · Wi-Fi `29135`/`29166` · Bluetooth `29198`/`29229` · Audio `29261`/`29292` · Upgrades `29324`/`29355` (all `4938:`). Climate Front `4938:29417`/`29504`. Home `4938:29388`/`29475`.
- **Components:** Window `4932:119`, Navtree `4932:14` / Lower `4939:27808`, page bodies `4933:527`… (`Settings 2026 / <Name>` symbols, 840×1015), Photo rows / sliders / header `4959:25185`–`25269`, Long toggle `4986:26050`, icons `4959:25151`…, Climate Panel `4936:2339` (1920×840), Climate Symbol `4975:25932`, Parked Mode `4942:27958`, Fan Speed `4942:28036`, Seat Heat `4935:2085`, Seats Cabin `4952:25392`, vehicle art `4967:25460`, `4977:25888`.

## Sub-phases (each: build → fidelity check vs the Figma frame → reviewer → WORKLOG → commit)
### 10.0 — References & tokens (S) ✅ 2026-10-29
- 38 settings + 2 climate refs (≤1024px) into `design-ref/settings-2026/`; the 18 colour variables (Light + Dark) and 6 type styles into `tokens.css`; component list → COMPONENTS.md.
- New `scripts/fidelity.mjs`: shoots a state, crops the display out of the Figma frame ref, scales both alike and reports a per-region pixel diff (nav / header / body) — the "looks right vs the mock" check, reused by every later sub-phase.
### 10.1 — Settings shell (M) ✅ 2026-10-29 (shared rows/sliders move to 10.2, built with the first pages that use them)
- New Window + Navtree: 19 categories (Controls, Dynamics, Charging, Self-Driving, Locks, Lights, Seats, Display, Schedule, Safety, Service, Software, Navigation, Trips, Profiles, Wi-Fi, Bluetooth, Audio, Upgrades), scrollable nav, search row, profile header with status icons. Category switching works; page bodies scroll.
- Shared static pieces: photo rows (key / network / device / schedule / profile), sliders (charge / brightness / volume / immersive), long-label toggle, section titles.
### 10.2 — Pages A (M–L): Controls, Dynamics, Charging, Self-Driving, Locks, Lights, Seats (cabin art)
### 10.3 — Pages B (M–L): Display, Schedule, Safety, Service (vehicle art), Software, Navigation
### 10.4 — Pages C (M): Trips, Profiles, Wi-Fi, Bluetooth, Audio (EQ), Upgrades
### 10.5 — Front Climate (L)
- Sheet 1920×840 over the bottom of the screen: swipe up on the control bar opens it (follows the finger), drag down closes. Off / Keep / Pet / Camp row, Auto, Front / Rear (Rear = placeholder), Schedule, cabin render, seat heat, defrost / wheel / wiper symbols, fan LO–10.
### 10.6 — Sweep (S): fidelity script over all 40 states (Light + Dark), reviewer pass, gestures regression, iPad.

Settings pages are **static** (Anastasiya, 2026-10-29) — the elements are there, controls don't change state. Old pages (Pedals, Autopilot…) are replaced by the new set.

## Backups
| Date | What | Restore |
|---|---|---|
| 2026-10-29 | Everything through Phase 9.6 + the Quick Actions refresh, dock right-align / separate sides, Quick Actions swipe-down (commit `a863020`) | `backups/2026-10-29-phase9-complete-a863020.zip` (full source, local only — git-ignored, 23 MB) · git tag `backup-2026-10-29` (`git checkout backup-2026-10-29`) |

## Review agents per sub-phase (same as P8)
Two `hud-reviewer` runs in parallel (Sonnet, read-only):
1. **Fidelity to Figma** — `npm run shots -- --only <states>` vs the 9.0 refs, Light + Dark, region by region; token / motion grep; Figma inconsistencies go to "ask Anastasiya", not copied.
2. **Functionality** — `npm run gestures` + walking the sub-phase's flows by tap in the built-in browser at 1376×1032; deep links; console errors; edge cases listed in the sub-phase.
I triage both, fix, log in WORKLOG, then you test on the iPad.

## Token budget notes
- Figma: refs captured once in 9.0; later sub-phases read `design-ref/` + COMPONENTS.md, and call `get_design_context` only on the one node being built. Never fetch the Sketches page whole (~160k chars) — node IDs are listed above.
- The remote Figma MCP (`06eb831b…`) works for this file; the desktop one only sees the file when it's the active tab in Figma.
- Reviewers get only the sub-phase's states / flows; one sub-phase per session; WORKLOG "Current state" stays short.
