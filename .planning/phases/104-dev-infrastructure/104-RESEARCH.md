# Phase 104: Dev Infrastructure - Research

**Researched:** 2026-05-26
**Domain:** Build pipeline (sprite atlas packing + audio re-encoding + per-zone lazy loading + CI bundle gate) and dev-time content hot reload (Vite HMR for `content/**/*.json` with Zod re-validation)
**Confidence:** MEDIUM-HIGH (most stack choices verified against official docs; determinism of `free-tex-packer-core` only inferred from its `maxrects-packer` core, not proven by docs)

## Summary

Phase 104 has two distinct halves that share zero runtime code but share infrastructure: **Asset Pipeline v2** (build-time atlas packing, audio compression, per-zone lazy loading, CI bundle gate) and **Content Hot Reload** (dev-time Vite HMR on `content/*.json` with Zod validation). Both extend an already-shipped Phase 38 foundation — they do not replace it.

The foundation is in place: `KENMI_CATALOG` (969 entries) drives BootScene loading, `SHARED_ASSETS` / `ZONE_ASSET_MANIFESTS` already separate shared from per-zone assets via `loadZoneAssets()` in `ZoneTransition.js`, `npcDialogueLoader.js` already lazy-loads NPC dialogue JSON per zone with a `preloadAdjacentZones(currentZone, zoneGraph)` helper that just needs a graph fed to it, and `validateDialoguePlugin()` in `vite.config.js` already runs Zod validation at build time. Phase 104 wires up the missing pieces: atlas-packed Kenmi (instead of 969 individual PNGs), compressed audio with OGG+MP3, a generated `content/zone-manifest.json`, an extended `loadZoneAssets()` that releases textures on exit + pre-fetches adjacent zones, a CI bundle-size gate, and a single `import.meta.hot.accept` boundary that re-validates and dispatches a `content/hotSwap` Redux action.

**Primary recommendation:** Adopt `free-tex-packer-core` with the `Phaser3` exporter and `multiAtlas` loader (the project hint in CONTEXT.md is correct), but treat **determinism as a hard problem requiring explicit verification** — sort input filenames alphabetically before passing to `packAsync()`, pin every dependency (including transitive `maxrects-packer` and `jimp`), and run a `pack-twice-and-diff` CI step that fails if outputs differ. For audio, use system `ffmpeg` (already installed locally — version 8.0.1 with libmp3lame + libopus) with `-bitexact` for reproducible encoding, hashed by source-file content. For HMR, use a single top-level `import.meta.glob('/content/**/*.json', { eager: true })` import behind an `import.meta.hot.accept(deps, cb)` callback; this is the only Vite pattern that supports many JSON files under one HMR boundary.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Sprite atlas packing | Build-time Node script | CI (validates determinism) | Runs offline; output is a static artefact, never touched at runtime |
| Audio re-encoding | Build-time Node script | CI (caches encoded outputs) | Same — offline transformation, hash-keyed cache so unchanged audio doesn't re-encode |
| Zone manifest generation | Build-time Node script | — | Derived from `src/data/zones.js` (exits[].targetZone) + zone-asset mapping; written to `content/zone-manifest.json` for runtime read |
| Per-zone lazy loading | Phaser scene (runtime) | EventBus | Extends existing `loadZoneAssets()` and `ZoneTransition.transitionTo()` — both already exist; add release-on-exit + adjacent pre-fetch |
| Bundle-size gate | CI (GitHub Actions) | — | PR-level check; uses existing `rollup-plugin-visualizer` (already installed) or `vite-bundle-analyzer` stats.json |
| HMR boundary | Vite dev server | Redux store | Single accept callback in a dedicated dev-only module; dispatches `content/hotSwap` to Redux |
| HMR validation | Zod (dev-only path) | Dev overlay (DOM) | Reuses existing schemas; failure → React error overlay, no Redux dispatch |
| HMR production stripping | Vite/Rollup tree-shake | — | Guard all HMR code with `if (import.meta.hot)` so production tree-shakes it away |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `free-tex-packer-core` | 0.3.5 (latest, 2025-08-29) | Sprite atlas packing, Phaser3 exporter | Only actively-maintained pure-Node texture packer with native Phaser 3 exporter. MIT license. Used by indie game studios since 2016. `[VERIFIED: npm registry]` for existence + `[CITED: github.com/odrick/free-tex-packer-core README]` for exporter list. |
| `ffmpeg` (system binary) | 8.0.1 confirmed local; require ≥6.0 for CI | OGG (libvorbis or libopus) + MP3 (libmp3lame) batch encoding | De-facto audio toolchain. Has explicit `-bitexact` flag for reproducible output. `[VERIFIED: which ffmpeg + ffmpeg -version]` |
| `zod` | 4.3.6 (already installed) | HMR-side schema validation | Already the project's validator — `dialogueSchema.js`, `validateDialogueData()`. Reuse, do not add a second validator. `[VERIFIED: package.json]` |
| `vite` | 7.3.1 (already installed) | HMR API (`import.meta.hot`, `import.meta.glob`) | Already the project's bundler. `import.meta.hot` is the standard HMR primitive. `[VERIFIED: package.json + Vite docs]` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `rollup-plugin-visualizer` | 7.0.1 (already installed) | Bundle stats source for CI gate | Existing `build:analyze` script already produces `dist/bundle-report.html` and a `stats.json` companion. Extend to write `stats.json` always (not just on ANALYZE=true). `[VERIFIED: package.json + vite.config.js line 32]` |
| `wojtekmaj/vite-compare-bundle-size@v1` | v1 | GitHub Action that diffs base vs PR stats.json and comments on PR | Purpose-built for Vite. No threshold flags — must wrap with a custom step that reads its output and exits non-zero on >+15%. `[CITED: marketplace/actions/vite-compare-bundle-size]` |
| Node's `crypto.createHash('sha256')` | built-in | Source-file hash key for audio encode cache | Hash each input WAV/MP3/OGG → if hash matches `dist/audio-cache/<hash>.{ogg,mp3}`, skip ffmpeg. Zero new deps. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `free-tex-packer-core` | TexturePacker CLI (paid, $40) | Higher-quality packing + proven determinism docs, but adds a paid dep + non-Node binary in CI. CONTEXT.md locked free-tex-packer-core — keep. |
| `free-tex-packer-core` | `@kayahr/texturepacker` or `atlasify` (`soimy/atlasify`) | Atlasify uses the same `maxrects-packer` core but produces only its own format (not Phaser3). free-tex-packer-core's `Phaser3` exporter is the differentiator. |
| `wojtekmaj/vite-compare-bundle-size` | `relative-ci/bundle-stats` Github App | bundle-stats is more polished but requires GitHub App install + remote dashboard. wojtekmaj's action runs entirely in-CI with no external service — better fit for solo project. `[CITED: github.com/relative-ci/bundle-stats]` |
| `ffmpeg` for audio | `node-lame` + `ogg-vorbis-encoder` npm pkgs | Pure-JS encoders are 5-20x slower and have no `-bitexact` equivalent. ffmpeg is already on the dev machine and trivially available in GitHub Actions Ubuntu runners. |
| Redux `content/hotSwap` action | Direct module re-eval (Vite default) | Vite would tree-replace the JSON module, but consumers that destructure values at import time wouldn't see updates. Routing through Redux ensures every subscribed component re-renders. |

**Installation:**
```bash
# Asset Pipeline v2 build-time only (devDependencies):
npm install --save-dev free-tex-packer-core
# ffmpeg is a system dep — document in README + CI: apt-get install ffmpeg (Ubuntu) or brew install ffmpeg
# No runtime dependency additions for Asset Pipeline v2 — atlases are static dist/ artefacts loaded by existing Phaser loader.

# Content Hot Reload: ZERO new dependencies. Uses existing vite + zod.
```

**Version verification (run 2026-05-26):**
```bash
$ npm view free-tex-packer-core version
0.3.5
$ npm view free-tex-packer-core time.modified
2025-08-29T08:36:12.200Z   # ~9 months old, last actively maintained
$ npm view phaser version          # 4.1.0 latest; project on 3.90 (intentional)
$ npm view vite version            # 8.0.14 latest; project on 7.3.1 (no urgent upgrade need)
$ ffmpeg -version | head -1
ffmpeg version 8.0.1
```

## Package Legitimacy Audit

