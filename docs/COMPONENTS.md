# Components — Figma ↔ code map

One row per built component. Check here before reading Figma: if it's listed, it's built.

| Component | Figma node | Code | Status | Notes |
|---|---|---|---|---|
| Stage (1920×1200 scaler) | — | `src/shell/Stage.tsx` | ✅ P0 | Letterboxed scale-to-fit |
| Design tokens | Foundations `342:18279` | `src/tokens/tokens.css`, `motion.ts` | ✅ P0 | Light/Dark, motion, text styles |
| Icon (mask, mode-aware) | — | `src/components/Icon/` | ✅ P1 | Monochrome glyphs take a token color; multi-color pictograms use `<img>` |
| Pressable | — | `src/components/Pressable/` | ✅ P1 | Press feedback (0.1s) for every tappable |
| Stepper (Bare) | `4230:76` | `src/components/Stepper/` | ✅ P1 | Cabin temp ‹ 72 ›, 60–84 |
| Airbag-off badge | `4221:19111` | `src/components/AirbagBadge/` | ✅ P1 | Fixed colors, Nunito Bold 12 |
| Display Shell | Shell & System | `src/shell/DisplayShell.tsx` | ✅ P1 | Main / Left / Overlay slots + control bar |
| Control Bar | `4273:375` | `src/shell/ControlBar.tsx` | ✅ P1 | Pinned dark (`data-mode="dark"`) |
| Map (State=Default) | `4690:41395` | `src/screens/Map/Map.tsx` | ✅ P1 | Turn list / trip card (State=Driving) → P3 |
| Map Tiles | `4269:2425` (Light `4269:2423`, Dark `4269:2424`) | `src/screens/Map/MapTiles.tsx` | ✅ P1 | 2× exports, pan + pinch |
| Map Top Bar | `4259:114` | `src/screens/Map/MapTopBar.tsx` | ✅ P1 | Tap clock = Day/Night |
| Navigate Field | `4307:23243` | in `Map.tsx` | 🟡 P1 | Visual only; focus → Keyboard in P3 |

## Asset notes
- Figma **component exports** (`download_assets` on a component node) include the Icons page background and the documentation card. Strip `<rect … fill="#2F2F2F"/>`, the `1680×3936` page rect, and the first `<path d="M-…" fill="#F0F0F0"/>`. Done for `src/assets/apps/*`.
- Glyph SVGs from `get_design_context` have colors resolved for the frame's mode → always render through `Icon` with a token color.
