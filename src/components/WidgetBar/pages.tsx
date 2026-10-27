import { MusicWidget } from './MusicWidget';
import { OdometerWidget, TireWidget } from './InfoWidgets';
import styles from './WidgetBar.module.css';

/** Swipeable widget list (scroll-snap; native momentum on iPad). */
export function InfoPages() {
  return (
    <div className={styles.list}>
      <section className={styles.page} aria-label="Music">
        <MusicWidget />
      </section>
      <section className={styles.page} aria-label="Trip stats">
        <OdometerWidget />
      </section>
      <section className={styles.page} aria-label="Tire pressure">
        <TireWidget />
      </section>
    </div>
  );
}
