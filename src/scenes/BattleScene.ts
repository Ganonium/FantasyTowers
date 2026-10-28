import { enemySprites } from '../art/enemies';
import { icon } from '../art/icons';
import { UI } from '../art/palette';
import { drawCentered } from '../art/sprite';
import { towerSprites } from '../art/towers';
import { drawText, wrapText } from '../core/font';
import { loadSave, writeSave } from '../core/storage';
import { LEVELS } from '../data/levels';
import { TOWERS } from '../data/towers';
import type { LevelDef, TowerLevel } from '../data/types';
import { Battle, EARLY_CALL_BONUS } from '../game/Battle';
import { MAP_PIXEL_HEIGHT, renderBattle } from '../game/BattleRenderer';
import { t } from '../i18n';
import { ButtonLayer, drawPanel, drawShade } from '../ui/widgets';
import type { Scene, SceneHost } from './Scene';

const HUD_H = 20;
const STEP = 1 / 60;

function fmt(n: number): string {
  return (Math.round(n * 10) / 10).toString().replace('.', ',');
}

export class BattleScene implements Scene {
  private battle: Battle;
  private ui = new ButtonLayer();
  private selectedSpot: number | null = null;
  private pendingTower: string | null = null;
  private paused = false;
  private speed = 1;
  private time = 0;
  private endTimer = 0;
  private saved = false;
  private acc = 0;

  constructor(
    private readonly host: SceneHost,
    private readonly level: LevelDef,
    private readonly onExit: () => void,
  ) {
    this.battle = new Battle(level);
  }

  private get mapY(): number {
    return HUD_H;
  }

  private get panelY(): number {
    return this.mapY + MAP_PIXEL_HEIGHT(this.battle.map);
  }

  blur(): void {
    if (this.battle.state === 'running') this.paused = true;
  }

  update(dt: number): void {
    this.time += dt;
    this.ui.update(dt);
    if (this.paused) return;
    this.acc += dt * this.speed;
    while (this.acc >= STEP) {
      this.battle.update(STEP);
      this.acc -= STEP;
    }
    const b = this.battle;
    if (b.state === 'won' || b.state === 'lost') {
      this.endTimer += dt;
      this.selectedSpot = null;
      if (b.state === 'won' && !this.saved) {
        this.saved = true;
        const save = loadSave();
        save.stars[this.level.id] = Math.max(save.stars[this.level.id] ?? 0, b.stars());
        writeSave(save);
      }
    }
  }

  // ---------- Eingabe ----------

  tap(x: number, y: number): void {
    if (this.ui.tap(x, y)) return;
    if (this.paused || this.battle.state === 'won' || this.battle.state === 'lost') return;
    if (y >= this.mapY && y < this.panelY) this.tapMap(x, y - this.mapY);
  }

