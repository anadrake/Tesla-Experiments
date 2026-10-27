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
import { PANEL_WIDTH, bottom, scene } from './geometry';
import styles from './CarPanel.module.css';

const DRAG_THRESHOLD = 60; // design px
/** Figma "bg": canvas beside the map; raised panel grey on Car status (the shadow ellipse becomes the floor). */
const PANEL_BG = { panel: 'var(--color-surface-canvas)', full: 'var(--color-surface-panel)' } as const;
const TAP_SLOP = 10;

/**
 * Figma "Car Status Panel", State=Parked. Lives in the Left slot.
 * Tap or horizontal drag switches Panel (630) ⇄ Full (Car status screen), 0.4s standard.
 * Interactive children opt out of the panel gesture with data-no-panel-gesture.
 * TODO P4: State=Driving. Handle drag → Collapsed (220) with Map Expanded.
 */
export function CarPanel() {
  const view = useHud((s) => s.carView);
  const setCarView = useHud((s) => s.setCarView);
  const scale = useStageScale();
  const start = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as Element).closest('[data-no-panel-gesture]')) return;
    start.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!start.current) return;
    const dx = (e.clientX - start.current.x) / scale;
    const dy = (e.clientY - start.current.y) / scale;
    start.current = null;
    if (Math.hypot(dx, dy) < TAP_SLOP) setCarView(view === 'panel' ? 'full' : 'panel');
    else if (view === 'panel' && dx > DRAG_THRESHOLD) setCarView('full');
    else if (view === 'full' && dx < -DRAG_THRESHOLD) setCarView('panel');
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
      <Telltales />

      <div className={styles.divider} aria-hidden>
        <img src={divider} alt="" width={240} height={104} />
      </div>

      <motion.div
        className={styles.layer}
        initial={false}
        animate={bottom.widgetBar[view]}
        transition={transition.screen}
        data-no-panel-gesture
      >
        <WidgetBar />
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
