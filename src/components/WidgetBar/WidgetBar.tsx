import { AnimatePresence, motion, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useHud } from '../../state/store';
import { presets, transition } from '../../tokens/motion';
import { InfoPages } from './pages';
import { WIDGETS, WidgetIcon, type WidgetId } from './registry';
import { LIFT, usePullUp } from './usePullUp';
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
 * button rises from under it. Tap anywhere else or pull down → back. Panel / Full, Parked or Driving (Q22) — not the Collapsed rail.
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
  // Panel and Full, Parked or Driving (Anastasiya, 2026-10-28) — not the Collapsed rail.
  const canCustomize = useHud((s) => !chicklet && s.carView !== 'collapsed');
  const revealed = canCustomize && customize !== 'off';
  const root = useRef<HTMLDivElement>(null);
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
  });
  const reveal = useTransform(y, [0, -LIFT], [0, 1]);
  const buttonY = useTransform(y, [0, -LIFT], [LIFT / 4, 0]);
  useDismissOnOutsideTap(root, revealed && customize === 'revealed', () => setCustomize('off'));
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
      {...handlers}
      // Hand-off, no cross-fade: hidden while the editor is on screen, back as soon as it's gone
      // (plain style, not an animation, so the swap lands in one painted frame — CustomizeEditor).
      style={{ opacity: hidden ? 0 : 1, pointerEvents: hidden ? 'none' : undefined }}
    >
      <motion.div className={styles.lift} style={{ y }}>
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
      <motion.div
        className={styles.customizeSlot}
        style={{ opacity: reveal, y: buttonY }}
        data-revealed={revealed || undefined}
      >
        <motion.button
          type="button"
          className={`${styles.customize} text-body-l`}
          tabIndex={revealed ? 0 : -1}
          aria-hidden={!revealed}
          onClick={() => setCustomize('editing')}
          whileTap={{ scale: 0.96 }}
          transition={transition.press}
        >
          Customize
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
