/* global process */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

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

// GitHub Pages serves project sites from /<repo>/, so hashed asset URLs must be
// prefixed with the repo path. The deploy workflow sets GH_PAGES=true; local dev
// and tests keep the root base so nothing else has to change.
const base = process.env.GH_PAGES ? '/gogo-arabic/' : '/';

export default defineConfig({
  base,
  plugins: [
    react({ jsxRuntime: 'automatic' }),
    validateDialoguePlugin(),
    process.env.ANALYZE === 'true' && visualizer({
      template: 'treemap',
      open: true,
      filename: 'dist/bundle-report.html',
      gzipSize: true,
      brotliSize: false,
    }),
  ].filter(Boolean),
  publicDir: 'public',
  // Force single instance of React across the bundle. Without dedupe, Vite's
  // optimizer can pre-bundle react and react-redux's nested context into
  // separate chunks; useContext then returns null and useSelector explodes
  // with "Cannot read properties of null (reading 'useContext')".
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-dom/client', 'react-redux'],
  },
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
          // Core A1-A2 vocabulary (~700KB) — loaded eagerly
          if (id.includes('src/data/vocabulary-final.json') ||
            id.includes('src/data/vocabularyAll.js') ||
            id.includes('src/data/vocabularyByLevel.js') ||
            id.includes('src/data/vocabulary.json')) {
            return 'vocab-core';
          }
          // Extended B1-B2 vocabulary (~1,000KB) — loaded lazily
          if (id.includes('src/data/vocabularyExpanded.js')) {
            return 'vocab-extended';
          }
          // NPC metadata (lightweight, ~48KB — always loaded)
          if (id.includes('src/data/npcs-meta.json')) {
            return 'npc-meta';
          }
          // NPC dialogue loader + story arcs + profession teaching
          if (id.includes('src/data/npcDialogueLoader.js') ||
            id.includes('src/data/npcStoryArcs.js') ||
            id.includes('src/data/npcProfessionTeaching.js')) {
            return 'npc-data';
          }
          // NPC dialogue files are lazy-loaded per zone — let Vite auto-split
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
          // Compiled ink dialogue files
          if (id.includes('src/data/ink/') && id.endsWith('.ink.json')) {
            return 'ink-dialogue';
          }
          // Skill/achievement/faction data
          if (id.includes('src/data/skillTrees.js') ||
            id.includes('src/data/achievements.js') ||
            id.includes('src/data/factions.js') ||
            id.includes('src/data/factionEvents.js')) {
            return 'skill-data';
          }
          // Poetry battle data (lazy-loaded poems + service)
          if (id.includes('src/data/poems') ||
            id.includes('src/components/Poetry/')) {
            return 'poetry-game';
          }

          // Calligraphy mini-game (lazy-loaded Phaser scene + reference paths)
          if (id.includes('src/game/scenes/CalligraphyScene') ||
            id.includes('src/data/calligraphyPaths')) {
            return 'calligraphy-game';
          }

          if (id.includes('node_modules')) {
            // inkjs dialogue runtime
            if (id.includes('node_modules/inkjs')) {
              return 'ink-vendor';
            }
            // Phaser library (~1.2MB)
            if (id.includes('node_modules/phaser')) {
              return 'phaser';
            }
            // FSRS spaced repetition library
            if (id.includes('node_modules/ts-fsrs')) {
              return 'fsrs-vendor';
            }
            // React + Redux + Router ecosystem. These packages are tightly
            // coupled and reference each other (and shared transitive deps like
            // react-is / use-sync-external-store) at module-init time. Splitting
            // them across separate chunks created a cross-chunk CIRCULAR import
            // between react-vendor and misc-vendor — React's export namespace was
            // half-initialised in one chunk while the other ran `nt.Activity=…`
            // against an undefined object, crashing the production build to a
            // blank screen. Keeping the whole ecosystem in ONE chunk lets Rollup
            // order intra-chunk init correctly. Leaf libs that only *consume*
            // React (recharts, posthog, etc.) stay in their own one-way chunks.
            if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-is') ||
              id.includes('node_modules/use-sync-external-store') ||
              id.includes('node_modules/framer-motion') ||
              id.includes('node_modules/redux') ||
              id.includes('node_modules/@reduxjs') ||
              id.includes('node_modules/react-redux') ||
              id.includes('node_modules/react-router')) {
              return 'react-vendor';
            }
            // PostHog product analytics SDK + React adapter — isolate so the
            // initial app chunk hash doesn't churn on SDK upgrades (RESEARCH Pitfall 2).
            if (id.includes('node_modules/posthog-js') ||
              id.includes('node_modules/@posthog/react')) {
              return 'posthog-vendor';
            }
            // Scheduler (shared by react and framer-motion)
            if (id.includes('node_modules/scheduler')) {
              return 'react-vendor';
            }
            // recharts + d3 sub-packages (~200KB)
            if (id.includes('node_modules/recharts') ||
                id.includes('node_modules/victory-vendor') ||
                id.includes('node_modules/d3-')) {
              return 'charts-vendor';
            }
            // All other node_modules fold into react-vendor. The heavy,
            // genuinely-independent libs (phaser, inkjs, ts-fsrs, recharts,
            // posthog) are already matched above into their own one-way chunks;
            // everything left is a shared utility that React/Redux pull in at
            // init time, so it must live alongside them to avoid re-introducing
            // the cross-chunk circular dependency.
            return 'react-vendor';
          }
        },
      },
    },
  },
});
