#!/usr/bin/env node
/**
 * generate-map-from-design.mjs — Author a zone's Tiled JSON map from its approved
 * Phase-1 design document (docs/world-designs/<zone_id>.md).
 *
 * Usage:
 *   node scripts/generate-map-from-design.mjs <zone_id>     # e.g. oasis_village
 *
 * Reads:
 *   - docs/world-designs/<zone_id>.md          (canonical ASCII grid + §5 placement tables)
 *   - docs/world-design-research/contract-and-pipeline.md §1 (exit targetZone/targetEntry)
 *   - src/data/kenmiCatalog.js                 (texture-key legality for tilesets + buildings)
 *
 * Writes:
 *   - public/assets/maps/<zone-id-with-hyphens>.json
 *
 * Output structure (contract-and-pipeline.md §2 template):
 *   - tilelayer  "Ground"        — full coverage, 16px GIDs (scaled 4x at runtime)
 *   - tilelayer  "GroundDetail"  — grass-blob overlay (desert-grass edge frames are
 *                                  partially TRANSPARENT and must render over sand)
 *   - tilelayer  "Collision"     — hidden; ANY non-zero GID = impassable (bible §6 doctrine:
 *                                  water + wet rim, cliffs, palm belt, building footprints,
 *                                  rock outcrops). Door tiles are never painted.
 *   - objectgroup "Exits"        — the ONLY runtime-consumed object layer (template §2).
 *   - objectgroups "Entries", "Buildings", "NPCs", "Interactables", "GatheringSpots",
 *     "StepTriggers", "SubAreas", "Decals" — REFERENCE layers for the zones.js wiring
 *     agents (TiledMapLoader exposes them via map.objects; nothing consumes them yet).
 *
 * GID / frame decisions (verified against the PNGs pixel-by-pixel, 2026-07-03):
 *   - desert-beach-tiles-1/2/3 (5x3): frame 6 = solid sand. Hue roles: 1 = base sand,
 *     2 = plaza paving (redder packed earth), 3 = road/lane (grey-tan packed dirt).
 *     Frames 13/14 are fully transparent — never placed.
 *   - desert-water-tiles-1 (6x3): the RIGHT 3x3 blob (3,4,5 / 9,10,11 / 15,16,17) is the
 *     pool-in-sand autotile, fully opaque, transitions live INSIDE the water tiles
 *     (f3=bank N+W ... f10=open water ... f17=bank S+E). The design's `w` wet-rim cells and
 *     `~` open-water cells form ONE water body autotiled from the water's perspective.
 *     Left blob (0..2,6..8,12..14) is a transparent-centre overlay ring — unused.
 *   - desert-grass (3x5): frames 0-8 = sand-hole-in-grass blob (partially transparent),
 *     9,10,12,13 = 2x2 patch corners, 11 = solid grass. Placed on GroundDetail:
 *     edge frames are chosen from the patch's perspective (sand at N -> f7 etc.).
 *   - desert-cliff-tiles-1 (13x11): f41/f54/f67 = opaque dark rock-face column
 *     (top/middle/base); f98,f111,f124,f137 (+decorated f100,f113,f126,f139) = opaque
 *     plateau/rubble floor used for the ruins court `r`.
 *
 * Marks (`@ A W * D ...`) replace the terrain glyph they stand on; their underlay is
 * resolved by orthogonal-neighbour majority with tie priority
 * water > road > lane > plaza > rubble > grass > decal > sand (matches the design notes:
 * "`M` on lane, `A`/`W`/`*` on grass, `@` on road", rim spot on the wet rim).
 *
 * Theme support: only `desert` glyph->tileset profiles are implemented (oasis_village,
 * ancient_library, desert_marketplace, bedouin_camp, royal_palace). Snow/grass themed
 * zones need a theme profile added here before reuse.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');
const SRC_TILE = 16;

const zoneId = process.argv[2];
if (!zoneId) {
  console.error('Usage: node scripts/generate-map-from-design.mjs <zone_id>');
  process.exit(1);
}
const DESIGN_MD = path.join(REPO, 'docs', 'world-designs', `${zoneId}.md`);
const CONTRACT_MD = path.join(REPO, 'docs', 'world-design-research', 'contract-and-pipeline.md');
const OUT = path.join(REPO, 'public', 'assets', 'maps', `${zoneId.replace(/_/g, '-')}.json`);

const md = fs.readFileSync(DESIGN_MD, 'utf8');
const catalogSrc = fs.readFileSync(path.join(REPO, 'src', 'data', 'kenmiCatalog.js'), 'utf8');
const catalogKeys = new Set([...catalogSrc.matchAll(/key:\s*"([^"]+)"/g)].map((m) => m[1]));

const warnings = [];
const warn = (msg) => { warnings.push(msg); console.warn(`WARN: ${msg}`); };
const die = (msg) => { console.error(`ERROR: ${msg}`); process.exit(1); };

// ────────────────────────────────────────────────────────────────────────────
// 1. Parse the design doc
// ────────────────────────────────────────────────────────────────────────────

// Dimensions — "## 2. Dimensions" ... "**40 × 30 tiles**"
const dimM = md.match(/\*\*(\d+)\s*[×x]\s*(\d+)\s*tiles\*\*/);
if (!dimM) die('could not parse dimensions ("**W × H tiles**")');
const W = +dimM[1];
const H = +dimM[2];

