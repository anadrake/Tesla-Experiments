import { animate, motion, useMotionValue } from 'motion/react';
import { useLayoutEffect, useRef } from 'react';
import profile from '../../assets/settings/nav26/h-profile.svg';
import update from '../../assets/settings/nav26/h-update.svg';
import home from '../../assets/settings/nav26/home.svg';
import notification from '../../assets/settings/nav26/h-notification.svg';
import bluetooth from '../../assets/settings/nav26/h-bluetooth.svg';
import wifi from '../../assets/settings/nav26/h-wifi.svg';
import { Icon } from '../../components/Icon/Icon';
import { capture } from '../../lib/pointer';
import { useStageScale } from '../../shell/Stage';
import { useHud, type SettingsPage } from '../../state/store';
import { presets, reducible, transition } from '../../tokens/motion';
import { NAV_ITEMS, SEARCH_ITEM } from './navItems';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { ChargingPage } from './pages/ChargingPage';
import { ControlsPage } from './pages/ControlsPage';
import { DisplayPage } from './pages/DisplayPage';
import { DynamicsPage } from './pages/DynamicsPage';
import { LightsPage } from './pages/LightsPage';
import { LocksPage } from './pages/LocksPage';
import { SearchPage } from './pages/SearchPage';
import { SeatsPage } from './pages/SeatsPage';
import { SelfDrivingPage } from './pages/SelfDrivingPage';
import styles from './SettingsWindow.module.css';

/**
 * Pages built so far. Add a page: create pages/XPage.tsx from the Figma Settings Panel body and register it here.
 * Undesigned categories show a Coming soon body (Q16).
 */
const PAGES: Partial<Record<SettingsPage, () => JSX.Element>> = {
  search: SearchPage,
  controls: ControlsPage,
  dynamics: DynamicsPage,
  charging: ChargingPage,
  'self-driving': SelfDrivingPage,
  locks: LocksPage,
  seats: SeatsPage,
  display: DisplayPage,
  lights: LightsPage,
};

const SWIPE_START = 10; // design px before the drag takes over (taps on nav items still work)
const SWIPE_CLOSE = 160; // design px down, or a quick flick, closes
const SWIPE_FLICK = 0.8; // design px / ms

/**
 * Figma "Settings 2026 / Window" (4932:119, Phase 10): Navtree (448) + Settings Panel (840) at x630 y64, over the map.
 * Search row fixed on top of the nav, the 19 categories scroll under it; panel = Photo / Settings Header + body.
 * Opens from the control bar car icon (screen change: slow + standard). Closes on the car icon,
 * a map / panel tap, opening another overlay, or a swipe down from the top (Anastasiya).
 */
export function SettingsWindow() {
  const page = useHud((s) => s.settingsPage);
  const setPage = useHud((s) => s.setSettingsPage);
  const Page = PAGES[page] ?? ComingSoonPage;
  const scale = useStageScale();
  const y = useMotionValue(1016);
  // Opened on a category below the fold (deep link, reopened): the list opens scrolled to the end, as in Figma (wifi-light).
  const list = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const l = list.current;
    const row = l?.querySelector<HTMLElement>('[data-selected]');
    if (l && row && row.offsetTop + row.offsetHeight > l.clientHeight) l.scrollTop = l.scrollHeight;
  }, []);
  const swipe = useRef<{ startY: number; lastY: number; lastT: number; v: number; active: boolean } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    // Swipe-down zone: the header and the Search row on top — the nav list below scrolls (a drag there must not close it).
    if (!(e.target as Element).closest('header, [data-swipe-zone]')) return;
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
        <div className={styles.search} data-swipe-zone>
          <NavItem item={SEARCH_ITEM} selected={page === 'search'} onSelect={setPage} search />
        </div>
        <div ref={list} className={styles.navList}>
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.page} item={item} selected={item.page === page} onSelect={setPage} />
          ))}
        </div>
      </nav>

      <section className={styles.panel} aria-label={NAV_ITEMS.find((i) => i.page === page)?.label ?? SEARCH_ITEM.label}>
        {/* Photo / Settings Header (4959:25269) */}
        <header className={styles.header}>
          <span className={`${styles.profile} text-photo-header`}>
            <Icon src={profile} size={40} color="var(--photo-icon)" />
            Easy Entry
          </span>
          <span className={styles.statusIcons}>
            <Icon src={update} size={28} color="var(--photo-status-amber)" />
            <Icon src={home} size={28} color="var(--photo-icon)" />
            <span className={styles.unread}>
              <Icon src={notification} size={28} color="var(--photo-icon)" />
            </span>
            <Icon src={bluetooth} size={28} color="var(--photo-icon)" />
            <Icon src={wifi} size={28} color="var(--photo-icon)" />
          </span>
        </header>
        {/* tab switch: duration/fast + easing/standard (Figma motion rules) */}
        <motion.div className={styles.body} key={page} {...presets.fadeIn} transition={transition.toggle}>
          {page === 'search' ? (
            <Page />
          ) : (
            <div className={styles.static}>
              <Page />
            </div>
          )}
        </motion.div>
      </section>
    </motion.div>
  );
}

/** Nav Item (4258:38): 64 tall, 48 icon slot (small glyphs centred in it), Photo / Navigation label; selected = raised row. */
function NavItem({
  item,
  selected,
  onSelect,
  search = false,
}: {
  item: { page: SettingsPage; label: string; icon: string; size?: number };
  selected: boolean;
  onSelect: (p: SettingsPage) => void;
  search?: boolean;
}) {
  return (
    <button
      type="button"
      className={`${styles.navItem} ${search ? 'text-photo-header' : 'text-photo-navigation'}`}
      data-search={search || undefined}
      data-selected={selected || undefined}
      aria-current={selected ? 'page' : undefined}
      onClick={() => onSelect(item.page)}
    >
      <span className={styles.navIcon}>
        <Icon src={item.icon} size={item.size ?? 48} color="var(--photo-icon)" />
      </span>
      <span className={styles.navLabel}>{item.label}</span>
    </button>
  );
}
