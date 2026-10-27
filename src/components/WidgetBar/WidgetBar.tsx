import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import spotify from '../../assets/media/spotify.svg';
import spotifyChip from '../../assets/media/spotify-chip.svg';
import album from '../../assets/media/album-vampire.png';
import arrowUp from '../../assets/icons/arrow-up.svg';
import { useHud } from '../../state/store';
import { presets, transition } from '../../tokens/motion';
import { Icon } from '../Icon/Icon';
import { InfoPages, PAGE_COUNT } from './pages';
import { TRACK } from './MusicWidget';
import styles from './WidgetBar.module.css';

/**
 * Figma "Dynamic Widget Bar" (4416:12286), Dot Nav=Hidden.
 * Open: 600×192 window, swipe horizontally between Music / Odometer / Tire Pressure.
 * Dot nav (Q11): appears while swiping, fades out after DOTS_IDLE_MS without scrolling.
 * Collapsed panel shows the active widget as a Chicklet — taps fall through to the panel (→ Panel):
 *   mini  (Parked, 116 rail):  Music 4666:74587 · Odometer 4666:74579 · Tire 4666:74583
 *   large (Driving, 220 rail): Music 4596:70708 · Odometer 4596:70712 · Tire 4596:70716
 * Collapsed (music): 382×64 pill — tap to expand. Size change = duration/base.
 */
const DOTS_IDLE_MS = 1500;

export function WidgetBar({ chicklet }: { chicklet?: 'mini' | 'large' }) {
  const collapsed = useHud((s) => s.musicCollapsed);
  const toggle = useHud((s) => s.toggleMusicCollapsed);
  const page = useHud((s) => s.widgetPage);
  const setPage = useHud((s) => s.setWidgetPage);
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
        <motion.div key={page} className={styles.chickletLarge} data-page={page} {...presets.popIn} transition={transition.open}>
          {page === 0 && (
            <>
              <img className={styles.chickletArt} src={album} alt={`${TRACK.title} album art`} />
              <img className={styles.chickletBadge} src={spotifyChip} alt="" width={25.8} height={25.8} />
              <span className={styles.chickletProgress}>
                <span style={{ width: `${TRACK.progress * 100}%` }} />
              </span>
            </>
          )}
          {page === 1 && (
            <div className={styles.chickletText}>
              <p className="text-title-l">Odometer</p>
              <p className="text-title-m">
                26,422 <span className={styles.unit}>miles</span>
              </p>
            </div>
          )}
          {page === 2 && (
            <div className={`${styles.chickletText} ${styles.chickletTireLarge}`}>
              <p className="text-title-l">Tire Pressure</p>
              <p className="text-title-m">Front: 38,42psi</p>
              <p className="text-title-m">Rear: 38,42psi</p>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  if (chicklet === 'mini') {
    return (
      <motion.div key={page} className={styles.chicklet} {...presets.popIn} transition={transition.open}>
        {page === 0 && (
          <>
            <img className={styles.chickletArt} src={album} alt={`${TRACK.title} album art`} />
            <img className={styles.chickletBadge} src={spotifyChip} alt="" width={25.8} height={25.8} />
          </>
        )}
        {page === 1 && <p className={`text-title-m ${styles.chickletOdometer}`}>26,422</p>}
        {page === 2 && (
          <div className={`text-title-m ${styles.chickletTire}`}>
            <p>38,42</p>
            <p>38,42</p>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className={styles.bar}>
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
        {Array.from({ length: PAGE_COUNT }, (_, i) => (
          <span key={i} className={styles.dot} data-selected={i === page || undefined} />
        ))}
      </motion.div>
    </div>
  );
}
