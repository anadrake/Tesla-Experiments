import { MusicWidget } from './MusicWidget';
import { OdometerWidget, TireWidget } from './InfoWidgets';
import styles from './WidgetBar.module.css';

export const PAGE_COUNT = 3;
const PAGE_WIDTH = 600;

/** Swipeable widget list (scroll-snap; native momentum on iPad). Reports the active page while scrolling. */
export function InfoPages({ onScrollPage }: { onScrollPage: (page: number) => void }) {
  return (
    <div
      className={styles.list}
      onScroll={(e) => onScrollPage(Math.round(e.currentTarget.scrollLeft / PAGE_WIDTH))}
    >
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
