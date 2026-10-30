import sentry from '../../../assets/settings/photo/sentry.svg?raw';
import { ThemedSvg } from '../../../components/ThemedSvg/ThemedSvg';
import { Checkbox, OutlineButton, Section, Segmented, Stack, ToggleRow } from '../photo/Photo';
import styles from './pages.module.css';

/** Sentry glyph: ring = photo icon, dot = photo alert. */
const SENTRY_COLORS = { '#5B5E61': 'var(--photo-icon)', '#DE333D': 'var(--photo-status-alert)' };

/** Figma Settings 2026 / Safety (4933:1591). Static (Q41). */
export function SafetyPage() {
  return (
    <Stack gap={12}>
      <Section title="Sentry Mode" info helper="Sentry will be enabled when you leave the car">
        <OutlineButton width={372} icon={<ThemedSvg svg={sentry} colors={SENTRY_COLORS} className={styles.icon48} />}>
          Sentry
        </OutlineButton>
      </Section>
      <ToggleRow on title="Auto Enable Sentry in Park" />
      <div className={styles.checkList}>
        <Checkbox checked label="Exclude Home" />
        <Checkbox checked={false} label="Exclude Work" />
        <Checkbox checked={false} label="Exclude Favorites" />
      </div>
      <ToggleRow on info title="Camera-Based Detection" />
      <ToggleRow on={false} info title="Disable Sentry Sounds" />
      <Section title="View Camera via Mobile App" info>
        <Segmented options={['Off', 'On']} selected="Off" width={372} />
      </Section>
      <Section title="Dashcam" info>
        <div className={styles.dashcamRow}>
          <Segmented options={['Off', 'Manual', 'Auto']} selected="Auto" width={558} />
          <OutlineButton width={174}>On Honk</OutlineButton>
        </div>
      </Section>
    </Stack>
  );
}
