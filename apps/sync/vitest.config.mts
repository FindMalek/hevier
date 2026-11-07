import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Turbo runs the packages' checks side by side, so the server tests get less CPU.
  test: { testTimeout: 15_000 },
});
