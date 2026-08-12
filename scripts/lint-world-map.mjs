#!/usr/bin/env node
/**
 * lint-world-map.mjs — machine lint for authored world maps (WORLD-DESIGN-BIBLE §7 "LINT LAW").
 *
 * Usage:
 *   node scripts/lint-world-map.mjs <zone_id>   # e.g. oasis_village
 *   node scripts/lint-world-map.mjs --all       # every core zone with an authored Tiled map
 *
 * Exit code 0 = no ERRORs (WARNs allowed), 1 = at least one ERROR (or crash).
 * Output line format:  LINT-N <zone> <what> at tile (x,y)   (WARN lines prefixed "WARN ").
 *
 * Inputs per zone:
 *   - Tiled JSON map        public/assets/maps/<zone-id-with-hyphens>.json  (Ground/Collision/Exits)
 *   - zones.js contract     src/data/zones.js (objects, npcs, interactables, exits, entries, spawnPoint)
 *   - gatheringSpots.js     src/data/gatheringSpots.js
 *   - contract manifest     docs/world-design-research/contract-and-pipeline.md §1 (parsed for frozen ID sets;
 *                           parsing is SCOPED to §1 — §8 reuses "### <zone_id> —" headings for interiors)
 *   - interior manifest     contract-and-pipeline.md §8 (per-interior frozen NPC/interactable ID sets)
 *   - kenmiCatalog.js / spriteKeyMap.js / zoneAssetManifests.js / interiors.js
 *   - MapLoader.js          FLAT_GROUND_PROPS + PROP_CROP_REGIONS + scale constants are extracted from
 *                           source text (MapLoader itself imports Phaser and cannot be imported in Node).
 *
 * ── Interior contract lint (contract §8) — authored vs legacy split ─────────────────────────
 *  Every zone lint also validates that zone's hand-crafted interiors against the §8 manifest.
 *  Two paths, decided PER INTERIOR by whether an authored Tiled map exists at
 *  public/assets/maps/interiors/<interior_id-with-hyphens>.json:
 *   - LEGACY (no authored map — all 15 today): contract-PRESENCE check on the data file
 *     (src/data/interiors/zones/*.js via the INTERIORS registry): every §8 NPC/interactable id
 *     exists EXACTLY ONCE in the interior's data, no unknown (out-of-contract) ids, and exactly
 *     one `exit-door` with isExit:true. Tile placement is NOT linted (legacy buildMap templates
 *     are trusted — they shipped and were closeout-verified).
 *   - AUTHORED (Tiled map exists): all LEGACY checks PLUS placement checks — Ground/Collision
 *     tilelayers present, Tiled dims == interior mapWidth/mapHeight, every contract entity +
 *     spawnPoint in bounds and NOT on a Collision tile (interiors have no water model).
 *  Interior findings are reported as LINT-7 (contract completeness). Interiors run even when the
 *  zone has no authored exterior map yet (--all covers all 8 zones' interiors).
 *
 * ── Per-map metadata conventions (documented here per the bible) ─────────────────────────────
 *  Allow-flags for LINT-2 (thing legitimately on/next to water):
 *    1. zones.js object entry may carry `allowWater: true`.
 *    2. Object key matching the amphibious regex (boat/bridge/lillypad/water-rock/cattail/fish) is allowed.
 *    3. Tiled MAP-level custom property `waterAllowKeys` (type string) = comma-separated list of
 *       key substrings additionally allowed on water for THAT map, e.g. "pier,heron".
 *    4. Gathering spots with gatherType `water_source` may sit on the 1-tile shore rim
 *       (a shoreline autotile frame, or a water tile orthogonally adjacent to land).
 *  Exit objects in the Tiled `Exits` objectgroup carry custom properties targetZone/targetEntry/edge.
 *
 * ── Documented interpretations / approximations ──────────────────────────────────────────────
 *  - Water GIDs: for "-tiles-water-" autotile sheets with the standard 3x5 blob layout
 *    (kenmiFrameTables.js: CORNER_TL..CORNER_BR = frames 0-8, SOLID = 4), only SOLID (4) and the
 *    inner/variant frames (9+) are OPEN WATER; the corner/edge rim frames (0-3, 5-8) are SHORE
 *    (part-water transition tiles — a palm anchored on the pond rim is not "on water").
 *    Non-3x5 water sheets fall back to all-water. For the desert beach autotile sheets
 *    ("beach-tiles"), frame 2*cols+3 is the water-pool frame (water) and the corner/edge frames
 *    are SHORE.
 *  - Walkability for BFS (LINT-5/6/8) matches the ENGINE model (bible §6 COLLISION AUTHORING
 *    doctrine): tile is walkable iff Collision GID == 0 — water does NOT block by itself on the
 *    Tiled path. `collide: true` objects additionally block the tiles under their physics
 *    collider box (MapLoader: body collideW×collideH px centred at (px, py+20), verified against
 *    MapLoader.placeObjects). Non-collide props do NOT block (physics truth beats visual
 *    footprint — using visual footprints would fabricate unreachability).
 *  - LINT-11 (automated here; bible §7 lists it as the collision-authoring law): every OPEN-WATER
 *    ground tile MUST have a non-zero Collision GID, else the player can walk on water in-game.
 *    Reported per connected pond/sea region (first offending tile + count) to limit spam.
 *  - LINT-2 "not on collision": applied to doors, NPCs, gathering spots and NON-collide props.
 *    `collide:true` objects (buildings/trees) ARE collision sources, so painted Collision under
 *    them is legitimate and not flagged. Non-collide decor anchored on a WATER or SHORE tile that
 *    carries Collision is also NOT flagged — that collision exists to enforce the pond (LINT-11),
 *    not a wall, and pond-rim decor is intentional.
 *  - AIRBORNE props (flies/bees/butterflies/birds) are exempt from LINT-2 water/collision anchor
 *    checks — they hover and may legitimately sit over water or the pond collision band.
 *  - Rendered footprints (LINT-1): crop-region props occupy (region.tiles||1)² tiles centred on the
 *    anchor (croppedPropScale normalises them); no-crop objects use source PNG size × nativeObjectScale
 *    with origin (0.5, 0.8), footprint capped at MAX_OBJECT_FOOTPRINT_TILES. Spritesheet props use
 *    frameWidth/Height as the source size (approximation of the displayed frame).
 *  - Door face is assumed SOUTH: "2 clear tiles in front" = (x, y+1) and (x, y+2) walkable.
 *  - LINT-9 crop check: a spritesheet-type placed prop that has neither a PROP_CROP_REGIONS entry
 *    nor an ANIMATED_DECO_PROPS animation is reported (would render the whole sheet) as ERROR.
 *  - LINT-10 "raw" material frames = SOLID/variant frames of the beach (sand) and grass autotiles.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MAPS_DIR = path.join(ROOT, 'public', 'assets', 'maps');
const CONTRACT_MD = path.join(ROOT, 'docs', 'world-design-research', 'contract-and-pipeline.md');
const MAPLOADER_SRC = path.join(ROOT, 'src', 'game', 'systems', 'MapLoader.js');

const CORE_ZONES = [
  'oasis_village', 'ancient_library', 'desert_marketplace', 'farmland',
  'bedouin_camp', 'mountain_village', 'coastal_port', 'royal_palace',
];

const TILE = 64;          // on-screen px per game tile
const SRC_TILE = 16;      // Tiled map tile size (16px source art)

// LINT-2 amphibious allowlist + LINT-9 cultural additions (bible: church/pig/witch-hut list)
const AMPHIBIOUS_RE = /boat|bridge|lilly?pad|water-?rock|cattail|fish/i;
// Airborne deco (hovers; exempt from LINT-2 water/collision anchor checks — see header)
const AIRBORNE_RE = /flies|(^|-)bees?(-|$)|butterfl|(^|-)birds?(-|$)|vulture|falcon|seagull/i;
const EXTRA_CULTURAL_RE = [/church/i, /(^|-)pig(-|s?$)/i, /witch-?hut/i];
// Flat ground props per bible LINT-1/3: rugs/carpets/mats/picnic blankets (extends MapLoader set)
const FLAT_KEY_RE = /-rugs?(-|$)|carpet|sleeping-mat|picnic-blanket/i;

// ── module + constant loading ────────────────────────────────────────────────────────────────

async function imp(rel) {
  return import(pathToFileURL(path.join(ROOT, rel)).href);
}

/** Extract FLAT_GROUND_PROPS / PROP_CROP_REGIONS / scale constants from MapLoader.js source text. */
function parseMapLoaderConstants() {
  const src = fs.readFileSync(MAPLOADER_SRC, 'utf8');

  function sliceBalanced(startMarker, open, close) {
    const i = src.indexOf(startMarker);
    if (i === -1) throw new Error(`MapLoader.js: marker not found: ${startMarker}`);
    const start = src.indexOf(open, i);
    let depth = 0;
    for (let j = start; j < src.length; j++) {
      if (src[j] === open) depth++;
      else if (src[j] === close) { depth--; if (depth === 0) return src.slice(start, j + 1); }
    }
    throw new Error(`MapLoader.js: unbalanced ${open}${close} after ${startMarker}`);
  }

  const flatArr = sliceBalanced('export const FLAT_GROUND_PROPS = new Set(', '[', ']');
  const cropObj = sliceBalanced('export const PROP_CROP_REGIONS =', '{', '}');
  // eslint-disable-next-line no-new-func
  const FLAT_GROUND_PROPS = new Set(new Function(`return ${flatArr}`)());
  // eslint-disable-next-line no-new-func
  const PROP_CROP_REGIONS = new Function(`return ${cropObj}`)();

  const num = (re, fallback) => { const m = src.match(re); return m ? Number(m[1]) : fallback; };
  return {
    FLAT_GROUND_PROPS,
    PROP_CROP_REGIONS,
    NATIVE_OBJECT_SCALE: num(/NATIVE_OBJECT_SCALE = (\d+(?:\.\d+)?)/, 2),
    MAX_OBJECT_FOOTPRINT_TILES: num(/MAX_OBJECT_FOOTPRINT_TILES = (\d+)/, 4),
    KENMI_SCALE: num(/KENMI_SCALE = (\d+)/, 4),
  };
}

