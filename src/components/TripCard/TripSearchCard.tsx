import search from '../../assets/icons/search-40.svg';
import home from '../../assets/icons/home.svg';
import briefcase from '../../assets/icons/briefcase.svg';
import { Icon } from '../Icon/Icon';
import { Pressable } from '../Pressable/Pressable';
import { useHud } from '../../state/store';
import styles from './TripSearchCard.module.css';

/**
 * Figma "Trip Card / Search" (359:9111): Navigate + Home / Work (Car status screen).
 * Navigate → back to the map with the keyboard up; Home / Work → straight into a trip.
 */
export function TripSearchCard() {
  const { setCarView, openKeyboard, startTrip } = useHud();
  const toMap = (then: () => void) => {
    setCarView('panel');
    then();
  };
  return (
    <div className={`${styles.card} text-title-m`}>
      <Pressable className={styles.navigate} whileTap={{ scale: 0.99 }} aria-label="Navigate" onClick={() => toMap(openKeyboard)}>
        <Icon src={search} size={40} color="var(--color-content-secondary)" />
        Navigate
      </Pressable>
      <span className={styles.rule} />
      <div className={styles.shortcuts}>
        <Pressable className={styles.shortcut} aria-label="Navigate home" onClick={() => toMap(() => startTrip('Home'))}>
          <Icon src={home} size={32} color="var(--color-content-secondary)" />
          Home
        </Pressable>
        <span className={styles.divider} />
        <Pressable className={styles.shortcut} aria-label="Navigate to work" onClick={() => toMap(() => startTrip('Work'))}>
          <Icon src={briefcase} size={32} color="var(--color-content-secondary)" />
          Work
        </Pressable>
      </div>
    </div>
  );
}
