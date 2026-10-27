import autoHighBeam from '../../../assets/settings/auto-high-beam.svg';
import mirrors from '../../../assets/settings/mirrors.svg';
import childLock from '../../../assets/settings/child-lock.svg';
import windowLock from '../../../assets/settings/window-lock.svg';
import glovebox from '../../../assets/settings/glovebox.svg';
import wipers from '../../../assets/settings/wipers.svg';
import recording from '../../../assets/settings/recording.svg?raw';
import steering from '../../../assets/settings/steering.svg';
import sentry from '../../../assets/settings/sentry.svg';
import brightness from '../../../assets/settings/brightness.svg';
import { Button, FieldGroup, Slider } from '../../../components/settings/controls';
import { TileChoice, TileToggles, ToggleTile } from '../../../components/settings/Tiles';
import { useSetting } from '../../../components/settings/useSetting';
import styles from './pages.module.css';

/** Dashcam glyph: body = content/secondary, recording dot = status/danger. */
const RECORDING = { svg: recording, colors: { '#D0D1D2': 'var(--color-content-secondary)', '#ED4E3B': 'var(--color-status-danger)' } };

/** Figma Settings / Controls body. */
export function ControlsPage() {
  const [autoBrightness, setAutoBrightness] = useSetting('controls.brightnessAuto', true);
  return (
    <>
      <div className={styles.tileRow}>
        <TileChoice
          setting="controls.headlights"
          initial="Auto"
          minHeight={110}
          tiles={[{ label: 'Off' }, { label: 'Parking' }, { label: 'On' }, { label: 'Auto' }]}
        />
        <ToggleTile standalone setting="controls.autoHighBeam" initial tile={{ label: 'Auto High Beam', icon: autoHighBeam }} />
      </div>
      <TileToggles
        settingPrefix="controls"
        minHeight={162}
        tiles={[
          { label: 'Fold Mirrors', icon: mirrors },
          { label: 'Child Lock', icon: childLock },
          { label: 'Window Lock', icon: windowLock },
          { label: 'Glovebox', icon: glovebox },
        ]}
      />
      <TileChoice
        setting="controls.wipers"
        initial="II"
        minHeight={162}
        tiles={[{ label: 'Off' }, { label: 'I' }, { label: 'II' }, { label: 'III' }, { label: 'IIII' }, { label: 'Auto', icon: wipers }]}
      />
      <TileToggles
        settingPrefix="controls"
        layout="horizontal"
        minHeight={112}
        tiles={[{ label: 'Mirrors', icon: mirrors }, { label: 'Recording', iconRaw: RECORDING }]}
      />
      <TileToggles
        settingPrefix="controls"
        layout="horizontal"
        minHeight={112}
        tiles={[{ label: 'Steering', icon: steering }, { label: 'Sentry', icon: sentry }]}
      />
      <FieldGroup title="Brightness">
        <Slider setting="controls.brightness" initial={50} icon={brightness} />
        <Button variant={autoBrightness ? 'primary' : 'secondary'} onPress={() => setAutoBrightness(!autoBrightness)}>
          Auto
        </Button>
      </FieldGroup>
    </>
  );
}
