import { useEffect, useRef, type RefObject } from 'react';

/** How long after the dismissing pointerdown its click may still arrive (not a motion duration). */
const CLICK_WINDOW_MS = 600;

/**
 * While `active`, a tap anywhere outside `ref` calls `onDismiss` — and only that: the tap is swallowed,
 * so tapping the map or the car to put the Customize button away doesn't also open something.
 */
export function useDismissOnOutsideTap(ref: RefObject<HTMLElement>, active: boolean, onDismiss: () => void) {
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;

  useEffect(() => {
    if (!active) return;
    const stopClick = (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
    };
    const onDown = (e: PointerEvent) => {
      if (ref.current?.contains(e.target as Node)) return;
      // Capture phase on window runs before React's root listener, so the tap never reaches the app.
      e.stopPropagation();
      window.addEventListener('click', stopClick, { capture: true, once: true });
      setTimeout(() => window.removeEventListener('click', stopClick, { capture: true }), CLICK_WINDOW_MS);
      dismiss.current();
    };
    window.addEventListener('pointerdown', onDown, { capture: true });
    return () => {
      window.removeEventListener('pointerdown', onDown, { capture: true });
      // Leave a pending click swallow in place: the dismissing tap's click may still be on its way.
    };
  }, [active, ref]);
}
