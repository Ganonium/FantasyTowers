import type { MapDef } from '../types';

export const greenvale: MapDef = {
  id: 'greenvale',
  name: 'map.greenvale',
  tiles: [
    'TT#TT.TTTWWT',
    'T.#.B..B.WWT',
    'T.########.T',
    'T.,..B..B#.T',
    'TT.B.....#BT',
    '.R..B..B.#..',
    '..########.T',
    'T.#.B..B..,T',
    'TB#...R..B.T',
    'T.#B..,.B..T',
    'b.########.T',
    'T.,.B..B.#B.',
    'TT.....,.#.T',
    'T.B..#####.T',
    'TTT..#.B.TTT',
    'TTTT.#..TTTT',
  ],
  paths: [
    [[2, -1], [2, 2], [9, 2], [9, 6], [2, 6], [2, 10], [9, 10], [9, 13], [5, 13], [5, 16]],
  ],
  gate: [5, 15],
};
