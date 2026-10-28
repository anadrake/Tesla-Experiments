/**
 * Customize mode geometry in editor coordinates (= car panel coordinates, design px; in Full the whole editor is
 * moved with the widget bar, so these stay the same). Sketch "Tap customize" 4802:103107.
 */

/** Edit frame (4802:104705): 16,670 · 598×322. */
export const FRAME = { left: 16, top: 670, width: 598, height: 322 };
/** "list" view inside the frame: 2,69 · 594×156. */
export const VIEW = { left: 2, top: 69, width: 594, height: 156 };

/** Track cards: the 600×192 widget at 0.8107, 20px apart, centred with the neighbours peeking. */
export const CARD_SCALE = 486.43 / 600;
export const CARD_W = 600 * CARD_SCALE;
export const CARD_H = 192 * CARD_SCALE;
export const CARD_GAP = 20;
export const PITCH = CARD_W + CARD_GAP;
/** Strip offset (view coords) that centres card 0. */
export const FIRST_X = (VIEW.width - CARD_W) / 2;

/** Strip x (view coords) for a page. */
export const stripX = (page: number) => FIRST_X - page * PITCH;

/** Centre of gap `g` (before track[g]; g = length → after the last) in strip coords. */
export const gapInStrip = (g: number) => g * PITCH - CARD_GAP / 2;

/** Strip coords → editor coords. */
export const STRIP_ORIGIN = { x: FRAME.left + VIEW.left, y: FRAME.top + VIEW.top };

/** Centre of the centred (current-page) card in editor coords. */
export const CENTRE_CARD = { x: STRIP_ORIGIN.x + FIRST_X + CARD_W / 2, y: STRIP_ORIGIN.y + CARD_H / 2 };

/** Insertion bar (4802:103108 "Rectangle 1": 13×144) and drop slot (4802:103453: 79×158, status/info @ 40%). */
export const BAR = { width: 13, height: 144 };
export const SLOT = { width: 79, height: 158 };
/** How far the neighbours move apart around an open gap (sketches: ~50 for the bar, ~110 for the slot). */
export const GAP_OPEN = { bar: 50 - CARD_GAP, slot: 110 - CARD_GAP };
