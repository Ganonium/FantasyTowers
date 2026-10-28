import { hash2 } from '../core/rng';
import type { MapDef } from '../data/types';
import { PAL } from './palette';
import { blank, type Sprite } from './sprite';

export const TILE = 16;

type G = CanvasRenderingContext2D;

function px(g: G, x: number, y: number, c: string): void {
  g.fillStyle = c;
  g.fillRect(x, y, 1, 1);
}

function tileAt(map: MapDef, x: number, y: number): string | null {
  if (y < 0 || y >= map.tiles.length) return null;
  const row = map.tiles[y];
  if (x < 0 || x >= row.length) return null;
  return row[x];
}

/** Gras als Grundfläche eines Feldes */
function grass(g: G, tx: number, ty: number, seed: number): void {
  const ox = tx * TILE;
  const oy = ty * TILE;
  g.fillStyle = PAL.g;
  g.fillRect(ox, oy, TILE, TILE);
  // Grasbüschel
  for (let i = 0; i < 5; i++) {
    const x = ox + Math.floor(hash2(tx * 7 + i, ty * 13, seed) * 13) + 1;
    const y = oy + Math.floor(hash2(tx * 3, ty * 5 + i, seed + 1) * 13) + 2;
    px(g, x, y, PAL.G);
    px(g, x + 2, y, PAL.G);
    px(g, x + 1, y + 1, PAL.G);
    px(g, x + 1, y - 1, PAL.h);
  }
  for (let i = 0; i < 3; i++) {
    const x = ox + Math.floor(hash2(tx + i * 31, ty, seed + 2) * 16);
    const y = oy + Math.floor(hash2(tx, ty + i * 17, seed + 3) * 16);
    px(g, x, y, PAL.h);
  }
}

function flowers(g: G, tx: number, ty: number): void {
  const colors = [PAL.z, PAL.F, PAL.R, PAL.q];
  for (let i = 0; i < 5; i++) {
    const x = tx * TILE + 2 + Math.floor(hash2(tx * 5 + i, ty, 9) * 12);
    const y = ty * TILE + 2 + Math.floor(hash2(tx, ty * 5 + i, 10) * 12);
    const c = colors[Math.floor(hash2(x, y, 11) * colors.length)];
    px(g, x - 1, y, c);
    px(g, x + 1, y, c);
    px(g, x, y - 1, c);
    px(g, x, y + 1, c);
    px(g, x, y, PAL.F);
    px(g, x, y + 2, PAL.G);
  }
}

function isPath(map: MapDef, x: number, y: number, self: boolean): boolean {
  const t = tileAt(map, x, y);
  if (t === null) return self; // Kartenrand: Weg läuft einfach weiter
  return t === '#';
}

function path(g: G, map: MapDef, tx: number, ty: number): void {
  const ox = tx * TILE;
  const oy = ty * TILE;
  g.fillStyle = PAL.D;
  g.fillRect(ox, oy, TILE, TILE);
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const r = hash2(ox + x, oy + y, 21);
      if (r < 0.06) px(g, ox + x, oy + y, PAL.d);
      else if (r > 0.95) px(g, ox + x, oy + y, PAL.e);
    }
  }
  // Kieselsteine
  for (let i = 0; i < 2; i++) {
    const x = ox + 3 + Math.floor(hash2(tx * 9 + i, ty, 22) * 10);
    const y = oy + 3 + Math.floor(hash2(tx, ty * 9 + i, 23) * 10);
    px(g, x, y, PAL.e);
    px(g, x + 1, y, PAL.e);
    px(g, x, y + 1, PAL.d);
    px(g, x + 1, y + 1, PAL.d);
  }
  // Grasränder zu Nicht-Weg-Feldern
  const sides: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
  for (const [dx, dy] of sides) {
    if (isPath(map, tx + dx, ty + dy, true)) continue;
    for (let i = 0; i < TILE; i++) {
      const depth = 1 + (hash2(ox + i * (dy !== 0 ? 1 : 0), oy + i * (dx !== 0 ? 1 : 0), 30 + dx * 3 + dy) > 0.55 ? 1 : 0);
      for (let k = 0; k <= depth; k++) {
        const c = k === depth ? PAL.d : PAL.g;
        let x: number, y: number;
        if (dy === -1) { x = ox + i; y = oy + k; }
        else if (dy === 1) { x = ox + i; y = oy + TILE - 1 - k; }
        else if (dx === -1) { x = ox + k; y = oy + i; }
        else { x = ox + TILE - 1 - k; y = oy + i; }
        px(g, x, y, c);
      }
    }
  }
  // Innenecken
  const corners: [number, number][] = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  for (const [dx, dy] of corners) {
    if (!isPath(map, tx + dx, ty, true) || !isPath(map, tx, ty + dy, true)) continue;
    if (isPath(map, tx + dx, ty + dy, true)) continue;
    const cx = dx < 0 ? ox : ox + TILE - 2;
    const cy = dy < 0 ? oy : oy + TILE - 2;
    g.fillStyle = PAL.g;
    g.fillRect(cx, cy, 2, 2);
    px(g, dx < 0 ? cx + 2 : cx - 1, dy < 0 ? cy : cy + 1, PAL.d);
    px(g, dx < 0 ? cx : cx + 1, dy < 0 ? cy + 2 : cy - 1, PAL.d);
    px(g, dx < 0 ? cx + 1 : cx, dy < 0 ? cy + 1 : cy, PAL.d);
  }
}

