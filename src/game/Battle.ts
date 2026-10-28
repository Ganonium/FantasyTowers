import { TILE } from '../art/terrain';
import { ENEMIES } from '../data/enemies';
import { MAPS } from '../data/maps';
import { TOWERS, TOWER_ORDER } from '../data/towers';
import type { DamageType, LevelDef, MapDef, TowerLevel } from '../data/types';
import type { Enemy, FloatText, Particle, Projectile, Tower } from './entities';
import { towerStats } from './entities';
import { Path } from './Path';

export interface BuildSpot {
  tx: number;
  ty: number;
  x: number;
  y: number;
  tower: Tower | null;
}

interface PendingSpawn {
  at: number;
  enemy: string;
  path: number;
  hpScale: number;
}

export type BattleState = 'waiting' | 'running' | 'won' | 'lost';

/** Bonusgold, wenn die nächste Welle vorzeitig gerufen wird. */
export const EARLY_CALL_BONUS = 15;
export const SELL_REFUND = 0.6;

/** Spiellogik eines Levels – unabhängig von Darstellung und Eingabe. */
export class Battle {
  readonly map: MapDef;
  readonly paths: Path[];
  readonly spots: BuildSpot[] = [];
  readonly towerIds: string[];
  gold: number;
  lives: number;
  /** Anzahl bereits gestarteter Wellen */
  wave = 0;
  state: BattleState = 'waiting';
  time = 0;
  enemies: Enemy[] = [];
  towers: Tower[] = [];
  projectiles: Projectile[] = [];
  particles: Particle[] = [];
  texts: FloatText[] = [];
  private pending: PendingSpawn[] = [];

  constructor(readonly level: LevelDef) {
    this.map = MAPS[level.map];
    this.paths = this.map.paths.map((p) => new Path(p));
    this.gold = level.startGold;
    this.lives = level.lives;
    this.towerIds = level.towers?.length ? level.towers : TOWER_ORDER;
    this.map.tiles.forEach((row, ty) => {
      [...row].forEach((ch, tx) => {
        if (ch === 'B') this.spots.push({ tx, ty, x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2, tower: null });
      });
    });
  }

  get totalWaves(): number {
    return this.level.waves.length;
  }

  /** Alle Gegner der aktuellen Welle sind erschienen */
  get waveSpawned(): boolean {
    return this.pending.length === 0;
  }

  canCallWave(): boolean {
    return this.wave < this.totalWaves && this.waveSpawned && (this.state === 'waiting' || this.state === 'running');
  }

  startNextWave(): void {
    if (!this.canCallWave()) return;
    if (this.state === 'running' && this.enemies.length > 0) {
      this.gold += EARLY_CALL_BONUS;
      this.texts.push({ text: `+${EARLY_CALL_BONUS}`, x: 96, y: 40, life: 1.2, color: '#f0c040' });
    }
    const def = this.level.waves[this.wave];
    for (const group of def.groups) {
      for (let i = 0; i < group.count; i++) {
        this.pending.push({
          at: this.time + (group.delay ?? 0) + i * group.interval,
          enemy: group.enemy,
          path: group.path ?? 0,
          hpScale: group.hpScale ?? 1,
        });
      }
    }
    this.pending.sort((a, b) => a.at - b.at);
    this.wave++;
    this.state = 'running';
  }

  private waveCleared(): void {
    const bonus = (this.level.waveBonus ?? 0) + this.wave * 2;
    if (bonus <= 0) return;
    this.gold += bonus;
    this.texts.push({ text: `+${bonus}`, x: 96, y: 40, life: 1.5, color: '#f0c040' });
  }

  // ---------- Türme ----------

  buildCost(towerId: string): number {
    return TOWERS[towerId].levels[0].cost;
  }

  build(spotIndex: number, towerId: string): boolean {
    const spot = this.spots[spotIndex];
    const def = TOWERS[towerId];
    if (!spot || spot.tower || !def || this.gold < def.levels[0].cost) return false;
    this.gold -= def.levels[0].cost;
    const tower: Tower = {
      def,
      level: 0,
      spot: spotIndex,
      x: spot.x,
      y: spot.y,
      cooldown: 0.3,
      invested: def.levels[0].cost,
      recoil: 0,
    };
    spot.tower = tower;
    this.towers.push(tower);
    this.puff(spot.x, spot.y + 4, '#c0c8d0', 10);
    return true;
  }

  upgradeCost(tower: Tower): number | null {
    const next = tower.def.levels[tower.level + 1];
    return next ? next.cost : null;
  }

  upgrade(tower: Tower): boolean {
    const cost = this.upgradeCost(tower);
    if (cost === null || this.gold < cost) return false;
    this.gold -= cost;
    tower.level++;
    tower.invested += cost;
    this.puff(tower.x, tower.y - 6, '#f0c040', 12);
    return true;
  }

