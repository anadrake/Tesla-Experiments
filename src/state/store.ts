import { create } from 'zustand';

/**
 * Single app store. Every prototype flow is a state change here.
 * Add new fields per phase; if a field should be deep-linkable, add it to url.ts too.
 */
export type Mode = 'light' | 'dark';

/** Left car panel size: 630px panel beside the map, Full (Car status screen), or Collapsed rail (map expanded). */
export type CarView = 'panel' | 'full' | 'collapsed';

/** Navigation flow: idle (browsing) → typing (keyboard up) → navigating (route, turn list, trip card). */
export type NavState = 'idle' | 'typing' | 'navigating';
export const DEFAULT_DESTINATION = 'Tesla Headquarters';

/**
 * Driving ⇔ navigating (Q6: Map Driving = Navigating; Q13: a trip switches the panel to Driving).
 * Typing over an active trip still counts as driving.
 */
export const isDriving = (s: Pick<HudState, 'nav' | 'resumeTrip'>) =>
  s.nav === 'navigating' || (s.nav === 'typing' && s.resumeTrip);

export const TEMP_MIN = 60;
export const TEMP_MAX = 84;

export interface HudState {
  mode: Mode;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;

  /** Cabin temperature °F, shared across every screen (Figma Prototype collection). */
  driverTemp: number;
  passengerTemp: number;
  setDriverTemp: (t: number) => void;
  setPassengerTemp: (t: number) => void;

  carView: CarView;
  setCarView: (v: CarView) => void;

  /** Music widget: playback + Full/collapsed (pill) size. */
  playing: boolean;
  musicCollapsed: boolean;
  togglePlaying: () => void;
  toggleMusicCollapsed: () => void;
  favorite: boolean;
  toggleFavorite: () => void;

  /** Active widget in the widget bar (0 Music, 1 Odometer, 2 Tire Pressure) — remembered across sizes. */
  widgetPage: number;
  setWidgetPage: (page: number) => void;

  nav: NavState;
  /** Text in the Navigate field while typing. */
  query: string;
  destination: string;
  /** Typing over an active trip returns to it when the keyboard closes without Enter. */
  resumeTrip: boolean;
  openKeyboard: () => void;
  closeKeyboard: () => void;
  typeText: (text: string) => void;
  backspace: () => void;
  /** Enter / shortcut: start a trip to `to` (or the typed query, or the Figma default). */
  startTrip: (to?: string) => void;
  endTrip: () => void;
  /** PRND tap (Q5): P ⇄ D — starts a trip to the default destination, or ends the current one. */
  toggleDrive: () => void;
}

const systemMode = (): Mode =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const useHud = create<HudState>()((set) => ({
  mode: systemMode(),
  setMode: (mode) => set({ mode }),
  toggleMode: () => set((s) => ({ mode: s.mode === 'dark' ? 'light' : 'dark' })),

  driverTemp: 72,
  passengerTemp: 72,
  setDriverTemp: (driverTemp) => set({ driverTemp }),
  setPassengerTemp: (passengerTemp) => set({ passengerTemp }),

  carView: 'panel',
  // Figma: expanding the panel slides an open overlay (keyboard) away.
  setCarView: (carView) =>
    set((s) => ({
      carView,
      ...(carView === 'full' && s.nav === 'typing' ? { nav: s.resumeTrip ? 'navigating' : 'idle', resumeTrip: false } : {}),
    })),

  playing: true,
  musicCollapsed: false,
  togglePlaying: () => set((s) => ({ playing: !s.playing })),
  toggleMusicCollapsed: () => set((s) => ({ musicCollapsed: !s.musicCollapsed })),
  favorite: false,
  toggleFavorite: () => set((s) => ({ favorite: !s.favorite })),

  widgetPage: 0,
  setWidgetPage: (widgetPage) => set({ widgetPage }),

  nav: 'idle',
  query: '',
  destination: DEFAULT_DESTINATION,
  resumeTrip: false,
  openKeyboard: () => set((s) => ({ nav: 'typing', query: '', resumeTrip: s.nav === 'navigating' })),
  closeKeyboard: () =>
    set((s) => (s.nav === 'typing' ? { nav: s.resumeTrip ? 'navigating' : 'idle', resumeTrip: false } : {})),
  typeText: (text) => set((s) => ({ query: s.query + text })),
  backspace: () => set((s) => ({ query: s.query.slice(0, -1) })),
  startTrip: (to) =>
    set((s) => ({
      nav: 'navigating',
      destination: to ?? (s.query.trim() || DEFAULT_DESTINATION),
      query: '',
      resumeTrip: false,
    })),
  endTrip: () => set({ nav: 'idle', resumeTrip: false }),
  toggleDrive: () =>
    set((s) =>
      isDriving(s)
        ? { nav: 'idle', resumeTrip: false }
        : { nav: 'navigating', destination: DEFAULT_DESTINATION, query: '', resumeTrip: false },
    ),
}));
