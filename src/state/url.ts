import { useHud, type Mode } from './store';

/**
 * Deep links: URL params mirror store state so any state can be opened directly
 * (used by scripts/shots.mjs and the reviewer agent). e.g. ?mode=dark&car=full&music=collapsed
 */
export function initUrlSync() {
  const params = new URLSearchParams(location.search);
  const mode = params.get('mode');
  if (mode === 'light' || mode === 'dark') useHud.getState().setMode(mode as Mode);
  if (params.get('car') === 'full') useHud.setState({ carView: 'full' });
  if (params.get('music') === 'collapsed') useHud.setState({ musicCollapsed: true });
  if (params.get('music') === 'paused') useHud.setState({ playing: false });

  useHud.subscribe((s) => {
    const p = new URLSearchParams(location.search);
    p.set('mode', s.mode);
    if (s.carView === 'full') p.set('car', 'full');
    else p.delete('car');
    history.replaceState(null, '', `${location.pathname}?${p}`);
  });
}
