import card from '../../../assets/settings/photo/card.svg';
import lock from '../../../assets/settings/photo/lock.svg';
import pencil from '../../../assets/settings/photo/pencil.svg';
import phone from '../../../assets/settings/photo/phone.svg';
import profile from '../../../assets/settings/photo/profile.svg';
import trash from '../../../assets/settings/photo/trash.svg';
import { Icon } from '../../../components/Icon/Icon';
import { Divider, Segmented, Stack, Text } from '../photo/Photo';
import styles from './pages.module.css';

const KEYS = [
  { icon: phone, name: 'iPhone 2026', detail: 'Active | Apple iPhone 14 Pro | Anastasiy…', action: profile },
  { icon: phone, name: 'Pixel 11 Pro', detail: 'Oct 25 | Google Pixel 11 Pro | Daniel Had…', action: profile },
  { icon: phone, name: 'Pixel 9 Pro', detail: 'Oct 25 | Google Pixel 9 Pro | Daniel Had…', action: profile },
  // Figma's component data says profile here too; the render shows a pencil (key card → rename) — followed the render.
  { icon: card, name: 'Backup', detail: 'Oct 23 | Key Card | Anastasiya D', action: pencil },
];

/** Photo / Key Row (4959:25185): 120 tall — icon, name + detail, profile / edit, delete. */
function KeyRow({ icon, name, detail, action }: (typeof KEYS)[number]) {
  return (
    <div className={styles.keyRow}>
      <Icon src={icon} size={32} color="var(--photo-icon)" />
      <div className={styles.keyLabels}>
        <Text as="label">{name}</Text>
        <Text as="caption" tone="secondary">
          {detail}
        </Text>
      </div>
      <Icon src={action} size={32} color="var(--photo-icon)" />
      <Icon src={trash} size={32} color="var(--photo-icon)" />
    </div>
  );
}

/** Figma Settings 2026 / Locks (4933:988). Static (Q41). */
export function LocksPage() {
  return (
    <Stack gap={28}>
      <div className={styles.keysHeader}>
        <Text as="label">Keys</Text>
        <span className={`text-photo-button ${styles.fillButton}`} style={{ width: 186 }}>
          Add Key
        </span>
      </div>
      <div className={styles.keysList}>
        {KEYS.map((k) => (
          <KeyRow key={k.name} {...k} />
        ))}
      </div>
      <Divider />
      <div className={styles.titledBlock}>
        <div className={styles.inlineTitle} style={{ gap: 8, paddingLeft: 4 }}>
          <Icon src={lock} size={28} color="var(--photo-icon)" />
          <Text as="label">Child Lock</Text>
        </div>
        <Segmented options={['Off', 'Both', 'Left', 'Right']} selected="Off" />
      </div>
    </Stack>
  );
}
