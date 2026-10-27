import { useMemo } from 'react';

/**
 * Inline SVG whose baked Figma colors are swapped for token vars, for multi-tone icons a mask can't do
 * (e.g. nav maneuvers: arrow = icon/strong, road = icon/muted). Import the file with `?raw`.
 */
export function ThemedSvg({ svg, colors, className }: { svg: string; colors: Record<string, string>; className?: string }) {
  const html = useMemo(
    () => Object.entries(colors).reduce((out, [hex, token]) => out.replaceAll(`"${hex}"`, `"${token}"`), svg),
    [svg, colors],
  );
  return <span aria-hidden className={className} style={{ display: 'block' }} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Figma nav maneuver icons: glyph #F0F0F0 → icon/strong, road #757575 → icon/muted. */
export const NAV_ICON_COLORS = { '#F0F0F0': 'var(--color-icon-strong)', '#757575': 'var(--color-icon-muted)' };
