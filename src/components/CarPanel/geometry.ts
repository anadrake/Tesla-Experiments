import type { CarView, WidgetDock } from '../../state/store';

/**
 * Figma "Car Status Panel" (4268:3115) layer rects for Size=Panel (630), Size=Full (1920)
 * and Size=Collapsed (116 on the Map Parked · Expanded screen),
 * in display px. Same-named layers morph between sizes (Smart Animate 0.4s standard).
 * Source: Map Parked (Panel), Car status (Full), Map Parked · Expanded (Collapsed) screens.
 * Opacity 0 = layer hidden in that size. Collapsed defaults to the Panel rect, faded out.
 */
// A type alias (not interface) so it's assignable to motion's `animate` target.
export type Rect = {
  left: number;
  top: number;
  width: number;
  height: number;
  opacity?: number;
};

type Rects = Record<CarView, Rect>;
const pair = (panel: Rect, full: Rect, collapsed?: Rect): Rects => ({
  panel: { opacity: 1, ...panel },
  full: { opacity: 1, ...full },
  collapsed: collapsed ? { opacity: 1, ...collapsed } : { ...panel, opacity: 0 },
});

export const PANEL_WIDTH: Record<CarView, number> = { panel: 630, full: 1920, collapsed: 116 };
/** Map (Main slot) left edge per view — the map widens when the panel collapses. */
export const MAP_LEFT: Record<CarView, number> = { panel: 630, full: 630, collapsed: 116 };

export const scene = {
  shadowPanel: pair(
    { left: -194, top: 540, width: 1054, height: 978, opacity: 1 },
    { left: -20, top: 413, width: 2025, height: 1879, opacity: 0 },
  ),
  shadowFull: pair(
    { left: -270, top: 760, width: 1170, height: 260, opacity: 0 },
    { left: -318, top: 671, width: 2556, height: 678, opacity: 1 },
  ),
  renderPanel: pair(
    { left: 22, top: 443, width: 544, height: 307, opacity: 1 },
    { left: 395, top: 303, width: 1045, height: 590, opacity: 0 },
  ),
  renderFull: pair(
    { left: 45, top: 467, width: 540, height: 270, opacity: 0 },
    { left: 440, top: 250, width: 1040, height: 520, opacity: 1 },
  ),
  /** Flipped + rotated reflection under the Full render (Figma: 6% so it reads as a floor reflection). */
  reflection: pair(
    { left: 50, top: 641, width: 540, height: 270, opacity: 0 },
    { left: 450, top: 584, width: 1040, height: 520, opacity: 0.06 },
  ),
};

/** Callouts — Q7: part name small on top, state bold below. */
export const callouts = {
  lockPanel: pair({ left: 290, top: 354, width: 51, height: 48, opacity: 1 }, { left: 966, top: 113, width: 64, height: 64, opacity: 0 }),
  lockFull: pair({ left: 290, top: 354, width: 51, height: 48, opacity: 0 }, { left: 966, top: 113, width: 64, height: 64, opacity: 1 }),
  lockLine: pair({ left: 315.5, top: 402, width: 0.75, height: 81 }, { left: 998, top: 177, width: 0.75, height: 115 }),
  trunkLine: pair({ left: 495, top: 306, width: 0.75, height: 182 }, { left: 1364, top: 246, width: 0.75, height: 98 }),
  trunkText: pair({ left: 505, top: 306, width: 60, height: 38 }, { left: 1372, top: 253, width: 60, height: 38 }),
  frunkLine: pair({ left: 113, top: 368, width: 0.75, height: 209 }, { left: 574, top: 302, width: 0.75, height: 124 }),
  frunkText: pair({ left: 123, top: 368, width: 60, height: 38 }, { left: 582, top: 301, width: 60, height: 38 }),
  chargeLine: pair({ left: 545, top: 536, width: 17, height: 0.75 }, { left: 1488, top: 426, width: 20, height: 0.75 }),
  charge: pair({ left: 561, top: 521, width: 31.5, height: 30 }, { left: 1496, top: 414, width: 26, height: 25 }),
};

/** Mini Chicklet (size per widget, from the registry), centred in the rail, 16px from the bottom. */
export const chickletRect = (c: { width: number; height: number }): Rect => ({
  left: (116 - c.width) / 2 + 1,
  top: 1080 - 16 - c.height,
  ...c,
  opacity: 1,
});

