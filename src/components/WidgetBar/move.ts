import { animate, motionValue } from 'motion/react';
import { create } from 'zustand';
import { isDriving, useHud } from '../../state/store';
import { reducible, spring, springSnap, transition } from '../../tokens/motion';
import { WIDGET_CARD, moveSpots, widgetBarRect, type MoveSpot } from '../CarPanel/geometry';

/**
 * Move widget (9.4, Sketches › Update 3). Keep pulling up past the Customize reveal and hold → the widget pops out of
 * its socket (usePullUp hands over), Done replaces Customize and grey move fields show where it can go (geometry.ts
 * moveSpots). It follows the finger; on release it snaps into the field nearest the card (or back to where it was) and
 * move mode ends. Let go without dragging → move mode stays (Q38): press and drag it again, or Done / tap outside.
 *
 * The widget bar itself moves (no ghost copy): `move` is its offset from the docked spot, in design px. When a drop
 * changes the dock, WidgetLayer jumps the bar's base to the new spot and `rebase` keeps it visually still, then the
 * offset springs home (settleMove). Transient, so not in the HUD store (only the result — widgetDock — is).
 */

/** Interaction thresholds (design px / ms), not motion durations. */
export const POP_PULL = 60; // extra finger travel past the reveal let-off before the widget can pop
export const POP_HOLD_MS = 300; // …held there this long → pop
const DRAG_SLOP = 8; // a press in move mode becomes a drag after this
/** A field takes the drop when the card's centre is within this of the field's centre. */
const REACH = 300;
/** Lifted out of the socket. Before the pop the pull stretches it up to POP_TENSION (the "socket" resisting). */
const POP_SCALE = 1.04;
const POP_TENSION = 1.015;

export const move = {
  x: motionValue(0),
  y: motionValue(0),
  scale: motionValue(1),
  /** 0 → 1: the extra lift shadow. */
  lifted: motionValue(0),
};

interface MoveState {
  /** Finger down on the popped widget. */
  dragging: boolean;
  /** Key of the field the widget would drop into now (MoveSpot.key). */
  target: string | null;
}
export const useMove = create<MoveState>()(() => ({ dragging: false, target: null }));

let start = { x: 0, y: 0 };
let base = { x: 0, y: 0 };
let stage = 1;
let travelled = false;
/** Catching up with the finger after the pop (springs, then follows 1:1). */
let chasing = false;
/** Where the finger wants the card (offset) — targeting uses this, not the card while it's still catching up. */
let want = { x: 0, y: 0 };

function follow(to: { x: number; y: number }) {
  want = to;
  if (!chasing) {
    move.x.set(to.x);
    move.y.set(to.y);
    return;
  }
  animate(move.x, to.x, reducible(springSnap));
  animate(move.y, to.y, { ...reducible(springSnap), onComplete: () => (chasing = false) });
}

const spots = (): MoveSpot[] => {
  const s = useHud.getState();
  return moveSpots(s.carView, isDriving(s), s.widgetDock);
};

/** The dragged card's centre in display px, where the finger has it (the bar is lifted by `lift` — usePullUp's y). */
function cardCentre(lift: number) {
  const s = useHud.getState();
  const r = widgetBarRect(s.carView, isDriving(s), s.widgetDock);
  return { x: r.left + WIDGET_CARD.width / 2 + want.x, y: r.top + lift + WIDGET_CARD.height / 2 + want.y };
}

function nearest(lift: number) {
  const c = cardCentre(lift);
  let best: MoveSpot | null = null;
  let bestD = REACH;
  for (const s of spots()) {
    const d = Math.hypot(c.x - (s.left + WIDGET_CARD.width / 2), c.y - (s.top + WIDGET_CARD.height / 2));
    if (d < bestD) [best, bestD] = [s, d];
  }
  return best;
}

/** Pull past the reveal, before the pop: 0 → 1 stretches the widget a little. */
let lastTension = 0;
export function tension(t: number) {
  t = Math.min(1, Math.max(0, t));
  if (t === lastTension) return;
  lastTension = t;
  if (t === 0) animate(move.scale, 1, reducible(spring)); // eased off (or let go) before the pop
  else move.scale.set(1 + (POP_TENSION - 1) * t);
}

/** Lifted out of the socket (pop, or move mode opened from a deep link). */
export function liftOut() {
  lastTension = 0;
  if (move.lifted.get() > 0) return;
  // A quick overshoot past the lifted size — the "out of a socket" click.
  animate(move.scale, POP_SCALE, reducible({ ...springSnap, velocity: 1.2 }));
  animate(move.lifted, 1, reducible(transition.open));
}

/**
 * Pop out of the socket and start move mode. The finger is at `client`, having pressed the card at `from` (client px;
 * `scale` = stage scale, `lift` = usePullUp's y). The card jumps up to put the spot you pressed back under the finger.
 */
export function popOut(client: { x: number; y: number }, from: { x: number; y: number }, scale: number, lift: number) {
  grab(client, scale);
  base = { x: (client.x - from.x) / scale, y: (client.y - from.y) / scale - lift };
  chasing = true;
  follow(base);
  liftOut();
  useHud.getState().setCustomize('moving');
  useMove.setState({ target: spots()[0]?.key ?? null });
}

/** Finger down on the popped widget (move mode). */
export function grab(client: { x: number; y: number }, scale: number) {
  move.x.stop();
  move.y.stop();
  start = client;
  base = { x: move.x.get(), y: move.y.get() };
  want = base;
  stage = scale;
  travelled = false;
  chasing = false;
  useMove.setState({ dragging: true });
}

export function dragTo(client: { x: number; y: number }, lift: number) {
  if (!useMove.getState().dragging) return;
  const dx = (client.x - start.x) / stage;
  const dy = (client.y - start.y) / stage;
  if (!travelled && Math.hypot(dx, dy) < DRAG_SLOP) return;
  travelled = true;
  follow({ x: base.x + dx, y: base.y + dy });
  const key = nearest(lift)?.key ?? null;
  if (key !== useMove.getState().target) useMove.setState({ target: key });
}

/** Finger up. A drag drops into the nearest field (else back where it was) and ends move mode; a press doesn't. */
export function release(lift: number) {
  if (!useMove.getState().dragging) return;
  useMove.setState({ dragging: false });
  chasing = false;
  if (!travelled) {
    // Back into its lifted spot, still in move mode.
    animate(move.x, 0, reducible(springSnap));
    animate(move.y, 0, reducible(springSnap));
    return;
  }
  const to = nearest(lift) ?? spots()[0];
  const { setWidgetDock, setCustomize } = useHud.getState();
  // One update: WidgetLayer rebases on the new dock, then the bar settles into it as move mode ends.
  if (to) setWidgetDock(to.dock);
  setCustomize('off');
}

/** The bar's docked spot jumped by (dx, dy) — keep it where it is on screen. */
export function rebase(dx: number, dy: number) {
  move.x.jump(move.x.get() - dx);
  move.y.jump(move.y.get() - dy);
}

/** Move mode ended (drop, Done, tap outside): back into the socket. */
export function settleMove() {
  useMove.setState({ dragging: false, target: null });
  animate(move.x, 0, reducible(springSnap));
  animate(move.y, 0, reducible(springSnap));
  animate(move.scale, 1, reducible(spring));
  animate(move.lifted, 0, reducible(transition.close));
}
