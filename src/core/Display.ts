/**
 * Pixel-perfekte Anzeige: Das Spiel wird in einen kleinen Puffer (logische
 * Auflösung) gezeichnet und dann ganzzahlig hochskaliert auf den Bildschirm
 * kopiert. Die Breite ist fix, die Höhe passt sich dem Seitenverhältnis an.
 */
export const LOGICAL_WIDTH = 192;
export const MIN_HEIGHT = 348;
export const MAX_HEIGHT = 440;

export class Display {
  readonly buffer: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  private readonly screenCtx: CanvasRenderingContext2D;
  width = LOGICAL_WIDTH;
  height = MIN_HEIGHT;
  /** CSS-Pixel pro logischem Pixel */
  cssScale = 1;
  private backingScale = 1;
  private resizeListeners: (() => void)[] = [];

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.screenCtx = canvas.getContext('2d')!;
    this.buffer = document.createElement('canvas');
    this.ctx = this.buffer.getContext('2d')!;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.visualViewport?.addEventListener('resize', () => this.resize());
  }

  onResize(fn: () => void): void {
    this.resizeListeners.push(fn);
  }

  private resize(): void {
    const vw = window.visualViewport?.width ?? window.innerWidth;
    const vh = window.visualViewport?.height ?? window.innerHeight;
    const wanted = Math.round((LOGICAL_WIDTH * vh) / vw);
    this.height = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, wanted));
    this.cssScale = Math.min(vw / LOGICAL_WIDTH, vh / this.height);

    this.buffer.width = LOGICAL_WIDTH;
    this.buffer.height = this.height;
    this.ctx.imageSmoothingEnabled = false;

    const dpr = window.devicePixelRatio || 1;
    this.backingScale = Math.max(1, Math.min(8, Math.ceil(this.cssScale * dpr)));
    this.canvas.width = LOGICAL_WIDTH * this.backingScale;
    this.canvas.height = this.height * this.backingScale;
    this.canvas.style.width = `${Math.floor(LOGICAL_WIDTH * this.cssScale)}px`;
    this.canvas.style.height = `${Math.floor(this.height * this.cssScale)}px`;
    this.screenCtx.imageSmoothingEnabled = false;

    for (const fn of this.resizeListeners) fn();
  }

  /** Puffer auf den sichtbaren Canvas übertragen. */
  present(): void {
    this.screenCtx.imageSmoothingEnabled = false;
    this.screenCtx.drawImage(
      this.buffer,
      0, 0, LOGICAL_WIDTH, this.height,
      0, 0, this.canvas.width, this.canvas.height,
    );
  }

  /** Bildschirmkoordinaten (clientX/Y) in logische Spielkoordinaten umrechnen. */
  toLogical(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * LOGICAL_WIDTH,
      y: ((clientY - rect.top) / rect.height) * this.height,
    };
  }
}
