/**
 * Eigene 5x7-Bitmap-Schrift (nur Großbuchstaben, inkl. Umlaute) im SNES-Stil.
 * Texte werden pro Farbe einmal gerendert und zwischengespeichert.
 */
const GLYPHS: Record<string, string[]> = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.####'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['###', '.#.', '.#.', '.#.', '.#.', '.#.', '###'],
  J: ['..###', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  N: ['#...#', '#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '#.#.#', '.#.#.'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  'Ä': ['#...#', '.###.', '#...#', '#...#', '#####', '#...#', '#...#'],
  'Ö': ['#...#', '.###.', '#...#', '#...#', '#...#', '#...#', '.###.'],
  'Ü': ['#...#', '.....', '#...#', '#...#', '#...#', '#...#', '.###.'],
  '0': ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  '1': ['.#.', '##.', '.#.', '.#.', '.#.', '.#.', '###'],
  '2': ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  '3': ['#####', '...#.', '..#..', '...#.', '....#', '#...#', '.###.'],
  '4': ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  '5': ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  '6': ['..##.', '.#...', '#....', '####.', '#...#', '#...#', '.###.'],
  '7': ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  '8': ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  '9': ['.###.', '#...#', '#...#', '.####', '....#', '...#.', '.##..'],
  ' ': ['...', '...', '...', '...', '...', '...', '...'],
  '.': ['.', '.', '.', '.', '.', '.', '#'],
  ',': ['..', '..', '..', '..', '.#', '.#', '#.'],
  ':': ['.', '#', '.', '.', '.', '#', '.'],
  '!': ['#', '#', '#', '#', '#', '.', '#'],
  '?': ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..'],
  '-': ['...', '...', '...', '###', '...', '...', '...'],
  '+': ['.....', '..#..', '..#..', '#####', '..#..', '..#..', '.....'],
  '/': ['....#', '....#', '...#.', '..#..', '.#...', '#....', '#....'],
  '%': ['##..#', '##..#', '...#.', '..#..', '.#...', '#..##', '#..##'],
  '(': ['.#', '#.', '#.', '#.', '#.', '#.', '.#'],
  ')': ['#.', '.#', '.#', '.#', '.#', '.#', '#.'],
  "'": ['#', '#', '.', '.', '.', '.', '.'],
  'x': ['.....', '.....', '#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
  '>': ['#...', '.#..', '..#.', '...#', '..#.', '.#..', '#...'],
  '<': ['...#', '..#.', '.#..', '#...', '.#..', '..#.', '...#'],
};

export const FONT_HEIGHT = 7;

function normalize(text: string): string {
  return text.toUpperCase().replace(/ß/g, 'SS').replace(/×/g, 'x');
}

function glyph(ch: string): string[] {
  return GLYPHS[ch] ?? GLYPHS['?'];
}

/** Breite eines Textes in Pixeln (Skalierung 1). */
export function textWidth(text: string): number {
  const t = normalize(text);
  let w = 0;
  for (const ch of t) w += glyph(ch)[0].length + 1;
  return Math.max(0, w - 1);
}

const cache = new Map<string, HTMLCanvasElement>();

function renderText(text: string, color: string, shadow: string | null): HTMLCanvasElement {
  const key = `${text}|${color}|${shadow ?? ''}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const t = normalize(text);
  const w = textWidth(text) + 1;
  const c = document.createElement('canvas');
  c.width = Math.max(1, w);
  c.height = FONT_HEIGHT + 1;
  const g = c.getContext('2d')!;
  const pass = (col: string, ox: number, oy: number) => {
    g.fillStyle = col;
    let x = 0;
    for (const ch of t) {
      const rows = glyph(ch);
      for (let y = 0; y < rows.length; y++) {
        const row = rows[y];
        for (let i = 0; i < row.length; i++) if (row[i] === '#') g.fillRect(x + i + ox, y + oy, 1, 1);
      }
      x += rows[0].length + 1;
    }
  };
  if (shadow) pass(shadow, 1, 1);
  pass(color, 0, 0);
  if (cache.size > 400) cache.clear();
  cache.set(key, c);
  return c;
}

export type Align = 'left' | 'center' | 'right';

export interface TextOptions {
  color?: string;
  shadow?: string | null;
  align?: Align;
  scale?: number;
}

/** Text zeichnen; y ist die Oberkante. */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  opts: TextOptions = {},
): void {
  const scale = opts.scale ?? 1;
  const img = renderText(text, opts.color ?? '#f8f8f0', opts.shadow === undefined ? '#140e1c' : opts.shadow);
  const w = textWidth(text) * scale;
  let dx = x;
  if (opts.align === 'center') dx = x - w / 2;
  else if (opts.align === 'right') dx = x - w;
  ctx.drawImage(img, Math.round(dx), Math.round(y), img.width * scale, img.height * scale);
}

/** Text in Zeilen umbrechen, sodass jede Zeile höchstens maxWidth breit ist. */
export function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (textWidth(test) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}
