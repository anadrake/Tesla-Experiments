import { Fragment } from 'react';
import plotSvg from '../../assets/widgets/energy-plot.svg?raw';
import calendarGlyph from '../../assets/widgets/calendar.svg';
import phoneGlyph from '../../assets/widgets/phone-call.svg';
import quickActionsGlyph from '../../assets/widgets/quick-actions.svg';
import defrostFront from '../../assets/climate/defrost-front.svg';
import defrostRear from '../../assets/climate/defrost-rear.svg';
import seatHeat from '../../assets/climate/seat-heat.svg';
import steeringHeat from '../../assets/climate/steering-heat.svg';
import wipers from '../../assets/climate/wipers.svg';
import { Icon } from '../Icon/Icon';
import { ThemedSvg } from '../ThemedSvg/ThemedSvg';
import styles from './ConceptWidgets.module.css';

/**
 * Figma ".Widget / new full set" (4899:2892): Energy, Calendar, Phone, Quick Actions — static concept widgets
 * (Q25: nothing inside them is tappable). Each has Open (600×192), Pill (382×64 collapsed bar),
 * Chicklet (200×185, Driving rail) and Mini (92², Collapsed rail). Specs: docs/SPECS-P9.md.
 */

/** Plot export colors → tokens: trace + area = success, above-rated spikes = chart-over-rated, rated line = tertiary. */
const PLOT_COLORS = {
  '#25CB55': 'var(--color-status-success)',
  '#FF8A00': 'var(--color-chart-over-rated)',
  '#A2A3A5': 'var(--color-content-tertiary)',
};

/** Live consumption trace (Figma "Plot"); stretches to its box like the Figma layer. */
function Plot({ className }: { className?: string }) {
  return <ThemedSvg svg={plotSvg} colors={PLOT_COLORS} className={`${styles.plot} ${className ?? ''}`} />;
}

function Consumption() {
  return (
    <p className={styles.consumption}>
      <span className="text-heading-m">218</span> <span className={`text-body-s ${styles.secondary}`}>Wh/mi</span>
    </p>
  );
}

/** Energy · Open `4899:2637`. */
export function EnergyWidget() {
  return (
    <div className={styles.energy}>
      <div className={styles.liveStats}>
        <p className="text-title-l">Energy</p>
        <p className={`text-body-s ${styles.secondary}`}>Current drive</p>
        <Consumption />
        <p className={`text-body-m ${styles.success}`}>9% below rated</p>
      </div>
      <div className={styles.chart}>
        <p className={`text-body-s ${styles.secondary} ${styles.legend}`}>Rated 240 Wh/mi</p>
        <div className={styles.plotRow}>
          <Plot />
          <div className={`text-body-s ${styles.secondary} ${styles.scale}`}>
            <p>400</p>
            <p>240</p>
            <p>0</p>
          </div>
        </div>
        <div className={`text-body-s ${styles.secondary} ${styles.distance}`}>
          <p>0 mi</p>
          <p>Last 5 mi</p>
          <p>5 mi</p>
        </div>
      </div>
    </div>
  );
}

export function EnergyPill() {
  return (
    <div className={styles.compactRow}>
      <p className="text-title-m">218</p>
      <p className={`text-body-s ${styles.secondary}`}>Wh/mi</p>
      <Plot className={styles.sparkPill} />
      <p className={`text-body-m ${styles.success}`}>−9%</p>
    </div>
  );
}

export function EnergyChicklet() {
  return (
    <div className={styles.chicklet}>
      <p className="text-title-l">Energy</p>
      <Consumption />
      <Plot className={styles.sparkChicklet} />
      <p className={`text-body-m ${styles.success}`}>9% below rated</p>
    </div>
  );
}

function Event({ title, time, place, note }: { title: string; time: string; place: string; note?: string }) {
  return (
    <div className={styles.event}>
      <p className={`text-title-l ${styles.eventTitle}`}>{title}</p>
      <p className={`text-body-l ${styles.secondary}`}>{time}</p>
      <p className={`text-body-m ${styles.secondary}`}>{place}</p>
      {note && <p className={`text-body-s ${styles.secondary}`}>{note}</p>}
    </div>
  );
}

/** Calendar · Open `4899:2696`. Figma title has a double space ("Lunch With  Agatha Jones") — built single. */
export function CalendarWidget() {
  return (
    <div className={styles.calendar}>
      <div className={styles.dateTile}>
        <p className={`text-body-s ${styles.secondary}`}>WED</p>
        <p className="text-heading-l">28</p>
      </div>
      <span className={styles.vDivider} />
      <Event title="Design review" time="10:30–11:00" place="Studio" note="In 15 min" />
      <span className={styles.vDivider} />
      <Event title="Lunch With Agatha Jones" time="12:30–1:30" place="Panera" />
    </div>
  );
}

export function CalendarPill() {
  return (
    <div className={styles.compactRow}>
      <Icon src={calendarGlyph} size={24} color="var(--color-icon-strong)" />
      <p className="text-title-m">10:30</p>
      <p className={`text-body-m ${styles.fill}`}>Design review</p>
    </div>
  );
}

