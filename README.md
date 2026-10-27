# Center Display HUD — Prototype

A tap-driven, web-based prototype of an in-car center display, built from my Figma component library and designed to run full-screen on iPad Pro.

> **Design concept.** Not affiliated with, endorsed by, or connected to Tesla, Inc. Vehicle imagery, album art and app logos are used for illustration only.

## Try it
- **Live:** GitHub Pages (Settings → Pages → Source: GitHub Actions). URL: `https://anadrake.github.io/Tesla-Experiements/`
- **On iPad:** open the URL in Safari → Share → **Add to Home Screen** → launch from the icon for full-screen.

## Develop
```bash
npm install
npm run dev        # open the Network URL on your iPad (same Wi-Fi)
npm run build
npm run shots      # screenshot every state in scripts/states.json → shots/
```

Deep links: any state can be opened via URL params, e.g. `?mode=dark`.

## Project docs
- [docs/PLAN.md](docs/PLAN.md) — phased build plan
- [docs/WORKLOG.md](docs/WORKLOG.md) — decisions, feedback, learnings
- [docs/COMPONENTS.md](docs/COMPONENTS.md) — Figma ↔ code map
- [CLAUDE.md](CLAUDE.md) — conventions + how to add a screen
