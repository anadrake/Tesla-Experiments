import { Divider, Section, Segmented, Stack, ToggleRow } from '../photo/Photo';

/** Figma Settings 2026 / Lights (4933:1133). Static (Q41). */
export function LightsPage() {
  return (
    <Stack gap={28}>
      <Section title="Headlights">
        <Segmented options={['Off', 'Parking', 'On', 'Auto']} selected="Auto" />
      </Section>
      <Section title="Auto Turn Signals" info>
        <Segmented options={['Off', 'Auto Cancel']} selected="Auto Cancel" width={372} />
      </Section>
      <ToggleRow
        on
        title="Adaptive Headlights"
        description="Selectively dims individual pixels of the high beams to reduce glare for other traffic, and adjusts headlights for curves."
      />
      <ToggleRow on={false} title="Headlights after Exit" />
      <Divider />
      <Section title="Dome Lights">
        <Segmented options={['Off', 'On', 'Auto']} selected="Off" width={558} />
      </Section>
      <ToggleRow on={false} title="Steering Wheel Lights" />
    </Stack>
  );
}