function water(g: G, map: MapDef, tx: number, ty: number): void {
  const ox = tx * TILE;
  const oy = ty * TILE;
  g.fillStyle = PAL.W;
  g.fillRect(ox, oy, TILE, TILE);
  for (let i = 0; i < 3; i++) {
    const x = ox + 2 + Math.floor(hash2(tx * 3 + i, ty, 40) * 10);
    const y = oy + 3 + Math.floor(hash2(tx, ty * 3 + i, 41) * 10);
    g.fillStyle = PAL.v;
    g.fillRect(x, y, 3, 1);
  }
  const isW = (x: number, y: number) => {
    const t = tileAt(map, x, y);
    return t === null || t === 'W';
  };
  if (!isW(tx, ty - 1)) { g.fillStyle = PAL.w; g.fillRect(ox, oy, TILE, 2); g.fillStyle = PAL.v; g.fillRect(ox, oy + 2, TILE, 1); }
  if (!isW(tx, ty + 1)) { g.fillStyle = PAL.v; g.fillRect(ox, oy + TILE - 1, TILE, 1); }
  if (!isW(tx - 1, ty)) { g.fillStyle = PAL.w; g.fillRect(ox, oy, 2, TILE); g.fillStyle = PAL.v; g.fillRect(ox + 2, oy, 1, TILE); }
  if (!isW(tx + 1, ty)) { g.fillStyle = PAL.v; g.fillRect(ox + TILE - 1, oy, 1, TILE); }
}

/** Schattierter, runder Klecks (Baumkrone, Busch, Felsen). */
function blob(
  g: G,
  cx: number,
  cy: number,
  r: number,
  cols: [string, string, string],
  outline: string,
  seed: number,
  texture = 0.12,
): void {
  const inside = (x: number, y: number) => {
    const dx = x - cx;
    const dy = y - cy;
    const wobble = (hash2(Math.floor(Math.atan2(dy, dx) * 3) + 10, 0, seed) - 0.5) * 1.4;
    return dx * dx + dy * dy <= (r + wobble) * (r + wobble);
  };
  const R = Math.ceil(r + 2);
  for (let y = Math.floor(cy - R); y <= cy + R; y++) {
    for (let x = Math.floor(cx - R); x <= cx + R; x++) {
      if (inside(x + 0.5, y + 0.5)) {
        const nx = (x + 0.5 - cx) / r;
        const ny = (y + 0.5 - cy) / r;
        let l = -(nx * 0.55 + ny * 0.75) + (hash2(x, y, seed + 5) - 0.5) * 0.5;
        if (hash2(x, y, seed + 6) < texture) l -= 0.6;
        const c = l > 0.35 ? cols[2] : l > -0.35 ? cols[1] : cols[0];
        px(g, x, y, c);
      } else if (
        inside(x + 1.5, y + 0.5) || inside(x - 0.5, y + 0.5) ||
        inside(x + 0.5, y + 1.5) || inside(x + 0.5, y - 0.5)
      ) {
        px(g, x, y, outline);
      }
    }
  }
}

function shadow(g: G, cx: number, cy: number, rx: number, ry: number): void {
  g.fillStyle = 'rgba(20,40,20,0.35)';
  for (let y = -ry; y <= ry; y++) {
    const w = Math.round(rx * Math.sqrt(1 - (y * y) / (ry * ry + 0.01)));
    g.fillRect(cx - w, cy + y, w * 2, 1);
  }
}

function tree(g: G, tx: number, ty: number): void {
  const cx = tx * TILE + 8;
  const cy = ty * TILE + 7;
  shadow(g, cx + 2, ty * TILE + 14, 7, 2);
  g.fillStyle = PAL.b;
  g.fillRect(cx - 2, ty * TILE + 11, 4, 4);
  g.fillStyle = PAL.B;
  g.fillRect(cx - 1, ty * TILE + 11, 2, 4);
  blob(g, cx, cy, 8, [PAL.t, PAL.T, PAL.y], '#0e2a14', tx * 31 + ty * 7);
}

function bush(g: G, tx: number, ty: number): void {
  const cx = tx * TILE + 8;
  const cy = ty * TILE + 10;
  shadow(g, cx + 1, cy + 4, 6, 2);
  blob(g, cx, cy, 5, [PAL.t, PAL.T, PAL.y], '#0e2a14', tx * 17 + ty, 0.18);
}

