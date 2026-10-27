import car from '../assets/icons/car.svg';
import volume from '../assets/icons/volume.svg';
import volumeDown from '../assets/icons/volume-down.svg';
import volumeUp from '../assets/icons/volume-up.svg';
import phone from '../assets/apps/phone.svg';
import music from '../assets/apps/music.svg';
import bluetooth from '../assets/apps/bluetooth.svg';
import spotify from '../assets/apps/spotify.svg';
import camera from '../assets/apps/camera.svg';
import theater from '../assets/apps/theater.svg';
import tunein from '../assets/apps/tunein.svg';
import { Icon } from '../components/Icon/Icon';
import { Pressable } from '../components/Pressable/Pressable';
import { Stepper } from '../components/Stepper/Stepper';
import { TEMP_MAX, TEMP_MIN, useHud } from '../state/store';
import styles from './ControlBar.module.css';

const DOCK = [
  { name: 'Phone', src: phone },
  { name: 'Music', src: music },
  { name: 'Bluetooth', src: bluetooth },
  { name: 'Spotify', src: spotify },
  { name: 'Camera', src: camera },
  { name: 'Theater', src: theater },
  { name: 'TuneIn', src: tunein },
];

/**
 * Figma "Control Bar" (4273:375). Always dark — the component pins Color mode to Dark,
 * so this subtree sets data-mode="dark" regardless of the app mode.
 * TODO P5: dock opens Quick Actions. P6: car icon opens Settings.
 */
export function ControlBar() {
  const { driverTemp, passengerTemp, setDriverTemp, setPassengerTemp } = useHud();

  return (
    <nav className={styles.bar} data-mode="dark">
      <Pressable className={styles.iconButton} aria-label="Vehicle controls">
        <Icon src={car} color="var(--color-icon-strong)" />
      </Pressable>

      <Stepper label="driver temperature" value={driverTemp} min={TEMP_MIN} max={TEMP_MAX} onChange={setDriverTemp} />

      <div className={styles.dock}>
        {DOCK.map((app) => (
          <Pressable key={app.name} className={styles.iconButton} aria-label={app.name}>
            <img src={app.src} alt="" width={48} height={48} />
          </Pressable>
        ))}
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
