import { Divider, Section, Segmented, Select, Stack, Text, ToggleRow } from '../photo/Photo';
import styles from './pages.module.css';

/** Figma Settings 2026 / Self-Driving (4933:846). Static (Q41). */
export function SelfDrivingPage() {
  return (
    <Stack gap={28}>
      <Section
        title="Self-Driving Features"
        info
        helper="If a Strikeout occurs 5 times due to improper use, Autosteer and Full Self-Driving (Supervised) will no longer operate. This vehicle has not had any such events."
      >
        <Segmented
          options={['Traffic-Aware\nCruise Control', 'Autosteer\n(Beta)', 'Full Self-Driving\n(Supervised)']}
          selected={'Full Self-Driving\n(Supervised)'}
        />
      </Section>
      <Divider />
      <Text as="label">FSD (Supervised) Stats</Text>
      <p className={styles.fsdShare}>
        <span className="text-heading-m">1% </span>
        <span className="text-photo-body">Self-Driving</span>
      </p>
      <div className={styles.statCard}>
        <div>
          <Text as="label">Self-Driving Miles</Text>
          <Text>37.7 mi</Text>
        </div>
        <div>
          <Text as="label">Total Miles</Text>
          <Text>2,681.9 mi</Text>
        </div>
      </div>
      <Divider />
      <ToggleRow on={false} info title="Brake Confirm" description="Require brake press and release to start FSD (Supervised) from Park" />
      <Section title="Speed Profile">
        <Select value="Sloth" />
      </Section>
    </Stack>
  );
}
