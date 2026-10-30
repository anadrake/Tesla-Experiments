import { Divider, Section, Select, Stack, Text } from '../photo/Photo';
import styles from './pages.module.css';

/** Photo / Schedule Row (4959:25215): 136 tall — title + caption, an 80² "+" button. */
function ScheduleRow({ title, detail }: { title: string; detail: string }) {
  return (
    <div className={styles.scheduleRow}>
      <div className={styles.keyLabels}>
        <Text as="label">{title}</Text>
        <Text as="caption" tone="secondary">
          {detail}
        </Text>
      </div>
      {/* Figma binds the "+" to font-size-22 but renders its 34 fallback — built as rendered */}
      <span className={styles.addButton}>+</span>
    </div>
  );
}

/** Figma Settings 2026 / Schedule (4933:1502). Static (Q41). */
export function SchedulePage() {
  return (
    <Stack gap={28}>
      <Section title="Schedule" info>
        <Select value="Current Location" />
      </Section>
      <Divider />
      <ScheduleRow title="Precondition" detail="Automatically adjust your cabin temperature and warm your battery by a set time." />
      <Divider />
      <ScheduleRow title="Charge" detail="Schedule when your vehicle starts and / or stops charging." />
    </Stack>
  );
}
