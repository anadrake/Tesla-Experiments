import { animate, motionValue } from 'motion/react';
import { create } from 'zustand';
import { useHud } from '../../state/store';
import type { WidgetId } from '../../state/widgets';
import { springSnap, transition } from '../../tokens/motion';
import { CARD_H, CARD_W, CENTRE_CARD, FRAME, STRIP_ORIGIN, gapInStrip, stripX } from './geometry';

/**
 * Customize drag & drop (Phase 8.3, Sketches 4802:103108 / 103453 / 104649).
 * Drag an app icon from the picker, or hold a track card 0.3s (Q19) and drag it, to a gap between cards:
 * nearing a gap shows the blue insertion bar, staying there opens it into a drop slot (the icon settles into it).
 * Drop on a gap → insert / move there and page to it. Only gaps are targets (Q20). An app already on the track
 * dropped next to itself → nothing changes, its card blinks 3× and the icon floats back. Anywhere else → floats back.
 *
 * Transient UI state (not deep-linked), so it lives here rather than in the HUD store. Positions are editor
 * coordinates (= panel design px, see geometry.ts); pointer sources call start / move / drop / cancel.
 */

export type DragSource = { kind: 'picker'; id: WidgetId } | { kind: 'track'; id: WidgetId; index: number };
export type GapTarget = { gap: number; mode: 'bar' | 'slot' };

/** Interaction timings (not motion durations). */
export const HOLD_MS = 300; // track card hold before it lifts (Q19)
const SLOT_DWELL_MS = 350; // bar → slot after hovering the same gap this long
const EDGE_DWELL_MS = 550; // hovering a track end this long pages the track
export const DRAG_SLOP = 8; // design px before a press becomes a drag

/** A gap is "near" within this of its centre (the cards between gaps are not targets). */
const GAP_REACH = 150;
const GAP_KEEP = GAP_REACH + 24; // hysteresis: keep the current gap a little longer
/** Vertical band (editor y) where the track takes drops: from just above the edit frame to its dots. */
const BAND = { top: FRAME.top - 40, bottom: FRAME.top + 300 };
/** Past the outer gaps, towards the frame's edges: page the track (the peeking neighbour). */
const EDGE = { left: FRAME.left + 24, right: FRAME.left + FRAME.width - 24 };

/** Track cards lift a little when held (Q19), then shrink while dragged so the gaps stay visible. */
export const GHOST_SCALE = { lifted: 1.04, dragging: 0.6 };

interface DragState {
  source: DragSource | null;
  /** 'drag' while the finger is down; 'settling' while it flies home / into the track. */
  phase: 'drag' | 'settling';
  target: GapTarget | null;
  /** Blink this card; `n` retriggers. */
  flash: { id: WidgetId; n: number } | null;
  /** Card generation per app: a moved app gets a new card (it expands in like a new one) — see trackKey. */
  gen: Partial<Record<WidgetId, number>>;
  /**
   * Last move: its old card (`key`) vanishes instantly instead of collapsing; `before` = it was left of the
   * centred card, so the strip shifts one card to keep what you're looking at still. `n` retriggers.
   */
  moved: { key: string; before: boolean; n: number } | null;
}

export const useDrag = create<DragState>()(() => ({
  source: null,
  phase: 'drag',
  target: null,
  flash: null,
  gen: {},
  moved: null,
}));

/** React key of an app's track card (changes when the app is moved). */
export const trackKey = (id: WidgetId, gen: DragState['gen']) => `${id}.${gen[id] ?? 0}`;

/** Dragged item: centre (editor coords), scale, opacity, and the grab point relative to its centre. */
export const ghost = {
  x: motionValue(0),
  y: motionValue(0),
  scale: motionValue(1),
  opacity: motionValue(1),
  grab: { x: 0, y: 0 },
};

let home = { x: 0, y: 0 };
let pinned = false; // sitting in the drop slot
let chasing = false; // catching back up with the finger after leaving the slot
let slotTimer: ReturnType<typeof setTimeout> | undefined;
let edgeTimer: ReturnType<typeof setTimeout> | undefined;
let edgeDir = 0;