  sellValue(tower: Tower): number {
    return Math.floor(tower.invested * SELL_REFUND);
  }

  sell(tower: Tower): void {
    const value = this.sellValue(tower);
    this.gold += value;
    this.spots[tower.spot].tower = null;
    this.towers = this.towers.filter((t) => t !== tower);
    this.texts.push({ text: `+${value}`, x: tower.x, y: tower.y - 10, life: 1, color: '#f0c040' });
    this.puff(tower.x, tower.y + 4, '#a8703a', 10);
  }

  // ---------- Simulation ----------

  update(dt: number): void {
    if (this.state === 'won' || this.state === 'lost') {
      this.updateEffects(dt);
      return;
    }
    this.time += dt;

    while (this.pending.length && this.pending[0].at <= this.time) {
      const s = this.pending.shift()!;
      this.spawn(s.enemy, s.path, s.hpScale);
    }

    for (const e of this.enemies) this.updateEnemy(e, dt);
    for (const t of this.towers) this.updateTower(t, dt);
    for (const p of this.projectiles) this.updateProjectile(p, dt);

    this.enemies = this.enemies.filter((e) => e.alive);
    this.projectiles = this.projectiles.filter((p) => p.alive);
    this.updateEffects(dt);

    if (this.lives <= 0) {
      this.lives = 0;
      this.state = 'lost';
    } else if (this.enemies.length === 0 && this.waveSpawned && this.state === 'running') {
      this.state = this.wave >= this.totalWaves ? 'won' : 'waiting';
      if (this.state === 'waiting') this.waveCleared();
    }
  }

  private spawn(enemyId: string, pathIndex: number, hpScale: number): void {
    const def = ENEMIES[enemyId];
    const path = this.paths[pathIndex] ?? this.paths[0];
    if (!def) return;
    const hp = Math.round(def.hp * hpScale);
    const start = path.at(0);
    this.enemies.push({
      def,
      path,
      dist: 0,
      offset: (Math.random() - 0.5) * 6,
      x: start.x,
      y: start.y,
      facingLeft: false,
      hp,
      maxHp: hp,
      slowFactor: 1,
      slowTime: 0,
      burnDps: 0,
      burnTime: 0,
      flashTime: 0,
      animTime: Math.random(),
      alive: true,
    });
  }

  private updateEnemy(e: Enemy, dt: number): void {
    if (!e.alive) return;
    if (e.slowTime > 0) {
      e.slowTime -= dt;
      if (e.slowTime <= 0) e.slowFactor = 1;
    }
    if (e.burnTime > 0) {
      e.burnTime -= dt;
      this.damage(e, e.burnDps * dt, 'magic', false);
      if (Math.random() < dt * 12) {
        this.particles.push({
          x: e.x + (Math.random() - 0.5) * 6, y: e.y - 4 - Math.random() * 6,
          vx: 0, vy: -14, life: 0.4, maxLife: 0.4,
          color: Math.random() < 0.5 ? '#f08a20' : '#f8d040', size: 1, gravity: 0,
        });
      }
      if (!e.alive) return;
    }
    e.flashTime = Math.max(0, e.flashTime - dt);
    e.animTime += dt * e.slowFactor;
    e.dist += e.def.speed * e.slowFactor * dt;
    const p = e.path.at(e.dist);
    // senkrecht zur Laufrichtung versetzen
    e.x = p.x - p.dy * e.offset;
    e.y = p.y + p.dx * e.offset;
    if (Math.abs(p.dx) > 0.5) e.facingLeft = p.dx < 0;
    if (e.dist >= e.path.length) {
      e.alive = false;
      this.lives -= e.def.lives;
      this.texts.push({ text: `-${e.def.lives}`, x: e.x, y: e.y - 20, life: 1, color: '#e04838' });
    }
  }

