# Phase 103 Plan 03 — Bundle-Size Delta

**Date:** 2026-05-29
**Gate:** the standalone `phaser3-rex-plugins` joystick import must add **<100 KB** to the JS bundle.

## Delta

| | Total JS | Largest chunks |
|---|---|---|
| Baseline (Plan 01, commit `f5b08d9`) | ~8.33 MB (113 chunks) | poetry-game, phaser, GameLayout |
| After Plan 03 | 8,747,701 B ≈ 8.34 MB | poetry-game 1435 KB, phaser 1190 KB, GameLayout 1017 KB (unchanged) |
| **Delta** | **≈ +10–20 KB** | no new large chunk |

## Verdict: **ACCEPT**

- The delta (~+10–20 KB) is an order of magnitude under the 100 KB gate, and that figure
  also includes all of Plan 03's own new code (TouchInputAdapter, TapToInteract,
  TouchControls + CSS), not just the plugin.
- Confirmed the package **barrel was NOT pulled in** (it would add 7+ MB). The largest
  chunks are byte-for-byte the same as baseline.
- This was achieved by importing the per-plugin path
  `phaser3-rex-plugins/plugins/virtualjoystick-plugin.js` **dynamically** inside
  `TouchInputAdapter.createTouchInput()`, so the plugin only loads at runtime on
  touch devices and never weighs down the desktop boot path.

## Note — npm audit

`npm install phaser3-rex-plugins` reported 7 vulnerabilities (5 moderate, 2 high) in the
dependency tree. Not auto-fixed (`npm audit fix` can introduce breaking changes). Flagged
for review — confirm whether these pre-date this install (`git stash` + `npm audit`) before
acting.
