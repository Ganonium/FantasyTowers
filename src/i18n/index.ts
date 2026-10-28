import { de } from './de';

const dict = de;

/** Text zu einem Schlüssel; {platzhalter} werden durch Werte aus `vars` ersetzt. */
export function t(key: string, vars: Record<string, string | number> = {}): string {
  const raw = dict[key] ?? key;
  return raw.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}
