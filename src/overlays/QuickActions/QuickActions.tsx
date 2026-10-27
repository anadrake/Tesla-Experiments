import { motion } from 'motion/react';
import defrostFront from '../../assets/climate/defrost-front.svg';
import defrostRear from '../../assets/climate/defrost-rear.svg';
import seatHeat from '../../assets/climate/seat-heat.svg';
import steeringHeat from '../../assets/climate/steering-heat.svg';
import wipers from '../../assets/climate/wipers.svg';
import dashcam from '../../assets/apps/dashcam.svg';
import tunein from '../../assets/apps/tunein.svg';
import calendar from '../../assets/apps/calendar.svg';
import messages from '../../assets/apps/messages.svg';
import theater from '../../assets/apps/theater.svg';
import toybox from '../../assets/apps/toybox.svg';
import spotify from '../../assets/apps/spotify.svg';
import caraoke from '../../assets/apps/caraoke.svg';
import music from '../../assets/apps/music.svg';
import zoom from '../../assets/apps/zoom.svg';
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
  { id: 'wipers', label: 'Wipers', src: wipers },
];

const APPS = [
  { label: 'Dashcam', src: dashcam },
  { label: 'TuneIn', src: tunein },
  { label: 'Calendar', src: calendar },
  { label: 'Messages', src: messages },
  { label: 'Theater', src: theater },
  { label: 'Toybox', src: toybox },
  { label: 'Spotify', src: spotify },
  { label: 'Caraoke', src: caraoke },
  { label: 'Music', src: music },
  { label: 'Zoom', src: zoom },
];

/**
 * Figma "Quick Actions" (4273:450): launcher above the dock, pinned Dark.
 * Opens with Move in from bottom, duration/base + easing/enter. Climate tiles toggle; app tiles press only.
 */
export function QuickActions() {
  const climate = useHud((s) => s.climate);
  const toggleClimate = useHud((s) => s.toggleClimate);
  return (
    <motion.div
      className={styles.panel}
      data-mode="dark"
      role="dialog"
      aria-label="Quick actions"
      initial={{ y: 476 }}
      animate={{ y: 0, transition: transition.open }}
      exit={{ y: 476, transition: transition.close }}
    >
      <div className={styles.grid}>
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
      <div className={styles.grid}>
        {APPS.map((a) => (
          <AppTile key={a.label} label={a.label} icon={<img src={a.src} alt="" width={48} height={48} />} />
        ))}
      </div>
    </motion.div>
  );
}
