import { AnimatePresence, motion } from 'motion/react';
import type { RefObject } from 'react';
import { useHud } from '../../state/store';
import { bottom } from '../CarPanel/geometry';
import { transition } from '../../tokens/motion';
import { useDismissOnOutsideTap } from '../WidgetBar/useDismissOnOutsideTap';
import { CustomizeTrack } from './CustomizeTrack';
import { chrome, picker, pickerClip } from './motion';
import { WidgetPicker } from './WidgetPicker';
import styles from './Customize.module.css';

/** Full view: the same layout, moved with the widget bar (Panel 15,848 → Full 448,819). */
const FULL_OFFSET = {
  x: bottom.widgetBar.full.left - bottom.widgetBar.panel.left,
  y: bottom.widgetBar.full.top - bottom.widgetBar.panel.top,
};

/**
 * Customize mode (Sketch "Tap customize" 4802:103107), drawn over the car panel (panel coordinates):
 * picker card (top 307) · edit frame with the shrunken track (top 670) · Done (where Customize was).
 * Done or a tap outside closes it (that tap is swallowed). Panel: outside = outside the car panel; taps elsewhere
 * in the panel do nothing. Full (the panel is the whole screen): outside = off the picker, edit frame and Done.
 */
export function CustomizeEditor({ panel }: { panel: RefObject<HTMLElement> }) {
  const view = useHud((s) => s.carView);
  const editing = useHud((s) => s.customize === 'editing' && s.carView !== 'collapsed');
  const setCustomize = useHud((s) => s.setCustomize);
  const close = () => setCustomize('off');
  const full = view === 'full';
  useDismissOnOutsideTap(
    full ? (t) => !!(t as Element).closest?.('[data-customize-surface]') : panel,
    editing,
    close,
  );

  return (
    <AnimatePresence>
      {editing && (
        // Variants run the choreography in motion.ts; children inherit lifted / shown / rest, and the exit waits for them.
        <motion.div
          key="editor"
          className={styles.editor}
          data-no-panel-gesture
          initial="lifted"
          animate="shown"
          exit="rest"
          style={full ? FULL_OFFSET : undefined}
        >
          {/* Clipped at the edit frame's top edge, so the picker slides up out from behind the frame */}
          <motion.div className={styles.pickerClip} variants={pickerClip}>
            <motion.div className={styles.pickerLayer} variants={picker} data-customize-surface>
              <WidgetPicker />
            </motion.div>
          </motion.div>
          <div className={styles.editLayer} data-customize-surface>
            <CustomizeTrack />
          </div>
          <motion.div className={styles.doneSlot} variants={chrome} data-customize-surface>
            <motion.button
              type="button"
              className={`${styles.done} text-body-l`}
              onClick={close}
              whileTap={{ scale: 0.96 }}
              transition={transition.press}
            >
              Done
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
