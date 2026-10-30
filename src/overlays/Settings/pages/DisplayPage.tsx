import sunLarge from '../../../assets/settings/photo/sun-large.svg';
import sunSmall from '../../../assets/settings/photo/sun-small.svg';
import { Icon } from '../../../components/Icon/Icon';
import { useHud } from '../../../state/store';
import { Divider, FillButton, Section, Segmented, Stack, ToggleRow } from '../photo/Photo';
import styles from './pages.module.css';

/** Photo / Brightness Slider (4959:25252): 558×80 outline, value box (160) after the small sun. */
function BrightnessSlider({ value }: { value: number }) {
  return (
    <div className={styles.brightness}>
      <Icon src={sunSmall} size={24} color="var(--photo-icon)" />
      <span className={`text-photo-button ${styles.brightnessValue}`}>{value}%</span>
      <Icon src={sunLarge} size={32} color="var(--photo-icon)" />
    </div>
  );
}

/** Figma Settings 2026 / Display (4933:1335). Static (Q41) — Appearance shows the app's current mode. */
export function DisplayPage() {
  const mode = useHud((s) => s.mode);
  return (
    <Stack gap={28}>
      <Section title="Appearance">
        <Segmented options={['Light', 'Dark', 'Auto']} selected={mode === 'dark' ? 'Dark' : 'Light'} width={558} />
      </Section>
      <ToggleRow on title="Reduce Blue Light" description="Automatically adjust to warmer colors at night" />
      <Section title="Brightness">
        <div className={styles.brightnessRow}>
          <BrightnessSlider value={12} />
          <FillButton primary width={152}>
            Auto
          </FillButton>
        </div>
      </Section>
      <Divider />
      <ToggleRow on title="Automatic Blind Spot Camera" description="Show side camera when turn signal is engaged" />
      <Divider />
      <FillButton width={360}>Screen Clean Mode</FillButton>
      <Divider />
      <FillButton width={360}>Customize Pet Mode</FillButton>
    </Stack>
  );
}