// Canonical grid — first fenced block whose lines look like "<W chars> <rowIndex>"
function parseGrid() {
  const blocks = [...md.matchAll(/```\n([\s\S]*?)```/g)].map((m) => m[1]);
  for (const block of blocks) {
    const rows = [];
    for (const line of block.split('\n')) {
      const m = line.match(/^(.*\S)\s+(\d+)\s*$/);
      if (m && m[1].length === W && !/^[\d\s]+$/.test(m[1])) rows[+m[2]] = m[1];
    }
    if (rows.filter(Boolean).length >= H) return rows.slice(0, H);
  }
  return null;
}
const grid = parseGrid();
if (!grid || grid.length !== H || grid.some((r) => !r || r.length !== W)) {
  die(`could not parse a ${W}x${H} canonical grid from the design doc`);
}

// Buildings table — "| B1 | name | `asset` … | (x0,y0)–(x1,y1) | door… |"
const buildings = [];
for (const m of md.matchAll(/^\|\s*B(\d+)\s*\|\s*([^|]+?)\s*\|\s*`([\w.-]+)`[^|]*\|\s*\((\d+),(\d+)\)[–-]\((\d+),(\d+)\)\s*\|\s*([^|]+?)\s*\|$/gm)) {
  const doorM = m[8].match(/`([\w-]+)`\s*\((\d+),(\d+)\)/);
  buildings.push({
    id: `B${m[1]}`, label: m[2], asset: m[3],
    x0: +m[4], y0: +m[5], x1: +m[6], y1: +m[7],
    door: doorM ? { id: doorM[1], x: +doorM[2], y: +doorM[3] } : null,
  });
}
if (!buildings.length) warn('no buildings parsed from the Buildings table');

// spawnPoint — "spawnPoint **(x,y)**"
const spawnM = md.match(/spawnPoint\s*\*\*\((\d+),(\d+)\)\*\*/);
if (!spawnM) die('could not parse spawnPoint');
const spawn = { x: +spawnM[1], y: +spawnM[2] };

// Exits — "| `id` | edge=north, tileRange **[a,b]** …" + entry rows "| entry `key` | **(x,y)** |"
const exits = [];
const entries = [];
for (const m of md.matchAll(/^\|\s*`([\w-]+)`\s*\|\s*edge=(\w+),\s*tileRange\s*\*\*\[(\d+),(\d+)\]\*\*/gm)) {
  exits.push({ id: m[1], edge: m[2], range: [+m[3], +m[4]] });
}
for (const m of md.matchAll(/^\|\s*entry\s*`(\w+)`\s*\|\s*\*\*\((\d+),(\d+)\)\*\*/gm)) {
  entries.push({ key: m[1], x: +m[2], y: +m[3] });
}
if (!exits.length) die('no exits parsed');

