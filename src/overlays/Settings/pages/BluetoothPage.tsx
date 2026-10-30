import bluetooth from '../../../assets/settings/nav26/bluetooth.svg';
import chevronDown from '../../../assets/settings/photo/chevron-down-32.svg';
import info from '../../../assets/settings/photo/info.svg';
import phone from '../../../assets/settings/photo/phone.svg';
import spinner from '../../../assets/settings/photo/spinner.svg';
import { Icon } from '../../../components/Icon/Icon';
import { DeviceRow, Stack, Text, ToggleRow } from '../photo/Photo';
import styles from './pages.module.css';

const PAIRED: { name: string; status: string; mark?: 'connected' | 'favorite'; action?: string }[] = [
  { name: 'iPhone 2026', status: 'Connected', mark: 'connected' },
  { name: 'Pixel 11 Pro', status: 'Not Connected', mark: 'favorite', action: 'Connect' },
  { name: 'Pixel 9 Pro', status: 'Not Connected', action: 'Connect' },
];

/** Photo / Device Row (4959:25204): phone, name + status (● connected / ★ favourite), action, chevron. */
function PairedRow({ name, status, mark, action }: (typeof PAIRED)[number]) {
  return (
    <DeviceRow
      height={100}
      icon={<Icon src={phone} size={32} color="var(--photo-icon)" />}
      title={<span className="text-photo-setting-label">{name}</span>}
      subtitle={
        <span className="text-photo-caption">
          {status}
          {mark && <span className={styles.deviceMark} data-mark={mark}>{mark === 'connected' ? '●' : '★'}</span>}
        </span>
      }
    >
      <span className={`text-photo-button ${styles.photoPrimary}`} style={{ width: 120 }}>
        {action}
      </span>
      <Icon src={chevronDown} size={32} color="var(--photo-icon)" />
    </DeviceRow>
  );
}

/** Figma Settings 2026 / Bluetooth (4934:1356). Static (Q41). Figma's raw green / amber marks → status tokens. */
export function BluetoothPage() {
  return (
    <Stack gap={16}>
      <Text as="label">Paired Devices</Text>
      {PAIRED.map((d) => (
        <PairedRow key={d.name} {...d} />
      ))}
      <ToggleRow on title="Reduce Fan Speed During Calls" description="Climate must be set to Auto. Settings will be restored when call ends." />
      <div className={styles.iconLine} style={{ gap: 12 }}>
        <Text style={{ flex: 1, whiteSpace: 'pre' }}>
          {'Nearby Devices  '}
          <Icon src={info} size={20} color="var(--photo-icon)" className={styles.inlineIcon} />
          {'   Paired as: Tesla Model 3 Edgerunner'}
        </Text>
        <Icon src={spinner} size={32} color="var(--photo-icon)" />
      </div>
      <DeviceRow
        height={100}
        icon={
          <span className={styles.iconSlot32}>
            <Icon src={bluetooth} size={24} color="var(--photo-slider-rail)" />
          </span>
        }
        title={<span className="text-photo-setting-label">XBR-65X750D</span>}
      >
        <span className={`text-photo-button ${styles.photoPrimary}`} style={{ width: 120 }}>
          Connect
        </span>
      </DeviceRow>
      <Text>
        Before we add your device, be sure it is turned on and discoverable.
        <br />
        <br />
        Wireless controllers can be paired if they support Bluetooth Classic. Consult the owner’s manual for additional
        information on controller compatibility.
      </Text>
    </Stack>
  );
}
