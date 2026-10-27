import { motion } from 'motion/react';
import { useRef } from 'react';
import renderPanel from '../../assets/car/render-panel.png';
import renderFull from '../../assets/car/render-full.png';
import shadowPanel from '../../assets/car/shadow-panel.svg';
import divider from '../../assets/car/divider.svg';
import { useStageScale } from '../../shell/Stage';
import { useHud } from '../../state/store';
import { transition } from '../../tokens/motion';
import { Icon } from '../Icon/Icon';
import { TripSearchCard } from '../TripCard/TripSearchCard';
import { WidgetBar } from '../WidgetBar/WidgetBar';
import { Callouts } from './Callouts';
import { PanelStatusBar, Telltales } from './PanelStatusBar';
import { PANEL_WIDTH, bottom, chickletRect, scene } from './geometry';
import styles from './CarPanel.module.css';
import { capture } from '../../lib/pointer';

const DRAG_THRESHOLD = 60; // design px
/** Figma "bg": canvas beside the map; raised panel grey on Car status (the shadow ellipse becomes the floor). */
const PANEL_BG = {
  panel: 'var(--color-surface-canvas)',
  full: 'var(--color-surface-panel)',
  collapsed: 'var(--color-surface-canvas)',
} as const;
const TAP_SLOP = 10;

/**
 * Figma "Car Status Panel", State=Parked. Lives in the Left slot. All size changes: 0.4s standard.
 *   Panel:     tap / drag right → Full · drag left on the handle (grab pill) → Collapsed
 *   Full:      tap / drag left → Panel
 *   Collapsed: tap / drag right → Panel   (Figma: "Collapsed taps back to Panel")
 * Interactive children opt out of the panel gesture with data-no-panel-gesture.
 * TODO P4: State=Driving.
 */
export function CarPanel() {
  const view = useHud((s) => s.carView);
  const setCarView = useHud((s) => s.setCarView);
  const widgetPage = useHud((s) => s.widgetPage);
  const scale = useStageScale();
  const start = useRef<{ x: number; y: number; onHandle: boolean } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    const target = e.target as Element;
    if (view !== 'collapsed' && target.closest('[data-no-panel-gesture]')) return;
    start.current = { x: e.clientX, y: e.clientY, onHandle: !!target.closest('[data-panel-handle]') };
    // Keep receiving the gesture when the finger leaves the panel (e.g. dragging right out of the 116px rail).
    capture(e);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!start.current) return;
    const dx = (e.clientX - start.current.x) / scale;
    const dy = (e.clientY - start.current.y) / scale;
    const { onHandle } = start.current;
    start.current = null;
    const tap = Math.hypot(dx, dy) < TAP_SLOP;
    const right = dx > DRAG_THRESHOLD;
    const left = dx < -DRAG_THRESHOLD;

    if (view === 'panel') {
      if (left && onHandle) setCarView('collapsed');
      else if (tap || right) setCarView('full');
    } else if (view === 'full') {
      if (tap || left) setCarView('panel');
    } else if (tap || right) {
      setCarView('panel');
    }
  };

  return (
    <motion.section
      className={styles.panel}
      aria-label="Car status"
      initial={false}
      animate={{ width: PANEL_WIDTH[view], backgroundColor: PANEL_BG[view] }}
      transition={transition.screen}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (start.current = null)}
    >
      <motion.div
        className={styles.layer}
        initial={false}
        animate={scene.shadowPanel[view]}
        transition={transition.screen}
      >
        <Icon src={shadowPanel} color="var(--color-surface-sunken)" className={styles.fill} />
      </motion.div>
      <motion.div
        className={`${styles.layer} ${styles.shadowFull}`}
        initial={false}
        animate={scene.shadowFull[view]}
        transition={transition.screen}
      />

      <motion.img
        className={`${styles.layer} ${styles.render}`}
        src={renderFull}
        alt=""
        initial={false}
        animate={scene.reflection[view]}
        style={{ scaleY: -1, rotate: 4.16 }}
        transition={transition.screen}
      />
      <motion.img
        className={`${styles.layer} ${styles.render}`}
        src={renderPanel}
        alt=""
        initial={false}
        animate={scene.renderPanel[view]}
        transition={transition.screen}
      />
      <motion.img
        className={`${styles.layer} ${styles.render}`}
        src={renderFull}
        alt=""
        initial={false}
        animate={scene.renderFull[view]}
        transition={transition.screen}
      />

      <Callouts view={view} />

      <PanelStatusBar view={view} />
      <Telltales view={view} />

      <div className={styles.divider} aria-hidden>
        <img src={divider} alt="" width={240} height={104} />
      </div>
      {/* Figma "handle": transparent 64×320 hit area over the grab pill */}
      <div className={styles.handle} data-panel-handle aria-hidden />

      <motion.div
        className={styles.layer}
        initial={false}
        animate={view === 'collapsed' ? chickletRect(widgetPage) : bottom.widgetBar[view]}
        transition={transition.screen}
        data-no-panel-gesture
      >
        <WidgetBar chicklet={view === 'collapsed'} />
      </motion.div>
      <motion.div
        className={styles.layer}
        initial={false}
        animate={bottom.tripCard[view]}
        transition={transition.screen}
        style={{ pointerEvents: view === 'full' ? 'auto' : 'none' }}
        data-no-panel-gesture
      >
        <TripSearchCard />
      </motion.div>
    </motion.section>
  );
}