export function CalendarChicklet() {
  return (
    <div className={styles.chicklet}>
      <p className={`text-body-l ${styles.header}`}>
        <Icon src={calendarGlyph} size={20} color="var(--color-icon-strong)" />
        Up next
      </p>
      <p className="text-heading-m">10:30</p>
      <p className="text-body-l">Design review</p>
      <p className={`text-body-s ${styles.secondary}`}>In 15 min</p>
      <p className={`text-body-s ${styles.secondary}`}>Then 12:30</p>
    </div>
  );
}

export function CalendarMini() {
  return (
    <div className={styles.mini}>
      <Icon src={calendarGlyph} size={31} color="var(--color-icon-strong)" />
      <p className="text-title-m">10:30</p>
    </div>
  );
}

/** `details` = Figma's fixed details column width, which sets where the call glyph sits. */
const CONTACTS = [
  { initial: 'M', name: 'Mom', details: 69 },
  { initial: 'D', name: 'Daniel', details: 78 },
];

function CallGlyph({ size = 24 }: { size?: number }) {
  return <Icon src={phoneGlyph} size={size} color="var(--color-icon-strong)" />;
}

/** Phone · Open `4899:2736`. */
export function PhoneWidget() {
  return (
    <div className={styles.phone}>
      <div className={styles.phoneHeader}>
        <p className={`text-title-l ${styles.fill}`}>Phone</p>
        <p className={`text-body-s ${styles.secondary} ${styles.connection}`}>
          <span className={styles.connectedDot} />
          Connected
        </p>
      </div>
      <span className={styles.hDivider} />
      <div className={styles.favorites}>
        {CONTACTS.map((c, i) => (
          <Fragment key={c.name}>
            {i > 0 && <span className={styles.vDividerFull} />}
            <div className={styles.contact}>
              <span className={`text-title-m ${styles.avatar}`}>{c.initial}</span>
              <div className={styles.contactDetails} style={{ width: c.details }}>
                <p className="text-title-m">{c.name}</p>
                <p className={`text-body-s ${styles.secondary}`}>Mobile</p>
              </div>
              <CallGlyph />
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export function PhonePill() {
  return (
    <div className={styles.compactRow}>
      <CallGlyph />
      {CONTACTS.map((c, i) => (
        <Fragment key={c.name}>
          {i > 0 && <span className={styles.pillDivider} />}
          <div className={styles.pillContact}>
            <p className={`text-title-m ${styles.fill}`}>{c.name}</p>
            <CallGlyph />
          </div>
        </Fragment>
      ))}
    </div>
  );
}

export function PhoneChicklet() {
  return (
    <div className={styles.chicklet}>
      <p className="text-title-l">Favorites</p>
      {CONTACTS.map((c, i) => (
        <Fragment key={c.name}>
          {i > 0 && <span className={styles.hDivider} />}
          <div className={styles.chickletContact}>
            <p className={`text-title-m ${styles.fill}`}>{c.name}</p>
            <CallGlyph />
          </div>
        </Fragment>
      ))}
    </div>
  );
}

export function PhoneMini() {
  return (
    <div className={styles.mini}>
      <p className={`text-body-s ${styles.secondary}`}>Phone</p>
      <CallGlyph size={20} />
    </div>
  );
}

const QUICK_ACTIONS = [
  { glyph: defrostFront, label: 'Front defrost' },
  { glyph: defrostRear, label: 'Rear defrost' },
  { glyph: seatHeat, label: 'Left seat' },
  { glyph: steeringHeat, label: 'Heated steering' },
  { glyph: wipers, label: 'Wipers' },
];

/** Quick Actions · Open `4899:2800` — App Tile-style cells, static (unlike the Quick Actions overlay). */
export function QuickActionsWidget() {
  return (
    <div className={styles.quickActions}>
      {QUICK_ACTIONS.map((a) => (
        <div key={a.label} className={styles.action}>
          <span className={styles.actionTile}>
            <Icon src={a.glyph} size={48} color="var(--color-icon-default)" />
          </span>
          <p className={`text-body-s ${styles.actionLabel}`}>{a.label}</p>
        </div>
      ))}
    </div>
  );
}

export function QuickActionsPill() {
  return (
    <div className={styles.compactRow}>
      {QUICK_ACTIONS.map((a) => (
        <span key={a.label} className={styles.pillAction}>
          <Icon src={a.glyph} size={32} color="var(--color-icon-default)" />
        </span>
      ))}
    </div>
  );
}

export function QuickActionsChicklet() {
  return (
    <div className={`${styles.chicklet} ${styles.quickActionsChicklet}`}>
      <p className="text-body-l-strong">Quick actions</p>
      <Icon src={quickActionsGlyph} size={99} color="var(--color-icon-default)" />
    </div>
  );
}

export function QuickActionsMini() {
  return (
    <div className={`${styles.mini} ${styles.miniCentred}`}>
      <Icon src={quickActionsGlyph} size={62} color="var(--color-icon-default)" />
    </div>
  );
}
