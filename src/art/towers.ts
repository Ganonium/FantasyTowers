import { makeSprite, type Sprite } from './sprite';

/**
 * Turm-Grafiken. Pro Turm eine Zeichnung, die Ausbaustufen entstehen über
 * Farbvarianten (Dach, Fahne, Kristall).
 */
const archer = [
  '......Y.......',
  '......nYY.....',
  '......nYYY....',
  '......n.......',
  '.....rRRr.....',
  '....rRRRRr....',
  '...rRRRRRRr...',
  '..rRRRRRRRRr..',
  '.rRRRRRRRRRRr.',
  'bnnnnnnnnnnnnb',
  '.nBxBBBBBBxBn.',
  '.nBBBBBBBBBBn.',
  '.bnnnnnnnnnnb.',
  '..SSlSSSSlSS..',
  '..SsSSxxSSsS..',
  '..SSSSxxSSSS..',
  '..SlSSSSSSlS..',
  '..SSSSSSSSSS..',
  '.sSSSSxxSSSSs.',
  '.sSSSSxxSSSSs.',
  'ssssssxxssssss',
];

const catapult = [
  '.SSs............',
  'SlSSs...........',
  '.SSsbn..........',
  '....bBn.........',
  '.....bBn........',
  '......bBn.......',
  '.......bBn......',
  '...n....bBn..n..',
  '...nn....bBnnn..',
  '..nnRRRRRRRRnn..',
  '..bnnnnnnnnnnnb.',
  '..BbB.....BbB...',
  '.SSSSSSSSSSSSSS.',
  'SSlSSSSSSSSSlSSs',
  'SsSSSSSSSSSSSsSs',
  'sSSSSSSSSSSSSSSs',
  '.ssssssssssssss.',
];

const mage = [
  '......cc......',
  '.....cCCc.....',
  '.....CzCC.....',
  '.....cCCc.....',
  '......cc......',
  '....Y.uu.Y....',
  '....YuUUuY....',
  '.....uUUu.....',
  '....rRRRRr....',
  '...rRRRRRRr...',
  '..rRRRRRRRRr..',
  '..sSSSSSSSSs..',
  '..SSlSSSSlSS..',
  '..SSSScCSSSS..',
  '..SSSScCSSSS..',
  '..SlSSSSSSlS..',
  '.sSSSSSSSSSSs.',
  '.sSSSSxxSSSSs.',
  '.sSSSSxxSSSSs.',
  'ssssssxxssssss',
];

interface TowerArtDef {
  rows: string[];
  levels: Record<string, string>[];
  /** Mittelpunkt des Leuchtens / Abschusspunkt relativ zur Unterkante */
  muzzle: [number, number];
  glow?: string;
}

const ART: Record<string, TowerArtDef> = {
  archer: {
    rows: archer,
    muzzle: [0, -16],
    levels: [
      { r: '#5a3418', R: '#8a5428', Y: '#c8c8c0', n: '#a8703a' },
      { r: '#8a2020', R: '#c83a2a', Y: '#f0c040' },
      { r: '#283c8a', R: '#3a5ec8', Y: '#f0c040', B: '#5a3418', S: '#a0a8b8', l: '#e0e8f0' },
    ],
  },
  catapult: {
    rows: catapult,
    muzzle: [-5, -16],
    levels: [
      { R: '#8a5428' },
      { R: '#c83a2a', S: '#98a0b0' },
      { R: '#3a5ec8', S: '#a8b0c0', n: '#c89048', Y: '#f0c040' },
    ],
  },
  fire: {
    rows: mage,
    muzzle: [0, -19],
    glow: 'rgba(255,140,40,',
    levels: [
      { r: '#4a2a7a', R: '#7a4ab8', c: '#b03020', C: '#f08a20', Y: '#b08020' },
      { r: '#6a1a2a', R: '#a02a3a', c: '#d03a2a', C: '#f8b040', Y: '#f0c040' },
      { r: '#3a1010', R: '#701818', c: '#f08a20', C: '#f8e070', Y: '#f8e070', S: '#a0a8b8' },
    ],
  },
  frost: {
    rows: mage,
    muzzle: [0, -19],
    glow: 'rgba(120,200,255,',
    levels: [
      { r: '#24448a', R: '#3a70c8', c: '#3a88c8', C: '#c8f0ff', Y: '#b08020' },
      { r: '#1a5a7a', R: '#2a8ab0', c: '#70c8f0', C: '#ffffff', Y: '#f0c040' },
      { r: '#e0e8f0', R: '#ffffff', c: '#70c8f0', C: '#ffffff', Y: '#f0c040', S: '#a8b8c8', s: '#607088' },
    ],
  },
};

export interface TowerSprites {
  levels: Sprite[];
  muzzle: [number, number];
  glow?: string;
}

const cache = new Map<string, TowerSprites>();

export function towerSprites(id: string): TowerSprites {
  const hit = cache.get(id);
  if (hit) return hit;
  const def = ART[id] ?? ART.archer;
  const result: TowerSprites = {
    levels: def.levels.map((o) => makeSprite(def.rows, o)),
    muzzle: def.muzzle,
    glow: def.glow,
  };
  cache.set(id, result);
  return result;
}
