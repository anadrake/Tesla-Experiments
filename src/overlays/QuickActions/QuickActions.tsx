import { motion } from 'motion/react';
import defrostFront from '../../assets/climate/defrost-front.svg';
import defrostRear from '../../assets/climate/defrost-rear.svg';
import fan from '../../assets/climate/fan.svg';
import seatHeat from '../../assets/climate/seat-heat.svg';
import steeringHeat from '../../assets/climate/steering-heat.svg';
import wipers from '../../assets/climate/wipers.svg';
import navArt from '../../assets/apps/qa/nav.png';
import cameraArt from '../../assets/apps/qa/camera.png';
import dashcamArt from '../../assets/apps/qa/dashcam.png';
import energyArt from '../../assets/apps/qa/energy.png';
import phoneArt from '../../assets/apps/qa/phone.png';
import calendarArt from '../../assets/apps/qa/calendar.png';
import messagesArt from '../../assets/apps/qa/messages.png';
import zoomArt from '../../assets/apps/qa/zoom.png';
import grokArt from '../../assets/apps/qa/grok.png';
import theaterArt from '../../assets/apps/qa/theater.png';
import arcadeArt from '../../assets/apps/qa/arcade.png';
import toyboxArt from '../../assets/apps/qa/toybox.png';
import browserArt from '../../assets/apps/qa/browser.png';
import manualArt from '../../assets/apps/qa/manual.png';
import spotifyArt from '../../assets/apps/qa/spotify.png';
import bluetoothArt from '../../assets/apps/qa/bluetooth.png';
import tidalArt from '../../assets/apps/qa/tidal.png';
import audibleArt from '../../assets/apps/qa/audible.png';
import amazon_musicArt from '../../assets/apps/qa/amazon-music.png';
import youtube_musicArt from '../../assets/apps/qa/youtube-music.png';
import tuneinArt from '../../assets/apps/qa/tunein.png';
import caraokeArt from '../../assets/apps/qa/caraoke.png';
import self_drivingArt from '../../assets/apps/qa/self-driving.png';
import { AppTile } from '../../components/AppTile/AppTile';
import { Icon } from '../../components/Icon/Icon';
import { useHud, type ClimateAction } from '../../state/store';
import { transition } from '../../tokens/motion';
import styles from './QuickActions.module.css';

const CLIMATE: { id: ClimateAction; label: string; src: string }[] = [
  { id: 'frontDefrost', label: 'Front Defrost', src: defrostFront },
  { id: 'rearDefrost', label: 'Rear Defrost', src: defrostRear },
  { id: 'leftSeat', label: 'Left Seat', src: seatHeat },
  { id: 'heatedSteering', label: 'Heated Steering', src: steeringHeat },
  { id: 'climate', label: 'Climate', src: fan },
  { id: 'wipers', label: 'Wipers', src: wipers },
];

/**
 * Apps in Figma order (rows of 6 / 6 / 6 / 5). `art` = the pictogram's "Artwork / X" PNG inside its 48px clip:
 * left, top, size (each artwork overhangs the canvas a little, as drawn).
 */
