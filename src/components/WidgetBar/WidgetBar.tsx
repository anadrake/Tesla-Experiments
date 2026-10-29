import { AnimatePresence, motion, useTransform } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { capture } from '../../lib/pointer';
import { useStageScale } from '../../shell/Stage';
import { useHud } from '../../state/store';
import { presets, reducible, spring, springSnap, transition } from '../../tokens/motion';
import { InfoPages } from './pages';
import { WIDGETS, WidgetIcon, type WidgetId } from './registry';
import { LIFT, usePullUp } from './usePullUp';
import { POP_HOLD_MS, POP_PULL, POP_SCALE, catchUp, dragTo, grab, liftOut, move, popOut, release, settleMove, tension } from './move';
import { useDismissOnOutsideTap } from './useDismissOnOutsideTap';
import styles from './WidgetBar.module.css';

/**
 * Figma "Dynamic Widget Bar" (4416:12286), Dot Nav=Hidden.
 * Open: 600×192 window, swipe horizontally between the widgets on `widgetTrack` (registry.tsx).
 * Dot nav (Q11): appears while swiping, fades out after DOTS_IDLE_MS without scrolling.
 * Collapsed panel shows the active widget as a Chicklet (registry Mini / Chicklet) — taps fall through to the panel (→ Panel):
 *   mini (Parked, 116 rail) · large (Driving, 220 rail). New set: Figma 4899:2892.
 * Collapsed bar (Q26): swipe down on the widget (or tap Music's album art) → 382×64 pill of the widget that was
 * showing; the page is kept, and tapping the pill opens the bar on it again.
 * Customize (Phase 8, Sketch 4802:103109): pull the bar up (usePullUp) → it lifts 64px and the Customize
 * button rises from under it. Tap anywhere else or pull down → back. Panel / Full, Parked or Driving (Q22), and docked on the
 * map while collapsed (9.6) — not the rail chicklet.
 * Move (9.4, move.ts): keep pulling past the reveal and hold → the widget pops out; Done replaces Customize.
 * Collapsed (9.6, 4923:59013): from the map it can drop into the rail, where it shows as the chicklet again.
 */
const DOTS_IDLE_MS = 1500;

/** An app's chicklet body, or its app icon centred on the card when the size isn't designed. */
function ChickletBody({ id, size }: { id: WidgetId; size: 'Chicklet' | 'Mini' }) {
  const Body = WIDGETS[id][size];
  if (Body) return <Body />;
  return (
    <span className={styles.chickletIcon}>
      <WidgetIcon id={id} />
    </span>
  );
}

function PillBody({ id }: { id: WidgetId }) {
  const { Pill } = WIDGETS[id];
  if (Pill) return <Pill />;
  return (
    <span className={styles.pillFallback}>
      <WidgetIcon id={id} size={40} />
      <span className="text-title-m">{WIDGETS[id].label}</span>
    </span>
  );
}

