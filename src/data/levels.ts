import type { LevelDef } from './types';

/** Alle Level in Spielreihenfolge. Ein Level wird freigeschaltet, wenn das vorige geschafft ist. */
export const LEVELS: LevelDef[] = [
  {
    id: 'l1',
    name: 'level.l1',
    map: 'greenvale',
    startGold: 240,
    lives: 20,
    waveBonus: 10,
    waves: [
      { groups: [{ enemy: 'goblin', count: 8, interval: 1.2 }] },
      { groups: [{ enemy: 'goblin', count: 14, interval: 0.8 }] },
      {
        groups: [
          { enemy: 'orc', count: 6, interval: 1.6 },
          { enemy: 'goblin', count: 10, interval: 0.7, delay: 4 },
        ],
      },
      { groups: [{ enemy: 'orc', count: 12, interval: 1.1, hpScale: 1.2 }] },
      {
        groups: [
          { enemy: 'wolfrider', count: 8, interval: 1.0, hpScale: 1.2 },
          { enemy: 'goblin', count: 14, interval: 0.5, delay: 3, hpScale: 1.4 },
        ],
      },
      {
        groups: [
          { enemy: 'brute', count: 3, interval: 3, hpScale: 1.2 },
          { enemy: 'orc', count: 12, interval: 0.9, delay: 2, hpScale: 1.4 },
        ],
      },
      { groups: [{ enemy: 'wolfrider', count: 16, interval: 0.6, hpScale: 1.8 }] },
      {
        groups: [
          { enemy: 'goblin', count: 20, interval: 0.4, hpScale: 2.1 },
          { enemy: 'orc', count: 14, interval: 0.8, delay: 3, hpScale: 1.9 },
          { enemy: 'brute', count: 4, interval: 3, delay: 6, hpScale: 1.5 },
        ],
      },
      {
        groups: [
          { enemy: 'wolfrider', count: 14, interval: 0.6, hpScale: 2.2 },
          { enemy: 'brute', count: 7, interval: 2.2, delay: 4, hpScale: 1.8 },
        ],
      },
      {
        groups: [
          { enemy: 'goblin', count: 24, interval: 0.35, hpScale: 2.8 },
          { enemy: 'orc', count: 18, interval: 0.7, delay: 2, hpScale: 2.5 },
          { enemy: 'wolfrider', count: 12, interval: 0.7, delay: 8, hpScale: 2.4 },
          { enemy: 'brute', count: 8, interval: 2, delay: 10, hpScale: 2.2 },
        ],
      },
    ],
  },
];
