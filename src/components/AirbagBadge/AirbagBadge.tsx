import airbag from '../../assets/icons/airbag.svg';
import styles from './AirbagBadge.module.css';

/** Figma "pictogram/telltale/airbag-off-badge" (4221:19111) — fixed colors in both modes. */
export function AirbagBadge() {
  return (
    <div className={styles.badge}>
      <img src={airbag} alt="" width={21} height={25.7} />
      <p className={styles.label}>
        PASSENGER
        <br />
        AIRBAG OFF
      </p>
    </div>
  );
}