  private updateTower(t: Tower, dt: number): void {
    t.cooldown -= dt;
    t.recoil = Math.max(0, t.recoil - dt);
    if (t.cooldown > 0) return;
    const stats = towerStats(t);
    let best: Enemy | null = null;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const dx = e.x - t.x;
      const dy = e.y - 4 - t.y;
      if (dx * dx + dy * dy > stats.range * stats.range) continue;
      if (!best || e.dist > best.dist) best = e;
    }
    if (!best) return;
    t.cooldown = stats.cooldown;
    t.recoil = 0.15;
    const sx = t.x;
    const sy = t.y - (t.def.projectile === 'arrow' ? 16 : t.def.projectile === 'stone' ? 12 : 18);
    const dist = Math.hypot(best.x - sx, best.y - sy);
    this.projectiles.push({
      kind: t.def.projectile,
      stats,
      damageType: t.def.damageType,
      x: sx, y: sy, sx, sy,
      target: best,
      tx: best.x, ty: best.y - 5,
      speed: t.def.projectileSpeed,
      progress: 0,
      totalDist: Math.max(1, dist),
      alive: true,
    });
  }

  private updateProjectile(p: Projectile, dt: number): void {
    if (p.target.alive) {
      p.tx = p.target.x;
      p.ty = p.target.y - 5;
    }
    if (p.kind === 'stone') {
      p.progress = Math.min(1, p.progress + (p.speed * dt) / p.totalDist);
      p.x = p.sx + (p.tx - p.sx) * p.progress;
      p.y = p.sy + (p.ty - p.sy) * p.progress;
      if (p.progress >= 1) this.impact(p);
      return;
    }
    const dx = p.tx - p.x;
    const dy = p.ty - p.y;
    const d = Math.hypot(dx, dy);
    const step = p.speed * dt;
    if (d <= step + 1) {
      p.x = p.tx;
      p.y = p.ty;
      this.impact(p);
      return;
    }
    p.x += (dx / d) * step;
    p.y += (dy / d) * step;
    if (p.kind === 'fireball' || p.kind === 'frostbolt') {
      this.particles.push({
        x: p.x, y: p.y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6,
        life: 0.25, maxLife: 0.25,
        color: p.kind === 'fireball' ? (Math.random() < 0.5 ? '#f08a20' : '#d03a2a') : (Math.random() < 0.5 ? '#c8f0ff' : '#70c8f0'),
        size: 1, gravity: 0,
      });
    }
  }

  private impact(p: Projectile): void {
    p.alive = false;
    const s = p.stats;
    if (s.splash) {
      for (const e of this.enemies) {
        if (!e.alive) continue;
        const dx = e.x - p.x;
        const dy = e.y - 5 - p.y;
        if (dx * dx + dy * dy <= s.splash * s.splash) this.hit(e, s, p.damageType);
      }
    } else if (p.target.alive) {
      this.hit(p.target, s, p.damageType);
    }
    const colors: Record<string, string[]> = {
      arrow: ['#c0c8d0'],
      stone: ['#8890a0', '#9a6e3e', '#c49a5c'],
      fireball: ['#f08a20', '#f8d040', '#d03a2a'],
      frostbolt: ['#c8f0ff', '#70c8f0', '#ffffff'],
    };
    const n = p.kind === 'arrow' ? 3 : s.splash ? 14 : 8;
    const pal = colors[p.kind];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 10 + Math.random() * (s.splash ? 40 : 25);
      this.particles.push({
        x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 10,
        life: 0.35 + Math.random() * 0.2, maxLife: 0.5,
        color: pal[i % pal.length], size: Math.random() < 0.3 ? 2 : 1, gravity: 60,
      });
    }
  }

  private hit(e: Enemy, s: TowerLevel, type: DamageType): void {
    this.damage(e, s.damage, type, true);
    if (s.slow && e.alive) {
      e.slowFactor = Math.min(e.slowFactor, s.slow.factor);
      e.slowTime = Math.max(e.slowTime, s.slow.duration);
    }
    if (s.burn && e.alive) {
      e.burnDps = Math.max(e.burnTime > 0 ? e.burnDps : 0, s.burn.dps);
      e.burnTime = Math.max(e.burnTime, s.burn.duration);
    }
  }

  private damage(e: Enemy, amount: number, type: DamageType, flash: boolean): void {
    if (!e.alive) return;
    const resist = type === 'physical' ? e.def.armor : e.def.magicResist;
    e.hp -= amount * (1 - resist);
    if (flash) e.flashTime = 0.08;
    if (e.hp <= 0) {
      e.alive = false;
      this.gold += e.def.bounty;
      this.texts.push({ text: `+${e.def.bounty}`, x: e.x, y: e.y - 14, life: 0.9, color: '#f0c040' });
      this.puff(e.x, e.y - 4, '#e8e0d0', 10);
    }
  }

  private puff(x: number, y: number, color: string, n: number): void {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 8 + Math.random() * 20;
      this.particles.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.6 - 8,
        life: 0.4 + Math.random() * 0.3, maxLife: 0.7, color, size: Math.random() < 0.4 ? 2 : 1, gravity: -10,
      });
    }
  }

  private updateEffects(dt: number): void {
    for (const p of this.particles) {
      p.life -= dt;
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const t of this.texts) {
      t.life -= dt;
      t.y -= 14 * dt;
    }
    this.texts = this.texts.filter((t) => t.life > 0);
  }

  /** Sterne nach Sieg: 3 bei kaum Verlusten, 2 bei mehr als der Hälfte, sonst 1 */
  stars(): number {
    if (this.state !== 'won') return 0;
    const ratio = this.lives / this.level.lives;
    return ratio >= 0.9 ? 3 : ratio >= 0.5 ? 2 : 1;
  }
}
