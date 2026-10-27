import type { CarView } from '../../state/store';

/**
 * Figma "Car Status Panel" (4268:3115) layer rects for Size=Panel (630) and Size=Full (1920),
 * in display px. Same-named layers morph between sizes (Smart Animate 0.4s standard).
 * Source: Map Parked (Panel) and Car status (Full) screens. Opacity 0 = layer hidden in that size.
 */
// A type alias (not interface) so it's assignable to motion's `animate` target.
export type Rect = {
  left: number;
  top: number;
  width: number;
  height: number;
  opacity?: number;
};

type Pair = Record<CarView, Rect>;
const pair = (panel: Rect, full: Rect): Pair => ({ panel, full });

export const PANEL_WIDTH: Record<CarView, number> = { panel: 630, full: 1920 };

export const scene = {
  shadowPanel: pair(
    { left: -194, top: 540, width: 1054, height: 978, opacity: 1 },
    { left: -20, top: 413, width: 2025, height: 1879, opacity: 0 },
  ),
  shadowFull: pair(
    { left: -270, top: 760, width: 1170, height: 260, opacity: 0 },
    { left: -547, top: 671, width: 3014, height: 678, opacity: 1 },
  ),
  renderPanel: pair(
    { left: 22, top: 443, width: 544, height: 307, opacity: 1 },
    { left: 395, top: 303, width: 1045, height: 590, opacity: 0 },
  ),
  renderFull: pair(
    { left: 45, top: 467, width: 540, height: 270, opacity: 0 },
    { left: 440, top: 250, width: 1040, height: 520, opacity: 1 },
  ),
  /** Flipped + rotated reflection under the Full render. */
  reflection: pair(
    { left: 50, top: 641, width: 540, height: 270, opacity: 0 },
    { left: 487, top: 584, width: 1040, height: 520, opacity: 0.15 },
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

export const bottom = {
  widgetBar: pair({ left: 15, top: 848, width: 600, height: 208 }, { left: 448, top: 819, width: 600, height: 208 }),
  tripCard: pair(
    { left: 640, top: 848, width: 400, height: 192, opacity: 0 },
    { left: 1072, top: 819, width: 400, height: 192, opacity: 1 },
  ),
};

/** Top-left status bar: PRND left, battery right. */
export const statusBarWidth: Record<CarView, number> = { panel: 630, full: 260 };
