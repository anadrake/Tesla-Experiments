import brightness from '../../../assets/settings/brightness.svg';
import { Button, Checkbox, Divider, FieldGroup, SegmentedControl, Select, SettingRow, Slider, ToggleButton } from '../../../components/settings/controls';
import { useSetting } from '../../../components/settings/useSetting';
import { toggleDayNight } from '../../../state/dayNight';
import { useHud } from '../../../state/store';

const systemMode = () => (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

/**
 * Figma Settings / Display body. Appearance really switches the app (with the Day/Night dissolve);
 * Brightness + Auto and Night Shift share their values with the Controls and Search pages.
 */
export function DisplayPage() {
  const mode = useHud((s) => s.mode);
  const [appearance, setAppearance] = useSetting('display.appearance', 'Auto');
  const [autoBrightness, setAutoBrightness] = useSetting('controls.brightnessAuto', true);

  const choose = (v: string) => {
    setAppearance(v);
    const target = v === 'Auto' ? systemMode() : v.toLowerCase();
    if (target !== mode) toggleDayNight();
  };

  return (
    <>
      <FieldGroup title="Appearance">
        <SegmentedControl options={['Light', 'Dark', 'Auto']} initial="Auto" width="fill" value={appearance} onChange={choose} />
      </FieldGroup>
      <SettingRow setting="display.nightShift" initial title="Night Shift" infoIcon description="Automatically adjust to warmer colors at night" />
      <FieldGroup title="Brightness">
        <Slider setting="controls.brightness" initial={50} icon={brightness} />
        <Button variant={autoBrightness ? 'primary' : 'secondary'} onPress={() => setAutoBrightness(!autoBrightness)}>
          Auto
        </Button>
      </FieldGroup>
      <div>
        <ToggleButton setting="display.screenClean">Screen Clean Mode</ToggleButton>
      </div>
      <Divider />
      <FieldGroup title="Touchscreen Language" helper="Long press the scroll wheel for a quick language switch">
        <Select setting="display.language" options={['English', 'Español', 'Français', 'Deutsch']} initial="English" />
        <Checkbox setting="display.languageAsk" label="Ask each time" />
      </FieldGroup>
      <Divider />
      <FieldGroup title="Voice Recognition">
        <Select setting="display.voice" options={['English', 'Español', 'Français', 'Deutsch']} initial="English" />
      </FieldGroup>
    </>
  );
}
