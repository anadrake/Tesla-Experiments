import { Divider, Section, Segmented, Stack, ToggleRow } from '../photo/Photo';

/** Figma Settings 2026 / Dynamics (4933:527). Static (Q41). */
export function DynamicsPage() {
  return (
    <Stack gap={28}>
      <Section title="Acceleration">
        <Segmented options={['Chill', 'Standard']} selected="Standard" width={372} />
      </Section>
      <Section title="Steering Weight">
        <Segmented options={['Light', 'Standard', 'Heavy']} selected="Heavy" width={558} />
      </Section>
      <Section
        title="Stopping Mode"
        helper="Maximizes range by extending regenerative braking to lower speeds and automatically blends in brakes to hold the vehicle at a stop."
      >
        <Segmented options={['Creep', 'Roll', 'Hold']} selected="Hold" width={558} />
      </Section>
      <ToggleRow on info title={<span style={{ display: 'inline-block', width: 510 }}>Apply Brakes When Regenerative Braking Is Limited</span>} />
      <Divider />
      <ToggleRow on={false} title="Slip Start" description="Use to help free vehicle stuck in snow, sand, or mud." />
    </Stack>
  );
}
