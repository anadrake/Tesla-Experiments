import { AnimatePresence, animate, motion, useMotionValue } from 'motion/react';
import { useLayoutEffect, useRef } from 'react';
import { isDriving, useHud } from '../../state/store';
import { transition } from '../../tokens/motion';
import {
  MOVE_FIELD,
  WIDGET_CARD,
  chickletLargeRect,
  chickletRect,
  moveSpots,
  widgetBarRect,
  type Rect,
} from '../CarPanel/geometry';
import { CustomizeEditor } from '../Customize/CustomizeEditor';
import { WIDGETS } from './registry';
import { WidgetBar } from './WidgetBar';
import { rebase, useMove } from './move';
import styles from './WidgetBar.module.css';

/**
 * The widget bar's own stage-level layer (9.4), above the car panel: the bar can be docked in the panel, on the map
 * (Panel view, and it stays there when the panel collapses — Q37) or either side of the trip card in Full, and moves
 * between them. Coordinates = display px (the car panel starts at 0,0, so its geometry applies as is).
 * Also holds the move fields (move mode) and the Customize editor, which opens wherever the bar is (Q36).
 */
export function WidgetLayer() {
  const view = useHud((s) => s.carView);
  const driving = useHud(isDriving);
  const dock = useHud((s) => s.widgetDock);
  const activeWidget = useHud((s) => s.widgetTrack[s.widgetPage] ?? s.widgetTrack[0]);
  // The Collapsed rail shows the chicklet — unless the bar is docked on the map.
  const chicklet = view === 'collapsed' && dock.panel === 'panel' ? (driving ? 'large' : 'mini') : undefined;
  const rect = widgetBarRect(view, driving, dock, driving ? chickletLargeRect : chickletRect(WIDGETS[activeWidget].mini));
  const box = useRectValues(rect, `${dock.panel}:${dock.full}`, `${view}:${driving}`);

  return (
    <div className={styles.dockLayer}>
      <MoveFields />
      <motion.div
        className={styles.dockSlot}
        // Chicklet taps fall through to the car panel underneath (Collapsed → Panel).
        style={{ ...box, pointerEvents: chicklet ? 'none' : 'auto' }}
      >
        <WidgetBar chicklet={chicklet} />
      </motion.div>
      <CustomizeEditor bar={rect} inPanel={view === 'panel' && dock.panel === 'panel'} />
    </div>
  );
}

/**
 * The bar's rect as motion values. A view / Parked ⇄ Driving change morphs it with the panel (transition.screen); a
 * dock change on its own (a drop) jumps it, and the move offset is rebased so the widget stays under the finger and settles from there.
 */
function useRectValues(rect: Rect, dockKey: string, sceneKey: string) {
  const left = useMotionValue(rect.left);
  const top = useMotionValue(rect.top);
  const width = useMotionValue(rect.width);
  const height = useMotionValue(rect.height);
  const opacity = useMotionValue(rect.opacity ?? 1);
  const prev = useRef({ dockKey, sceneKey });
  useLayoutEffect(() => {
    const was = prev.current;
    prev.current = { dockKey, sceneKey };
    if (was.sceneKey === sceneKey && was.dockKey !== dockKey) {
      rebase(rect.left - left.get(), rect.top - top.get());
      left.jump(rect.left);
      top.jump(rect.top);
      return;
    }
    animate(left, rect.left, transition.screen);
    animate(top, rect.top, transition.screen);
    animate(width, rect.width, transition.screen);
    animate(height, rect.height, transition.screen);
    animate(opacity, rect.opacity ?? 1, transition.screen);
  }, [rect.left, rect.top, rect.width, rect.height, rect.opacity, dockKey, sceneKey]);
  return { left, top, width, height, opacity };
}

/** Field opacity: resting / the one the widget would drop into (no sketch for the latter — it just firms up). */
const FIELD_OPACITY = { rest: 0.6, target: 1 };

/** Move fields (sketch "Rectangle 41"): where the popped widget can go. */
function MoveFields() {
  const view = useHud((s) => s.carView);
  const driving = useHud(isDriving);
  const dock = useHud((s) => s.widgetDock);
  const moving = useHud((s) => s.customize === 'moving');
  const target = useMove((s) => s.target);
  const dragging = useMove((s) => s.dragging);
  // Spots are fixed while moving (the dock only changes on the drop that ends it).
  const spots = moving ? moveSpots(view, driving, dock) : [];
  return (
    <AnimatePresence>
      {spots.map((s) => (
        <motion.div
          key={s.key}
          className={styles.moveField}
          data-move-field={s.key}
          data-target={(dragging && target === s.key) || undefined}
          initial={{ opacity: 0 }}
          animate={{ opacity: dragging && target === s.key ? FIELD_OPACITY.target : FIELD_OPACITY.rest }}
          exit={{ opacity: 0, transition: transition.close }}
          transition={transition.toggle}
          style={{
            left: s.left + (WIDGET_CARD.width - MOVE_FIELD.width) / 2,
            top: s.top + (WIDGET_CARD.height - MOVE_FIELD.height) / 2,
            width: MOVE_FIELD.width,
            height: MOVE_FIELD.height,
          }}
        />
      ))}
    </AnimatePresence>
  );
}
