import book from '../../../assets/settings/photo/book.svg';
import car from '../../../assets/settings/photo/service-car.png';
import info from '../../../assets/settings/photo/info.svg';
import { Icon } from '../../../components/Icon/Icon';
import { FillButton, OutlineButton, Stack, Text } from '../photo/Photo';
import styles from './pages.module.css';

/** Tire readings around the overhead car (430-tall box): front-left / front-right / rear-left / rear-right. */
const TIRES = [
  { psi: 41, when: '2 days ago', left: 90, top: 64 },
  { psi: 35, when: 'September', left: 534, top: 64, low: true },
  { psi: 42, when: '2 days ago', left: 90, top: 330 },
  { psi: 41, when: '2 days ago', left: 534, top: 330 },
];

/** Figma Settings 2026 / Service (4935:2221): pressures, generated overhead vehicle art, service actions. Static (Q41). */
export function ServicePage() {
  return (
    <Stack gap={20}>
      <div className={styles.serviceHead}>
        <Text>
          Recommended Pressure
          <br />
          Front: 42 psi
          <br />
          Rear: 42 psi
        </Text>
        <Text style={{ textAlign: 'right' }}>
          Tire Service Mileage <Icon src={info} size={20} color="var(--photo-icon)" className={styles.inlineIcon} />
          <br />
          Approx. 19,000 miles ago
          <br />
          <span className={styles.accent}>Reset</span>
        </Text>
      </div>
      <div className={styles.tireMap}>
        <img className={styles.serviceCar} src={car} alt="" />
        {TIRES.map((t) => (
          <p key={`${t.left}-${t.top}`} className={styles.tire} data-low={t.low || undefined} style={{ left: t.left, top: t.top }}>
            <span className={styles.tirePsi}>{t.psi} psi</span>
            <span className={styles.tireWhen}>{t.when}</span>
          </p>
        ))}
      </div>
      <div className={styles.actionRow}>
        <FillButton icon={book} iconSize={32}>
          Owner’s Manual
        </FillButton>
        <FillButton>Camera Visibility</FillButton>
      </div>
      <div className={styles.actionRow}>
        <FillButton>Wheel &amp; Tire</FillButton>
        <OutlineButton>Wiper Service Mode</OutlineButton>
      </div>
      <div className={styles.actionRow}>
        <FillButton>Maintenance</FillButton>
        <FillButton>Car Wash Mode</FillButton>
      </div>
    </Stack>
  );
}
