import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.js'],
    include: ['src/**/*.{test,spec}.js'],
    pool: 'threads',
    singleThread: true, // Prevent multiple MongoDB instances
    testTimeout: 30000, // MongoDB operations can be slow first time
  },
});