export const bottom = {
  widgetBar: pair(
    // Panel: 6px below the Figma 848 so it lines up with the map's trip card (854–1046) while driving (Anastasiya).
    { left: 15, top: 854, width: 600, height: 208 },
    { left: 448, top: 819, width: 600, height: 208 },
    { left: 13, top: 972, width: 92, height: 92 }, // Mini Chicklet
  ),
  tripCard: pair(
    { left: 640, top: 854, width: 400, height: 192, opacity: 0 },
    { left: 1072, top: 819, width: 400, height: 192, opacity: 1 },
  ),
};

/** Top-left status bar: PRND fixed at left 24; battery right-aligned (Panel/Full) or gauge under PRND (Collapsed). */
const GAUGE_W = 48; // 45 + tip
export const battery = {
  gauge: pair(
    { left: 630 - 24 - GAUGE_W, top: 22, width: GAUGE_W, height: 20 },
    { left: 260 - 24 - GAUGE_W, top: 22, width: GAUGE_W, height: 20 },
    { left: 24, top: 53, width: GAUGE_W, height: 20 },
  ),
  percent: pair(
    { left: 630 - 24 - GAUGE_W - 8 - 50, top: 21, width: 50, height: 22 },
    { left: 260 - 24 - GAUGE_W - 8 - 50, top: 21, width: 50, height: 22 },
    { left: 24 - 8 - 50, top: 52, width: 50, height: 22, opacity: 0 },
  ),
};

export const telltales = pair(
  { left: 18, top: 84, width: 48, height: 198 },
  { left: 18, top: 84, width: 48, height: 198 },
  { left: 17, top: 127, width: 48, height: 198 },
);

/* ------------------------------------------------------------------ */
/* State=Driving (Navigating / Car status driving / Map driving · Expanded) */
/* ------------------------------------------------------------------ */

/** Collapsed is wider while driving (room for the big speed + Chicklet). */
const PANEL_WIDTH_DRIVING: Record<CarView, number> = { panel: 630, full: 1920, collapsed: 220 };
export const panelWidth = (view: CarView, driving: boolean) => (driving ? PANEL_WIDTH_DRIVING : PANEL_WIDTH)[view];
export const mapLeft = (view: CarView, driving: boolean) => (view === 'collapsed' ? (driving ? 220 : 116) : 630);

/** Car Render Scene=Driving (633×746.5 component), scaled into the centre on Car status. */
export const drivingScene = pair(
  { left: 0, top: 187, width: 633, height: 746.5 },
  { left: 549, top: 40, width: 822.9, height: 970.45 },
);

type Placed = { left: number; top: number; scale: number; opacity: number };
const placed = (panel: Placed, full: Placed, collapsed: Placed): Record<CarView, Placed> => ({ panel, full, collapsed });

/** Speed readout + speed-limit sign (anchor/top-left). The Collapsed rail shows them enlarged. */
export const speed = placed(
  { left: 19, top: 89, scale: 1, opacity: 1 },
  { left: 19, top: 89, scale: 1, opacity: 1 },
  { left: 19, top: 89, scale: 1.83, opacity: 1 },
);
export const speedSign = placed(
  { left: 19, top: 192, scale: 1, opacity: 1 },
  { left: 19, top: 192, scale: 1, opacity: 1 },
  { left: 19, top: 265, scale: 1.98, opacity: 1 },
);
export const telltalesDriving = pair(
  { left: 19, top: 296, width: 48, height: 160 },
  { left: 19, top: 296, width: 48, height: 160 },
  { left: 19, top: 455, width: 48, height: 160 },
);
/**
 * Compact Direction Primary at 0.644 beside the speed. Off-rail (hidden) when collapsed.
 * Unscaled width per size: Panel 410 (= Figma 264, leaves 32px before Start Self-Driving) · Full 464 (= ~299, no button there).
 */
export const directionCardWidth: Record<CarView, number> = { panel: 410, full: 464, collapsed: 410 };
export const directionCard = placed(
  { left: 144, top: 72, scale: 0.644, opacity: 1 },
  { left: 144, top: 72, scale: 0.644, opacity: 1 },
  { left: 247, top: 65, scale: 0.644, opacity: 0 },
);

export const batteryDrivingCollapsed = {
  gauge: { left: 220 - 24 - GAUGE_W, top: 22, width: GAUGE_W, height: 20, opacity: 1 },
  percent: { left: 220 - 24 - GAUGE_W - 8 - 50, top: 21, width: 50, height: 22, opacity: 0 },
};

/** Chicklet (200×208) in the 220 rail while driving. */
export const chickletLargeRect: Rect = { left: 10, top: 862, width: 200, height: 208, opacity: 1 };

