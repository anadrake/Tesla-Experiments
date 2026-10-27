import { useHud, type SettingValue } from '../../state/store';

/** Widen literal defaults (false → boolean, 'II' → string) so setters accept any value of that kind. */
type Widen<T> = T extends boolean ? boolean : T extends number ? number : string;

/** Read/write one settings value by key, with the page's default. `const [v, set] = useSetting('controls.wipers', 'II')` */
export function useSetting<T extends SettingValue>(key: string, fallback: T): [Widen<T>, (v: Widen<T>) => void] {
  const value = useHud((s) => s.settings[key]) as Widen<T> | undefined;
  const setSetting = useHud((s) => s.setSetting);
  return [value ?? (fallback as unknown as Widen<T>), (v) => setSetting(key, v)];
}
