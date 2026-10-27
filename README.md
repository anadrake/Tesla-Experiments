# Center Display HUD — Prototype

A tap-driven, web-based prototype of an in-car center display, built from my Figma component library and designed to run full-screen on iPad Pro.

> **Design concept.** Not affiliated with, endorsed by, or connected to Tesla, Inc. Vehicle imagery, album art and app logos are used for illustration only. Map data © OpenStreetMap contributors.

## Try it
- **Live:** https://anadrake.github.io/Tesla-Experiments/
- **On iPad:** open the URL in Safari → Share → **Add to Home Screen** → launch from the icon for full-screen.

### What you can do
| Gesture | Result |
|---|---|
| Tap the clock | Toggle Light / Dark |
| Tap **P/R/N/D** in the car panel | Start a trip (Driving) / end it (Parked) |
| Drag the car panel handle right / left | Expand to Full car view / collapse to the chicklet |
| Swipe the widget bar | Music → Odometer → Tire pressure |
| Tap **Navigate** | Keyboard; type and tap **Enter** to start navigating |
| Tap the car icon in the dock | Settings (Controls, Pedals & Steering, Display, Lights, Search) |
| Tap **All apps** | Quick Actions |
| Pinch / drag the map | Zoom and pan |

## Develop
```bash
npm install
npm run dev        # open the Network URL on your iPad (same Wi-Fi)
npm run build      # typecheck + production build
npm run shots      # screenshot every state in scripts/states.json → shots/ (dev server must be running)
```

### Deploy
Every push to `main` builds and deploys to GitHub Pages (`.github/workflows/deploy.yml`). The build uses a relative base, so it works at any Pages path.

### Deep links
Any state opens from URL params, which the reviewer and `npm run shots` rely on:

`?mode=light|dark` · `car=full|collapsed` · `music=collapsed|paused` · `widget=0|1|2` · `nav=typing|navigating` · `overlay=apps` · `settings=<page>`

e.g. `?mode=dark&nav=navigating&car=collapsed`

## Vibe-coding guide
Start every session by pointing the agent at [CLAUDE.md](CLAUDE.md); it reads the **Current state** in [docs/WORKLOG.md](docs/WORKLOG.md) and works from there.

**Ground rules** (details in CLAUDE.md)
- The canvas is 1920×1200, same as Figma. Write sizes in Figma px.
- Colours, spacing, type and motion come from tokens only: `src/tokens/tokens.css` and `src/tokens/motion.ts`.
- Flow state lives in one store: `src/state/store.ts`. Deep-linkable fields go in `src/state/url.ts`.
- Touch only, tap targets ≥ 64px.

**Add a screen or overlay**
1. Add its state to `store.ts` (and `url.ts` if you want a deep link).
2. Build it in `src/screens/` or `src/overlays/` from existing components. New components go in `src/components/<Name>/` and get a row in [docs/COMPONENTS.md](docs/COMPONENTS.md).
3. Add an entry to `scripts/states.json`, run `npm run shots`, compare with Figma.
4. Ask for the `hud-reviewer` agent to check it.

**Add a settings page**: follow the recipe in [docs/COMPONENTS.md](docs/COMPONENTS.md) › *Add a settings page*. Short version: build `src/overlays/Settings/pages/<Name>Page.tsx` from `components/settings` controls, store values with `useSetting(key, default)`, register it in `PAGES` in `SettingsWindow.tsx`. Pages that aren't built show *Coming soon*.

**Add an icon**: find its node in [docs/ICONS.md](docs/ICONS.md), export the SVG and strip the page background layers (see COMPONENTS.md › Asset notes). Single-colour icons render with `Icon` and a token colour.

**Re-style the map or move the trip**: edit the palette, `ORIGIN`, `DESTINATION` or `ZOOM` at the top of `scripts/render-map.mjs`, then run:
```bash
node scripts/render-map.mjs
```
It needs internet (OpenFreeMap tiles, OSRM routing) and installed Chrome. It rewrites `src/assets/map/tiles-{light,dark}.jpg` and `src/screens/Map/routeData.json`; the route, car arrow and destination pin follow automatically.

## Project docs
- [docs/PLAN.md](docs/PLAN.md) — phased build plan
- [docs/WORKLOG.md](docs/WORKLOG.md) — current state, open questions, decisions, feedback, learnings
- [docs/COMPONENTS.md](docs/COMPONENTS.md) — Figma ↔ code map and recipes
- [docs/ICONS.md](docs/ICONS.md) — Figma icon node index
- [CLAUDE.md](CLAUDE.md) — conventions for agents
