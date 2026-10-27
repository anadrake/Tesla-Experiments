import { create } from 'zustand';

/**
 * Single app store. Every prototype flow is a state change here.
 * Add new fields per phase; if a field should be deep-linkable, add it to url.ts too.
 */
export type Mode = 'light' | 'dark';

/** Left car panel size: 630px panel beside the map, or Full (Car status screen). */
export type CarView = 'panel' | 'full';

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
  toggleCarView: () => void;

  /** Music widget: playback + Full/collapsed (pill) size. */
  playing: boolean;
  musicCollapsed: boolean;
  togglePlaying: () => void;
  toggleMusicCollapsed: () => void;
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
  toggleCarView: () => set((s) => ({ carView: s.carView === 'panel' ? 'full' : 'panel' })),

  playing: true,
  musicCollapsed: false,
  togglePlaying: () => set((s) => ({ playing: !s.playing })),
  toggleMusicCollapsed: () => set((s) => ({ musicCollapsed: !s.musicCollapsed })),
}));
