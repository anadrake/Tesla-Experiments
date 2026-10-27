import type { ReactNode } from 'react';
import styles from './AppTile.module.css';

interface AppTileProps {
  icon: ReactNode;
  label: string;
  /** Toggle tiles (climate) show an "on" state; launch tiles don't. */
  active?: boolean;
  onPress?: () => void;
}

/**
 * Figma "App Tile" (4231:398): 140 wide, 48 icon + Body/M label. State=Pressed = pressed overlay.
 * Figma has no On state — toggle tiles tint their glyph `--color-icon-active` (Q14).
 */
export function AppTile({ icon, label, active, onPress }: AppTileProps) {
  return (
    <button
      type="button"
      className={styles.tile}
      aria-pressed={active}
      onPointerDown={(e) => e.currentTarget.setAttribute('data-pressed', '')}
      onPointerUp={(e) => e.currentTarget.removeAttribute('data-pressed')}
      onPointerLeave={(e) => e.currentTarget.removeAttribute('data-pressed')}
      onClick={onPress}
    >
      {icon}
      <span className={`text-body-m ${styles.label}`}>{label}</span>
    </button>
  );
}
