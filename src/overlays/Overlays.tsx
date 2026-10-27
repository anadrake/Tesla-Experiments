import { AnimatePresence } from 'motion/react';
import { useHud } from '../state/store';
import { Keyboard } from './Keyboard/Keyboard';
import { QuickActions } from './QuickActions/QuickActions';
import { SettingsWindow } from './Settings/SettingsWindow';

/** Display Shell Overlay slot content (one overlay at a time). */
export function Overlays() {
  const typing = useHud((s) => s.nav === 'typing');
  const quickActions = useHud((s) => s.quickActions);
  const settingsOpen = useHud((s) => s.settingsOpen);
  return (
    <AnimatePresence>
      {typing && <Keyboard key="keyboard" />}
      {quickActions && <QuickActions key="quick-actions" />}
      {settingsOpen && <SettingsWindow key="settings" />}
    </AnimatePresence>
  );
}
