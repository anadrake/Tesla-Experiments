import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useHud } from '../../state/store';
import type { Rect } from '../CarPanel/geometry';
import { transition } from '../../tokens/motion';
import { useDismissOnOutsideTap } from '../WidgetBar/useDismissOnOutsideTap';
import { CustomizeTrack } from './CustomizeTrack';
import { DragLayer } from './DragLayer';
import { resetDrag } from './drag';
import { useEditorMotion } from './motion';
import { WidgetPicker } from './WidgetPicker';
import styles from './Customize.module.css';

/**
 * The editor is laid out in panel coords from the sketch, where the widget bar sits at 15,848; it moves with the
 * real bar wherever it's docked — Panel 15,854 (lined up with the map's trip card), on the map, Full 448 / 872,819.
 */
const SKETCH_BAR = { left: 15, top: 848 };
const offsetTo = (bar: { left: number; top: number }) => ({ x: bar.left - SKETCH_BAR.left, y: bar.top - SKETCH_BAR.top });

/**
 * Customize mode (Sketch "Tap customize" 4802:103107), drawn around the widget bar (display = panel coordinates):
 * picker card (top 307) · edit frame with the shrunken track (top 670) · Done (where Customize was).
 * Done or a tap outside closes it (that tap is swallowed). Bar in the panel: outside = outside the car panel; taps
 * elsewhere in the panel do nothing. Full (the panel is the whole screen) or docked on the map (Q36): outside = off
 * the picker, edit frame and Done.
 */
export function CustomizeEditor({ bar, inPanel }: { bar: Rect; inPanel: boolean }) {
  const view = useHud((s) => s.carView);
  const editing = useHud((s) => s.customize === 'editing' && s.carView !== 'collapsed');
  const setCustomize = useHud((s) => s.setCustomize);
  const close = () => setCustomize('off');
  const full = view === 'full';
  const editor = useRef<HTMLDivElement>(null);
  const { editor: editorFade, chrome, picker, pickerClip } = useEditorMotion();
  useEffect(() => {
    if (!editing) resetDrag();
  }, [editing]);
  // Hand-off with the widget bar: it hides while the editor is on screen and comes back the moment the editor's exit
  // finishes (onExitComplete) — a timer let both cards (and both shadows) show for a frame (Anastasiya: dark flash).
  const setShown = useHud((s) => s.setCustomizeEditorShown);
  useLayoutEffect(() => {
    if (editing) setShown(true);
  }, [editing, setShown]);
  useDismissOnOutsideTap(
    (t) => !!(t as Element).closest?.(inPanel ? '[data-car-panel], [data-customize-surface]' : '[data-customize-surface]'),
    editing,
    close,
  );
  const offset = offsetTo(bar);

  return (
    <AnimatePresence
      onExitComplete={() => {
        // The bar re-renders at once (store update), but AnimatePresence unmounts the editor a render later —
        // hide it now so the two cards are never painted together.
        if (editor.current) editor.current.style.visibility = 'hidden';
        setShown(false);
      }}
    >
      {editing && (
        // Variants run the choreography in motion.ts; children inherit lifted / shown / rest, and the exit waits for them.
        <motion.div
          key="editor"
          ref={editor}
          className={styles.editor}
          data-no-panel-gesture
          variants={editorFade}
          initial="lifted"
          animate="shown"
          exit="rest"
          style={offset}
        >
          {/* Clipped at the edit frame's top edge, so the picker slides up out from behind the frame */}
          <motion.div className={styles.pickerClip} variants={pickerClip}>
            {/* Panel / map: the picker keeps its sketch spot (307) — moved down with the bar it'd uncover the Trunk callout */}
            <div style={{ transform: `translateY(${full ? 0 : -offset.y}px)` }}>
              <motion.div className={styles.pickerLayer} variants={picker} data-customize-surface>
                <WidgetPicker editor={editor} />
              </motion.div>
            </div>
          </motion.div>
          <div className={styles.editLayer} data-customize-surface>
            <CustomizeTrack editor={editor} />
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
          <DragLayer />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
