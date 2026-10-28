import type { Variants } from 'motion/react';
import { duration, transition } from '../../tokens/motion';

/**
 * Customize open / close choreography (Anastasiya, 2026-10-27). Close is the exact reverse of open.
 * Open:  the lifted widget shrinks into its edit card while the edit frame grows from behind it (out of the
 *        widget's outline); the picker slides up from behind the edit frame; X / label / dots fade in.
 * Close: picker slides back down behind the frame, the frame shrinks back into the widget's outline and the
 *        card grows back to full size — then the real widget bar takes over and settles down.
 * Variant names: 'hidden' (initial + exit) / 'shown'. Positions are relative to the edit frame (16,670 in the panel).
 */

/** Lifted widget window in edit-frame coords: panel (15, 848 − 64) − frame (16, 670). */
export const BAR_IN_FRAME = { left: -1, top: 114, width: 600, height: 192 };
const FRAME = { left: 0, top: 0, width: 598, height: 322 };

/**
 * Open:  0 → 0.4  frame grows + card shrinks · 0.2 → 0.6  picker slides up · 0.2 → 0.45  X / label / dots fade in.
 * Close: mirrored — chrome fades and the picker slides down first, the frame shrinks 0.2 → 0.6.
 */
const STAGGER = 0.2;
/** When the editor has fully gone (close), the real widget bar takes over. */
export const EDITOR_CLOSE_S = STAGGER + duration.slow;

const screenLate = { ...transition.screen, delay: STAGGER };
/** Opacity flips instantly (no ghostly fade): the picker is solid whenever it's on screen. */
const instant = (delay: number) => ({ ...transition.cut, delay });

export const frameBg: Variants = {
  hidden: { ...BAR_IN_FRAME, transition: screenLate },
  shown: { ...FRAME, transition: transition.screen },
};

/**
 * The track view: centred card = the full-size widget sitting where the bar is → its 0.8107 slot.
 * View centre (2 + 297, 69 + 77.8) → bar centre (299, 210): dy 63.2, scale 600 / 486.43.
 */
export const trackView: Variants = {
  hidden: { y: 63.2, scale: 600 / 486.43, transition: screenLate },
  shown: { y: 0, scale: 1, transition: transition.screen },
};

/** X, label, dots, Done: fade in once the frame has mostly grown; fade out first on close. */
export const chrome: Variants = {
  hidden: { opacity: 0, transition: transition.close },
  shown: { opacity: 1, transition: { ...transition.open, delay: STAGGER } },
};

/**
 * Picker: tucked behind the edit frame (its top at the frame's top: 670 − 307), slides up out from behind it.
 * It sits under the frame in the stacking order, so the frame hides it until it rises past the frame's top.
 */
export const picker: Variants = {
  hidden: { y: 670 - 307, opacity: 0, transition: { y: transition.screen, opacity: instant(duration.slow) } },
  shown: { y: 0, opacity: 1, transition: { y: screenLate, opacity: instant(STAGGER) } },
};
