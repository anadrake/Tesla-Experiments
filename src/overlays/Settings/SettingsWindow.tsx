import { animate, motion, useMotionValue } from 'motion/react';
import { useRef } from 'react';
import profile from '../../assets/settings/profile.svg';
import update from '../../assets/settings/status-update.svg';
import notification from '../../assets/settings/status-notification.svg';
import bluetooth from '../../assets/settings/status-bluetooth.svg';
import wifi from '../../assets/settings/status-wifi.svg';
import { Icon } from '../../components/Icon/Icon';
import { capture } from '../../lib/pointer';
import { useStageScale } from '../../shell/Stage';
import { useHud, type SettingsPage } from '../../state/store';
import { presets, reducible, transition } from '../../tokens/motion';
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

/** Swipe-down zone: the top of the window (header height); a drag starting lower is left to the page. */
const SWIPE_ZONE = 112;
const SWIPE_START = 10; // design px before the drag takes over (taps on nav items still work)
const SWIPE_CLOSE = 160; // design px down, or a quick flick, closes
const SWIPE_FLICK = 0.8; // design px / ms

/**
 * Figma "Settings Window": Navtree (448) + Settings Panel (840) at x630 y64, over the map.
 * Opens from the control bar car icon (screen change: slow + standard). Closes on the car icon,
 * a map / panel tap, opening another overlay, or a swipe down from the top (Anastasiya).
 */
export function SettingsWindow() {
  const page = useHud((s) => s.settingsPage);
  const setPage = useHud((s) => s.setSettingsPage);
  const Page = PAGES[page] ?? ComingSoonPage;
  const scale = useStageScale();
  const y = useMotionValue(1016);
  const swipe = useRef<{ startY: number; lastY: number; lastT: number; v: number; active: boolean } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    const top = e.currentTarget.getBoundingClientRect().top;
    if ((e.clientY - top) / scale > SWIPE_ZONE) return;
    swipe.current = { startY: e.clientY, lastY: e.clientY, lastT: e.timeStamp, v: 0, active: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const g = swipe.current;
    if (!g) return;
    const dy = (e.clientY - g.startY) / scale;
    if (!g.active) {
      if (dy < SWIPE_START) return;
      g.active = true;
      capture(e); // from here the drag owns the pointer, so the nav item under the finger isn't clicked
    }
    const dt = e.timeStamp - g.lastT;
    if (dt > 0) g.v = (e.clientY - g.lastY) / scale / dt;
    g.lastY = e.clientY;
    g.lastT = e.timeStamp;
    y.set(Math.max(0, dy));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const g = swipe.current;
    swipe.current = null;
    if (!g?.active) return;
    const dy = (e.clientY - g.startY) / scale;
    if (dy > SWIPE_CLOSE || g.v > SWIPE_FLICK) useHud.getState().toggleSettings();
    else animate(y, 0, reducible(transition.toggle));
  };

  return (
    <motion.div
      className={styles.window}
      role="dialog"
      aria-label="Settings"
      style={{ y }}
      animate={{ y: 0, transition: transition.screen }}
      exit={{ y: 1016, transition: { ...transition.screen } }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
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
