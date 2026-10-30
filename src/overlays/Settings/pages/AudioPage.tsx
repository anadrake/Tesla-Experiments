import info from '../../../assets/settings/photo/info.svg';
import reset from '../../../assets/settings/photo/reset.svg';
import { Icon } from '../../../components/Icon/Icon';
import { Divider, OutlineButton, Segmented, Stack, Text } from '../photo/Photo';
import styles from './pages.module.css';

/** EQ bands (dB). Knob centre = 127 − gain × 10 (0 dB on the baseline) in the 220-tall fader (Figma Gain=8 / 4 / 0 variants). */
const BANDS = [8, 8, 8, 4, 0];

/** Audio 2026 / Equalizer Band (4940:27868): value, fader (rail + knob). */
function Band({ gain }: { gain: number }) {
  return (
    <div className={styles.eqBand}>
      <Text>{gain.toFixed(1)}</Text>
      <div className={styles.fader}>
        <span className={styles.faderKnob} style={{ top: 127 - gain * 10 }} />
      </div>
    </div>
  );
}

/** Photo / Immersive Slider (4959:25264): three intensity ticks, Standard selected. */
function ImmersiveSlider() {
  return (
    <div className={styles.immersive}>
      {[30.5, 256.5, 482.5].map((x) => (
        <span key={x} className={styles.immersiveTick} style={{ left: x }} />
      ))}
      <span className={styles.immersiveSelected} />
    </div>
  );
}

/** Figma Settings 2026 / Audio (4935:2329): Tone, EQ, Immersive Sound. Static (Q41). */
export function AudioPage() {
  return (
    <Stack gap={24}>
      <Segmented options={['Tone', 'Balance']} selected="Tone" />
      <div className={styles.eqCard}>
        <span className={`text-photo-button ${styles.fillButton} ${styles.raised}`} style={{ width: 348, whiteSpace: 'pre' }}>
          {'Create Preset     +'}
        </span>
        <div className={styles.eqBands}>
          {BANDS.map((g, i) => (
            <Band key={i} gain={g} />
          ))}
          <span className={styles.eqBaseline} />
          <span className={styles.eqReset}>
            <Icon src={reset} size={32} color="var(--photo-icon)" />
          </span>
          <span className={`text-body-s ${styles.eqUnit}`}>dB</span>
        </div>
        <div className={styles.labels3}>
          <Text>BASS</Text>
          <Text>MID</Text>
          <Text>TREBLE</Text>
        </div>
        <div className={styles.inlineTitle} style={{ gap: 8 }}>
          <Text as="label">Immersive Sound</Text>
          <Icon src={info} size={24} color="var(--photo-icon)" />
        </div>
        <div className={styles.brightnessRow}>
          <ImmersiveSlider />
          <OutlineButton width={122}>Auto</OutlineButton>
        </div>
        <div className={styles.labels3} style={{ width: 558 }}>
          <Text as="caption">Off</Text>
          <Text as="caption">Low</Text>
          <Text as="caption">Standard</Text>
        </div>
      </div>
      <Divider />
      <Text as="label">Grok Settings</Text>
    </Stack>
  );
}
