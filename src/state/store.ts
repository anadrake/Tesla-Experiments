import { create } from 'zustand';

/**
 * Single app store. Every prototype flow is a state change here.
 * Add new fields per phase; if a field should be deep-linkable, add it to url.ts too.
 */
export type Mode = 'light' | 'dark';

/** Left car panel size: 630px panel beside the map, Full (Car status screen), or Collapsed rail (map expanded). */
export type CarView = 'panel' | 'full' | 'collapsed';

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
  setCarView: (carView) => set({ carView }),

  playing: true,
  musicCollapsed: false,
  togglePlaying: () => set((s) => ({ playing: !s.playing })),
  toggleMusicCollapsed: () => set((s) => ({ musicCollapsed: !s.musicCollapsed })),
  favorite: false,
  toggleFavorite: () => set((s) => ({ favorite: !s.favorite })),

  widgetPage: 0,
  setWidgetPage: (widgetPage) => set({ widgetPage }),
}));
