import { AnimatePresence, motion } from 'motion/react';
import destinationPin from '../../assets/map/marker-destination.svg';
import navArrow from '../../assets/map/nav-arrow.svg';
import { useHud } from '../../state/store';
import { duration, easing, presets, transition } from '../../tokens/motion';
import route from './routeData.json';
import styles from './Map.module.css';

/** Route polyline in tile px, from scripts/render-map.mjs (real roads via OSRM). */
const POINTS = route.route.map(([x, y]) => `${x},${y}`).join(' ');

/**
 * Route, destination pin and car arrow — inside the map tile layer, so they pan/zoom with the map.
 * Shown while navigating; the line draws along the road (Figma "Route draw").
 */
export function RouteLayer() {
  const navigating = useHud((s) => s.nav === 'navigating');
  return (
    <AnimatePresence>
      {navigating && (
        <motion.div key="route" className={styles.route} {...presets.fadeIn} transition={transition.toggle}>
          <svg className={styles.routeSvg} viewBox={`0 0 ${route.tile} ${route.tile}`} aria-hidden>
            <motion.polyline
              points={POINTS}
              fill="none"
              stroke="var(--color-map-route)"
              strokeWidth={7}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: duration.deliberate, ease: easing.enter }}
            />
          </svg>
          <motion.img
            className={styles.pin}
            src={destinationPin}
            alt=""
            style={{ left: route.destination[0] - 15.5, top: route.destination[1] - 45, width: 31, height: 45 }}
            {...presets.popIn}
            transition={{ ...transition.open, delay: duration.base }}
          />
          <img
            className={styles.pin}
            src={navArrow}
            alt=""
            style={{
              left: route.car[0] - 30.75,
              top: route.car[1] - 30.75,
              width: 61.5,
              height: 61.5,
              transform: `rotate(${route.carHeadingDeg}deg)`,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
