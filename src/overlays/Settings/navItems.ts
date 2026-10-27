import search from '../../assets/settings/nav-search.svg';
import controls from '../../assets/settings/nav-controls.svg';
import pedals from '../../assets/settings/nav-pedals.svg';
import charging from '../../assets/settings/nav-charging.svg';
import autopilot from '../../assets/settings/nav-autopilot.svg';
import locks from '../../assets/settings/nav-locks.svg';
import lights from '../../assets/settings/nav-lights.svg';
import display from '../../assets/settings/nav-display.svg';
import trips from '../../assets/settings/nav-trips.svg';
import navigation from '../../assets/settings/nav-navigation.svg';
import safety from '../../assets/settings/nav-safety.svg';
import service from '../../assets/settings/nav-service.svg';
import software from '../../assets/settings/nav-software.svg';
import upgrades from '../../assets/settings/nav-upgrades.svg';
import type { SettingsPage } from '../../state/store';

/** Figma Navtree (4258:39) order. */
export const NAV_ITEMS: { page: SettingsPage; label: string; icon: string }[] = [
  { page: 'search', label: 'Search', icon: search },
  { page: 'controls', label: 'Controls', icon: controls },
  { page: 'pedals', label: 'Pedals & Steering', icon: pedals },
  { page: 'charging', label: 'Charging', icon: charging },
  { page: 'autopilot', label: 'Autopilot', icon: autopilot },
  { page: 'locks', label: 'Locks', icon: locks },
  { page: 'lights', label: 'Lights', icon: lights },
  { page: 'display', label: 'Display', icon: display },
  { page: 'trips', label: 'Trips', icon: trips },
  { page: 'navigation', label: 'Navigation', icon: navigation },
  { page: 'safety', label: 'Safety', icon: safety },
  { page: 'service', label: 'Service', icon: service },
  { page: 'software', label: 'Software', icon: software },
  { page: 'upgrades', label: 'Upgrades', icon: upgrades },
];
