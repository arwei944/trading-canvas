import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
  },
  resolve: {
    alias: {
      '@trading.canvas/core': path.resolve(__dirname, 'packages/core/src'),
      '@trading.canvas/hooks': path.resolve(__dirname, 'packages/hooks/src'),
    },
  },
});