function rock(g: G, tx: number, ty: number): void {
  const cx = tx * TILE + 8;
  const cy = ty * TILE + 10;
  shadow(g, cx + 1, cy + 4, 6, 2);
  blob(g, cx, cy, 5, [PAL.s, PAL.S, PAL.l], PAL.x, tx * 3 + ty * 11, 0.05);
}

function buildSpot(g: G, tx: number, ty: number): void {
  const ox = tx * TILE;
  const oy = ty * TILE;
  // Steinplattform
  g.fillStyle = PAL.x;
  g.fillRect(ox + 2, oy + 3, 12, 12);
  g.fillRect(ox + 1, oy + 4, 14, 10);
  g.fillStyle = PAL.S;
  g.fillRect(ox + 2, oy + 4, 12, 10);
  g.fillStyle = PAL.l;
  g.fillRect(ox + 2, oy + 4, 12, 1);
  g.fillStyle = PAL.s;
  g.fillRect(ox + 2, oy + 13, 12, 1);
  // Fugen
  g.fillStyle = PAL.s;
  for (let row = 0; row < 3; row++) {
    const y = oy + 4 + row * 3 + 2;
    g.fillRect(ox + 2, y, 12, 1);
    const off = row % 2 === 0 ? 0 : 2;
    for (let x = ox + 2 + off + 3; x < ox + 14; x += 4) g.fillRect(x, y - 2, 1, 2);
  }
}

/** Rendert die statische Karte (Boden, Wege, Bäume, Bauplätze). */
export function renderMapBackground(map: MapDef): Sprite {
  const rows = map.tiles.length;
  const cols = map.tiles[0].length;
  const { c, g } = blank(cols * TILE, rows * TILE);
  // Boden
  for (let ty = 0; ty < rows; ty++) {
    for (let tx = 0; tx < cols; tx++) {
      const t = map.tiles[ty][tx];
      if (t === '#') path(g, map, tx, ty);
      else if (t === 'W') water(g, map, tx, ty);
      else {
        grass(g, tx, ty, 1);
        if (t === ',') flowers(g, tx, ty);
      }
    }
  }
  // Objekte (zeilenweise, damit Überlappungen stimmen)
  for (let ty = 0; ty < rows; ty++) {
    for (let tx = 0; tx < cols; tx++) {
      const t = map.tiles[ty][tx];
      if (t === 'T') tree(g, tx, ty);
      else if (t === 'b') bush(g, tx, ty);
      else if (t === 'R') rock(g, tx, ty);
      else if (t === 'B') buildSpot(g, tx, ty);
    }
  }
  return c;
}

function stoneWall(g: G, x: number, y: number, w: number, h: number): void {
  g.fillStyle = PAL.x;
  g.fillRect(x - 1, y - 1, w + 2, h + 2);
  g.fillStyle = PAL.S;
  g.fillRect(x, y, w, h);
  g.fillStyle = PAL.s;
  for (let row = 0; row * 4 < h; row++) {
    const yy = y + row * 4 + 3;
    if (yy < y + h) g.fillRect(x, yy, w, 1);
    const off = row % 2 === 0 ? 1 : 4;
    for (let xx = x + off; xx < x + w; xx += 6) g.fillRect(xx, y + row * 4, 1, Math.min(3, y + h - (y + row * 4)));
  }
  g.fillStyle = PAL.l;
  g.fillRect(x, y, w, 1);
}

/** Vordergrund-Ebene (Tor), wird über den Gegnern gezeichnet. */
export function renderMapForeground(map: MapDef): Sprite {
  const rows = map.tiles.length;
  const cols = map.tiles[0].length;
  const { c, g } = blank(cols * TILE, rows * TILE);
  const [gx, gy] = map.gate;
  const left = (gx - 1) * TILE + 2;
  const right = (gx + 1) * TILE;
  const top = gy * TILE - 6;
  const bottom = rows * TILE;
  // Mauer über dem Durchgang
  stoneWall(g, gx * TILE - 2, top + 2, TILE + 4, 8);
  g.fillStyle = PAL.x;
  g.fillRect(gx * TILE, top + 10, TILE, 2);
  // Türme links und rechts
  for (const x of [left, right]) {
    stoneWall(g, x, top, 14, bottom - top);
    // Zinnen
    g.fillStyle = PAL.x;
    for (let i = 0; i < 3; i++) g.fillRect(x - 1 + i * 5, top - 4, 4, 4);
    g.fillStyle = PAL.S;
    for (let i = 0; i < 3; i++) g.fillRect(x + i * 5, top - 3, 2, 3);
    // Banner
    g.fillStyle = PAL.x;
    g.fillRect(x + 3, top + 4, 8, 10);
    g.fillStyle = PAL.R;
    g.fillRect(x + 4, top + 4, 6, 8);
    g.fillRect(x + 5, top + 12, 4, 1);
    g.fillStyle = PAL.Y;
    g.fillRect(x + 6, top + 6, 2, 3);
  }
  return c;
}
