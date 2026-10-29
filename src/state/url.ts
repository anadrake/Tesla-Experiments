import { SETTINGS_PAGES, useHud, type Mode, type SettingsPage, type WidgetDock } from './store';
import { DEFAULT_TRACK, parseTrack } from './widgets';

const TRACK_KEY = 'hud.widgetTrack';
const DOCK_KEY = 'hud.widgetDock';

/** "map,right" → dock (only the non-default spots are listed; unknown words ignored). Null when empty. */
function parseDock(raw: string | null | undefined): WidgetDock | null {
  if (raw == null) return null;
  const words = raw.split(',');
  return { panel: words.includes('map') ? 'map' : 'panel', full: words.includes('right') ? 'right' : 'left' };
}
const dockParam = (d: WidgetDock) => [d.panel === 'map' && 'map', d.full === 'right' && 'right'].filter(Boolean).join(',');

/** localStorage can throw (private mode, blocked storage) — persistence is best-effort. */
function loadTrack() {
  try {
    return parseTrack(localStorage.getItem(TRACK_KEY));
  } catch {
    return null;
  }
}
function saveTrack(track: readonly string[]) {
  save(TRACK_KEY, track.join(','));
}
function loadDock() {
  try {
    return parseDock(localStorage.getItem(DOCK_KEY));
  } catch {
    return null;
  }
}
function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

/**
 * Deep links: URL params mirror store state so any state can be opened directly
 * (used by scripts/shots.mjs and the reviewer agent). e.g. ?mode=dark&car=full|collapsed&music=collapsed|paused&widgets=music,energy,…&widget=<index>&customize=revealed|editing|moving&widgetDock=map,right&nav=typing|navigating&overlay=apps&settings=<page>&keyboard=1 (Settings search typing)
 */
export function initUrlSync() {
  const params = new URLSearchParams(location.search);
  const mode = params.get('mode');
  if (mode === 'light' || mode === 'dark') useHud.getState().setMode(mode as Mode);
  const car = params.get('car');
  if (car === 'full' || car === 'collapsed') useHud.setState({ carView: car });
  // ?bar=collapsed (older links: ?music=collapsed) — the pill of the widget on ?widget=.
  if (params.get('bar') === 'collapsed' || params.get('music') === 'collapsed') useHud.setState({ widgetsCollapsed: true });
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

  // Dock (9.4): ?widgetDock= wins over the saved one (Q35), like the track. `?widgetDock=` (empty) = defaults.
  const dock = parseDock(params.get('widgetDock')) ?? loadDock();
  if (dock) useHud.setState({ widgetDock: dock });

  const customize = params.get('customize');
  // Through the action, so editing gets the same rules as a tap (Full → Panel, other overlays close).
  if (customize === 'revealed' || customize === 'editing' || customize === 'moving') useHud.getState().setCustomize(customize);

  let savedTrack = useHud.getState().widgetTrack;
  let savedDock = useHud.getState().widgetDock;

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
    if (s.widgetDock !== savedDock) {
      savedDock = s.widgetDock;
      save(DOCK_KEY, dockParam(s.widgetDock));
    }
    const dockP = dockParam(s.widgetDock);
    if (dockP) p.set('widgetDock', dockP);
    else p.delete('widgetDock');
    if (s.widgetTrack.join() !== DEFAULT_TRACK.join()) p.set('widgets', s.widgetTrack.join(','));
    else p.delete('widgets');
    if (s.customize !== 'off') p.set('customize', s.customize);
    else p.delete('customize');
    if (s.widgetsCollapsed) p.set('bar', 'collapsed');
    else p.delete('bar');
    if (p.get('music') === 'collapsed') p.delete('music');
    if (s.widgetPage) p.set('widget', String(s.widgetPage));
    else p.delete('widget');
    history.replaceState(null, '', `${location.pathname}?${p}`);
  };
  sync(useHud.getState()); // normalise the URL on load (e.g. a saved track, a stale empty param)
  useHud.subscribe(sync);
}