// Exit targets come from the contract §1 (design doc omits targetZone/targetEntry)
function contractExitTargets() {
  const s1 = md.length; // placeholder to keep lints quiet
  void s1;
  const cmd = fs.readFileSync(CONTRACT_MD, 'utf8');
  const start = cmd.search(/^## 1\./m);
  const end = cmd.search(/^## 2\./m);
  const sec = cmd.slice(start, end);
  const zsec = sec.split(/^### /m).find((s) => s.startsWith(`${zoneId} —`));
  if (!zsec) die(`zone ${zoneId} not found in contract §1`);
  const out = {};
  for (const m of zsec.matchAll(/`([\w-]+)`: edge=\w+ tileRange=\[\d+,\d+\] → (\w+)\/(\w+)/g)) {
    out[m[1]] = { targetZone: m[2], targetEntry: m[3] };
  }
  return out;
}
const exitTargets = contractExitTargets();
for (const ex of exits) {
  if (!exitTargets[ex.id]) die(`exit "${ex.id}" not in contract §1`);
  Object.assign(ex, exitTargets[ex.id]);
}

// NPCs — "| `id` | (x,y) | …" inside the NPCs table
function tableRows(sectionRe) {
  const start = md.search(sectionRe);
  if (start === -1) return '';
  const rest = md.slice(start);
  const next = rest.slice(10).search(/^\*\*|^## /m);
  return next === -1 ? rest : rest.slice(0, next + 10);
}
const npcSec = tableRows(/^\*\*NPCs \(\d+\):\*\*/m);
const npcs = [...npcSec.matchAll(/^\|\s*`([\w-]+)`\s*\|\s*\((\d+),(\d+)\)\s*\|/gm)]
  .map((m) => ({ id: m[1], x: +m[2], y: +m[3] }));

const itSec = tableRows(/^\*\*Interactables \(\d+\):\*\*/m);
const interactables = [];
for (const m of itSec.matchAll(/^\|\s*`([\w.-]+)`\s*\|\s*\((\d+),(\d+)\)\s*\|\s*([^|]*)\|/gm)) {
  const it = { id: m[1], x: +m[2], y: +m[3], type: m[1].split('-')[0] };
  const rat = m[4];
  const lockM = rat.match(/\[locked:\s*`?([\w]+)`?\]/);
  if (lockM) { it.locked = true; it.unlockFlag = lockM[1]; }
  const intM = rat.match(/→\s*`?([\w]+_interior)`?/);
  if (intM) it.interiorId = intM[1];
  interactables.push(it);
}

const spotSec = tableRows(/^\*\*Gathering spots \(\d+\):\*\*/m);
const spots = [...spotSec.matchAll(/^\|\s*`(spot_[\w]+)`\s*\|\s*([\w]+)\s*\/\s*([\w]+)\s*\|\s*\((\d+),(\d+)\)/gm)]
  .map((m) => ({ id: m[1], item: m[2], gatherType: m[3], x: +m[4], y: +m[5] }));

const trigSec = tableRows(/^\*\*Step triggers \(\d+\):\*\*/m);
const stepTriggers = [...trigSec.matchAll(/^\|\s*`([\w-]+)`\s*\|\s*\((\d+),(\d+)\)\s*(\d+)[×x](\d+)/gm)]
  .map((m) => ({ id: m[1], x: +m[2], y: +m[3], w: +m[4], h: +m[5] }));

const subAreas = [...md.matchAll(/`([\w-]+)`\s*\((\d+),(\d+)\)\s*(\d+)[×x](\d+)/g)]
  .filter((m) => /market|shore|residential|ruins|district|quarter|square/.test(m[1]))
  .map((m) => ({ id: m[1], x: +m[2], y: +m[3], w: +m[4], h: +m[5] }));

console.log(`parsed: ${npcs.length} NPCs, ${interactables.length} interactables, ${spots.length} spots, ${stepTriggers.length} stepTriggers, ${exits.length} exits, ${entries.length} entries, ${buildings.length} buildings, ${subAreas.length} subAreas`);

// ────────────────────────────────────────────────────────────────────────────
// 2. Tilesets (desert theme profile)
// ────────────────────────────────────────────────────────────────────────────

function tilesetDef(name, image, imagewidth, imageheight, firstgid) {
  const columns = imagewidth / SRC_TILE;
  return {
    firstgid, name, image, imagewidth, imageheight,
    tilewidth: SRC_TILE, tileheight: SRC_TILE,
    columns, tilecount: columns * (imageheight / SRC_TILE), margin: 0, spacing: 0,
  };
}
let nextGid = 1;
const addTs = (name, image, iw, ih) => {
  const ts = tilesetDef(name, image, iw, ih, nextGid);
  nextGid += ts.tilecount;
  if (!catalogKeys.has(name)) die(`tileset name "${name}" is not a kenmiCatalog key`);
  return ts;
};
const TS_SAND1 = addTs('kenmi-desert-tiles-desert-beach-tiles-1', '../kenmi/desert/tiles/desert-beach-tiles-1.png', 80, 48);
const TS_SAND2 = addTs('kenmi-desert-tiles-desert-beach-tiles-2', '../kenmi/desert/tiles/desert-beach-tiles-2.png', 80, 48);
const TS_SAND3 = addTs('kenmi-desert-tiles-desert-beach-tiles-3', '../kenmi/desert/tiles/desert-beach-tiles-3.png', 80, 48);
const TS_WATER = addTs('kenmi-desert-tiles-desert-water-tiles-1', '../kenmi/desert/tiles/desert-water-tiles-1.png', 96, 48);
const TS_GRASS = addTs('kenmi-desert-tiles-desert-grass', '../kenmi/desert/tiles/desert-grass.png', 48, 80);
const TS_CLIFF = addTs('kenmi-desert-tiles-desert-cliff-tiles-1', '../kenmi/desert/tiles/desert-cliff-tiles-1.png', 208, 176);
const tilesets = [TS_SAND1, TS_SAND2, TS_SAND3, TS_WATER, TS_GRASS, TS_CLIFF];

const SAND_SOLID = 6;                       // 5x3 beach sheets: (1,1) solid sand
const G_SAND = TS_SAND1.firstgid + SAND_SOLID;   // base sand `.` `,`
const G_PLAZA = TS_SAND2.firstgid + SAND_SOLID;  // plaza paving `p`
const G_ROAD = TS_SAND3.firstgid + SAND_SOLID;   // road `=` / lane `-` / exit cut `X`
// water pool-in-sand blob (right 3x3 of the 6x3 sheet), keyed by open (land) sides
const WATER_F = { NW: 3, N: 4, NE: 5, W: 9, C: 10, E: 11, SW: 15, S: 16, SE: 17 };
// grass overlay frames (3 cols): hole-blob edges + 2x2 patch corners + solid
const GRASS_F = {
  SOLID: 11,
  EDGE_N: 7, EDGE_S: 1, EDGE_W: 5, EDGE_E: 3,           // sand on that side
  CORNER_NW: 9, CORNER_NE: 10, CORNER_SW: 12, CORNER_SE: 13, // sand on both sides
  INNER_NW: 8, INNER_NE: 6, INNER_SW: 2, INNER_SE: 0,   // sand on that diagonal only
};
const CLIFF_F = { FACE_TOP: 41, FACE_MID: 54, FACE_BASE: 67 };
const RUBBLE_F = [98, 111, 124, 137, 100, 113, 126, 139]; // plain x4 + decorated x4
const COLLIDE_GID = G_SAND; // any non-zero GID marks impassable (hidden layer)

// ────────────────────────────────────────────────────────────────────────────
// 3. Terrain resolution
// ────────────────────────────────────────────────────────────────────────────

const TERRAIN_CHARS = new Set(['C', 'P', '.', ',', 'g', '~', 'w', '=', '-', 'p', 'r', 'o', 'X']);
const raw = (x, y) => (x >= 0 && x < W && y >= 0 && y < H ? grid[y][x] : 'C');

// terrain[y][x]: one of C P . , g ~ w = - p r o X #  (marks resolved to underlay)
const terrain = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => {
  const ch = raw(x, y);
  if (TERRAIN_CHARS.has(ch)) return ch;
  if (ch === '#') return '#';
  return null; // mark — resolve below
}));

const decalCells = [];
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (raw(x, y) === ',') decalCells.push([x, y]);

// resolve marks by orthogonal-neighbour majority (walkable terrains only)
const PRIORITY = ['w', '=', '-', 'p', 'r', 'g', ',', '.'];   // tie-break order; '~'+'w' merge to 'w'
const classOf = (t) => (t === '~' || t === 'w' ? 'w' : t === 'X' ? '=' : t);
for (let pass = 0; pass < 3; pass++) {
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (terrain[y][x] !== null) continue;
      const counts = {};
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const t = (y + dy >= 0 && y + dy < H && x + dx >= 0 && x + dx < W) ? terrain[y + dy][x + dx] : null;
        if (t === null || t === 'C' || t === 'P' || t === '#' || t === 'o') continue;
        const c = classOf(t);
        counts[c] = (counts[c] || 0) + 1;
      }
      const best = PRIORITY.filter((c) => counts[c])
        .sort((a, b) => counts[b] - counts[a] || PRIORITY.indexOf(a) - PRIORITY.indexOf(b))[0];
      if (best) terrain[y][x] = best === 'w' ? 'w' : best;
    }
  }
}
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (terrain[y][x] === null) terrain[y][x] = '.';

