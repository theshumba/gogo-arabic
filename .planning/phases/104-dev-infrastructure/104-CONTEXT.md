# Phase 104: Dev Infrastructure - Context

**Gathered:** 2026-05-26
**Status:** CONTEXT stub — NOT yet planned. Run `/gsd-plan-phase 104` when ready.
**Source:** Orchestrator-captured from v17.5 Platform Foundation milestone brief

<domain>
## Phase Boundary

Make the build smaller, faster, and friendlier for content iteration. Asset Pipeline v2 builds on the existing Phase 38 BootScene foundation with sprite-atlas packing, audio compression, and lazy-loading by zone. Content Hot Reload wires Vite HMR into the JSON content layer (dialogue, zones, vocab) so writers can edit `content/*.json` and see results without a full rebuild.

This is the third phase of v17.5 Platform Foundation. It is pure DX/infra — no gameplay changes, no learning loop changes, no curriculum changes.

</domain>

<decisions>
## Implementation Decisions (locked at stub time)

### Scope
- **In scope:**
  - **Asset Pipeline v2** on top of Phase 38:
    - Sprite atlas packing: pack the ~969 Kenmi sprites and tilesets into multi-page atlases. Use a deterministic packer so atlases are reproducible in CI.
    - Audio compression: convert WAV/uncompressed audio to OGG (primary) + MP3 (fallback). Re-encode existing assets only if size win > 30%.
    - Per-zone lazy loading: a manifest declares which atlases/audio each zone needs. BootScene loads only the global core; ZoneLoader loads the zone bundle on entry, releases on exit.
    - Bundle size budget: enforce a CI check on bundle size deltas (warn > +5%, fail > +15%).
  - **Content Hot Reload:**
    - Vite HMR boundary on `content/**/*.json` (dialogue trees, zone JSON, vocab packs).
    - On HMR event: re-validate JSON via existing Zod schemas, then hot-swap into game state without reload. If validation fails, surface the error in the dev overlay without crashing the game.
    - Apply to dev only (`import.meta.env.DEV`). Production loads remain unchanged.
- **Out of scope:**
  - Code-splitting React routes (worth doing but separate concern).
  - WebP/AVIF migration for background art (separate phase if telemetry shows a need).
  - Shader pre-compilation or instanced rendering (Phase 18 v2 territory).
  - Replacing Vite with another bundler.
  - Hot-reloading Phaser scenes themselves (full reload still required for scene logic changes — only content swaps).

### Hard Constraints
- Atlas packing must be deterministic — same inputs produce byte-identical atlases. Required for CI cache integrity.
- Lazy loading must NOT cause visible asset pop-in. Pre-fetch adjacent zones on hover/proximity.
- Hot reload must NEVER apply to production. Compile-time stripped.
- JSON validation on HMR must reuse the existing Zod schemas (e.g., `scripts/validate-vocab.mjs` patterns) — no parallel validation paths.
- The 2535+ existing tests must remain green. Asset path changes need a codemod across test fixtures, not piecemeal edits.
- Audio re-encoding must preserve perceptual fidelity (OGG q≥5 or equivalent bitrate).

### Depends On
- Phase 38 Asset Pipeline & BootScene — the foundation we extend.
- Phase 97 Visual Rebuild — stable sprite/tile usage so atlas packing has a fixed surface.
- Phase 98 Code Health — strongly prefer this completes first so we're not packing assets that get deleted in 98.

### Preserve
- Existing `public/assets/` directory layout for source files (atlases are derived artefacts written to `dist/` only).
- Phase 38's BootScene contract — extend, don't replace.
- Existing audio asset filenames where re-encoding isn't worthwhile.
- All Howler.js audio paths in code — pipeline produces files at the same logical paths.

### Requirements (to be defined during plan-phase)
- Preliminary: PIPE-01 (deterministic atlas packing), PIPE-02 (multi-page atlases for Kenmi + tilesets), PIPE-03 (OGG+MP3 fallback for audio), PIPE-04 (per-zone manifest), PIPE-05 (lazy load + pre-fetch on proximity), PIPE-06 (bundle size CI gate), HMR-01 (content JSON HMR boundary), HMR-02 (Zod re-validation on HMR), HMR-03 (dev-only, stripped in prod), HMR-04 (graceful error surface, no crash on bad JSON).

</decisions>

<canonical_refs>
## Canonical References

- `.planning/phases/38-asset-pipeline/` — existing pipeline plans + summaries
- `src/game/scenes/BootScene.js` — current boot/load logic
- `public/assets/` — source asset tree (Kenmi PNGs, tilesets, audio)
- `scripts/generate-kenmi-frame-tables.js` — existing asset-generation script pattern
- `scripts/validate-vocab.mjs` — Zod validation pattern to reuse for HMR
- `vite.config.js` — bundler config, HMR hooks
- `package.json` — `vite`, `phaser`, `howler` already installed

</canonical_refs>

<specifics>
## Specific Ideas
- Atlas packing: `free-tex-packer-core` (deterministic, multi-page support, JSON-Hash output that Phaser ingests natively).
- Audio: `ffmpeg` invoked from a `scripts/encode-audio.mjs` build step. Cache by source file hash so unchanged audio doesn't re-encode.
- Zone manifest: `content/zone-manifest.json` — `{ "zone-1-bazaar": { atlases: [...], audio: [...] } }`. Generated, not hand-edited.
- Pre-fetch heuristic: when player enters a zone, pre-fetch atlases for adjacent zones (graph from zone connection data).
- HMR boundary: a single `import.meta.hot.accept('./content/*.json', ...)` entry point that dispatches a Redux action `content/hotSwap` carrying the new payload.
- Bundle gate: GitHub Action diffs `stats.json` from `vite build` against base branch; comments on PR with size delta.

</specifics>

<deferred>
## Deferred Ideas
- WebP/AVIF for background art — wait for telemetry confirming load-time pain.
- Texture streaming / mipmap generation — unnecessary at our tile sizes.
- Hot reload of Phaser scene code (not just content) — possible but invasive; defer until devs ask.
- Asset CDN — premature, GitHub Pages / current hosting handles it.
- ESM-based runtime asset registry — overkill, JSON manifest is enough.
- AI-generated atlas variants for low-end mode — Phase 102 flag exists; revisit if perf telemetry demands.

</deferred>

---

*Phase: 104-dev-infrastructure*
*Context stubbed: 2026-05-26. Run `/gsd-plan-phase 104` to produce RESEARCH + PLAN + VALIDATION.*
*Depends on Phases 38, 97. Strongly prefers Phase 98 (Code Health) completes first to avoid packing soon-to-be-deleted assets.*
