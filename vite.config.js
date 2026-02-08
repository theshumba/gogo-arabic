import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react({ jsxRuntime: 'automatic' })],
  publicDir: 'public',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Large vocabulary data file (~932KB JSON)
          if (id.includes('src/data/vocabulary-final.json') ||
              id.includes('src/data/vocabularyAll.js')) {
            return 'vocabulary-data';
          }
          // Large NPC data file (~220KB JSON)
          if (id.includes('src/data/npcs.json')) {
            return 'npc-data';
          }

          if (id.includes('node_modules')) {
            // Phaser library (~1.2MB)
            if (id.includes('node_modules/phaser')) {
              return 'phaser';
            }
            // FSRS spaced repetition library
            if (id.includes('node_modules/ts-fsrs')) {
              return 'fsrs-vendor';
            }
            // React ecosystem (~400KB) - check scheduler separately to avoid circular deps
            if (id.includes('node_modules/react/') ||
                id.includes('node_modules/react-dom') ||
                id.includes('node_modules/framer-motion')) {
              return 'react-vendor';
            }
            // Redux ecosystem (~200KB)
            if (id.includes('node_modules/redux') ||
                id.includes('node_modules/@reduxjs') ||
                id.includes('node_modules/react-redux')) {
              return 'redux-vendor';
            }
            // React Router (~100KB)
            if (id.includes('node_modules/react-router')) {
              return 'router-vendor';
            }
            // Scheduler (shared by react and framer-motion)
            if (id.includes('node_modules/scheduler')) {
              return 'react-vendor';
            }
            // All other node_modules
            return 'misc-vendor';
          }
        },
      },
    },
  },
});
