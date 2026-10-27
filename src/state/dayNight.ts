import { useHud } from './store';

let timer: ReturnType<typeof setTimeout> | undefined;

/**
 * Day/Night switch with the Figma 0.6s dissolve.
 * While `html.mode-switching` is set, every element transitions its colors (global.css),
 * so tokens fade instead of snapping. Unlike View Transitions this never blocks taps,
 * so rapid toggles always register.
 */
export function toggleDayNight() {
  const root = document.documentElement;
  root.classList.add('mode-switching');
  useHud.getState().toggleMode();
  clearTimeout(timer);
  timer = setTimeout(() => root.classList.remove('mode-switching'), 600 + 50);
}
