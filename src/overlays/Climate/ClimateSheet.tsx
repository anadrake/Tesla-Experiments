import { motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import cabinDark from '../../assets/climate26/cabin-dark.jpg';
import cabinLight from '../../assets/climate26/cabin-light.jpg';
import camp from '../../assets/climate26/camp.svg';
import chevronLeft from '../../assets/climate26/chevron-left.svg';
import chevronRight from '../../assets/climate26/chevron-right.svg';
import clock from '../../assets/settings/photo/clock.svg';
import fan from '../../assets/climate26/fan.svg';
import fanSmall from '../../assets/climate26/fan-small.svg';
import frontDefrost from '../../assets/climate26/front-defrost.svg';
import pet from '../../assets/climate26/pet.svg';
import power from '../../assets/climate26/power.svg';
import rearDefrost from '../../assets/climate26/rear-defrost.svg';
import recirculate from '../../assets/climate26/recirculate.svg';
import seatHeat from '../../assets/climate26/seat-heat.svg';
import wheelHeat from '../../assets/climate26/wheel-heat.svg';
import wiperHeat from '../../assets/climate26/wiper-heat.svg';
import { Icon } from '../../components/Icon/Icon';
import { Pressable } from '../../components/Pressable/Pressable';
import { capture } from '../../lib/pointer';
import { useStageScale } from '../../shell/Stage';
import { FAN_MAX, useHud, type ParkedClimate, type SeatHeat } from '../../state/store';
import { transition } from '../../tokens/motion';
import { SHEET_H, SHEET_SLOP, dragSheet, grabSheet, releaseSheet, sheetY, slideSheetIn } from './sheet';
import styles from './ClimateSheet.module.css';

const PARKED: { id: ParkedClimate; label: string; icon?: string }[] = [
  { id: 'off', label: 'Off' },
  { id: 'keep', label: 'Keep', icon: fanSmall },
  { id: 'pet', label: 'Pet', icon: pet },
  { id: 'camp', label: 'Camp', icon: camp },
];

/** Photo / Climate Symbol (4975:25932): 88×72 hit area, 38 glyph; Active = photo accent. */
function ClimateSymbol({ icon, label, active, onPress }: { icon: string; label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable className={styles.symbol} aria-label={label} aria-pressed={active} onClick={onPress}>
      <Icon src={icon} size={38} color={active ? 'var(--photo-accent)' : 'var(--photo-icon)'} />
    </Pressable>
  );
}

/** Seat heat: Off → Low → Medium → High (Climate 2026 / Seat Heat 4935:2085: red heat, one dot per level). */
function SeatHeatButton({ seat, level }: { seat: 'driver' | 'passenger'; level: SeatHeat }) {
  const cycle = useHud((s) => s.cycleSeatHeat);
  const names = ['off', 'low', 'medium', 'high'];
  return (
    <Pressable className={styles.symbol} aria-label={`${seat} seat heat ${names[level]}`} onClick={() => cycle(seat)}>
      <Icon src={seatHeat} size={38} color={level ? 'var(--photo-status-alert)' : 'var(--photo-icon)'} />
      {level > 0 && (
        <span className={styles.heatDots} aria-hidden>
          {Array.from({ length: level }, (_, i) => (
            <span key={i} />
          ))}
        </span>
      )}
    </Pressable>
  );
}

/**
 * Figma Climate 2026 / Panel, View=Front (4936:1865 Light / 4936:2108 Dark): Off / Keep / Pet / Camp over the map,
 * then the 720-tall sheet — power · Auto, Front / Rear (Rear = placeholder), Schedule, the cabin render, and the comfort
 * and air controls. Simple toggles work (Q42); Schedule and Rear go nowhere yet.
 * Opens by a swipe up on the control bar (ControlBar → sheet.ts), closes by dragging its top rows down, a tap on the
 * map above it, or another overlay opening.
 */
export function ClimateSheet() {
  const sheet = useHud((s) => s.climateSheet);
  const set = useHud((s) => s.setClimateSheet);
  const climate = useHud((s) => s.climate);
  const toggleClimate = useHud((s) => s.toggleClimate);
  const scale = useStageScale();
  const drag = useRef<{ id: number; y: number; t: number; v: number; locked: boolean; base: number } | null>(null);

  useEffect(() => {
    slideSheetIn();
  }, []);

  // Drag the top rows down to close (a press that doesn't travel still reaches the buttons).
  const handle = {
    onPointerDown: (e: React.PointerEvent) => {
      if (!e.isPrimary) return;
      drag.current = { id: e.pointerId, y: e.clientY, t: e.timeStamp, v: 0, locked: false, base: sheetY.get() };
    },
    onPointerMove: (e: React.PointerEvent) => {
      const d = drag.current;
      if (!d || e.pointerId !== d.id) return;
      const dy = (e.clientY - d.y) / scale;
      if (!d.locked) {
        if (dy < SHEET_SLOP) return;
        d.locked = true;
        grabSheet();
        capture(e);
      }
      d.v = dy / Math.max(1, e.timeStamp - d.t);
      dragSheet(d.base + dy - SHEET_SLOP);
    },
    onPointerUp: (e: React.PointerEvent) => {
      const d = drag.current;
      drag.current = null;
      if (!d?.locked || e.pointerId !== d.id) return;
      const dy = (e.clientY - d.y) / scale;
      releaseSheet(false, dy, d.v);
    },
  };

  return (
    <motion.div
      className={styles.root}
      role="dialog"
      aria-label="Climate"
      style={{ y: sheetY }}
      exit={{ y: SHEET_H, transition: transition.sheetClose }}
    >
      {/* Parked climate modes: over the map, above the sheet */}
      <div className={styles.modes} {...handle} onPointerCancel={handle.onPointerUp}>
        <div className={styles.parked} role="radiogroup" aria-label="Parked climate">
          {PARKED.map((m) => (
            <Pressable
              key={m.id}
              className={`text-title-l ${styles.parkedSegment}`}
              role="radio"
              aria-checked={sheet.parked === m.id}
              data-selected={sheet.parked === m.id || undefined}
              onClick={() => set({ parked: m.id })}
            >
              {m.icon && <Icon src={m.icon} size={24} color={sheet.parked === m.id ? 'var(--photo-accent)' : 'var(--photo-icon)'} />}
              {m.label}
            </Pressable>
          ))}
        </div>
      </div>

      <div className={styles.sheet}>
        <img className={styles.cabinLight} src={cabinLight} alt="" />
        <img className={styles.cabinDark} src={cabinDark} alt="" />

        <div className={styles.nav} {...handle} onPointerCancel={handle.onPointerUp}>
          <div className={styles.powerAuto}>
            <ClimateSymbol icon={power} label="Climate power" active={sheet.power} onPress={() => set({ power: !sheet.power })} />
            <Pressable
              className={`text-photo-button ${styles.textButton}`}
              data-accent={sheet.auto || undefined}
              aria-pressed={sheet.auto}
              onClick={() => set({ auto: !sheet.auto })}
              style={{ width: 150 }}
            >
              Auto
            </Pressable>
          </div>
          <div className={styles.tabs} role="tablist">
            <span className="text-photo-button" role="tab" aria-selected data-selected>
              Front
            </span>
            <span className="text-photo-button" role="tab" aria-selected={false}>
              Rear
            </span>
          </div>
          <span className={`text-photo-button ${styles.textButton} ${styles.schedule}`}>
            Schedule
            <Icon src={clock} size={32} color="var(--photo-icon)" />
          </span>
        </div>

        <div className={styles.controls}>
          <div className={styles.comfort}>
            <SeatHeatButton seat="driver" level={sheet.seatHeat.driver} />
            <ClimateSymbol icon={wiperHeat} label="Wiper defrost" active={sheet.wiperHeat} onPress={() => set({ wiperHeat: !sheet.wiperHeat })} />
            <ClimateSymbol icon={wheelHeat} label="Steering wheel heat" active={climate.heatedSteering} onPress={() => toggleClimate('heatedSteering')} />
          </div>
          <div className={styles.air}>
            <ClimateSymbol icon={frontDefrost} label="Front defrost" active={climate.frontDefrost} onPress={() => toggleClimate('frontDefrost')} />
            <ClimateSymbol icon={rearDefrost} label="Rear defrost" active={climate.rearDefrost} onPress={() => toggleClimate('rearDefrost')} />
            {/* Climate 2026 / Fan Speed (4942:28036): LO–10 */}
            <div className={styles.fan}>
              <Pressable className={styles.fanStep} aria-label="Fan slower" onClick={() => set({ fan: Math.max(0, sheet.fan - 1) })}>
                <Icon src={chevronLeft} size={48} color="var(--photo-icon)" />
              </Pressable>
              <span className={`text-photo-button ${styles.fanValue}`}>
                <Icon src={fan} size={27} color="var(--photo-icon)" />
                <span aria-label={`Fan speed ${sheet.fan === 0 ? 'low' : sheet.fan}`}>{sheet.fan === 0 ? 'LO' : sheet.fan}</span>
              </span>
              <Pressable className={styles.fanStep} aria-label="Fan faster" onClick={() => set({ fan: Math.min(FAN_MAX, sheet.fan + 1) })}>
                <Icon src={chevronRight} size={48} color="var(--photo-icon)" />
              </Pressable>
            </div>
            <span className={styles.recirculate}>
              <ClimateSymbol icon={recirculate} label="Recirculate" active={sheet.recirculate} onPress={() => set({ recirculate: !sheet.recirculate })} />
            </span>
          </div>
          <span className={styles.passengerSeat}>
            <SeatHeatButton seat="passenger" level={sheet.seatHeat.passenger} />
          </span>
          {[144, 256, 760, 1096, 1138].map((x) => (
            <span key={x} className={styles.separator} style={{ left: x }} aria-hidden />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
