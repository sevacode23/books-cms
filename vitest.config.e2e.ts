import path from 'path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.e2e-spec.ts'],
    globals: true,
    root: './',
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  esbuild: {
    target: 'node22',
  },

  plugins: [swc.vite()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
