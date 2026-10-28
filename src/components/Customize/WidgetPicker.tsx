import { useRef, type RefObject } from 'react';
import { capture } from '../../lib/pointer';
import type { WidgetId } from '../../state/widgets';
import { AppTile } from '../AppTile/AppTile';
import { WIDGETS, WidgetIcon, type WidgetDef } from '../WidgetBar/registry';
import { DRAG_SLOP, cancelDrag, centreOf, dropDrag, moveDrag, startDrag, toEditor, useDrag } from './drag';
import styles from './Customize.module.css';

const ALL = Object.values(WIDGETS);
const groups: WidgetDef[][] = [ALL.filter((w) => w.group === 'standard'), ALL.filter((w) => w.group === 'other')];

/**
 * Sketch "Add Apps Frame" (4802:103107 › 4802:104691): 599 wide card, "Drag Icons to Panel to Customize",
 * standard widgets · divider · other apps. Always lists every app, even ones already on the track (Q20).
 * Drag a tile's icon onto the track (drag.ts). While it's out, its tile is empty (the sketch removes it; we keep
 * its place so the row doesn't jump and the icon has somewhere to float back to).
 */
export function WidgetPicker({ editor }: { editor: RefObject<HTMLElement> }) {
  const out = useDrag((s) => (s.source?.kind === 'picker' ? s.source.id : null));
  const press = useRef<{ id: number; x: number; y: number; app: WidgetId; dragging: boolean } | null>(null);

  const at = (e: React.PointerEvent) => toEditor(editor.current!, e.clientX, e.clientY);
  // We capture the pointer on the wrapper, so the tile's own button never sees its pointerup — clear its press state.
  const unpress = (e: React.PointerEvent) => e.currentTarget.querySelector('button')?.removeAttribute('data-pressed');

  return (
    <div className={styles.picker} role="group" aria-label="Add widgets">
      <p className={`text-body-l ${styles.pickerTitle}`}>Drag Icons to Panel to Customize</p>
      {groups.map((apps, i) => (
        <div key={i} className={styles.pickerGroup}>
          {i > 0 && <span className={styles.pickerDivider} aria-hidden />}
          <div className={styles.pickerRow}>
            {apps.map((w) => (
              <div
                key={w.id}
                data-picker-app={w.id}
                className={styles.pickerApp}
                style={{ visibility: out === w.id ? 'hidden' : undefined }}
                onPointerDown={(e) => {
                  if (press.current || useDrag.getState().source || !editor.current) return;
                  press.current = { id: e.pointerId, x: e.clientX, y: e.clientY, app: w.id, dragging: false };
                  capture(e);
                }}
                onPointerMove={(e) => {
                  const p = press.current;
                  if (!p || e.pointerId !== p.id || !editor.current) return;
                  if (!p.dragging) {
                    const start = toEditor(editor.current, p.x, p.y);
                    const now = at(e);
                    if (Math.hypot(now.x - start.x, now.y - start.y) < DRAG_SLOP) return;
                    if (useDrag.getState().source) return; // one drag at a time
                    p.dragging = true;
                    // The 48px icon lifts out of the tile (the label stays)
                    const icon = e.currentTarget.querySelector('button')?.firstElementChild ?? e.currentTarget;
                    startDrag({ kind: 'picker', id: p.app }, centreOf(editor.current, icon), start);
                  }
                  moveDrag(at(e));
                }}
                onPointerUp={(e) => {
                  const p = press.current;
                  if (!p || e.pointerId !== p.id) return;
                  press.current = null;
                  unpress(e);
                  if (p.dragging) dropDrag();
                }}
                onPointerCancel={(e) => {
                  const p = press.current;
                  if (!p || e.pointerId !== p.id) return;
                  press.current = null;
                  unpress(e);
                  if (p.dragging) cancelDrag();
                }}
              >
                <AppTile icon={<WidgetIcon id={w.id} />} label={w.label} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
