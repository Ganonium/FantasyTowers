import { TILE } from '../art/terrain';
import type { TilePoint } from '../data/types';

/** Weg als Polylinie in Pixelkoordinaten mit Abstandsberechnung. */
export class Path {
  readonly points: { x: number; y: number }[];
  private readonly cumulative: number[] = [0];
  readonly length: number;

  constructor(tiles: TilePoint[]) {
    this.points = tiles.map(([x, y]) => ({ x: x * TILE + TILE / 2, y: y * TILE + TILE / 2 }));
    let total = 0;
    for (let i = 1; i < this.points.length; i++) {
      const a = this.points[i - 1];
      const b = this.points[i];
      total += Math.hypot(b.x - a.x, b.y - a.y);
      this.cumulative.push(total);
    }
    this.length = total;
  }

  /** Position und Laufrichtung nach `dist` Pixeln auf dem Weg. */
  at(dist: number): { x: number; y: number; dx: number; dy: number } {
    const d = Math.max(0, Math.min(this.length, dist));
    let i = 1;
    while (i < this.cumulative.length - 1 && this.cumulative[i] < d) i++;
    const a = this.points[i - 1];
    const b = this.points[i];
    const segLen = this.cumulative[i] - this.cumulative[i - 1] || 1;
    const f = (d - this.cumulative[i - 1]) / segLen;
    return {
      x: a.x + (b.x - a.x) * f,
      y: a.y + (b.y - a.y) * f,
      dx: (b.x - a.x) / segLen,
      dy: (b.y - a.y) / segLen,
    };
  }
}
