import { Divider, FieldGroup, SegmentedControl, SettingRow } from '../../../components/settings/controls';
import { useHud } from '../../../state/store';

/** Figma Settings / Pedals & Steering body (placeholder rows given real copy, Q15). */
export function PedalsPage() {
  const toControls = () => useHud.getState().setSettingsPage('controls');
  return (
    <>
      <FieldGroup title="Acceleration">
        <SegmentedControl setting="pedals.acceleration" options={['Chill', 'Standard']} initial="Standard" width="fill" />
      </FieldGroup>
      <FieldGroup title="Steering Mode">
        <SegmentedControl setting="pedals.steering" options={['Comfort', 'Standard', 'Sport']} initial="Standard" width="fill" />
      </FieldGroup>
      <FieldGroup
        title="Stopping Mode"
        infoIcon
        helper="Maximises range by extending regenerative braking to lower speeds and automatically blends in brakes to hold the vehicle at a stop"
      >
        <SegmentedControl setting="pedals.stopping" options={['Creep', 'Roll', 'Hold']} initial="Hold" width="fill" />
      </FieldGroup>
      <SettingRow setting="pedals.slipStart" initial title="Slip Start" infoIcon description="Allows some wheel slip to help in snow, sand or mud" />
      <Divider />
      <SettingRow
        setting="pedals.steeringHeat"
        initial
        title="Auto Steering Wheel Heat"
        infoIcon
        description="Heats the wheel automatically on cold days"
        link="Controls"
        onLink={toControls}
      />
    </>
  );
}