const APPS: { label: string; src: string; art: [number, number, number] }[] = [
  { label: 'Nav', src: navArt, art: [-11.46, -11.46, 70.92] },
  { label: 'Camera', src: cameraArt, art: [-6.18, -5.91, 60.5] },
  { label: 'Dashcam', src: dashcamArt, art: [-3.81, -3.57, 55.621] },
  { label: 'Energy', src: energyArt, art: [-11.4, -11.37, 70.738] },
  { label: 'Phone', src: phoneArt, art: [-6.58, -7.64, 61.649] },
  { label: 'Calendar', src: calendarArt, art: [-2.03, -2.03, 52.053] },
  { label: 'Messages', src: messagesArt, art: [-2.64, -2.97, 51.955] },
  { label: 'Zoom', src: zoomArt, art: [-3.64, -3.67, 55.287] },
  { label: 'Grok', src: grokArt, art: [-1.6, -1.33, 51.231] },
  { label: 'Theater', src: theaterArt, art: [-8.37, -8.26, 64.685] },
  { label: 'Arcade', src: arcadeArt, art: [-2.12, -2.35, 52.201] },
  { label: 'Toybox', src: toyboxArt, art: [-4.98, -4.54, 57.958] },
  { label: 'Browser', src: browserArt, art: [-4.16, -4.25, 56.36] },
  { label: 'Manual', src: manualArt, art: [-5.18, -5.48, 58.264] },
  { label: 'Spotify', src: spotifyArt, art: [-2.87, -3.53, 53.778] },
  { label: 'Bluetooth', src: bluetoothArt, art: [-2.94, -2.85, 53.83] },
  { label: 'TIDAL', src: tidalArt, art: [-2.22, -5.32, 52.449] },
  { label: 'Audible', src: audibleArt, art: [-4.22, -4.2, 56.533] },
  { label: 'Amazon Music', src: amazon_musicArt, art: [-3.21, -3.6, 54.414] },
  { label: 'YouTube Music', src: youtube_musicArt, art: [-0.24, -0.67, 48.485] },
  { label: 'TuneIn', src: tuneinArt, art: [-5.73, -6.27, 59.457] },
  { label: 'Caraoke', src: caraokeArt, art: [-2.57, -2.68, 53.105] },
  { label: 'Self-Driving', src: self_drivingArt, art: [-4.21, -4.24, 56.475] },
];
const ROW = 6;

/** pictogram/app/* (Figma): fixed-colour artwork clipped to 48px. */
function Pictogram({ src, art: [left, top, size] }: { src: string; art: [number, number, number] }) {
  return (
    <span className={styles.pictogram}>
      <img src={src} alt="" style={{ left, top, width: size, height: size }} />
    </span>
  );
}

/**
 * Figma "Quick Actions" (4273:450, in 4300:2105): launcher over the map, pinned Dark. Customize button on top
 * (does nothing yet — press feedback only), then 6 climate toggles, a divider and 23 apps, the last row centred.
 * Opens with Move in from bottom, duration/base + easing/enter. Climate tiles toggle; app tiles press only.
 */
export function QuickActions() {
  const climate = useHud((s) => s.climate);
  const toggleClimate = useHud((s) => s.toggleClimate);
  const rows = Array.from({ length: Math.ceil(APPS.length / ROW) }, (_, i) => APPS.slice(i * ROW, i * ROW + ROW));
  return (
    <motion.div
      className={styles.root}
      data-mode="dark"
      role="dialog"
      aria-label="Quick actions"
      // `transform` (not `y`) so motion runs the slide on the compositor — full frame rate on iPad (perf, 9.5)
      initial={{ transform: 'translateY(876px)' }}
      animate={{ transform: 'translateY(0px)', transition: transition.open }}
      exit={{ transform: 'translateY(876px)', transition: transition.close }}
    >
      <motion.button
        type="button"
        className={`${styles.customize} text-body-l`}
        whileTap={{ scale: 0.96 }}
        transition={transition.press}
      >
        Customize
      </motion.button>
      <div className={styles.panel}>
        <div className={styles.row}>
          {CLIMATE.map((c) => (
            <AppTile
              key={c.id}
              label={c.label}
              active={climate[c.id]}
              onPress={() => toggleClimate(c.id)}
              icon={
                <Icon
                  src={c.src}
                  color={climate[c.id] ? 'var(--color-icon-active)' : 'var(--color-icon-strong)'}
                />
              }
            />
          ))}
        </div>
        <span className={styles.divider} />
        <div className={styles.apps}>
          {rows.map((row, i) => (
            <div key={i} className={styles.row}>
              {row.map((a) => (
                <AppTile key={a.label} label={a.label} icon={<Pictogram src={a.src} art={a.art} />} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
