import { UI } from '../art/palette';
import { drawText } from '../core/font';
import { ENEMIES } from '../data/enemies';
import { LEVELS } from '../data/levels';
import { MAPS } from '../data/maps';
import type { Enemy } from '../game/entities';
import { drawEnemy, mapLayers } from '../game/BattleRenderer';
import { Path } from '../game/Path';
import { t } from '../i18n';
import { ButtonLayer } from '../ui/widgets';
import { LevelSelectScene } from './LevelSelectScene';
import type { Scene, SceneHost } from './Scene';

function requestFullscreen(): void {
  const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void };
  try {
    if (document.fullscreenElement || !matchMedia('(pointer: coarse)').matches) return;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else el.webkitRequestFullscreen?.();
  } catch {
    /* nicht unterstützt */
  }
}

/** Titelbild mit vorbeiziehender Goblin-Horde im Hintergrund. */
export class TitleScene implements Scene {
  private ui = new ButtonLayer();
  private time = 0;
  private walkers: Enemy[] = [];
  private path: Path;
  private spawnTimer = 0;
  private readonly map = MAPS[LEVELS[0].map];

  constructor(private readonly host: SceneHost) {
    this.path = new Path(this.map.paths[0]);
  }

  update(dt: number): void {
    this.time += dt;
    this.ui.update(dt);
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = 1.4 + Math.random() * 1.5;
      const ids = Object.keys(ENEMIES);
      const def = ENEMIES[ids[Math.floor(Math.random() * ids.length)]];
      this.walkers.push({
        def, path: this.path, dist: 0, offset: (Math.random() - 0.5) * 6, x: 0, y: 0,
        facingLeft: false, hp: 1, maxHp: 1, slowFactor: 1, slowTime: 0, burnDps: 0, burnTime: 0,
        flashTime: 0, animTime: Math.random(), alive: true,
      });
    }
    for (const e of this.walkers) {
      e.dist += e.def.speed * dt;
      e.animTime += dt;
      const p = this.path.at(e.dist);
      e.x = p.x - p.dy * e.offset;
      e.y = p.y + p.dx * e.offset;
      if (Math.abs(p.dx) > 0.5) e.facingLeft = p.dx < 0;
      if (e.dist >= this.path.length) e.alive = false;
    }
    this.walkers = this.walkers.filter((e) => e.alive);
  }

  render(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    this.ui.begin();
    ctx.fillStyle = UI.woodDark;
    ctx.fillRect(0, 0, w, h);
    const { bg, fg } = mapLayers(this.map);
    const oy = Math.round((h - bg.height) / 2);
    ctx.save();
    ctx.translate(0, oy);
    ctx.drawImage(bg, 0, 0);
    const sorted = [...this.walkers].sort((a, b) => a.y - b.y);
    for (const e of sorted) drawEnemy(ctx, e);
    ctx.drawImage(fg, 0, 0);
    ctx.restore();
    ctx.fillStyle = 'rgba(20,14,28,0.45)';
    ctx.fillRect(0, 0, w, h);

    // Titel
    const ty = Math.round(h * 0.18);
    const bob = Math.round(Math.sin(this.time * 2) * 2);
    ctx.fillStyle = 'rgba(20,14,28,0.7)';
    ctx.fillRect(0, ty - 10, w, 64);
    ctx.fillStyle = UI.trim;
    ctx.fillRect(0, ty - 10, w, 1);
    ctx.fillRect(0, ty + 53, w, 1);
    drawText(ctx, 'Fantasy', w / 2, ty + bob, { color: UI.trimLight, align: 'center', scale: 3 });
    drawText(ctx, 'Towers', w / 2, ty + 25 + bob, { color: UI.gold, align: 'center', scale: 3 });

    drawText(ctx, t('title.subtitle'), w / 2, ty + 70, { color: UI.text, align: 'center' });

    this.ui.button(ctx, {
      x: w / 2 - 50, y: Math.round(h * 0.62), w: 100, h: 24,
      label: t('title.play'),
      color: 'green',
      onTap: () => {
        requestFullscreen();
        this.host.setScene(new LevelSelectScene(this.host));
      },
    });
    drawText(ctx, `v${__APP_VERSION__}`, w - 4, h - 11, { color: UI.textDim, align: 'right' });
  }

  tap(x: number, y: number): void {
    this.ui.tap(x, y);
  }
}
