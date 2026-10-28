import { animate, useMotionValue, type MotionValue } from 'motion/react';
import { useEffect, useRef, type RefObject } from 'react';
import { capture } from '../../lib/pointer';
import { useStageScale } from '../../shell/Stage';
import { spring, springSnap } from '../../tokens/motion';

/**
 * Pull-up gesture on the widget bar → reveals the Customize button (Figma Sketch 4802:103109).
 *
 * Feels like a compound bow: the bar is heavy at first (moves a fraction of the finger), then at the
 * let-off point it "gives" and snaps the rest of the way up on its own, where it holds. Let go before
 * the let-off and it springs back. Pulling down on a revealed bar works the same way in reverse.
 * After the snap the bar no longer follows the finger — the spring finishes the move on its own.
 * Tune the feel here — all values in design px.
 */
export const LIFT = 64; // revealed: bar sits 64px higher (anchor/bottom 848 → 784)
const AXIS_SLOP = 10; // finger travel before we decide vertical vs horizontal
const HEAVY_GAIN = 0.4; // bar travel per finger px before the let-off
const LET_OFF = 80; // finger px past the slop where the bar gives and snaps up
const CLOSE_LET_OFF = 56; // finger px down from revealed where it gives and snaps back
/** Vertical wins unless the finger went clearly sideways (|dx| > this × |dy|) — diagonal pulls still count. */
const HORIZONTAL_BIAS = 1.3;
/** Screen px a touch must move before we decide whether it's ours (vertical) or the native swipe's. */
const CLAIM_SLOP = 6;

interface Options {
  /** The bar root — needed to stop Safari turning a vertical drag into a native scroll. */
  root: RefObject<HTMLElement>;
  enabled: boolean;
  revealed: boolean;
  onReveal: () => void;
  onHide: () => void;
}

/** Returns the bar's lift (0 = rest, -LIFT = revealed) and pointer handlers for the bar root. */
export function usePullUp({ root, enabled, revealed, onReveal, onHide }: Options): {
  y: MotionValue<number>;
  handlers: Pick<React.DOMAttributes<HTMLElement>, 'onPointerDown' | 'onPointerMove' | 'onPointerUp' | 'onPointerCancel'>;
} {
  const y = useMotionValue(revealed ? -LIFT : 0);
  const scale = useStageScale();
  /** Active gesture. base = bar position when it locked (it may still have been springing). */
  const g = useRef<{
    x: number;
    y: number;
    locked: boolean;
    snapped: boolean;
    fromRevealed: boolean;
    base: number;
  } | null>(null);

  // iPad: the widget list is `touch-action: pan-x`, and Safari decides on the first touchmove whether a
  // touch is a native scroll — if it guesses "scroll" on a slightly diagonal pull it cancels our pointer
  // mid-drag (the bar jumps back, swipe-down "doesn't work"). Claim mostly-vertical touches up front.
  useEffect(() => {
    const el = root.current;
    if (!el || !enabled) return;
    let start: { x: number; y: number } | null = null;
    let claim: boolean | null = null;
    const onStart = (e: TouchEvent) => {
      start = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
      claim = null;
    };
    const onMove = (e: TouchEvent) => {
      if (!start) return;
      if (claim === null) {
        const dx = Math.abs(e.touches[0].clientX - start.x);
        const dy = Math.abs(e.touches[0].clientY - start.y);
        if (Math.hypot(dx, dy) < CLAIM_SLOP) return; // too small to tell; don't decide on jitter
        claim = !(dx > dy * HORIZONTAL_BIAS);
      }
      if (claim && e.cancelable) e.preventDefault();
    };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
    };
  }, [root, enabled]);

  // State changes from elsewhere (tap outside, deep link, Done) settle the bar.
  useEffect(() => {
    if (!g.current) animate(y, revealed ? -LIFT : 0, revealed ? springSnap : spring);
  }, [revealed, y]);

  const settle = (open: boolean, alreadyHeading: boolean) => {
    // A snap already started its spring toward the target — restarting it would kink the motion.
    if (!alreadyHeading) animate(y, open ? -LIFT : 0, open ? springSnap : spring);
    if (open !== revealed) (open ? onReveal : onHide)();
  };

  return {
    y,
    handlers: {
      onPointerDown: (e) => {
        if (!enabled || !e.isPrimary) return;
        g.current = { x: e.clientX, y: e.clientY, locked: false, snapped: false, fromRevealed: revealed, base: 0 };
      },
      onPointerMove: (e) => {
        const s = g.current;
        if (!s) return;
        const dx = (e.clientX - s.x) / scale;
        const dy = (s.y - e.clientY) / scale; // + = finger moved up
        if (!s.locked) {
          if (Math.hypot(dx, dy) < AXIS_SLOP) return;
          // Horizontal → leave it to the native widget swipe. Wrong vertical direction → nothing to do.
          if (Math.abs(dx) > Math.abs(dy) * HORIZONTAL_BIAS || (s.fromRevealed ? dy > 0 : dy < 0)) {
            g.current = null;
            return;
          }
          // Vertical: take the pointer (children lose this tap, which is what we want for a drag).
          // Fall through, so a fast flick that arrives as one or two moves still reaches the let-off.
          s.locked = true;
          // Take over from any spring still running (snap overshoot, spring-back) so it can't fight the finger.
          y.stop();
          s.base = y.get();
          capture(e);
        }
        // Travel is measured past the slop, so the bar doesn't jump when the gesture locks.
        // Once it has snapped, the spring owns the bar until release (no following the finger → no bounce).
        if (s.snapped) return;
        if (!s.fromRevealed) {
          const pull = Math.max(0, dy - AXIS_SLOP);
          if (pull >= LET_OFF) {
            s.snapped = true;
            animate(y, -LIFT, springSnap);
            onReveal();
          } else y.set(Math.max(-LIFT, s.base - pull * HEAVY_GAIN));
        } else {
          const push = Math.max(0, -dy - AXIS_SLOP);
          if (push >= CLOSE_LET_OFF) {
            s.snapped = true;
            animate(y, 0, springSnap);
            onHide();
          } else y.set(Math.min(0, s.base + push * HEAVY_GAIN));
        }
      },
      onPointerUp: () => {
        const s = g.current;
        g.current = null;
        if (!s?.locked) return;
        // Snapped → stays where it snapped to; else springs back to where it started.
        settle(s.snapped ? !s.fromRevealed : s.fromRevealed, s.snapped);
      },
      onPointerCancel: () => {
        const s = g.current;
        g.current = null;
        if (s?.locked) settle(s.snapped ? !s.fromRevealed : s.fromRevealed, s.snapped);
      },
    },
  };
}
