import tireCar from '../../assets/car/tire-car.svg';
import styles from './WidgetBar.module.css';

function Stat({ value, unit }: { value: string; unit: string }) {
  return (
    <p className={`text-title-m ${styles.stat}`}>
      {value} <span className={styles.unit}>{unit}</span>
    </p>
  );
}

/** Figma ".Widget" Widget=Odometer. */
export function OdometerWidget() {
  return (
    <div className={styles.odometer}>
      <div className={styles.column}>
        <p className="text-title-l">Odometer</p>
        <Stat value="26,422" unit="miles" />
      </div>
      <div className={styles.column}>
        <p className="text-title-l">Current Drive</p>
        <Stat value="240.5" unit="Wh/ml" />
        <Stat value="0.2" unit="kWh" />
        <Stat value="0.8" unit="mi" />
        <Stat value="5" unit="min" />
      </div>
      <div className={styles.column}>
        <p className="text-title-l">Since Charge</p>
        <Stat value="273" unit="Wh/ml" />
        <Stat value="17.1" unit="kWh" />
        <Stat value="62.5" unit="mi" />
        <p className={`text-title-m ${styles.stat}`}>
          2 <span className={styles.unit}>hrs</span> 39 <span className={styles.unit}>min</span>
        </p>
      </div>
    </div>
  );
}

function Tire() {
  return (
    <div className={styles.tire}>
      <p className="text-title-l">38 psi</p>
      <p className={`text-title-m ${styles.unit}`}>yesterday</p>
    </div>
  );
}

/** Figma ".Widget" Widget=Tire Pressure. */
export function TireWidget() {
  return (
    <div className={styles.tirePressure}>
      <div className={styles.column}>
        <p className="text-title-l">Tire Pressure</p>
        <div className={`text-title-m ${styles.recommended}`}>
          <p>Recommended</p>
          <p>Front: 42psi</p>
          <p>Rear: 42psi</p>
        </div>
      </div>
      <div className={styles.carInfo}>
        <div className={styles.tireColumn}>
          <Tire />
          <Tire />
        </div>
        <img src={tireCar} alt="" width={119} height={113} />
        <div className={styles.tireColumn}>
          <Tire />
          <Tire />
        </div>
      </div>
    </div>
  );
}
