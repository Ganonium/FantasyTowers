import type { TowerDef } from './types';

export const TOWERS: Record<string, TowerDef> = {
  archer: {
    id: 'archer',
    name: 'tower.archer.name',
    desc: 'tower.archer.desc',
    damageType: 'physical',
    projectile: 'arrow',
    projectileSpeed: 220,
    levels: [
      { cost: 70, damage: 8, range: 48, cooldown: 0.75 },
      { cost: 100, damage: 13, range: 52, cooldown: 0.65 },
      { cost: 150, damage: 20, range: 56, cooldown: 0.55 },
    ],
  },
  catapult: {
    id: 'catapult',
    name: 'tower.catapult.name',
    desc: 'tower.catapult.desc',
    damageType: 'physical',
    projectile: 'stone',
    projectileSpeed: 90,
    levels: [
      { cost: 100, damage: 22, range: 50, cooldown: 1.9, splash: 20 },
      { cost: 120, damage: 36, range: 54, cooldown: 1.7, splash: 22 },
      { cost: 180, damage: 56, range: 58, cooldown: 1.5, splash: 26 },
    ],
  },
  fire: {
    id: 'fire',
    name: 'tower.fire.name',
    desc: 'tower.fire.desc',
    damageType: 'magic',
    projectile: 'fireball',
    projectileSpeed: 130,
    levels: [
      { cost: 120, damage: 15, range: 46, cooldown: 1.1, burn: { dps: 8, duration: 2 } },
      { cost: 140, damage: 24, range: 50, cooldown: 1.0, burn: { dps: 12, duration: 2 } },
      { cost: 200, damage: 36, range: 54, cooldown: 0.9, burn: { dps: 18, duration: 3 }, splash: 14 },
    ],
  },
  frost: {
    id: 'frost',
    name: 'tower.frost.name',
    desc: 'tower.frost.desc',
    damageType: 'magic',
    projectile: 'frostbolt',
    projectileSpeed: 150,
    levels: [
      { cost: 90, damage: 6, range: 46, cooldown: 0.9, slow: { factor: 0.6, duration: 1.5 } },
      { cost: 110, damage: 10, range: 50, cooldown: 0.8, slow: { factor: 0.5, duration: 2 } },
      { cost: 160, damage: 15, range: 54, cooldown: 0.7, slow: { factor: 0.4, duration: 2.5 }, splash: 16 },
    ],
  },
};

/** Reihenfolge im Baumenü */
export const TOWER_ORDER = ['archer', 'catapult', 'fire', 'frost'];
