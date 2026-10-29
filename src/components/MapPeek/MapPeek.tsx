import { motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import peekMask from '../../assets/map/peek-mask.svg';
import { useHud, type CarView } from '../../state/store';
import { transition } from '../../tokens/motion';
import { MapImagery, TILE } from '../../screens/Map/MapTiles';
import { RouteLayer } from '../../screens/Map/RouteLayer';
import route from '../../screens/Map/routeData.json';
import styles from './MapPeek.module.css';

/**
 * Car status Full: a soft, round peek at the live map in the top-right (Figma New Map Light / Dark,
 * Mask group 4889:40166 / 4889:40165). Same imagery + route as the main map, so routed / not routed and
 * Day / Night follow the app (Q29). Not pannable. Tap → open the map: car view Full → Panel (Q31).
 *
 * Figma's mask box differs Light (647×660 @ 1393,−105) vs Dark (741×735 @ 1372,−289) — built midway (Q30).
 * The map sits rotated −14.3° and at 0.6× (as Figma's pasted map), with the car where Figma's arrow is.
 */
/** Figma's mask ellipse, midway Light ↔ Dark (Q30): 694×698 at (1383, −197). */
const ELLIPSE = { left: 1383, top: -197, width: 694, height: 698 };
/**
 * The box is the mask: Figma's ellipse grown 1.25× toward the lower left (top-right corner fixed), so its soft
 * core lands on screen (the midway spot sits ~90px higher than Light's). Mask and box are the same size, so the
 * fade reaches 0 before any box edge — no hard corners (the box used to clip a larger mask in Dark).
 */
const GROW = 1.25;
const BOX = {
  left: ELLIPSE.left + ELLIPSE.width * (1 - GROW),
  top: ELLIPSE.top,
  width: ELLIPSE.width * GROW,
  height: ELLIPSE.height * GROW,
};
/** Where the car lands inside the box (Figma Light: car arrow at display 1626,125). */
const CAR_AT = { x: 1626 - BOX.left, y: 125 - BOX.top };
const ROTATE = -14.3;
/** Figma's peek is the map screenshot shrunk (labels / nav arrow ≈ 0.6 of the main map's). */
const SCALE = 0.6;
const [CAR_X, CAR_Y] = route.car;

export function MapPeek({ view }: { view: CarView }) {
  const setCarView = useHud((s) => s.setCarView);
  const shown = view === 'full';
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.inert = !shown; // React 18 types lack `inert`
  }, [shown]);

  return (
    <motion.button
      ref={ref}
      type="button"
      className={styles.peek}
      style={{ ...BOX, maskImage: `url("${peekMask}")`, WebkitMaskImage: `url("${peekMask}")` }}
      initial={false}
      animate={{ opacity: shown ? 1 : 0 }}
      transition={transition.screen}
      onClick={() => setCarView('panel')}
      aria-label="Open map"
      data-no-panel-gesture
    >
      <div
        className={styles.map}
        style={{
          left: CAR_AT.x - CAR_X,
          top: CAR_AT.y - CAR_Y,
          width: TILE,
          height: TILE,
          transformOrigin: `${CAR_X}px ${CAR_Y}px`,
          transform: `rotate(${ROTATE}deg) scale(${SCALE})`,
        }}
      >
        <MapImagery />
        <RouteLayer />
      </div>
    </motion.button>
  );
}
