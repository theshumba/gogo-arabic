# Phase 103 Plan 01 — Bundle-Size Baseline

**Date:** 2026-05-29
**Baseline commit:** `f5b08d9` (before any Phase 103 dependency lands)
**Build command:** `vite build` (`npm run build`), built in 5.49s
**Purpose:** Pre-install reference so the `phaser3-rex-plugins` VirtualJoyStick install gate in
Plan 03 (and the bundle-size CI gate in Phase 104) has a number to compare against.

## Baseline totals

| Metric | Value |
|---|---|
| Total `dist/` | 66 MB (includes assets/audio/images) |
| Total JS (raw, all chunks) | **8.33 MB** |
| JS chunk count | 113 |
| Total CSS | 548.74 kB |

## Largest JS chunks (raw / gzip)

| Chunk | Raw | Gzip |
|---|---|---|
| poetry-game | 1,469.58 kB | 401.70 kB |
| phaser | 1,208.02 kB | 332.18 kB |
| GameLayout | 1,037.85 kB | 270.42 kB |
| vocab-extended | 917.23 kB | 166.06 kB |
| vocab-core | 788.28 kB | 77.65 kB |
| charts-vendor | 329.31 kB | 90.45 kB |
| react-vendor | 303.42 kB | 97.01 kB |
| grammar-data | 250.26 kB | 59.15 kB |
| posthog-vendor | 193.08 kB | 64.71 kB |

## Notes

- Several chunks exceed Vite's 500 kB warning threshold (poetry-game, phaser, GameLayout,
  vocab-*). Not addressed here — Phase 104 owns chunking/asset-pipeline work.
- **Plan 03 gate:** after installing `phaser3-rex-plugins` (VirtualJoyStick only), re-run
  `npm run build` and compare total JS against **8.33 MB**. The rex plugin should add only its
  VirtualJoyStick module via tree-shaking; flag if total JS grows by more than a few tens of kB.
