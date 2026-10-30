import mute from '../../../assets/settings/photo/mute.svg';
import plus from '../../../assets/settings/photo/plus.svg';
import { Icon } from '../../../components/Icon/Icon';
import { Divider, FillButton, Section, Segmented, Stack, ToggleRow } from '../photo/Photo';
import styles from './pages.module.css';

/** Photo / Volume Slider (4959:25259): 372×80 filled — "−", rail, "+". */
function VolumeSlider() {
  return (
    <div className={styles.volume}>
      <span className="text-photo-button">−</span>
      <span className={styles.volumeRail} />
      <Icon src={plus} size={28} color="var(--photo-icon)" />
    </div>
  );
}

/** Figma Settings 2026 / Navigation (4935:1890). Static (Q41). */
export function NavigationPage() {
  return (
    <Stack gap={28}>
      <Section title="Navigation Volume">
        <div className={styles.volumeRow}>
          <VolumeSlider />
          <FillButton icon={mute} iconSize={32} width={120} />
        </div>
      </Section>
      <Divider />
      <Section title="Use HOV Lanes" info>
        <Segmented options={['No', 'Yes', 'Auto']} selected="No" width={558} />
      </Section>
      <Divider />
      <ToggleRow
        on
        info
        badge={<span className={`text-photo-caption ${styles.newBadge}`}>NEW</span>}
        title="Automatic Navigation"
        description="Automatically route to Home, Work, next calendar event or predicted destination."
      />
      <ToggleRow on title="Destination Suggestions" description="Predict and display suggestions based on navigation history." />
      <ToggleRow on title="Trip Planner" description="Adds Supercharger stops if necessary." />
      <div style={{ paddingLeft: 104 }}>
        <ToggleRow on={false} info title="Only Add Superchargers with Tesla Pricing" />
      </div>
      <ToggleRow on info title="Online Routing" />
    </Stack>
  );
}
