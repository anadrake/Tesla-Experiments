import { AppTile } from '../AppTile/AppTile';
import { WIDGETS, WidgetIcon, type WidgetDef } from '../WidgetBar/registry';
import styles from './Customize.module.css';

const ALL = Object.values(WIDGETS);
const groups: WidgetDef[][] = [ALL.filter((w) => w.group === 'standard'), ALL.filter((w) => w.group === 'other')];

/**
 * Sketch "Add Apps Frame" (4802:103107 › 4802:104691): 599 wide card, "Drag Icons to Panel to Customize",
 * standard widgets · divider · other apps. Always lists every app, even ones already on the track (Q20).
 * Tiles become drag sources in 8.3.
 */
export function WidgetPicker() {
  return (
    <div className={styles.picker} role="group" aria-label="Add widgets">
      <p className={`text-body-l ${styles.pickerTitle}`}>Drag Icons to Panel to Customize</p>
      {groups.map((apps, i) => (
        <div key={i} className={styles.pickerGroup}>
          {i > 0 && <span className={styles.pickerDivider} aria-hidden />}
          <div className={styles.pickerRow}>
            {apps.map((w) => (
              <div key={w.id} data-picker-app={w.id}>
                <AppTile icon={<WidgetIcon id={w.id} />} label={w.label} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
