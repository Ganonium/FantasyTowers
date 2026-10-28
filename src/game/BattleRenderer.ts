import { enemySprites } from '../art/enemies';
import { PAL } from '../art/palette';
import { drawAnchored, type Sprite } from '../art/sprite';
import { renderMapBackground, renderMapForeground, TILE } from '../art/terrain';
import { towerSprites } from '../art/towers';
import { drawText } from '../core/font';
import type { MapDef } from '../data/types';
import type { Battle } from './Battle';
import type { Enemy, Projectile, Tower } from './entities';
import { towerStats } from './entities';

const mapCache = new Map<string, { bg: Sprite; fg: Sprite }>();

export function mapLayers(map: MapDef): { bg: Sprite; fg: Sprite } {
  let layers = mapCache.get(map.id);
  if (!layers) {
    layers = { bg: renderMapBackground(map), fg: renderMapForeground(map) };
    mapCache.set(map.id, layers);
  }
  return layers;
}

export interface RenderOptions {
  selectedSpot: number | null;
  /** Reichweite, die am ausgewählten Bauplatz angezeigt wird */
  previewRange: number | null;
  time: number;
}

function ellipseShadow(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number): void {
  ctx.fillStyle = 'rgba(10,20,10,0.35)';
  ctx.fillRect(Math.round(x - rx), Math.round(y), rx * 2, 2);
  ctx.fillRect(Math.round(x - rx + 1), Math.round(y - 1), rx * 2 - 2, 1);
  ctx.fillRect(Math.round(x - rx + 1), Math.round(y + 2), rx * 2 - 2, 1);
}

export function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy): void {
  const sprites = enemySprites(e.def.id);
  const frameCount = sprites.normal[0].length;
  const frame = Math.floor(e.animTime * sprites.fps) % frameCount;
  const dir = e.facingLeft ? 1 : 0;
  const set = e.flashTime > 0 ? sprites.flash : e.slowTime > 0 ? sprites.frost : sprites.normal;
  const s = set[dir][frame];
  const bob = frame === 1 ? -1 : 0;
  ellipseShadow(ctx, e.x, e.y + 4, Math.max(3, Math.floor(s.width / 3)));
  drawAnchored(ctx, s, e.x, e.y + 6 + bob);
}

function drawTower(ctx: CanvasRenderingContext2D, t: Tower, time: number): void {
  const sprites = towerSprites(t.def.id);
  const s = sprites.levels[t.level];
  const squash = t.recoil > 0.08 ? 1 : 0;
  drawAnchored(ctx, s, t.x, t.y + 6 + squash);
  if (sprites.glow) {
    const pulse = 0.25 + Math.sin(time * 4 + t.spot) * 0.1 + (t.recoil > 0 ? 0.3 : 0);
    const gx = Math.round(t.x + sprites.muzzle[0]);
    const gy = Math.round(t.y + 6 + sprites.muzzle[1]);
    ctx.fillStyle = `${sprites.glow}${pulse.toFixed(2)})`;
    ctx.fillRect(gx - 4, gy - 3, 8, 6);
    ctx.fillRect(gx - 3, gy - 4, 6, 8);
  }
  // Stufen-Markierung
  ctx.fillStyle = PAL.x;
  ctx.fillRect(Math.round(t.x - (t.level + 1) * 2), Math.round(t.y + 6), (t.level + 1) * 4 + 1, 3);
  ctx.fillStyle = PAL.Y;
  for (let i = 0; i <= t.level; i++) ctx.fillRect(Math.round(t.x - (t.level + 1) * 2 + 1 + i * 4), Math.round(t.y + 7), 3, 1);
}

function drawProjectile(ctx: CanvasRenderingContext2D, p: Projectile): void {
  const x = Math.round(p.x);
  const y = Math.round(p.y);
  switch (p.kind) {
    case 'arrow': {
      const dx = p.tx - p.x;
      const dy = p.ty - p.y;
      const d = Math.hypot(dx, dy) || 1;
      const ux = dx / d;
      const uy = dy / d;
      ctx.fillStyle = PAL.n;
      for (let i = 1; i < 5; i++) ctx.fillRect(Math.round(p.x - ux * i), Math.round(p.y - uy * i), 1, 1);
      ctx.fillStyle = PAL.z;
      ctx.fillRect(x, y, 1, 1);
      ctx.fillStyle = PAL.R;
      ctx.fillRect(Math.round(p.x - ux * 5), Math.round(p.y - uy * 5), 1, 1);
      break;
    }
    case 'stone': {
      const h = Math.sin(p.progress * Math.PI) * Math.min(26, p.totalDist * 0.5);
      ctx.fillStyle = 'rgba(10,20,10,0.35)';
      ctx.fillRect(x - 1, y + 3, 3, 1);
      const sy = Math.round(p.y - h);
      ctx.fillStyle = PAL.x;
      ctx.fillRect(x - 2, sy - 1, 5, 3);
      ctx.fillRect(x - 1, sy - 2, 3, 5);
      ctx.fillStyle = PAL.S;
      ctx.fillRect(x - 1, sy - 1, 3, 3);
      ctx.fillStyle = PAL.l;
      ctx.fillRect(x - 1, sy - 1, 1, 1);
      break;
    }
    case 'fireball':
      ctx.fillStyle = PAL.r;
      ctx.fillRect(x - 2, y - 1, 5, 3);
      ctx.fillRect(x - 1, y - 2, 3, 5);
      ctx.fillStyle = PAL.f;
      ctx.fillRect(x - 1, y - 1, 3, 3);
      ctx.fillStyle = PAL.F;
      ctx.fillRect(x, y, 1, 1);
      break;
    case 'frostbolt':
      ctx.fillStyle = PAL.j;
      ctx.fillRect(x - 2, y, 5, 1);
      ctx.fillRect(x, y - 2, 1, 5);
      ctx.fillStyle = PAL.I;
      ctx.fillRect(x - 1, y - 1, 3, 3);
      ctx.fillStyle = PAL.z;
      ctx.fillRect(x, y, 1, 1);
      break;
  }
}

