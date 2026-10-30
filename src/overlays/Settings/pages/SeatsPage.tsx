import cabinDark from '../../../assets/settings/photo/cabin-dark.png';
import cabinLight from '../../../assets/settings/photo/cabin-light.png';
import chevronDown from '../../../assets/settings/photo/chevron-down.svg';
import chevronUp from '../../../assets/settings/photo/chevron-up.svg';
import seatHeat from '../../../assets/settings/photo/seat-heat.svg';
import { Icon } from '../../../components/Icon/Icon';
import styles from './pages.module.css';

/** Heat hotspots (64², Seats 2026 / Heat Hotspot) over the cabin, in the 744×820 "Seat cabin" box. */
const HEAT = [
  { name: 'Driver', left: 206, top: 313 },
  { name: 'Passenger', left: 390, top: 313 },
  { name: 'Rear left', left: 206, top: 521 },
  { name: 'Rear center', left: 298, top: 521 },
  { name: 'Rear right', left: 390, top: 521 },
];

/**
 * Figma Settings 2026 / Seats (4935:2128): generated cabin cutaway (Light / Dark art — Light shown at 30% as in
 * Figma), five seat-heat hotspots and the passenger seat forward / back control. Static (Q41).
 */
export function SeatsPage() {
  return (
    <div className={styles.seatCabin}>
      <img className={styles.cabinLight} src={cabinLight} alt="" />
      <img className={styles.cabinDark} src={cabinDark} alt="" />
      {HEAT.map((h) => (
        <span key={h.name} className={styles.heatSpot} style={{ left: h.left, top: h.top }} aria-label={`${h.name} seat heat off`}>
          <Icon src={seatHeat} size={64} color="var(--photo-icon)" />
        </span>
      ))}
      <div className={styles.seatAdjust} aria-label="Passenger seat position">
        <Icon src={chevronUp} size={64} color="var(--photo-icon)" />
        <span className={styles.seatAdjustRule} />
        <Icon src={chevronDown} size={64} color="var(--photo-icon)" />
      </div>
    </div>
  );
}
