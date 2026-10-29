import { motion } from 'motion/react';
import type { CarView } from '../../state/store';
import { transition } from '../../tokens/motion';
import { DirectionPrimary } from '../Navigation/TurnList';
import { directionCard, directionCardWidth, placedMotion, speed, speedSign } from './geometry';
import styles from './SpeedCluster.module.css';

const ORIGIN = { left: 0, top: 0 };

/**
 * Driving: speed (Heading 80), speed-limit sign and the compact next-turn card. Enlarged in the Collapsed rail.
 * Moves and scales as `transform` strings, so they run on the compositor (perf, 9.5); laid out at 0,0.
 */
export function SpeedCluster({ view, visible }: { view: CarView; visible: boolean }) {
  const fade = (o: number) => (visible ? o : 0);
  const at = (p: (typeof speed)[CarView]) => ({
    ...placedMotion(p),
    opacity: fade(p.opacity),
  });
  return (
    <>
      <motion.div
        className={styles.speed}
        style={ORIGIN}
        initial={false}
        animate={at(speed[view])}
        transition={transition.screen}
      >
        <span className={styles.value}>29</span>
        <span className="text-body-m">MPH</span>
      </motion.div>
      <motion.div
        className={styles.sign}
        style={ORIGIN}
        initial={false}
        animate={at(speedSign[view])}
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
        style={ORIGIN}
        initial={false}
        // Width stays a (cheap, small) layout animation: the card's content reflows between 410 and 464.
        animate={{
          ...at(directionCard[view]),
          width: directionCardWidth[view],
        }}
        transition={transition.screen}
      >
        <DirectionPrimary />
      </motion.div>
    </>
  );
}
