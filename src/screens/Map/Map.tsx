import search from '../../assets/icons/search.svg';
import compass from '../../assets/icons/compass.svg';
import globe from '../../assets/icons/globe.svg';
import traffic from '../../assets/icons/traffic.svg';
import location from '../../assets/icons/location.svg';
import supercharger from '../../assets/icons/supercharger.svg';
import { Icon } from '../../components/Icon/Icon';
import { Pressable } from '../../components/Pressable/Pressable';
import { MapTiles } from './MapTiles';
import { MapTopBar } from './MapTopBar';
import styles from './Map.module.css';

const PANEL_W = 630; // --size-panel-default
const MAP_W = 1920 - PANEL_W;
const MAP_H = 1080;

/**
 * Figma "Map" (4690:41395), State=Default — browsing.
 * Sits in the Main slot at x = panel width.
 * TODO P3: Navigate field opens Keyboard; turn list + trip card (State=Driving).
 */
export function MapView() {
  return (
    <section className={styles.map} style={{ left: PANEL_W, width: MAP_W }} aria-label="Map">
      <MapTiles width={MAP_W} height={MAP_H} baseLeft={MAP_W / 2 - 1 - 980} baseTop={MAP_H / 2 - 105 - 980} />

      <MapTopBar />

      <Pressable className={styles.navigateField} aria-label="Navigate" whileTap={{ scale: 0.99 }}>
        <Icon src={search} color="var(--color-content-secondary)" />
        <span className="text-title-l">Navigate</span>
      </Pressable>

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
    </section>
  );
}
