import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import check from '../../assets/settings/check.svg';
import chevronDown from '../../assets/settings/chevron-down.svg';
import info from '../../assets/settings/info.svg';
import search from '../../assets/settings/search-40.svg';
import { spring, transition } from '../../tokens/motion';
import { Icon } from '../Icon/Icon';
import { useSetting } from './useSetting';
import styles from './controls.module.css';

/* Figma Settings components. Every interactive control takes a `setting` key (+ default) and stores its value. */

/** Switch (4229:27): 80×40; toggles with duration/fast + gentle spring knob. */
export function Switch({ setting, initial = false, label }: { setting: string; initial?: boolean; label?: string }) {
  const [on, set] = useSetting(setting, initial);
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} className={styles.switch} data-on={on || undefined} onClick={() => set(!on)}>
      <motion.span className={styles.knob} initial={false} animate={{ x: on ? 40 : 0 }} transition={spring} />
    </button>
  );
}

/** Checkbox (4229:46): 40px box + Title/L label. */
export function Checkbox({ setting, initial = false, label }: { setting: string; initial?: boolean; label: string }) {
  const [on, set] = useSetting(setting, initial);
  return (
    <button type="button" role="checkbox" aria-checked={on} className={styles.checkbox} onClick={() => set(!on)}>
      <span className={styles.box} data-on={on || undefined}>
        {on && <Icon src={check} size={40} color="var(--color-icon-on-accent)" />}
      </span>
      <span className="text-title-l">{label}</span>
    </button>
  );
}

/** Segmented Control (4229:168): single choice, selected segment is the raised one. */
export function SegmentedControl({ setting, options, initial, width }: { setting: string; options: string[]; initial: string; width?: number }) {
  const [value, set] = useSetting(setting, initial);
  return (
    <div className={styles.segmented} role="radiogroup" style={width ? { width } : undefined}>
      {options.map((o) => (
        <button key={o} type="button" role="radio" aria-checked={o === value} className={`${styles.segment} text-title-l`} data-on={o === value || undefined} onClick={() => set(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}

/** Select (4230:61): dropdown trigger. No menu designed yet — a tap steps to the next option. */
export function Select({ setting, options, initial, width = 370 }: { setting: string; options: string[]; initial: string; width?: number }) {
  const [value, set] = useSetting(setting, initial);
  return (
    <button type="button" className={styles.select} style={{ width }} onClick={() => set(options[(options.indexOf(value) + 1) % options.length])}>
      <span className="text-title-l">{value}</span>
      <Icon src={chevronDown} color="var(--color-icon-strong)" />
    </button>
  );
}

/** Slider (4230:120): drag or tap along the track. Value 0–100. */
export function Slider({ setting, initial = 50, icon }: { setting: string; initial?: number; icon?: string }) {
  const [value, set] = useSetting(setting, initial);
  const update = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    set(Math.round(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * 100));
  };
  return (
    <div className={styles.slider}>
      {icon && <Icon src={icon} color="var(--color-content-secondary)" />}
      <div
        className={styles.track}
        role="slider"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          update(e);
        }}
        onPointerMove={(e) => e.buttons && update(e)}
      >
        <span className={styles.fill} style={{ width: `${value}%` }}>
          <span className={styles.thumb} />
        </span>
      </div>
    </div>
  );
}

/** Button (4227:127). Primary = blue; `active` keeps it pressed-in for toggle buttons like brightness Auto. */
export function Button({ children, onPress, variant = 'primary', width = 158 }: { children: ReactNode; onPress?: () => void; variant?: 'primary' | 'secondary'; width?: number }) {
  return (
    <motion.button type="button" className={`${styles.button} text-title-l`} data-variant={variant} style={{ width }} onClick={onPress} whileTap={{ scale: 0.97 }} transition={transition.press}>
      {children}
    </motion.button>
  );
}

/** Search Field (4230:136). */
export function SearchField({ placeholder = 'Search' }: { placeholder?: string }) {
  return (
    <button type="button" className={styles.searchField}>
      <Icon src={search} size={40} color="var(--color-content-secondary)" />
      <span className="text-title-l">{placeholder}</span>
    </button>
  );
}

export const Divider = () => <span className={styles.divider} role="separator" />;

/** Section Title (4231:419), Overline variant. */
export const Overline = ({ children }: { children: ReactNode }) => <p className={`text-overline ${styles.overline}`}>{children}</p>;

/** Info icon + trailing shortcut link shared by Field Group titles and Setting Rows. */
function titleBits({ infoIcon, link, onLink }: { infoIcon?: boolean; link?: string; onLink?: () => void }) {
  return {
    info: infoIcon ? <Icon src={info} size={24} color="var(--color-content-secondary)" /> : null,
    link: link ? (
      <button type="button" className={`text-title-l ${styles.link}`} onClick={onLink}>
        {link}
      </button>
    ) : null,
  };
}

interface TitleProps {
  title: string;
  infoIcon?: boolean;
  link?: string;
  onLink?: () => void;
}

/** Field Group (4275:535): Field title (+ info, + link) · control · optional helper text. */
export function FieldGroup({ title, infoIcon, link, onLink, helper, children }: TitleProps & { helper?: string; children: ReactNode }) {
  const bits = titleBits({ infoIcon, link, onLink });
  return (
    <div className={styles.fieldGroup}>
      <div className={styles.fieldTitle}>
        <span className={styles.titleGroup}>
          <span className="text-heading-s">{title}</span>
          {bits.info}
        </span>
        {bits.link}
      </div>
      <div className={styles.control}>{children}</div>
      {helper && <p className={`text-title-m ${styles.helper}`}>{helper}</p>}
    </div>
  );
}

/** Setting Row (4231:420): switch/checkbox · title (+ info) · description · trailing link. */
export function SettingRow({ title, infoIcon, link, onLink, description, setting, initial }: TitleProps & { description?: string; setting: string; initial?: boolean }) {
  const bits = titleBits({ infoIcon, link, onLink });
  return (
    <div className={styles.settingRow}>
      <Switch setting={setting} initial={initial} label={title} />
      <div className={styles.rowText}>
        <span className={styles.titleGroup}>
          <span className="text-heading-s">{title}</span>
          {bits.info}
        </span>
        {description && <p className={`text-title-m ${styles.helper}`}>{description}</p>}
      </div>
      {bits.link}
    </div>
  );
}
