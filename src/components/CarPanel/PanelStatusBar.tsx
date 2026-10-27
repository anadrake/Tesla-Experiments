import { motion } from 'motion/react';
import lowBeam from '../../assets/telltales/low-beam.svg';
import autoHighBeam from '../../assets/telltales/auto-high-beam.svg';
import fogFront from '../../assets/telltales/fog-front.svg';
import seatbelt from '../../assets/telltales/seatbelt.svg';
import { useHud, type CarView } from '../../state/store';
import { transition } from '../../tokens/motion';
import { Icon } from '../Icon/Icon';
import { battery as batteryRects, batteryDrivingCollapsed, telltales as telltaleRects, telltalesDriving } from './geometry';
import styles from './PanelStatusBar.module.css';

const GEARS = ['P', 'R', 'N', 'D'] as const;

/**
 * Figma "Status Bar" (4259:102): Gear Selector (4259:85) + Battery (4259:101).
 * Battery % and gauge move per size (right-aligned in Panel/Full, gauge under PRND in Collapsed).
 * Tap PRND → P ⇄ D (Q5), which starts / ends the trip (driving = navigating).
 */
export function PanelStatusBar({ view, driving, battery = 90 }: { view: CarView; driving: boolean; battery?: number }) {
  const toggleDrive = useHud((s) => s.toggleDrive);
  const gear: (typeof GEARS)[number] = driving ? 'D' : 'P';
  const rects = view === 'collapsed' && driving ? batteryDrivingCollapsed : { gauge: batteryRects.gauge[view], percent: batteryRects.percent[view] };
  return (
    <>
      <button
        type="button"
        className={`${styles.gear} text-body-l`}
        aria-label={`Gear ${gear}, switch to ${driving ? 'Park' : 'Drive'}`}
        onClick={toggleDrive}
        data-no-panel-gesture
      >
        {GEARS.map((g) => (
          <span key={g} className={g === gear ? styles.gearActive : undefined}>
            {g}
          </span>
        ))}
      </button>
      <motion.span
        className={`${styles.percent} text-body-l`}
        initial={false}
        animate={rects.percent}
        transition={transition.screen}
      >
        {battery}%
      </motion.span>
      <motion.span className={styles.battery} initial={false} animate={rects.gauge} transition={transition.screen}>
        <span className={styles.gauge} data-low={battery <= 20 || undefined}>
          <span className={styles.level} style={{ width: (37 * battery) / 100 }} />
        </span>
        <span className={styles.tip} />
      </motion.span>
    </>
  );
}

/**
 * Telltales column: always green (lights) / red (seatbelt) — status tokens.
 * Driving: moves under the speed cluster, 8px gap, no seatbelt warning.
 */
export function Telltales({ view, driving }: { view: CarView; driving: boolean }) {
  return (
    <motion.div
      className={styles.telltales}
      initial={false}
      animate={(driving ? telltalesDriving : telltaleRects)[view]}
      transition={transition.screen}
      style={{ gap: driving ? 'var(--space-8)' : 'var(--space-2)' }}
    >
      <Icon src={lowBeam} color="var(--color-status-success)" />
      <Icon src={autoHighBeam} color="var(--color-icon-strong)" />
      <Icon src={fogFront} size={48} color="var(--color-status-success)" />
      {!driving && <Icon src={seatbelt} color="var(--color-status-danger)" />}
    </motion.div>
  );
}
