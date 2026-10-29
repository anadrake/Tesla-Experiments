import { useLayoutEffect, useRef, type RefObject } from 'react';
import { duration, easing, prefersReducedMotion } from '../tokens/motion';

/**
 * FLIP a horizontal layout jump onto the compositor (perf, 9.5): the element is laid out at its new `x` at once, then
 * slides there from where it was showing — a WAAPI transform, same timing as transition.screen, so it keeps pace with
 * the motion components morphing beside it. Picks up mid-slide if `x` changes again.
 */
export function useSlideX(ref: RefObject<HTMLElement>, x: number) {
  const prev = useRef(x);
  useLayoutEffect(() => {
    const el = ref.current;
    const from = prev.current;
    prev.current = x;
    if (!el || from === x) return;
    const t = getComputedStyle(el).transform;
    const showing = t && t !== 'none' ? new DOMMatrix(t).m41 : 0; // offset still on screen from a slide in flight
    el.getAnimations().forEach((a) => a.cancel());
    if (prefersReducedMotion()) return;
    el.animate([{ transform: `translateX(${from - x + showing}px)` }, { transform: 'translateX(0px)' }], {
      duration: duration.slow * 1000,
      easing: `cubic-bezier(${easing.standard.join(', ')})`,
    });
  }, [x]);
}