/**
 * Start Self-Driving (Button Primary Transparent, Car Status Panel 4268:3115). Its width changes per size, so the
 * label wraps to two lines in the narrow Driving spots, as in Figma. Not in Driving Full or the Parked 116 rail
 * (faded out where it was). Tap = press feedback only (Q32).
 */
export const selfDrive = {
  parked: pair(
    { left: 352, top: 73, width: 256, height: 86 }, // 4889:37307
    { left: 94, top: 72, width: 240, height: 86 }, // New Map 4889:40466
  ),
  driving: pair(
    { left: 440, top: 73, width: 168, height: 86 }, // 4829:108281, right of the compact turn card
    { left: 440, top: 73, width: 168, height: 86, opacity: 0 },
    { left: 20, top: 752, width: 177, height: 86 }, // 4917:58754, above the chicklet
  ),
};

/* ------------------------------------------------------------------ */
/* Widget dock (9.4, Sketches › Update 3)                              */
/* ------------------------------------------------------------------ */

const DOCK_GAP = 24; // map dock: beside the trip card's spot
/** Full: widget ⇄ Navigate / trip card gap, as Figma's smart shuffle (Q39). */
const FULL_GAP = 14;
/** The map's trip card (Map.module.css .tripCard): 16 in from the map's left edge, 464 wide, 854–1046. */
const MAP_TRIP = { inset: 16, width: 464 };
/** Docked on the map: right of the trip card's spot (with or without a trip — Q34), following the map's edge. */
const mapDock = (view: CarView, driving: boolean): Rect => ({
  left: mapLeft(view, driving) + MAP_TRIP.inset + MAP_TRIP.width + DOCK_GAP,
  top: bottom.widgetBar.panel.top,
  width: 600,
  height: 208,
  opacity: 1,
});
/** Full: the widget + Navigate / trip card pair stays centred whichever side the widget is on ("smart shuffle" 4889:43408). */
const FULL_LEFT = (1920 - (600 + FULL_GAP + 400)) / 2; // 453
const FULL = {
  left: { bar: FULL_LEFT, card: FULL_LEFT + 600 + FULL_GAP },
  right: { bar: FULL_LEFT + 400 + FULL_GAP, card: FULL_LEFT },
};

/** Where the widget bar sits. Collapsed: the rail chicklet (`chicklet`), unless it's docked on the map (Q37). */
export function widgetBarRect(view: CarView, driving: boolean, dock: WidgetDock, chicklet = bottom.widgetBar.collapsed): Rect {
  if (dock.panel === 'map' && view !== 'full') return mapDock(view, driving);
  if (view === 'full') return { ...bottom.widgetBar.full, left: FULL[dock.full].bar };
  return view === 'panel' ? bottom.widgetBar.panel : chicklet;
}

/** Car status trip card — it shuffles to keep the pair centred. */
export const tripCardRect = (view: CarView, dock: WidgetDock): Rect =>
  view === 'full' ? { ...bottom.tripCard.full, left: FULL[dock.full].card } : bottom.tripCard[view];

/** A move target: where the 600×192 card lands (top-left), and the dock it stands for. */
export type MoveSpot = { key: string; dock: Partial<WidgetDock>; left: number; top: number };

/**
 * Move fields (9.4): the origin and the other spot. Panel: panel ⇄ map. Full: the target is beside the card where it
 * is now (so it may run off the screen edge, as in Figma 4889:43676 — kept, Q39); the drop then shuffles the pair to centre.
 * Not in the Collapsed rail until 9.6 (Q35).
 */
export function moveSpots(view: CarView, driving: boolean, dock: WidgetDock): MoveSpot[] {
  if (view === 'panel') {
    const { left, top } = bottom.widgetBar.panel;
    const map = mapDock(view, driving);
    return [
      { key: 'panel', dock: { panel: 'panel' }, left, top },
      { key: 'map', dock: { panel: 'map' }, left: map.left, top: map.top },
    ];
  }
  if (view !== 'full') return [];
  const { top } = bottom.widgetBar.full;
  const card = FULL[dock.full].card;
  const other = dock.full === 'left' ? card + 400 + FULL_GAP : card - FULL_GAP - 600;
  return [
    { key: dock.full, dock: { full: dock.full }, left: FULL[dock.full].bar, top },
    { key: dock.full === 'left' ? 'right' : 'left', dock: { full: dock.full === 'left' ? 'right' : 'left' }, left: other, top },
  ];
}

/** Move field (sketch "Rectangle 41"): 581×180, centred on the 600×192 card spot. */
export const MOVE_FIELD = { width: 581, height: 180 };
export const WIDGET_CARD = { width: 600, height: 192 };
