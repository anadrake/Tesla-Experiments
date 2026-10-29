import { motion } from 'motion/react';
import type { CarView } from '../../state/store';
import { transition } from '../../tokens/motion';
import { DirectionPrimary } from '../Navigation/TurnList';
import { directionCard, directionCardWidth, speed, speedSign } from './geometry';
import styles from './SpeedCluster.module.css';

/** Driving: speed (Heading 80), speed-limit sign and the compact next-turn card. Enlarged in the Collapsed rail. */
export function SpeedCluster({ view, visible }: { view: CarView; visible: boolean }) {
  const fade = (o: number) => (visible ? o : 0);
  return (
    <>
      <motion.div
        className={styles.speed}
        initial={false}
        animate={{ ...speed[view], opacity: fade(speed[view].opacity) }}
        transition={transition.screen}
      >
        <span className={styles.value}>29</span>
        <span className="text-body-m">MPH</span>
      </motion.div>
      <motion.div
        className={styles.sign}
        initial={false}
        animate={{ ...speedSign[view], opacity: fade(speedSign[view].opacity) }}
        transition={transition.screen}
        aria-label="Speed limit 80"
      >
        <span className={styles.signLabel}>
          SPEED
          <br />
          LIMIT
        </span>
        <span className={styles.signValue}>80</span>
      </motion.div>
      <motion.div
        className={styles.direction}
        initial={false}
        animate={{ ...directionCard[view], width: directionCardWidth[view], opacity: fade(directionCard[view].opacity) }}
        transition={transition.screen}
      >
        <DirectionPrimary />
      </motion.div>
    </>
  );
}
