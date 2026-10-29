import { motion } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import lock from '../assets/icons/lock.svg';
import profile from '../assets/icons/profile.svg';
import sentry from '../assets/icons/sentry.svg';
import { AirbagBadge } from '../components/AirbagBadge/AirbagBadge';
import { Icon } from '../components/Icon/Icon';
import { Pressable } from '../components/Pressable/Pressable';
import { toggleDayNight } from '../state/dayNight';
import { isDriving, useHud, type CarView } from '../state/store';
import { transition } from '../tokens/motion';
import { mapLeft } from '../components/CarPanel/geometry';
import styles from './StatusCluster.module.css';

type Item = 'lock' | 'clock' | 'temp' | 'profile' | 'sentry' | 'airbag';
type Size = { w: number; h: number };
type Pos = { left: number; top: number; opacity: number };

const DISPLAY_W = 1920;

/** Lay items out in a row with a gap, vertically centered on cy. */
function row(order: Item[], sizes: Record<Item, Size>, startX: number, cy: number, gap: number) {
  const out: Partial<Record<Item, Pos>> = {};
  let x = startX;
  for (const id of order) {
    out[id] = { left: x, top: cy - sizes[id].h / 2, opacity: 1 };
    x += sizes[id].w + gap;
  }
  return out;
}
const width = (order: Item[], sizes: Record<Item, Size>, gap: number) =>
  order.reduce((sum, id) => sum + sizes[id].w, 0) + gap * (order.length - 1);

/**
 * Positions per car view (Figma: Map Top Bar vs Car Status Panel Full anchors).
 * Q8: items never resize between screens — they only move and fade.
 */
function layout(view: CarView, driving: boolean, s: Record<Item, Size>): Record<Item, Pos> {
  if (view !== 'full') {
    // Map Top Bar: 24px in from the map's left edge (moves with the map when the panel collapses)
    const r = row(['lock', 'clock', 'temp', 'profile'], s, mapLeft(view, driving) + 24, 32, 24);
    const sentryLeft = r.profile!.left + s.profile.w + 24;
    return {
      ...(r as Record<Item, Pos>),
      sentry: { left: sentryLeft, top: 32 - s.sentry.h / 2, opacity: 0 },
      airbag: { left: DISPLAY_W - 24 - s.airbag.w, top: 32 - s.airbag.h / 2, opacity: 1 },
    };
  }
  const center: Item[] = ['lock', 'profile', 'sentry'];
  const right: Item[] = ['clock', 'temp', 'airbag'];
  return {
    ...(row(center, s, DISPLAY_W / 2 - width(center, s, 32) / 2, 38, 32) as Record<Item, Pos>),
    ...(row(right, s, DISPLAY_W - 20 - width(right, s, 48), 42, 48) as Record<Item, Pos>),
  };
}

function useClock() {
  const fmt = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const [now, setNow] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setNow(fmt()), 10_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/**
 * Lock · clock · outside temp · profile · (sentry) · airbag badge.
 * One instance for every screen; tapping the clock toggles Day/Night (Q3).
 */
export function StatusCluster() {
  const view = useHud((s) => s.carView);
  const driving = useHud(isDriving);
  const time = useClock();
  const refs = useRef<Partial<Record<Item, HTMLDivElement | null>>>({});
  const [sizes, setSizes] = useState<Record<Item, Size> | null>(null);

  // offsetWidth/Height are unscaled layout px, so the Stage scale doesn't skew the math.
  useLayoutEffect(() => {
    const measure = () => {
      const s = {} as Record<Item, Size>;
      for (const [id, el] of Object.entries(refs.current)) s[id as Item] = { w: el!.offsetWidth, h: el!.offsetHeight };
      setSizes(s);
    };
    measure();
    document.fonts?.ready.then(measure);
  }, [time]);

  const pos = sizes ? layout(view, driving, sizes) : null;
  const item = (id: Item, children: ReactNode) => (
    <motion.div
      key={id}
      ref={(el) => {
        refs.current[id] = el;
      }}
      className={styles.item}
      initial={false}
      // A translate (not left / top) so the move runs on the compositor (perf, 9.5); items are laid out at 0,0.
      animate={pos ? { transform: `translate(${pos[id].left}px, ${pos[id].top}px)`, opacity: pos[id].opacity } : { opacity: 0 }}
      transition={transition.screen}
    >
      {children}
    </motion.div>
  );

  return (
    <div className={`${styles.cluster} text-body-l`}>
      {item('lock', <Icon src={lock} size={24} color="var(--color-icon-strong)" />)}
      {item(
        'clock',
        <Pressable className={styles.clock} onClick={toggleDayNight} aria-label={`${time}, switch Day/Night`}>
          {time}
        </Pressable>,
      )}
      {item('temp', <span>65°F</span>)}
      {item(
        'profile',
        <span className={styles.profile}>
          <Icon src={profile} size={24} color="var(--color-icon-strong)" />
          Easy Entry
        </span>,
      )}
      {item('sentry', <Icon src={sentry} size={24} color="var(--color-icon-strong)" />)}
      {item('airbag', <AirbagBadge />)}
    </div>
  );
}
