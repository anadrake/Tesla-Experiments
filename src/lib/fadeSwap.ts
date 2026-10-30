import { useEffect, useRef } from 'react';
import { transition } from '../tokens/motion';

type Values = Record<string, string | number>;
type Animate<T extends Values> = { [K in keyof T]: T[K] | T[K][] };

const same = (a: Values, b: Values) => Object.keys(b).every((k) => a[k] === b[k]);

/**
 * Moves that should cross-fade instead of slide (Anastasiya, 2026-10-29: into / out of the car Full view, the
 * Self-Driving button, battery and the map-docked widget fade rather than travel across the screen).
 * When `scene` changes and `fade` is on: opacity dips to 0 and back (`transition.fadeSwap`) while every other value
 * jumps to `to` at the dip (`transition.fadeSwapJump`). Any other change returns `to` as is with `transition.screen` (the normal slide).
 * The result is kept (same values) until the next change, so a re-render mid-fade doesn't restart it as a slide.
 */
export function useFadeSwap<T extends Values>(to: T, scene: string, fade: boolean) {
  const last = useRef<{ scene: string; to: T; animate: T | Animate<T>; swapping: boolean; swaps: number } | null>(null);
  const prev = last.current;
  let animate: T | Animate<T> = to;
  let swapping = false;
  let swaps = prev?.swaps ?? 0;
  if (prev && prev.scene === scene && same(prev.to, to)) ({ animate, swapping } = prev);
  else if (prev && prev.scene !== scene && fade) {
    swapping = true;
    swaps++;
    // motion skips keyframes equal to the last ones (shallow compare), and the opacity dip repeats every swap —
    // alternate an invisible 0 / 0.001 so each swap animates.
    const dip = swaps % 2 ? 0 : 0.001;
    animate = Object.fromEntries(
      Object.keys(to).map((k) => {
        const [a, b] = [prev.to[k] ?? to[k], to[k]];
        return [k, k === 'opacity' ? [a, dip, dip, b] : b];
      }),
    ) as Animate<T>;
  }
  useEffect(() => {
    last.current = { scene, to, animate, swapping, swaps };
  });
  const jumps = Object.fromEntries(Object.keys(to).filter((k) => k !== 'opacity').map((k) => [k, transition.fadeSwapJump]));
  return { animate, transition: swapping ? { ...transition.fadeSwap, ...jumps } : transition.screen };
}
