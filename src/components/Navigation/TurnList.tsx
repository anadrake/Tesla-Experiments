import turnLeft from '../../assets/nav/turn-left.svg?raw';
import intersectionLeft from '../../assets/nav/intersection-left.svg?raw';
import { NAV_ICON_COLORS, ThemedSvg } from '../ThemedSvg/ThemedSvg';
import styles from './Navigation.module.css';

const NEXT = [
  { street: 'Washington Blvd', distance: '0.5 mi' },
  { street: 'Main St', distance: '0.5 mi' },
];

/** Figma "Turn List" (4299:81): Direction Primary + Direction Secondary rows. */
export function TurnList() {
  return (
    <div className={styles.turnList}>
      <div className={styles.current}>
        <ThemedSvg svg={turnLeft} colors={NAV_ICON_COLORS} className={styles.turnIcon} />
        <div className={styles.currentLabels}>
          <p className="text-heading-xl">200 ft</p>
          <p className={`text-heading-s ${styles.secondary} ${styles.ellipsis}`}>San Francisco Street</p>
        </div>
      </div>
      {NEXT.map((step) => (
        <div key={step.street} className={styles.next}>
          <ThemedSvg svg={intersectionLeft} colors={NAV_ICON_COLORS} className={styles.nextIcon} />
          <div className={`text-heading-s ${styles.nextRow}`}>
            <span className={styles.ellipsis}>{step.street}</span>
            <span>{step.distance}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
