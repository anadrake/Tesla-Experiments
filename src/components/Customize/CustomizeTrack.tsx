import { AnimatePresence, animate, motion, useMotionValue } from 'motion/react';
import { useEffect, useRef } from 'react';
import closeIcon from '../../assets/icons/close.svg';
import { capture } from '../../lib/pointer';
import { useStageScale } from '../../shell/Stage';
import { useHud } from '../../state/store';
import { presets, spring, transition } from '../../tokens/motion';
import { Icon } from '../Icon/Icon';
import { Pressable } from '../Pressable/Pressable';
import { PlaceholderWidget, TrackWidget, WIDGETS } from '../WidgetBar/registry';
import barStyles from '../WidgetBar/WidgetBar.module.css';
import { chrome, frameBg, trackView } from './motion';
import styles from './Customize.module.css';

/**
 * Sketch "edit frame" (4802:104705): the track shrunk to 486-wide cards (the 600×192 widget at 0.8107),
 * 20px apart, centred with the neighbours peeking. X above removes the centred widget (not on the last
 * one — the track is never empty, Q18); its name below; dots always on.
 * Swipe pages like the normal bar, but it's our own pager (design-px offsets) so 8.3 can open gaps for drops.
 */
export const CARD_SCALE = 486.43 / 600;
export const CARD_W = 600 * CARD_SCALE;
export const CARD_H = 192 * CARD_SCALE;
export const CARD_GAP = 20;
const VIEW_W = 594;
const PITCH = CARD_W + CARD_GAP;
const FIRST_X = (VIEW_W - CARD_W) / 2;
const SWIPE_PAGE = 60; // design px of drag that turns the page
const TAP_SLOP = 8;
const EDGE_RESIST = 0.35; // rubber band past the first / last card

export function CustomizeTrack() {
  const track = useHud((s) => s.widgetTrack);
  const page = useHud((s) => s.widgetPage);
  const setPage = useHud((s) => s.setWidgetPage);
  const setTrack = useHud((s) => s.setWidgetTrack);
  const scale = useStageScale();
  const x = useMotionValue(FIRST_X - page * PITCH);
  const drag = useRef<{ x: number; base: number; moved: boolean } | null>(null);

  useEffect(() => {
    if (!drag.current) animate(x, FIRST_X - page * PITCH, spring);
  }, [page, track.length, x]);

  const active = track[page] ?? track[0];
  const remove = () => {
    if (track.length < 2) return;
    setTrack(track.filter((id) => id !== active));
  };

  return (
    <div className={styles.editFrame}>
      {/* Card background grows out of the widget's outline (behind everything in the frame) */}
      <motion.div className={styles.frameBg} variants={frameBg} />
      <div className={styles.frameClip}>
        <motion.div className={styles.closeSlot} variants={chrome}>
          <AnimatePresence initial={false}>
            {track.length > 1 && (
              <motion.div key="x" {...presets.fadeIn} transition={transition.toggle}>
                <Pressable className={styles.close} aria-label={`Remove ${WIDGETS[active].label}`} onClick={remove}>
                  <Icon src={closeIcon} color="var(--color-icon-strong)" />
                </Pressable>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className={styles.view}
          variants={trackView}
          onPointerDown={(e) => {
            drag.current = { x: e.clientX, base: x.get(), moved: false };
            x.stop();
            capture(e);
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (!d) return;
            let dx = (e.clientX - d.x) / scale;
            if (Math.abs(dx) > TAP_SLOP) d.moved = true;
            const min = FIRST_X - (track.length - 1) * PITCH;
            const next = d.base + dx;
            if (next > FIRST_X) dx = FIRST_X - d.base + (next - FIRST_X) * EDGE_RESIST;
            else if (next < min) dx = min - d.base + (next - min) * EDGE_RESIST;
            x.set(d.base + dx);
          }}
          onPointerUp={(e) => {
            const d = drag.current;
            drag.current = null;
            if (!d) return;
            const dx = (e.clientX - d.x) / scale;
            const target = dx < -SWIPE_PAGE ? page + 1 : dx > SWIPE_PAGE ? page - 1 : page;
            const clamped = Math.max(0, Math.min(track.length - 1, target));
            if (clamped !== page) setPage(clamped);
            else animate(x, FIRST_X - page * PITCH, spring);
          }}
          onPointerCancel={() => {
            drag.current = null;
            animate(x, FIRST_X - page * PITCH, spring);
          }}
        >
          <motion.div className={styles.strip} style={{ x }}>
            <AnimatePresence initial={false}>
              {track.map((id) => (
                <motion.div
                  key={id}
                  className={styles.slot}
                  data-track-widget={id}
                  data-active={id === active || undefined}
                  initial={{ opacity: 0, scale: 0.9, width: 0, marginRight: 0 }}
                  animate={{ opacity: 1, scale: 1, width: CARD_W, marginRight: CARD_GAP }}
                  exit={{ opacity: 0, scale: 0.9, width: 0, marginRight: 0 }}
                  transition={transition.screen}
                >
                  <div className={styles.card} aria-label={WIDGETS[id].ariaLabel}>
                    {/* Widgets are previews here — not tappable or focusable (React 18 types lack `inert`) */}
                    {WIDGETS[id].Widget ? (
                      <div className={styles.cardContent} ref={(el) => el && (el.inert = true)}>
                        {/* .page = the widget's normal page box (600×192, paragraph resets) */}
                        <div className={barStyles.page}>
                          <TrackWidget id={id} />
                        </div>
                      </div>
                    ) : (
                      // Sketch puts the "Coming Soon" placeholder at full size on the shrunken card (4802:107503)
                      <PlaceholderWidget id={id} />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        <motion.div variants={chrome}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={active}
              className={`text-body-m ${styles.trackLabel}`}
              {...presets.fadeIn}
              transition={transition.toggle}
            >
              {WIDGETS[active].label}
            </motion.p>
          </AnimatePresence>

          <div className={styles.dots} aria-hidden>
            {track.map((id, i) => (
              <span key={id} className={styles.dot} data-selected={i === page || undefined} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
