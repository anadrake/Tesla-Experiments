import { useHud, type Mode } from './store';

/**
 * Deep links: URL params mirror store state so any state can be opened directly
 * (used by scripts/shots.mjs and the reviewer agent). e.g. ?mode=dark&car=full|collapsed&music=collapsed|paused&widget=0|1|2&nav=typing|navigating&overlay=apps
 */
export function initUrlSync() {
  const params = new URLSearchParams(location.search);
  const mode = params.get('mode');
  if (mode === 'light' || mode === 'dark') useHud.getState().setMode(mode as Mode);
  const car = params.get('car');
  if (car === 'full' || car === 'collapsed') useHud.setState({ carView: car });
  if (params.get('music') === 'collapsed') useHud.setState({ musicCollapsed: true });
  if (params.get('music') === 'paused') useHud.setState({ playing: false });
  const nav = params.get('nav');
  if (nav === 'typing' || nav === 'navigating') useHud.setState({ nav });
  if (params.get('overlay') === 'apps') useHud.setState({ quickActions: true });
  const widget = Number(params.get('widget'));
  if (widget >= 0 && widget <= 2) useHud.setState({ widgetPage: widget });

  useHud.subscribe((s) => {
    const p = new URLSearchParams(location.search);
    p.set('mode', s.mode);
    if (s.carView !== 'panel') p.set('car', s.carView);
    else p.delete('car');
    if (s.nav !== 'idle') p.set('nav', s.nav);
    else p.delete('nav');
    if (s.quickActions) p.set('overlay', 'apps');
    else p.delete('overlay');
    if (s.widgetPage) p.set('widget', String(s.widgetPage));
    else p.delete('widget');
    history.replaceState(null, '', `${location.pathname}?${p}`);
  });
}
