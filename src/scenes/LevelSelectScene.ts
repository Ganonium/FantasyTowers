import { icon } from '../art/icons';
import { UI } from '../art/palette';
import { drawText } from '../core/font';
import { loadSave } from '../core/storage';
import { LEVELS } from '../data/levels';
import { t } from '../i18n';
import { ButtonLayer, drawPanel } from '../ui/widgets';
import { BattleScene } from './BattleScene';
import type { Scene, SceneHost } from './Scene';
import { TitleScene } from './TitleScene';

export class LevelSelectScene implements Scene {
  private ui = new ButtonLayer();
  private save = loadSave();

  constructor(private readonly host: SceneHost) {}

  update(dt: number): void {
    this.ui.update(dt);
  }

  render(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    this.ui.begin();
    ctx.fillStyle = UI.woodDark;
    ctx.fillRect(0, 0, w, h);
    drawPanel(ctx, 4, 4, w - 8, h - 8);
    drawText(ctx, t('select.title'), w / 2, 14, { color: UI.trimLight, align: 'center', scale: 2 });

    LEVELS.forEach((level, i) => {
      const unlocked = i === 0 || (this.save.stars[LEVELS[i - 1].id] ?? 0) > 0;
      const stars = this.save.stars[level.id] ?? 0;
      const y = 40 + i * 34;
      this.ui.button(ctx, {
        x: 14, y, w: w - 28, h: 28,
        color: unlocked ? 'wood' : 'wood',
        enabled: unlocked,
        onTap: () => this.host.setScene(
          new BattleScene(this.host, level, () => this.host.setScene(new LevelSelectScene(this.host))),
        ),
      });
      drawText(ctx, `${i + 1}`, 24, y + 10, { color: UI.gold, scale: 1 });
      drawText(ctx, unlocked ? t(level.name) : t('select.locked'), 36, y + 10, {
        color: unlocked ? UI.text : '#9a96a0',
      });
      if (unlocked) {
        for (let s = 0; s < 3; s++) ctx.drawImage(icon(s < stars ? 'star' : 'starEmpty'), w - 50 + s * 10, y + 10);
      } else {
        ctx.drawImage(icon('lock'), w - 32, y + 9);
      }
    });

    this.ui.button(ctx, {
      x: w / 2 - 40, y: h - 34, w: 80, h: 20,
      label: t('select.back'),
      color: 'red',
      onTap: () => this.host.setScene(new TitleScene(this.host)),
    });
  }

  tap(x: number, y: number): void {
    this.ui.tap(x, y);
  }
}
