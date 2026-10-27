import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import renderPanel from '../../assets/car/render-panel.png';
import renderFull from '../../assets/car/render-full.png';
import shadowPanel from '../../assets/car/shadow-panel.svg';
import divider from '../../assets/car/divider.svg';
import { useStageScale } from '../../shell/Stage';
import { isDriving, useHud } from '../../state/store';
import { presets, transition } from '../../tokens/motion';
import { TripCardActive } from '../Navigation/TripCardActive';
import { Icon } from '../Icon/Icon';
import { TripSearchCard } from '../TripCard/TripSearchCard';
import { WidgetBar } from '../WidgetBar/WidgetBar';
import { Callouts } from './Callouts';
import { PanelStatusBar, Telltales } from './PanelStatusBar';
import { DrivingScene } from './DrivingScene';
import { SpeedCluster } from './SpeedCluster';
import { bottom, chickletLargeRect, chickletRect, panelWidth, scene } from './geometry';
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
 * State=Parked ⇄ Driving cross-fades the scene (car + callouts ⇄ road + speed), 0.4s.
 */
export function CarPanel() {
  const view = useHud((s) => s.carView);
  const setCarView = useHud((s) => s.setCarView);
  const widgetPage = useHud((s) => s.widgetPage);
  const driving = useHud(isDriving);
  const scale = useStageScale();
  const tripLayer = useRef<HTMLDivElement>(null);
  // Trip card is only shown on Car status — elsewhere it's inert (not tappable, not announced).
  // Set via the DOM: React 18's types don't know `inert`.
  useEffect(() => {
    if (tripLayer.current) tripLayer.current.inert = view !== 'full';
  }, [view]);
  const start = useRef<{ x: number; y: number; onHandle: boolean } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    const target = e.target as Element;
    // Controls opt out (and must not lose their tap to pointer capture). In the rail the Chicklet opts back in.
    if (target.closest('[data-no-panel-gesture]')) return;
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
      animate={{ width: panelWidth(view, driving), backgroundColor: PANEL_BG[view] }}
      transition={transition.screen}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (start.current = null)}
    >
      {/* State=Parked scene: shadows, car renders, callouts */}
      <motion.div className={styles.group} initial={false} animate={{ opacity: driving ? 0 : 1 }} transition={transition.screen}>
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
      </motion.div>

      {/* State=Driving scene: road render + speed, limit sign, next turn */}
      <DrivingScene view={view} visible={driving} />
      <SpeedCluster view={view} visible={driving} />

      <PanelStatusBar view={view} driving={driving} />
      <Telltales view={view} driving={driving} />

      <div className={styles.divider} aria-hidden>
        <img src={divider} alt="" width={240} height={104} />
      </div>
      {/* Figma "handle": transparent 64×320 hit area over the grab pill */}
      <div className={styles.handle} data-panel-handle aria-hidden />

      <motion.div
        className={styles.layer}
        initial={false}
        animate={
          view !== 'collapsed' ? bottom.widgetBar[view] : driving ? chickletLargeRect : chickletRect(widgetPage)
        }
        transition={transition.screen}
        // Chicklet taps fall through to the panel (Collapsed → Panel); the full widget bar is interactive
        data-no-panel-gesture={view !== 'collapsed' || undefined}
      >
        <WidgetBar chicklet={view !== 'collapsed' ? undefined : driving ? 'large' : 'mini'} />
      </motion.div>
      <motion.div
        className={styles.layer}
        initial={false}
        animate={bottom.tripCard[view]}
        transition={transition.screen}
        ref={tripLayer}
        data-no-panel-gesture
      >
        {/* Car status shows the active trip while driving (driving = navigating), else Navigate / Home / Work */}
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div key={driving ? 'active' : 'search'} className={styles.fill} {...presets.fadeIn} transition={transition.toggle}>
            {driving ? <TripCardActive /> : <TripSearchCard />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.section>
  );
}
