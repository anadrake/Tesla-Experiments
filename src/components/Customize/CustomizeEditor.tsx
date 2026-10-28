import { AnimatePresence, motion } from 'motion/react';
import type { RefObject } from 'react';
import { useHud } from '../../state/store';
import { transition } from '../../tokens/motion';
import { useDismissOnOutsideTap } from '../WidgetBar/useDismissOnOutsideTap';
import { CustomizeTrack } from './CustomizeTrack';
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
        <motion.div key="editor" className={styles.editor} data-no-panel-gesture>
          <motion.div
            className={styles.pickerLayer}
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0, transition: transition.open }}
            exit={{ opacity: 0, y: -24, transition: transition.close }}
          >
            <WidgetPicker />
          </motion.div>
          <motion.div
            className={styles.editLayer}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1, transition: transition.open }}
            exit={{ opacity: 0, scale: 0.96, transition: transition.close }}
          >
            <CustomizeTrack />
          </motion.div>
          <motion.div
            className={styles.doneSlot}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: transition.open }}
            exit={{ opacity: 0, transition: transition.close }}
          >
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
