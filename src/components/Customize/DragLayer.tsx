import { motion } from 'motion/react';
import { WidgetIcon } from '../WidgetBar/registry';
import { GHOST_CARD, ghost, useDrag } from './drag';
import { TrackCard } from './CustomizeTrack';
import styles from './Customize.module.css';

const ICON = 48;

/**
 * What's being dragged, above everything in the editor: a picker app's 48px icon (sketch 4802:103108 — icon only,
 * no label), or a held track card, lifted (Q19). Positioned by `ghost` (drag.ts), scaled around the grab point.
 */
export function DragLayer() {
  const source = useDrag((s) => s.source);
  const card = source?.kind === 'track';
  const w = card ? GHOST_CARD.width : ICON;
  const h = card ? GHOST_CARD.height : ICON;
  if (!source) return null;
  return (
    <motion.div
      className={`${styles.ghost} ${card ? styles.ghostCard : ''}`}
      data-drag-ghost={source.id}
      style={{
        left: ghost.x,
        top: ghost.y,
        marginLeft: -w / 2,
        marginTop: -h / 2,
        width: w,
        height: h,
        scale: ghost.scale,
        opacity: ghost.opacity,
        transformOrigin: `${w / 2 + ghost.grab.x}px ${h / 2 + ghost.grab.y}px`,
      }}
    >
      {card ? <TrackCard id={source.id} /> : <WidgetIcon id={source.id} />}
    </motion.div>
  );
}
