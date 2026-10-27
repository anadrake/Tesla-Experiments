import { AnimatePresence } from 'motion/react';
import { useHud } from '../state/store';
import { Keyboard } from './Keyboard/Keyboard';
import { QuickActions } from './QuickActions/QuickActions';

/** Display Shell Overlay slot content (one overlay at a time). P6: Settings window. */
export function Overlays() {
  const typing = useHud((s) => s.nav === 'typing');
  const quickActions = useHud((s) => s.quickActions);
  return (
    <AnimatePresence>
      {typing && <Keyboard key="keyboard" />}
      {quickActions && <QuickActions key="quick-actions" />}
    </AnimatePresence>
  );
}
