import { animate, useMotionValue, type MotionValue } from 'motion/react';
import { useEffect, useRef } from 'react';
import { capture } from '../../lib/pointer';
import { useStageScale } from '../../shell/Stage';
import { spring, springSnap } from '../../tokens/motion';

/**
 * Pull-up gesture on the widget bar → reveals the Customize button (Figma Sketch 4802:103109).
 *
 * Feels like a compound bow: the bar is heavy at first (moves a fraction of the finger), then at the
 * let-off point it "gives" and snaps the rest of the way up on its own, where it holds. Let go before
 * the let-off and it springs back. Pulling down on a revealed bar works the same way in reverse.
 * Tune the feel here — all values in design px.
 */
export const LIFT = 64; // revealed: bar sits 64px higher (anchor/bottom 848 → 784)
const AXIS_SLOP = 10; // finger travel before we decide vertical vs horizontal
const HEAVY_GAIN = 0.4; // bar travel per finger px before the let-off
const LET_OFF = 80; // finger px past the slop where the bar gives and snaps up
const CLOSE_LET_OFF = 56; // finger px down from revealed where it gives and snaps back
const HOLD_GAIN = 0.15; // rubber band past the open/closed rest positions

interface Options {
  enabled: boolean;
  revealed: boolean;
  onReveal: () => void;
  onHide: () => void;
}

/** Returns the bar's lift (0 = rest, -LIFT = revealed) and pointer handlers for the bar root. */
export function usePullUp({ enabled, revealed, onReveal, onHide }: Options): {
  y: MotionValue<number>;
  handlers: Pick<React.DOMAttributes<HTMLElement>, 'onPointerDown' | 'onPointerMove' | 'onPointerUp' | 'onPointerCancel'>;
} {
  const y = useMotionValue(revealed ? -LIFT : 0);
  const scale = useStageScale();
  const g = useRef<{ x: number; y: number; locked: boolean; snapped: boolean; fromRevealed: boolean } | null>(null);

  // State changes from elsewhere (tap outside, deep link, Done) settle the bar.
  useEffect(() => {
    if (!g.current) animate(y, revealed ? -LIFT : 0, revealed ? springSnap : spring);
  }, [revealed, y]);

  const settle = (open: boolean) => {
    animate(y, open ? -LIFT : 0, open ? springSnap : spring);
    if (open !== revealed) (open ? onReveal : onHide)();
  };

  return {
    y,
    handlers: {
      onPointerDown: (e) => {
        if (!enabled || !e.isPrimary) return;
        g.current = { x: e.clientX, y: e.clientY, locked: false, snapped: false, fromRevealed: revealed };
      },
      onPointerMove: (e) => {
        const s = g.current;
        if (!s) return;
        const dx = (e.clientX - s.x) / scale;
        const dy = (s.y - e.clientY) / scale; // + = finger moved up
        if (!s.locked) {
          if (Math.hypot(dx, dy) < AXIS_SLOP) return;
          // Horizontal → leave it to the native widget swipe. Wrong vertical direction → nothing to do.
          if (Math.abs(dx) > Math.abs(dy) || (s.fromRevealed ? dy > 0 : dy < 0)) {
            g.current = null;
            return;
          }
          // Vertical: take the pointer (children lose this tap, which is what we want for a drag).
          // Fall through, so a fast flick that arrives as one or two moves still reaches the let-off.
          s.locked = true;
          capture(e);
        }
        // Travel is measured past the slop, so the bar doesn't jump when the gesture locks.
        if (!s.fromRevealed) {
          const pull = Math.max(0, dy - AXIS_SLOP);
          if (!s.snapped && pull >= LET_OFF) {
            s.snapped = true;
            animate(y, -LIFT, springSnap);
            onReveal();
          }
          if (!s.snapped) y.set(-pull * HEAVY_GAIN);
          else if (!y.isAnimating()) y.set(-LIFT - Math.max(0, pull - LET_OFF) * HOLD_GAIN);
        } else {
          const push = Math.max(0, -dy - AXIS_SLOP);
          if (!s.snapped && push >= CLOSE_LET_OFF) {
            s.snapped = true;
            animate(y, 0, springSnap);
            onHide();
          }
          if (!s.snapped) y.set(-LIFT + push * HEAVY_GAIN);
          else if (!y.isAnimating()) y.set(Math.max(0, push - CLOSE_LET_OFF) * HOLD_GAIN);
        }
      },
      onPointerUp: () => {
        const s = g.current;
        g.current = null;
        if (!s?.locked) return;
        // Snapped → stays where it snapped to; else springs back to where it started.
        settle(s.snapped ? !s.fromRevealed : s.fromRevealed);
      },
      onPointerCancel: () => {
        const s = g.current;
        g.current = null;
        if (s?.locked) settle(s.snapped ? !s.fromRevealed : s.fromRevealed);
      },
    },
  };
}
