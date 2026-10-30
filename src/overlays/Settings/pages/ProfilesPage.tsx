import active from '../../../assets/settings/photo/active-profile.svg?raw';
import chevronDown from '../../../assets/settings/photo/chevron-down-32.svg';
import chevronUp from '../../../assets/settings/photo/chevron-up-32.svg';
import info from '../../../assets/settings/photo/info.svg';
import profile from '../../../assets/settings/photo/profile.svg';
import { Icon } from '../../../components/Icon/Icon';
import { ThemedSvg } from '../../../components/ThemedSvg/ThemedSvg';
import { Divider, OutlineButton, Stack, Text, ToggleRow } from '../photo/Photo';
import styles from './pages.module.css';

/** Active profile check: Figma's raw green #25994b → status/success; the tick stays white. */
const ACTIVE_COLORS = { '#25994B': 'var(--color-status-success)', white: 'var(--photo-content-on-accent)' };

/** Photo / Profile Row (4959:25227): profile glyph, name (+ email), chevron. */
function ProfileRow({ name, email, open = false, isActive = false, icon = true, height }: { name: string; email?: string; open?: boolean; isActive?: boolean; icon?: boolean; height?: number }) {
  return (
    <div className={styles.profileRow} data-tall={email ? true : undefined} style={{ height }}>
      {icon && <Icon src={profile} size={32} color="var(--photo-icon)" />}
      <div className={styles.keyLabels}>
        <Text as="label">{name}</Text>
        {email && (
          <Text as="caption" tone="secondary">
            {email}
          </Text>
        )}
      </div>
      {isActive && <ThemedSvg svg={active} colors={ACTIVE_COLORS} className={styles.activeProfile} />}
      <Icon src={open ? chevronUp : chevronDown} size={32} color="var(--photo-icon)" />
    </div>
  );
}

/** Figma Settings 2026 / Profiles (4934:1119): one profile expanded. Static (Q41). */
export function ProfilesPage() {
  return (
    <Stack gap={16}>
      <div className={styles.keysHeader} style={{ height: 52 }}>
        <Text as="label">Profiles on this car</Text>
        <span className={`text-photo-button ${styles.accent}`} style={{ width: 260, textAlign: 'center' }}>
          Add New Driver
        </span>
      </div>
      <div className={styles.profileCard}>
        <ProfileRow name="an...@gmail.com" isActive />
      </div>
      <div className={styles.profileCard} data-expanded>
        <ProfileRow name="Daniel Haddad" email="da...@gmail.com" open />
        <Divider />
        <p className={`text-photo-setting-label ${styles.profileName}`}>Daniel Haddad</p>
        <Text as="caption" tone="secondary">
          Synced 6 mins ago
        </Text>
        <div className={styles.inlineTitle} style={{ gap: 8 }}>
          <Text as="label">Tesla Profile</Text>
          <Icon src={info} size={24} color="var(--photo-icon)" />
        </div>
        <Text>Your vehicle settings and preferences will travel with you across supported Tesla vehicles.</Text>
        <ToggleRow on title="Easy Entry" />
        <ToggleRow on={false} onCard title="Require Phone Key for Profile" />
        <div className={styles.actionRow}>
          <OutlineButton>Select</OutlineButton>
          <OutlineButton>Reset Tesla Profile</OutlineButton>
        </div>
      </div>
      <div className={styles.profileCard}>
        <ProfileRow name="Easy Entry" icon={false} height={80} />
      </div>
    </Stack>
  );
}
