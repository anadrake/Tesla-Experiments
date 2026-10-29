import { animate, useMotionValue, type MotionValue } from 'motion/react';
import { useEffect, useRef, type RefObject } from 'react';
import { capture } from '../../lib/pointer';
import { useStageScale } from '../../shell/Stage';
import { reducible, spring, springSnap } from '../../tokens/motion';

/**
 * Pull-up gesture on the widget bar → reveals the Customize button (Figma Sketch 4802:103109).
 * The same gesture downward (bar at rest) collapses the bar to its pill (Q26) — heavy, then it gives at COLLAPSE_LET_OFF.
 *
 * Feels like a compound bow: the bar is heavy at first (moves a fraction of the finger), then at the
 * let-off point it "gives" and snaps the rest of the way up on its own, where it holds. Let go before
 * the let-off and it springs back. Pulling down on a revealed bar works the same way in reverse.
 * After the snap the bar no longer follows the finger — the spring finishes the move on its own.
 * Keep pulling past the snap and hold → the widget pops out of its socket and the gesture becomes a move (9.4, `pop`).
 * A fresh pull up on the revealed bar builds up to the pop the same way (Q40); let go before it and it stays revealed.
 * Tune the feel here — all values in design px.
 */
export const LIFT = 64; // revealed: bar sits 64px higher (sketch anchor 848 → 784)
const AXIS_SLOP = 10; // finger travel before we decide vertical vs horizontal
const HEAVY_GAIN = 0.4; // bar travel per finger px before the let-off
const LET_OFF = 80; // finger px past the slop where the bar gives and snaps up
const CLOSE_LET_OFF = 56; // finger px down from revealed where it gives and snaps back
const COLLAPSE_LET_OFF = 56; // finger px down from rest where the bar gives and collapses to its pill
/** Vertical wins unless the finger went clearly sideways (|dx| > this × |dy|) — diagonal pulls still count. */
const HORIZONTAL_BIAS = 1.3;
/** Screen px a touch must move before we decide whether it's ours (vertical) or the native swipe's. */
const CLAIM_SLOP = 6;
/**
 * Most speed (design px/s) a snap inherits from the finger. A fast flick hands the spring 1500–2500 px/s and it
 * overshoots 17–36px (the "bounces a lot" on iPad); capped, the overshoot stays ~3px however hard you flick.
 */
const MAX_SNAP_VELOCITY = 300;

/** Move widget hand-off (9.4): past the reveal, the pull drives these instead of the bar. Client px. */
export interface PopHandlers {
  /** Holding at POP_PULL past the let-off this long pops it. */
  pull: number;
  holdMs: number;
  /** 0 → 1 as the finger pulls on past the let-off (before the pop). */
  onTension: (t: number) => void;
  /** `from` = where the finger first pressed (the grab point on the card). */
  onPop: (client: { x: number; y: number }, from: { x: number; y: number }) => void;
  onMove: (client: { x: number; y: number }) => void;
  onEnd: () => void;
}

interface Options {
  /** The bar root — needed to stop Safari turning a vertical drag into a native scroll. */
  root: RefObject<HTMLElement>;
  enabled: boolean;
  revealed: boolean;
  onReveal: () => void;
  onHide: () => void;
  /** Swipe down from rest → collapse (omit to ignore downward pulls at rest). */
  onCollapse?: () => void;
  /** Pop the widget out to move it (omit = no move gesture, e.g. the Collapsed rail until 9.6). */
  pop?: PopHandlers;
  /** Jump (no spring) on the next outside state change — the bar is hidden, e.g. under the closing Customize editor. */
  jump?: boolean;
}

