import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.e2e-spec.ts'],
    globals: true,
    root: './',
    alias: {
      '@': './src',
    },
  },

  plugins: [swc.vite()],

  resolve: {
    alias: {
      // Ensure Vitest correctly resolves TypeScript path aliases
      '@': './src',
    },
  },
});
