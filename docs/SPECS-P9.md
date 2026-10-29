# Phase 9 specs (pulled 2026-10-28 in 9.0)

Read this instead of Figma while building 9.1–9.4. Sizes in Figma px. Refs in `design-ref/` (see README there).
Only go back to Figma for: compact-size glyphs (Calendar 24px glyph), the Quick Actions mini glyph, and the 9.6 Collapsed-rail row.

## Widgets — `.Widget / new full set` `4899:2892` (ref `widgets-base-light`, `widgets-set-light`)
All Open widgets: 600×192 content inside the existing card (card bg / radius-lg / shadow come from the Dynamic Widget Bar, unchanged). Static (Q25): no taps inside.
Music / Odometer / Tire: unchanged vs what's built (checked side by side at panel size; reviewer confirms fine detail in 9.1). Compact sizes of those three are "preserved originals" (Figma component description).

### Energy — Open `4899:2637` (inner `.Widget/Energy` `4884:3843`)
- Content: padding 20, gap 16, items centred, row.
- Left "Live statistics" 152×152 column, gap 8, centred vertically:
  `Energy` Title/L primary · `Current drive` Body/S secondary · row (h40, gap 4): `218` Heading/M primary + `Wh/mi` Body/S secondary · `9% below rated` Body/M `--color-status-success`.
- Right "Live consumption chart" (fills, column gap 4, full height):
  legend row h18, right-aligned `Rated 240 Wh/mi` Body/S secondary ·
  plot + scale (fills, gap 4): plot = `src/assets/widgets/energy-plot.svg` (354×108, preserveAspectRatio none; stretch to the box) · scale column w34 `400 / 240 / 0` Body/S secondary, space-between ·
  distance row h18 space-between `0 mi · Last 5 mi · 5 mi` Body/S secondary.
- Plot colors (baked hex → swap via ThemedSvg): `#25CB55` → `--color-status-success` (line + 8% area), `#FF8A00` → `--color-chart-over-rated` (spikes above rated), `#A2A3A5` → `--color-content-tertiary` (dashed rated line).
- Compact (crop in `widgets-base-light`): Collapsed pill 382×64 `218 Wh/mi` + mini trace + `−9%` success · Chicklet 200×185: `Energy` / `218 Wh/mi` / trace / `9% below rated` · Mini 92²: green energy app pictogram (existing `src/assets/widgets/energy.png`).

### Calendar — Open `4899:2696` (inner `.Widget/Calendar` `4884:3905`)
- Content: padding 32 top / 20 sides / 20 bottom, gap 16, items start, row.
- Date tile 89×88, `--color-surface-field`, radius-md, column gap 4 centred: `WED` Body/S secondary · `28` Heading/L primary.
- Divider 1×112 `--color-surface-inverse` @ 20%.
- Event column w210 h112 gap 8: `Design review` Title/L primary · `10:30–11:00` Body/L secondary · `Studio` Body/M secondary · `In 15 min` Body/S secondary.
- Divider again, then event 2 (w210, title w193 wraps): `Lunch With Agatha Jones` Title/L · `12:30–1:30` Body/L · `Panera` Body/M.
- Compact: pill 382×64 = calendar glyph + `10:30` (Title) + `Design review` Body/S · Chicklet: `Up next` (glyph) / `10:30` big / `Design review` / `In 15 min` / `Then 12:30` · Mini 92²: calendar glyph over `10:30`.

