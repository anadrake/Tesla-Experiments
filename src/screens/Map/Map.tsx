import compass from '../../assets/icons/compass.svg';
import globe from '../../assets/icons/globe.svg';
import traffic from '../../assets/icons/traffic.svg';
import location from '../../assets/icons/location.svg';
import supercharger from '../../assets/icons/supercharger.svg';
import { motion } from 'motion/react';
import { MAP_LEFT } from '../../components/CarPanel/geometry';
import { Icon } from '../../components/Icon/Icon';
import { Pressable } from '../../components/Pressable/Pressable';
import { useHud } from '../../state/store';
import { transition } from '../../tokens/motion';
import { AnimatePresence } from 'motion/react';
import { TripCardActive } from '../../components/Navigation/TripCardActive';
import { TurnList } from '../../components/Navigation/TurnList';
import { MapTiles } from './MapTiles';
import { NavigateField } from './NavigateField';
import { RouteLayer } from './RouteLayer';
import styles from './Map.module.css';

const DISPLAY_W = 1920;
const MAP_H = 1080;

/**
 * Figma "Map" (4690:41395), State=Default — browsing.
 * Sits in the Main slot at x = panel width (630, or 116 when the panel collapses — Map Parked · Expanded),
 * animating with the panel (0.4s). Tiles stay centred on the map, like Figma's re-centred map instance.
 * State=Driving (navigating): route on the tiles, turn list under the Navigate field, trip card bottom-left —
 * morphing in from 0% / 40px like Figma's Default→Driving Smart Animate. Tapping the map closes the keyboard.
 */
const MORPH_IN = { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 40 } };

export function MapView() {
  const left = MAP_LEFT[useHud((s) => s.carView)];
  const navigating = useHud((s) => s.nav === 'navigating');
  const closeKeyboard = useHud((s) => s.closeKeyboard);
  const width = DISPLAY_W - left;
  return (
    <motion.section
      className={styles.map}
      initial={false}
      animate={{ left, width }}
      transition={transition.screen}
      aria-label="Map"
    >
      <MapTiles width={width} height={MAP_H} onTap={closeKeyboard}>
        <RouteLayer />
      </MapTiles>

      {/* Map Top Bar background; its items live in shell/StatusCluster so they can move between screens (Q8) */}
      <div className={styles.topBar} />

      <NavigateField />

      <AnimatePresence>
        {navigating && (
          <motion.div key="turns" className={styles.turnList} {...MORPH_IN} transition={transition.screen}>
            <TurnList />
          </motion.div>
        )}
        {navigating && (
          <motion.div key="trip" className={styles.tripCard} {...MORPH_IN} transition={transition.screen}>
            <TripCardActive />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`${styles.controls} ${styles.compass}`}>
        <Pressable className={styles.control} aria-label="North up">
          <Icon src={compass} color="var(--color-icon-strong)" />
        </Pressable>
      </div>

      <div className={`${styles.controls} ${styles.layers}`}>
        {[
          { src: globe, label: 'Map style' },
          { src: traffic, label: 'Traffic' },
          { src: location, label: 'Locations' },
          { src: supercharger, label: 'Superchargers' },
        ].map((c) => (
          <Pressable key={c.label} className={styles.control} aria-label={c.label}>
            <Icon src={c.src} color="var(--color-icon-strong)" />
          </Pressable>
        ))}
      </div>

      <div className={`${styles.locationTag} text-body-l`}>San Francisco, CA</div>
    </motion.section>
  );
}
