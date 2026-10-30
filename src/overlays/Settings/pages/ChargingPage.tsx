import clock from '../../../assets/settings/photo/clock.svg';
import info from '../../../assets/settings/photo/info.svg';
import plug from '../../../assets/settings/photo/plug.svg';
import { Icon } from '../../../components/Icon/Icon';
import { Divider, IconRow, OutlineButton, Stack, Stepper, Text } from '../photo/Photo';
import styles from './pages.module.css';

/** Ticks every 10% of the 672 rail (12 in); labels at 20 / 40 / 60 / 80. */
const TICKS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/** Photo / Charge Slider (4959:25235): limit rail, current charge (78%), handle at the 100% limit. */
function ChargeSlider() {
  return (
    <div className={styles.chargeSlider}>
      {TICKS.map((t) => (
        <span key={t} className={styles.chargeTick} style={{ left: 12 + t * 67.2 }}>
          {t % 2 === 0 && <span className="text-photo-caption">{t * 10}</span>}
        </span>
      ))}
      <span className={styles.chargeRail} />
      <span className={styles.chargeFill} style={{ width: 525 }} />
      <span className={styles.chargeHandle} />
    </div>
  );
}

/** Figma Settings 2026 / Charging (4933:735). Static (Q41). */
export function ChargingPage() {
  return (
    <Stack gap={28}>
      <p className={`text-heading-xl ${styles.photoPrimary}`}>197 mi</p>
      <div className={styles.chargeCard}>
        <Text as="label">Charge Limit: 100%</Text>
        <Text tone="accent">Set Limit at this location</Text>
        <ChargeSlider />
        <Divider />
        <OutlineButton bare>Open Charge Port</OutlineButton>
      </div>
      <IconRow icon={plug} label={<>Charge Current at this<br />location</>}>
        <Stepper value="32 A" />
      </IconRow>
      <IconRow icon={clock} label={<>Schedule charge at this<br />location</>}>
        <OutlineButton width={360}>Schedule</OutlineButton>
      </IconRow>
      <div className={styles.inlineTitle}>
        <Text as="label">Last Paid Charging Session</Text>
        <Icon src={info} size={24} color="var(--photo-icon)" />
      </div>
      <Text>
        $13.38
        <br />
        Irvine, CA - Spectrum Center Drive
        <br />
        Sun, Oct 25 9:03 am
      </Text>
      <Text tone="accent">Supercharging Tips</Text>
    </Stack>
  );
}