export function WidgetBar({ chicklet }: { chicklet?: 'mini' | 'large' }) {
  const collapsed = useHud((s) => s.widgetsCollapsed);
  const setCollapsed = useHud((s) => s.setWidgetsCollapsed);
  const track = useHud((s) => s.widgetTrack);
  const page = useHud((s) => s.widgetPage);
  const active = track[page] ?? track[0];
  const setPage = useHud((s) => s.setWidgetPage);
  const customize = useHud((s) => s.customize);
  const setCustomize = useHud((s) => s.setCustomize);
  // Panel and Full, Parked or Driving (Anastasiya, 2026-10-28), and on the map while collapsed (9.6) — not the rail chicklet.
  const canCustomize = !chicklet;
  const revealed = canCustomize && customize !== 'off';
  const moving = revealed && customize === 'moving';
  const root = useRef<HTMLDivElement>(null);
  const scale = useStageScale();
  // Customize mode closing: the editor shrinks back into the bar's resting outline (Customize/motion.ts), so the
  // hidden bar jumps straight to rest and takes over there — no drop, and the Customize button doesn't flash.
  const prevCustomize = useRef(customize);
  const closingEditor = prevCustomize.current === 'editing' && customize !== 'editing';
  useEffect(() => {
    prevCustomize.current = customize;
  }, [customize]);
  const { y, handlers } = usePullUp({
    jump: closingEditor,
    root,
    // The pill is tap-only: no pull-up (Customize) or swipe from it.
    enabled: canCustomize && customize !== 'editing' && !collapsed,
    revealed,
    onReveal: () => setCustomize('revealed'),
    onHide: () => setCustomize('off'),
    onCollapse: () => setCollapsed(true),
    pop: {
      pull: POP_PULL,
      holdMs: POP_HOLD_MS,
      onTension: tension,
      onPop: (p, from) => popOut(p, from, scale, y.get()),
      onMove: (p) => dragTo(p, y.get()),
      onEnd: () => release(y.get()),
    },
  });
  // Move mode: a press on the popped widget drags it again (Q38). The gesture that popped it keeps going through
  // usePullUp (it owns that pointer until it lifts), so moves / ups go to both — each ignores what isn't its own.
  const barHandlers: typeof handlers = moving
    ? {
        onPointerDown: (e) => {
          if (!e.isPrimary || (e.target as Element).closest('[data-move-ignore]')) return; // Done keeps its tap
          capture(e);
          grab({ x: e.clientX, y: e.clientY }, scale);
        },
        onPointerMove: (e) => {
          handlers.onPointerMove?.(e);
          dragTo({ x: e.clientX, y: e.clientY }, y.get());
        },
        onPointerUp: (e) => {
          handlers.onPointerUp?.(e);
          release(y.get());
        },
        onPointerCancel: (e) => {
          handlers.onPointerCancel?.(e);
          release(y.get());
        },
      }
    : handlers;
  // Move mode ended (drop, Done, tap outside): back into the socket — after WidgetLayer rebased on a new dock.
  const wasMoving = useRef(moving);
  useEffect(() => {
    if (wasMoving.current && !moving) settleMove();
    if (moving) liftOut(); // no-op after a pop; lifts the card for ?customize=moving
    wasMoving.current = moving;
  }, [moving]);
  const liftX = useTransform(() => move.x.get() + catchUp.x.get());
  const liftY = useTransform(() => y.get() + move.y.get() + catchUp.y.get());
  // Leaving move mode (a drop, Done, tap outside), Done goes at once: the bar has already jumped to its new dock,
  // so a fade would flash it there (Anastasiya, 2026-10-29). Back with the next press on the bar.
  const [buttonGone, setButtonGone] = useState(false);
  const wasMovingNow = useRef(moving);
  useLayoutEffect(() => {
    if (wasMovingNow.current && !moving) setButtonGone(true);
    wasMovingNow.current = moving;
  }, [moving]);
  const reveal = useTransform(y, [0, -LIFT], [0, 1]);
  const buttonY = useTransform(y, [0, -LIFT], [LIFT / 4, 0]);
  useDismissOnOutsideTap(root, revealed && (customize === 'revealed' || moving), () => setCustomize('off'));
  // While editing, the editor (CustomizeEditor) replaces the bar and the Customize button.
  const editing = revealed && customize === 'editing';
  const hidden = useHud((s) => editing || s.customizeEditorShown);
  useEffect(() => {
    if (root.current) root.current.inert = editing; // React 18 types lack `inert`
  }, [editing]);
  // Collapsing to the rail drops customization.
  useEffect(() => {
    if (!canCustomize && customize !== 'off') setCustomize('off');
  }, [canCustomize, customize, setCustomize]);
  const [dotsVisible, setDotsVisible] = useState(false);
  const idle = useRef<ReturnType<typeof setTimeout>>();

  const onScrollPage = (p: number) => {
    if (p !== page) setPage(p);
    setDotsVisible(true);
    clearTimeout(idle.current);
    idle.current = setTimeout(() => setDotsVisible(false), DOTS_IDLE_MS);
  };
  useEffect(() => () => clearTimeout(idle.current), []);

  if (chicklet === 'large') {
    return (
      <div className={styles.chickletFrame}>
        <motion.div
          key={active}
          className={styles.chickletLarge}
          style={WIDGETS[active].large}
          data-widget={active}
          {...presets.popIn}
          transition={transition.open}
        >
          <ChickletBody id={active} size="Chicklet" />
        </motion.div>
      </div>
    );
  }

  if (chicklet === 'mini') {
    return (
      <motion.div key={active} className={styles.chicklet} data-widget={active} {...presets.popIn} transition={transition.open}>
        <ChickletBody id={active} size="Mini" />
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={root}
      className={styles.bar}
      data-moving={moving || undefined}
      {...barHandlers}
      onPointerDownCapture={() => setButtonGone(false)}
      // Hand-off, no cross-fade: hidden while the editor is on screen, back as soon as it's gone
      // (plain style, not an animation, so the swap lands in one painted frame — CustomizeEditor).
      style={{ opacity: hidden ? 0 : 1, pointerEvents: hidden ? 'none' : undefined }}
    >
      <motion.div className={styles.lift} style={{ x: liftX, y: liftY, scale: move.scale }}>
        {/* Popped out: scaled up with a little overshoot (the socket's click) — state-driven, so it runs on the compositor */}
        <motion.div
          className={styles.pop}
          initial={false}
          animate={{ transform: moving ? `scale(${POP_SCALE})` : 'scale(1)' }}
          transition={reducible(moving ? springSnap : spring)}
        >
          {/* …and a second panel shadow fades in under the card (lifted further off the screen) */}
          <motion.div
            className={styles.liftShadow}
            initial={false}
            animate={{ opacity: moving ? 1 : 0 }}
            transition={reducible(moving ? transition.open : transition.close)}
            aria-hidden
          />
          <AnimatePresence initial={false} mode="popLayout">
            {collapsed ? (
              <motion.button
                key={`pill-${active}`}
                type="button"
                className={styles.pill}
                data-widget={active}
                onClick={() => setCollapsed(false)}
                aria-label={`Expand ${WIDGETS[active].ariaLabel}`}
                {...presets.popIn}
                transition={transition.open}
                whileTap={{ scale: 0.97 }}
              >
                <PillBody id={active} />
              </motion.button>
            ) : (
              <motion.div key="window" className={styles.window} {...presets.popIn} transition={transition.open}>
                <InfoPages initialPage={page} onScrollPage={onScrollPage} />
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            className={styles.dots}
            aria-hidden
            initial={false}
            animate={{ opacity: dotsVisible && !collapsed ? 1 : 0 }}
            transition={dotsVisible ? transition.toggle : transition.close}
          >
            {track.map((id, i) => (
              <span key={id} className={styles.dot} data-selected={i === page || undefined} />
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
      <motion.div
        className={styles.customizeSlot}
        data-move-ignore
        style={{ opacity: buttonGone ? 0 : reveal, y: buttonY }}
        data-revealed={revealed || undefined}
      >
        <motion.button
          type="button"
          className={`${styles.customize} text-body-l`}
          tabIndex={revealed ? 0 : -1}
          aria-hidden={!revealed}
          onClick={() => setCustomize(moving ? 'off' : 'editing')}
          whileTap={{ scale: 0.96 }}
          transition={transition.press}
        >
          {moving ? 'Done' : 'Customize'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
