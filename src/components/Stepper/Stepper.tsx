import chevronLeft from '../../assets/icons/chevron-left.svg';
import chevronRight from '../../assets/icons/chevron-right.svg';
import { Icon } from '../Icon/Icon';
import { Pressable } from '../Pressable/Pressable';
import styles from './Stepper.module.css';

interface StepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
}

/** Figma "Stepper" (4230:76), Bare variant — cabin temperature ‹ 72 ›. */
export function Stepper({ value, min, max, onChange, label }: StepperProps) {
  return (
    <div className={styles.stepper} role="group" aria-label={label}>
      <Pressable
        className={styles.chevron}
        aria-label={`Decrease ${label}`}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Icon src={chevronLeft} color="var(--color-content-secondary)" />
      </Pressable>
      <p className={`text-heading-xl ${styles.value}`}>{value}</p>
      <Pressable
        className={styles.chevron}
        aria-label={`Increase ${label}`}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Icon src={chevronRight} color="var(--color-content-secondary)" />
      </Pressable>
    </div>
  );
}
