import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/test/**', 'src/data/**'],
      thresholds: {
        // Current baseline: 29% stmts, 75% branch, 55% funcs, 29% lines
        // Many components/hooks/utils untested — slices and systems are 90%+
        // TODO: raise to 80% after adding hook and component tests
        statements: 25,
        branches: 70,
        functions: 50,
        lines: 25,
      },
    },
  },
});