// cross-check building rects against '#' cells
for (const b of buildings) {
  for (let y = b.y0; y <= b.y1; y++) {
    for (let x = b.x0; x <= b.x1; x++) {
      const ch = raw(x, y);
      if (ch !== '#' && !/[A-Za-z@+*]/.test(ch)) warn(`building ${b.id} rect covers non-footprint glyph '${ch}' at (${x},${y})`);
      terrain[y][x] = raw(x, y) === 'D' || (b.door && b.door.x === x && b.door.y === y) ? terrain[y][x] : '#';
    }
  }
  if (b.door) terrain[b.door.y][b.door.x] = '.'; // door tile: sand underlay, never collision
}

// ────────────────────────────────────────────────────────────────────────────
// 4. Layers
// ────────────────────────────────────────────────────────────────────────────

const ground = new Array(W * H).fill(0);
const detail = new Array(W * H).fill(0);
const collision = new Array(W * H).fill(0);

const T = (x, y) => (x >= 0 && x < W && y >= 0 && y < H ? terrain[y][x] : 'C');
const isWaterT = (x, y) => T(x, y) === '~' || T(x, y) === 'w';
const isGrassT = (x, y) => T(x, y) === 'g';
const isCliffT = (x, y) => T(x, y) === 'C';
const hash = (x, y) => { const h = (x * 73856093) ^ (y * 19349663); return ((h % 1024) + 1024) % 1024; };

