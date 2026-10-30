import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, type ReactNode } from 'react';
import renderPanel from '../../assets/car/render-panel.png';
import renderFull from '../../assets/car/render-full.png';
import shadowPanel from '../../assets/car/shadow-panel.svg';
import divider from '../../assets/car/divider.svg';
import { useStageScale } from '../../shell/Stage';
import { DEFAULT_DOCK, isDriving, useHud, type CarView } from '../../state/store';
import { presets, transition } from '../../tokens/motion';
import { TripCardActive } from '../Navigation/TripCardActive';
import { Icon } from '../Icon/Icon';
import { TripSearchCard } from '../TripCard/TripSearchCard';
import { MapPeek } from '../MapPeek/MapPeek';
import { Callouts } from './Callouts';
import { PanelStatusBar, Telltales } from './PanelStatusBar';
import { DrivingScene } from './DrivingScene';
import { SpeedCluster } from './SpeedCluster';
import { flip, flipBase, flipStyle, panelWidth, scene, selfDrive, tripCardRect, type Rect } from './geometry';
import { Button } from '../settings/controls';
import { useFadeSwap } from '../../lib/fadeSwap';
import styles from './CarPanel.module.css';
import { capture } from '../../lib/pointer';

const DISPLAY_W = 1920;
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
  const dock = useHud((s) => s.widgetDock);
  const driving = useHud(isDriving);
  const scale = useStageScale();
  const tripLayer = useRef<HTMLDivElement>(null);
  // Trip card is only shown on Car status — elsewhere it's inert (not tappable, not announced).
  // Set via the DOM: React 18's types don't know `inert`.
  useEffect(() => {
    if (tripLayer.current) tripLayer.current.inert = view !== 'full';
  }, [view]);
  const start = useRef<{ x: number; y: number; onHandle: boolean } | null>(null);
  // Customize / move mode: the panel holds still (no Full / collapse) — only the editor / moved widget is live.
  const editing = useHud((s) => s.customize === 'editing' || s.customize === 'moving');

  const onPointerDown = (e: React.PointerEvent) => {
    const target = e.target as Element;
    // Controls opt out (and must not lose their tap to pointer capture). In the rail the Chicklet opts back in.
    if (target.closest('[data-no-panel-gesture]')) return;
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
      className={styles.panel}
      aria-label="Car status"
      data-car-panel
      initial={false}
      // The width change runs on the compositor (perf, 9.5): the box is always display-wide and slides left so its
      // right edge sits at the panel width; `.content` slides back by the same amount, so the scene stays put and
      // is clipped at the edge. Both are transform animations with the same timing, so they move in lockstep.
      animate={{
        transform: `translateX(${panelWidth(view, driving) - DISPLAY_W}px)`,
        backgroundColor: panelBg(view, driving),
      }}
      transition={transition.screen}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (start.current = null)}
    >
      <motion.div
        className={styles.content}
        initial={false}
        animate={{ transform: `translateX(${DISPLAY_W - panelWidth(view, driving)}px)` }}
        transition={transition.screen}
      >
        {/* Car status Full: round live-map peek top-right, under the car scene (Parked and Driving) */}
        <MapPeek view={view} />

        {/* State=Parked scene: shadows, car renders, callouts */}
        <motion.div
          className={styles.group}
          initial={false}
          animate={{ opacity: driving ? 0 : 1 }}
          transition={transition.screen}
        >
          <FlipLayer rects={scene.shadowPanel} view={view}>
            <Icon src={shadowPanel} color="var(--color-surface-sunken)" className={styles.fill} />
          </FlipLayer>
          <FlipLayer rects={scene.shadowFull} view={view}>
            <div className={styles.shadowMask}>
              <div className={styles.shadowFull} />
            </div>
          </FlipLayer>

          <FlipLayer rects={scene.reflection} view={view}>
            <img className={`${styles.fill} ${styles.render} ${styles.reflection}`} src={renderFull} alt="" />
          </FlipLayer>
          <FlipLayer rects={scene.renderPanel} view={view}>
            <img className={`${styles.fill} ${styles.render}`} src={renderPanel} alt="" />
          </FlipLayer>
          <FlipLayer rects={scene.renderFull} view={view}>
            <img className={`${styles.fill} ${styles.render}`} src={renderFull} alt="" />
          </FlipLayer>

          <Callouts view={view} />
        </motion.div>

        {/* State=Driving scene: road render + speed, limit sign, next turn */}
        <DrivingScene view={view} visible={driving} />
        <SpeedCluster view={view} visible={driving} />

        <PanelStatusBar view={view} driving={driving} />
        <Telltales view={view} driving={driving} />

        <SelfDriveLayer rect={selfDrive[driving ? 'driving' : 'parked'][view]} view={view} />

        {/* The widget bar lives in its own layer above the panel (WidgetBar/WidgetLayer) so it can dock on the map */}
        <motion.div
          className={styles.layer}
          style={TRIP_BASE}
          initial={false}
          // Full: shuffles to keep the widget + card pair centred, whichever side the widget is docked (9.4).
          // Same size in every view, so it moves on the compositor (flip from 0,0 = a pure translate).
          animate={flip(tripCardRect(view, dock), TRIP_BASE)}
          transition={transition.screen}
          ref={tripLayer}
          data-no-panel-gesture
        >
          {/* Car status shows the active trip while driving (driving = navigating), else Navigate / Home / Work */}
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={driving ? 'active' : 'search'}
              className={styles.fill}
              {...presets.fadeIn}
              transition={transition.toggle}
            >
              {driving ? <TripCardActive /> : <TripSearchCard />}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* On the box, not in .content: they ride the panel's right edge */}
      <div className={styles.divider} aria-hidden>
        <img src={divider} alt="" width={240} height={104} />
      </div>
      {/* Figma "handle": transparent 64×320 hit area over the grab pill */}
      <div className={styles.handle} data-panel-handle aria-hidden />
    </motion.section>
  );
}

/** Start Self-Driving: morphs with the panel like the other layers; hidden (and untappable) where Figma has none. */
const TRIP_BASE = { ...tripCardRect('full', DEFAULT_DOCK), left: 0, top: 0 };

/** A scene layer that morphs between views on the compositor (geometry.ts › flip). */
function FlipLayer({ rects, view, children }: { rects: Record<CarView, Rect>; view: CarView; children: ReactNode }) {
  const base = flipBase(rects);
  return (
    <motion.div
      className={styles.layer}
      style={flipStyle(base)}
      initial={false}
      animate={flip(rects[view], base)}
      transition={transition.screen}
    >
      {children}
    </motion.div>
  );
}

/** Any view change cross-fades it between its spots rather than sliding (Full, and the Driving rail — Anastasiya, 2026-10-29). */
function SelfDriveLayer({ rect, view }: { rect: (typeof selfDrive)['parked']['panel']; view: CarView }) {
  const shown = rect.opacity !== 0;
  const { animate, transition: t } = useFadeSwap({ ...rect, opacity: rect.opacity ?? 1 }, view, true, true); // soft (Anastasiya, 2026-10-29)
  const layer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (layer.current) layer.current.inert = !shown; // React 18 types lack `inert`
  }, [shown]);
  return (
    <motion.div
      ref={layer}
      className={styles.layer}
      initial={false}
      animate={animate}
      transition={t}
      data-no-panel-gesture
    >
      <Button variant="primary-transparent" width="100%" className={styles.selfDrive}>
        Start Self-Driving
      </Button>
    </motion.div>
  );
}
