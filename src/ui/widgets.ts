import { drawText, textWidth } from '../core/font';
import { UI } from '../art/palette';
import type { Sprite } from '../art/sprite';

export type ButtonColor = 'green' | 'red' | 'blue' | 'wood' | 'gold';

const COLORS: Record<ButtonColor | 'disabled', [string, string, string]> = {
  // [dunkel, mittel, hell]
  green: ['#1e5428', '#3a8a3a', '#6ac050'],
  red: ['#6a1818', '#b03028', '#e06048'],
  blue: ['#183068', '#2a5aa8', '#5a8ae0'],
  wood: ['#2e1c12', '#7a4a24', '#a8703a'],
  gold: ['#7a5010', '#c08a20', '#f0c040'],
  disabled: ['#28242c', '#4a464e', '#626068'],
};

/** Holzrahmen-Panel im Fantasy-Stil */
export function drawPanel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.fillStyle = UI.outline;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = UI.trim;
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
  ctx.fillStyle = UI.woodDark;
  ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
  ctx.fillStyle = UI.wood;
  ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
  // Holzmaserung
  ctx.fillStyle = '#42281a';
  for (let yy = y + 6; yy < y + h - 4; yy += 5) ctx.fillRect(x + 3, yy, w - 6, 1);
  // Nieten
  ctx.fillStyle = UI.trimLight;
  for (const [cx, cy] of [[x + 1, y + 1], [x + w - 3, y + 1], [x + 1, y + h - 3], [x + w - 3, y + h - 3]]) {
    ctx.fillRect(cx, cy, 2, 2);
  }
}

/** Halbtransparente Abdunklung über dem ganzen Bild */
export function drawShade(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = UI.shade;
  ctx.fillRect(0, 0, w, h);
}

export interface ButtonSpec {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  icon?: Sprite;
  color?: ButtonColor;
  enabled?: boolean;
  selected?: boolean;
  onTap: () => void;
}

/**
 * Sammelt die in einem Frame gezeichneten Buttons, damit Taps danach
 * zugeordnet werden können (Immediate-Mode-UI).
 */
export class ButtonLayer {
  private buttons: ButtonSpec[] = [];
  private pressed: { spec: ButtonSpec; time: number } | null = null;

  begin(): void {
    this.buttons = [];
  }

  update(dt: number): void {
    if (this.pressed) {
      this.pressed.time -= dt;
      if (this.pressed.time <= 0) this.pressed = null;
    }
  }

  button(ctx: CanvasRenderingContext2D, b: ButtonSpec): void {
    this.buttons.push(b);
    const enabled = b.enabled !== false;
    const [dark, mid, light] = COLORS[enabled ? (b.color ?? 'wood') : 'disabled'];
    const isPressed =
      this.pressed !== null && this.pressed.spec.x === b.x && this.pressed.spec.y === b.y && this.pressed.spec.w === b.w;
    const oy = isPressed ? 1 : 0;
    ctx.fillStyle = UI.outline;
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = dark;
    ctx.fillRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
    ctx.fillStyle = mid;
    ctx.fillRect(b.x + 1, b.y + 1 + oy, b.w - 2, b.h - 3);
    ctx.fillStyle = light;
    ctx.fillRect(b.x + 2, b.y + 1 + oy, b.w - 4, 1);
    if (b.selected) {
      ctx.fillStyle = UI.gold;
      ctx.fillRect(b.x, b.y, b.w, 1);
      ctx.fillRect(b.x, b.y + b.h - 1, b.w, 1);
      ctx.fillRect(b.x, b.y, 1, b.h);
      ctx.fillRect(b.x + b.w - 1, b.y, 1, b.h);
    }
    const color = enabled ? UI.text : '#9a96a0';
    if (b.icon && b.label) {
      const iw = b.icon.width;
      const tw = textWidth(b.label);
      const sx = Math.round(b.x + (b.w - iw - 3 - tw) / 2);
      ctx.drawImage(b.icon, sx, Math.round(b.y + (b.h - b.icon.height) / 2) + oy);
      drawText(ctx, b.label, sx + iw + 3, Math.round(b.y + (b.h - 7) / 2) + oy, { color });
    } else if (b.icon) {
      ctx.drawImage(b.icon, Math.round(b.x + (b.w - b.icon.width) / 2), Math.round(b.y + (b.h - b.icon.height) / 2) + oy);
    } else if (b.label) {
      drawText(ctx, b.label, b.x + b.w / 2, Math.round(b.y + (b.h - 7) / 2) + oy, { color, align: 'center' });
    }
  }

  /** Gibt true zurück, wenn ein Button getroffen wurde. */
  tap(x: number, y: number): boolean {
    for (let i = this.buttons.length - 1; i >= 0; i--) {
      const b = this.buttons[i];
      // etwas großzügigere Trefferfläche für Finger
      if (x >= b.x - 2 && x < b.x + b.w + 2 && y >= b.y - 2 && y < b.y + b.h + 2) {
        if (b.enabled === false) return true;
        this.pressed = { spec: b, time: 0.12 };
        b.onTap();
        return true;
      }
    }
    return false;
  }
}