function waterFrame(x, y) {
  const n = !isWaterT(x, y - 1); const s = !isWaterT(x, y + 1);
  const w = !isWaterT(x - 1, y); const e = !isWaterT(x + 1, y);
  if (n && w && !s && !e) return WATER_F.NW;
  if (n && e && !s && !w) return WATER_F.NE;
  if (s && w && !n && !e) return WATER_F.SW;
  if (s && e && !n && !w) return WATER_F.SE;
  if (n && !s && !w && !e) return WATER_F.N;
  if (s && !n && !w && !e) return WATER_F.S;
  if (w && !e && !n && !s) return WATER_F.W;
  if (e && !w && !n && !s) return WATER_F.E;
  return WATER_F.C; // interior, straits and 3-sided nubs fall back to open water
}

function grassFrame(x, y) {
  const n = !isGrassT(x, y - 1); const s = !isGrassT(x, y + 1);
  const w = !isGrassT(x - 1, y); const e = !isGrassT(x + 1, y);
  if (n && w) return GRASS_F.CORNER_NW;
  if (n && e) return GRASS_F.CORNER_NE;
  if (s && w) return GRASS_F.CORNER_SW;
  if (s && e) return GRASS_F.CORNER_SE;
  if (n) return GRASS_F.EDGE_N;
  if (s) return GRASS_F.EDGE_S;
  if (w) return GRASS_F.EDGE_W;
  if (e) return GRASS_F.EDGE_E;
  // interior: inner corners where sand touches diagonally
  const nw = !isGrassT(x - 1, y - 1); const ne = !isGrassT(x + 1, y - 1);
  const sw = !isGrassT(x - 1, y + 1); const se = !isGrassT(x + 1, y + 1);
  if (nw && !ne && !sw && !se) return GRASS_F.INNER_NW;
  if (ne && !nw && !sw && !se) return GRASS_F.INNER_NE;
  if (sw && !nw && !ne && !se) return GRASS_F.INNER_SW;
  if (se && !nw && !ne && !sw) return GRASS_F.INNER_SE;
  return GRASS_F.SOLID;
}