> slopcheck was not installable in this sandbox (pip not on PATH; pip3 lacks `--break-system-packages`). All packages below are tagged `[ASSUMED]` per the protocol — the planner **must** gate each install behind a `checkpoint:human-verify` task. Manual cross-checks were performed against npm registry, official repos, and download metrics in lieu of slopcheck.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| `free-tex-packer-core` | npm | ~8 years (since 2017, last update 2025-08-29) | ~5K/week | github.com/odrick/free-tex-packer-core (MIT) | UNRUN | Approved with verify checkpoint — official lib, ships from the same author as the popular free-tex-packer Electron app |
| `ffmpeg` (system) | — | 25+ years | — | git.ffmpeg.org | UNRUN | Approved — system binary, not npm. Project's existing AudioManager already implicitly depends on this for audio production. |
| Transitive: `jimp@1.6.1` | npm | 9 yrs | 4M+/week | github.com/jimp-dev/jimp | UNRUN | Approved — extremely widely used Node image lib |
| Transitive: `maxrects-packer@2.7.3` | npm | 6 yrs | 50K+/week | github.com/soimy/maxrects-packer | UNRUN | Approved — used by atlasify too |
| Transitive: `mustache@2.3.0` | npm | mature | very high | github.com/janl/mustache.js | UNRUN | Approved — pin to 2.3.0 (do not upgrade transitively without retest; templating engine is part of the exporter output) |

**Packages removed due to slopcheck [SLOP] verdict:** none (slopcheck was unrunnable; all packages tagged `[ASSUMED]`).
**Packages flagged as suspicious [SUS]:** none under manual review, but planner MUST insert a `checkpoint:human-verify` before `npm install free-tex-packer-core`.

**Postinstall script check (Node):**
```bash
npm view free-tex-packer-core scripts.postinstall   # → undefined (no postinstall)
npm view jimp scripts.postinstall                   # → undefined
npm view maxrects-packer scripts.postinstall        # → undefined
```
Clean — no risky postinstall scripts.

## Architecture Patterns

### System Architecture Diagram

