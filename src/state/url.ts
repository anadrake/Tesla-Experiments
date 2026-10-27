import { useHud, type Mode } from './store';

/**
 * Deep links: URL params mirror store state so any state can be opened directly
 * (used by scripts/shots.mjs and the reviewer agent). e.g. ?mode=dark
 */
export function initUrlSync() {
  const params = new URLSearchParams(location.search);
  const mode = params.get('mode');
  if (mode === 'light' || mode === 'dark') useHud.getState().setMode(mode as Mode);

  useHud.subscribe((s) => {
    const p = new URLSearchParams(location.search);
    p.set('mode', s.mode);
    history.replaceState(null, '', `${location.pathname}?${p}`);
  });
}
