import { useEffect, useState } from 'react';
import lock from '../../assets/icons/lock.svg';
import profile from '../../assets/icons/profile.svg';
import { AirbagBadge } from '../../components/AirbagBadge/AirbagBadge';
import { Icon } from '../../components/Icon/Icon';
import { Pressable } from '../../components/Pressable/Pressable';
import { toggleDayNight } from '../../state/dayNight';
import styles from './Map.module.css';

const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(id);
  }, []);
  return formatTime(now);
}

/**
 * Figma "Map Top Bar" (4259:114): lock, time, outside temp, profile, airbag badge.
 * Tapping the clock toggles Day/Night (replaces Figma's D key — Q3).
 * Element sizes are fixed on every screen; other screens only move/hide items (Q8).
 */
export function MapTopBar() {
  const time = useClock();
  return (
    <header className={styles.topBar}>
      <div className={`${styles.info} text-body-l`}>
        <Icon src={lock} size={24} color="var(--color-icon-strong)" />
        <Pressable className={styles.clock} onClick={toggleDayNight} aria-label={`${time}, switch Day/Night`}>
          {time}
        </Pressable>
        <span>65°F</span>
        <span className={styles.profile}>
          <Icon src={profile} size={24} color="var(--color-icon-strong)" />
          Easy Entry
        </span>
      </div>
      <AirbagBadge />
    </header>
  );
}
