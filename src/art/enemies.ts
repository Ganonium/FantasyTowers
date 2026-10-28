import { flipped, makeSprite, tinted, type Sprite } from './sprite';

/**
 * Gegner-Grafiken. Jeder Eintrag liefert Animationsbilder (Laufzyklus).
 * Neue Gegner: Zeichnung hier ergänzen, ID muss zu src/data/enemies.ts passen.
 */
interface EnemyArtDef {
  frames: string[][];
  overrides?: Record<string, string>;
  /** Bilder pro Sekunde der Laufanimation */
  fps: number;
  /** Seitenansicht – wird beim Laufen nach links gespiegelt */
  sideView?: boolean;
}

const goblinBody = [
  'p........p',
  'pp.OOOO.pp',
  '.pOOOOOOp.',
  '..OEOOEO..',
  '..OOOOOO..',
  '...OzzO...',
  '..BBBBBB..',
  '.OBnBBnBOU',
  '.OBBBBBBOU',
  '..BbBBbB.n',
];

const orcBody = [
  '....oooooo.....l',
  '...oOOOOOOo..lUU',
  '..oOOEOOEOOo.lUU',
  '..oOOOOOOOOo..nU',
  '..oOzOOOOzOo..n.',
  '...ooOOOOoo...n.',
  '.UUuUUUUUUuUU.n.',
  'oOuSSSSSSSSuOOn.',
  'oO.SSlSSlSS.OOn.',
  'oo.SSSSSSSS..on.',
  '...bbbYYbbb.....',
  '...BBBBBBBB.....',
];

const bruteBody = [
  '.l............l.',
  '.ll..uuuuuu..ll.',
  '..lluUUUUUUull..',
  '...uUUUUUUUUu...',
  '..ouUUUUUUUUuo..',
  '..oOOEOOOOEOOo..',
  '..oOOOOOOOOOOo..',
  '..oOzOOOOOOzOo..',
  '...ooOOOOOOoo...',
  '.uUUUUUUUUUUUUu.',
  'uUUsSSSSSSSSsUUu',
  'oOusSSlSSlSSsuOo',
  'oOosSSSSSSSSsoOo',
  'oo.sSSSSSSSSs.oo',
  '...ubbbYYbbbu...',
];

const wolfTop = [
  '......p...p.....',
  '......pOOOp.....',
  '.......OEOE.....',
  '.......OOOO.....',
  '......BBBBnU....',
  '.....OBBBBOU..k.',
  'k....KKKKKKKKkKk',
  'kK.KKLLLLKKKKKEK',
  '.KKKKKKKKKKKKKKz',
  '..KKKKKKKKKKKK..',
];

const ART: Record<string, EnemyArtDef> = {
  goblin: {
    fps: 8,
    frames: [
      [...goblinBody, '..bb..bb..', '.bb....bb.'],
      [...goblinBody, '..bb..bb..', '..bb..bb..'],
    ],
  },
  orc: {
    fps: 6,
    frames: [
      [...orcBody, '...BBB..BBB.....', '...uu....uu.....', '..uuu....uuu....'],
      [...orcBody, '...BBB..BBB.....', '....uu..uu......', '....uu..uu......'],
    ],
  },
  brute: {
    fps: 4,
    overrides: { o: '#2c4418', O: '#4a7024', p: '#6a9a30', S: '#6a7080', l: '#a0a8b0' },
    frames: [
      [...bruteBody, '...uuuu..uuuu...', '..uuuuu..uuuuu..'],
      [...bruteBody, '....uuuu.uuuu...', '....uuuu.uuuu...'],
    ],
  },
  wolfrider: {
    fps: 10,
    sideView: true,
    overrides: { p: '#94c048' },
    frames: [
      [...wolfTop, '..KK.KK...KK.KK.', '..k..k.....k..k.'],
      [...wolfTop, '...KKK.....KKK..', '...k.k.....k.k..'],
    ],
  },
};

export interface EnemySprites {
  fps: number;
  /** [Richtung 0=rechts/vorne, 1=links][Bild] */
  normal: Sprite[][];
  flash: Sprite[][];
  frost: Sprite[][];
}

const cache = new Map<string, EnemySprites>();

export function enemySprites(id: string): EnemySprites {
  const hit = cache.get(id);
  if (hit) return hit;
  const def = ART[id] ?? ART.goblin;
  const right = def.frames.map((f) => makeSprite(f, def.overrides));
  const left = def.sideView ? right.map(flipped) : right;
  const dirs = [right, left];
  const result: EnemySprites = {
    fps: def.fps,
    normal: dirs,
    flash: dirs.map((d) => d.map((s) => tinted(s, '#ffffff', 0.85))),
    frost: dirs.map((d) => d.map((s) => tinted(s, '#78c8ff', 0.45))),
  };
  cache.set(id, result);
  return result;
}
