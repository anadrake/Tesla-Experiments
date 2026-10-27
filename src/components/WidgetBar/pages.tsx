import { useLayoutEffect, useRef } from 'react';
import { MusicWidget } from './MusicWidget';
import { OdometerWidget, TireWidget } from './InfoWidgets';
import styles from './WidgetBar.module.css';

export const PAGE_COUNT = 3;
const PAGE_WIDTH = 600;

/**
 * Swipeable widget list (scroll-snap; native momentum on iPad). Reports the active page while scrolling,
 * and opens on `initialPage` so the widget you left is still showing after a size change.
 */
export function InfoPages({ initialPage, onScrollPage }: { initialPage: number; onScrollPage: (page: number) => void }) {
  const list = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (list.current) list.current.scrollLeft = initialPage * PAGE_WIDTH;
  }, []); // mount only: later page changes come from the user scrolling

  return (
    <div
      ref={list}
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
