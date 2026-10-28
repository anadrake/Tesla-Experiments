import type { ComponentType } from 'react';
import calendar from '../../assets/apps/calendar.svg';
import energy from '../../assets/widgets/energy.png';
import music from '../../assets/widgets/music.svg';
import phone from '../../assets/apps/phone.svg';
import odometer from '../../assets/widgets/odometer.svg';
import quickActions from '../../assets/widgets/quick-actions.svg';
import tire from '../../assets/widgets/tire.svg';
import { OdometerWidget, TireWidget } from './InfoWidgets';
import { MusicWidget } from './MusicWidget';
import type { WidgetId } from '../../state/widgets';
import { Icon } from '../Icon/Icon';
import styles from './WidgetBar.module.css';

export type { WidgetId };

/**
 * Every app that can live on the widget track (Figma Sketches 4766:94038, picker "Add Apps Frame").
 * To give an app a real widget, set `Widget` (and `mini` if its Mini Chicklet isn't 92²) — nothing else changes.
 * Apps without a `Widget` show PlaceholderWidget ("<label> Widget Coming Soon").
 */
export interface WidgetDef {
  id: WidgetId;
  /** Picker tile label + widget name under the track in Customize mode. */
  label: string;
  /** Accessible name of the widget page. */
  ariaLabel: string;
  icon: string;
  /** glyph = monochrome icon (token color via Icon); pictogram = fixed-color app art (<img>). */
  iconKind: 'glyph' | 'pictogram';
  /** Picker row: standard (top) or other apps (below the divider). */
  group: 'standard' | 'other';
  Widget?: ComponentType;
  /** Mini Chicklet size in the Collapsed rail. */
  mini: { width: number; height: number };
}

const MINI_DEFAULT = { width: 92, height: 92 };

export const WIDGETS: Record<WidgetId, WidgetDef> = {
  quickActions: { id: 'quickActions', label: 'Quick Actions', ariaLabel: 'Quick Actions', icon: quickActions, iconKind: 'glyph', group: 'standard', mini: MINI_DEFAULT },
  music: { id: 'music', label: 'Music', ariaLabel: 'Music', icon: music, iconKind: 'glyph', group: 'standard', Widget: MusicWidget, mini: MINI_DEFAULT },
  odometer: { id: 'odometer', label: 'Odometer', ariaLabel: 'Trip stats', icon: odometer, iconKind: 'glyph', group: 'standard', Widget: OdometerWidget, mini: { width: 96, height: 92 } },
  tire: { id: 'tire', label: 'Tire Pressure', ariaLabel: 'Tire pressure', icon: tire, iconKind: 'glyph', group: 'standard', Widget: TireWidget, mini: { width: 98, height: 98 } },
  calendar: { id: 'calendar', label: 'Calendar', ariaLabel: 'Calendar', icon: calendar, iconKind: 'pictogram', group: 'other', mini: MINI_DEFAULT },
  phone: { id: 'phone', label: 'Phone', ariaLabel: 'Phone', icon: phone, iconKind: 'pictogram', group: 'other', mini: MINI_DEFAULT },
  energy: { id: 'energy', label: 'Energy Usage', ariaLabel: 'Energy Usage', icon: energy, iconKind: 'pictogram', group: 'other', mini: MINI_DEFAULT },
};

/** An app's 48px icon: glyphs take `--color-icon-default` (picker tiles), pictograms keep their own colors. */
export function WidgetIcon({ id, size = 48 }: { id: WidgetId; size?: number }) {
  const w = WIDGETS[id];
  if (w.iconKind === 'glyph') return <Icon src={w.icon} size={size} color="var(--color-icon-default)" />;
  return <img className={styles.pictogram} src={w.icon} alt="" width={size} height={size} />;
}

/** Sketch "<App> Widget Coming Soon" card (4802:107503) for apps whose widget isn't designed yet. */
export function PlaceholderWidget({ id }: { id: WidgetId }) {
  return (
    <div className={styles.placeholder}>
      <WidgetIcon id={id} />
      <p className="text-body-m">{WIDGETS[id].label} Widget Coming Soon</p>
    </div>
  );
}

/** The widget page body for a track entry. */
export function TrackWidget({ id }: { id: WidgetId }) {
  const { Widget } = WIDGETS[id];
  return Widget ? <Widget /> : <PlaceholderWidget id={id} />;
}