/** Returns the bar's lift (0 = rest, -LIFT = revealed) and pointer handlers for the bar root. */
export function usePullUp({ root, enabled, revealed, onReveal, onHide, onCollapse, pop, jump = false }: Options): {
  y: MotionValue<number>;
  handlers: Pick<React.DOMAttributes<HTMLElement>, 'onPointerDown' | 'onPointerMove' | 'onPointerUp' | 'onPointerCancel'>;
} {
  const y = useMotionValue(revealed ? -LIFT : 0);
  const scale = useStageScale();
  /** Active gesture. base = bar position when it locked (it may still have been springing). */
  const g = useRef<{
    id: number;
    x: number;
    y: number;
    locked: boolean;
    snapped: boolean;
    fromRevealed: boolean;
    /** Pulling down from rest to collapse the bar (not a reveal / hide). */
    collapsing: boolean;
    /** Pulling up on the revealed bar — only towards the pop (Q40). */
    extending: boolean;
    base: number;
    /** Popped out (move mode) — the rest of the gesture is a move. */
    popped: boolean;
    /** Pop hold timer, running while the finger is far enough past the let-off. */
    popTimer?: ReturnType<typeof setTimeout>;
    /** Last finger position (client px) — where the pop happens. */
    cx: number;
    cy: number;
  } | null>(null);
  /** Touch direction decided by the touchmove claim below (null = undecided / not a touch). */
  const touchClaim = useRef<boolean | null>(null);

  // iPad: the widget list is `touch-action: pan-x`, and Safari decides on the first touchmove whether a
  // touch is a native scroll — if it guesses "scroll" on a slightly diagonal pull it cancels our pointer
  // mid-drag (the bar jumps back, swipe-down "doesn't work"). Claim mostly-vertical touches up front.
  useEffect(() => {
    const el = root.current;
    if (!el || !enabled) return;
    let start: { id: number; x: number; y: number } | null = null;
    const onStart = (e: TouchEvent) => {
      // A second finger joining doesn't restart (or steal) the gesture of the first.
      if (e.touches.length > 1) return;
      start = { id: e.touches[0].identifier, x: e.touches[0].clientX, y: e.touches[0].clientY };
      touchClaim.current = null;
    };
    const onMove = (e: TouchEvent) => {
      if (!start) return;
      if (touchClaim.current === null) {
        const t = Array.from(e.touches).find((t) => t.identifier === start!.id);
        if (!t) return; // the pulling finger lifted — another finger can't decide for it
        const dx = Math.abs(t.clientX - start.x);
        const dy = Math.abs(t.clientY - start.y);
        if (Math.hypot(dx, dy) < CLAIM_SLOP) return; // too small to tell; don't decide on jitter
        touchClaim.current = !(dx > dy * HORIZONTAL_BIAS);
      }
      // Keep claiming while any finger moves, so Safari never starts a scroll under an active pull.
      if (touchClaim.current && e.cancelable) e.preventDefault();
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
    if (g.current) return;
    if (jump) y.jump(revealed ? -LIFT : 0);
    else springTo(revealed ? -LIFT : 0, revealed ? springSnap : spring);
  }, [revealed, y]); // `jump` is read when `revealed` flips

  /** Snap / spring to `to`, carrying at most MAX_SNAP_VELOCITY of the finger's speed (toward the target only). */
  const springTo = (to: number, t: typeof spring | typeof springSnap) => {
    const v = y.getVelocity();
    const toward = Math.sign(to - y.get());
    const velocity = Math.sign(v) === toward ? toward * Math.min(Math.abs(v), MAX_SNAP_VELOCITY) : 0;
    animate(y, to, reducible({ ...t, velocity }));
  };

  const settle = (open: boolean, alreadyHeading: boolean) => {
    // A snap already started its spring toward the target — restarting it would kink the motion.
    if (!alreadyHeading) springTo(open ? -LIFT : 0, open ? springSnap : spring);
    if (open !== revealed) (open ? onReveal : onHide)();
  };

  return {
    y,
    handlers: {
      onPointerDown: (e) => {
        if (!enabled || !e.isPrimary) return;
        g.current = {
          id: e.pointerId, x: e.clientX, y: e.clientY, locked: false, snapped: false, fromRevealed: revealed,
          collapsing: false, extending: false, base: 0, popped: false, cx: e.clientX, cy: e.clientY,
        };
      },
      onPointerMove: (e) => {
        const s = g.current;
        // Only the finger that started the pull drives it — a resting thumb / second finger made the bar jump.
        if (!s || e.pointerId !== s.id) return;
        const dx = (e.clientX - s.x) / scale;
        const dy = (s.y - e.clientY) / scale; // + = finger moved up
        if (!s.locked) {
          if (Math.hypot(dx, dy) < AXIS_SLOP) return;
          // On touch, follow the touchmove claim's decision so the two can never disagree (a pull we lock
          // while Safari scrolls gets cancelled mid-way → the bar bounced back). Mouse decides here.
          const touch = e.pointerType === 'touch';
          if (touch && touchClaim.current === null) return; // claim decides on the next touchmove
          const horizontal = touch ? !touchClaim.current : Math.abs(dx) > Math.abs(dy) * HORIZONTAL_BIAS;
          // Horizontal → leave it to the native widget swipe. Wrong vertical direction → nothing to do.
          // Down from rest → collapse, if the bar offers it.
          s.collapsing = !s.fromRevealed && dy < 0 && !!onCollapse;
          // Up on the revealed bar → on towards the pop; it's already where a pull from rest snaps to.
          s.extending = s.fromRevealed && dy > 0 && !!pop;
          s.snapped = s.extending;
          if (horizontal || (!s.collapsing && !s.extending && (s.fromRevealed ? dy > 0 : dy < 0))) {
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
        s.cx = e.clientX;
        s.cy = e.clientY;
        if (s.popped) return pop?.onMove({ x: e.clientX, y: e.clientY });
        // Travel is measured past the slop, so the bar doesn't jump when the gesture locks.
        // Once it has snapped, the spring owns the bar until release (no following the finger → no bounce) —
        // pulling on past it builds up to the pop instead.
        if (s.snapped) {
          if (pop && (s.extending || (!s.fromRevealed && !s.collapsing))) {
            // From rest the pop pull starts at the let-off; on the revealed bar, straight away.
            const past = Math.max(0, dy - AXIS_SLOP - (s.extending ? 0 : LET_OFF));
            pop.onTension(past / pop.pull);
            if (past < pop.pull) {
              clearTimeout(s.popTimer);
              s.popTimer = undefined;
            } else if (!s.popTimer) {
              s.popTimer = setTimeout(() => {
                if (g.current !== s) return;
                s.popped = true;
                pop.onPop({ x: s.cx, y: s.cy }, { x: s.x, y: s.y });
              }, pop.holdMs);
            }
          }
          return;
        }
        if (s.collapsing) {
          const push = Math.max(0, -dy - AXIS_SLOP);
          if (push >= COLLAPSE_LET_OFF) {
            s.snapped = true;
            // The pill pops in at the bar's spot; the lift heads home under it.
            springTo(0, spring);
            onCollapse?.();
          } else y.set(Math.min(LIFT, s.base + push * HEAVY_GAIN));
        } else if (!s.fromRevealed) {
          const pull = Math.max(0, dy - AXIS_SLOP);
          if (pull >= LET_OFF) {
            s.snapped = true;
            springTo(-LIFT, springSnap);
            onReveal();
          } else y.set(Math.max(-LIFT, s.base - pull * HEAVY_GAIN));
        } else {
          const push = Math.max(0, -dy - AXIS_SLOP);
          if (push >= CLOSE_LET_OFF) {
            s.snapped = true;
            springTo(0, springSnap);
            onHide();
          } else y.set(Math.min(0, s.base + push * HEAVY_GAIN));
        }
      },
      onPointerUp: (e) => {
        const s = g.current;
        if (s && e.pointerId !== s.id) return;
        g.current = null;
        if (!s?.locked) return;
        clearTimeout(s.popTimer);
        if (s.popped) return pop?.onEnd();
        if (s.extending || (s.snapped && !s.fromRevealed)) pop?.onTension(0);
        if (s.extending) return; // no pop → still revealed
        if (s.collapsing) {
          if (!s.snapped) springTo(0, spring);
          return;
        }
        // Snapped → stays where it snapped to; else springs back to where it started.
        settle(s.snapped ? !s.fromRevealed : s.fromRevealed, s.snapped);
      },
      onPointerCancel: (e) => {
        const s = g.current;
        if (s && e.pointerId !== s.id) return;
        g.current = null;
        if (!s?.locked) return;
        clearTimeout(s.popTimer);
        if (s.popped) return pop?.onEnd();
        if (s.extending || (s.snapped && !s.fromRevealed)) pop?.onTension(0);
        if (s.extending) return; // no pop → still revealed
        if (s.collapsing) {
          if (!s.snapped) springTo(0, spring);
          return;
        }
        settle(s.snapped ? !s.fromRevealed : s.fromRevealed, s.snapped);
      },
    },
  };
}
