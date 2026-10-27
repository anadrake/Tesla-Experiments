import { AnimatePresence } from 'motion/react';
import { useHud } from '../state/store';
import { Keyboard } from './Keyboard/Keyboard';

/** Display Shell Overlay slot content. P5: Quick Actions. P6: Settings window. */
export function Overlays() {
  const typing = useHud((s) => s.nav === 'typing');
  return <AnimatePresence>{typing && <Keyboard key="keyboard" />}</AnimatePresence>;
}
