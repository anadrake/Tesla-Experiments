import { motion } from 'motion/react';
import profile from '../../assets/settings/profile.svg';
import update from '../../assets/settings/status-update.svg';
import notification from '../../assets/settings/status-notification.svg';
import bluetooth from '../../assets/settings/status-bluetooth.svg';
import wifi from '../../assets/settings/status-wifi.svg';
import { Icon } from '../../components/Icon/Icon';
import { useHud, type SettingsPage } from '../../state/store';
import { presets, transition } from '../../tokens/motion';
import { NAV_ITEMS } from './navItems';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { ControlsPage } from './pages/ControlsPage';
import { DisplayPage } from './pages/DisplayPage';
import { LightsPage } from './pages/LightsPage';
import { PedalsPage } from './pages/PedalsPage';
import { SearchPage } from './pages/SearchPage';
import styles from './SettingsWindow.module.css';

/**
 * Pages built so far. Add a page: create pages/XPage.tsx from the Figma Settings Panel body and register it here.
 * Undesigned categories show a Coming soon body (Q16).
 */
const PAGES: Partial<Record<SettingsPage, () => JSX.Element>> = {
  search: SearchPage,
  controls: ControlsPage,
  pedals: PedalsPage,
  display: DisplayPage,
  lights: LightsPage,
};

/**
 * Figma "Settings Window": Navtree (448) + Settings Panel (840) at x630 y64, over the map.
 * Opens from the control bar car icon (screen change: slow + standard). Closes on the car icon,
 * a map / panel tap, or opening another overlay.
 */
export function SettingsWindow() {
  const page = useHud((s) => s.settingsPage);
  const setPage = useHud((s) => s.setSettingsPage);
  const Page = PAGES[page] ?? ComingSoonPage;

  return (
    <motion.div
      className={styles.window}
      role="dialog"
      aria-label="Settings"
      initial={{ y: 1016 }}
      animate={{ y: 0, transition: transition.screen }}
      exit={{ y: 1016, transition: { ...transition.screen } }}
    >
      <nav className={styles.navtree} aria-label="Settings categories">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.page}
            type="button"
            className={`${styles.navItem} text-heading-m`}
            data-selected={item.page === page || undefined}
            aria-current={item.page === page ? 'page' : undefined}
            onClick={() => setPage(item.page)}
          >
            <Icon src={item.icon} color={item.page === page ? 'var(--color-icon-strong)' : 'var(--color-content-secondary)'} />
            <span className={styles.navLabel}>{item.label}</span>
          </button>
        ))}
      </nav>

      <section className={styles.panel} aria-label={NAV_ITEMS.find((i) => i.page === page)?.label}>
        <header className={styles.header}>
          <span className={`${styles.profile} text-heading-m`}>
            <Icon src={profile} color="var(--color-content-secondary)" />
            Easy Entry
          </span>
          <span className={styles.statusIcons}>
            {[update, notification, bluetooth, wifi].map((src) => (
              <Icon key={src} src={src} size={24} color="var(--color-content-secondary)" />
            ))}
          </span>
        </header>
        {/* tab switch: duration/fast + easing/standard (Figma motion rules) */}
        <motion.div className={styles.body} key={page} {...presets.fadeIn} transition={transition.toggle}>
          <Page />
        </motion.div>
      </section>
    </motion.div>
  );
}
