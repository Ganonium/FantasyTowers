export interface Scene {
  update(dt: number): void;
  render(ctx: CanvasRenderingContext2D, width: number, height: number): void;
  tap(x: number, y: number): void;
  /** Wird aufgerufen, wenn die Seite in den Hintergrund geht */
  blur?(): void;
}

export interface SceneHost {
  setScene(scene: Scene): void;
  readonly width: number;
  readonly height: number;
}
