import type { ReactNode } from 'react';
import { Icon } from '../Icon/Icon';
import { ThemedSvg } from '../ThemedSvg/ThemedSvg';
import { useSetting } from './useSetting';
import styles from './controls.module.css';

/** Tile content: optional glyph (mask URL, or raw SVG for multi-tone like Recording) + Title/M label. */
export interface TileSpec {
  label: string;
  icon?: string;
  /** Raw SVG + color map for multi-tone glyphs. */
  iconRaw?: { svg: string; colors: Record<string, string> };
}

type TileState = 'default' | 'on' | 'active';

function TileFace({ tile, state, layout }: { tile: TileSpec; state: TileState; layout: 'vertical' | 'horizontal' }) {
  const color =
    state === 'active' ? 'var(--color-icon-on-accent)' : state === 'on' ? 'var(--color-content-primary)' : 'var(--color-content-secondary)';
  return (
    <>
      {tile.icon && <Icon src={tile.icon} color={color} />}
      {tile.iconRaw && <ThemedSvg svg={tile.iconRaw.svg} colors={tile.iconRaw.colors} className={styles.tileIcon} />}
      <span className={`text-title-m ${styles.tileLabel}`} data-layout={layout}>
        {tile.label}
      </span>
    </>
  );
}

interface GroupProps {
  tiles: TileSpec[];
  layout?: 'vertical' | 'horizontal';
  /** Row height (Figma: 110 text tiles, 160 icon tiles, 112 horizontal rows). */
  minHeight?: number;
  children?: never;
}

/**
 * Tile Group (4231:385) — single choice: exactly one tile is On (selected gray).
 * e.g. headlights Off / Parking / On / Auto, wipers Off / I–IIII / Auto.
 */
export function TileChoice({ setting, initial, ...g }: GroupProps & { setting: string; initial: string }) {
  const [value, set] = useSetting(setting, initial);
  return (
    <div className={styles.tileGroup} role="radiogroup" style={{ minHeight: g.minHeight }}>
      {g.tiles.map((t) => (
        <button
          key={t.label}
          type="button"
          role="radio"
          aria-checked={t.label === value}
          className={styles.tile}
          data-layout={g.layout ?? 'vertical'}
          data-state={t.label === value ? 'on' : 'default'}
          onClick={() => set(t.label)}
        >
          <TileFace tile={t} state={t.label === value ? 'on' : 'default'} layout={g.layout ?? 'vertical'} />
        </button>
      ))}
    </div>
  );
}

/** Tile Group of independent toggles (Fold Mirrors, Child Lock, …): each tile flips On. */
export function TileToggles({ settingPrefix, initial = {}, ...g }: GroupProps & { settingPrefix: string; initial?: Record<string, boolean> }) {
  return (
    <div className={styles.tileGroup} style={{ minHeight: g.minHeight }}>
      {g.tiles.map((t) => (
        <ToggleTile key={t.label} tile={t} setting={`${settingPrefix}.${t.label}`} initial={initial[t.label] ?? false} layout={g.layout ?? 'vertical'} onState="on" />
      ))}
    </div>
  );
}

/** Stand-alone Tile (4231:164). `onState="active"` = blue (feature running), e.g. Auto High Beam. */
export function ToggleTile({
  tile,
  setting,
  initial = false,
  layout = 'vertical',
  onState = 'active',
  standalone,
}: {
  tile: TileSpec;
  setting: string;
  initial?: boolean;
  layout?: 'vertical' | 'horizontal';
  onState?: 'on' | 'active';
  standalone?: boolean;
}): ReactNode {
  const [on, set] = useSetting(setting, initial);
  const state: TileState = on ? onState : 'default';
  return (
    <button
      type="button"
      aria-pressed={on}
      className={`${styles.tile} ${standalone ? styles.tileStandalone : ''}`}
      data-layout={layout}
      data-state={state}
      onClick={() => set(!on)}
    >
      <TileFace tile={tile} state={state} layout={layout} />
    </button>
  );
}
