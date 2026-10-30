import { animate, motionValue } from 'motion/react';
import { useHud } from '../../state/store';
import { reducible, transition } from '../../tokens/motion';

/**
 * Front Climate sheet position (Phase 10.5). `sheetY` = how far the 840-tall panel is pushed down below its open
 * spot (0 = open, SHEET_H = tucked under the control bar). Finger-driven, so a motion value outside the store:
 * swipe up on the control bar opens it (Q43), dragging its top rows down closes it.
 */
export const SHEET_H = 840;
export const sheetY = motionValue(SHEET_H);

/** Interaction thresholds (design px, design px / ms) — not motion durations. */
export const SHEET_SLOP = 10; // finger travel before a press becomes a sheet drag
const SHEET_COMMIT = 200; // dragged this far → the sheet goes the rest of the way
const SHEET_FLICK = 0.6; // …or flicked at least this fast

let dragging = false;
export const isSheetDragging = () => dragging;

/** A drag takes the sheet: mounts it (tucked away) if it was closed. */
export function grabSheet() {
  dragging = true;
  sheetY.stop();
  if (!useHud.getState().climateOpen) {
    sheetY.jump(SHEET_H);
    useHud.getState().setClimateOpen(true);
  }
}

/** Follow the finger: `offset` = distance below the open spot. */
export function dragSheet(offset: number) {
  sheetY.set(Math.min(SHEET_H, Math.max(0, offset)));
}

/**
 * Let go. `travel` = how far the finger moved in the gesture's direction, `velocity` likewise (design px / ms);
 * `opening` = the gesture started from the control bar (up) rather than on the sheet (down).
 */
export function releaseSheet(opening: boolean, travel: number, velocity: number) {
  dragging = false;
  const commit = travel > SHEET_COMMIT || velocity > SHEET_FLICK;
  const open = opening ? commit : !commit;
  if (open) animate(sheetY, 0, reducible(transition.sheetOpen));
  else
    animate(sheetY, SHEET_H, {
      ...reducible(transition.sheetClose),
      onComplete: () => useHud.getState().setClimateOpen(false),
    });
}

/** Opened some other way (deep link, a test): slide in from under the control bar. */
export function slideSheetIn() {
  if (dragging) return;
  animate(sheetY, 0, reducible(transition.sheetOpen));
}
