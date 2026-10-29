import album from '../../assets/media/album-vampire.png';
import spotify from '../../assets/media/spotify.svg';
import spotifyChip from '../../assets/media/spotify-chip.svg';
import arrowUp from '../../assets/icons/arrow-up.svg';
import spotifySource from '../../assets/media/spotify-source.svg';
import favoriteIcon from '../../assets/media/favorite.svg';
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

/**
 * Figma ".Widget" Widget=Music, Size=Full. Album art tap → collapses the bar (like a swipe down); play/pause toggles.
 * Favorite toggles (Q12): Figma has no active state, so "on" = muted → strong icon color.
 */
export function MusicWidget() {
  const playing = useHud((s) => s.playing);
  const togglePlaying = useHud((s) => s.togglePlaying);
  const setCollapsed = useHud((s) => s.setWidgetsCollapsed);
  const favorite = useHud((s) => s.favorite);
  const toggleFavorite = useHud((s) => s.toggleFavorite);

  return (
    <div className={styles.music}>
      <div className={styles.track}>
        <Pressable className={styles.art} onClick={() => setCollapsed(true)} aria-label="Collapse music" whileTap={{ scale: 0.97 }}>
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
        <Pressable className={styles.mediaButton} aria-label="Favorite" aria-pressed={favorite} onClick={toggleFavorite}>
          <Icon src={favoriteIcon} size={40} color={favorite ? 'var(--color-icon-strong)' : 'var(--color-icon-muted)'} />
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

/** Collapsed bar pill: Spotify · title · expand arrow (Figma Widget=Music, Size=Collpased). */
export function MusicPill() {
  return (
    <div className={`${styles.musicPill} text-title-l`}>
      <span className={styles.pillIcon}>
        <Icon src={spotify} size={28.8} color="var(--color-icon-strong)" />
      </span>
      <span className={styles.pillTitle}>{TRACK.title}</span>
      <Icon src={arrowUp} color="var(--color-icon-strong)" />
    </div>
  );
}

/** Chicklet (Driving 220 rail) 4596:70708: album art + Spotify badge + progress strip. */
export function MusicChicklet() {
  return (
    <>
      <img className={styles.chickletArt} src={album} alt={`${TRACK.title} album art`} />
      <img className={styles.chickletBadge} src={spotifyChip} alt="" width={25.8} height={25.8} />
      <span className={styles.chickletProgress}>
        <span style={{ width: `${TRACK.progress * 100}%` }} />
      </span>
    </>
  );
}

/** Mini Chicklet (Parked 116 rail) 4666:74587: album art + Spotify badge. */
export function MusicMini() {
  return (
    <>
      <img className={styles.chickletArt} src={album} alt={`${TRACK.title} album art`} />
      <img className={styles.chickletBadge} src={spotifyChip} alt="" width={25.8} height={25.8} />
    </>
  );
}
