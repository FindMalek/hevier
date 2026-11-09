import { fileURLToPath } from 'node:url';
import { configDefaults, defineConfig } from 'vitest/config';

// Lets tests resolve the same `@/…` imports the app uses (tsconfig "paths").
// Coverage is configured once, in the repo root's vitest.config.mts.
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
  // .claude/ holds temporary copies of the project (git worktrees); never test those.
  test: {
    exclude: [...configDefaults.exclude, '.claude/**'],
    // Turbo runs the packages' checks side by side, so the heavy tests get less CPU.
    testTimeout: 15_000,
  },
});
