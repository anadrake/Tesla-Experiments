import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from 'react';
import styles from './Stage.module.css';

const DISPLAY_W = 1920;
const DISPLAY_H = 1200;

const StageScale = createContext(1);
/** Current device-px → design-px factor. Divide pointer deltas by this for gestures. */
export const useStageScale = () => useContext(StageScale);

/** Renders children on a fixed 1920×1200 canvas, scaled to fit the viewport (letterboxed). */
export function Stage({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / DISPLAY_W, window.innerHeight / DISPLAY_H));
    fit();
    // iPad rotation / Safari toolbar changes don't always fire window resize
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', fit);
    window.visualViewport?.addEventListener('resize', fit);
    return () => {
      window.removeEventListener('resize', fit);
      window.removeEventListener('orientationchange', fit);
      window.visualViewport?.removeEventListener('resize', fit);
    };
  }, []);

  return (
    <div className={styles.viewport}>
      <div className={styles.display} style={{ transform: `translate(-50%, -50%) scale(${scale})` }} data-testid="display">
        <StageScale.Provider value={scale}>{children}</StageScale.Provider>
      </div>
    </div>
  );
}