const clearTimers = () => {
  clearTimeout(slotTimer);
  clearTimeout(edgeTimer);
  edgeDir = 0;
};

/** Begin a drag. `centre` = the item's centre now, `pointer` = the finger (editor coords). */
export function startDrag(source: DragSource, centre: { x: number; y: number }, pointer: { x: number; y: number }) {
  home = centre;
  ghost.x.jump(centre.x);
  ghost.y.jump(centre.y);
  ghost.opacity.jump(1);
  ghost.grab = { x: pointer.x - centre.x, y: pointer.y - centre.y };
  if (source.kind === 'track') {
    ghost.scale.jump(1);
    animate(ghost.scale, GHOST_SCALE.lifted, springSnap);
  } else ghost.scale.jump(1);
  pinned = chasing = false;
  clearTimers();
  useDrag.setState({ source, phase: 'drag', target: null });
}

/** The track card is being dragged now (not just held): shrink it around the finger. */
export function shrinkGhost() {
  animate(ghost.scale, GHOST_SCALE.dragging, springSnap);
}

/**
 * The ghost scales around the grab point, so the finger stays on the same spot of the card: its box sits at
 * finger − grab, and what you see is centred at finger − grab × scale (used for hit tests).
 */
const boxFor = (p: { x: number; y: number }) => ({ x: p.x - ghost.grab.x, y: p.y - ghost.grab.y });
const centreFor = (p: { x: number; y: number }) => {
  const s = ghost.scale.get();
  return { x: p.x - ghost.grab.x * s, y: p.y - ghost.grab.y * s };
};

function follow(p: { x: number; y: number }) {
  if (pinned) return;
  const c = boxFor(p);
  if (chasing) {
    animate(ghost.x, c.x, springSnap);
    animate(ghost.y, c.y, { ...springSnap, onComplete: () => (chasing = false) });
  } else {
    ghost.x.set(c.x);
    ghost.y.set(c.y);
  }
}

/** Gap centre in editor coords (track at rest — gaps opening don't move their own centre). */
const gapX = (g: number, page: number) => STRIP_ORIGIN.x + stripX(page) + gapInStrip(g);

function nearestGap(x: number, keep: number | undefined, source: DragSource) {
  const { widgetTrack, widgetPage } = useHud.getState();
  if (keep !== undefined && Math.abs(x - gapX(keep, widgetPage)) < GAP_KEEP) return keep;
  let best: number | undefined;
  let bestD = GAP_REACH;
  for (let g = 0; g <= widgetTrack.length; g++) {
    // Reordering: the gaps either side of the card's own slot wouldn't change anything — not targets.
    if (source.kind === 'track' && (g === source.index || g === source.index + 1)) continue;
    const d = Math.abs(x - gapX(g, widgetPage));
    if (d < bestD) [best, bestD] = [g, d];
  }
  return best;
}

function setTarget(next: GapTarget | null) {
  const cur = useDrag.getState().target;
  if (cur?.gap === next?.gap && cur?.mode === next?.mode) return;
  useDrag.setState({ target: next });
}

function unpin() {
  if (!pinned) return;
  pinned = false;
  chasing = true;
}

export function moveDrag(pointer: { x: number; y: number }) {
  const { source, phase, target } = useDrag.getState();
  if (!source || phase !== 'drag') return;
  const c = centreFor(pointer);
  const inBand = c.y > BAND.top && c.y < BAND.bottom;
  const dir = !inBand ? 0 : c.x < EDGE.left ? -1 : c.x > EDGE.right ? 1 : 0;

  if (dir !== edgeDir) {
    clearTimeout(edgeTimer);
    edgeDir = dir;
    if (dir) {
      const page = () => {
        const { widgetPage, widgetTrack, setWidgetPage } = useHud.getState();
        const next = Math.max(0, Math.min(widgetTrack.length - 1, widgetPage + edgeDir));
        if (next !== widgetPage) setWidgetPage(next);
        edgeTimer = setTimeout(page, EDGE_DWELL_MS);
      };
      edgeTimer = setTimeout(page, EDGE_DWELL_MS);
    }
  }

  const gap = inBand && !dir ? nearestGap(c.x, target?.gap, source) : undefined;
  if (gap === undefined) {
    clearTimeout(slotTimer);
    setTarget(null);
    unpin();
  } else if (gap !== target?.gap) {
    clearTimeout(slotTimer);
    unpin();
    setTarget({ gap, mode: 'bar' });
    slotTimer = setTimeout(() => {
      setTarget({ gap, mode: 'slot' });
      // Picker icons settle into the slot (sketch 4802:103453); a dragged card is too big to, it stays put.
      if (useDrag.getState().source?.kind === 'picker') {
        pinned = true;
        chasing = false;
        const { widgetPage } = useHud.getState();
        animate(ghost.x, gapX(gap, widgetPage), springSnap);
        animate(ghost.y, STRIP_ORIGIN.y + CARD_H / 2, springSnap);
      }
    }, SLOT_DWELL_MS);
  }
  follow(pointer);
}

