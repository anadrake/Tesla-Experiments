import type { CSSProperties } from 'react';
import styles from './Icon.module.css';

interface IconProps {
  /** Imported SVG url (single-color glyph). Rendered as a mask so it takes `color`. */
  src: string;
  size?: number;
  /** Any CSS color; defaults to currentColor. Prefer token vars, e.g. 'var(--color-icon-strong)'. */
  color?: string;
  className?: string;
}

/** Mode-aware monochrome icon. For multi-color pictograms (app icons, badges) use a plain <img>. */
export function Icon({ src, size = 48, color, className }: IconProps) {
  const style = {
    '--icon-src': `url("${src}")`,
    width: size,
    height: size,
    color,
  } as CSSProperties;
  return <span aria-hidden className={`${styles.icon} ${className ?? ''}`} style={style} />;
}
