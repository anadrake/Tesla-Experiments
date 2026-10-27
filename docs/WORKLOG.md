# Tesla Center HUD — Working Log

Running record of feedback, decisions, discussions and learnings. Newest entries at the top of each section.
**Each new session: read "Current state" + "Open questions" first; skip history unless needed.**

---

## Current state
- **Phase:** 1 — ✅ done (committed; awaiting push). Live site: https://anadrake.github.io/Tesla-Experiments/
- **Last session:** 2026-10-26 — plan approved; Phase 0 scaffold, tokens, stage, deploy workflow, design-ref, reviewer agent
- **Next step:** Anastasiya pushes + tests on iPad (tap clock, temps, drag/pinch map) → Phase 2 (car panel, music bar, Car status morph)
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
| Q9 | Tokens: `border-subtle` is #414141 in both modes (darker than `border-default` in Light; same as `surface-panel` in Dark, so invisible on panels). `surface-selected` = `surface-sunken` in Light. Intended? | open — low priority, revisit when a component uses them |
| Q10 | Clock live vs static | ✅ Keep live — "nice addition" |
| Q8 | Car status top bar | ✅ Not intentional. Status bar elements keep the same size on every screen; on expand/collapse they only move and hide/reveal |

## Decisions
- 2026-10-26 — P1: Day/Night dissolve = 0.6s CSS color transitions on every element while `html.mode-switching` is set; map tiles cross-fade by opacity. (View Transitions was tried first and dropped: it routes all taps to the page root mid-transition, so rapid clock taps were lost.) Top-bar gradient snaps rather than fades (gradients can't transition) — minor. Clock is live (Q10). Light `--color-surface-glass` set to neutral-50 · 80% (see bugs).
- 2026-10-26 — **Push to `main` after every phase** (standing approval from Anastasiya), starting with Phase 0.
- 2026-10-26 — **Plan approved.** Q7: callouts show part small / state bold everywhere (Figma Map-panel "Open / Frunk" is the inconsistent one). Phase 0 started.
- 2026-10-26 — Q5: PRND tap toggles Parked ⇄ Driving. Q6: Map Driving and Navigating stay duplicates. Q8: one status bar component, fixed element sizes; expand/collapse animates position + visibility only (Figma's enlarged Car status bar is drift, don't copy).
- 2026-10-26 — Q1–Q4 answered (see table): scale-to-fit, static map w/ pan-zoom, tap-clock Day/Night + follow iPad setting, public repo w/ concept note.
- 2026-10-26 — Plan doc + working log live in `docs/`; build happens only after plan is agreed.
- 2026-10-26 — Bezel art excluded; render the 1920×1200 display only (per brief).

## Feedback from Anastasiya
- 2026-10-26 — P1 review: looks good. Keep the live clock. **Map image feels small** → generate a bigger, nicer map with Snazzy Maps (snazzymaps.com) styling — scheduled for Phase 7, not now.
- 2026-10-26 — Initial brief: working iPad prototype from GitHub, match Figma visuals/UX/layout/interactions/motion, easy to extend via vibe coding, phased plan first, keep this log, reviewer agent checks every step, ask about design intent, Figma prototype may have bugs — don't assume inconsistencies are correct.

## Figma bugs / inconsistencies found
- Map Driving screen visually identical to Navigating → not a bug, intentional duplicate (Q6)
- Car status callout label/value order flips between Frunk and Trunk. → Q7
- Car status status bar has enlarged time/temp/profile → **bug**; use Map-screen sizes (Q8)
- `--color-surface-glass` resolves to `#000000f2` in BOTH modes via get_variable_defs, but the Light map ref shows a near-white location tag and the component's own fallback is neutral-50 · 80%. Built Light = `#f6f6f6cc`. Likely a missing Light value on the variable.

## Learnings
- Figma Screens "Read me" documents the whole prototype wiring and motion tokens — treat as the UX spec.
- Display = 1920×1080 stage (Left 630 / Main / Overlay slots) + 120px control bar = 1920×1200.
- Tokens are clean Figma variables (`--color-*`, `--space-*`, `--radius-*`, `--font-size-*`, `--size-*`) with Light/Dark modes; Inter font.
- Screens page metadata is ~170k chars — never fetch whole pages; target node IDs. Foundations page (`342:18279`) is small and has the full Motion spec.
- Motion spec (Foundations): instant 100 / fast 150 / base 250 / slow 400 / deliberate 600ms; standard `cubic-bezier(.2,0,0,1)`, enter `(0,0,.2,1)`, exit `(.4,0,1,1)`, spring m1 k300 c30.
- Figma letterSpacing values are percent (1 → 0.01em). Map labels use Source Sans 3; everything else Inter.
- Primitive yellow/500 `#FFBD0A` (route line) and teal/500 have no semantic token yet.
- Stage: centering a 1920px box with CSS grid fails when it's wider than the viewport (track grows) — use absolute + translate(-50%,-50%) scale().
- Repo renamed to `Tesla-Experiments` (local folder + remote URL keep old spelling; GitHub redirects). Pages must be enabled (Settings › Pages › Source: GitHub Actions) or deploy-pages fails.
- Git CLI on this Mac has no GitHub login (no gh, no SSH key); Anastasiya pushes via GitHub Desktop. Phase 0 pushed 2026-10-26 (`84cc715`).
- Status bar items are split in Figma: PRND + battery live in the Car panel; lock/time/temp/profile/airbag in the Map Top Bar.
- Map holds turn list + trip card at 0% opacity (offset 40px) so State=Driving morphs them in — mirror this in P3.
- Control Bar is pinned to Dark in Figma → `data-mode="dark"` on its root.
- Glyph SVGs come with mode-resolved colors → render via `Icon` (CSS mask) + token color. Map/top-bar icons = `--color-icon-strong`.
- Component SVG exports carry page background + doc card → see COMPONENTS.md "Asset notes".
- `npm run shots` uses installed Google Chrome via playwright-core (no browser download).
- Key node IDs: Map Parked L/D `4300:1022`/`4300:1216`; Car status L/D `4300:18`/`4300:714`; Navigating L/D `4300:2833`/`4300:3474`; Quick actions L/D `4300:2105`/`4300:2520`; Settings Controls L/D `4300:21356`/`4300:21841`.

## Phase history
### Phase 1 — Display Shell, Map, Control Bar, Day/Night (2026-10-26)
- Built: DisplayShell slots, Control Bar (pinned dark, steppers 60–84, dock, volume), Map (themed 2× tiles, drag + pinch, top bar, Navigate field, map controls, location tag, airbag badge), tap-clock Day/Night, Icon/Pressable/Stepper components.
- Review: PASS WITH ISSUES. Fixed: rapid clock taps lost (switched dissolve off View Transitions), clock had no press feedback, pinch now zooms about the fingers, letterbox color tokenized.
- Not verified on a real iPad yet: pinch feel, dissolve smoothness.
### Phase 0 — Foundation & tooling (2026-10-26)
- Built: Vite/React/TS scaffold, Light/Dark + motion tokens, text styles, scaled letterboxed Stage, iPad hardening + PWA manifest/icons, URL deep links (`?mode=`), Pages deploy workflow, `npm run shots`, 30 design-ref PNGs, CLAUDE.md, COMPONENTS.md, hud-reviewer agent.
- Review: PASS WITH ISSUES (all low). Fixed: Stage now refits on rotation/visualViewport; tsbuildinfo ignored. Deferred to Phase 7: self-host fonts for offline home-screen use; maskable icon.
- Reviewer noted for Phase 1: control bar is black in both modes; dark left panel is a ~#242424 gradient, not canvas.
- Note: new agent files are picked up next session; this session ran the reviewer as a general-purpose Sonnet agent following `.claude/agents/hud-reviewer.md`.
