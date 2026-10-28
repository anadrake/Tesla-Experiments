import { AnimatePresence, motion } from 'motion/react';
import type { RefObject } from 'react';
import { useHud } from '../../state/store';
import { transition } from '../../tokens/motion';
import { useDismissOnOutsideTap } from '../WidgetBar/useDismissOnOutsideTap';
import { CustomizeTrack } from './CustomizeTrack';
import { chrome, picker } from './motion';
import { WidgetPicker } from './WidgetPicker';
import styles from './Customize.module.css';

/**
 * Customize mode (Sketch "Tap customize" 4802:103107), drawn over the car panel (panel coordinates):
 * picker card (top 307) · edit frame with the shrunken track (top 670) · Done (where Customize was).
 * Done or a tap outside the car panel closes it (that tap is swallowed). Taps elsewhere in the panel do nothing.
 */
export function CustomizeEditor({ panel }: { panel: RefObject<HTMLElement> }) {
  const editing = useHud((s) => s.customize === 'editing' && s.carView === 'panel');
  const setCustomize = useHud((s) => s.setCustomize);
  const close = () => setCustomize('off');
  useDismissOnOutsideTap(panel, editing, close);

  return (
    <AnimatePresence>
      {editing && (
        // Variants run the choreography in motion.ts; children inherit hidden / shown, and the exit waits for them.
        <motion.div
          key="editor"
          className={styles.editor}
          data-no-panel-gesture
          initial="hidden"
          animate="shown"
          exit="hidden"
        >
          {/* Picker first in the DOM = behind the edit frame, so it slides up out from behind it */}
          <motion.div className={styles.pickerLayer} variants={picker}>
            <WidgetPicker />
          </motion.div>
          <div className={styles.editLayer}>
            <CustomizeTrack />
          </div>
          <motion.div className={styles.doneSlot} variants={chrome}>
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
