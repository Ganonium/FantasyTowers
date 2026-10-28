/**
 * Datentypen für alle Spielinhalte. Neue Türme, Gegner, Karten und Level
 * werden ausschließlich über Einträge in den Dateien unter src/data/
 * hinzugefügt (plus Grafik in src/art/).
 */

export type DamageType = 'physical' | 'magic';
export type ProjectileKind = 'arrow' | 'stone' | 'fireball' | 'frostbolt';

export interface TowerLevel {
  /** Baukosten (Stufe 1) bzw. Ausbaukosten (ab Stufe 2) in Gold */
  cost: number;
  damage: number;
  /** Reichweite in Pixeln (1 Feld = 16 px) */
  range: number;
  /** Sekunden zwischen zwei Schüssen */
  cooldown: number;
  /** Flächenschaden-Radius in Pixeln */
  splash?: number;
  /** Verlangsamung: Geschwindigkeit wird mit `factor` multipliziert */
  slow?: { factor: number; duration: number };
  /** Brennen: Schaden pro Sekunde über `duration` Sekunden (magisch) */
  burn?: { dps: number; duration: number };
}

export interface TowerDef {
  id: string;
  /** Schlüssel in den Texten (i18n): name, desc */
  name: string;
  desc: string;
  damageType: DamageType;
  projectile: ProjectileKind;
  /** Geschossgeschwindigkeit in Pixeln pro Sekunde */
  projectileSpeed: number;
  levels: TowerLevel[];
}

export interface EnemyDef {
  id: string;
  name: string;
  hp: number;
  /** Pixel pro Sekunde */
  speed: number;
  /** Anteil physischen Schadens, der abgewehrt wird (0..1) */
  armor: number;
  /** Anteil magischen Schadens, der abgewehrt wird (0..1) */
  magicResist: number;
  /** Gold beim Besiegen */
  bounty: number;
  /** Leben, die der Spieler verliert, wenn der Gegner durchkommt */
  lives: number;
  /** Höhe des Lebensbalkens über dem Boden in Pixeln */
  barOffset: number;
}

/** Punkt in Feldkoordinaten (Feldmitte). Werte außerhalb der Karte sind erlaubt. */
export type TilePoint = [number, number];

export interface MapDef {
  id: string;
  name: string;
  /**
   * Gelände, eine Zeile pro Feldreihe:
   *  .  Gras        ,  Blumen     #  Weg        B  Bauplatz
   *  T  Baum        b  Busch      R  Felsen     W  Wasser
   */
  tiles: string[];
  /** Ein oder mehrere Wege, auf denen Gegner laufen (Wegpunkte in Feldern). */
  paths: TilePoint[][];
  /** Wo das Tor (Ziel) gezeichnet wird – Feldkoordinate */
  gate: TilePoint;
}

export interface WaveGroup {
  enemy: string;
  count: number;
  /** Sekunden zwischen zwei Gegnern dieser Gruppe */
  interval: number;
  /** Verzögerung in Sekunden ab Wellenbeginn */
  delay?: number;
  /** Index des Weges (Standard 0) */
  path?: number;
  /** Lebenspunkte-Multiplikator für diese Gruppe */
  hpScale?: number;
}

export interface WaveDef {
  groups: WaveGroup[];
}

export interface LevelDef {
  id: string;
  name: string;
  map: string;
  startGold: number;
  lives: number;
  /** Gold für jede überstandene Welle (zzgl. 2 pro Wellennummer) */
  waveBonus?: number;
  /** Erlaubte Türme (IDs); leer/fehlend = alle */
  towers?: string[];
  waves: WaveDef[];
}
