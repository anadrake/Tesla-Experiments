import type { ReactNode } from 'react';
import styles from './Key.module.css';

interface KeyProps {
  /** Character keys are 104×88 with a Heading/L glyph; Action keys hug their content (min 100) with Title/L labels. */
  type?: 'character' | 'action';
  width?: number | 'fill';
  label?: ReactNode;
  ariaLabel?: string;
  onPress?: () => void;
}

/** Figma "Key" (4271:2318). State=Pressed = 8% black over the fill, shown instantly on touch. */
export function Key({ type = 'character', width, label, ariaLabel, onPress }: KeyProps) {
  return (
    <button
      type="button"
      className={`${styles.key} ${type === 'character' ? 'text-heading-l' : `text-title-l ${styles.action}`}`}
      style={width === 'fill' ? { flex: '1 0 0' } : width ? { width } : undefined}
      aria-label={ariaLabel}
      onPointerDown={(e) => e.currentTarget.setAttribute('data-pressed', '')}
      onPointerUp={(e) => e.currentTarget.removeAttribute('data-pressed')}
      onPointerLeave={(e) => e.currentTarget.removeAttribute('data-pressed')}
      onClick={onPress}
    >
      {label}
    </button>
  );
}
