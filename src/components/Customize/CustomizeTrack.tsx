import { AnimatePresence, animate, motion, useIsPresent, useMotionValue, useReducedMotion } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import closeIcon from '../../assets/icons/close.svg';
import { capture } from '../../lib/pointer';
import { useStageScale } from '../../shell/Stage';
import { useHud } from '../../state/store';
import type { WidgetId } from '../../state/widgets';
import { duration, easing, presets, reducible, spring, transition } from '../../tokens/motion';
import { Icon } from '../Icon/Icon';
import { Pressable } from '../Pressable/Pressable';
import { PlaceholderWidget, TrackWidget, WIDGETS } from '../WidgetBar/registry';
import barStyles from '../WidgetBar/WidgetBar.module.css';
import {
  DRAG_SLOP,
  HOLD_MS,
  cancelDrag,
  centreOf,
  dropDrag,
  moveDrag,
  shrinkGhost,
  startDrag,
  toEditor,
  trackKey,
  useDrag,
} from './drag';
import { BAR, CARD_GAP, CARD_W, GAP_OPEN, PITCH, SLOT, VIEW, gapInStrip, stripX } from './geometry';
import { useEditorMotion } from './motion';
import styles from './Customize.module.css';

/**
 * Sketch "edit frame" (4802:104705): the track shrunk to 486-wide cards (the 600×192 widget at 0.8107),
 * 20px apart, centred with the neighbours peeking. The X above each card removes that widget (not on the last
 * one — the track is never empty, Q18); its name below; dots always on.
 * Swipe pages like the normal bar (our own pager, design px). Hold a card 0.3s → it lifts and drags (Q19).
 * While something is dragged near a gap, the cards either side move apart around the insertion bar / drop slot.
 */
const SWIPE_PAGE = 60; // design px of drag that turns the page
const EDGE_RESIST = 0.35; // rubber band past the first / last card

/** Pager gesture; `hold` = the 0.3s timer that turns it into a card drag, `lifted` once it has. */
interface PagerGesture {
  id: number;
  x: number;
  y: number;
  base: number;
  moved: boolean;
  hold?: ReturnType<typeof setTimeout>;
  lifted?: boolean;
}

/** Reduce Motion: cards fade in / out but don't grow, shrink or slide; a removed card closes up once it has faded. */
const AFTER_FADE = { ...transition.cut, delay: duration.fast };
/**
 * The neighbours slide in from past the frame's edge as they fade (Anastasiya, 2026-10-30: they popped in) — the
 * fade is slow in / slow out, not the front-loaded standard curve that had them at 60% in 0.1s.
 */
const PEEK_IN = 48;
const PEEK_FADE = { duration: duration.base, ease: easing.gentle }; // slow (0.4) dragged (Anastasiya)
/** They start halfway through the open morph, not after it (Anastasiya): the clip has nearly closed in by then. */
const PEEK_START = duration.base / 2;
const SLOT_MOTION = { ...transition.screen, x: spring, opacity: PEEK_FADE };
/** The X goes first on close, before the card starts shrinking back (Anastasiya, 2026-10-30: it lingered). */
const X_OUT = { duration: duration.instant };
const SLOT_MOTION_REDUCED = { ...transition.toggle, width: transition.cut, marginRight: transition.cut, x: transition.cut };

/** Removed (X) → collapses; moved elsewhere (`gone` = its key) → gone at once, the new card expands instead. */
const exitCard = (key: string, reduced: boolean) => (gone: string | undefined) =>
  gone === key
    ? { opacity: 0, width: 0, marginRight: 0, transition: transition.cut }
    : reduced
      ? { opacity: 0, width: 0, marginRight: 0, transition: { ...transition.toggle, width: AFTER_FADE, marginRight: AFTER_FADE } }
      : { opacity: 0, scale: 0.9, width: 0, marginRight: 0 };


/** A track card's face: the widget at 0.81 (placeholders full size, as in sketch 4802:107503). */
export function TrackCard({ id }: { id: WidgetId }) {
  return (
    <div className={styles.card} aria-label={WIDGETS[id].ariaLabel}>
      {/* Widgets are previews here — not tappable or focusable (React 18 types lack `inert`) */}
      {WIDGETS[id].Widget ? (
        <div className={styles.cardContent} ref={(el) => el && (el.inert = true)}>
          {/* .page = the widget's normal page box (600×192, paragraph resets) */}
          <div className={barStyles.page}>
            <TrackWidget id={id} />
          </div>
        </div>
      ) : (
        <PlaceholderWidget id={id} />
      )}
    </div>
  );
}

