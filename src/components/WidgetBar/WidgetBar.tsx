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
 * Mini Chicklet (4666:74587): 92×92 album art + Spotify badge, shown in the Collapsed panel.
 * Its taps fall through to the panel (Collapsed tap → Panel).
 * Collapsed (music): 382×64 pill — tap to expand. Size change = duration/base.
 */
const DOTS_IDLE_MS = 1500;

export function WidgetBar({ chicklet = false }: { chicklet?: boolean }) {
  const collapsed = useHud((s) => s.musicCollapsed);
  const toggle = useHud((s) => s.toggleMusicCollapsed);
  const [page, setPage] = useState(0);
  const [dotsVisible, setDotsVisible] = useState(false);
  const idle = useRef<ReturnType<typeof setTimeout>>();

  const onScrollPage = (p: number) => {
    setPage(p);
    setDotsVisible(true);
    clearTimeout(idle.current);
    idle.current = setTimeout(() => setDotsVisible(false), DOTS_IDLE_MS);
  };
  useEffect(() => () => clearTimeout(idle.current), []);

  if (chicklet) {
    return (
      <motion.div className={styles.chicklet} {...presets.popIn} transition={transition.open}>
        <img className={styles.chickletArt} src={album} alt={`${TRACK.title} album art`} />
        <img className={styles.chickletBadge} src={spotifyChip} alt="" width={25.8} height={25.8} />
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
            <InfoPages onScrollPage={onScrollPage} />
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
