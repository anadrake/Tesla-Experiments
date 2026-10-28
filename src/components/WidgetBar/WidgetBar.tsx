import { AnimatePresence, motion, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import spotify from '../../assets/media/spotify.svg';
import spotifyChip from '../../assets/media/spotify-chip.svg';
import album from '../../assets/media/album-vampire.png';
import arrowUp from '../../assets/icons/arrow-up.svg';
import { isDriving, useHud } from '../../state/store';
import { presets, transition } from '../../tokens/motion';
import { Icon } from '../Icon/Icon';
import { InfoPages } from './pages';
import { WidgetIcon, type WidgetId } from './registry';
import { LIFT, usePullUp } from './usePullUp';
import { useDismissOnOutsideTap } from './useDismissOnOutsideTap';
import { TRACK } from './MusicWidget';
import styles from './WidgetBar.module.css';

/**
 * Figma "Dynamic Widget Bar" (4416:12286), Dot Nav=Hidden.
 * Open: 600×192 window, swipe horizontally between the widgets on `widgetTrack` (registry.tsx).
 * Dot nav (Q11): appears while swiping, fades out after DOTS_IDLE_MS without scrolling.
 * Collapsed panel shows the active widget as a Chicklet — taps fall through to the panel (→ Panel):
 *   mini  (Parked, 116 rail):  Music 4666:74587 · Odometer 4666:74579 · Tire 4666:74583
 *   large (Driving, 220 rail): Music 4596:70708 · Odometer 4596:70712 · Tire 4596:70716
 * Collapsed (music): 382×64 pill — tap to expand. Size change = duration/base.
 * Customize (Phase 8, Sketch 4802:103109): pull the bar up (usePullUp) → it lifts 64px and the Customize
 * button rises from under it. Tap anywhere else or pull down → back. Panel / Full while parked only (Q22).
 */
const DOTS_IDLE_MS = 1500;
/** Widgets with a designed Chicklet; the rest show their app icon (placeholder). */
const BESPOKE_CHICKLETS = new Set<WidgetId>(['music', 'odometer', 'tire']);

export function WidgetBar({ chicklet }: { chicklet?: 'mini' | 'large' }) {
  // The music pill only exists while Music is on the track.
  const collapsed = useHud((s) => s.musicCollapsed && s.widgetTrack.includes('music'));
  const toggle = useHud((s) => s.toggleMusicCollapsed);
  const track = useHud((s) => s.widgetTrack);
  const page = useHud((s) => s.widgetPage);
  const active = track[page] ?? track[0];
  const setPage = useHud((s) => s.setWidgetPage);
  const customize = useHud((s) => s.customize);
  const setCustomize = useHud((s) => s.setCustomize);
  const canCustomize = useHud((s) => !chicklet && s.carView !== 'collapsed' && !isDriving(s));
  const revealed = canCustomize && customize !== 'off';
  const { y, handlers } = usePullUp({
    enabled: canCustomize && customize !== 'editing',
    revealed,
    onReveal: () => setCustomize('revealed'),
    onHide: () => setCustomize('off'),
  });
  const reveal = useTransform(y, [0, -LIFT], [0, 1]);
  const buttonY = useTransform(y, [0, -LIFT], [LIFT / 4, 0]);
  const root = useRef<HTMLDivElement>(null);
  useDismissOnOutsideTap(root, revealed, () => setCustomize('off'));
  // Leaving the Panel / Full view or starting to drive drops customization.
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
          data-widget={active}
          {...presets.popIn}
          transition={transition.open}
        >
          {active === 'music' && (
            <>
              <img className={styles.chickletArt} src={album} alt={`${TRACK.title} album art`} />
              <img className={styles.chickletBadge} src={spotifyChip} alt="" width={25.8} height={25.8} />
              <span className={styles.chickletProgress}>
                <span style={{ width: `${TRACK.progress * 100}%` }} />
              </span>
            </>
          )}
          {active === 'odometer' && (
            <div className={styles.chickletText}>
              <p className="text-title-l">Odometer</p>
              <p className="text-title-m">
                26,422 <span className={styles.unit}>miles</span>
              </p>
            </div>
          )}
          {active === 'tire' && (
            <div className={`${styles.chickletText} ${styles.chickletTireLarge}`}>
              <p className="text-title-l">Tire Pressure</p>
              <p className="text-title-m">Front: 38,42psi</p>
              <p className="text-title-m">Rear: 38,42psi</p>
            </div>
          )}
          {!BESPOKE_CHICKLETS.has(active) && (
            <span className={styles.chickletIcon}>
              <WidgetIcon id={active} />
            </span>
          )}
        </motion.div>
      </div>
    );
  }

  if (chicklet === 'mini') {
    return (
      <motion.div key={active} className={styles.chicklet} {...presets.popIn} transition={transition.open}>
        {active === 'music' && (
          <>
            <img className={styles.chickletArt} src={album} alt={`${TRACK.title} album art`} />
            <img className={styles.chickletBadge} src={spotifyChip} alt="" width={25.8} height={25.8} />
          </>
        )}
        {active === 'odometer' && <p className={`text-title-m ${styles.chickletOdometer}`}>26,422</p>}
        {active === 'tire' && (
          <div className={`text-title-m ${styles.chickletTire}`}>
            <p>38,42</p>
            <p>38,42</p>
          </div>
        )}
        {!BESPOKE_CHICKLETS.has(active) && (
          <span className={styles.chickletIcon}>
            <WidgetIcon id={active} />
          </span>
        )}
      </motion.div>
    );
  }

  return (
    <div ref={root} className={styles.bar} {...handlers}>
      <motion.div className={styles.lift} style={{ y }}>
        <AnimatePresence initial={false} mode="popLayout">
          {collapsed ? (
            <motion.button
              key="pill"
              type="button"
              className={`${styles.pill} text-title-l`}
              onClick={toggle}
              aria-label="Expand music"
              {...presets.popIn}
              transition={transition.open}
              whileTap={{ scale: 0.97 }}
            >
              <span className={styles.pillIcon}>
                <Icon src={spotify} size={28.8} color="var(--color-icon-strong)" />
              </span>
              <span className={styles.pillTitle}>{TRACK.title}</span>
              <Icon src={arrowUp} color="var(--color-icon-strong)" />
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
    </div>
  );
}
