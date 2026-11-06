import { fileURLToPath } from 'node:url';
import { configDefaults, defineConfig } from 'vitest/config';

// Lets tests resolve the same `@/…` imports the app uses (tsconfig "paths").
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
  // .claude/ holds temporary copies of the project (git worktrees); never test those.
  test: {
    exclude: [...configDefaults.exclude, '.claude/**'],
    // `npm run test:coverage` (CI): coverage/lcov.info, read by Sonar.
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov'],
      reportsDirectory: 'coverage',
      include: ['**/*.{ts,tsx}'],
      exclude: ['**/*.test.ts', '**/*.d.ts', 'node_modules/**', 'scripts/local/**', '.expo/**', 'coverage/**', '**/*.config.*'],
    },
  },
});
