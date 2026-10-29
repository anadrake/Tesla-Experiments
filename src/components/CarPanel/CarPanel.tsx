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
import { CustomizeEditor } from '../Customize/CustomizeEditor';
import { WIDGETS } from '../WidgetBar/registry';
import { WidgetBar } from '../WidgetBar/WidgetBar';
import { Callouts } from './Callouts';
import { PanelStatusBar, Telltales } from './PanelStatusBar';
import { DrivingScene } from './DrivingScene';
import { SpeedCluster } from './SpeedCluster';
import { bottom, chickletLargeRect, chickletRect, panelWidth, scene, selfDrive } from './geometry';
import { Button } from '../settings/controls';
import styles from './CarPanel.module.css';
import { capture } from '../../lib/pointer';

const DRAG_THRESHOLD = 60; // design px
/** Figma "bg": canvas in every size (Full was surface/panel until Anastasiya darkened it, 2026-10-27). */
const PANEL_BG = {
  panel: 'var(--color-surface-canvas)',
  full: 'var(--color-surface-canvas)',
  collapsed: 'var(--color-surface-canvas)',
} as const;
/** Driving Car status: no lighter "stage" in Dark — same dark as the panel (Anastasiya). */
const panelBg = (view: keyof typeof PANEL_BG, driving: boolean) =>
  view === 'full' && driving ? 'var(--color-bg-car-status-driving)' : PANEL_BG[view];
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
  const activeWidget = useHud((s) => s.widgetTrack[s.widgetPage] ?? s.widgetTrack[0]);
  const driving = useHud(isDriving);
  const scale = useStageScale();
  const tripLayer = useRef<HTMLDivElement>(null);
  // Trip card is only shown on Car status — elsewhere it's inert (not tappable, not announced).
  // Set via the DOM: React 18's types don't know `inert`.
  useEffect(() => {
    if (tripLayer.current) tripLayer.current.inert = view !== 'full';
  }, [view]);
  const start = useRef<{ x: number; y: number; onHandle: boolean } | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const editing = useHud((s) => s.customize === 'editing');

  const onPointerDown = (e: React.PointerEvent) => {
    const target = e.target as Element;
    // Controls opt out (and must not lose their tap to pointer capture). In the rail the Chicklet opts back in.
    if (target.closest('[data-no-panel-gesture]')) return;
    // Customize mode: the panel holds still (no Full / collapse) — only the editor is live.
    if (editing) return;
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
      ref={panelRef}
      className={styles.panel}
      aria-label="Car status"
      initial={false}
      animate={{ width: panelWidth(view, driving), backgroundColor: panelBg(view, driving) }}
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
        <motion.div className={styles.layer} initial={false} animate={scene.shadowFull[view]} transition={transition.screen}>
          <div className={styles.shadowMask}>
            <div className={styles.shadowFull} />
          </div>
        </motion.div>

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

      <SelfDriveLayer rect={selfDrive[driving ? 'driving' : 'parked'][view]} />

      <div className={styles.divider} aria-hidden>
        <img src={divider} alt="" width={240} height={104} />
      </div>
      {/* Figma "handle": transparent 64×320 hit area over the grab pill */}
      <div className={styles.handle} data-panel-handle aria-hidden />

      <motion.div
        className={styles.layer}
        initial={false}
        animate={
          view !== 'collapsed' ? bottom.widgetBar[view] : driving ? chickletLargeRect : chickletRect(WIDGETS[activeWidget].mini)
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
      <CustomizeEditor panel={panelRef} />
    </motion.section>
  );
}

/** Start Self-Driving: morphs with the panel like the other layers; hidden (and untappable) where Figma has none. */
function SelfDriveLayer({ rect }: { rect: (typeof selfDrive)['parked']['panel'] }) {
  const shown = rect.opacity !== 0;
  const layer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (layer.current) layer.current.inert = !shown; // React 18 types lack `inert`
  }, [shown]);
  return (
    <motion.div
      ref={layer}
      className={styles.layer}
      initial={false}
      animate={rect}
      transition={transition.screen}
      data-no-panel-gesture
    >
      <Button variant="primary-transparent" width="100%" className={styles.selfDrive}>
        Start Self-Driving
      </Button>
    </motion.div>
  );
}
