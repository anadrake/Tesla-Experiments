import { Checkbox, Divider, FieldGroup, Overline, SearchField, SegmentedControl, Select, SettingRow } from '../../../components/settings/controls';
import { useHud } from '../../../state/store';

/**
 * Figma Settings / Search body. Copy is Figma's placeholder text ("Field Text", "Tab 1"…) — see WORKLOG Q15.
 * "Display" links jump to the Display page.
 */
export function SearchPage() {
  const toDisplay = () => useHud.getState().setSettingsPage('display');
  return (
    <>
      <SearchField />
      <Overline>Highlighted features</Overline>
      <SettingRow setting="search.nightColors" initial title="Field Text" infoIcon description="Automatically adjust to warmer colors at night" link="Display" onLink={toDisplay} />
      <Divider />
      <FieldGroup title="Text Size" infoIcon link="Display" onLink={toDisplay}>
        <SegmentedControl setting="search.textSize" options={['Off', 'On']} initial="Off" />
      </FieldGroup>
      <Divider />
      <FieldGroup title="Text For Title Here" infoIcon link="Display" onLink={toDisplay} helper="Sentry Mode will not be enabled when you leave the car">
        <SegmentedControl setting="search.tab" options={['Tab 1', 'Tab 2']} initial="Tab 1" />
        <Checkbox setting="search.askEachTime" label="Ask each time" />
      </FieldGroup>
      <Divider />
      <SettingRow setting="search.field1" initial title="Field Text" />
      <SettingRow setting="search.field2" title="Field Text" />
      <Divider />
      <FieldGroup title="Text For Title Here" infoIcon link="Display" onLink={toDisplay}>
        <Select setting="search.option" options={['Option', 'Option 2', 'Option 3']} initial="Option" />
      </FieldGroup>
      <Divider />
      <SettingRow setting="search.field3" title="Field Text" infoIcon description="Text" link="Display" onLink={toDisplay} />
    </>
  );
}
