import { Checkbox, Divider, FieldGroup, Overline, SearchField, SegmentedControl, Select, SettingRow } from '../../../components/settings/controls';
import { useHud, type SettingsPage } from '../../../state/store';

/**
 * Settings / Search — Figma layout, real copy (Q15). Highlighted features are shortcuts into other pages;
 * shared setting keys (e.g. controls.autoHighBeam) stay in sync with the page they link to.
 */
export function SearchPage() {
  const go = (page: SettingsPage) => () => useHud.getState().setSettingsPage(page);
  const typing = useHud((s) => s.settingsTyping);
  const query = useHud((s) => s.settingsQuery);
  const openSearch = useHud((s) => s.openSettingsSearch);
  return (
    <>
      <SearchField placeholder="Search settings" value={query} focused={typing} onPress={openSearch} />
      <Overline>Highlighted features</Overline>
      <SettingRow
        setting="display.nightShift"
        initial
        title="Night Shift"
        infoIcon
        description="Automatically adjust to warmer colors at night"
        link="Display"
        onLink={go('display')}
      />
      <Divider />
      <FieldGroup title="Text Size" infoIcon link="Display" onLink={go('display')}>
        <SegmentedControl setting="display.textSize" options={['Standard', 'Large']} initial="Standard" />
      </FieldGroup>
      <Divider />
      <FieldGroup
        title="Sentry Mode"
        infoIcon
        link="Safety"
        onLink={go('safety')}
        helper="Sentry Mode will not be enabled when you leave the car"
      >
        <SegmentedControl setting="safety.sentry" options={['Off', 'On']} initial="Off" />
        <Checkbox setting="safety.sentryAsk" label="Ask each time" />
      </FieldGroup>
      <Divider />
      <SettingRow setting="display.clock24h" title="24-Hour Clock" />
      <SettingRow setting="display.batteryPercent" initial title="Show Battery Percentage" />
      <Divider />
      <FieldGroup title="Distance Units" infoIcon link="Display" onLink={go('display')}>
        <Select setting="display.units" options={['Miles', 'Kilometers']} initial="Miles" />
      </FieldGroup>
      <Divider />
      <SettingRow
        setting="controls.autoHighBeam"
        initial
        title="Auto High Beam"
        infoIcon
        description="Switch to high beams when no traffic is ahead"
        link="Controls"
        onLink={go('controls')}
      />
    </>
  );
}
