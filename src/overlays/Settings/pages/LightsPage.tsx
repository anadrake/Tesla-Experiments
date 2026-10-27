import { Divider, FieldGroup, SegmentedControl, SettingRow, ToggleButton } from '../../../components/settings/controls';
import { useHud } from '../../../state/store';

/**
 * Figma Settings / Lights body. Headlights and Auto High Beam share their values with the Controls page
 * (same setting keys), so changing one updates the other.
 */
export function LightsPage() {
  const toDisplay = () => useHud.getState().setSettingsPage('display');
  return (
    <>
      <FieldGroup title="Headlights" infoIcon link="Display" onLink={toDisplay}>
        <SegmentedControl setting="controls.headlights" options={['Off', 'Parking', 'On', 'Auto']} initial="Auto" width="fill" />
      </FieldGroup>
      <div>
        <ToggleButton setting="lights.frontFog" initial>
          Front Fog
        </ToggleButton>
      </div>
      <FieldGroup title="Auto Turn Signals">
        <SegmentedControl setting="lights.turnSignals" options={['Off', 'Auto Cancel']} initial="Auto Cancel" width="fill" />
      </FieldGroup>
      <SettingRow setting="controls.autoHighBeam" initial title="Auto High Beam" />
      <SettingRow setting="lights.afterExit" initial title="Headlights After Exit" />
      <Divider />
      <FieldGroup title="Dome Lights">
        <SegmentedControl setting="lights.dome" options={['Off', 'On', 'Auto']} initial="Auto" width="fill" />
      </FieldGroup>
      <div>
        <ToggleButton setting="lights.ambient">Ambient Lights</ToggleButton>
      </div>
      <SettingRow setting="lights.welcome" initial title="Welcome Lights" description="Light up the cabin when you approach" />
    </>
  );
}