function cliffFrame(x, y) {
  if (!isCliffT(x, y + 1)) return CLIFF_F.FACE_BASE; // rock base meets the ground below
  if (!isCliffT(x, y - 1)) return CLIFF_F.FACE_TOP;
  return CLIFF_F.FACE_MID;
}

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    const t = terrain[y][x];
    switch (t) {
      case 'C':
        ground[i] = TS_CLIFF.firstgid + cliffFrame(x, y);
        collision[i] = COLLIDE_GID;
        break;
      case 'P': // palm belt: sand ground (palm props are zones.js objects), impassable
      case 'o': // rock outcrop: sand ground (rock prop later), impassable
      case '#': // building footprint reservation
        ground[i] = G_SAND;
        collision[i] = COLLIDE_GID;
        break;
      case '~': case 'w':
        ground[i] = TS_WATER.firstgid + waterFrame(x, y);
        collision[i] = COLLIDE_GID; // bible §6: water + wet rim are impassable
        break;
      case 'g':
        ground[i] = G_SAND;
        detail[i] = TS_GRASS.firstgid + grassFrame(x, y);
        break;
      case '=': case 'X': case '-':
        ground[i] = G_ROAD;
        break;
      case 'p':
        ground[i] = G_PLAZA;
        break;
      case 'r':
        ground[i] = TS_CLIFF.firstgid + RUBBLE_F[hash(x, y) % 4 === 0 ? 4 + (hash(x, y) % 4) : hash(x, y) % 4];
        break;
      default: // '.', ','
        ground[i] = G_SAND;
    }
  }
}

// sanity — full ground coverage, all GIDs decode
const maxGid = nextGid - 1;
if (ground.some((g) => g === 0)) die('Ground layer has empty cells');
for (const [name, data] of [['Ground', ground], ['GroundDetail', detail], ['Collision', collision]]) {
  for (const g of data) if (g !== 0 && (g < 1 || g > maxGid)) die(`${name} GID ${g} out of tileset range`);
}
// walkability sanity on authored data (full lint runs separately)
const walk = (x, y) => x >= 0 && x < W && y >= 0 && y < H && collision[y * W + x] === 0;
if (!walk(spawn.x, spawn.y)) warn(`spawnPoint (${spawn.x},${spawn.y}) is not walkable`);
for (const e of entries) if (!walk(e.x, e.y)) warn(`entry ${e.key} (${e.x},${e.y}) is not walkable`);
for (const n of npcs) if (!walk(n.x, n.y)) warn(`NPC ${n.id} (${n.x},${n.y}) on collision`);
for (const it of interactables) {
  if (it.type === 'door' && !walk(it.x, it.y)) warn(`door ${it.id} (${it.x},${it.y}) on collision`);
}
for (const sp of spots) if (!walk(sp.x, sp.y)) warn(`gathering spot ${sp.id} (${sp.x},${sp.y}) on collision`);

// ────────────────────────────────────────────────────────────────────────────
// 5. Object layers
// ────────────────────────────────────────────────────────────────────────────

let nextObjectId = 1;
const P = (name, type, value) => ({ name, type, value });
const obj = (name, x, y, w, h, properties, type = '') => ({
  id: nextObjectId++, name, type, x, y, width: w, height: h,
  rotation: 0, visible: true, ...(properties?.length ? { properties } : {}),
});
const tileObj = (name, tx, ty, props, type) => obj(name, tx * SRC_TILE, ty * SRC_TILE, SRC_TILE, SRC_TILE, props, type);

const exitObjects = exits.map((ex) => {
  const [a, b] = ex.range;
  const horiz = ex.edge === 'north' || ex.edge === 'south';
  const x = horiz ? a * SRC_TILE : (ex.edge === 'west' ? 0 : (W - 1) * SRC_TILE);
  const y = horiz ? (ex.edge === 'north' ? 0 : (H - 1) * SRC_TILE) : a * SRC_TILE;
  const w = horiz ? (b - a + 1) * SRC_TILE : SRC_TILE;
  const h = horiz ? SRC_TILE : (b - a + 1) * SRC_TILE;
  return obj(ex.id, x, y, w, h, [
    P('targetZone', 'string', ex.targetZone),
    P('targetEntry', 'string', ex.targetEntry),
    P('edge', 'string', ex.edge),
  ], 'exit');
});

