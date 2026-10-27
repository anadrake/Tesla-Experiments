import { Icon } from '../../../components/Icon/Icon';
import { NAV_ITEMS } from '../navItems';
import { useHud } from '../../../state/store';
import styles from './pages.module.css';

/** Body for categories without a Figma design yet (Q16). Replace by registering a real page in SettingsWindow PAGES. */
export function ComingSoonPage() {
  const page = useHud((s) => s.settingsPage);
  const item = NAV_ITEMS.find((i) => i.page === page);
  return (
    <div className={styles.comingSoon}>
      {item && <Icon src={item.icon} size={48} color="var(--color-content-tertiary)" />}
      <p className="text-heading-s">{item?.label} — coming soon</p>
      <p className={`text-title-m ${styles.muted}`}>This section hasn’t been designed yet.</p>
    </div>
  );
}
