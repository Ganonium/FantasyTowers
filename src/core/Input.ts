import type { Display } from './Display';

export type TapHandler = (x: number, y: number) => void;

/** Leitet Touch-/Maus-Taps in logischen Koordinaten an einen Handler weiter. */
export class Input {
  private handler: TapHandler | null = null;

  constructor(canvas: HTMLCanvasElement, display: Display) {
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (!e.isPrimary) return;
      const p = display.toLogical(e.clientX, e.clientY);
      this.handler?.(p.x, p.y);
    });
    // Kontextmenü / Doppeltipp-Zoom unterbinden
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('dblclick', (e) => e.preventDefault(), { passive: false });
    document.addEventListener('gesturestart', (e) => e.preventDefault());
  }

  setHandler(fn: TapHandler | null): void {
    this.handler = fn;
  }
}
