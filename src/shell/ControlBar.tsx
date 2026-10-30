import car from '../assets/icons/car.svg';
import volume from '../assets/icons/volume.svg';
import volumeDown from '../assets/icons/volume-down.svg';
import volumeUp from '../assets/icons/volume-up.svg';
import phone from '../assets/apps/phone.svg';
import music from '../assets/apps/music.svg';
import bluetooth from '../assets/apps/bluetooth.svg';
import spotify from '../assets/apps/spotify.svg';
import camera from '../assets/apps/camera.svg';
import allApps from '../assets/apps/all-apps.png';
import zoom from '../assets/apps/zoom.svg';
import calendar from '../assets/apps/calendar.svg';
import { useRef } from 'react';
import { Icon } from '../components/Icon/Icon';
import { Pressable } from '../components/Pressable/Pressable';
import { Stepper } from '../components/Stepper/Stepper';
import { TEMP_MAX, TEMP_MIN, useHud } from '../state/store';
import { capture } from '../lib/pointer';
import { SHEET_H, SHEET_SLOP, dragSheet, grabSheet, releaseSheet } from '../overlays/Climate/sheet';
import { useStageScale } from './Stage';
import styles from './ControlBar.module.css';

/** Left of All apps: the driver's pinned apps (customizable later). */
const PINNED = [
  { name: 'Phone', src: phone },
  { name: 'Music', src: music },
  { name: 'Bluetooth', src: bluetooth },
  { name: 'Spotify', src: spotify },
  { name: 'Camera', src: camera },
];
/** Right of the divider: recently used apps (static for now). */
const RECENT = [
  { name: 'Zoom', src: zoom },
  { name: 'Calendar', src: calendar },
];

/**
 * Figma "Control Bar" (4273:375). Always dark — the component pins Color mode to Dark,
 * so this subtree sets data-mode="dark" regardless of the app mode.
 * Dock: pinned apps · All apps (opens Quick Actions) | recent apps.
 * Car icon toggles Settings. Swipe up anywhere on the bar → Front Climate (follows the finger, Q43); taps still work.
 * Later: customizable pinned apps, live recents.
 */
export function ControlBar() {
  const { driverTemp, passengerTemp, setDriverTemp, setPassengerTemp, quickActions, toggleQuickActions, settingsOpen, toggleSettings } =
    useHud();
  const app = (a: { name: string; src: string }) => (
    <Pressable key={a.name} className={styles.iconButton} aria-label={a.name}>
      <img src={a.src} alt="" width={48} height={48} />
    </Pressable>
  );

  const swipe = useClimateSwipe();
  return (
    <nav className={styles.bar} data-mode="dark" {...swipe}>
      <Pressable className={styles.iconButton} aria-label="Settings" aria-expanded={settingsOpen} onClick={toggleSettings}>
        <Icon src={car} color="var(--color-icon-strong)" />
      </Pressable>

      <Stepper label="driver temperature" value={driverTemp} min={TEMP_MIN} max={TEMP_MAX} onChange={setDriverTemp} />

      <div className={styles.dock}>
        {PINNED.map(app)}
        <Pressable
          className={styles.iconButton}
          aria-label="All apps"
          aria-expanded={quickActions}
          onClick={toggleQuickActions}
        >
          <img src={allApps} alt="" width={42} height={42} className={styles.allApps} />
        </Pressable>
        <span className={styles.dockDivider} aria-hidden />
        {RECENT.map(app)}
      </div>

      <Stepper
        label="passenger temperature"
        value={passengerTemp}
        min={TEMP_MIN}
        max={TEMP_MAX}
        onChange={setPassengerTemp}
      />

      <div className={styles.volume}>
        <Pressable className={styles.iconButton} aria-label="Volume down">
          <Icon src={volumeDown} color="var(--color-icon-strong)" />
        </Pressable>
        <Pressable className={styles.iconButton} aria-label="Mute">
          <Icon src={volume} color="var(--color-icon-strong)" />
        </Pressable>
        <Pressable className={styles.iconButton} aria-label="Volume up">
          <Icon src={volumeUp} color="var(--color-icon-strong)" />
        </Pressable>
      </div>
    </nav>
  );
}

/** Swipe up on the bar opens the Front Climate sheet (Phase 10.5): a mostly-vertical upward drag takes the pointer. */
function useClimateSwipe() {
  const scale = useStageScale();
  const g = useRef<{ id: number; x: number; y: number; t: number; v: number; locked: boolean } | null>(null);
  const end = (e: React.PointerEvent) => {
    const d = g.current;
    g.current = null;
    if (!d?.locked || e.pointerId !== d.id) return;
    releaseSheet(true, (d.y - e.clientY) / scale, d.v);
  };
  return {
    onPointerDown: (e: React.PointerEvent) => {
      if (e.isPrimary) g.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp, v: 0, locked: false };
    },
    onPointerMove: (e: React.PointerEvent) => {
      const d = g.current;
      if (!d || e.pointerId !== d.id) return;
      const up = (d.y - e.clientY) / scale;
      if (!d.locked) {
        if (Math.hypot(e.clientX - d.x, e.clientY - d.y) / scale < SHEET_SLOP) return;
        if (up < SHEET_SLOP || Math.abs(e.clientX - d.x) > Math.abs(d.y - e.clientY)) return void (g.current = null);
        d.locked = true;
        grabSheet();
        capture(e); // the button under the finger doesn't get this tap
      }
      d.v = up / Math.max(1, e.timeStamp - d.t);
      dragSheet(SHEET_H - (up - SHEET_SLOP));
    },
    onPointerUp: end,
    onPointerCancel: end,
  };
}
