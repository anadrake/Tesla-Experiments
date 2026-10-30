import { DeviceRow, Divider, RowAction, Stack } from '../photo/Photo';
import styles from './pages.module.css';

const TRIPS = [
  { title: 'Current Drive', stats: '0.0 mi · 0 min · 0 Wh/mi' },
  { title: 'Since Last Charge', stats: '0.0 mi · 0.0 kWh · 0 Wh/mi' },
  { title: 'Trip A', stats: '0.0 mi · 0.0 kWh · 0 Wh/mi' },
  { title: 'Trip B', stats: '0.0 mi · 0.0 kWh · 0 Wh/mi' },
];

/** Figma Settings 2026 / Trips (4935:2480; inferred layout — no photo). Static (Q41). */
export function TripsPage() {
  return (
    <Stack gap={24}>
      <p className={`text-heading-s ${styles.photoPrimary}`}>Trips</p>
      {TRIPS.map((t) => (
        <DeviceRow key={t.title} title={t.title} subtitle={t.stats}>
          <RowAction>Reset</RowAction>
        </DeviceRow>
      ))}
      <Divider />
      <p className={`text-title-l ${styles.photoPrimary}`}>Odometer · 26,468 mi</p>
    </Stack>
  );
}
