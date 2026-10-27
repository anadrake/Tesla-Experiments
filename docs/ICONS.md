# Figma icon index (Icons page `4221:18851`)

Node IDs of every icon component, so no session needs to re-read the Icons page.
Colors are bound to `icon/*` (or `status/*` for telltales) → render glyphs via `Icon` with a token color.
`pictogram/*` have fixed colors → `<img>`. Export with `download_assets` (defaultFormat svg) and strip the page/doc-card layers (see COMPONENTS.md › Asset notes).

| Category | Icons (name → node) |
|---|---|
| settings | autopilot(eye) 347:12790 · charging 347:12821 · controls 347:12797 · display 347:12801 · lights 347:12805 · locks 347:12811 · navigation 347:12835 · pedals-steering 347:12815 · safety 347:12786 · service 347:12782 · software 347:12779 · trips 347:12795 · upgrades 347:12846 |
| ui | chevron-down 347:12852 · chevron-up 347:12850 · globe 37:6698 · profile 50:16767 · search 347:12840 · arrow-up 4221:19031 · arrow-down 4221:19036 · check 4228:18982 · plus 4228:18989 · minus 4228:18996 · chevron-left 4228:19003 · chevron-right 4228:19010 · close 4228:19017 · info 4228:19026 · backspace 4292:22 |
| media (40px) | equalizer 40:16258 · favorite 48:10358 · next 48:10383 · pause 48:10355 · play 40:16702 · previous 40:16680 · thumbs-down 48:10255 · thumbs-up 48:10254 · volume(48) 48:8188 · microphone 4292:27 · spotify 4469:43610 |
| status (16–24px) | signal 48:8359 · update 4222:20092 · notification 4222:20104 · bluetooth 4222:20116 · wifi 4222:20144 · alarm 4222:20162 |
| vehicle | auto-high-beam 49:33481 · brightness 4221:2991 · child-lock 114:23084 · dashcam 114:23512 · fog-lights 97:17798 · mirrors 114:23016 · model-3 347:12828 · sentry 114:23522 / 4297:16469 · steering-adjust 114:23491 · wipers 4221:2994 |
| telltale (status colors) | airbag 4221:2995 · fog-front 49:33489 · low-beam 49:33482 · seatbelt 49:33490 |
| map | compass 50:8807 · heading 347:12842 · location 37:6737 · supercharger 37:6771 · traffic 37:6718 |
| nav (80×70) | turn-left 99:16585 · intersection-left 99:16573 |
| pictogram/map | highway-shield 11:3945 · marker-cross 11:3984 · marker-destination 11:3986 · marker-park 11:3985 · marker-spotlight 11:3983 · nav-arrow 11:4084 |
| pictogram/telltale | airbag-off-badge 4221:19111 |
| pictogram/vehicle | model-3-top 4265:2785 |
| climate | defrost-front 52:28917 · defrost-rear 52:28918 · seat-heat 52:28973 · steering-heat 52:28919 |
| pictogram/app | dashcam 27:6340 · tunein 12:11040 · calendar 12:10906 · messages 26:6046 · theater 12:11034 · toybox 27:6400 · spotify 12:10934 · caraoke 27:6377 · music 27:8419 · zoom 55:13147 · phone 12:10905 · bluetooth 12:10921 · camera 40:9499 |

Other components: Dynamic Widget Bar set `4416:12286` (Active=Music/Odometer/Tire × Dot Nav × Size=Open/Collapsed/Chicklet/Mini Chicklet) · `.Widget` `4396:41131` · `.Dot` `4367:37979` · Car Render `4266:2837` · Car Status Panel `4268:3115` · Map Tiles `4269:2425`.
