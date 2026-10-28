import { useLayoutEffect, useRef } from 'react';
import { useHud } from '../../state/store';
import { TrackWidget, WIDGETS } from './registry';
import styles from './WidgetBar.module.css';

const PAGE_WIDTH = 600;

/**
 * Swipeable widget list (scroll-snap; native momentum on iPad), one page per entry in `widgetTrack`.
 * Reports the active page while scrolling, and opens on `initialPage` so the widget you left is still showing after a size change.
 */
export function InfoPages({ initialPage, onScrollPage }: { initialPage: number; onScrollPage: (page: number) => void }) {
  const track = useHud((s) => s.widgetTrack);
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
      {track.map((id) => (
        <section key={id} className={styles.page} aria-label={WIDGETS[id].ariaLabel} data-widget={id}>
          <TrackWidget id={id} />
        </section>
      ))}
    </div>
  );
}
