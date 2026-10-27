import { AnimatePresence } from 'motion/react';
import { useHud } from '../state/store';
import { Keyboard } from './Keyboard/Keyboard';
import { QuickActions } from './QuickActions/QuickActions';
import { SettingsWindow } from './Settings/SettingsWindow';

/** Display Shell Overlay slot content (one overlay at a time). */
export function Overlays() {
  const typing = useHud((s) => s.nav === 'typing' || s.settingsTyping);
  const quickActions = useHud((s) => s.quickActions);
  const settingsOpen = useHud((s) => s.settingsOpen);
  return (
    <AnimatePresence>
      {quickActions && <QuickActions key="quick-actions" />}
      {settingsOpen && <SettingsWindow key="settings" />}
      {/* last, so it sits over the settings window when Settings search is focused */}
      {typing && <Keyboard key="keyboard" />}
    </AnimatePresence>
  );
}