const entryObjects = [
  ...entries.map((e) => tileObj(e.key, e.x, e.y, [P('entryKey', 'string', e.key)], 'entry')),
  tileObj('spawnPoint', spawn.x, spawn.y, [], 'spawn'),
];
const buildingObjects = buildings.map((b) => obj(b.id, b.x0 * SRC_TILE, b.y0 * SRC_TILE,
  (b.x1 - b.x0 + 1) * SRC_TILE, (b.y1 - b.y0 + 1) * SRC_TILE, [
    P('assetKey', 'string', `kenmi-desert-houses-${b.asset}`),
    P('label', 'string', b.label),
    ...(b.door ? [P('doorId', 'string', b.door.id)] : [P('enterable', 'bool', false)]),
  ], 'building'));
for (const b of buildingObjects) {
  const key = b.properties.find((p) => p.name === 'assetKey').value;
  if (!catalogKeys.has(key)) warn(`building assetKey "${key}" not in kenmiCatalog`);
}
const npcObjects = npcs.map((n) => tileObj(n.id, n.x, n.y, [], 'npc'));
const itObjects = interactables.map((it) => tileObj(it.id, it.x, it.y, [
  ...(it.interiorId ? [P('interiorId', 'string', it.interiorId)] : []),
  ...(it.locked ? [P('locked', 'bool', true), P('unlockFlag', 'string', it.unlockFlag)] : []),
], it.type));
const spotObjects = spots.map((s) => tileObj(s.id, s.x, s.y, [
  P('item', 'string', s.item), P('gatherType', 'string', s.gatherType),
], 'gathering_spot'));
const trigObjects = stepTriggers.map((t) => obj(t.id, t.x * SRC_TILE, t.y * SRC_TILE, t.w * SRC_TILE, t.h * SRC_TILE, [], 'step_trigger'));
const subAreaObjects = subAreas.map((s) => obj(s.id, s.x * SRC_TILE, s.y * SRC_TILE, s.w * SRC_TILE, s.h * SRC_TILE, [], 'sub_area'));
const decalObjects = decalCells.map(([x, y]) => tileObj('decal-hint', x, y, [], 'decal'));

// ────────────────────────────────────────────────────────────────────────────
// 6. Assemble + write
// ────────────────────────────────────────────────────────────────────────────

let layerId = 1;
const tileLayer = (name, data, visible = true) => ({
  id: layerId++, name, type: 'tilelayer', visible, opacity: 1, x: 0, y: 0, width: W, height: H, data,
});
const objLayer = (name, objects) => ({
  id: layerId++, name, type: 'objectgroup', visible: true, opacity: 1, x: 0, y: 0, draworder: 'topleft', objects,
});

const map = {
  compressionlevel: -1,
  width: W, height: H,
  tilewidth: SRC_TILE, tileheight: SRC_TILE,
  infinite: false,
  orientation: 'orthogonal',
  renderorder: 'right-down',
  type: 'map',
  version: '1.10',
  tiledversion: '1.11.0',
  tilesets,
  layers: [
    tileLayer('Ground', ground),
    tileLayer('GroundDetail', detail),
    tileLayer('Collision', collision, false),
    objLayer('Exits', exitObjects),
    objLayer('Entries', entryObjects),
    objLayer('Buildings', buildingObjects),
    objLayer('NPCs', npcObjects),
    objLayer('Interactables', itObjects),
    objLayer('GatheringSpots', spotObjects),
    objLayer('StepTriggers', trigObjects),
    objLayer('SubAreas', subAreaObjects),
    objLayer('Decals', decalObjects),
  ],
};
map.nextlayerid = layerId;
map.nextobjectid = nextObjectId;

fs.writeFileSync(OUT, JSON.stringify(map, null, 2) + '\n', 'utf8');

const census = {};
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) census[terrain[y][x]] = (census[terrain[y][x]] || 0) + 1;
const collideCount = collision.filter((g) => g !== 0).length;
console.log(`[generate-map-from-design] wrote ${path.relative(REPO, OUT)}`);
console.log(`  size ${W}x${H}, tilesets ${tilesets.length}, layers ${map.layers.length}, objects ${nextObjectId - 1}`);
console.log(`  terrain census: ${Object.entries(census).map(([k, v]) => `${k}=${v}`).join(' ')}`);
console.log(`  collision tiles: ${collideCount}, grass detail tiles: ${detail.filter(Boolean).length}`);
if (warnings.length) console.log(`  ${warnings.length} warning(s) — review above`);
