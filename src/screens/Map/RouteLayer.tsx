import { AnimatePresence, motion } from 'motion/react';
import routeLine from '../../assets/map/route-line.svg';
import spotlight from '../../assets/map/marker-spotlight.svg';
import park from '../../assets/map/marker-park.svg';
import cross from '../../assets/map/marker-cross.svg';
import destination from '../../assets/map/marker-destination.svg';
import shield from '../../assets/map/highway-shield.svg';
import navArrow from '../../assets/map/nav-arrow.svg';
import { useHud } from '../../state/store';
import { duration, easing, presets, transition } from '../../tokens/motion';
import styles from './Map.module.css';

/** Pictograms in route-container px (Figma Map State=Driving › map canvas › route). */
const PINS = [
  { src: spotlight, left: 1058.25, top: 338, w: 31, h: 45 },
  { src: spotlight, left: 336.6, top: 270.8, w: 31, h: 45 },
  { src: spotlight, left: 1625.25, top: 718.8, w: 31, h: 45 },
  { src: park, left: 1249.4, top: 1235.4, w: 31, h: 45 },
  { src: cross, left: 251.45, top: 820.21, w: 29, h: 41 },
  { src: destination, left: 1337.6, top: 868.6, w: 31, h: 45 },
  { src: shield, left: 1514.38, top: 209.34, w: 39.9, h: 38.7 },
  { src: shield, left: 693.98, top: 445.94, w: 39.9, h: 38.7 },
];

/**
 * Route, pins and the car arrow — lives inside the map tile layer, so it pans/zooms with the map.
 * Shown while navigating; the route line draws outward from the car (Figma "Route draw" style).
 */
export function RouteLayer() {
  const navigating = useHud((s) => s.nav === 'navigating');
  return (
    <AnimatePresence>
      {navigating && (
        <motion.div key="route" className={styles.route} {...presets.fadeIn} transition={transition.toggle}>
          <div className={styles.routeLineBox}>
            <motion.img
              className={styles.routeLine}
              src={routeLine}
              alt=""
              initial={{ clipPath: 'inset(50% 0 50% 0)' }}
              animate={{ clipPath: 'inset(0% 0 0% 0)' }}
              transition={{ duration: duration.deliberate, ease: easing.enter }}
            />
          </div>
          {PINS.map((pin, i) => (
            <motion.img
              key={i}
              className={styles.pin}
              src={pin.src}
              alt=""
              style={{ left: pin.left, top: pin.top, width: pin.w, height: pin.h }}
              {...presets.popIn}
              transition={{ ...transition.open, delay: duration.base }}
            />
          ))}
          {/* car heading follows the route (≈27° up-right, matches the Navigating reference) */}
          <img
            className={styles.pin}
            src={navArrow}
            alt=""
            style={{ left: 860.46, top: 403.19, width: 61.5, height: 61.5, transform: 'rotate(-27deg)' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
