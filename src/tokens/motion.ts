/**
 * Motion tokens — Figma Foundations › Motion. Always use these; never hard-code durations/easings.
 *
 * Usage map (Figma Screens read-me):
 *   press feedback ............ duration.instant
 *   toggles, tab switches ..... duration.fast  + easing.standard
 *   opening controls/overlays . duration.base  + easing.enter
 *   screen changes, panel morph duration.slow  + easing.standard
 *   Day/Night dissolve ........ duration.deliberate
 *   snap into place ........... springSnap (widget pull-up let-off, dragged icons settling)
 *   "already there" warning ... presets.flash + transition.flash (blinks 3×)
 */
export const duration = {
  instant: 0.1,
  fast: 0.15,
  base: 0.25,
  slow: 0.4,
  deliberate: 0.6,
} as const;

export const easing = {
  standard: [0.2, 0, 0, 1],
  enter: [0, 0, 0.2, 1],
  exit: [0.4, 0, 1, 1],
} as const satisfies Record<string, [number, number, number, number]>;

/**
 * Reduce Motion for `transform` strings: MotionConfig reducedMotion="user" only cuts x / y / scale / left / width…,
 * not a `transform` key — so every transition token carries a live per-value override that cuts `transform` while
 * Reduce Motion is on (motion reads `transition.transform` first). Opacity and colour still fade. Enumerable, so
 * spreads (`{ ...transition.open, delay }`) keep it.
 */
const cutsTransform = <T extends object>(t: T): T =>
  Object.defineProperty(t, 'transform', {
    enumerable: true,
    get: () => (prefersReducedMotion() ? { duration: 0 } : undefined),
  });

export const spring = cutsTransform({ type: 'spring', mass: 1, stiffness: 300, damping: 30 } as const);

/**
 * Snappier spring with a little overshoot (ζ ≈ 0.6) for things that "click" into place:
 * the widget bar's let-off snap, dragged icons settling. Not a Figma token (Figma has one spring) — logged in WORKLOG.
 */
export const springSnap = cutsTransform({ type: 'spring', mass: 1, stiffness: 500, damping: 28 } as const);

/** Ready-made transitions for motion components. */
export const transition = {
  press: cutsTransform({ duration: duration.instant }),
  /** A hard cut (hand-offs between two elements showing the same thing). */
  cut: cutsTransform({ duration: 0 }),
  toggle: cutsTransform({ duration: duration.fast, ease: easing.standard }),
  open: cutsTransform({ duration: duration.base, ease: easing.enter }),
  close: cutsTransform({ duration: duration.base, ease: easing.exit }),
  /** Full-height sheets (the keyboard): `open` / `close` easing over `slow` — they travel further. */
  sheetOpen: cutsTransform({ duration: duration.slow, ease: easing.enter }),
  sheetClose: cutsTransform({ duration: duration.slow, ease: easing.exit }),
  screen: cutsTransform({ duration: duration.slow, ease: easing.standard }),
  /** Fade out in place → jump → fade in at the new spot (lib/fadeSwap.ts): the opacity dip (4 keyframes)… */
  // Ease per segment (an array): a single ease spans the whole keyframe set on WAAPI but each segment in JS, so the
  // compositor fade and a JS-driven jump would part ways.
  fadeSwap: cutsTransform({ duration: duration.slow, ease: [easing.standard, 'linear', easing.standard], times: [0, 0.5, 0.5, 1] }),
  /** …and the jump, at its midpoint (position values; keyframes there flashed the start value for a frame on finish). */
  fadeSwapJump: { duration: 0, delay: duration.slow / 2 },
  dayNight: cutsTransform({ duration: duration.deliberate, ease: easing.standard }),
  /** Three blinks, one `slow` each (presets.flash). */
  flash: cutsTransform({ duration: duration.slow * 3, ease: 'linear' }),
} as const;

/**
 * Figma animation styles (Motion/…) as motion variants. Moves are written as `transform` strings, not `x` / `y` /
 * `scale`: motion runs `transform` + `opacity` on the compositor (WAAPI), which keeps iPad's 120Hz, while `x` / `y` /
 * `scale` (and left / top / width) run in JS, which Safari caps at 60fps — that read as choppy (perf, 9.5).
 */
export const presets = {
  fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  slideUpIn: {
    initial: { transform: 'translateY(100%)' },
    animate: { transform: 'translateY(0%)' },
    exit: { transform: 'translateY(100%)' },
  },
  slideInFromLeft: {
    initial: { transform: 'translateX(-100%)' },
    animate: { transform: 'translateX(0%)' },
    exit: { transform: 'translateX(-100%)' },
  },
  popIn: {
    initial: { opacity: 0, transform: 'scale(0.92)' },
    animate: { opacity: 1, transform: 'scale(1)' },
    exit: { opacity: 0, transform: 'scale(0.92)' },
  },
  /** Not a Figma style: the "already on the track" blink (Customize, Phase 8 — logged in WORKLOG). */
  flash: { opacity: [1, 0.35, 1, 0.35, 1, 0.35, 1] as number[] },
} as const;

/**
 * Reduce Motion (iPad Settings › Accessibility). Motion components follow it via <MotionConfig reducedMotion="user">
 * (transforms jump), but imperative `animate()` calls don't — pass their transition through `reducible`, so
 * springs and slides become cuts (anything the finger drags still follows the finger).
 */
export const prefersReducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
export const reducible = <T extends object>(t: T): T | typeof transition.cut => (prefersReducedMotion() ? transition.cut : t);
