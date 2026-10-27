# Tesla Center HUD prototype

Tap-driven web prototype of an in-car center display, built from Figma `L4iGjQC6AbgfNfqCAxQnh9`.
Runs on iPad Pro (GitHub Pages, Add to Home Screen). Design concept — not affiliated with Tesla.

## Start of every session
1. Read `docs/WORKLOG.md` › **Current state** and **Open questions** (skip history unless needed).
2. Plan lives in `docs/PLAN.md`. Figma ↔ code map in `docs/COMPONENTS.md`.
3. Log feedback, decisions, Figma bugs and learnings in WORKLOG as you go.

## Commands
- `npm run dev` — dev server on LAN (open the printed Network URL on the iPad)
- `npm run build` — typecheck + production build
- `npm run shots [-- --only a,b] [--ipad]` — screenshot states in `scripts/states.json` → `shots/` (needs dev server)

## Conventions
- **Canvas is 1920×1200 px**, identical to Figma. Write sizes in Figma px; `Stage` scales to the device.
- **Tokens only.** Colors/space/radius/type come from `src/tokens/tokens.css` (names = Figma variables). Never hard-code a hex or a duration. Missing token? Pull it from Figma for Light AND Dark and add it.
- **Motion only from `src/tokens/motion.ts`** (`transition.press/toggle/open/screen/dayNight`, `presets`, `spring`).
- **Text styles:** use `.text-*` classes (Figma text style names).
- **State:** everything flow-related lives in `src/state/store.ts`. Deep-linkable fields are mirrored in `src/state/url.ts`; add a `scripts/states.json` entry for each new reviewable state.
- **Structure:** `components/` (one folder per Figma component, `Name.tsx` + `Name.module.css`), `shell/`, `screens/`, `overlays/`.
- **Figma may be wrong.** If something looks inconsistent, ask Anastasiya and log it — don't copy it.
- **iPad:** touch only. No hover-dependent UI. Every tap target ≥ `--size-touch-min` (64px) unless Figma is smaller on purpose. `touch-action: none` globally; opt in per component for gestures.
- **Figma reads are expensive.** Target node IDs (see `design-ref/README.md`, `docs/COMPONENTS.md`), never whole pages; screenshots ≤1024px.

## Adding a screen (vibe-coding recipe)
1. Add state for it in `store.ts` (+ `url.ts` if deep-linkable).
2. Build it in `screens/` or `overlays/` from existing components; new components go in `components/` and get a row in `COMPONENTS.md`.
3. Add a `states.json` entry, run `npm run shots`, compare against Figma.
4. Run the `hud-reviewer` agent on the changed states.

## Review loop
After each phase/feature: run the `hud-reviewer` agent (`.claude/agents/hud-reviewer.md`) → fix → Anastasiya tests on iPad → log in WORKLOG → commit.
