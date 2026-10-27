import { useEffect, useRef, type ReactNode } from 'react';
import tilesDark from '../../assets/map/tiles-dark.jpg';
import tilesLight from '../../assets/map/tiles-light.jpg';
import { useStageScale } from '../../shell/Stage';
import styles from './Map.module.css';
import { capture } from '../../lib/pointer';

const TILE = 1960; // Figma "map canvas" size
const MAX_ZOOM = 3;

interface Props {
  /** Map viewport size in design px (target size; the tiles are CSS-centred so they follow width animations). */
  width: number;
  height: number;
  /** Rendered in tile coordinates (route, pins) so they pan/zoom with the map. */
  children?: ReactNode;
  /** Tap (no drag) on the map. */
  onTap?: () => void;
}

/** Figma "map canvas": centred on the map, offset (-1, -105). */
const OFFSET_X = -1;
const OFFSET_Y = -105;

/**
 * Static Figma map tiles with one-finger pan and two-finger pinch zoom (Q2).
 * Both themes are stacked and cross-fade by opacity during the Day/Night dissolve.
 * Transforms are written straight to the DOM (no React re-render per pointer move).
 */
export function MapTiles({ width, height, children, onTap }: Props) {
  const baseLeft = width / 2 + OFFSET_X - TILE / 2;
  const baseTop = height / 2 + OFFSET_Y - TILE / 2;
  const scale = useStageScale();
  const layer = useRef<HTMLDivElement>(null);
  const view = useRef({ x: 0, y: 0, k: 1 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; k: number } | null>(null);
  const downAt = useRef<{ x: number; y: number } | null>(null);

  const clamp = (x: number, y: number, k: number) => {
    const half = TILE / 2;
    const minX = width - baseLeft - half * (1 + k);
    const maxX = -baseLeft - half * (1 - k);
    const minY = height - baseTop - half * (1 + k);
    const maxY = -baseTop - half * (1 - k);
    return { x: Math.min(maxX, Math.max(minX, x)), y: Math.min(maxY, Math.max(minY, y)), k };
  };

  const apply = (next: { x: number; y: number; k: number }) => {
    view.current = clamp(next.x, next.y, next.k);
    const { x, y, k } = view.current;
    if (layer.current) layer.current.style.transform = `translate(${x}px, ${y}px) scale(${k})`;
  };

  // Re-clamp when the map resizes (panel collapse/expand) so no edge is ever exposed.
  useEffect(() => apply(view.current), [width, height]);

  const twoFinger = () => {
    const [a, b] = [...pointers.current.values()];
    return { dist: Math.hypot(a.x - b.x, a.y - b.y), mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } };
  };

  /** Client px → map px, relative to the tile's untransformed center. */
  const toTileSpace = (el: Element, p: { x: number; y: number }) => {
    const r = el.getBoundingClientRect();
    return { x: (p.x - r.left) / scale - (baseLeft + TILE / 2), y: (p.y - r.top) / scale - (baseTop + TILE / 2) };
  };

  const onDown = (e: React.PointerEvent) => {
    capture(e);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    downAt.current = pointers.current.size === 1 ? { x: e.clientX, y: e.clientY } : null;
    if (pointers.current.size === 2) pinch.current = { dist: twoFinger().dist, k: view.current.k };
  };

  const onMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const v = view.current;

    if (pointers.current.size === 1) {
      apply({ x: v.x + (e.clientX - prev.x) / scale, y: v.y + (e.clientY - prev.y) / scale, k: v.k });
    } else if (pointers.current.size === 2 && pinch.current) {
      // Zoom about the finger midpoint: keep the map point under it fixed, then add the midpoint's own drift.
      const { dist, mid } = twoFinger();
      const k = Math.min(MAX_ZOOM, Math.max(1, (pinch.current.k * dist) / pinch.current.dist));
      const m = toTileSpace(e.currentTarget, mid);
      const r = k / v.k;
      const drift = { x: (e.clientX - prev.x) / scale / 2, y: (e.clientY - prev.y) / scale / 2 };
      apply({ x: m.x - (m.x - v.x) * r + drift.x, y: m.y - (m.y - v.y) * r + drift.y, k });
    }
  };

  const onUp = (e: React.PointerEvent) => {
    const d = downAt.current;
    if (d && pointers.current.size === 1 && Math.hypot(e.clientX - d.x, e.clientY - d.y) / scale < 10) onTap?.();
    downAt.current = null;
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  };

  return (
    <div
      className={styles.tilesViewport}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      data-testid="map-tiles"
    >
      <div
        ref={layer}
        className={styles.tiles}
        style={{
          left: `calc(50% + ${OFFSET_X - TILE / 2}px)`,
          top: `calc(50% + ${OFFSET_Y - TILE / 2}px)`,
          width: TILE,
          height: TILE,
        }}
      >
        <img className={styles.tileLight} src={tilesLight} alt="" draggable={false} />
        <img className={styles.tileDark} src={tilesDark} alt="" draggable={false} />
        {children}
      </div>
    </div>
  );
}
