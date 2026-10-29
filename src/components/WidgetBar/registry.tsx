import type { ComponentType } from 'react';
import calendar from '../../assets/apps/calendar.svg';
import energy from '../../assets/widgets/energy.png';
import music from '../../assets/widgets/music.svg';
import phone from '../../assets/apps/phone.svg';
import odometer from '../../assets/widgets/odometer.svg';
import quickActions from '../../assets/widgets/quick-actions.svg';
import tire from '../../assets/widgets/tire.svg';
import {
  CalendarChicklet, CalendarMini, CalendarPill, CalendarWidget,
  EnergyChicklet, EnergyPill, EnergyWidget,
  PhoneChicklet, PhoneMini, PhonePill, PhoneWidget,
  QuickActionsChicklet, QuickActionsMini, QuickActionsPill, QuickActionsWidget,
} from './ConceptWidgets';
import { OdometerChicklet, OdometerMini, OdometerPill, OdometerWidget, TireChicklet, TireMini, TirePill, TireWidget } from './InfoWidgets';
import { MusicChicklet, MusicMini, MusicPill, MusicWidget } from './MusicWidget';
import type { WidgetId } from '../../state/widgets';
import { Icon } from '../Icon/Icon';
import styles from './WidgetBar.module.css';

export type { WidgetId };

/**
 * Every app that can live on the widget track (Figma Sketches 4766:94038, picker "Add Apps Frame").
 * Sizes (Figma ".Widget / new full set" 4899:2892): Widget = Open 600×192 · Pill = collapsed bar 382×64 ·
 * Chicklet = Driving 220 rail (`large`) · Mini = Parked 116 rail (`mini`).
 * Apps without a `Widget` show PlaceholderWidget ("<label> Widget Coming Soon"); without Pill / Chicklet / Mini, their app icon.
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
  Pill?: ComponentType;
  Chicklet?: ComponentType;
  Mini?: ComponentType;
  /** Chicklet card size in the Driving 220 rail. */
  large: { width: number; height: number };
  /** Mini Chicklet size in the Collapsed rail. */
  mini: { width: number; height: number };
}

const MINI_DEFAULT = { width: 92, height: 92 };
/** New-set chicklets (Energy, Calendar, Phone, Quick Actions) are 200×185; the original three keep their sizes. */
const LARGE_NEW = { width: 200, height: 185 };

export const WIDGETS: Record<WidgetId, WidgetDef> = {
  quickActions: { id: 'quickActions', label: 'Quick Actions', ariaLabel: 'Quick Actions', icon: quickActions, iconKind: 'glyph', group: 'standard',
    Widget: QuickActionsWidget, Pill: QuickActionsPill, Chicklet: QuickActionsChicklet, Mini: QuickActionsMini, large: LARGE_NEW, mini: MINI_DEFAULT },
  music: { id: 'music', label: 'Music', ariaLabel: 'Music', icon: music, iconKind: 'glyph', group: 'standard',
    Widget: MusicWidget, Pill: MusicPill, Chicklet: MusicChicklet, Mini: MusicMini, large: { width: 188, height: 186 }, mini: MINI_DEFAULT },
  odometer: { id: 'odometer', label: 'Odometer', ariaLabel: 'Trip stats', icon: odometer, iconKind: 'glyph', group: 'standard',
    Widget: OdometerWidget, Pill: OdometerPill, Chicklet: OdometerChicklet, Mini: OdometerMini, large: { width: 186, height: 185 }, mini: { width: 96, height: 92 } },
  tire: { id: 'tire', label: 'Tire Pressure', ariaLabel: 'Tire pressure', icon: tire, iconKind: 'glyph', group: 'standard',
    Widget: TireWidget, Pill: TirePill, Chicklet: TireChicklet, Mini: TireMini, large: { width: 188, height: 186 }, mini: { width: 98, height: 98 } },
  phone: { id: 'phone', label: 'Phone', ariaLabel: 'Phone', icon: phone, iconKind: 'pictogram', group: 'other',
    Widget: PhoneWidget, Pill: PhonePill, Chicklet: PhoneChicklet, Mini: PhoneMini, large: LARGE_NEW, mini: MINI_DEFAULT },
  calendar: { id: 'calendar', label: 'Calendar', ariaLabel: 'Calendar', icon: calendar, iconKind: 'pictogram', group: 'other',
    Widget: CalendarWidget, Pill: CalendarPill, Chicklet: CalendarChicklet, Mini: CalendarMini, large: LARGE_NEW, mini: MINI_DEFAULT },
  // Mini = the green Energy pictogram (Figma 4899:2687), i.e. the app icon fallback.
  energy: { id: 'energy', label: 'Energy Usage', ariaLabel: 'Energy Usage', icon: energy, iconKind: 'pictogram', group: 'other',
    Widget: EnergyWidget, Pill: EnergyPill, Chicklet: EnergyChicklet, large: LARGE_NEW, mini: MINI_DEFAULT },
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
