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

export const spring = { type: 'spring', mass: 1, stiffness: 300, damping: 30 } as const;

/**
 * Snappier spring with a little overshoot (ζ ≈ 0.6) for things that "click" into place:
 * the widget bar's let-off snap, dragged icons settling. Not a Figma token (Figma has one spring) — logged in WORKLOG.
 */
export const springSnap = { type: 'spring', mass: 1, stiffness: 500, damping: 28 } as const;

/** Ready-made transitions for motion components. */
export const transition = {
  press: { duration: duration.instant },
  /** A hard cut (hand-offs between two elements showing the same thing). */
  cut: { duration: 0 },
  toggle: { duration: duration.fast, ease: easing.standard },
  open: { duration: duration.base, ease: easing.enter },
  close: { duration: duration.base, ease: easing.exit },
  screen: { duration: duration.slow, ease: easing.standard },
  dayNight: { duration: duration.deliberate, ease: easing.standard },
  /** Three blinks, one `slow` each (presets.flash). */
  flash: { duration: duration.slow * 3, ease: 'linear' },
} as const;

/** Figma animation styles (Motion/…) as motion variants. */
export const presets = {
  fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  slideUpIn: { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } },
  slideInFromLeft: { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' } },
  popIn: { initial: { opacity: 0, scale: 0.92 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.92 } },
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
