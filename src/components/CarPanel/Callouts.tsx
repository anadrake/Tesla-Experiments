import { motion } from 'motion/react';
import lockPanel from '../../assets/car/callout-lock-panel.svg';
import lockFull from '../../assets/car/callout-lock-full.svg';
import power from '../../assets/car/power.svg';
import type { CarView } from '../../state/store';
import { transition } from '../../tokens/motion';
import { Icon } from '../Icon/Icon';
import { callouts as g, flip, flipBase, flipStyle, type Rect } from './geometry';
import styles from './Callouts.module.css';

/** Morphs on the compositor (geometry.ts › flip): every callout is a fill or keeps its size, so scaling is exact. */
function Layer({
  rects,
  view,
  className,
  children,
}: {
  rects: Record<CarView, Rect>;
  view: CarView;
  className?: string;
  children?: React.ReactNode;
}) {
  const base = flipBase(rects);
  return (
    <motion.div
      className={`${styles.layer} ${className ?? ''}`}
      style={flipStyle(base)}
      initial={false}
      animate={flip(rects[view], base)}
      transition={transition.screen}
    >
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
      <Layer rects={g.lockPanel} view={view}>
        <img src={lockPanel} alt="" className={styles.fill} />
      </Layer>
      <Layer rects={g.lockFull} view={view} className={styles.center}>
        <Icon src={lockFull} size={33} color="var(--color-icon-strong)" />
      </Layer>
      <Layer rects={g.lockLine} view={view} className={styles.line} />

      <Layer rects={g.trunkLine} view={view} className={styles.line} />
      <Layer rects={g.trunkText} view={view} className={styles.text}>
        <Label part="Trunk" state="Open" />
      </Layer>

      <Layer rects={g.frunkLine} view={view} className={styles.line} />
      <Layer rects={g.frunkText} view={view} className={styles.text}>
        <Label part="Frunk" state="Open" />
      </Layer>

      <Layer rects={g.chargeLine} view={view} className={styles.line} />
      <Layer rects={g.charge} view={view}>
        <Icon src={power} color="var(--color-icon-strong)" className={styles.fill} />
      </Layer>
    </>
  );
}
