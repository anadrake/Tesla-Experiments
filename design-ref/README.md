# design-ref

Figma reference renders of every screen's **display** (1920×1200, bezel excluded), saved at 1280×800.
Captured 2026-10-26 from file `L4iGjQC6AbgfNfqCAxQnh9`. Re-capture a screen only if the Figma changed.

Remember: Figma may contain bugs — check `docs/WORKLOG.md` › "Figma bugs" before matching something odd.

| File (-light / -dark) | Display node Light | Display node Dark |
|---|---|---|
| map-parked | 4300:1029 | 4300:1223 |
| map-driving | 4583:59434 | 4583:59437 |
| map-parked-expanded | 4655:38295 | 4655:39542 |
| map-driving-expanded | 4693:21304 | 4693:22982 |
| car-status | 4300:25 | 4300:721 |
| car-status-driving | 4588:37159 | 4588:37188 |
| keyboard | 4300:1418 | 4300:1795 |
| quick-actions | 4300:2112 | 4300:2527 |
| navigating | 4300:2840 | 4300:3481 |
| navigating-expanded | 4693:24243 | 4693:25183 |
| settings-search | 4300:19952 | 4300:20657 |
| settings-controls | 4300:21363 | 4300:21848 |
| settings-pedals | 4300:22334 | 4300:22991 |
| settings-display | 4300:23649 | 4300:24320 |
| settings-lights | 4300:24992 | 4300:25689 |

## Widget customization sketches (Phase 8)
Figma Sketches `4766:94038` — **light only, wireframes**, captured 2026-10-27 at 1280 wide. These frames are the **1920×1080 stage only (no control bar)**, so they are 1280×720 (revealed: 1280×768, includes a 23px frame border) — compare the top 1080 design px of a shot.

| File | Sketch frame |
|---|---|
| customize-revealed-light | Swipe up exposes Customize `4802:103109` |
| customize-editing-light | Tap customize `4802:103107` |
| customize-drag-bar-light | Drag widget, insertion bar `4802:103108` |
| customize-drag-slot-light | Drag widget, slot opens `4802:103453` |
| customize-dropped-light | Dropped, placeholder widget `4802:104649` |

## Phase 9 references (captured 2026-10-28, light unless noted)
Specs pulled from these nodes live in `docs/SPECS-P9.md`.

| File | Figma node | Notes |
|---|---|---|
| widgets-set-light | `4901:8483` size review | New widgets in Open / Collapsed / Chicklet / Mini, inside the card |
| widgets-base-light | `4899:2892` `.Widget / new full set` | All 7 widgets × 4 sizes, content only (no card), 1:1 px |
| map-peek-light / -dark | `4889:40430` / `4889:40167` | Car status Full with map peek + Start Self-Driving (2020×1180 incl. frame margin) |
| self-drive-states | `4268:3115` Car Status Panel set | Where the Start Self-Driving button sits per state |
| move-panel-{1..4}-light | `4889:38248` · `40694` · `41114` · `41518` | Move widget, Panel: reveal → fields → dragged → docked on the map |
| move-full-{1..4}-light | `4889:43675` · `43676` · `43677` · `43408` | Move widget, Full: reveal → fields → dragged → smart shuffle |
| move-collapsed-light | `4923:59013` | 9.6 only: move from the Collapsed rail (1920×1200 incl. control bar) |
