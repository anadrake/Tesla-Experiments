import type { Variants } from 'motion/react';
import { duration, easing } from '../../tokens/motion';

/**
 * Customize open / close choreography (Anastasiya, 2026-10-27): everything moves at once, one duration, one curve.
 * Open:  the lifted widget shrinks into its edit card while the edit frame grows out of the widget's outline,
 *        the picker slides up out from behind the frame's top edge, and X / label / dots / Done fade in.
 * Close: the reverse, into the bar's resting spot — so the bar takes over already settled (nothing drops or pops).
 * Variant names: 'lifted' (initial: where the bar was when Customize was tapped) / 'shown' / 'rest' (exit).
 * Positions are relative to the edit frame (16,670 in the panel) unless noted.
 */

const MORPH = { duration: duration.base, ease: easing.standard };
/** When the editor has fully gone (close), the real widget bar takes over. */
export const EDITOR_CLOSE_S = MORPH.duration;

const LIFT = 64;
const FRAME_TOP = 670; // edit frame top in the panel
/** Widget window in edit-frame coords: panel (15, 848 [− 64 lifted]) − frame (16, 670). */
const BAR = { left: -1, top: 848 - FRAME_TOP, width: 600, height: 192 };
const FRAME = { left: 0, top: 0, width: 598, height: 322 };

const at = (transition: object, values: object) => ({ ...values, transition });

/**
 * The frame also fades in / out: at the widget's outline its panel shadow would sit right behind the card's own
 * and double it (a dark flash at the hand-off — Anastasiya). On close it's gone by the time it's nearly that small
 * (the shrink is front-loaded too).
 */
export const frameBg: Variants = {
  lifted: { ...BAR, top: BAR.top - LIFT, opacity: 0 },
  shown: at(MORPH, { ...FRAME, opacity: 1 }),
  rest: {
    ...BAR,
    opacity: 0,
    transition: { ...MORPH, opacity: { duration: duration.fast, ease: easing.standard } },
  },
};

/**
 * The track view: centred card = the full-size widget sitting where the bar is → its 0.8107 slot.
 * View centre (2 + 297, 69 + 77.8) → lifted bar centre (299, 210): dy 63.2 (+64 at rest), scale 600 / 486.43.
 */
const VIEW_DY = 63.2;
const VIEW_SCALE = 600 / 486.43;
export const trackView: Variants = {
  lifted: { y: VIEW_DY, scale: VIEW_SCALE },
  shown: at(MORPH, { y: 0, scale: 1 }),
  rest: at(MORPH, { y: VIEW_DY + LIFT, scale: VIEW_SCALE }),
};

/** X, label, dots, Done. */
export const chrome: Variants = {
  lifted: { opacity: 0 },
  shown: at(MORPH, { opacity: 1 }),
  rest: at(MORPH, { opacity: 0 }),
};

/**
 * The picker slides out from behind the edit frame's top edge: its clip (panel coords, top 0) ends at the
 * frame's top and moves with it, and the picker's top rides that edge — so it's solid, never faded, and
 * never shows below the frame (no pop when the frame is smaller than the picker).
 */
const PICKER_TOP = 307;
const frameTop = (lifted: boolean) => FRAME_TOP + BAR.top - (lifted ? LIFT : 0);
export const pickerClip: Variants = {
  lifted: { height: frameTop(true) },
  shown: at(MORPH, { height: FRAME_TOP }),
  rest: at(MORPH, { height: frameTop(false) }),
};
/** Close also fades it out, mostly towards the end (exit ease), so it melts away behind the frame (Anastasiya). */
export const picker: Variants = {
  lifted: { y: frameTop(true) - PICKER_TOP, opacity: 1 },
  shown: at(MORPH, { y: 0, opacity: 1 }),
  rest: {
    y: frameTop(false) - PICKER_TOP,
    opacity: 0,
    transition: { ...MORPH, opacity: { duration: MORPH.duration, ease: easing.exit } },
  },
};
