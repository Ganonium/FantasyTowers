import type { EnemyDef, TowerDef, TowerLevel } from '../data/types';
import type { Path } from './Path';

export interface Enemy {
  def: EnemyDef;
  path: Path;
  dist: number;
  /** Seitlicher Versatz zum Weg, damit Gruppen natürlicher aussehen */
  offset: number;
  x: number;
  y: number;
  facingLeft: boolean;
  hp: number;
  maxHp: number;
  slowFactor: number;
  slowTime: number;
  burnDps: number;
  burnTime: number;
  flashTime: number;
  animTime: number;
  alive: boolean;
}

export interface Tower {
  def: TowerDef;
  level: number;
  /** Bauplatz-Index */
  spot: number;
  x: number;
  y: number;
  cooldown: number;
  /** Gesamtes investiertes Gold (für Verkaufspreis) */
  invested: number;
  recoil: number;
}

export interface Projectile {
  kind: TowerDef['projectile'];
  stats: TowerLevel;
  damageType: TowerDef['damageType'];
  x: number;
  y: number;
  sx: number;
  sy: number;
  target: Enemy;
  tx: number;
  ty: number;
  speed: number;
  /** Für Bogenflug (Katapult): Fortschritt 0..1 */
  progress: number;
  totalDist: number;
  alive: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  gravity: number;
}

export interface FloatText {
  text: string;
  x: number;
  y: number;
  life: number;
  color: string;
}

export function towerStats(t: Tower): TowerLevel {
  return t.def.levels[t.level];
}
