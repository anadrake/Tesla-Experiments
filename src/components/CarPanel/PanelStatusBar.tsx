import { motion } from 'motion/react';
import lowBeam from '../../assets/telltales/low-beam.svg';
import autoHighBeam from '../../assets/telltales/auto-high-beam.svg';
import fogFront from '../../assets/telltales/fog-front.svg';
import seatbelt from '../../assets/telltales/seatbelt.svg';
import type { CarView } from '../../state/store';
import { transition } from '../../tokens/motion';
import { Icon } from '../Icon/Icon';
import { battery as batteryRects, telltales as telltaleRects } from './geometry';
import styles from './PanelStatusBar.module.css';

const GEARS = ['P', 'R', 'N', 'D'] as const;

/**
 * Figma "Status Bar" (4259:102): Gear Selector (4259:85) + Battery (4259:101).
 * Battery % and gauge move per size (right-aligned in Panel/Full, gauge under PRND in Collapsed).
 * TODO P4: tap PRND → Driving (Q5).
 */
export function PanelStatusBar({ view, gear = 'P', battery = 90 }: { view: CarView; gear?: (typeof GEARS)[number]; battery?: number }) {
  return (
    <>
      <div className={`${styles.gear} text-body-l`} aria-label={`Gear ${gear}`}>
        {GEARS.map((g) => (
          <span key={g} className={g === gear ? styles.gearActive : undefined}>
            {g}
          </span>
        ))}
      </div>
      <motion.span
        className={`${styles.percent} text-body-l`}
        initial={false}
        animate={batteryRects.percent[view]}
        transition={transition.screen}
      >
        {battery}%
      </motion.span>
      <motion.span className={styles.battery} initial={false} animate={batteryRects.gauge[view]} transition={transition.screen}>
        <span className={styles.gauge} data-low={battery <= 20 || undefined}>
          <span className={styles.level} style={{ width: (37 * battery) / 100 }} />
        </span>
        <span className={styles.tip} />
      </motion.span>
    </>
  );
}

/** Telltales column: always green (lights) / red (seatbelt) — status tokens. */
export function Telltales({ view }: { view: CarView }) {
  return (
    <motion.div className={styles.telltales} initial={false} animate={telltaleRects[view]} transition={transition.screen}>
      <Icon src={lowBeam} color="var(--color-status-success)" />
      <Icon src={autoHighBeam} color="var(--color-icon-strong)" />
      <Icon src={fogFront} size={48} color="var(--color-status-success)" />
      <Icon src={seatbelt} color="var(--color-status-danger)" />
    </motion.div>
  );
}