```
                            BUILD TIME (Node scripts, run from package.json)
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                       │
│  public/assets/kenmi/*.png (969 PNGs)                                                │
│         │                                                                             │
│         ▼                                                                             │
│  ┌──────────────────────────┐    sorted input list                                   │
│  │ scripts/pack-atlases.mjs │ ──── free-tex-packer-core ────►  dist/assets/atlases/  │
│  │ (sorts input alphabetically, │                              ├── kenmi-0.png        │
│  │  splits by pack: base,    │                                 ├── kenmi-1.png        │
│  │  desert, dungeons, ...)   │                                 ├── kenmi-2.png        │
│  └──────────────────────────┘                                  └── kenmi.json (multi) │
│                                                                                       │
│  public/assets/audio/**/*.{wav,mp3,ogg}                                              │
│         │                                                                             │
│         ▼                                                                             │
│  ┌──────────────────────────┐  hash(file) → cache hit?                               │
│  │ scripts/encode-audio.mjs │ ──── ffmpeg -bitexact ────►  dist/assets/audio/        │
│  │ (skip if size win <30%)  │                              ├── *.ogg                  │
│  └──────────────────────────┘                              └── *.mp3 (fallback)      │
│                                                                                       │
│  src/data/zones.js (zone defs with exits[])                                          │
│         │                                                                             │
│         ▼                                                                             │
│  ┌──────────────────────────┐                                                        │
│  │ scripts/generate-zone-   │ ────► content/zone-manifest.json                       │
│  │ manifest.mjs              │      {                                                │
│  │ (reads zones, exits,     │        "oasis_village": {                              │
│  │  catalog → builds bundle)│           "atlases": ["kenmi-base", "kenmi-desert"],   │
│  └──────────────────────────┘           "audio": ["bgm-oasis", ...],                 │
│                                          "adjacent": ["ancient_library"]             │
│                                       }                                              │
└──────────────────────────────────────────────────────────────────────────────────────┘

                            RUNTIME (Phaser + React + Redux)
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                       │
│  BootScene.preload()                                                                  │
│     ├─ load fonts, panel textures, SHARED_ASSETS (already existed)                   │
│     ├─ this.load.multiatlas('kenmi-shared', '/assets/atlases/kenmi-shared.json')     │
│     └─ load zone-manifest.json                                                       │
│           │                                                                           │
│           ▼                                                                           │
│  ZoneTransition.transitionTo(zoneName)                                               │
│     ├─ fade out                                                                       │
│     ├─ ZoneLoader.loadZoneBundle(zoneName)   ← NEW: reads zone-manifest.json         │
│     │     ├─ multiatlas([atlases not yet loaded])                                    │
│     │     └─ Howl(audio) for any zone-specific tracks                                │
│     ├─ ZoneLoader.releasePreviousZone()      ← NEW: scene.textures.remove(...)       │
│     ├─ ZoneLoader.prefetchAdjacent(zoneName) ← NEW: fire-and-forget loads            │
│     └─ fade in                                                                        │
│                                                                                       │
│  Sprite consumers:  this.add.sprite(x, y, 'kenmi-shared', 'desert-person-1')         │
│                     (frame name = old catalog key, atlas key = stable prefix)        │
│                                                                                       │
└──────────────────────────────────────────────────────────────────────────────────────┘

                            DEV ONLY (Vite HMR — stripped in prod)
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  content/**/*.json (dialogue, zones, vocab packs)                                    │
│         │                                                                             │
│         ▼ (edit a file)                                                              │
│  Vite dev server fires HMR event                                                     │
│         │                                                                             │
│         ▼                                                                             │
│  src/dev/hmrContent.js (NEW)                                                         │
│     │                                                                                 │
│     ├─ if (!import.meta.hot) return;   ← strips entire module in prod                │
│     │                                                                                 │
│     ├─ const modules = import.meta.glob('/content/**/*.json', { eager: true })       │
│     ├─ import.meta.hot.accept(Object.keys(modules), (newModules) => {                │
│     │       const result = ContentSchema.safeParse(newModules);                      │
│     │       if (!result.success) {                                                   │
│     │           DevOverlay.showError(result.error);  ← user sees Zod issue           │
│     │           return;                              ← state NOT mutated             │
│     │       }                                                                         │
│     │       store.dispatch(contentSlice.actions.hotSwap(result.data));               │
│     │   })                                                                            │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure
```
gogo-arabic/
├── content/                              # NEW: writer-editable content
│   ├── zones/                            # extracted from src/data/zones.js (optional)
│   ├── dialogue/                         # extracted/symlinked from src/data/npc-dialogue/
│   ├── vocab/                            # extracted JSON slices
│   └── zone-manifest.json                # generated by scripts/generate-zone-manifest.mjs
├── scripts/
│   ├── pack-atlases.mjs                  # NEW: free-tex-packer-core driver
│   ├── encode-audio.mjs                  # NEW: ffmpeg batch encoder with content-hash cache
│   ├── generate-zone-manifest.mjs        # NEW: zones.js + catalog → zone-manifest.json
│   ├── verify-atlas-determinism.mjs      # NEW: pack twice, diff bytes, exit 1 on mismatch
│   ├── generate-kenmi-catalog.js         # EXISTS — extend to consume atlas frame names
│   └── validate-vocab.mjs                # EXISTS — pattern reused for HMR validator
├── src/
│   ├── dev/
│   │   └── hmrContent.js                 # NEW: single HMR boundary module
│   ├── game/
│   │   ├── scenes/BootScene.js           # MODIFIED: load multiatlas + zone-manifest
│   │   └── systems/
│   │       ├── ZoneTransition.js         # MODIFIED: invoke ZoneLoader.release/prefetch
│   │       └── ZoneLoader.js             # NEW: bundle load/release/prefetch (refactored from zoneAssetManifests.js)
│   ├── store/
│   │   └── slices/contentSlice.js        # NEW: { dialogue, vocab, zones } + hotSwap reducer
│   └── data/
│       └── zoneAssetManifests.js         # MODIFIED: reads zone-manifest.json (or generates from it)
├── .github/workflows/
│   ├── ci.yml                            # MODIFIED: add atlas determinism check + stats.json artefact
│   └── bundle-size.yml                   # NEW: vite-compare-bundle-size PR comment
├── dist/                                 # build output (in .gitignore)
│   └── assets/
│       ├── atlases/                      # generated
│       └── audio/                        # generated
└── vite.config.js                        # MODIFIED: always emit stats.json (not just ANALYZE=true)
```

### Pattern 1: Deterministic atlas packing
**What:** Sort inputs alphabetically, pin every dep including transitive, verify by packing twice and diffing.
**When to use:** Every atlas build. Required for CI cache integrity (CONTEXT.md hard constraint).
**Example:**
```js
// scripts/pack-atlases.mjs
// Source: github.com/odrick/free-tex-packer-core README + maxrects-packer hash docs
import { packAsync } from 'free-tex-packer-core';
import { readFile, readdir, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

async function packPack(packName, srcDir, outDir) {
  // 1. Collect all PNGs and SORT ALPHABETICALLY for stable input order
  const files = (await readdir(srcDir, { recursive: true }))
    .filter(f => f.endsWith('.png'))
    .sort();  // CRITICAL: stable input order

  // 2. Load with stable order; use file name as both `name` and (sha256) `hash`
  //    The `hash` property gives maxrects-packer "more stable packing results" per its docs.
  const images = await Promise.all(files.map(async (f) => {
    const contents = await readFile(path.join(srcDir, f));
    return {
      path: f,                                              // becomes frame name
      contents,
      hash: crypto.createHash('sha256').update(contents).digest('hex'),
    };
  }));

  // 3. Pack with PINNED options — determinism is sensitive to defaults
  const result = await packAsync(images, {
    textureName: `${packName}`,
    width: 2048,
    height: 2048,
    padding: 2,
    extrude: 0,
    allowRotation: false,         // rotation can reorder packing
    allowTrim: false,             // trim alters frame metadata
    detectIdentical: true,
    powerOfTwo: false,
    exporter: 'Phaser3',          // outputs multi-atlas JSON Phaser 3 ingests via load.multiatlas
    removeFileExtension: false,
    suffix: '-',
    suffixInitialValue: 0,
    packer: 'MaxRectsPacker',
    packerMethod: 'Smart',
  });

  // 4. Write outputs — also sort entries by filename for stable JSON
  await mkdir(outDir, { recursive: true });
  for (const file of result.sort((a, b) => a.name.localeCompare(b.name))) {
    await writeFile(path.join(outDir, file.name), file.buffer);
  }
}

await packPack('kenmi-base', 'public/assets/kenmi/base', 'dist/assets/atlases');
// ... one call per pack (base, desert, dungeons, ui, characters, ...)
```

### Pattern 2: Deterministic ffmpeg audio encoding with content-hash cache
**What:** Hash the source file; if cache hit, copy; else invoke ffmpeg with `-bitexact`.
**When to use:** Every audio asset in the build pipeline.
**Example:**
```js
// scripts/encode-audio.mjs
// Source: ffmpeg-codecs docs + bitexact issue (yt-dlp#2284)
import { readFile, writeFile, mkdir, copyFile, stat } from 'fs/promises';
import { spawnSync } from 'child_process';
import crypto from 'crypto';
import path from 'path';

const CACHE_DIR = '.cache/audio-encode';
const MIN_SIZE_WIN = 0.30;  // PIPE-03: re-encode only if >30% reduction

async function encodeOne(srcPath, outBase) {
  const src = await readFile(srcPath);
  const hash = crypto.createHash('sha256').update(src).digest('hex');
  const ogg = path.join(CACHE_DIR, `${hash}.ogg`);
  const mp3 = path.join(CACHE_DIR, `${hash}.mp3`);

  await mkdir(CACHE_DIR, { recursive: true });

  // Cache hit: copy from cache
  try { await stat(ogg); await copyFile(ogg, `${outBase}.ogg`); }
  catch {
    // Encode OGG (q5 ≈ 160 kbps VBR — preserves perceptual fidelity per CONTEXT.md)
    spawnSync('ffmpeg', [
      '-y', '-bitexact',                  // deterministic
      '-i', srcPath,
      '-c:a', 'libvorbis', '-qscale:a', '5',
      '-map_metadata', '-1',              // strip metadata for reproducibility
      ogg,
    ], { stdio: 'inherit' });
    await copyFile(ogg, `${outBase}.ogg`);
  }

  try { await stat(mp3); await copyFile(mp3, `${outBase}.mp3`); }
  catch {
    spawnSync('ffmpeg', [
      '-y', '-bitexact',
      '-i', srcPath,
      '-c:a', 'libmp3lame', '-qscale:a', '4',
      '-map_metadata', '-1',
      mp3,
    ], { stdio: 'inherit' });
    await copyFile(mp3, `${outBase}.mp3`);
  }

  // Check 30% size-win threshold — if not met, keep original instead
  const srcSize = src.length;
  const oggSize = (await stat(`${outBase}.ogg`)).size;
  if ((srcSize - oggSize) / srcSize < MIN_SIZE_WIN) {
    await copyFile(srcPath, `${outBase}${path.extname(srcPath)}`);
    // Optionally also delete encoded outputs if keeping original
  }
}
```

### Pattern 3: Vite HMR for many JSON files via `import.meta.glob` + `hot.accept(deps, cb)`
**What:** Single accept callback covers all matched JSON files; reuses Vite's glob to enumerate them.
**When to use:** The one and only HMR boundary in the project (per HMR-01: a single boundary).
**Example:**
```js
// src/dev/hmrContent.js
// Source: vite.dev/guide/api-hmr (accept(deps, cb) signature)
import { store } from '../store/index.js';
import { hotSwap } from '../store/slices/contentSlice.js';
import { ContentSchema } from '../data/contentSchema.js';   // composed Zod schema
import { showHmrError, clearHmrError } from '../utils/devOverlay.js';

// HMR-03: ENTIRE module behind import.meta.hot guard so prod tree-shakes it.
// Vite docs explicitly say: "guard all HMR API usage with a conditional block so
// that the code can be tree-shaken in production."
if (import.meta.hot) {
  // HMR-01: enumerate all content JSON files. eager:true so we have current values
  // immediately on first run (cf. lazy glob that requires awaiting).
  const modules = import.meta.glob('/content/**/*.json', { eager: true });

  // Accept updates for ALL of them with a single callback.
  // "accept(deps: readonly string[], cb: (mods: Array<ModuleNamespace>) => void)"
  // — cf. Vite HMR API docs.
  import.meta.hot.accept(Object.keys(modules), (newModules) => {
    // Compose into the shape Redux expects.
    const composed = {};
    newModules.forEach((mod, i) => {
      const key = Object.keys(modules)[i];
      composed[key] = mod?.default ?? mod;
    });

    // HMR-02: re-validate via existing Zod schema.
    const result = ContentSchema.safeParse(composed);
    if (!result.success) {
      // HMR-04: surface in dev overlay with file path + Zod issue. State NOT mutated.
      const issues = result.error.issues.map(i =>
        `[${i.path.join('.')}] ${i.message}`
      );
      showHmrError({ file: 'content/**/*.json', issues });
      return;
    }
    clearHmrError();
    store.dispatch(hotSwap(result.data));
  });
}
```

### Pattern 4: Zone manifest generation from zones.js
**What:** Walk `src/data/zones.js` (already imports cleanly as ESM), enumerate every zone's `exits[].targetZone` for adjacency, scan `objects[].key` + `interactables[].key` for `kenmi-*` keys → map to source pack → emit `zone-manifest.json`.
**When to use:** Build step; re-run whenever `zones.js` or `kenmiCatalog.js` changes.
**Example:**
```js
// scripts/generate-zone-manifest.mjs
import * as zonesModule from '../src/data/zones.js';
import { KENMI_CATALOG } from '../src/data/kenmiCatalog.js';
import { writeFile, mkdir } from 'fs/promises';

const zones = Object.values(zonesModule).filter(z => z?.id);
const keyToPack = new Map(KENMI_CATALOG.map(e => [e.key, e.path.split('/')[3]])); // /assets/kenmi/<pack>/...

const manifest = {};
for (const zone of zones) {
  const packs = new Set();
  for (const obj of [...(zone.objects ?? []), ...(zone.interactables ?? [])]) {
    if (obj.key?.startsWith('kenmi-')) {
      const pack = keyToPack.get(obj.key);
      if (pack) packs.add(`kenmi-${pack}`);
    }
  }
  manifest[zone.id] = {
    atlases: [...packs].sort(),                                   // deterministic
    audio: zone.bgm ? [zone.bgm] : [],                           // extend with ambient too
    adjacent: (zone.exits ?? []).map(e => e.targetZone).filter(Boolean).sort(),
  };
}

await mkdir('content', { recursive: true });
await writeFile(
  'content/zone-manifest.json',
  JSON.stringify(manifest, null, 2) + '\n',                       // trailing newline for git
);
```

### Anti-Patterns to Avoid
- **Loading the glob lazily for HMR:** `import.meta.glob('/content/**/*.json')` (no `eager:true`) returns Promise factories — `hot.accept` then receives empty modules on first run. Always use `eager:true` for the HMR boundary, or accept the asynchronous-resolve cost. `[CITED: vite hmr github discussion #7577]`
- **Not pinning ffmpeg version in CI:** Encoder optimisations change between ffmpeg minor versions. Lock to a specific apt-get version in CI YAML (or use a Docker image with pinned tag) — otherwise CI runs produce different bytes than local. `[CITED: ffmpeg docs — "Writing platform-, build-, and time-independent data ensures... reproducible"]`
- **Letting `free-tex-packer-core` decide input order:** Without explicit sort, output depends on `readdir` order (filesystem-dependent, varies across macOS/Linux). Always sort filenames alphabetically before passing to `packAsync()`. `[CITED: maxrects-packer addArray docs — "input is automatically sorted before adding"]` plus our own determinism requirement.
- **Re-using catalog keys verbatim as atlas frame names:** Atlas frame names are taken from input filenames. The existing keys (e.g., `kenmi-desert-npc-desert-person-1`) are different from filenames (e.g., `public/assets/kenmi/desert/npc/desert-person-1.png`). Resolve by either passing `path` field to `packAsync({ images: [{path: catalogKey, contents}]})`, or by storing a frame-name → catalog-key map in the manifest.
- **HMR-mutating Redux state directly inside the callback:** Use `store.dispatch(hotSwap(...))` so the Redux Toolkit immer reducer produces a new state slice and every subscribed component re-renders. Direct mutation breaks `react-redux`'s shallow-equal selector cache.
- **Adding a parallel Zod validator for HMR:** CONTEXT.md hard constraint — reuse `dialogueSchema.js`, `validateDialogueData()`, and the vocab schema patterns from `scripts/validate-vocab.mjs`. Compose them into one `ContentSchema` that mirrors the on-disk layout of `content/`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 2D rectangle packing | A from-scratch `MaxRectsBinPack` implementation | `free-tex-packer-core` (uses `maxrects-packer` internally) | Bin packing has 30+ years of literature; getting "good enough" is easy, getting it deterministic + tight is not. `maxrects-packer` is battle-tested. |
| Audio encoding | Pure-JS Vorbis/MP3 encoders | system `ffmpeg` invoked via `spawnSync` | JS encoders are 5-20x slower, have no `-bitexact`, often produce different output than reference encoders. ffmpeg has decades of deterministic-build hardening. |
| Bundle-size CI diff | A shell script that `du -sh dist/` and parses | `wojtekmaj/vite-compare-bundle-size@v1` | Action handles base-branch checkout, artefact upload, GH API token, and PR comment formatting. ~30 lines of YAML vs. ~150 of bash. |
| PR comment posting | Custom `gh api` calls | The same action's built-in comment formatter | Idempotent comment updates (replaces previous comment instead of stacking) are tedious to get right. |
| Multi-page atlas loading in Phaser | Iterate atlas pages manually with `this.load.atlas` per page | `this.load.multiatlas(key, jsonUrl)` | Phaser docs explicit: "If you are using Texture Packer and have enabled multi-atlas support, then please use the Phaser Multi Atlas loader instead of this one." `[CITED: Phaser docs]` |
| HMR plumbing | A custom websocket / polling layer | `import.meta.hot` (Vite's built-in HMR primitive) | Vite's HMR is already running in dev — no second connection needed. |
| Adjacency graph derivation | Hand-maintained `ZONE_ADJACENCY` dict | Generated from `zones.js exits[].targetZone` | Zones already define their connections via `exits` (verified in zones.js lines 211, 485, 735, 1019, 1232, 1464, 1730, 2015). Deriving from existing source means no drift. |

**Key insight:** Phase 104 is mostly composition of existing tools — Phaser already supports multi-page atlases (`load.multiatlas`), Vite already supports HMR (`import.meta.hot`), the project already has Zod schemas and lazy zone-asset loading. The phase's real engineering risk is **determinism** (atlas packing + audio encoding both have known non-determinism failure modes), not novel code.

## Runtime State Inventory

> This phase is **not** a rename/migration — it adds new build artefacts and a new dev-time HMR layer. The closest analogue to "runtime state" is what already-loaded Phaser textures exist when a zone change happens. Including a brief inventory for completeness; not all categories apply.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — Asset Pipeline v2 produces static `dist/` artefacts; HMR mutates only in-memory Redux state | None |
| Live service config | None — no external services touched | None |
| OS-registered state | None | None |
| Secrets/env vars | None — `GITHUB_TOKEN` for bundle-gate action is the GH default-injected token | None |
| Build artifacts | **`dist/` — old per-PNG outputs replaced by atlases.** Existing texture caches inside Phaser at runtime: `scene.textures.list` will contain ~969 individual `kenmi-*` keys before the change, and ~12 multi-atlas page textures after. Existing consumers reference `kenmi-*` keys directly (e.g., `kenmi-desert-props-palm-tree-1` in zones.js line 50). Plan must include a codemod: each `kenmi-*` key becomes a `(atlas, frame)` pair — e.g., `this.add.sprite(x, y, 'kenmi-desert', 'props-palm-tree-1')` instead of `this.add.sprite(x, y, 'kenmi-desert-props-palm-tree-1')`. **OR** keep keys stable by mapping each atlas frame to its full catalog key (passes `removeFileExtension:false, prependFolderName:false` + custom `name` field). The latter is less invasive — recommend it. | Decide key-stability strategy in PLAN. Recommended: preserve full catalog keys as frame names so no codemod needed. |

**Nothing found in category:** Stored data, live config, OS state, secrets — none applicable. State explicitly: **No production runtime state mutations.** Asset Pipeline v2 changes only build outputs; HMR changes only dev-time behavior.

## Common Pitfalls

### Pitfall 1: Non-deterministic atlas output (CI cache misses every run)
**What goes wrong:** CI runs produce different atlas PNG bytes than local builds (or different byte-output across two CI runs), so `dist/` caching is broken and bundle-size diffs are noisy.
**Why it happens:** Three independent sources: (a) `readdir` returns files in filesystem order — different on macOS vs. Linux; (b) `maxrects-packer` rotates rects by default and uses heuristics that depend on insertion order; (c) ffmpeg/libpng include encoder version + timestamp in output unless `-bitexact` is set.
**How to avoid:**
- Sort filenames alphabetically before passing to `packAsync()`.
- Set `allowRotation: false, allowTrim: false, detectIdentical: true` to lock behavior.
- Add a `hash` property (SHA256 of file contents) to each input — per `maxrects-packer` docs: "objects with a `hash` property will have more stable packing results."
- Add `scripts/verify-atlas-determinism.mjs` that packs twice in temp dirs and `diff -r`s the outputs. Run in CI before the actual build.
- For audio: always use `ffmpeg -bitexact -map_metadata -1`.
- Pin ffmpeg version in CI YAML (e.g., `sudo apt-get install ffmpeg=7:6.0-*ubuntu*`).
**Warning signs:** Bundle-gate action shows surprise +0.3% / -0.2% drift on PRs that didn't change assets. `dist/assets/atlases/*.json` shows changed `"mtime"` or different `"frames"` order between two clean builds.

### Pitfall 2: HMR not triggering because `import.meta.glob` is lazy by default
**What goes wrong:** Writer edits `content/dialogue/oasis.json`, sees the file change reflected in network tab, but the game state doesn't update.
**Why it happens:** `import.meta.glob('/content/**/*.json')` (no options) returns `{ '/content/...': () => Promise<Module> }`. Vite registers HMR dependencies based on what's actually imported. Without `eager: true`, the modules haven't been "imported" yet from Vite's perspective, so `hot.accept(Object.keys(modules), cb)` never fires.
**How to avoid:** Pass `{ eager: true }` to `import.meta.glob`. Yes, this loads everything eagerly in dev, which is fine — production doesn't run the HMR module at all.
**Warning signs:** Manual file edit shows no callback fire; `console.log` inside `hot.accept` never prints. `[CITED: github.com/vitejs/vite discussion #7577]`

### Pitfall 3: Production bundle still contains HMR code because of incomplete tree-shake
**What goes wrong:** Production build is unexpectedly larger; bundle analyzer shows `hmrContent.js` content + dev overlay code + sometimes the whole content schema.
**Why it happens:** Vite tree-shakes based on `import.meta.hot` being `undefined` in production — but only if the code is wrapped in `if (import.meta.hot) { ... }`. If you do `import.meta.hot?.accept(...)` (optional chaining), Rollup may not eliminate the surrounding bindings because the runtime check isn't a dead-code marker.
**How to avoid:**
- Wrap the **entire dev module** in `if (import.meta.hot)`, not just the accept call. Cf. the Vite docs verbatim: "guard all HMR API usage with a conditional block so that the code can be tree-shaken in production."
- Conditionally import the dev module: in your entry, do `if (import.meta.env.DEV) import('./dev/hmrContent.js')` — this gives both tree-shake and dynamic-import boundaries.
- Verify via `npm run build:analyze`: search the bundle report for `hmrContent` — should be absent.
**Warning signs:** Bundle-size CI gate fails on PR that "only adds dev tooling." `dist/assets/index-*.js` contains string `hmrContent` or `hotSwap`.

### Pitfall 4: Texture release on zone exit causes visible flicker mid-transition
**What goes wrong:** Player walks from oasis to library, sees a half-second flash of missing sprites before library assets load.
**Why it happens:** Releasing previous-zone textures (`scene.textures.remove(...)`) before new-zone textures are loaded leaves a window where sprites referenced from in-flight Phaser rendering have no texture.
**How to avoid:**
- Sequence: fade-out → load new → render new → release old → fade-in. Release AFTER new textures are in cache.
- Use `scene.textures.exists(key)` checks before remove (already done in `loadZoneAssets` for the load side — mirror on the release side).
- Don't release SHARED_ASSETS (player, NPC sprites, UI). Only release zone-bundle atlases.
**Warning signs:** Brief pink/grey rectangles or missing-texture markers visible during zone fades, especially on revisit.

### Pitfall 5: Adjacent-zone prefetch causes memory leak on rapid traversal
**What goes wrong:** Player explores adjacent → returns → explores another adjacent → memory grows linearly with zones visited.
**Why it happens:** Prefetch loads atlases for adjacent zones but `releasePreviousZone` only releases the most-recently-exited zone, not the prefetched-but-never-entered ones.
**How to avoid:**
- Track an LRU of zones with loaded atlases (cap at e.g. 3 — current + up to 2 adjacent).
- On entering a zone, mark it touched. On exit, demote previous to "prefetched". On next exit, evict the oldest prefetched.
- For mobile (Phase 103 territory) consider lowering cap to 2.
**Warning signs:** `performance.memory.usedJSHeapSize` (Chrome) grows monotonically over a 10-minute play session despite cycling through same 3 zones.

### Pitfall 6: `multiatlas` JSON path resolution
**What goes wrong:** `this.load.multiatlas('kenmi', '/assets/atlases/kenmi.json')` loads the JSON but fails to find the PNG pages.
**Why it happens:** Phaser resolves page image URLs relative to the JSON URL. If JSON is at `/assets/atlases/kenmi.json` and references `kenmi-0.png`, Phaser fetches `/assets/atlases/kenmi-0.png`. But if your output structure is `dist/assets/atlases/json/kenmi.json` and `dist/assets/atlases/png/kenmi-0.png`, the paths break.
**How to avoid:** Co-locate JSON and PNGs in the same output directory. Default `free-tex-packer-core` output does this — don't reorganize.
**Warning signs:** `loaderror` warnings for `/assets/atlases/<filename>.png` (the page files, not the JSON).

## Code Examples

Verified patterns from official sources:

### Single zone-bundle load with release-on-exit
```js
// src/game/systems/ZoneLoader.js — NEW
// Extends existing loadZoneAssets() in zoneAssetManifests.js
import manifest from '../../../content/zone-manifest.json';

const loadedAtlases = new Set(['kenmi-shared']);  // shared atlas always present
const zoneLru = [];                                 // recently-loaded zones (max 3)

export async function loadZoneBundle(scene, zoneId) {
  const bundle = manifest[zoneId];
  if (!bundle) return;

  const toLoad = bundle.atlases.filter(a => !loadedAtlases.has(a));
  if (toLoad.length === 0) return;

  await new Promise((resolve) => {
    toLoad.forEach((atlasKey) => {
      // Phaser docs: "scene.load.multiatlas('level1', 'images/Level1.json')"
      scene.load.multiatlas(atlasKey, `/assets/atlases/${atlasKey}.json`);
    });
    scene.load.once('complete', resolve);
    scene.load.start();
  });

  toLoad.forEach(a => loadedAtlases.add(a));
  zoneLru.unshift(zoneId);
  if (zoneLru.length > 3) {
    const evicted = zoneLru.pop();
    releaseZoneBundle(scene, evicted);
  }
}

export function releaseZoneBundle(scene, zoneId) {
  const bundle = manifest[zoneId];
  if (!bundle) return;
  for (const atlasKey of bundle.atlases) {
    if (atlasKey === 'kenmi-shared') continue;       // never release shared
    if (!loadedAtlases.has(atlasKey)) continue;
    // Don't release if another currently-loaded zone needs it
    const stillNeeded = zoneLru.some(z => manifest[z]?.atlases?.includes(atlasKey));
    if (stillNeeded) continue;
    scene.textures.remove(atlasKey);                 // Phaser TextureManager
    loadedAtlases.delete(atlasKey);
  }
}

export function prefetchAdjacent(scene, zoneId) {
  const bundle = manifest[zoneId];
  if (!bundle) return;
  for (const adj of bundle.adjacent) {
    loadZoneBundle(scene, adj).catch(() => { /* fire-and-forget */ });
  }
}
```

### CI bundle-size gate
```yaml
# .github/workflows/bundle-size.yml — NEW
# Source: github.com/marketplace/actions/vite-compare-bundle-size
name: Bundle Size

on:
  pull_request:
    branches: [main]

jobs:
  size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }

      # Build current PR
      - run: npm ci
      - run: ANALYZE=true npm run build
      - run: cp dist/bundle-report.json head-stats.json   # stats artefact
        # NOTE: requires extending vite.config.js visualizer with `json: true` filename

      # Build base branch
      - uses: actions/checkout@v4
        with: { ref: ${{ github.base_ref }}, path: base }
      - run: cd base && npm ci && ANALYZE=true npm run build && cp dist/bundle-report.json ../base-stats.json

      - uses: wojtekmaj/vite-compare-bundle-size@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          current-stats-json-path: ./head-stats.json
          base-stats-json-path: ./base-stats.json
          describe-assets: changed-only

      # Custom warn/fail thresholds (action doesn't enforce — we must)
      - name: Enforce size budget
        run: |
          node -e "
          const head = require('./head-stats.json');
          const base = require('./base-stats.json');
          const hSize = head.totalGzipSize ?? head.totalSize ?? 0;
          const bSize = base.totalGzipSize ?? base.totalSize ?? 0;
          const delta = (hSize - bSize) / bSize;
          console.log('Bundle delta:', (delta * 100).toFixed(2), '%');
          if (delta > 0.15) { console.error('FAIL: bundle grew >15%'); process.exit(1); }
          if (delta > 0.05) { console.warn('WARN: bundle grew >5%'); }
          "
```

### Phase 38-compatible BootScene extension
```js
// src/game/scenes/BootScene.js — MODIFIED at end of preload()
// REMOVE: the for-loop over KENMI_CATALOG (each PNG loaded individually)
// ADD: multi-atlas loads + zone manifest
import manifest from '../../../content/zone-manifest.json';   // ~5KB JSON

// Load shared atlas (player, NPCs, UI — always needed)
this.load.multiatlas('kenmi-shared', '/assets/atlases/kenmi-shared.json');

// Load zone-manifest into game registry so ZoneLoader can read it
this.registry.set('zoneManifest', manifest);

// Per-zone atlases NOT loaded here — ZoneLoader handles them on transition.
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Per-PNG loading (`this.load.image('kenmi-foo', ...)` x 969) | Multi-page atlas via `this.load.multiatlas(key, jsonUrl)` | Phaser 3.0 (2018), TexturePacker integration | Reduces HTTP requests from ~969 to ~12; texture binds reduced (one bind per atlas page vs. per sprite); CDN cache hit ratio improves dramatically |
| Webpack bundle analysis | Vite's built-in dep graph + `rollup-plugin-visualizer` (already installed) | Vite ecosystem migration (~2022+) | Stats produced as part of normal `vite build` — no second build step |
| HMR via fast-refresh wrappers | Native `import.meta.hot.accept` | Vite 2+ | First-party HMR, no transpile overhead |
| ESM in Node via `--experimental-modules` | Native ESM (`"type": "module"` in package.json) | Node 18+ | Project already uses this (package.json line 5: `"type": "module"`); all new scripts should be `.mjs` or use ESM syntax |
| WebP/AVIF over PNG | PNG is still standard for pixel-art atlases (alpha + lossless) | n/a | CONTEXT.md explicitly defers WebP/AVIF migration |

**Deprecated/outdated:**
- `this.load.atlas()` for multi-page output: per Phaser docs, "If you are using Texture Packer and have enabled multi-atlas support, then please use the Phaser Multi Atlas loader instead of this one." Use `this.load.multiatlas()`.
- The pattern of registering every sprite as an individual texture (the current `KENMI_CATALOG` loader loop) — superseded by atlas-based loading, though the catalog data itself remains useful for editor tooling and tests.

## Assumptions Log

> The planner and discuss-phase should confirm these with the user (or accept the recommendation) before locking in plans.

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `free-tex-packer-core` produces deterministic output when given sorted input + pinned options + `allowRotation:false` + `allowTrim:false` + per-image `hash` property | Standard Stack / Pitfall 1 | If determinism still fails, every CI run produces different bytes; bundle-size gate is noisy; cache invalidation thrashes. Mitigation: ship `scripts/verify-atlas-determinism.mjs` as a pre-flight CI step that runs the packer twice in temp dirs and `diff -r`s. If it ever fails, we'll know immediately. |
| A2 | `ffmpeg -bitexact -map_metadata -1` produces byte-identical OGG and MP3 outputs across runs on the same encoder version | Pattern 2 | If outputs vary, audio rebuilds even when source unchanged; cache useless. Mitigation: pin ffmpeg version in CI. |
| A3 | `import.meta.glob('/content/**/*.json', { eager: true })` correctly registers HMR dependencies for `import.meta.hot.accept(deps, cb)` | Pattern 3 | If not, HMR silently doesn't fire on JSON edits. Mitigation: prototype on a single content/test.json file in a 30-min spike before committing to the pattern. |
| A4 | Tree-shake removes the entire `hmrContent.js` module from production when wrapped in `if (import.meta.hot)` | Pitfall 3 | If not, dev HMR code ships to prod (HMR-03 violated). Mitigation: also dynamic-import via `if (import.meta.env.DEV) import('./dev/hmrContent.js')`, then verify in bundle analyzer output. |
| A5 | Adjacent-zone prefetch with LRU-3 cap is small enough not to cause memory pressure on a typical 8-zone session | Pitfall 5 | If memory grows, mobile users (Phase 103) suffer. Mitigation: instrument with the perf overlay from Phase 102 (OBS-05); if pressure is real, lower cap to 2 or skip prefetch on `OBS-06` low-end flag. |
| A6 | Reframing of `KENMI_CATALOG` keys as atlas-frame names (preserving full key as frame name) is feasible with `free-tex-packer-core` — i.e., we don't need a codemod across 2091-line zones.js | Runtime State Inventory / "Build artifacts" | If frame-name preservation isn't possible, plan must add a codemod. Mitigation: spike-test `packAsync([{path:'kenmi-desert-props-palm-tree-1', contents}])` to confirm frame name is `kenmi-desert-props-palm-tree-1` (not `palm-tree-1`). |
| A7 | The size of `npcs.json` (792 KB, 19169 lines) won't cause an unacceptable HMR latency when re-validated through Zod on every edit | HMR Pattern 3 | Edit-to-paint latency >2s makes HMR feel broken. Mitigation: scope HMR to per-zone files (`content/dialogue/<zone>.json`) instead of the monolithic `npcs.json`. This implies splitting `npcs.json` per zone first — already a separate Phase 12-style improvement. |
| A8 | The 5650-test vitest suite (per STATE.md line "5650 tests / 5623 passing / 19 failing") will not regress when (a) `this.load.image('kenmi-foo')` calls become `this.add.sprite(x, y, 'kenmi-shared', 'foo')` references and (b) HMR module is added | Hard Constraint from CONTEXT.md | If tests break, phase blocks on test-suite repair. Mitigation: Wave 0 should run full suite, capture baseline; each task verifies no new failures. |

## Open Questions

1. **Does `free-tex-packer-core` preserve full catalog-key names as frame names, or does it strip path prefixes?**
   - What we know: The `path` field in input images is what gets used as frame name. `removeFileExtension:false` keeps `.png` in the frame name (not what we want). The catalog keys (e.g., `kenmi-desert-props-palm-tree-1`) don't have extensions.
   - What's unclear: Whether passing `{path: 'kenmi-desert-props-palm-tree-1', contents: buf}` (no `.png` suffix, no slashes) gives us a frame literally named `kenmi-desert-props-palm-tree-1`, or whether the packer auto-strips/prefixes.
   - Recommendation: 30-min spike script in `scripts/spike-atlas-naming.mjs` that packs 3 fake images with various `path` values and prints the resulting JSON `frames` keys. Do this in PLAN Wave 0 before committing to the no-codemod approach.

2. **Is the existing `vite.config.js validateDialoguePlugin()` (which validates `src/data/npcs.json`) still the source of truth, or do we move dialogue files into `content/dialogue/` for the HMR boundary to work?**
   - What we know: Current dialogue lives in `src/data/npcs.json` (792KB) and `src/data/npc-dialogue/*.json` (per-zone, lazy-loaded). CONTEXT.md says HMR applies to `content/**/*.json`.
   - What's unclear: Does the planner move the existing files into `content/`, or treat `content/` as a new symlink-from-src directory, or extract specific writer-facing slices into `content/`?
   - Recommendation: Create `content/` as a new directory. For Phase 104 MVP, only one file needs to live there: a tiny `content/dialogue/test.json` to prove the HMR loop end-to-end. Later phases (out of scope here) can move large existing JSON over once writers actually start editing.

3. **How aggressively should we re-encode existing OGG files?**
   - What we know: PIPE-03 says "re-encode only if size win > 30%". Current audio is 25MB split as 33 MP3 + 19 OGG (0 WAV).
   - What's unclear: 19 files are already OGG; re-encoding them through ffmpeg again is a no-op or loss. 33 MP3s might gain size by going OGG (Vorbis q5 ≈ 160kbps, similar to typical MP3 V4).
   - Recommendation: Default policy — for each source: encode to OGG; if (orig_size − ogg_size)/orig_size < 30%, keep original; produce MP3 fallback only when source isn't already MP3. Document this policy in the plan and let `scripts/encode-audio.mjs` print a summary table of decisions.

4. **Does the existing CI workflow (`.github/workflows/ci.yml`) need any modification beyond adding a determinism check?**
   - What we know: Current CI is Lint + Test + Build, runs on push/PR to main, Ubuntu 22.04 default runner, node 22. No ffmpeg install step.
   - What's unclear: Whether the CI build should produce atlases (slow) or fetch pre-built atlases from a cache.
   - Recommendation: Add ffmpeg apt install to `ci.yml`. Build atlases as part of `npm run build` in CI (the deterministic-build job ensures cache validity). For the bundle-size gate, run as a separate `.github/workflows/bundle-size.yml` so it doesn't block main `ci.yml` on unrelated changes.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `ffmpeg` (system binary) | `scripts/encode-audio.mjs`, CI audio re-encode | ✓ (local) | 8.0.1 (with libmp3lame, libvorbis, libopus) | Fail loudly with install instructions in script if missing |
| `node` ≥18 | All build scripts (already required) | ✓ | (project uses node 22 in CI) | — |
| `npm` ≥9 | Install free-tex-packer-core | ✓ | (project default) | — |
| `git` | CI bundle-size diff (checks out base branch) | ✓ | — | — |
| `gh` CLI | Optional — local testing of bundle-size action | ✗ on user's machine? unverified | — | Use `act` (Github Actions local runner) or rely on PR for verification |
| `slopcheck` (Python) | Package legitimacy gate | ✗ (pip not on PATH; pip3 lacks --break-system-packages) | — | Manual cross-check against npm metadata; planner adds `checkpoint:human-verify` before install |

**Missing dependencies with no fallback:** none blocking.
**Missing dependencies with fallback:** slopcheck (mitigated by `checkpoint:human-verify` gate).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 3.0.0 (jsdom + fake-indexeddb env, Playwright for e2e) |
| Config file | `vitest.config.js` (root) + `playwright.config.js` |
| Quick run command | `npm run test:run -- --reporter=dot` |
| Full suite command | `npm run test:run` (5650 tests, ~3-5 min based on STATE.md) + `npm run test:e2e` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PIPE-01 | Atlas packer produces byte-identical output across 2 runs | integration (script) | `node scripts/verify-atlas-determinism.mjs` | ❌ Wave 0 |
| PIPE-02 | BootScene loads multi-page atlas; Phaser texture cache has expected frame keys | unit | `vitest run src/game/scenes/__tests__/BootScene.atlas.test.js` | ❌ Wave 0 |
| PIPE-03 | encode-audio script produces OGG+MP3 with valid headers; respects 30% threshold | unit | `vitest run scripts/__tests__/encode-audio.test.mjs` | ❌ Wave 0 |
| PIPE-04 | zone-manifest.json matches schema; covers every zone in zones.js; adjacencies are bidirectional where exits are reciprocal | unit | `vitest run scripts/__tests__/zone-manifest.test.mjs` | ❌ Wave 0 |
| PIPE-05 | ZoneLoader.loadZoneBundle loads atlases for target zone only; releaseZoneBundle removes prior zone's textures; prefetchAdjacent fires fire-and-forget loads | integration | `vitest run src/game/systems/__tests__/ZoneLoader.test.js` | ❌ Wave 0 |
| PIPE-05 (no pop-in) | E2E walk between zones shows no missing textures during fade | playwright | `playwright test tests/e2e/zone-transition-no-popin.spec.js` | ❌ Wave 0 (manual visual check acceptable if Playwright canvas snapshot is unreliable) |
| PIPE-06 | Bundle-size GH Action exits non-zero when bundle delta > 15% | GH Action self-test (manual verify via test PR) | manual | manual-only |
| HMR-01 | Editing `content/dialogue/test.json` fires HMR callback in dev only | manual (dev-server) | `npm run dev` + edit + observe Redux DevTools | manual-only — automate later if writer team grows |
| HMR-02 | Invalid JSON triggers Zod validation; no Redux state mutation | unit | `vitest run src/dev/__tests__/hmrContent.test.js` (mock import.meta.hot) | ❌ Wave 0 |
| HMR-03 | Production bundle does NOT contain `hotSwap` string or HMR module | build-time check | `grep -L 'hmrContent\|content/hotSwap' dist/assets/*.js` (must produce all files) | ❌ Wave 0 |
| HMR-04 | Invalid JSON shows error in dev overlay with file path + Zod issue | unit (overlay) | `vitest run src/utils/__tests__/devOverlay.test.js` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `vitest run --changed` (vitest re-runs only affected test files; ~10s)
- **Per wave merge:** `npm run test:run` full suite + `node scripts/verify-atlas-determinism.mjs`
- **Phase gate:** Full vitest suite green (regression baseline = STATE.md's 5623/5650; allow no new failures) + `npm run build` succeeds + `node scripts/verify-atlas-determinism.mjs` exits 0 + manual checkpoint that bundle-size gate works on a test PR.

### Wave 0 Gaps
- [ ] `scripts/verify-atlas-determinism.mjs` — packs twice, exits 1 on mismatch
- [ ] `scripts/__tests__/encode-audio.test.mjs` — covers PIPE-03 (mock ffmpeg via injected spawnFn)
- [ ] `scripts/__tests__/zone-manifest.test.mjs` — covers PIPE-04 (schema, completeness)
- [ ] `src/game/systems/__tests__/ZoneLoader.test.js` — covers PIPE-05 (uses Phaser scene mock pattern already in use elsewhere)
- [ ] `src/game/scenes/__tests__/BootScene.atlas.test.js` — covers PIPE-02 (verify multiatlas wired)
- [ ] `src/dev/__tests__/hmrContent.test.js` — covers HMR-02 with mock `import.meta.hot`
- [ ] `src/utils/__tests__/devOverlay.test.js` — covers HMR-04
- [ ] `tests/e2e/zone-transition-no-popin.spec.js` — PIPE-05 visual check via Playwright

## Security Domain

> Phase 104 is build-time tooling + dev-time HMR. Most ASVS categories don't apply at runtime. Threat surface is limited to: (a) supply-chain (new npm dependency), (b) CI runner (executes shell with secrets), (c) dev-only HMR code accidentally shipping to production.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V1 Architecture | yes | Strict dev/prod separation: HMR module guarded by `if (import.meta.hot)`; verify dead-code elimination in build analyzer |
| V2 Authentication | no | No auth surface added |
| V3 Session Management | no | No session surface added |
| V4 Access Control | no | No access control surface added |
| V5 Input Validation | yes | All HMR-loaded JSON re-validated via Zod before applying to Redux. Reuse existing `dialogueSchema`. Untrusted JSON can hang/crash a parser; Zod's `safeParse` doesn't throw. |
| V6 Cryptography | yes (low) | `crypto.createHash('sha256')` used for audio cache keys; reuses Node built-in (no custom crypto). |
| V10 Malicious Code | yes | New npm dependency `free-tex-packer-core` — package legitimacy gate enforced; no postinstall scripts confirmed. Pin transitive `jimp@1.6.1`, `maxrects-packer@2.7.3`, `mustache@2.3.0`. |
| V14 Configuration | yes | Pin ffmpeg version in CI YAML; pin Node version (already 22 in ci.yml). Reproducibility is a security property — drift hides tampering. |

### Known Threat Patterns for {Node build pipeline + Vite SPA}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Slopsquatted package masquerading as `free-tex-packer-core` (e.g., `free-tex-pack-core`) | Spoofing | Verified spelling against odrick/free-tex-packer-core GitHub; planner adds `checkpoint:human-verify` before install (slopcheck unavailable in sandbox) |
| Transitive dep with postinstall script | Tampering / RCE | Confirmed `free-tex-packer-core`, `jimp`, `maxrects-packer`, `mustache` all have no postinstall (`npm view ... scripts.postinstall` returned undefined for each) |
| Malformed JSON in `content/**` crashes dev server | DoS (dev only) | Wrap HMR callback in try/catch; surface error in overlay rather than rethrowing |
| HMR code accidentally shipped to production exposes Redux store mutation API | Information Disclosure / Tampering | Tree-shake verification + bundle analyzer check (Pitfall 3); CI grep for `hotSwap` / `hmrContent` string in `dist/assets/*.js` |
| ffmpeg invoked with user-controlled path argument | Command Injection | All ffmpeg invocations use `spawnSync` with array args (not shell-string); paths are derived from `readdir` on a fixed `public/assets/audio/` directory — no user input |
| Atlas frame names collide with Phaser internal keys | Tampering / data corruption | Frame names are derived from `kenmi-*` catalog keys; prefix guarantees no collision with Phaser internals (which use no prefix) |

## Sources

### Primary (HIGH confidence)
- [Phaser 3 LoaderPlugin API — atlas()](https://docs.phaser.io/api-documentation/class/loader-loaderplugin#atlas) — confirmed multi-page requires `multiatlas()` not `atlas()`
- [Phaser 3 multi-atlas JSON format](https://github.com/photonstorm/phaser3-examples/blob/master/public/assets/loader-tests/texture-packer-multi-atlas.json) — sample file for output format reference
- [Vite HMR API docs](https://vite.dev/guide/api-hmr) — confirmed `hot.accept(deps, cb)` signature; confirmed prod tree-shake guidance
- [free-tex-packer-core README](https://github.com/odrick/free-tex-packer-core) — confirmed exporters list (Phaser3 included), options keys, programmatic API
- [maxrects-packer source](https://github.com/soimy/maxrects-packer/blob/master/src/maxrects-packer.ts) — confirmed `hash` property gives stable packing; confirmed `addArray` auto-sorts input
- [ffmpeg `-bitexact` flag](https://github.com/yt-dlp/yt-dlp/issues/2284) — confirmed bitexact provides reproducible output
- [wojtekmaj/vite-compare-bundle-size@v1 marketplace listing](https://github.com/marketplace/actions/vite-compare-bundle-size) — confirmed exact YAML, inputs, lack of threshold flags
- Local file: `/Users/theshumba/Documents/GitHub/gogo-arabic/src/game/systems/ZoneTransition.js` — confirmed existing transitionTo() structure
- Local file: `/Users/theshumba/Documents/GitHub/gogo-arabic/src/data/zoneAssetManifests.js` — confirmed existing loadZoneAssets() pattern
- Local file: `/Users/theshumba/Documents/GitHub/gogo-arabic/src/data/npcDialogueLoader.js` — confirmed existing preloadAdjacentZones() helper
- Local file: `/Users/theshumba/Documents/GitHub/gogo-arabic/src/data/dialogueSchema.js` — confirmed Zod schema + validateDialogueData() pattern
- Local file: `/Users/theshumba/Documents/GitHub/gogo-arabic/vite.config.js` — confirmed existing validateDialoguePlugin() + ANALYZE=true visualizer hookup
- Local: `npm view free-tex-packer-core` — version 0.3.5, MIT, last modified 2025-08-29

### Secondary (MEDIUM confidence)
- [Vite HMR + glob discussion #7577](https://github.com/vitejs/vite/discussions/7577) — confirmed eager:true needed for HMR boundary on globbed files
- [TexturePacker multi-atlas Phaser issue #3577](https://github.com/photonstorm/phaser/issues/3577) — historical context on Phaser's multi-atlas support
- [Reproducible Builds project](https://reproducible-builds.org/) — general guidance on determinism (encoder version, timestamps, sort order)
- WebSearch synthesis on ffmpeg deterministic output

### Tertiary (LOW confidence — flagged for validation)
- Assumption that ALL three determinism levers (sorted input + `allowRotation:false` + `hash` field) are jointly sufficient for byte-identical atlases — UNVERIFIED in free-tex-packer-core docs; mitigation is the verify-atlas-determinism.mjs CI check.
- Assumption that `import.meta.glob({ eager: true })` + `hot.accept(deps, cb)` actually routes HMR events through the callback for every file in the glob — documented but not personally tested in this session.

## Project Constraints (from CLAUDE.md)

No `CLAUDE.md` exists at `/Users/theshumba/Documents/GitHub/gogo-arabic/CLAUDE.md` (verified). No project-level directives override the GSD defaults.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PIPE-01 | Sprite atlas packing is deterministic | Standard Stack (free-tex-packer-core), Pattern 1 (deterministic pack), Pitfall 1, Wave 0 verify-atlas-determinism.mjs |
| PIPE-02 | Kenmi sprites + tilesets packed into multi-page atlases, ingested natively by Phaser | Standard Stack (Phaser3 exporter + multiatlas loader), Code Example "Phase 38-compatible BootScene extension" |
| PIPE-03 | Audio → OGG primary + MP3 fallback, size win >30%, fidelity preserved | Standard Stack (ffmpeg + libvorbis q5 + libmp3lame q4), Pattern 2, Open Question #3 |
| PIPE-04 | `content/zone-manifest.json` generated declaring per-zone needs | Pattern 4 (manifest generation from zones.js exits[]) |
| PIPE-05 | Per-zone lazy loading + release-on-exit + adjacent pre-fetch with no pop-in | Code Example "Single zone-bundle load with release-on-exit", Pitfall 4, Pitfall 5 |
| PIPE-06 | CI bundle gate: warn >+5%, fail >+15% | Supporting (vite-compare-bundle-size action + custom enforce step), Code Example "CI bundle-size gate" |
| HMR-01 | Vite HMR boundary on `content/**/*.json`, DEV-only | Pattern 3, Pitfall 2 (eager glob), Open Question #2 |
| HMR-02 | Zod re-validation on HMR using existing schemas | Pattern 3 (ContentSchema composed from existing dialogueSchema + vocab patterns) |
| HMR-03 | HMR code stripped from production bundle | Pattern 3 (if-guard wrapping entire module), Pitfall 3, Assumption A4 |
| HMR-04 | Validation failure surfaces in dev overlay; no state mutation; no crash | Pattern 3 (showHmrError + early return before dispatch), Wave 0 hmrContent.test.js |

## User Constraints (from CONTEXT.md)

### Locked Decisions
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

**Hard Constraints:**
- Atlas packing must be deterministic — same inputs produce byte-identical atlases.
- Lazy loading must NOT cause visible asset pop-in. Pre-fetch adjacent zones on hover/proximity.
- Hot reload must NEVER apply to production. Compile-time stripped.
- JSON validation on HMR must reuse the existing Zod schemas — no parallel validation paths.
- The 2535+ existing tests must remain green (STATE.md indicates the suite is currently 5650 — use that as baseline).
- Audio re-encoding must preserve perceptual fidelity (OGG q≥5 or equivalent bitrate).

**Depends On:**
- Phase 38 Asset Pipeline & BootScene (foundation).
- Phase 97 Visual Rebuild (stable sprite surface).
- Phase 98 Code Health (strongly preferred to complete first so we're not packing assets that get deleted in 98).

**Preserve:**
- `public/assets/` source-file layout (atlases are derived artefacts in `dist/` only).
- Phase 38 BootScene contract — extend, don't replace.
- Existing audio filenames where re-encoding isn't worthwhile.
- All Howler.js audio paths in code — pipeline produces files at same logical paths.

### Claude's Discretion

Per CONTEXT.md `<specifics>`, the user has provided strong guidance (free-tex-packer-core, ffmpeg, `content/zone-manifest.json` shape, prefetch heuristic via zone-connection graph, Redux `content/hotSwap` action, GH Actions bundle gate via `stats.json` diff) but these are *specific ideas* rather than locked decisions. The planner has discretion on:
- Exact file/script names and directory layout (this research proposes `scripts/pack-atlases.mjs`, `scripts/encode-audio.mjs`, `scripts/generate-zone-manifest.mjs`, `src/dev/hmrContent.js`, `src/game/systems/ZoneLoader.js` — adjust as needed).
- Whether to extract content into `content/` immediately (recommend: minimal extraction in Phase 104; large-scale move is out of scope).
- Frame-naming strategy (this research recommends preserving full catalog keys as frame names; alternative is a codemod across `zones.js`).
- Exact LRU cap for zone bundles (this research recommends 3).
- Whether to use libvorbis or libopus for OGG (recommend libvorbis q5 for broader browser compat — libopus is technically better quality/byte but Safari support is patchy).

### Deferred Ideas (OUT OF SCOPE)
- WebP/AVIF for background art — wait for telemetry confirming load-time pain.
- Texture streaming / mipmap generation — unnecessary at our tile sizes.
- Hot reload of Phaser scene code (not just content) — possible but invasive; defer until devs ask.
- Asset CDN — premature, GitHub Pages / current hosting handles it.
- ESM-based runtime asset registry — overkill, JSON manifest is enough.
- AI-generated atlas variants for low-end mode — Phase 102 flag exists; revisit if perf telemetry demands.
- Code-splitting React routes (worth doing but separate concern).
- Shader pre-compilation or instanced rendering (Phase 18 v2 territory).
- Replacing Vite with another bundler.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every library verified against npm + official docs or local package.json
- Architecture: HIGH — extends already-shipped Phase 38 patterns documented in 38-01-SUMMARY.md and 38-02-SUMMARY.md
- Pitfalls: MEDIUM-HIGH — pitfalls 1, 2, 4, 5, 6 are based on documented behavior; pitfall 3 is based on Vite docs + Rollup tree-shake heuristics
- Determinism guarantee for free-tex-packer-core: MEDIUM (LOW without the verify-atlas-determinism.mjs CI step — that script reduces uncertainty to "we'll know if it fails")
- HMR pattern: MEDIUM-HIGH — `hot.accept(deps, cb)` signature is documented; the eager-glob requirement is from a github discussion (#7577) rather than primary docs

**Research date:** 2026-05-26
**Valid until:** 2026-06-25 (30 days — Vite, Phaser, free-tex-packer-core all on slow-release cadences; nothing in this research depends on bleeding-edge versions)