  private tapMap(x: number, y: number): void {
    let best = -1;
    let bestD = 13 * 13;
    this.battle.spots.forEach((s, i) => {
      // Türme ragen nach oben, deshalb Trefferzone etwas nach oben ziehen
      const cy = s.tower ? s.y - 5 : s.y;
      const d = (s.x - x) ** 2 + (cy - y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    if (best >= 0 && best !== this.selectedSpot) {
      this.selectedSpot = best;
      this.pendingTower = null;
    } else {
      this.selectedSpot = null;
      this.pendingTower = null;
    }
  }

  private restart(): void {
    this.battle = new Battle(this.level);
    this.selectedSpot = null;
    this.pendingTower = null;
    this.paused = false;
    this.endTimer = 0;
    this.saved = false;
    this.acc = 0;
  }

  // ---------- Darstellung ----------

  render(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    this.ui.begin();
    ctx.fillStyle = UI.woodDark;
    ctx.fillRect(0, 0, w, h);

    const spot = this.selectedSpot !== null ? this.battle.spots[this.selectedSpot] : null;
    ctx.save();
    ctx.translate(0, this.mapY);
    ctx.beginPath();
    ctx.rect(0, 0, w, this.panelY - this.mapY);
    ctx.clip();
    renderBattle(ctx, this.battle, {
      selectedSpot: this.selectedSpot,
      previewRange: spot && !spot.tower && this.pendingTower ? TOWERS[this.pendingTower].levels[0].range : null,
      time: this.time,
    });
    ctx.restore();

    this.renderHud(ctx, w);
    this.renderPanel(ctx, w, h);

    const b = this.battle;
    if ((b.state === 'won' || b.state === 'lost') && this.endTimer > 0.8) this.renderEnd(ctx, w, h);
    else if (this.paused) this.renderPause(ctx, w, h);
  }

  private renderHud(ctx: CanvasRenderingContext2D, w: number): void {
    const b = this.battle;
    ctx.fillStyle = UI.outline;
    ctx.fillRect(0, 0, w, HUD_H);
    ctx.fillStyle = UI.wood;
    ctx.fillRect(0, 0, w, HUD_H - 2);
    ctx.fillStyle = UI.trim;
    ctx.fillRect(0, HUD_H - 2, w, 1);
    ctx.fillStyle = UI.woodLight;
    ctx.fillRect(0, 0, w, 1);

    ctx.drawImage(icon('heart'), 3, 5);
    drawText(ctx, String(b.lives), 13, 6, { color: b.lives <= 5 ? UI.red : UI.text });
    ctx.drawImage(icon('coin'), 33, 6);
    drawText(ctx, String(b.gold), 41, 6, { color: UI.gold });
    ctx.drawImage(icon('sword'), 72, 5);
    drawText(ctx, t('hud.wave', { n: Math.max(1, b.wave), total: b.totalWaves }), 82, 6);

    this.ui.button(ctx, {
      x: 148, y: 2, w: 20, h: 15,
      label: `${this.speed}×`,
      color: this.speed > 1 ? 'gold' : 'wood',
      onTap: () => { this.speed = this.speed === 1 ? 2 : 1; },
    });
    this.ui.button(ctx, {
      x: 170, y: 2, w: 20, h: 15,
      icon: icon('pause'),
      color: 'wood',
      enabled: b.state !== 'won' && b.state !== 'lost',
      onTap: () => { this.paused = true; },
    });
  }

  private renderPanel(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const y = this.panelY;
    const ph = h - y;
    drawPanel(ctx, 0, y, w, ph);
    const spot = this.selectedSpot !== null ? this.battle.spots[this.selectedSpot] : null;
    if (spot?.tower) this.panelTower(ctx, w, y, ph);
    else if (spot) this.panelBuild(ctx, w, y, ph);
    else this.panelIdle(ctx, w, y, ph);
  }

  private panelIdle(ctx: CanvasRenderingContext2D, w: number, y: number, ph: number): void {
    const b = this.battle;
    const btnY = y + 8;
    if (b.wave < b.totalWaves) {
      const early = b.state === 'running';
      this.ui.button(ctx, {
        x: 16, y: btnY, w: w - 32, h: 20,
        label: early ? t('panel.nextWave', { bonus: EARLY_CALL_BONUS }) : t('panel.startWave', { n: b.wave + 1 }),
        icon: early ? icon('ff') : icon('play'),
        color: early ? 'blue' : 'green',
        enabled: b.canCallWave(),
        onTap: () => b.startNextWave(),
      });
      // Vorschau auf die nächste Welle
      const next = b.level.waves[b.wave];
      const counts = new Map<string, number>();
      for (const g of next.groups) counts.set(g.enemy, (counts.get(g.enemy) ?? 0) + g.count);
      let x = 12;
      const iy = btnY + 26;
      for (const [id, n] of counts) {
        const s = enemySprites(id).normal[0][0];
        ctx.drawImage(s, x, iy + 18 - s.height);
        drawText(ctx, `×${n}`, x + s.width + 1, iy + 11);
        x += s.width + 22;
      }
      if (ph > 86) drawText(ctx, t('panel.hintBuild'), w / 2, y + ph - 14, { color: UI.textDim, align: 'center' });
    } else {
      drawText(ctx, t('panel.lastWave'), w / 2, btnY + 6, { color: UI.gold, align: 'center' });
      drawText(ctx, t('panel.hintBuild'), w / 2, btnY + 20, { color: UI.textDim, align: 'center' });
    }
  }

  private closeButton(ctx: CanvasRenderingContext2D, w: number, y: number): void {
    this.ui.button(ctx, {
      x: w - 19, y: y + 4, w: 15, h: 13,
      icon: icon('close'),
      color: 'red',
      onTap: () => {
        this.selectedSpot = null;
        this.pendingTower = null;
      },
    });
  }

  private panelBuild(ctx: CanvasRenderingContext2D, w: number, y: number, ph: number): void {
    const b = this.battle;
    const pendingDef = this.pendingTower ? TOWERS[this.pendingTower] : null;
    const canBuild = pendingDef !== null && b.gold >= pendingDef.levels[0].cost;
    drawText(
      ctx,
      pendingDef ? (canBuild ? t('panel.tapAgain') : t('panel.tooExpensive')) : t('panel.build'),
      7, y + 7,
      { color: pendingDef ? (canBuild ? UI.green : UI.red) : UI.trimLight },
    );
    this.closeButton(ctx, w, y);
    const ids = b.towerIds;
    const cardW = 42;
    const gap = Math.floor((w - 12 - ids.length * cardW) / Math.max(1, ids.length - 1));
    const cardY = y + 20;
    ids.forEach((id, i) => {
      const def = TOWERS[id];
      const cost = def.levels[0].cost;
      const affordable = b.gold >= cost;
      const x = 6 + i * (cardW + gap);
      this.ui.button(ctx, {
        x, y: cardY, w: cardW, h: 40,
        color: this.pendingTower === id ? 'gold' : 'wood',
        selected: this.pendingTower === id,
        onTap: () => {
          if (this.pendingTower === id && affordable && this.selectedSpot !== null) {
            b.build(this.selectedSpot, id);
            this.pendingTower = null;
            this.selectedSpot = null;
          } else {
            this.pendingTower = id;
          }
        },
      });
      const s = towerSprites(id).levels[0];
      drawCentered(ctx, s, x + cardW / 2, cardY + 15);
      if (!affordable) {
        ctx.fillStyle = 'rgba(20,14,28,0.5)';
        ctx.fillRect(x + 1, cardY + 1, cardW - 2, 38);
      }
      ctx.drawImage(icon('coin'), x + 6, cardY + 31);
      drawText(ctx, String(cost), x + 14, cardY + 31, { color: affordable ? UI.gold : UI.red });
    });

    const infoY = cardY + 46;
    if (this.pendingTower) {
      const def = TOWERS[this.pendingTower];
      drawText(ctx, t(def.name), 7, infoY, { color: UI.trimLight });
      this.statsLine(ctx, def.levels[0], 7, infoY + 10);
      let ly = infoY + 21;
      for (const line of wrapText(t(def.desc), w - 14)) {
        if (ly + 7 > y + ph - 4) break;
        drawText(ctx, line, 7, ly, { color: UI.textDim });
        ly += 10;
      }
    }
  }

  private statsLine(ctx: CanvasRenderingContext2D, s: TowerLevel, x: number, y: number): void {
    const text = [
      t('stat.damage', { v: s.damage }),
      t('stat.range', { v: fmt(s.range / 16) }),
      t('stat.rate', { v: fmt(1 / s.cooldown) }),
    ].join('  ');
    drawText(ctx, text, x, y, { color: UI.text });
  }

  private panelTower(ctx: CanvasRenderingContext2D, w: number, y: number, ph: number): void {
    const b = this.battle;
    const tower = this.battle.spots[this.selectedSpot!].tower!;
    drawText(ctx, t(tower.def.name), 7, y + 7, { color: UI.trimLight });
    drawText(ctx, t('panel.level', { n: tower.level + 1 }), 130, y + 7, { color: UI.gold, align: 'right' });
    this.closeButton(ctx, w, y);
    const cur = tower.def.levels[tower.level];
    this.statsLine(ctx, cur, 7, y + 20);

    const cost = b.upgradeCost(tower);
    const next = cost !== null ? tower.def.levels[tower.level + 1] : null;
    if (next) {
      drawText(ctx, `> ${[
        t('stat.damage', { v: next.damage }),
        t('stat.range', { v: fmt(next.range / 16) }),
      ].join('  ')}`, 7, y + 30, { color: UI.green });
    }
    const btnY = y + 42;
    const bw = Math.floor((w - 18) / 2);
    this.ui.button(ctx, {
      x: 6, y: btnY, w: bw, h: 22,
      label: cost !== null ? t('panel.upgrade', { cost }) : t('panel.maxed'),
      icon: cost !== null ? icon('coin') : undefined,
      color: 'green',
      enabled: cost !== null && b.gold >= cost,
      onTap: () => b.upgrade(tower),
    });
    this.ui.button(ctx, {
      x: 12 + bw, y: btnY, w: bw, h: 22,
      label: t('panel.sell', { gold: b.sellValue(tower) }),
      color: 'red',
      onTap: () => {
        b.sell(tower);
        this.selectedSpot = null;
      },
    });
    let ly = btnY + 30;
    for (const line of wrapText(t(tower.def.desc), w - 14)) {
      if (ly + 7 > y + ph - 4) break;
      drawText(ctx, line, 7, ly, { color: UI.textDim });
      ly += 10;
    }
  }

  private renderPause(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    drawShade(ctx, w, h);
    const pw = 120;
    const ph = 104;
    const x = (w - pw) / 2;
    const y = Math.round((h - ph) / 2);
    drawPanel(ctx, x, y, pw, ph);
    drawText(ctx, t('pause.title'), w / 2, y + 10, { color: UI.trimLight, align: 'center', scale: 2 });
    this.ui.button(ctx, { x: x + 12, y: y + 32, w: pw - 24, h: 18, label: t('pause.resume'), color: 'green', onTap: () => { this.paused = false; } });
    this.ui.button(ctx, { x: x + 12, y: y + 54, w: pw - 24, h: 18, label: t('pause.restart'), color: 'wood', onTap: () => this.restart() });
    this.ui.button(ctx, { x: x + 12, y: y + 76, w: pw - 24, h: 18, label: t('pause.menu'), color: 'red', onTap: () => this.onExit() });
  }

  private renderEnd(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const b = this.battle;
    const won = b.state === 'won';
    drawShade(ctx, w, h);
    const pw = 150;
    const ph = 112;
    const x = (w - pw) / 2;
    const y = Math.round((h - ph) / 2);
    drawPanel(ctx, x, y, pw, ph);
    drawText(ctx, won ? t('end.victory') : t('end.defeat'), w / 2, y + 10, {
      color: won ? UI.gold : UI.red,
      align: 'center',
      scale: 2,
    });
    drawText(ctx, won ? t('end.victoryText') : t('end.defeatText'), w / 2, y + 32, { color: UI.text, align: 'center' });
    if (won) {
      const stars = b.stars();
      for (let i = 0; i < 3; i++) {
        const s = icon(i < stars ? 'star' : 'starEmpty');
        ctx.drawImage(s, w / 2 - 30 + i * 22, y + 44, s.width * 2, s.height * 2);
      }
    }
    const btnY = y + ph - 28;
    const idx = LEVELS.findIndex((l) => l.id === this.level.id);
    const nextLevel = won ? LEVELS[idx + 1] : undefined;
    this.ui.button(ctx, {
      x: x + 10, y: btnY, w: 62, h: 18,
      label: t('end.menu'), color: 'wood',
      onTap: () => this.onExit(),
    });
    this.ui.button(ctx, {
      x: x + pw - 72, y: btnY, w: 62, h: 18,
      label: nextLevel ? t('end.next') : t('end.retry'),
      color: 'green',
      onTap: () => {
        if (nextLevel) this.host.setScene(new BattleScene(this.host, nextLevel, this.onExit));
        else this.restart();
      },
    });
  }
}
