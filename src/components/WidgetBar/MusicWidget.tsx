import album from '../../assets/media/album-vampire.png';
import spotifySource from '../../assets/media/spotify-source.svg';
import favorite from '../../assets/media/favorite.svg';
import previous from '../../assets/media/previous.svg';
import pause from '../../assets/media/pause.svg';
import play from '../../assets/media/play.svg';
import next from '../../assets/media/next.svg';
import equalizer from '../../assets/media/equalizer.svg';
import search from '../../assets/media/search.svg';
import { useHud } from '../../state/store';
import { Icon } from '../Icon/Icon';
import { Pressable } from '../Pressable/Pressable';
import styles from './WidgetBar.module.css';

export const TRACK = { title: 'Vampire', artist: 'Olivia Rodrigo', progress: 0.32 };

/** Figma ".Widget" Widget=Music, Size=Full. Album art tap → collapse to pill; play/pause toggles. */
export function MusicWidget() {
  const playing = useHud((s) => s.playing);
  const togglePlaying = useHud((s) => s.togglePlaying);
  const toggleCollapsed = useHud((s) => s.toggleMusicCollapsed);

  return (
    <div className={styles.music}>
      <div className={styles.track}>
        <Pressable className={styles.art} onClick={toggleCollapsed} aria-label="Collapse music" whileTap={{ scale: 0.97 }}>
          <img src={album} alt={`${TRACK.title} album art`} />
        </Pressable>
        <div className={styles.meta}>
          <p className={`text-title-l ${styles.title}`}>{TRACK.title}</p>
          <p className={`text-body-m ${styles.source}`}>
            <span className={styles.sourceIcon}>
              <Icon src={spotifySource} size={16.8} color="var(--color-icon-strong)" />
            </span>
            {TRACK.artist}
          </p>
        </div>
        <Pressable className={styles.mediaButton} aria-label="Favorite">
          <Icon src={favorite} size={40} color="var(--color-icon-muted)" />
        </Pressable>
      </div>

      <div className={styles.progress}>
        <span className={styles.rail} />
        <span className={styles.played} style={{ right: `${(1 - TRACK.progress) * 100}%` }}>
          <span className={styles.knob} />
        </span>
      </div>

      <div className={styles.controls}>
        <Pressable className={styles.mediaButton} aria-label="Previous">
          <Icon src={previous} size={40} color="var(--color-icon-strong)" />
        </Pressable>
        <Pressable className={styles.mediaButton} aria-label={playing ? 'Pause' : 'Play'} onClick={togglePlaying}>
          <Icon src={playing ? pause : play} size={40} color="var(--color-icon-strong)" />
        </Pressable>
        <Pressable className={styles.mediaButton} aria-label="Next">
          <Icon src={next} size={40} color="var(--color-icon-strong)" />
        </Pressable>
        <Pressable className={styles.mediaButton} aria-label="Equalizer">
          <Icon src={equalizer} size={40} color="var(--color-icon-muted)" />
        </Pressable>
        <Pressable className={styles.mediaButton} aria-label="Search music">
          <Icon src={search} size={40} color="var(--color-icon-muted)" />
        </Pressable>
      </div>
    </div>
  );
}
