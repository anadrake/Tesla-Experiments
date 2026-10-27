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
import { Icon } from '../components/Icon/Icon';
import { Pressable } from '../components/Pressable/Pressable';
import { Stepper } from '../components/Stepper/Stepper';
import { TEMP_MAX, TEMP_MIN, useHud } from '../state/store';
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
 * Car icon toggles Settings. Later: customizable pinned apps, live recents.
 */
export function ControlBar() {
  const { driverTemp, passengerTemp, setDriverTemp, setPassengerTemp, quickActions, toggleQuickActions, settingsOpen, toggleSettings } =
    useHud();
  const app = (a: { name: string; src: string }) => (
    <Pressable key={a.name} className={styles.iconButton} aria-label={a.name}>
      <img src={a.src} alt="" width={48} height={48} />
    </Pressable>
  );

  return (
    <nav className={styles.bar} data-mode="dark">
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