export function CustomizeTrack({ editor }: { editor: RefObject<HTMLElement> }) {
  const track = useHud((s) => s.widgetTrack);
  const page = useHud((s) => s.widgetPage);
  const setPage = useHud((s) => s.setWidgetPage);
  const setTrack = useHud((s) => s.setWidgetTrack);
  const target = useDrag((s) => s.target);
  const dragged = useDrag((s) => (s.source?.kind === 'track' ? s.source.id : null));
  const flash = useDrag((s) => s.flash);
  const gen = useDrag((s) => s.gen);
  const moved = useDrag((s) => s.moved);
  const scale = useStageScale();
  const x = useMotionValue(stripX(page));
  const drag = useRef<PagerGesture | null>(null);
  const reduced = !!useReducedMotion();
  const { frameBg, frameClip, trackView, chrome } = useEditorMotion();
  // The neighbours peek once the frame's clip has mostly closed in (PEEK_START), and fade out first thing on close (motion.ts frameClip).
  const present = useIsPresent();
  const [settled, setSettled] = useState(false);
  const peek = present && settled;
  useEffect(() => {
    const t = setTimeout(() => setSettled(true), PEEK_START * 1000);
    return () => clearTimeout(t);
  }, []);
  // The peek-in slides on the fade's curve (the spring had it parked before it was half visible); after it, the spring.
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (!settled) return;
    const t = setTimeout(() => setEntered(true), PEEK_FADE.duration * 1000);
    return () => clearTimeout(t);
  }, [settled]);

  useEffect(() => {
    // A swipe owns the strip; a lifted card doesn't (edge paging moves the strip under it).
    if (!drag.current || drag.current.lifted) animate(x, stripX(page), reducible(spring));
  }, [page, track.length, x]);

  // A moved app's old card vanishes in this same frame; if it was left of the centred card, everything after it
  // slides one card left — shift the strip back so nothing visibly jumps (then it pages to the new card as usual).
  // (The page number may not change — e.g. it moves from left of the centred card to right of it — so page here.)
  useLayoutEffect(() => {
    if (!moved) return;
    if (moved.before) x.jump(x.get() + PITCH);
    animate(x, stripX(useHud.getState().widgetPage), reducible(spring));
  }, [moved, x]);

  const active = track[page] ?? track[0];
  const remove = (id: WidgetId) => {
    if (track.length < 2 || useDrag.getState().source) return; // not mid-drag (a second finger on X)
    const at = track.indexOf(id);
    setTrack(track.filter((t) => t !== id));
    // A card left of the centred one: step the page back so the card you're looking at stays centred.
    if (at < page) setPage(page - 1);
  };

  const open = target ? GAP_OPEN[target.mode] : 0;
  /** Cards before the open gap move left, the rest right — the gap opens around its own centre. */
  const shift = (i: number) => (!target ? 0 : i < target.gap ? -open / 2 : open / 2);
  /** Until the frame settles, the neighbours wait PEEK_IN further out (off the frame's edge), then slide in. */
  const waiting = (i: number) => (settled || i === page ? 0 : i < page ? -PEEK_IN : PEEK_IN);

  const pointer = (e: React.PointerEvent) => editor.current && toEditor(editor.current, e.clientX, e.clientY);

  const endPager = (dx: number) => {
    const target = dx < -SWIPE_PAGE ? page + 1 : dx > SWIPE_PAGE ? page - 1 : page;
    const clamped = Math.max(0, Math.min(track.length - 1, target));
    if (clamped !== page) setPage(clamped);
    else animate(x, stripX(page), reducible(spring));
  };

  return (
    <div className={styles.editFrame}>
      {/* Card background grows out of the widget's outline (behind everything in the frame) */}
      <motion.div className={styles.frameBg} variants={frameBg} />
      <motion.div
        className={styles.frameClip}
        variants={frameClip}
      >
        <motion.div
          className={styles.view}
          variants={trackView}
          onPointerDown={(e) => {
            // A second finger doesn't restart the gesture, and nothing starts while a drag is out or settling.
            if (drag.current || useDrag.getState().source) return;
            const d: PagerGesture = { id: e.pointerId, x: e.clientX, y: e.clientY, base: x.get(), moved: false };
            drag.current = d;
            x.stop();
            capture(e);
            // Hold a card still for 0.3s → it lifts out of the track and follows the finger (Q19).
            const card = (e.target as Element).closest<HTMLElement>('[data-track-widget]');
            const id = card?.dataset.trackWidget as WidgetId | undefined;
            if (card && id && editor.current) {
              const p = pointer(e)!;
              d.hold = setTimeout(() => {
                if (drag.current !== d || d.moved || !editor.current || useDrag.getState().source) return;
                d.lifted = true;
                animate(x, stripX(page), reducible(spring)); // undo any rubber band from the hold
                startDrag({ kind: 'track', id, index: track.indexOf(id) }, centreOf(editor.current, card), p);
              }, HOLD_MS);
            }
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (!d || e.pointerId !== d.id) return;
            const dist = Math.hypot(e.clientX - d.x, e.clientY - d.y) / scale;
            if (d.lifted) {
              if (!d.moved && dist > DRAG_SLOP) {
                d.moved = true;
                shrinkGhost();
              }
              const p = pointer(e);
              if (p) moveDrag(p);
              return;
            }
            let dx = (e.clientX - d.x) / scale;
            if (dist > DRAG_SLOP) {
              d.moved = true;
              clearTimeout(d.hold); // it's a swipe, not a hold
            }
            const min = stripX(track.length - 1);
            const next = d.base + dx;
            if (next > stripX(0)) dx = stripX(0) - d.base + (next - stripX(0)) * EDGE_RESIST;
            else if (next < min) dx = min - d.base + (next - min) * EDGE_RESIST;
            x.set(d.base + dx);
          }}
          onPointerUp={(e) => {
            const d = drag.current;
            if (!d || e.pointerId !== d.id) return;
            drag.current = null;
            clearTimeout(d.hold);
            if (d.lifted) dropDrag();
            else endPager((e.clientX - d.x) / scale);
          }}
          onPointerCancel={(e) => {
            const d = drag.current;
            if (!d || e.pointerId !== d.id) return;
            drag.current = null;
            clearTimeout(d.hold);
            if (d.lifted) cancelDrag();
            else animate(x, stripX(page), reducible(spring));
          }}
        >
          <motion.div className={styles.strip} style={{ x }}>
            <AnimatePresence initial={false} custom={moved?.key}>
              {track.map((id, i) => (
                <motion.div
                  key={trackKey(id, gen)}
                  className={styles.slot}
                  data-track-widget={id}
                  data-active={id === active || undefined}
                  initial={{ opacity: 0, scale: 0.9, width: 0, marginRight: 0 }}
                  animate={{ opacity: id === active || peek ? 1 : 0, scale: 1, width: CARD_W, marginRight: CARD_GAP, x: shift(i) + waiting(i) }}
                  variants={{ out: exitCard(trackKey(id, gen), reduced) }}
                  exit="out"
                  transition={{
                    ...(reduced ? SLOT_MOTION_REDUCED : SLOT_MOTION),
                    ...(!reduced && !entered ? { x: PEEK_FADE } : {}),
                    ...(present ? {} : { opacity: transition.toggle }),
                  }}
                >
                  {/* The held card is lifted out (DragLayer draws it); its place stays until it's dropped */}
                  <motion.div
                    key={flash?.id === id ? flash.n : 0}
                    style={{ visibility: dragged === id ? 'hidden' : undefined }}
                    {...(flash?.id === id ? { animate: presets.flash, transition: transition.flash } : {})}
                  >
                    <TrackCard id={id} />
                  </motion.div>
                  {/* Each card carries its own X, above it, so it slides with the card (Anastasiya, 2026-10-29) */}
                  <AnimatePresence initial={false}>
                    {track.length > 1 && dragged !== id && (
                      <motion.div
                        key="x"
                        className={styles.closeSlot}
                        {...presets.fadeIn}
                        animate={{ opacity: present ? 1 : 0 }}
                        transition={present ? transition.toggle : X_OUT}
                      >
                        <Pressable
                          className={styles.close}
                          aria-label={`Remove ${WIDGETS[id].label}`}
                          // Keep the press off the track's swipe / hold gesture (it captures the pointer).
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={() => remove(id)}
                        >
                          <Icon src={closeIcon} color="var(--color-icon-strong)" />
                        </Pressable>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Insertion bar → drop slot, centred on the target gap (4802:103108 / 4802:103453) */}
            <AnimatePresence>
              {target && (
                <motion.span
                  key={target.gap}
                  className={styles.dropTarget}
                  style={{ left: gapInStrip(target.gap) }}
                  data-drop-target={target.mode}
                  initial={{ opacity: 0, ...BAR, x: -BAR.width / 2, y: (VIEW.height - BAR.height) / 2 }}
                  animate={{
                    ...(target.mode === 'slot'
                      ? { opacity: 0.4, ...SLOT, x: -SLOT.width / 2, y: (VIEW.height - SLOT.height) / 2 }
                      : { opacity: 1, ...BAR, x: -BAR.width / 2, y: (VIEW.height - BAR.height) / 2 }),
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ ...(reduced ? transition.cut : spring), opacity: transition.toggle }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        <motion.div variants={chrome}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={active}
              className={`text-body-m ${styles.trackLabel}`}
              {...presets.fadeIn}
              transition={transition.toggle}
            >
              {WIDGETS[active].label}
            </motion.p>
          </AnimatePresence>

          <div className={styles.dots} aria-hidden>
            {track.map((id, i) => (
              <span key={id} className={styles.dot} data-selected={i === page || undefined} />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
