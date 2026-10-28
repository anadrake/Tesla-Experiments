import type { CarView } from '../../state/store';

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
    { left: 15, top: 848, width: 600, height: 208 },
    { left: 448, top: 819, width: 600, height: 208 },
    { left: 13, top: 972, width: 92, height: 92 }, // Mini Chicklet
  ),
  tripCard: pair(
    { left: 640, top: 848, width: 400, height: 192, opacity: 0 },
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
/** Compact Direction Primary (464-wide card at 0.644) beside the speed. Off-rail (hidden) when collapsed. */
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
