/** Spielstand im localStorage – robust gegen gesperrten Speicher (Privatmodus). */
const KEY = 'fantasytowers.save.v1';

export interface SaveData {
  /** Sterne pro Level-ID (0 = nicht geschafft) */
  stars: Record<string, number>;
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const data = JSON.parse(raw) as Partial<SaveData>;
      return { stars: data.stars ?? {} };
    }
  } catch {
    /* ignorieren */
  }
  return { stars: {} };
}

export function writeSave(data: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* ignorieren */
  }
}
