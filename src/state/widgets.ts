/**
 * Widget track ids (data only — components live in components/WidgetBar/registry.tsx).
 * Kept separate so the store can use them without importing widget components.
 */
export const WIDGET_IDS = ['quickActions', 'music', 'odometer', 'tire', 'calendar', 'phone', 'energy'] as const;
export type WidgetId = (typeof WIDGET_IDS)[number];

export const DEFAULT_TRACK: WidgetId[] = ['music', 'odometer', 'tire'];

export const isWidgetId = (v: string): v is WidgetId => (WIDGET_IDS as readonly string[]).includes(v);

/** Parses "music,energy" → a valid, de-duplicated, non-empty track (else null). */
export function parseTrack(raw: string | null | undefined): WidgetId[] | null {
  if (!raw) return null;
  const ids = [...new Set(raw.split(',').map((s) => s.trim()).filter(isWidgetId))];
  return ids.length ? ids : null;
}
