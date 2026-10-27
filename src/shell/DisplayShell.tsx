import type { ReactNode } from 'react';
import { ControlBar } from './ControlBar';
import styles from './DisplayShell.module.css';

interface DisplayShellProps {
  /** Left panel (630px) — Car Status Panel. */
  left?: ReactNode;
  /** Full-width view behind the left panel — Map etc. */
  main?: ReactNode;
  /** Status items that ride above the panel + map (StatusCluster). */
  status?: ReactNode;
  /** Keyboard, Quick Actions, Settings window, cards. */
  overlay?: ReactNode;
}

/**
 * Figma "Display Shell": 1080px stage with Main / Left / (status) / Overlay slots (bottom → top)
 * plus the 120px Control Bar.
 */
export function DisplayShell({ left, main, status, overlay }: DisplayShellProps) {
  return (
    <div className={styles.shell}>
      <div className={styles.stage}>
        <div className={styles.slot}>{main}</div>
        <div className={styles.slot}>{left}</div>
        <div className={styles.slot}>{status}</div>
        <div className={styles.slot}>{overlay}</div>
      </div>
      <ControlBar />
    </div>
  );
}
