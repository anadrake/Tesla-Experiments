import { SETTINGS_PAGES, useHud, type Mode, type SettingsPage } from './store';

/**
 * Deep links: URL params mirror store state so any state can be opened directly
 * (used by scripts/shots.mjs and the reviewer agent). e.g. ?mode=dark&car=full|collapsed&music=collapsed|paused&widget=0|1|2&nav=typing|navigating&overlay=apps&settings=<page>&keyboard=1 (Settings search typing)
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
  const page = params.get('settings');
  if (page && (SETTINGS_PAGES as readonly string[]).includes(page))
    useHud.setState({
      settingsOpen: true,
      settingsPage: page as SettingsPage,
      settingsTyping: page === 'search' && params.get('keyboard') === '1',
    });
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
    if (s.settingsOpen) p.set('settings', s.settingsPage);
    else p.delete('settings');
    if (s.settingsTyping) p.set('keyboard', '1');
    else p.delete('keyboard');
    if (s.widgetPage) p.set('widget', String(s.widgetPage));
    else p.delete('widget');
    history.replaceState(null, '', `${location.pathname}?${p}`);
  });
}
