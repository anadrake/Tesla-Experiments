import lock from '../../../assets/settings/photo/lock.svg';
import spinner from '../../../assets/settings/photo/spinner.svg';
import wifi from '../../../assets/settings/nav26/wifi.svg';
import { Icon } from '../../../components/Icon/Icon';
import { DeviceRow, Stack, Switch, Text } from '../photo/Photo';
import styles from './pages.module.css';

const NETWORKS = ['SETUP-7E49', 'SnowWhite7'];

/**
 * Figma Settings 2026 / Wi-Fi (4934:1267). Static (Q41). Figma's Wi-Fi switch is the older toolkit one (#005aff) —
 * built with the photo switch like every other page.
 */
export function WifiPage() {
  return (
    <Stack gap={12}>
      <div className={styles.iconLine}>
        <Icon src={wifi} size={32} color="var(--photo-icon)" />
        <Text as="label" style={{ flex: 1, whiteSpace: 'pre' }}>
          {'Wi-Fi  4C:FC:AA:63:81:74'}
        </Text>
        <Switch on />
      </div>
      <p className={`text-photo-button ${styles.photoPrimary}`} style={{ height: 52, display: 'flex', alignItems: 'center', whiteSpace: 'pre' }}>
        {'Add Hidden Wi-Fi Network  ⌄'}
      </p>
      <div className={styles.iconLine} style={{ height: 52 }}>
        <Text as="label" style={{ flex: 1 }}>
          Searching for Wi-Fi Networks
        </Text>
        <Icon src={spinner} size={32} color="var(--photo-icon)" />
        <span className={`text-photo-button ${styles.accent}`} style={{ width: 140, textAlign: 'center' }}>
          Refresh
        </span>
      </div>
      {NETWORKS.map((n) => (
        <DeviceRow key={n} height={100} title={<span className="text-photo-setting-label">{n}</span>}>
          <Icon src={lock} size={32} color="var(--photo-icon)" />
          <Icon src={wifi} size={32} color="var(--photo-icon)" />
        </DeviceRow>
      ))}
    </Stack>
  );
}