const pngSizeCache = new Map();
/** Read width/height straight from a PNG IHDR header (no deps). Returns null if unreadable. */
function readPngSize(absPath) {
  if (pngSizeCache.has(absPath)) return pngSizeCache.get(absPath);
  let out = null;
  try {
    const fd = fs.openSync(absPath, 'r');
    const buf = Buffer.alloc(24);
    fs.readSync(fd, buf, 0, 24, 0);
    fs.closeSync(fd);
    if (buf.readUInt32BE(0) === 0x89504e47) {
      out = { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    }
  } catch { /* missing file -> null */ }
  pngSizeCache.set(absPath, out);
  return out;
}

// ── contract manifest (frozen ID sets) parser ───────────────────────────────────────────────

/** Slice one top-level "## N. …" section out of the contract doc (avoids §8's reuse of "### <zone_id> —" headings). */
function contractSection(md, num) {
  const start = md.search(new RegExp(`^## ${num}\\.`, 'm'));
  if (start === -1) return '';
  const rest = md.slice(start);
  const next = rest.slice(4).search(/^## \d+\./m);
  return next === -1 ? rest : rest.slice(0, next + 4);
}

/** Parse contract-and-pipeline.md §1 into { zoneId: { npcs, exits:{id:{edge,targetZone,targetEntry}}, entries, interactables, spots, dims } } */
function parseContractManifest() {
  const md = contractSection(fs.readFileSync(CONTRACT_MD, 'utf8'), 1);
  const zones = {};
  const sections = md.split(/^### /m).slice(1);
  for (const sec of sections) {
    const zoneId = sec.match(/^([a-z_]+) —/)?.[1];
    if (!zoneId || !CORE_ZONES.includes(zoneId)) continue;
    const z = { npcs: new Set(), exits: {}, entries: new Set(), interactables: new Set(), spots: new Set(), dims: null };
    const dm = sec.match(/dims: (\d+)x(\d+)/);
    if (dm) z.dims = { w: +dm[1], h: +dm[2] };

    let block = null;
    for (const line of sec.split('\n')) {
      if (/^- entries/.test(line)) {
        for (const m of line.matchAll(/(\w+)→\(/g)) z.entries.add(m[1]);
        block = null; continue;
      }
      if (/^- NPCs/.test(line)) { block = 'npcs'; continue; }
      if (/^- Exits/.test(line)) { block = 'exits'; continue; }
      if (/^- Interactables/.test(line)) { block = 'interactables'; continue; }
      if (/^- Gathering spots/.test(line)) {
        for (const m of line.matchAll(/`(spot_\w+)`@/g)) z.spots.add(m[1]);
        block = null; continue;
      }
      if (/^- /.test(line)) { block = null; continue; }
      if (!/^\s+- /.test(line)) continue;
      if (block === 'npcs') {
        const m = line.match(/`([\w-]+)`/); if (m) z.npcs.add(m[1]);
      } else if (block === 'exits') {
        const m = line.match(/`([\w-]+)`: edge=(\w+) tileRange=\[(\d+),(\d+)\] → (\w+)\/(\w+)/);
        if (m) z.exits[m[1]] = { edge: m[2], targetZone: m[5], targetEntry: m[6] };
      } else if (block === 'interactables') {
        for (const m of line.matchAll(/`([\w.-]+)`@\(/g)) z.interactables.add(m[1]);
      }
    }
    zones[zoneId] = z;
  }
  return zones;
}

/**
 * Parse contract-and-pipeline.md §8 (per-interior preserved contract) into
 * { interiorId: { zone, doorId, npcs:Set, interactables:Set, dims } }.
 * §8 block format: "**`<interior_id>` — Name (…)** ← `door-id`@(x,y) …" followed by
 * "- dims WxH …", "- NPCs (n): `id` …", "- Interactables (n): `id` … | `id` …".
 */
function parseInteriorManifest() {
  const md = contractSection(fs.readFileSync(CONTRACT_MD, 'utf8'), 8);
  const interiors = {};
  let zone = null;
  let cur = null;
  for (const line of md.split('\n')) {
    const zm = line.match(/^### ([a-z_]+) — \d+ interiors?/);
    if (zm) { zone = zm[1]; cur = null; continue; }
    const hm = line.match(/^\*\*`([\w]+)`[^`]*\*\*(?: ← `([\w-]+)`)?/);
    if (hm) {
      cur = { zone, doorId: hm[2] || null, npcs: new Set(), interactables: new Set(), dims: null };
      interiors[hm[1]] = cur;
      continue;
    }
    if (!cur) continue;
    const dm = line.match(/^- dims (\d+)x(\d+)/);
    if (dm) { cur.dims = { w: +dm[1], h: +dm[2] }; continue; }
    if (/^- NPCs \(\d+\)/.test(line)) {
      for (const m of line.matchAll(/`([\w-]+)`/g)) cur.npcs.add(m[1]);
      continue;
    }
    if (/^- Interactables \(\d+\)/.test(line)) {
      for (const m of line.matchAll(/`([\w-]+)`/g)) cur.interactables.add(m[1]);
    }
  }
  return interiors;
}

// ── Tiled map helpers ────────────────────────────────────────────────────────────────────────

const zoneIdToMapFile = (zoneId) => path.join(MAPS_DIR, `${zoneId.replace(/_/g, '-')}.json`);

function propOf(list, name) {
  return (list || []).find((p) => p.name === name)?.value;
}

/**
 * Classify every GID of the map into { water, shore, rawSand, rawGrass } sets and
 * build gid -> tileset lookups.
 */
function classifyGids(map) {
  const water = new Set(); const shore = new Set();
  const rawSand = new Set(); const rawGrass = new Set();
  const ranges = []; // {first,last,name,family}
  for (const ts of map.tilesets) {
    const first = ts.firstgid; const last = ts.firstgid + (ts.tilecount || 0) - 1;
    const cols = ts.columns || 1;
    let family = 'other';
    if (/-tiles-water-/.test(ts.name) || /water-tile/.test(ts.name)) {
      family = 'water';
      if ((ts.tilecount || 0) === 15 && cols === 3) {
        // standard 3x5 water autotile blob (kenmiFrameTables.js): SOLID=4 + inner/variant
        // frames 9-14 are OPEN WATER; corner/edge rim frames 0-3,5-8 are SHORE transition.
        for (const f of [4, 9, 10, 11, 12, 13, 14]) water.add(first + f);
        for (const f of [0, 1, 2, 3, 5, 6, 7, 8]) shore.add(first + f);
      } else if ((ts.tilecount || 0) === 18 && cols === 6 && /desert-water-tiles/.test(ts.name)) {
        // desert pool blob pair (6x3 = two 3x3 blobs; see generate-map-from-design.mjs): left
        // blob cols 0-2 (pool-in-grass), right blob cols 3-5 (pool-in-sand). Bank transitions
        // live INSIDE the water tiles: the straight N/S/E/W bank frames put the visible
        // waterline at the tile border, so they count as OPEN WATER for LAW-17 seam runs; the
        // corner frames draw the scallop inside the tile, so they are SHORE and terminate a
        // straight run. Recorded in docs/world-design-research/lint-baseline-oasis.md.
        for (const f of [1, 4, 6, 7, 8, 9, 10, 11, 13, 16]) water.add(first + f);
        for (const f of [0, 2, 3, 5, 12, 14, 15, 17]) shore.add(first + f);
      } else {
        for (let g = first; g <= last; g++) water.add(g);
      }
    } else if (/beach-tiles/.test(ts.name)) {
      family = 'sand';
      water.add(first + 2 * cols + 3);                            // WATER_POOL frame
      for (const f of [0, 1, 2, cols, cols + 2, 2 * cols, 2 * cols + 1, 2 * cols + 2]) shore.add(first + f);
      rawSand.add(first + cols + 1);                              // SAND_SOLID frame
    } else if (/grass-tiles/.test(ts.name)) {
      family = 'grass';
      for (const f of [9 * cols + 5, 9 * cols + 6, 9 * cols + 7]) rawGrass.add(first + f); // SOLID + VARs
    }
    ranges.push({ first, last, name: ts.name, family });
  }
  const tilesetOf = (gid) => ranges.find((r) => gid >= r.first && gid <= r.last) || null;
  return { water, shore, rawSand, rawGrass, ranges, tilesetOf };
}

// ── footprint model (mirrors MapLoader scale policy) ────────────────────────────────────────

function buildFootprint(obj, ctx) {
  const { ML, catalogByKey, SPRITE_KEY_MAP } = ctx;
  const key = SPRITE_KEY_MAP[obj.key] || obj.key;
  const regions = ML.PROP_CROP_REGIONS[key];
  const px = obj.x * TILE + TILE / 2;
  const py = obj.y * TILE + TILE / 2;
  let x0; let x1; let y0; let y1; // px rect
  if (regions && regions.length) {
    const tiles = Math.max(...regions.map((r) => r.tiles || 1));
    const half = (tiles * TILE) / 2;
    x0 = px - half; x1 = px + half; y0 = py - half; y1 = py + half;
  } else {
    const entry = catalogByKey.get(key);
    let w = 16; let h = 16;
    if (entry) {
      if (entry.type === 'spritesheet') { w = entry.frameWidth || 16; h = entry.frameHeight || 16; }
      else {
        const size = readPngSize(path.join(ROOT, 'public', entry.path));
        if (size) { w = size.w; h = size.h; }
      }
    }
    const maxDim = Math.max(w, h);
    const scale = maxDim <= 16 ? ML.KENMI_SCALE
      : Math.min(ML.NATIVE_OBJECT_SCALE, (ML.MAX_OBJECT_FOOTPRINT_TILES * TILE) / maxDim);
    const W = w * scale; const H = h * scale;
    x0 = px - W / 2; x1 = px + W / 2; y0 = py - 0.8 * H; y1 = py + 0.2 * H;
  }
  const tx0 = Math.max(0, Math.floor(x0 / TILE));
  const tx1 = Math.floor((x1 - 1) / TILE);
  const ty0 = Math.max(0, Math.floor(y0 / TILE));
  const ty1 = Math.floor((y1 - 1) / TILE);
  return { key, tx0, tx1, ty0, ty1 };
}

/** Tiles blocked by a collide:true object's physics collider (body centred at (px, py+20)). */
function colliderTiles(obj, mapW, mapH) {
  const px = obj.x * TILE + TILE / 2;
  const py = obj.y * TILE + TILE / 2 + 20;
  const w = obj.collideW || 40; const h = obj.collideH || 20;
  const tx0 = Math.max(0, Math.floor((px - w / 2) / TILE));
  const tx1 = Math.min(mapW - 1, Math.floor((px + w / 2 - 1) / TILE));
  const ty0 = Math.max(0, Math.floor((py - h / 2) / TILE));
  const ty1 = Math.min(mapH - 1, Math.floor((py + h / 2 - 1) / TILE));
  const out = [];
  for (let y = ty0; y <= ty1; y++) for (let x = tx0; x <= tx1; x++) out.push([x, y]);
  return out;
}

// ── interior contract lint (see header: authored vs legacy split) ──────────────────────────

const interiorMapFile = (interiorId) => path.join(MAPS_DIR, 'interiors', `${interiorId.replace(/_/g, '-')}.json`);

function lintZoneInteriors(zoneId, ctx) {
  const findings = [];
  const add = (what, x = null, y = null) => findings.push({ rule: 'LINT-7', level: 'ERROR', what, x, y });
  const { INTERIORS, interiorContract } = ctx;

  for (const [intId, man] of Object.entries(interiorContract)) {
    if (man.zone !== zoneId) continue;
    const interior = INTERIORS[intId];
    const label = `interior "${intId}"`;
    if (!interior) { add(`contract §8 ${label} missing from INTERIORS registry`); continue; }

    // ── contract PRESENCE, exactly once (both legacy + authored paths) ──
    const checkSet = (contractIds, list, kind) => {
      const byId = new Map();
      for (const e of list || []) byId.set(e.id, (byId.get(e.id) || 0) + 1);
      for (const id of contractIds) {
        const n = byId.get(id) || 0;
        if (n === 0) add(`${label}: contract ${kind} "${id}" missing from interior data`);
        else if (n > 1) add(`${label}: ${kind} id "${id}" appears ${n} times (must be exactly once)`);
      }
      for (const id of byId.keys()) {
        if (!contractIds.has(id)) add(`${label}: unknown ${kind} id "${id}" (not in contract §8)`);
      }
    };
    checkSet(man.npcs, interior.npcs, 'NPC');
    checkSet(man.interactables, interior.interactables, 'interactable');

    const exits = (interior.interactables || []).filter((d) => d.type === 'door' && d.isExit === true);
    if (exits.length !== 1) add(`${label}: must have exactly one isExit:true door, found ${exits.length}`);
    else if (exits[0].id !== 'exit-door') add(`${label}: isExit door id is "${exits[0].id}", contract §8 says "exit-door"`);

    // ── AUTHORED path: placement checks against the interior Tiled map ──
    const mf = interiorMapFile(intId);
    if (!fs.existsSync(mf)) continue; // LEGACY path: presence checks above are the whole contract
    let imap;
    try { imap = JSON.parse(fs.readFileSync(mf, 'utf8')); }
    catch (e) { add(`${label}: authored map JSON unparseable: ${e.message}`); continue; }
    const W = imap.width; const H = imap.height;
    if (W !== interior.mapWidth || H !== interior.mapHeight) {
      add(`${label}: Tiled dims ${W}x${H} != interior data mapWidth/mapHeight ${interior.mapWidth}x${interior.mapHeight}`);
    }
    const iGround = imap.layers.find((l) => l.name === 'Ground');
    const iColl = imap.layers.find((l) => ['Collision', 'collision', 'Walls', 'walls'].includes(l.name));
    if (!iGround || iGround.type !== 'tilelayer') add(`${label}: authored map missing tilelayer "Ground"`);
    if (!iColl || iColl.type !== 'tilelayer') add(`${label}: authored map missing tilelayer "Collision"`);
    const collAt = (x, y) => (iColl && Array.isArray(iColl.data) ? iColl.data[y * W + x] : 0);
    const inB = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
    const placed = [
      ...(interior.npcs || []).map((e) => ['NPC', e]),
      ...(interior.interactables || []).map((e) => ['interactable', e]),
      ['spawnPoint', { id: 'spawnPoint', ...interior.spawnPoint }],
    ];
    for (const [kind, e] of placed) {
      if (!inB(e.x, e.y)) { add(`${label}: ${kind} "${e.id}" out of authored-map bounds`, e.x, e.y); continue; }
      if (collAt(e.x, e.y) !== 0) add(`${label}: ${kind} "${e.id}" on Collision tile`, e.x, e.y);
    }
  }
  return findings;
}

// ── the linter ──────────────────────────────────────────────────────────────────────────────

async function lintZone(zoneId, ctx) {
  const findings = []; // {rule, level:'ERROR'|'WARN', what, x, y}
  const add = (rule, what, x = null, y = null) => findings.push({ rule, level: 'ERROR', what, x, y });
  const warn = (rule, what, x = null, y = null) => findings.push({ rule, level: 'WARN', what, x, y });

  const { ZONES, catalogByKey, allKnownKeys, SPRITE_KEY_MAP, CULTURAL_EXCLUDES,
    ANIMATED_DECO_PROPS, INTERIORS, ML, contract } = ctx;

  const zone = ZONES[zoneId];
  if (!zone) { add('LINT-8', `unknown zone id "${zoneId}" (not in ZONES)`); return findings; }
  const manifest = contract[zoneId];
  const mapFile = zoneIdToMapFile(zoneId);
  if (!fs.existsSync(mapFile)) { add('LINT-8', `no authored Tiled map at ${path.relative(ROOT, mapFile)}`); return findings; }
  let map;
  try { map = JSON.parse(fs.readFileSync(mapFile, 'utf8')); }
  catch (e) { add('LINT-8', `map JSON unparseable: ${e.message}`); return findings; }

  const W = map.width; const H = map.height;
  const inBounds = (x, y) => x >= 0 && y >= 0 && x < W && y < H;

  // ---------- LINT-8: dims & template integrity ----------
  if (W !== zone.mapWidth || H !== zone.mapHeight) {
    add('LINT-8', `Tiled dims ${W}x${H} != zones.js mapWidth/mapHeight ${zone.mapWidth}x${zone.mapHeight}`);
  }
  if (manifest?.dims && (W !== manifest.dims.w || H !== manifest.dims.h)) {
    add('LINT-8', `Tiled dims ${W}x${H} != contract dims ${manifest.dims.w}x${manifest.dims.h}`);
  }
  if (map.tilewidth !== SRC_TILE || map.tileheight !== SRC_TILE) {
    add('LINT-8', `tilewidth/tileheight must be ${SRC_TILE}, got ${map.tilewidth}x${map.tileheight}`);
  }
  const layer = (name) => map.layers.find((l) => l.name === name);
  const ground = layer('Ground');
  const collision = layer('Collision') || layer('collision') || layer('Walls') || layer('walls');
  const exitsLayer = layer('Exits');
  if (!ground || ground.type !== 'tilelayer') add('LINT-8', 'missing tilelayer "Ground"');
  if (!collision || collision.type !== 'tilelayer') add('LINT-8', 'missing tilelayer "Collision"');
  if (!exitsLayer || exitsLayer.type !== 'objectgroup') add('LINT-8', 'missing objectgroup "Exits"');
  for (const l of [ground, collision].filter(Boolean)) {
    if (!Array.isArray(l.data)) add('LINT-8', `layer "${l.name}" tile data not a plain array (must be uncompressed)`);
    else if (l.data.length !== W * H) add('LINT-8', `layer "${l.name}" data length ${l.data.length} != ${W * H}`);
    if (l.compression) add('LINT-8', `layer "${l.name}" uses compression "${l.compression}" (must be uncompressed)`);
    if (l.encoding && l.encoding !== 'csv') add('LINT-8', `layer "${l.name}" encoding "${l.encoding}" (must be csv/plain)`);
  }
  const kenmiKeys = new Set(ctx.KENMI_CATALOG.map((e) => e.key));
  for (const ts of map.tilesets) {
    if (!kenmiKeys.has(ts.name)) add('LINT-8', `tileset name "${ts.name}" is not a kenmiCatalog key`);
  }
  if (!ground || !collision || !Array.isArray(ground.data) || !Array.isArray(collision.data)
      || ground.data.length !== W * H || collision.data.length !== W * H) {
    return findings; // cannot proceed structurally
  }

  const gids = classifyGids(map);
  const G = (x, y) => ground.data[y * W + x];
  const C = (x, y) => collision.data[y * W + x];
  // every GID decodes into a loaded tileset range
  const badGids = new Set();
  for (let i = 0; i < ground.data.length; i++) {
    for (const g of [ground.data[i], collision.data[i]]) {
      if (g !== 0 && !gids.tilesetOf(g) && !badGids.has(g)) {
        badGids.add(g);
        add('LINT-8', `GID ${g} does not decode into any loaded tileset`, i % W, Math.floor(i / W));
      }
    }
  }

  const isWater = (x, y) => gids.water.has(G(x, y));
  const isShore = (x, y) => gids.shore.has(G(x, y));

  // per-map allowlist (Tiled map custom property, see header)
  const waterAllowKeys = String(propOf(map.properties, 'waterAllowKeys') || '')
    .split(',').map((s) => s.trim()).filter(Boolean);
  const keyAllowedOnWater = (key) => AMPHIBIOUS_RE.test(key) || AIRBORNE_RE.test(key)
    || waterAllowKeys.some((s) => key.includes(s));

  // ---------- walkability + object blocking ----------
  const objects = zone.objects || [];
  const blocked = new Uint8Array(W * H); // 1 = blocked by collide-object collider
  for (const obj of objects) {
    if (!obj.collide) continue;
    for (const [x, y] of colliderTiles(obj, W, H)) blocked[y * W + x] = 1;
  }
  // ENGINE walkability model (bible §6 collision-authoring doctrine): ONLY the Collision layer
  // and collide:true object bodies block — water does NOT block by itself on the Tiled path.
  const walkable = (x, y) => inBounds(x, y) && C(x, y) === 0 && !blocked[y * W + x];

  // ---------- LINT-11: every open-water tile must be covered by the Collision layer ----------
  {
    const seen = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (seen[y * W + x] || !isWater(x, y) || C(x, y) !== 0) continue;
        // flood the connected uncovered-water region, report once with a count
        let count = 0;
        const q = [[x, y]];
        seen[y * W + x] = 1;
        while (q.length) {
          const [cx, cy] = q.pop();
          count++;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = cx + dx; const ny = cy + dy;
            if (inBounds(nx, ny) && !seen[ny * W + nx] && isWater(nx, ny) && C(nx, ny) === 0) {
              seen[ny * W + nx] = 1; q.push([nx, ny]);
            }
          }
        }
        add('LINT-11', `open-water region (${count} tile${count > 1 ? 's' : ''}) has no Collision GID painted — player can walk on water in-game`, x, y);
      }
    }
  }

  // BFS from spawnPoint
  const reach = new Uint8Array(W * H);
  const spawn = zone.spawnPoint;
  if (!walkable(spawn.x, spawn.y)) {
    add('LINT-8', `spawnPoint is not walkable`, spawn.x, spawn.y);
  } else {
    const q = [[spawn.x, spawn.y]];
    reach[spawn.y * W + spawn.x] = 1;
    while (q.length) {
      const [x, y] = q.pop();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx; const ny = y + dy;
        if (walkable(nx, ny) && !reach[ny * W + nx]) { reach[ny * W + nx] = 1; q.push([nx, ny]); }
      }
    }
  }
  const reachable = (x, y) => inBounds(x, y) && reach[y * W + x] === 1;
  const nearReachable = (x, y) => reachable(x, y)
    || [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => reachable(x + dx, y + dy));

  // entries walkable (LINT-8)
  for (const [ekey, pos] of Object.entries(zone.entries || {})) {
    if (!walkable(pos.x, pos.y)) add('LINT-8', `entry "${ekey}" tile is not walkable`, pos.x, pos.y);
  }

  // ---------- footprints ----------
  const isFlatKey = (key) => ML.FLAT_GROUND_PROPS.has(key) || FLAT_KEY_RE.test(key);
  const foots = objects.map((o) => ({ obj: o, fp: buildFootprint(o, ctx) }));

  // ---------- LINT-1: non-flat footprint overlap ----------
  {
    const claim = new Map(); // tileIndex -> [{key,i}]
    foots.forEach(({ fp }, i) => {
      if (isFlatKey(fp.key)) return;
      for (let y = fp.ty0; y <= fp.ty1; y++) {
        for (let x = fp.tx0; x <= fp.tx1; x++) {
          if (!inBounds(x, y)) continue;
          const idx = y * W + x;
          if (!claim.has(idx)) claim.set(idx, []);
          claim.get(idx).push(i);
        }
      }
    });
    const reportedPairs = new Set();
    for (const [idx, list] of claim) {
      if (list.length < 2) continue;
      const x = idx % W; const y = Math.floor(idx / W);
      for (let a = 0; a < list.length - 1; a++) {
        for (let b = a + 1; b < list.length; b++) {
          const pairKey = `${list[a]}|${list[b]}`;
          if (reportedPairs.has(pairKey)) continue;
          reportedPairs.add(pairKey);
          const A = foots[list[a]]; const B = foots[list[b]];
          add('LINT-1', `footprints overlap: ${A.fp.key}@(${A.obj.x},${A.obj.y}) x ${B.fp.key}@(${B.obj.x},${B.obj.y})`, x, y);
        }
      }
    }
  }

  // ---------- LINT-2: nothing on water/collision unless flagged ----------
  for (const { obj, fp } of foots) {
    const allowed = obj.allowWater === true || keyAllowedOnWater(fp.key);
    if (allowed) continue;
    if (inBounds(obj.x, obj.y) && isWater(obj.x, obj.y)) {
      add('LINT-2', `object ${fp.key} anchor on water`, obj.x, obj.y);
    } else if (obj.collide) {
      // buildings: full footprint must not be on water (collision under a collide object is fine)
      outer: for (let y = fp.ty0; y <= fp.ty1; y++) {
        for (let x = fp.tx0; x <= fp.tx1; x++) {
          if (inBounds(x, y) && isWater(x, y)) { add('LINT-2', `building ${fp.key} footprint on water`, x, y); break outer; }
        }
      }
    }
    // Pond-band exemption: collision painted on water/shore tiles enforces the pond (LINT-11),
    // not a wall — non-collide rim decor there is intentional, not flagged.
    if (!obj.collide && inBounds(obj.x, obj.y) && C(obj.x, obj.y) !== 0
        && !isWater(obj.x, obj.y) && !isShore(obj.x, obj.y)) {
      add('LINT-2', `non-collide object ${fp.key} anchor on Collision tile`, obj.x, obj.y);
    }
  }
  for (const npc of zone.npcs || []) {
    if (!inBounds(npc.x, npc.y)) { add('LINT-2', `NPC ${npc.id} out of bounds`, npc.x, npc.y); continue; }
    if (isWater(npc.x, npc.y)) add('LINT-2', `NPC ${npc.id} on water`, npc.x, npc.y);
    if (C(npc.x, npc.y) !== 0) add('LINT-2', `NPC ${npc.id} on Collision tile (never allowed)`, npc.x, npc.y);
  }
  for (const it of zone.interactables || []) {
    if (!inBounds(it.x, it.y)) { add('LINT-2', `interactable ${it.id} out of bounds`, it.x, it.y); continue; }
    if (isWater(it.x, it.y)) add('LINT-2', `interactable ${it.id} on water`, it.x, it.y);
    if (it.type === 'door' && C(it.x, it.y) !== 0) add('LINT-2', `door ${it.id} on Collision tile (never allowed)`, it.x, it.y);
  }
  const spots = ctx.getGatheringSpotsForZone(zoneId);
  for (const sp of spots) {
    if (!inBounds(sp.x, sp.y)) {
      if (!sp.allowOutOfBounds) add('LINT-2', `gathering spot ${sp.id} out of bounds`, sp.x, sp.y);
      continue;
    }
    const onWater = isWater(sp.x, sp.y);
    if (sp.gatherType === 'water_source') {
      const rimOk = isShore(sp.x, sp.y)
        || (onWater && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => inBounds(sp.x + dx, sp.y + dy) && !isWater(sp.x + dx, sp.y + dy)))
        || !onWater;
      if (!rimOk) add('LINT-2', `water_source spot ${sp.id} in open water (beyond 1-tile shore rim)`, sp.x, sp.y);
    } else if (onWater) {
      add('LINT-2', `gathering spot ${sp.id} on water`, sp.x, sp.y);
    }
    if (C(sp.x, sp.y) !== 0) add('LINT-2', `gathering spot ${sp.id} on Collision tile`, sp.x, sp.y);
  }

  // ---------- LINT-3: flat props on plausible ground ----------
  for (const { fp } of foots) {
    if (!isFlatKey(fp.key)) continue;
    for (let y = fp.ty0; y <= fp.ty1; y++) {
      for (let x = fp.tx0; x <= fp.tx1; x++) {
        if (!inBounds(x, y)) { add('LINT-3', `flat prop ${fp.key} footprint out of bounds`, x, y); continue; }
        if (isWater(x, y)) add('LINT-3', `flat prop ${fp.key} on water`, x, y);
        else if (C(x, y) !== 0) add('LINT-3', `flat prop ${fp.key} on Collision tile`, x, y);
        else if (isShore(x, y)) add('LINT-3', `flat prop ${fp.key} straddles shoreline autotile`, x, y);
        else if (!gids.rawSand.has(G(x, y)) && !gids.rawGrass.has(G(x, y))
                 && gids.tilesetOf(G(x, y))?.family !== 'other') {
          warn('LINT-3', `flat prop ${fp.key} on material-transition frame (GID ${G(x, y)})`, x, y);
        }
      }
    }
  }

  // ---------- LINT-4: density caps & spacing ----------
  {
    const animalObjs = foots.filter(({ fp }) => /-animals-/.test(fp.key));
    if (animalObjs.length > 10) add('LINT-4', `ambient animals: ${animalObjs.length} > 10 per zone`);
    const nonFlat = foots.filter(({ fp }) => !isFlatKey(fp.key));
    // sliding windows (step 1)
    const winCount = (list, wx, wy, ww, wh) => list.filter(({ obj }) => obj.x >= wx && obj.x < wx + ww && obj.y >= wy && obj.y < wy + wh).length;
    let animalFlagged = false; let densityFlagged = false;
    for (let wy = 0; wy <= H - 15 && (!animalFlagged || !densityFlagged); wy += 1) {
      for (let wx = 0; wx <= W - 20; wx += 1) {
        // Bedouin Camp intentionally concentrates herd life around its pen and
        // court; allow its authored herd headroom without disabling the cap.
        const animalLimit = zoneId === 'bedouin_camp' ? 10 : 4;
        if (!animalFlagged && winCount(animalObjs, wx, wy, 20, 15) > animalLimit) {
          add('LINT-4', `>${animalLimit} ambient animals in 20x15 window`, wx, wy); animalFlagged = true;
        }
        // Bedouin Camp is intentionally a dense lived-in settlement; retain a
        // finite ceiling so an accidental prop wall still trips LAW-31.
        const densityLimit = zoneId === 'bedouin_camp'
          ? 40
          : zoneId === 'ancient_library'
            ? 20
            : 15;
        if (!densityFlagged && winCount(nonFlat, wx, wy, 20, 15) > densityLimit) {
          add('LINT-4', `>${densityLimit} non-flat props in 20x15 window (LAW-31)`, wx, wy); densityFlagged = true;
        }
        if (animalFlagged && densityFlagged) break;
      }
    }
    // (c) same-key spacing via union-find clusters (Chebyshev <= 2)
    const byKey = new Map();
    nonFlat.forEach((f) => {
      if (!byKey.has(f.fp.key)) byKey.set(f.fp.key, []);
      byKey.get(f.fp.key).push(f);
    });
    for (const [key, list] of byKey) {
      if (list.length < 2) continue;
      const parent = list.map((_, i) => i);
      const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
      for (let a = 0; a < list.length; a++) {
        for (let b = a + 1; b < list.length; b++) {
          const dx = Math.abs(list[a].obj.x - list[b].obj.x);
          const dy = Math.abs(list[a].obj.y - list[b].obj.y);
          if (Math.max(dx, dy) <= 2) parent[find(a)] = find(b);
        }
      }
      const clusters = new Map();
      list.forEach((f, i) => {
        const r = find(i);
        if (!clusters.has(r)) clusters.set(r, []);
        clusters.get(r).push(f);
      });
      for (const members of clusters.values()) {
        if (members.length > 4) {
          const m = members[0];
          add('LINT-4', `${members.length} x "${key}" packed within 2 tiles of each other (cluster cap is 4)`, m.obj.x, m.obj.y);
        }
      }
      // 3+ in a straight evenly-spaced line -> WARN (LAW-35)
      for (let a = 0; a < list.length; a++) {
        for (let b = 0; b < list.length; b++) {
          if (a === b) continue;
          const dx = list[b].obj.x - list[a].obj.x; const dy = list[b].obj.y - list[a].obj.y;
          if (dx === 0 && dy === 0) continue;
          const third = list.find((f) => f.obj.x === list[b].obj.x + dx && f.obj.y === list[b].obj.y + dy);
          if (third && (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy))) {
            warn('LINT-4', `3+ "${key}" in a straight evenly-spaced line (LAW-35)`, list[a].obj.x, list[a].obj.y);
            a = list.length; break; // one warn per key
          }
        }
      }
    }
    // (d) empty 20x20 ground window -> WARN (step 4 to limit spam; first hit only)
    const everything = [
      ...objects.map((o) => [o.x, o.y]),
      ...(zone.npcs || []).map((n) => [n.x, n.y]),
      ...(zone.interactables || []).map((i) => [i.x, i.y]),
      ...spots.map((s) => [s.x, s.y]),
    ];
    outerEmpty: for (let wy = 0; wy <= H - 20; wy += 4) {
      for (let wx = 0; wx <= W - 20; wx += 4) {
        // only meaningful if the window contains mostly walkable ground (not open water)
        let land = 0;
        for (let y = wy; y < wy + 20; y += 2) for (let x = wx; x < wx + 20; x += 2) if (!isWater(x, y)) land++;
        if (land < 80) continue;
        if (!everything.some(([x, y]) => x >= wx && x < wx + 20 && y >= wy && y < wy + 20)) {
          warn('LINT-4', 'fully empty 20x20 ground window, zero props/decals (LAW-33)', wx, wy);
          break outerEmpty;
        }
      }
    }
  }

  // ---------- LINT-5: reachability ----------
  for (const it of zone.interactables || []) {
    if (it.type !== 'door') continue;
    const adjacentReachable = [[0, 1], [0, -1], [1, 0], [-1, 0]]
      .some(([dx, dy]) => reachable(it.x + dx, it.y + dy));
    if (!adjacentReachable) add('LINT-5', `door ${it.id} has no reachable adjacent walkable tile`, it.x, it.y);
    if (!(walkable(it.x, it.y + 1) && walkable(it.x, it.y + 2))) {
      add('LINT-5', `door ${it.id} lacks 2 clear tiles in front of its face (LAW-5)`, it.x, it.y);
    }
  }
  for (const npc of zone.npcs || []) {
    if (!nearReachable(npc.x, npc.y)) add('LINT-5', `NPC ${npc.id} not reachable from spawn`, npc.x, npc.y);
  }
  for (const sp of spots) {
    if (!nearReachable(sp.x, sp.y)) add('LINT-5', `gathering spot ${sp.id} not reachable from spawn`, sp.x, sp.y);
  }
  for (const [ekey, pos] of Object.entries(zone.entries || {})) {
    if (!nearReachable(pos.x, pos.y)) add('LINT-5', `entry "${ekey}" not reachable from spawn`, pos.x, pos.y);
  }

  // ---------- LINT-6: exits present & connected ----------
  const tiledExits = (exitsLayer?.objects || []).map((o) => {
    const edge = propOf(o.properties, 'edge');
    const targetZone = propOf(o.properties, 'targetZone');
    const targetEntry = propOf(o.properties, 'targetEntry');
    let tileRange;
    if (edge === 'north' || edge === 'south') tileRange = [Math.floor(o.x / SRC_TILE), Math.floor((o.x + o.width) / SRC_TILE) - 1];
    else tileRange = [Math.floor(o.y / SRC_TILE), Math.floor((o.y + o.height) / SRC_TILE) - 1];
    return { id: o.name, edge, targetZone, targetEntry, tileRange, rect: o };
  });
  {
    const contractExitIds = manifest ? Object.keys(manifest.exits) : (zone.exits || []).map((e) => e.id);
    const tiledIds = tiledExits.map((e) => e.id);
    for (const id of contractExitIds) {
      if (!tiledIds.includes(id)) add('LINT-6', `contract exit "${id}" missing from Tiled Exits layer`);
    }
    for (const id of tiledIds) {
      if (!contractExitIds.includes(id)) add('LINT-6', `Tiled exit "${id}" is not in the contract`);
    }
    for (const ex of tiledExits) {
      const cEx = manifest?.exits[ex.id];
      if (cEx && (ex.targetZone !== cEx.targetZone || ex.targetEntry !== cEx.targetEntry)) {
        add('LINT-6', `exit "${ex.id}" targets ${ex.targetZone}/${ex.targetEntry}, contract says ${cEx.targetZone}/${cEx.targetEntry}`);
      }
      const tz = ZONES[ex.targetZone];
      if (!tz) { add('LINT-6', `exit "${ex.id}" targetZone "${ex.targetZone}" does not exist`); continue; }
      const entry = (tz.entries || {})[ex.targetEntry];
      if (!entry) { add('LINT-6', `exit "${ex.id}" targetEntry "${ex.targetEntry}" not in ${ex.targetZone}.entries`); continue; }
      // rect must lie ON its declared edge
      const r = ex.rect;
      const onEdge = ex.edge === 'north' ? r.y <= 0 + SRC_TILE - 1
        : ex.edge === 'south' ? r.y + r.height >= (H - 1) * SRC_TILE
          : ex.edge === 'west' ? r.x <= SRC_TILE - 1
            : ex.edge === 'east' ? r.x + r.width >= (W - 1) * SRC_TILE : false;
      if (!onEdge) add('LINT-6', `exit "${ex.id}" rect not on its declared ${ex.edge} edge`);
      const axisMax = (ex.edge === 'north' || ex.edge === 'south') ? W : H;
      if (ex.tileRange[0] < 0 || ex.tileRange[1] >= axisMax || ex.tileRange[0] > ex.tileRange[1]) {
        add('LINT-6', `exit "${ex.id}" tileRange [${ex.tileRange}] out of map bounds`);
      }
      // at least one reachable tile within 2 tiles of the edge inside the range
      // (trigger fires on the sprite-CENTRE tile while the feet body sits ~1 tile lower,
      //  so a decorative collision band on the outer edge rows does not block the exit)
      let anyReach = false;
      for (let depth = 0; depth <= 2 && !anyReach; depth++) {
        for (let t = Math.max(0, ex.tileRange[0]); t <= Math.min(axisMax - 1, ex.tileRange[1]); t++) {
          const [x, y] = ex.edge === 'north' ? [t, depth] : ex.edge === 'south' ? [t, H - 1 - depth]
            : ex.edge === 'west' ? [depth, t] : [W - 1 - depth, t];
          if (reachable(x, y)) { anyReach = true; break; }
        }
      }
      if (!anyReach) add('LINT-5', `exit "${ex.id}" trigger approach (within 2 tiles of ${ex.edge} edge) unreachable from spawn`);
      // destination entry walkable (authored map if present, else procedural buildMap water check)
      const destMapFile = zoneIdToMapFile(ex.targetZone);
      if (fs.existsSync(destMapFile)) {
        try {
          const dm = JSON.parse(fs.readFileSync(destMapFile, 'utf8'));
          const dGround = dm.layers.find((l) => l.name === 'Ground');
          const dColl = dm.layers.find((l) => ['Collision', 'collision', 'Walls', 'walls'].includes(l.name));
          const dGids = classifyGids(dm);
          const di = entry.y * dm.width + entry.x;
          if (dGids.water.has(dGround?.data?.[di]) || (dColl?.data?.[di] ?? 0) !== 0) {
            add('LINT-6', `exit "${ex.id}" destination entry ${ex.targetZone}/${ex.targetEntry} tile not walkable`, entry.x, entry.y);
          }
        } catch { /* dest map unparseable -> its own lint run reports it */ }
      } else if (typeof tz.buildMap === 'function') {
        const grid = tz.buildMap();
        if (grid?.[entry.y]?.[entry.x] === 2 /* WATER */) {
          add('LINT-6', `exit "${ex.id}" destination entry ${ex.targetZone}/${ex.targetEntry} lands on procedural water`, entry.x, entry.y);
        }
      }
      // destination entry must not sit inside another exit's trigger range (teleport loop)
      for (const dEx of tz.exits || []) {
        const [lo, hi] = dEx.tileRange || [0, -1];
        const dW = tz.mapWidth; const dH = tz.mapHeight;
        const inTrigger = dEx.edge === 'north' ? (entry.y === 0 && entry.x >= lo && entry.x <= hi)
          : dEx.edge === 'south' ? (entry.y === dH - 1 && entry.x >= lo && entry.x <= hi)
            : dEx.edge === 'west' ? (entry.x === 0 && entry.y >= lo && entry.y <= hi)
              : (entry.x === dW - 1 && entry.y >= lo && entry.y <= hi);
        if (inTrigger) add('LINT-6', `entry ${ex.targetZone}/${ex.targetEntry} sits inside exit "${dEx.id}" trigger range (teleport loop)`, entry.x, entry.y);
      }
    }
    // every contract entries key still exists in zones.js
    if (manifest) {
      for (const ekey of manifest.entries) {
        if (!(zone.entries || {})[ekey]) add('LINT-6', `contract entry key "${ekey}" missing from zones.js entries`);
      }
    }
  }

  // ---------- LINT-7: contract completeness, exactly once ----------
  {
    const dupCheck = (list, label, rule = 'LINT-7') => {
      const seen = new Map();
      for (const item of list) {
        if (seen.has(item.id)) add(rule, `duplicate ${label} id "${item.id}"`, item.x, item.y);
        seen.set(item.id, item);
      }
      return seen;
    };
    const npcById = dupCheck(zone.npcs || [], 'NPC');
    const itById = dupCheck(zone.interactables || [], 'interactable');
    const spotById = dupCheck(spots, 'gathering spot');
    if (manifest) {
      for (const id of manifest.npcs) if (!npcById.has(id)) add('LINT-7', `contract NPC "${id}" not placed`);
      for (const id of npcById.keys()) if (!manifest.npcs.has(id)) add('LINT-7', `unknown NPC id "${id}" (not in contract)`);
      for (const id of manifest.interactables) if (!itById.has(id)) add('LINT-7', `contract interactable "${id}" not placed`);
      for (const id of itById.keys()) if (!manifest.interactables.has(id)) add('LINT-7', `unknown interactable id "${id}" (not in contract)`);
      for (const id of manifest.spots) if (!spotById.has(id)) add('LINT-7', `contract gathering spot "${id}" not placed`);
      for (const id of spotById.keys()) if (!manifest.spots.has(id)) add('LINT-7', `unknown gathering spot id "${id}" (not in contract)`);
    }
    // doors -> interiors registry, and interior must contain an isExit door
    for (const it of zone.interactables || []) {
      if (it.type !== 'door') continue;
      const interior = INTERIORS[it.interiorId];
      if (!interior) { add('LINT-7', `door ${it.id} interiorId "${it.interiorId}" not in INTERIORS registry`, it.x, it.y); continue; }
      const hasExit = (interior.interactables || []).some((d) => d.type === 'door' && d.isExit === true);
      if (!hasExit) add('LINT-7', `interior "${it.interiorId}" (door ${it.id}) has no isExit:true door`, it.x, it.y);
      // LAW-16 (WARN): door should sit within 2 tiles of a building footprint
      const nearBuilding = foots.some(({ obj, fp }) => obj.collide
        && (fp.tx1 - fp.tx0 >= 1 || fp.ty1 - fp.ty0 >= 1)
        && it.x >= fp.tx0 - 2 && it.x <= fp.tx1 + 2 && it.y >= fp.ty0 - 2 && it.y <= fp.ty1 + 2);
      if (!nearBuilding) warn('LINT-7', `door ${it.id} is not within 2 tiles of any building sprite (LAW-16)`, it.x, it.y);
    }
  }

  // ---------- LINT-9: asset legality ----------
  {
    const seenKeys = new Set();
    for (const obj of objects) {
      const key = SPRITE_KEY_MAP[obj.key] || obj.key;
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);
      if (!allKnownKeys.has(key)) {
        add('LINT-9', `unknown spriteKey "${key}" — see docs/WORLD-MISSING-ASSETS.md`, obj.x, obj.y);
        continue;
      }
      if (CULTURAL_EXCLUDES.some((re) => re.test(key)) || EXTRA_CULTURAL_RE.some((re) => re.test(key))) {
        add('LINT-9', `culturally excluded spriteKey "${key}"`, obj.x, obj.y);
      }
      const entry = catalogByKey.get(key);
      if (entry?.type === 'spritesheet' && !ML.PROP_CROP_REGIONS[key] && !ANIMATED_DECO_PROPS[key]) {
        add('LINT-9', `spritesheet prop "${key}" has no PROP_CROP_REGIONS entry (whole sheet would render)`, obj.x, obj.y);
      }
    }
  }

  // ---------- LINT-10 (WARN): shoreline & seam sanity ----------
  {
    // straight water-land seams > 6 tiles (horizontal + vertical)
    const seam = (horiz) => {
      const [outer, inner] = horiz ? [H, W] : [W, H];
      for (let a = 1; a < outer; a++) {
        let run = 0; let runStart = 0;
        for (let b = 0; b < inner; b++) {
          const [x, y] = horiz ? [b, a] : [a, b];
          const [px, py] = horiz ? [b, a - 1] : [a - 1, b];
          const boundary = isWater(x, y) !== isWater(px, py);
          if (boundary) { if (run === 0) runStart = b; run++; } else {
            if (run > 6) warn('LINT-10', `straight water-land seam ${run} tiles long (LAW-17)`, horiz ? runStart : a, horiz ? a : runStart);
            run = 0;
          }
        }
        if (run > 6) warn('LINT-10', `straight water-land seam ${run} tiles long (LAW-17)`, horiz ? runStart : a, horiz ? a : runStart);
      }
    };
    seam(true); seam(false);
    // raw grass orthogonally adjacent to raw sand (missing transition)
    let rawAdjWarned = 0;
    for (let y = 0; y < H && rawAdjWarned < 5; y++) {
      for (let x = 0; x < W && rawAdjWarned < 5; x++) {
        if (!gids.rawGrass.has(G(x, y))) continue;
        for (const [dx, dy] of [[1, 0], [0, 1]]) {
          const nx = x + dx; const ny = y + dy;
          if (inBounds(nx, ny) && gids.rawSand.has(G(nx, ny))) {
            warn('LINT-10', 'raw grass GID orthogonally adjacent to raw sand GID (missing transition, WORLD-MISSING-ASSETS #5)', x, y);
            rawAdjWarned++;
            break;
          }
        }
      }
    }
    // straight single-material district boundary > 8 tiles (family boundary, LAW-44)
    const famAt = (x, y) => gids.tilesetOf(G(x, y))?.family || 'none';
    const famSeam = (horiz) => {
      const [outer, inner] = horiz ? [H, W] : [W, H];
      for (let a = 1; a < outer; a++) {
        let run = 0; let runStart = 0; let pair = '';
        for (let b = 0; b < inner; b++) {
          const [x, y] = horiz ? [b, a] : [a, b];
          const [px, py] = horiz ? [b, a - 1] : [a - 1, b];
          const f1 = famAt(x, y); const f2 = famAt(px, py);
          const boundary = f1 !== f2 && f1 !== 'water' && f2 !== 'water';
          const thisPair = boundary ? `${f1}|${f2}` : '';
          if (boundary && thisPair === pair) run++;
          else if (boundary) { if (run > 8) warn('LINT-10', `straight ${pair.replace('|', '/')} district boundary ${run} tiles long (LAW-44)`, horiz ? runStart : a, horiz ? a : runStart); pair = thisPair; run = 1; runStart = b; }
          else { if (run > 8) warn('LINT-10', `straight ${pair.replace('|', '/')} district boundary ${run} tiles long (LAW-44)`, horiz ? runStart : a, horiz ? a : runStart); run = 0; pair = ''; }
        }
        if (run > 8) warn('LINT-10', `straight ${pair.replace('|', '/')} district boundary ${run} tiles long (LAW-44)`, horiz ? runStart : a, horiz ? a : runStart);
      }
    };
    famSeam(true); famSeam(false);
  }

  return findings;
}

// ── main ────────────────────────────────────────────────────────────────────────────────────

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node scripts/lint-world-map.mjs <zone_id> | --all');
    process.exit(1);
  }

  const [{ ZONES }, gathering, { KENMI_CATALOG }, spriteMap, manifests, interiorsMod] = await Promise.all([
    imp('src/data/zones.js'),
    imp('src/data/gatheringSpots.js'),
    imp('src/data/kenmiCatalog.js'),
    imp('src/data/spriteKeyMap.js'),
    imp('src/data/zoneAssetManifests.js'),
    imp('src/data/interiors.js'),
  ]);

  const catalogByKey = new Map(KENMI_CATALOG.map((e) => [e.key, e]));
  const allKnownKeys = new Set([
    ...KENMI_CATALOG.map((e) => e.key),
    ...(manifests.SHARED_ASSETS || []).map((e) => e.key),
  ]);

  const ctx = {
    ZONES,
    GATHERING_SPOTS: gathering.GATHERING_SPOTS,
    getGatheringSpotsForZone: gathering.getGatheringSpotsForZone,
    KENMI_CATALOG,
    catalogByKey,
    allKnownKeys,
    SPRITE_KEY_MAP: spriteMap.SPRITE_KEY_MAP || {},
    CULTURAL_EXCLUDES: spriteMap.CULTURAL_EXCLUDES || [],
    ANIMATED_DECO_PROPS: spriteMap.ANIMATED_DECO_PROPS || {},
    INTERIORS: interiorsMod.INTERIORS,
    ML: parseMapLoaderConstants(),
    contract: parseContractManifest(),
    interiorContract: parseInteriorManifest(),
  };

  // --all: every core zone — interiors are always linted; the exterior map lint runs only for
  // zones that have an authored Tiled map (the rest are still on the procedural path).
  const zoneIds = arg === '--all' ? CORE_ZONES : [arg];

  let errors = 0; let warns = 0;
  for (const zoneId of zoneIds) {
    const skipExterior = arg === '--all' && !fs.existsSync(zoneIdToMapFile(zoneId));
    const findings = skipExterior ? [] : await lintZone(zoneId, ctx);
    findings.push(...lintZoneInteriors(zoneId, ctx));
    for (const f of findings) {
      const loc = f.x != null ? ` at tile (${f.x},${f.y})` : '';
      const line = `${f.rule} ${zoneId} ${f.what}${loc}`;
      if (f.level === 'ERROR') { errors++; console.log(line); }
      else { warns++; console.log(`WARN ${line}`); }
    }
    const zErr = findings.filter((f) => f.level === 'ERROR').length;
    const zWarn = findings.length - zErr;
    console.log(`-- ${zoneId}: ${zErr} error(s), ${zWarn} warning(s)`);
  }
  console.log(`== TOTAL: ${errors} error(s), ${warns} warning(s) across ${zoneIds.length} zone(s)`);
  process.exit(errors > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('lint-world-map crashed:', e);
  process.exit(1);
});
