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
| Control Bar | `4273:375` | `src/shell/ControlBar.tsx` | ✅ P5 | Pinned dark; dock = pinned · All apps · divider · recents |
| Map (State=Default) | `4690:41395` | `src/screens/Map/Map.tsx` | ✅ P1 | Turn list / trip card (State=Driving) → P3 |
| Map Tiles | `4269:2425` (Light `4269:2423`, Dark `4269:2424`) | `src/screens/Map/MapTiles.tsx` | ✅ P1 | 2× exports, pan + pinch |
| Map Top Bar (items) | `4259:114` | `src/shell/StatusCluster.tsx` | ✅ P2 | One instance for all screens; items move/fade between Map and Car status (Q8). Tap clock = Day/Night. Map keeps only the gradient |
| Navigate Field | `4307:23243` | in `Map.tsx` | 🟡 P1 | Visual only; focus → Keyboard in P3 |
| Car Status Panel (Parked) | `4268:3115` | `src/components/CarPanel/` | ✅ P2 | Panel ⇄ Full (tap/drag) ⇄ Collapsed 116 (handle drag left); rects in `geometry.ts` |
| Status Bar (PRND + Battery) | `4259:102` | `CarPanel/PanelStatusBar.tsx` | ✅ P2 | PRND tap → P4 |
| Telltales | `49:33482` etc | `CarPanel/PanelStatusBar.tsx` | ✅ P2 | status-success / status-danger |
| Callouts | in panel | `CarPanel/Callouts.tsx` | ✅ P2 | Q7 part small / state bold |
| Dynamic Widget Bar | `4416:12286` | `src/components/WidgetBar/` | ✅ P2 | Swipe Music / Odometer / Tire + idle-fading dots; music → pill; Mini Chicklet `4666:74587` in Collapsed |
| Widget registry + Placeholder widget | Sketches `4766:94038` (placeholder `4802:107503`, picker tiles in Add Apps Frame) | `src/components/WidgetBar/registry.tsx`, ids in `src/state/widgets.ts` | ✅ P8.0 | One entry per app (label, icon, group, Widget?, mini size). No Widget → "<App> Widget Coming Soon"; chicklet = app icon. Track = `widgetTrack` (`?widgets=`, localStorage) |
| Customize pull-up + Customize button | Sketch `4802:103109` (button `4766:97815`) | `WidgetBar/usePullUp.ts`, `useDismissOnOutsideTap.ts`, `WidgetBar.tsx` | ✅ P8.1 | Feel constants at the top of usePullUp; `?customize=revealed` |
| Customize editor: Widget Picker · Customize Track · Done | Sketch `4802:103107` (Add Apps Frame `…4802:104691`, edit frame `…4802:104705`), placeholder `4802:107503` | `src/components/Customize/` | ✅ P8.2 | Panel coords (`Customize/geometry.ts`); track = own pager; `?customize=editing` |
| Customize drag & drop: insertion bar · drop slot · drag ghost | Sketches `4802:103108` (bar), `4802:103453` (slot), `4802:104649` (dropped) | `Customize/drag.ts` (state + rules), `DragLayer.tsx`, `CustomizeTrack.tsx`, `WidgetPicker.tsx` | ✅ P8.3 | Timings / reach at the top of drag.ts; `npm run gestures` covers every drop path. Reduce Motion (P8.4): editor fades in place (`useEditorMotion`), imperative springs go through `reducible()` (tokens/motion.ts) |
| Trip Card / Search | `359:9111` | `src/components/TripCard/TripSearchCard.tsx` | ✅ P3 | Navigate → map + keyboard; Home/Work → trip |
| Keyboard | `52:32037` | `src/overlays/Keyboard/` | ✅ P3 | Slides up (slow/enter); shift one-shot; ?#&, mic, cursor = press only |
| Key | `4271:2318` | `src/components/Key/` | ✅ P3 | Character 104×88 / Action; Pressed = 8% overlay |
| Turn List | `4299:81` | `src/components/Navigation/TurnList.tsx` | ✅ P3 | Two-tone nav icons via ThemedSvg |
| Trip Card / Active | `359:9155` | `src/components/Navigation/TripCardActive.tsx` | ✅ P3 | End Trip → idle; ⋯ press only |
| Route layer | Map State=Driving › route | `src/screens/Map/RouteLayer.tsx` | ✅ P3 | In tile coords (pans/zooms); line draws from the car |
| ThemedSvg | — | `src/components/ThemedSvg/` | ✅ P3 | Multi-tone SVGs: swap baked hex → token vars (`?raw` import) |
| Car Render Scene=Driving | `4479:49839` | `src/components/CarPanel/DrivingScene.tsx` | ✅ P4 | Road lines, beam, lead + ego car; % layout scales Panel → Full |
| Speed + Speed Limit Sign + compact Direction Primary | in Car Status Panel (Driving) | `src/components/CarPanel/SpeedCluster.tsx` | ✅ P4 | Enlarged in the 220 rail |
| Chicklet (Music / Odometer / Tire) | `4596:70708` / `70712` / `70716` | `WidgetBar.tsx` (`chicklet="large"`) | ✅ P4 | Driving collapsed rail |
| Quick Actions | `4273:450` | `src/overlays/QuickActions/` | ✅ P5 | Pinned dark; climate tiles toggle |
| App Tile | `4231:398` | `src/components/AppTile/` | ✅ P5 | Default / Pressed; On = blue glyph (Q14) |
| Settings Window + Navtree + Settings Panel | `4258:39` / `4275:556` | `src/overlays/Settings/` | ✅ P6a | Pages registered in `SettingsWindow.tsx` PAGES; nav items in `navItems.ts` |
| Tile / Tile Group | `4231:164` / `4231:385` | `src/components/settings/Tiles.tsx` | ✅ P6a | TileChoice (single) · TileToggles · ToggleTile (On / Active) |
| Switch · Checkbox · Segmented · Select · Slider · Button · Search Field · Divider · Section Title · Field Group · Setting Row | `4229:27` · `4229:46` · `4229:168` · `4230:61` · `4230:120` · `4227:127` · `4230:136` · `4226:33` · `4231:419` · `4275:535` · `4231:420` | `src/components/settings/controls.tsx` | ✅ P6 | All take a `setting` key → `useSetting`; + ToggleButton, Segmented `width="fill"` / controlled mode |

**Add a settings page:** make `src/overlays/Settings/pages/XPage.tsx` from the Figma Settings Panel body using the controls above, register it in `PAGES`. Values persist in the store by key.

Icon node IDs: see [ICONS.md](ICONS.md).

## Asset notes
- Figma **component exports** (`download_assets` on a component node) include the Icons page background and the documentation card. Strip `<rect … fill="#2F2F2F"/>`, the `1680×3936` page rect, and the first `<path d="M-…" fill="#F0F0F0"/>`. Done for `src/assets/apps/*`.
- Some exports are broken (e.g. `shadow · full` had infinite filter bounds) → rebuild those in CSS.
- Glyph SVGs from `get_design_context` have colors resolved for the frame's mode → always render through `Icon` with a token color.
