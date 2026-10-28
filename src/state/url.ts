import { SETTINGS_PAGES, useHud, type Mode, type SettingsPage } from './store';
import { DEFAULT_TRACK, parseTrack } from './widgets';

const TRACK_KEY = 'hud.widgetTrack';

/** localStorage can throw (private mode, blocked storage) — persistence is best-effort. */
function loadTrack() {
  try {
    return parseTrack(localStorage.getItem(TRACK_KEY));
  } catch {
    return null;
  }
}
function saveTrack(track: readonly string[]) {
  try {
    localStorage.setItem(TRACK_KEY, track.join(','));
  } catch {
    /* ignore */
  }
}

/**
 * Deep links: URL params mirror store state so any state can be opened directly
 * (used by scripts/shots.mjs and the reviewer agent). e.g. ?mode=dark&car=full|collapsed&music=collapsed|paused&widgets=music,energy,…&widget=<index>&customize=revealed|editing&nav=typing|navigating&overlay=apps&settings=<page>&keyboard=1 (Settings search typing)
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
  // Widget track: ?widgets= wins over the saved track (Q24), so shots/deep links are reproducible.
  const track = parseTrack(params.get('widgets')) ?? loadTrack();
  if (track) useHud.getState().setWidgetTrack(track);
  const widget = Number(params.get('widget'));
  if (Number.isInteger(widget) && widget >= 0 && widget < useHud.getState().widgetTrack.length)
    useHud.setState({ widgetPage: widget });

  const customize = params.get('customize');
  // Through the action, so editing gets the same rules as a tap (Full → Panel, other overlays close).
  if (customize === 'revealed' || customize === 'editing') useHud.getState().setCustomize(customize);

  let savedTrack = useHud.getState().widgetTrack;

  const sync = (s: ReturnType<typeof useHud.getState>) => {
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
    if (s.widgetTrack !== savedTrack) {
      savedTrack = s.widgetTrack;
      saveTrack(s.widgetTrack);
    }
    if (s.widgetTrack.join() !== DEFAULT_TRACK.join()) p.set('widgets', s.widgetTrack.join(','));
    else p.delete('widgets');
    if (s.customize !== 'off') p.set('customize', s.customize);
    else p.delete('customize');
    if (s.widgetPage) p.set('widget', String(s.widgetPage));
    else p.delete('widget');
    history.replaceState(null, '', `${location.pathname}?${p}`);
  };
  sync(useHud.getState()); // normalise the URL on load (e.g. a saved track, a stale empty param)
  useHud.subscribe(sync);
}