function drawRange(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, time: number): void {
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  // gepunkteter Rand
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  const steps = Math.floor(r * 0.8);
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2 + time * 0.3;
    ctx.fillRect(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r), 1, 1);
  }
}

function drawSpotMarker(ctx: CanvasRenderingContext2D, x: number, y: number, time: number): void {
  const blink = Math.floor(time * 4) % 2 === 0;
  ctx.fillStyle = blink ? PAL.Y : PAL.z;
  const l = x - 8;
  const t = y - 6;
  const corners: [number, number, number, number][] = [
    [l, t, 4, 1], [l, t, 1, 4],
    [l + 12, t, 4, 1], [l + 15, t, 1, 4],
    [l, t + 13, 4, 1], [l, t + 10, 1, 4],
    [l + 12, t + 13, 4, 1], [l + 15, t + 10, 1, 4],
  ];
  for (const [a, b, w, h] of corners) ctx.fillRect(a, b, w, h);
}

function hpBar(ctx: CanvasRenderingContext2D, e: Enemy): void {
  if (e.hp >= e.maxHp) return;
  const w = 12;
  const x = Math.round(e.x - w / 2);
  const y = Math.round(e.y + 6 - e.def.barOffset - 4);
  const f = Math.max(0, e.hp / e.maxHp);
  ctx.fillStyle = PAL.x;
  ctx.fillRect(x - 1, y - 1, w + 2, 4);
  ctx.fillStyle = '#5a1a1a';
  ctx.fillRect(x, y, w, 2);
  ctx.fillStyle = f > 0.5 ? '#78d048' : f > 0.25 ? '#f0c040' : '#e04838';
  ctx.fillRect(x, y, Math.max(1, Math.round(w * f)), 2);
}

/** Zeichnet das Spielfeld (ohne HUD) an der aktuellen Transformationsposition. */
export function renderBattle(ctx: CanvasRenderingContext2D, battle: Battle, opts: RenderOptions): void {
  const { bg, fg } = mapLayers(battle.map);
  ctx.drawImage(bg, 0, 0);

  if (opts.selectedSpot !== null) {
    const spot = battle.spots[opts.selectedSpot];
    if (spot) {
      const range = spot.tower ? towerStats(spot.tower).range : opts.previewRange;
      if (range) drawRange(ctx, spot.x, spot.y - 4, range, opts.time);
      if (!spot.tower) drawSpotMarker(ctx, spot.x, spot.y + 1, opts.time);
    }
  }

  // Türme und Gegner nach Y sortiert zeichnen
  const drawables: { y: number; draw: () => void }[] = [];
  for (const t of battle.towers) drawables.push({ y: t.y + 6, draw: () => drawTower(ctx, t, opts.time) });
  for (const e of battle.enemies) drawables.push({ y: e.y + 6, draw: () => drawEnemy(ctx, e) });
  drawables.sort((a, b) => a.y - b.y);
  for (const d of drawables) d.draw();

  ctx.drawImage(fg, 0, 0);

  for (const p of battle.projectiles) drawProjectile(ctx, p);
  for (const e of battle.enemies) hpBar(ctx, e);

  for (const p of battle.particles) {
    ctx.globalAlpha = Math.min(1, p.life / (p.maxLife * 0.5));
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
  }
  ctx.globalAlpha = 1;
  for (const t of battle.texts) {
    ctx.globalAlpha = Math.min(1, t.life * 2);
    drawText(ctx, t.text, t.x, t.y, { color: t.color, align: 'center' });
  }
  ctx.globalAlpha = 1;
}

export const MAP_PIXEL_HEIGHT = (map: MapDef) => map.tiles.length * TILE;