### Phone — Open `4899:2736` (inner `.Widget/Phone` `4884:3957`)
- Content: padding 20, column gap 8, centred.
- Header h28 row gap 8: `Phone` Title/L primary (fills) · Connection w112: 7px dot `--color-status-success` + `Connected` Body/S secondary.
- Divider: full width 1px `--color-surface-inverse` @ 20%.
- Favorites row (fills, gap 16, centred): two contacts (fill, h72, gap 12) separated by a 1px full-height divider (same color):
  avatar 44² radius-full `--color-surface-sunken` with initial Title/M primary · details w69/78 column gap 2: name Title/M primary + `Mobile` Body/S secondary · phone glyph 24² `src/assets/widgets/phone-call.svg` (mono #414141 → render via `Icon`, `--color-icon-strong`/primary).
  Contacts: `M` Mom · `D` Daniel.
- Compact: pill 382×64 = phone glyph `Mom` · divider · phone glyph `Daniel` · Chicklet: `Favorites` / `Mom` ☎ / divider / `Daniel` ☎ · Mini 92²: `Phone` Body/S + glyph.

### Quick Actions — Open `4899:2800`
- Controls row: padding 16, gap 8, five equal columns (flex 1, h128, column gap 2, centred):
  64-high App Tile-style cell (radius-md) with a 48² glyph + label Body/S primary centred.
  Glyphs (existing `src/assets/climate/`): `defrost-front` Front defrost · `defrost-rear` Rear defrost · `seat-heat` Left seat · `steering-heat` Heated steering (wraps to 2 lines) · `wipers` Wipers. Icon color = App Tile default (`--color-icon-default`).
- Static (Q25) — no toggling, unlike the Quick Actions overlay.
- Compact: pill 382×64 = the five glyphs in a row · Chicklet: `Quick actions` + 2×2 grid glyph with bolt (`src/assets/widgets/quick-actions.svg`) · Mini 92²: same glyph.

### Page indicator `4899:2998`
7 dots (118×10). Dots scale with track length (already data-driven).

## Start Self-Driving — `Self Drive` instance `4889:40466` (ref `self-drive-states`)
- 240×86, padding 0/24, radius-md, 3px border `--color-border-accent`, bg `--color-action-primary-transparent-bg-default` (#005aff40 both modes), label `Start Self-Driving` Title/L `--color-content-accent`, centred. = Button "Primary Transparent" (`4227:127`).
- Placement (Car Status Panel `4268:3115`): Parked Panel top-right; Parking Sensors Panel top-right (not built — no Parking Sensors state); Driving Panel right of the compact turn card; Driving Collapsed 220 rail above the chicklet; Parked Full at (94, 72) beside the telltales. Not in Driving Full or Parked 116 rail.
- Tap: press feedback only (Q32).

## Map peek — Mask group `4889:40166` (refs `map-peek-{light,dark}`)
- Figma: a map screenshot rotated −14.3°, alpha-masked by a blurred radial ellipse (`src/assets/map/peek-mask.svg`, 655×668, radial gradient opaque centre → 0 at the edge, Gaussian blur). Light group 647×660 @ (1393, −105); Dark 741×735 @ (1372, −289). Build at the midpoint ≈ 694×698 @ (1383, −197) (Q30).
- Build: live `MapTiles` + `RouteLayer` (current mode / nav state) in a box rotated −14.3°, masked by `peek-mask.svg` on a larger wrapper (see Learnings: mask on a wrapper, not on a blurred element). No pan / pinch. Tap → map + Panel (Q29/Q31).

## Move widget — Update 3 (refs `move-panel-{1..4}-light`, `move-full-{1..4}-light`, `move-collapsed-light`)
- Panel: pull-up reveal (Customize at 230.5,228 in anchor/bottom 15,784) → keep holding → pop-out. Move fields: origin = panel widget spot; target "Rectangle 41" 581×180 at (1132, 865) on the map, right of the trip card (trip card 400×192 at map-left 360, bottom). Fields = grey rounded rects (sketch fill — assume `--color-surface-sunken` @ ~60%, confirm in 9.4). Done button replaces Customize.
- Dropped on the map: widget 600×208 docked at the target; the panel shows only the car (no widget).
- Full: origin at the widget's spot (448,819); target right of the Navigate/trip card. After the drop ("smart shuffle" `4889:43408`): trip card 400 at x485, widget 600 at x899, y835 — the pair re-centres (Figma gap 14; build 24 like the rest unless told).
- Collapsed rail (9.6): drop field 88×232 at (20, 802) in the 116 rail; widget docked on the map at anchor/bottom (728, 769) 600 wide.
