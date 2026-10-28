import { Display } from './core/Display';
import { Input } from './core/Input';
import type { Scene, SceneHost } from './scenes/Scene';
import { TitleScene } from './scenes/TitleScene';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const display = new Display(canvas);
const input = new Input(canvas, display);

class App implements SceneHost {
  private scene: Scene;

  constructor() {
    this.scene = new TitleScene(this);
    input.setHandler((x, y) => this.scene.tap(x, y));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.scene.blur?.();
    });
  }

  get width(): number {
    return display.width;
  }

  get height(): number {
    return display.height;
  }

  setScene(scene: Scene): void {
    this.scene = scene;
  }

  frame(dt: number): void {
    this.scene.update(dt);
    this.scene.render(display.ctx, display.width, display.height);
    display.present();
  }
}

const app = new App();
let last = performance.now();
function loop(now: number): void {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  app.frame(dt);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Für automatisierte Tests / Debugging
(window as unknown as { __app: App }).__app = app;
