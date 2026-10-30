import { RowAction } from '../photo/Photo';
import styles from './pages.module.css';

/** Figma Settings 2026 / Upgrades (4934:1457): empty state, centred in the 839 content viewport. Static (Q41). */
export function UpgradesPage() {
  return (
    <div className={styles.emptyState}>
      <p className={`text-heading-s ${styles.photoPrimary}`}>No upgrades</p>
      <p className={`text-title-m ${styles.emptyText}`}>
        No subscriptions available to purchase from your car at this time. To manage subscriptions or view more options,
        check your Tesla mobile app.
      </p>
      <span className={styles.retry}>
        <RowAction width={340}>Retry</RowAction>
      </span>
    </div>
  );
}
