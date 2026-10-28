import { PAL } from './palette';

export type Sprite = HTMLCanvasElement;

function canvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

/**
 * Sprite aus einer Zeichen-Zeichnung erzeugen. Mit `outline` bekommt das Sprite
 * automatisch eine 1px-Kontur (dafür wird es um 1px auf jeder Seite vergrößert).
 */
export function makeSprite(
  rows: string[],
  overrides: Record<string, string> = {},
  outline: string | null = PAL.x,
): Sprite {
  const pad = outline ? 1 : 0;
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  const c = canvas(w + pad * 2, h + pad * 2);
  const g = c.getContext('2d')!;
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      const col = overrides[ch] ?? PAL[ch];
      if (!col) continue;
      g.fillStyle = col;
      g.fillRect(x + pad, y + pad, 1, 1);
    }
  }
  if (outline) addOutline(c, outline);
  return c;
}

/** Fügt um alle deckenden Pixel eine Kontur hinzu (in-place). */
export function addOutline(c: HTMLCanvasElement, color: string): void {
  const g = c.getContext('2d')!;
  const { width: w, height: h } = c;
  const data = g.getImageData(0, 0, w, h).data;
  const solid = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < w && y < h && data[(y * w + x) * 4 + 3] > 0;
  g.fillStyle = color;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (solid(x, y)) continue;
      if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) g.fillRect(x, y, 1, 1);
    }
  }
}

/** Eingefärbte Kopie (z. B. weißes Aufblitzen bei Treffern, blau bei Frost). */
export function tinted(src: Sprite, color: string, alpha: number): Sprite {
  const c = canvas(src.width, src.height);
  const g = c.getContext('2d')!;
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'source-atop';
  g.globalAlpha = alpha;
  g.fillStyle = color;
  g.fillRect(0, 0, c.width, c.height);
  return c;
}

/** Horizontal gespiegelte Kopie. */
export function flipped(src: Sprite): Sprite {
  const c = canvas(src.width, src.height);
  const g = c.getContext('2d')!;
  g.translate(src.width, 0);
  g.scale(-1, 1);
  g.drawImage(src, 0, 0);
  return c;
}

/** Leeres Sprite, in das prozedural gezeichnet werden kann. */
export function blank(w: number, h: number): { c: Sprite; g: CanvasRenderingContext2D } {
  const c = canvas(w, h);
  return { c, g: c.getContext('2d')! };
}

/** Zeichnet ein Sprite so, dass (x, y) die Mitte der Unterkante ist. */
export function drawAnchored(ctx: CanvasRenderingContext2D, s: Sprite, x: number, y: number): void {
  ctx.drawImage(s, Math.round(x - s.width / 2), Math.round(y - s.height));
}

/** Zeichnet ein Sprite zentriert. */
export function drawCentered(ctx: CanvasRenderingContext2D, s: Sprite, x: number, y: number): void {
  ctx.drawImage(s, Math.round(x - s.width / 2), Math.round(y - s.height / 2));
}
