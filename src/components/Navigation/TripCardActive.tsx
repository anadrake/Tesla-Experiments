import battery from '../../assets/icons/battery.svg?raw';
import more from '../../assets/icons/more.svg';
import { useHud } from '../../state/store';
import { Icon } from '../Icon/Icon';
import { ThemedSvg } from '../ThemedSvg/ThemedSvg';
import { Pressable } from '../Pressable/Pressable';
import styles from './Navigation.module.css';

const BATTERY_COLORS = { '#D0D1D2': 'var(--color-content-secondary)', '#242424': 'var(--color-surface-sunken)' };

/** Figma "Trip Card / Active" (359:9155): ETA, destination, distance, battery, End Trip. */
export function TripCardActive() {
  const destination = useHud((s) => s.destination);
  const endTrip = useHud((s) => s.endTrip);
  return (
    <div className={styles.tripCard}>
      <div className={styles.tripInfo}>
        <div className={styles.tripRow}>
          <span className="text-title-l">5:45pm</span>
          <span className={`text-title-l ${styles.secondary}`}>15 mi</span>
        </div>
        <div className={`${styles.tripRow} ${styles.secondary}`}>
          <span className={`text-title-m ${styles.ellipsis}`}>{destination}</span>
          <span className={`text-title-l ${styles.range}`}>
            90%
            <ThemedSvg svg={battery} colors={BATTERY_COLORS} className={styles.battery} />
          </span>
        </div>
      </div>
      <span className={styles.rule} />
      <div className={`text-title-m ${styles.tripActions}`}>
        <Pressable className={styles.endTrip} onClick={endTrip}>
          End Trip
        </Pressable>
        <span className={styles.divider} />
        <Pressable className={styles.more} aria-label="Trip options">
          <Icon src={more} size={32} color="var(--color-content-secondary)" />
        </Pressable>
      </div>
    </div>
  );
}
