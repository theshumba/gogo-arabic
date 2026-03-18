/* global process */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function validateDialoguePlugin() {
  return {
    name: 'validate-dialogue-data',
    async buildStart() {
      if (process.env.NODE_ENV !== 'production' && !process.argv.includes('build')) return;
      const { validateDialogueData } = await import('./src/data/dialogueSchema.js');
      const npcsPath = path.resolve(__dirname, 'src/data/npcs.json');
      const npcsData = JSON.parse(fs.readFileSync(npcsPath, 'utf-8'));
      const result = validateDialogueData(npcsData);
      if (!result.success) {
        throw new Error(`Dialogue data validation failed:\n${result.errors.join('\n')}`);
      }
      console.log('[validate-dialogue] NPC data validated successfully');
    },
  };
}

export default defineConfig({
  plugins: [react({ jsxRuntime: 'automatic' }), validateDialoguePlugin()],
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
            id.includes('src/data/vocabularyAll.js') ||
            id.includes('src/data/vocabularyExpanded.js')) {
            return 'vocabulary-data';
          }
          // Large NPC data file (~220KB JSON)
          if (id.includes('src/data/npcs.json')) {
            return 'npc-data';
          }
          // Quest data
          if (id.includes('src/data/quests.json')) {
            return 'quest-data';
          }
          // Grammar data
          if (id.includes('src/data/grammar.js') ||
            id.includes('src/data/grammarCombos.js')) {
            return 'grammar-data';
          }
          // Lore data
          if (id.includes('src/data/loreCodex.js')) {
            return 'lore-data';
          }
          // Skill/achievement/faction data
          if (id.includes('src/data/skillTrees.js') ||
            id.includes('src/data/achievements.js') ||
            id.includes('src/data/factions.js') ||
            id.includes('src/data/factionEvents.js')) {
            return 'skill-data';
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
