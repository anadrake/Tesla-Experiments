import { motion } from 'motion/react';
import lockPanel from '../../assets/car/callout-lock-panel.svg';
import lockFull from '../../assets/car/callout-lock-full.svg';
import power from '../../assets/car/power.svg';
import type { CarView } from '../../state/store';
import { transition } from '../../tokens/motion';
import { Icon } from '../Icon/Icon';
import { callouts as g, type Rect } from './geometry';
import styles from './Callouts.module.css';

function Layer({ rect, className, children }: { rect: Rect; className?: string; children?: React.ReactNode }) {
  return (
    <motion.div className={`${styles.layer} ${className ?? ''}`} initial={false} animate={rect} transition={transition.screen}>
      {children}
    </motion.div>
  );
}

function Label({ part, state }: { part: string; state: string }) {
  return (
    <>
      <span className={`text-body-s ${styles.part}`}>{part}</span>
      <span className={styles.state}>{state}</span>
    </>
  );
}

/** Frunk / lock / trunk / charge-port callouts. Q7: part small, state bold — on every size. */
export function Callouts({ view }: { view: CarView }) {
  return (
    <>
      <Layer rect={g.lockPanel[view]}>
        <img src={lockPanel} alt="" className={styles.fill} />
      </Layer>
      <Layer rect={g.lockFull[view]} className={styles.center}>
        <Icon src={lockFull} size={33} color="var(--color-icon-strong)" />
      </Layer>
      <Layer rect={g.lockLine[view]} className={styles.line} />

      <Layer rect={g.trunkLine[view]} className={styles.line} />
      <Layer rect={g.trunkText[view]} className={styles.text}>
        <Label part="Trunk" state="Open" />
      </Layer>

      <Layer rect={g.frunkLine[view]} className={styles.line} />
      <Layer rect={g.frunkText[view]} className={styles.text}>
        <Label part="Frunk" state="Open" />
      </Layer>

      <Layer rect={g.chargeLine[view]} className={styles.line} />
      <Layer rect={g.charge[view]}>
        <Icon src={power} color="var(--color-icon-strong)" className={styles.fill} />
      </Layer>
    </>
  );
}
