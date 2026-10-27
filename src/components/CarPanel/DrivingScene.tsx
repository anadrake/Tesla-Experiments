import { motion } from 'motion/react';
import roadLines from '../../assets/drive/road-lines.svg';
import outline from '../../assets/drive/driving-outline.svg';
import leadCar from '../../assets/drive/lead-car.png';
import egoCar from '../../assets/drive/ego-car.svg';
import type { CarView } from '../../state/store';
import { transition } from '../../tokens/motion';
import { drivingScene } from './geometry';
import styles from './DrivingScene.module.css';

/** % of the 633×746.5 Car Render frame, so the scene scales with its rect. */
const at = (left: number, top: number, w: number, h: number) => ({
  left: `${(left / 633) * 100}%`,
  top: `${(top / 746.5) * 100}%`,
  width: `${(w / 633) * 100}%`,
  height: `${(h / 746.5) * 100}%`,
});

/** Figma Car Render Scene=Driving, Mode=Standard (4479:49839): road lines, beam, lead car, ego car (rear view). */
export function DrivingScene({ view, visible }: { view: CarView; visible: boolean }) {
  const rect = drivingScene[view];
  return (
    <motion.div
      className={styles.scene}
      initial={false}
      animate={{ ...rect, opacity: visible ? rect.opacity : 0 }}
      transition={transition.screen}
    >
      <img src={roadLines} alt="" style={at(150, -0.41, 308.974, 672.91)} />
      <img src={outline} alt="" style={at(287.5, 70.5, 62.5, 366)} />
      <img src={leadCar} alt="" className={styles.lead} style={at(274, 14, 84.635, 68)} />
      <img src={egoCar} alt="" style={at(179, 300, 275, 218)} />
    </motion.div>
  );
}