function settle(to: { x: number; y: number }, opts: { scale?: number; fade?: boolean }) {
  clearTimers();
  pinned = chasing = false;
  useDrag.setState({ phase: 'settling', target: null });
  const done = () => useDrag.setState({ source: null, phase: 'drag' });
  const t = opts.fade ? transition.screen : springSnap;
  animate(ghost.x, to.x, t);
  if (opts.scale !== undefined) animate(ghost.scale, opts.scale, t);
  if (opts.fade) {
    animate(ghost.y, to.y, t);
    animate(ghost.opacity, 0, { ...t, onComplete: done });
  } else animate(ghost.y, to.y, { ...t, onComplete: done });
}

/** Back where it came from (picker tile / its own track slot). */
export function cancelDrag() {
  const { source } = useDrag.getState();
  if (!source) return;
  settle(home, { scale: 1 });
}

export function dropDrag() {
  const { source, target, phase } = useDrag.getState();
  if (!source || phase !== 'drag') return;
  if (!target) return cancelDrag();
  const { widgetTrack: track, setWidgetTrack, setWidgetPage } = useHud.getState();
  const at = track.indexOf(source.id);
  const { gap } = target;

  if (at >= 0 && (gap === at || gap === at + 1)) {
    // Already there, next to this gap: nothing changes — show where it is and float back (Q20).
    setWidgetPage(at);
    useDrag.setState((s) => ({ flash: { id: source.id, n: (s.flash?.n ?? 0) + 1 } }));
    return cancelDrag();
  }
  const rest = at >= 0 ? track.filter((id) => id !== source.id) : track;
  const index = at >= 0 && gap > at ? gap - 1 : gap;
  if (at >= 0) {
    // A move looks like adding it new (Anastasiya): it expands into the gap; its old spot just goes, unseen.
    const { gen, moved } = useDrag.getState();
    useDrag.setState({
      gen: { ...gen, [source.id]: (gen[source.id] ?? 0) + 1 },
      moved: { key: trackKey(source.id, gen), before: at < useHud.getState().widgetPage, n: (moved?.n ?? 0) + 1 },
    });
  }
  setWidgetTrack([...rest.slice(0, index), source.id, ...rest.slice(index)]);
  setWidgetPage(index);
  // Into the new card, which pages to the centre: the icon fades into it; a dragged card grows back into place.
  if (source.kind === 'picker') settle(CENTRE_CARD, { fade: true });
  else settle(CENTRE_CARD, { scale: 1 });
}

/** Editor unmounted mid-drag (e.g. Customize closed) — drop everything. */
export function resetDrag() {
  clearTimers();
  pinned = chasing = false;
  useDrag.setState({ source: null, phase: 'drag', target: null, moved: null });
}

/** Client px → editor coords. */
export function toEditor(editor: HTMLElement, clientX: number, clientY: number) {
  const r = editor.getBoundingClientRect();
  const s = r.width / editor.offsetWidth || 1;
  return { x: (clientX - r.left) / s, y: (clientY - r.top) / s };
}

/** An element's centre in editor coords. */
export function centreOf(editor: HTMLElement, el: Element) {
  const r = el.getBoundingClientRect();
  return toEditor(editor, r.left + r.width / 2, r.top + r.height / 2);
}

export const GHOST_CARD = { width: CARD_W, height: CARD_H };
