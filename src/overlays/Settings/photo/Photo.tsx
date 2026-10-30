import type { CSSProperties, ReactNode } from 'react';
import info from '../../../assets/settings/photo/info.svg';
import minus from '../../../assets/settings/photo/minus.svg';
import plus from '../../../assets/settings/photo/plus.svg';
import chevronDown from '../../../assets/settings/photo/chevron-down.svg';
import check from '../../../assets/settings/photo/check.svg';
import { Icon } from '../../../components/Icon/Icon';
import styles from './Photo.module.css';

/**
 * Settings 2026 "photo" kit (Phase 10, Figma 4931:2): static building blocks for the photo-matched settings pages.
 * Static on purpose (Q41) — each piece shows the state it's given; nothing here takes taps or writes settings.
 * Older pages (Controls) keep the shared settings kit, re-coloured by the panel's photo token mapping.
 */

/** Section Title (Field) + control + optional helper text (Field Group 4275:535, photo typography). */
export function Section({ title, info: hasInfo, helper, children, gap = 16 }: { title?: ReactNode; info?: boolean; helper?: ReactNode; children?: ReactNode; gap?: number }) {
  return (
    <div className={styles.section} style={{ gap }}>
      {title && (
        <div className={styles.titleRow}>
          <p className="text-photo-setting-label">{title}</p>
          {hasInfo && <Icon src={info} size={24} color="var(--photo-icon)" />}
        </div>
      )}
      {children}
      {helper && <p className={`text-photo-body ${styles.secondary}`}>{helper}</p>}
    </div>
  );
}

/** Segmented Control (4229:168): 80 tall, 1.5px outline, the selected segment raised white. `\n` in a label breaks the line. */
export function Segmented({ options, selected, width }: { options: string[]; selected: string; width?: number }) {
  return (
    <div className={styles.segmented} style={{ width: width ?? '100%' }}>
      {options.map((o) => (
        <span key={o} className={`text-photo-button ${styles.segment}`} data-selected={o === selected || undefined}>
          {o}
        </span>
      ))}
    </div>
  );
}

/** Switch (4229:27): 80×40. */
export const Switch = ({ on }: { on: boolean }) => <span className={styles.switch} data-on={on || undefined} aria-checked={on} role="switch" />;

/** Setting Row (4231:420) / Long Setting Toggle (4986:26050): switch + title (+ info) + description. */
export function ToggleRow({ on, title, description, info: hasInfo, badge }: { on: boolean; title: ReactNode; description?: ReactNode; info?: boolean; badge?: ReactNode }) {
  return (
    <div className={styles.toggleRow}>
      <Switch on={on} />
      <div className={styles.toggleText}>
        <div className={styles.titleRow}>
          <p className="text-photo-setting-label">{title}</p>
          {hasInfo && <Icon src={info} size={24} color="var(--photo-icon)" />}
          {badge}
        </div>
        {description && <p className={`text-photo-body ${styles.secondary}`}>{description}</p>}
      </div>
    </div>
  );
}

export const Divider = () => <span className={styles.divider} role="separator" />;

/** A column of blocks with its own gap (Figma "Scrollable content" stacks use 20–28, not the body's 32). */
export const Stack = ({ gap, children, style }: { gap: number; children: ReactNode; style?: CSSProperties }) => (
  <div className={styles.stack} style={{ gap, ...style }}>
    {children}
  </div>
);

/** Stepper (4230:76), filled: − value + on --photo-surface-control, 80 tall. */
export function Stepper({ value, width = 360 }: { value: ReactNode; width?: number }) {
  return (
    <div className={styles.stepper} style={{ width }}>
      <Icon src={minus} color="var(--photo-icon)" />
      <span className="text-photo-button">{value}</span>
      <Icon src={plus} color="var(--photo-icon)" />
    </div>
  );
}

/** Button, Tertiary (outlined, 1.5px) — or `bare` (text only, e.g. inside a card). 86 tall. */
export function OutlineButton({ children, width, bare = false, icon }: { children: ReactNode; width?: number | string; bare?: boolean; icon?: ReactNode }) {
  return (
    <span className={`text-photo-button ${styles.outlineButton}`} data-bare={bare || undefined} style={{ width: width ?? '100%' }}>
      {icon}
      {children}
    </span>
  );
}

/** Icon (28) + label + trailing control — the Charging "at this location" rows. */
export function IconRow({ icon, label, children }: { icon: string; label: ReactNode; children?: ReactNode }) {
  return (
    <div className={styles.iconRow}>
      <Icon src={icon} size={28} color="var(--photo-icon)" />
      <p className={`text-photo-setting-label ${styles.iconRowLabel}`}>{label}</p>
      {children}
    </div>
  );
}

/** A plain text line in the photo palette. */
export const Text = ({ as = 'body', tone = 'primary', children, style }: { as?: 'body' | 'label' | 'caption'; tone?: 'primary' | 'secondary' | 'accent'; children: ReactNode; style?: CSSProperties }) => (
  <p className={`text-photo-${as === 'label' ? 'setting-label' : as} ${styles.text}`} data-tone={tone} style={style}>
    {children}
  </p>
);

/** Select (4230:61): filled, 80 tall, value + chevron. */
export function Select({ value, width = 372 }: { value: ReactNode; width?: number }) {
  return (
    <span className={styles.select} style={{ width }}>
      <span className="text-photo-button">{value}</span>
      <Icon src={chevronDown} color="var(--photo-icon)" />
    </span>
  );
}

/** Button, Secondary (filled control surface) / Primary (photo accent): 86 tall, radius sm. */
export function FillButton({ children = null, width, primary = false, icon, iconSize = 48 }: { children?: ReactNode; width?: number | string; primary?: boolean; icon?: string; iconSize?: number }) {
  return (
    <span className={`text-photo-button ${styles.fillButton}`} data-primary={primary || undefined} style={{ width: width ?? '100%' }}>
      {icon && <Icon src={icon} size={iconSize} color="var(--photo-icon)" />}
      {children}
    </span>
  );
}

/** Checkbox (4229:46): 40² box — checked = raised white with a check, unchecked = control fill + 2px outline. */
export function Checkbox({ checked, label }: { checked: boolean; label: ReactNode }) {
  return (
    <span className={styles.checkbox}>
      <span className={styles.checkBox} data-checked={checked || undefined}>
        {checked && <Icon src={check} size={40} color="var(--photo-icon)" />}
      </span>
      <span className="text-photo-body">{label}</span>
    </span>
  );
}
