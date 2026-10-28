import { defineConfig } from 'vite';
import pkg from './package.json' with { type: 'json' };

// Relativer base-Pfad, damit das Spiel unter https://<user>.github.io/<repo>/ läuft.
export default defineConfig({
  base: './',
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  build: { target: 'es2022' },
});
