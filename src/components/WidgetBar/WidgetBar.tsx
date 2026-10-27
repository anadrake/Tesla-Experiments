import { AnimatePresence, motion } from 'motion/react';
import spotify from '../../assets/media/spotify.svg';
import arrowUp from '../../assets/icons/arrow-up.svg';
import { useHud } from '../../state/store';
import { presets, transition } from '../../tokens/motion';
import { Icon } from '../Icon/Icon';
import { InfoPages } from './pages';
import { TRACK } from './MusicWidget';
import styles from './WidgetBar.module.css';

/**
 * Figma "Dynamic Widget Bar" (4416:12286), Dot Nav=Hidden.
 * Open: 600×192 window, swipe horizontally between Music / Odometer / Tire Pressure.
 * Collapsed (music): 382×64 pill — tap to expand. Size change = duration/base.
 */
export function WidgetBar() {
  const collapsed = useHud((s) => s.musicCollapsed);
  const toggle = useHud((s) => s.toggleMusicCollapsed);

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
            <InfoPages />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
