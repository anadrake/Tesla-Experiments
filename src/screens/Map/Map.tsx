import compass from '../../assets/icons/compass.svg';
import globe from '../../assets/icons/globe.svg';
import traffic from '../../assets/icons/traffic.svg';
import location from '../../assets/icons/location.svg';
import supercharger from '../../assets/icons/supercharger.svg';
import { mapLeft } from '../../components/CarPanel/geometry';
import { Icon } from '../../components/Icon/Icon';
import { Pressable } from '../../components/Pressable/Pressable';
import { isDriving, useHud } from '../../state/store';
import { transition } from '../../tokens/motion';
import { AnimatePresence, motion } from 'motion/react';
import { useRef } from 'react';
import { useSlideX } from '../../lib/slide';
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
 * Shows right of the car panel (x = 630, or 116 when the panel collapses — Map Parked · Expanded), moving with it
 * (0.4s). Tiles stay centred on that part, like Figma's re-centred map instance.
 * Perf (9.5): the map box itself never resizes — it spans the display under the (opaque) panel, and only what
 * depends on the edge slides, on the compositor: the tiles by their centre, the left column by the edge.
 * Right-anchored controls / credit don't move at all.
 * State=Driving (navigating): route on the tiles, turn list under the Navigate field, trip card bottom-left —
 * morphing in from 0% / 40px like Figma's Default→Driving Smart Animate. Tapping the map closes overlays.
 */
const MORPH_IN = {
  initial: { opacity: 0, transform: 'translateY(40px)' },
  animate: { opacity: 1, transform: 'translateY(0px)' },
  exit: { opacity: 0, transform: 'translateY(40px)' },
};

export function MapView() {
  const view = useHud((s) => s.carView);
  const left = mapLeft(view, useHud(isDriving));
  const navigating = useHud((s) => s.nav === 'navigating');
  const closeOverlays = useHud((s) => s.closeOverlays);
  const width = DISPLAY_W - left;
  const tiles = useRef<HTMLDivElement>(null);
  const column = useRef<HTMLDivElement>(null);
  useSlideX(tiles, left + width / 2);
  useSlideX(column, left);
  return (
    <section className={styles.map} aria-label="Map">
      <div ref={tiles} className={styles.edgeFrame} style={{ left, width }}>
        <MapTiles width={width} height={MAP_H} onTap={closeOverlays}>
          <RouteLayer />
        </MapTiles>
      </div>

      {/* Map Top Bar background; its items live in shell/StatusCluster so they can move between screens (Q8) */}
      <div className={styles.topBar} />

      {/* Left column: rides the map's left edge */}
      <div ref={column} className={styles.edgeFrame} style={{ left, width: 0 }}>
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
      </div>

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

      {/* Map imagery is Culver City (Figma's tag said San Francisco — see WORKLOG) */}
      <div className={styles.mapMeta}>
        <p className={`${styles.credit} text-body-s`}>© OpenStreetMap contributors</p>
        <div className={`${styles.locationTag} text-body-l`}>San Francisco, CA</div>
      </div>
    </section>
  );
}
