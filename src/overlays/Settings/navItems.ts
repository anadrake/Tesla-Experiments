import search from '../../assets/settings/nav26/search.svg';
import controls from '../../assets/settings/nav26/controls.svg';
import dynamics from '../../assets/settings/nav26/dynamics.svg';
import charging from '../../assets/settings/nav26/charging.svg';
import selfDriving from '../../assets/settings/nav26/self-driving.svg';
import locks from '../../assets/settings/nav26/locks.svg';
import lights from '../../assets/settings/nav26/lights.svg';
import seats from '../../assets/settings/nav26/seats.svg';
import display from '../../assets/settings/nav26/display.svg';
import schedule from '../../assets/settings/nav26/schedule.svg';
import safety from '../../assets/settings/nav26/safety.svg';
import service from '../../assets/settings/nav26/service.svg';
import software from '../../assets/settings/nav26/software.svg';
import navigation from '../../assets/settings/nav26/navigation.svg';
import trips from '../../assets/settings/nav26/trips.svg';
import profiles from '../../assets/settings/nav26/profiles.svg';
import wifi from '../../assets/settings/nav26/wifi.svg';
import bluetooth from '../../assets/settings/nav26/bluetooth.svg';
import audio from '../../assets/settings/nav26/audio.svg';
import upgrades from '../../assets/settings/nav26/upgrades.svg';
import type { SettingsPage } from '../../state/store';

/** Search Settings row, above the scrolling list (Figma Navtree 4932:15). */
export const SEARCH_ITEM = { page: 'search' as const, label: 'Search Settings', icon: search };

/**
 * Figma Settings 2026 / Navtree (4932:14) order. `size` = the glyph's own size, centred in the 48 icon slot: Figma
 * draws Schedule / Bluetooth / Audio at 24 / 24 / 40 in a slot that shrinks with them, so their labels sit out of
 * line — kept the glyph size, lined the labels up (WORKLOG, Figma bugs). Wi-Fi: the screens use Photo / Icon / wifi
 * (4969:25662, 32 box); the Navtree component still has the Seats glyph there.
 */
export const NAV_ITEMS: { page: SettingsPage; label: string; icon: string; size?: number }[] = [
  { page: 'controls', label: 'Controls', icon: controls },
  { page: 'dynamics', label: 'Dynamics', icon: dynamics },
  { page: 'charging', label: 'Charging', icon: charging },
  { page: 'self-driving', label: 'Self-Driving', icon: selfDriving },
  { page: 'locks', label: 'Locks', icon: locks },
  { page: 'lights', label: 'Lights', icon: lights },
  { page: 'seats', label: 'Seats', icon: seats },
  { page: 'display', label: 'Display', icon: display },
  { page: 'schedule', label: 'Schedule', icon: schedule, size: 24 },
  { page: 'safety', label: 'Safety', icon: safety },
  { page: 'service', label: 'Service', icon: service },
  { page: 'software', label: 'Software', icon: software },
  { page: 'navigation', label: 'Navigation', icon: navigation },
  { page: 'trips', label: 'Trips', icon: trips },
  { page: 'profiles', label: 'Profiles', icon: profiles },
  { page: 'wifi', label: 'Wi-Fi', icon: wifi, size: 32 },
  { page: 'bluetooth', label: 'Bluetooth', icon: bluetooth, size: 24 },
  { page: 'audio', label: 'Audio', icon: audio, size: 40 },
  { page: 'upgrades', label: 'Upgrades', icon: upgrades },
];
