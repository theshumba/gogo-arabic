#!/usr/bin/env node
/**
 * generate-map-from-design.mjs — Author a zone's Tiled JSON map from its approved
 * Phase-1 design document (docs/world-designs/<zone_id>.md).
 *
 * Usage:
 *   node scripts/generate-map-from-design.mjs <zone_id>            # e.g. oasis_village
 *   node scripts/generate-map-from-design.mjs <zone_id> --census   # also dump glyph positions
 *                                                                  # (for the zones.js dressing pass)
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
 *   - tilelayer  "GroundDetail"  — overlay tiles that must render ABOVE Ground: grass blobs
 *                                  (partially transparent edges) and, on profile zones,
 *                                  perimeter-wall tiles (desert-fencewall autotile)
 *   - tilelayer  "Collision"     — hidden; ANY non-zero GID = impassable (bible §6 doctrine:
 *                                  water + wet rim, cliffs, palm belt, building footprints,
 *                                  rock outcrops, walls/towers, focal props). Door tiles are
 *                                  never painted.
 *   - objectgroup "Exits"        — the ONLY runtime-consumed object layer (template §2).
 *   - objectgroups "Entries", "Buildings", "NPCs", "Interactables", "GatheringSpots",
 *     "StepTriggers", "SubAreas", "Decals" — REFERENCE layers for the zones.js wiring
 *     agents (TiledMapLoader exposes them via map.objects; nothing consumes them yet).
 *
 * Engine split (Phase 3 extension, 2026-07-03):
 *   - LEGACY path — oasis_village ships on the original hardcoded desert glyph profile
 *     (verified byte-identical after this refactor; never touch its GID decisions).
 *   - PROFILE path — zones with an entry in ZONE_PROFILES get a data-driven glyph->class
 *     map plus per-zone tilesets. desert_marketplace is the first; later desert zones add
 *     their own profile entries instead of new scripts.
 *
 * GID / frame decisions (verified against the PNGs pixel-by-pixel, 2026-07-03):
 *   - desert-beach-tiles-1/2/3 (5x3): frame 6 = solid sand. Hue roles: 1 = base sand,
 *     2 = plaza paving / trampled souk floor (redder packed earth), 3 = road/lane
 *     (grey-tan packed dirt). Frames 13/14 are fully transparent — never placed.
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
 *   - cobble-road-2 (3x5): frames 0-8 = tan-cobble blob ON SAND — the baked background is
 *     RGB 228,166,114 = EXACTLY beach-tiles-1's solid tan, so blob edges blend seamlessly
 *     on base sand. f9/f12/f13 = solid variants, f10 = sand-pothole variant, f11/f14 are
 *     fully transparent — never placed. (cobble-road-1 is the same blob in blue-grey —
 *     rejected: fights the desert palette.)
 *   - pavement-tiles (9x8): frames 0,1,9,10 = the flat light-brick block (RGB 202,152,119);
 *     col 2+ of rows 0-1 transparent; the rest of the sheet is a raised-platform kit (unused).
 *   - desert-fencewall (4x4): col 0 = vertical run (top/mid/base = f0/f4/f8) + f12 short
 *     stub; row 0 = horizontal run (left cap/mid/right cap = f1/f2/f3); 3x3 block f5-f7/
 *     f9-f11/f13-f15 = corner + T-junction + cross atlas. Painted on GroundDetail from a
 *     N/S/E/W wall-neighbour mask.
 *
 * Marks (`@ A W * D ...`) replace the terrain glyph they stand on; their underlay is
 * resolved by orthogonal-neighbour majority with tie priority
 * water > road > lane > plaza > rubble > grass > decal > sand (matches the design notes:
 * "`M` on lane, `A`/`W`/`*` on grass, `@` on road", rim spot on the wet rim).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');
const SRC_TILE = 16;

const zoneId = process.argv[2];
const CENSUS = process.argv.includes('--census');
if (!zoneId) {
  console.error('Usage: node scripts/generate-map-from-design.mjs <zone_id> [--census]');
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
// 0. Zone theme profiles (PROFILE path). Legend glyphs are PER-ZONE: the same
//    char means different things in different design docs (oasis `P` = palm
//    belt, marketplace `P` = plaza paving), so each zone declares its own map.
//    class values: sand|trample|lane|road|pave|grass|wall|lowwall|
//                  sand+block|pave+block|trample+block  ('+block' paints Collision;
//                  the wiring pass must place a collide:true sprite there)
//                  null = mark, underlay resolved by neighbour majority, walkable.
// ────────────────────────────────────────────────────────────────────────────

const ZONE_PROFILES = {
  desert_marketplace: {
    classes: {
      '.': 'sand',
      ',': 'trample',        // trampled souk floor / sand variation (beach-tiles-2)
      '-': 'lane',           // secondary streets (beach-tiles-3, LAW-6 trampled read)
      '=': 'road',           // main caravan road (cobble-road-2 blob)
      E: null,               // exit cut — inherits road/lane from its neighbours
      P: 'pave',             // fountain plaza (pavement-tiles brick)
      g: 'grass',            // planter tufts by the fountain (GroundDetail overlay)
      '#': 'wall',           // adobe perimeter wall (fencewall autotile + Collision)
      T: 'wall',             // wall tower — wall tile below, obelisk sprite via zones.js
      v: 'lowwall',          // waist-high vista wall (fencewall stubs + Collision, LAW-46)
      p: 'sand+block',       // palm (sprite via zones.js)
      t: 'sand+block',       // dead tree
      '%': 'sand+block',     // rock outcrop
      '!': 'sand+block',     // obelisk pair at the warehouse axis
      F: 'pave+block',       // fountain focal (interactable sprite)
      S: 'trample+block',    // souk stalls (interactable sprites, LAW-37 grid)
      // o (prop clusters), r (rugs), c (camels), + (bunting) and all contract
      // marks (D C s b I N x *) resolve by neighbour majority and stay walkable;
      // physical props there are collide:true zones.js objects instead of paint.
    },
    tilesets: ['cobble', 'pave', 'wall'],
    buildingGlyphs: 'HXYV',
    buildings: [
      { contains: [5, 6], asset: 'desert-house-1.2', label: 'Home H1' },
      { contains: [10, 4], asset: 'desert-house-2.3', label: 'Home H2' },
      { contains: [6, 11], asset: 'desert-house-1.4', label: 'Home H3' },
      { contains: [32, 21], asset: 'desert-house-1.1', label: 'Home H4' },
      { contains: [39, 24], asset: 'desert-house-1.3', label: 'Home H5' },
      { contains: [11, 12], asset: 'desert-house-3.1', label: 'Spice Shop', doorId: 'door-spice-shop' },
      { contains: [30, 11], asset: 'desert-house-2.1', label: 'Textile Shop', doorId: 'door-textile-shop' },
      { contains: [36, 14], asset: 'desert-house-4.2', label: 'Warehouse', doorId: 'door-warehouse' },
    ],
    // neighbour-majority priority for mark underlays (first = strongest)
    priority: ['road', 'lane', 'pave', 'trample', 'grass', 'sand'],
    decalsFromComma: false, // ',' is a real floor material here, not a decal hint
  },
  farmland: {
    classes: {
      C: 'cliff',
      W: 'waterfall',
      w: 'water',
      c: 'farmland-wet',
      b: null,
      T: 'sand+block',
      s: 'sand',
      ',': 'scrub',
      g: 'grass',
      F: 'farmland',
      O: 'farmland',
      f: 'farmland+block',
      '.': 'lane',
      P: 'lane',
      B: 'bldg',
      '#': 'sand+block',
    },
    tilesets: ['farmland', 'water', 'waterfall', 'grass3', 'cliff'],
    buildingGlyphs: 'B',
    buildings: [
      {
        contains: [4, 5],
        assetKey: 'kenmi-desert-houses-desert-house-3.1',
        label: 'Farmhouse',
        doorId: 'door-barn',
      },
      {
        contains: [10, 4],
        assetKey: 'kenmi-base-buildings-buildings-unique-buildings-barn-barn-base-blue',
        label: 'Barn and Silo',
      },
      {
        contains: [17, 5],
        assetKey: 'kenmi-base-buildings-buildings-unique-buildings-windmill-windmill',
        label: 'Windmill',
      },
      {
        contains: [23, 6],
        assetKey: 'kenmi-base-buildings-buildings-unique-buildings-coop-coop-base-blue',
        label: 'Coop',
      },
    ],
    priority: ['water', 'farmland-wet', 'farmland', 'lane', 'grass', 'scrub', 'sand'],
    decalsFromComma: false,
  },
  mountain_village: {
    id: 'mountain_village',
    classes: {
      '#': 'cliff',
      '=': 'stone',
      ':': 'road',
      '.': 'stone',
      'v': 'waterfall',
      '~': 'water',
      B: 'bridge',
      C: 'cave',
      M: 'bldg',
      H: 'bldg',
      D: null,
      O: 'stone+block',
      r: 'stone+block',
      T: 'stone+block',
      f: 'stone+block',
      g: 'grass',
      d: 'trample',
      E: null,
    },
    tilesets: ['stone', 'water', 'waterfall-base', 'cliff-stone', 'cave', 'bridge'],
  cliffFrames: { FACE_TOP: 22, FACE_MID: 36, FACE_BASE: 50 },
    waterfallFrames: { TOP: 0, MID: 18, BOTTOM: 36 },
    buildingGlyphs: 'MH',
    buildings: [
      {
        contains: [23, 21],
        assetKey: 'kenmi-desert-temple-desert-temple',
        label: 'Mountain Mosque',
      },
      {
        contains: [12, 11],
        assetKey: 'kenmi-base-buildings-buildings-houses-stone-house-1-stone-base-black',
        label: 'Mountain Home',
      },
      {
        contains: [22, 11],
        assetKey: 'kenmi-base-buildings-buildings-houses-stone-house-3-stone-base-blue',
        label: 'Healer House',
      },
      {
        contains: [17, 23],
        assetKey: 'kenmi-base-buildings-buildings-houses-limestone-house-4-limestone-base-black',
        label: 'Lower House',
      },
    ],
    priority: ['water', 'waterfall', 'bridge', 'road', 'stone', 'grass', 'cliff'],
    baseAlias: { bridge: 'stone', cave: 'stone' },
    detailDensity: { stone: 8, trample: 4 },
    decalsFromComma: false,
  },
  coastal_port: {
    id: 'coastal_port',
    classes: {
      '~': 'water',
      'b': 'beach',
      'd': 'deck',
      'Q': 'quay',
      'q': 'quay+block',
      'C': 'cliff',
      'r': 'stone',
      '=': 'road',
      ':': 'lane',
      'p': 'pave',
      'g': 'grass',
      's': 'sand',
      H: 'bldg',
      o: 'stone+block',
      E: null,
    },
    tilesets: ['water', 'beach', 'deck', 'quay', 'foam', 'cliff-stone', 'stone', 'cobble', 'grass3', 'pave'],
    cliffFrames: { FACE_TOP: 22, FACE_MID: 36, FACE_BASE: 50 },
    openWaterFrame: 10,
    seaEdges: ['east'],
    waterRipples: true,
    buildingGlyphs: 'H',
    buildings: [
      { contains: [15, 21], assetKey: 'kenmi-base-buildings-buildings-unique-buildings-inn-inn-blue', label: 'Port Tavern', doorId: 'door-port-tavern' },
      { contains: [22, 21], assetKey: 'kenmi-base-buildings-buildings-houses-stone-house-3-stone-base-blue', label: 'Port Warehouse', doorId: 'door-port-warehouse' },
      { contains: [12, 23], assetKey: 'kenmi-base-buildings-buildings-unique-buildings-blacksmith-house-blacksmith-house-blue', label: 'Port Smithy' },
      { contains: [4, 6], assetKey: 'kenmi-base-buildings-buildings-unique-buildings-fisherman-house-fisherman-house-base-blue', label: 'Fisherman House 1' },
      { contains: [11, 5], assetKey: 'kenmi-base-buildings-buildings-unique-buildings-fisherman-house-fisherman-house-base-red', label: 'Fisherman House 2' },
      { contains: [16, 5], assetKey: 'kenmi-base-buildings-buildings-unique-buildings-fisherman-house-fisherman-house-green-blue', label: 'Fisherman House 3' },
      { contains: [3, 5], assetKey: 'kenmi-base-buildings-buildings-unique-buildings-fisherman-house-fisherman-house-base-red', label: 'Fisherman House 4' },
      { contains: [9, 5], assetKey: 'kenmi-base-buildings-buildings-unique-buildings-fisherman-house-fisherman-house-base-blue', label: 'Fisherman House 5' },
      { contains: [20, 5], assetKey: 'kenmi-base-buildings-buildings-unique-buildings-fisherman-house-fisherman-house-green-blue', label: 'Fisherman House 6' },
      { contains: [25, 6], assetKey: 'kenmi-base-buildings-buildings-unique-buildings-fisherman-house-fisherman-house-base-red', label: 'Fisherman House 7' },
      { contains: [7, 10], assetKey: 'kenmi-base-buildings-buildings-unique-buildings-fisherman-house-fisherman-house-base-blue', label: 'Fisherman House 8' },
      { contains: [11, 20], assetKey: 'kenmi-base-buildings-buildings-houses-stone-house-3-stone-base-blue', label: 'South House 1' },
      { contains: [21, 20], assetKey: 'kenmi-base-buildings-buildings-houses-stone-house-3-stone-base-blue', label: 'South House 2' },
      { contains: [10, 22], assetKey: 'kenmi-base-buildings-buildings-unique-buildings-blacksmith-house-blacksmith-house-blue', label: 'South House 3' },
    ],
    extraObjects: [
      { id: 'harbour-lighthouse', assetKey: 'kenmi-volcano-buildings-volcano-tower', x: 39, y: 27, w: 6, h: 9 },
      { id: 'port-boat-north', assetKey: 'kenmi-base-outdoor-decoration-boat', x: 36, y: 11, w: 3, h: 3 },
      { id: 'port-boat-south', assetKey: 'kenmi-base-outdoor-decoration-boat', x: 36, y: 22, w: 3, h: 3 },
    ],
    priority: ['deck', 'quay', 'pave', 'road', 'lane', 'beach', 'grass', 'stone', 'sand', 'water'],
    baseAlias: { cliff: 'stone', deck: 'quay' },
    detailDensity: { beach: 5, stone: 4, sand: 3, grass: 18 },
    decalsFromComma: false,
  },
  bedouin_camp: {
    id: 'bedouin_camp',
    classes: {
      '.': 'sand',
      ',': 'sand',
      'd': 'camp',
      ':': 'track',
      'C': 'dune',
      'w': 'water',
      'g': 'grass',
      'r': 'stone',
      'D': null,
      'E': null,
      'T': null,
      'F': 'camp',
      'f': 'camp',
      'b': 'camp',
      'B': 'sand',
      '=': 'sand',
      'G': 'sand',
    },
    tilesets: ['water', 'foam', 'cliff', 'stone'],
    cliffFrames: { FACE_TOP: 41, FACE_MID: 54, FACE_BASE: 67 },
    waterRipples: true,
    buildingGlyphs: '',
    buildings: [],
    priority: ['water', 'track', 'camp', 'stone', 'grass', 'sand'],
  detailDensity: { sand: 0, camp: 0, track: 0 },
    decalsFromComma: false,
  },
  royal_palace: {
    classes: {
      s: 'sand',
      '~': 'water',          // the sea container + bay behind the palace (pool autotile)
      g: 'grass',            // garden lawns (GroundDetail overlay on sand)
      p: 'pave',             // ceremonial axis / plaza / terrace / garden curbs
      W: 'wall',             // adobe perimeter wall (fencewall autotile + Collision)
      C: 'cliff',            // east sea-cliff + south dune band (rock-face column)
      B: 'sand+block',       // palace massing footprint (composite sprites via zones.js)
      o: 'sand+block',       // minarets / gate towers / inner-gate obelisks (sprites)
      h: 'hedge',            // garden hedge on its 1-tile pavement curb (LINT-10 seam law)
      T: 'mark+block',       // palm: underlay by majority (curb in hedge runs, sand/grass
                             // elsewhere), Collision painted, sprite via zones.js
      f: 'grass+block',      // contract fountains in their LAW-18 grass collar
      // D (throne door), * (spawn), x (exit cut) resolve by neighbour majority
      // and stay walkable.
    },
    tilesets: ['water', 'cliff', 'pave', 'wall', 'hedge'],
    buildingGlyphs: '',      // no tile-footprint houses — the massing is B + sprites
    buildings: [],
    priority: ['pave', 'grass', 'sand'],
    baseAlias: { hedge: 'pave' }, // marks beside hedges inherit the pavement curb
    decalsFromComma: false,
  },
};
const PROFILE = ZONE_PROFILES[zoneId] || null;

// ────────────────────────────────────────────────────────────────────────────
// 1. Parse the design doc
// ────────────────────────────────────────────────────────────────────────────

// Dimensions — "## 2. Dimensions" ... "**40 × 30 tiles**"
const dimM = md.match(/\*\*(\d+)\s*[×x]\s*(\d+)\s*tiles\*\*/);
if (!dimM) die('could not parse dimensions ("**W × H tiles**")');
const W = +dimM[1];
const H = +dimM[2];

// Canonical grid — first fenced block whose lines look like "<W chars> <rowIndex>"
// (oasis format), "<rowIndex> <W chars>" (marketplace format), or "yNN <W chars>"
// (royal_palace format).
function parseGrid() {
  const blocks = [...md.matchAll(/```\n([\s\S]*?)```/g)].map((m) => m[1]);
  for (const block of blocks) {
    const rows = [];
    for (const line of block.split('\n')) {
      // Farmland's canonical rows are compact run declarations, for example
      // "y5: T(0-2) s(3) B(4-7) ...". Expand those declarations into the
      // same single-cell grid consumed by every other profile.
      let m = line.match(/^\s*y(\d+):\s*(.+)$/);
      if (m) {
        const row = Array(W).fill(null);
        const body = m[2]
          .replace(/=[^)]*/g, '')
          .split(/\s+/)
          .filter(Boolean)
          .map((token) => token.replace(/,$/, ''));
        for (const token of body) {
          let run = token.match(/^(\d+)×([A-Za-z#.,]+)$/);
          if (run) {
            const count = +run[1];
            const chars = [...run[2]];
            if (chars.length !== 1) continue;
            const start = row.findIndex((cell) => cell === null);
            for (let i = 0; i < count && start + i < W; i++) row[start + i] = chars[0];
            continue;
          }
          run = token.match(/^([A-Za-z#.,]+)\((\d+)(?:-(\d+))?(?:=[^)]*)?\)$/);
          if (!run) continue;
          const chars = [...run[1]];
          const x0 = +run[2];
          const x1 = run[3] == null ? x0 : +run[3];
          const width = x1 - x0 + 1;
          if (chars.length !== 1 && chars.length !== width) continue;
          for (let x = x0; x <= x1 && x < W; x++) {
            row[x] = chars.length === 1 ? chars[0] : chars[x - x0];
          }
        }
        if (row.every((cell) => cell !== null)) rows[+m[1]] = row.join('');
        continue;
      }
      let m2 = line.match(/^(.*\S)\s+(\d+)\s*$/); // trailing row index
      if (m2 && m2[1].length === W && !/^[\d\s]+$/.test(m2[1])) { rows[+m2[2]] = m2[1]; continue; }
      m2 = line.match(/^\s*(\d+)\s\s*(\S.{1,}?)\s*$/); // leading row index
      if (m2 && m2[2].length === W && !/^[\d\s]+$/.test(m2[2])) { rows[+m2[1]] = m2[2]; continue; }
      m2 = line.match(/^\s*y(\d+)\s+(\S.*?)\s*$/); // leading yNN row label
      if (m2 && m2[2].length === W && !/^[\d\s]+$/.test(m2[2])) rows[+m2[1]] = m2[2];
    }
    if (rows.filter(Boolean).length >= H) return rows.slice(0, H);
  }
  return null;
}
const grid = parseGrid();
if (!grid || grid.length !== H || grid.some((r) => !r || r.length !== W)) {
  die(`could not parse a ${W}x${H} canonical grid from the design doc`);
}

// Buildings table — "| B1 | name | `asset` … | (x0,y0)–(x1,y1) | door… |"  (oasis format)
const buildings = [];
for (const m of md.matchAll(/^\|\s*B(\d+)\s*\|\s*([^|]+?)\s*\|\s*`([\w.-]+)`[^|]*\|\s*\((\d+),(\d+)\)[–-]\((\d+),(\d+)\)\s*\|\s*([^|]+?)\s*\|$/gm)) {
  const doorM = m[8].match(/`([\w-]+)`\s*\((\d+),(\d+)\)/);
  buildings.push({
    id: `B${m[1]}`, label: m[2], asset: m[3],
    x0: +m[4], y0: +m[5], x1: +m[6], y1: +m[7],
    door: doorM ? { id: doorM[1], x: +doorM[2], y: +doorM[3] } : null,
  });
}

// PROFILE path: derive buildings from grid glyph clusters + the profile's asset list
// (marketplace's §4 lists assets in prose, not a table — the grid is the footprint truth).
const fillerDoorCells = []; // decorative D cells (walkable, no interactable)
if (PROFILE) {
  buildings.length = 0;
  const isBldg = (x, y) => x >= 0 && x < W && y >= 0 && y < H
    && (PROFILE.buildingGlyphs.includes(grid[y][x]) || grid[y][x] === 'D');
  const claimed = Array.from({ length: H }, () => new Array(W).fill(false));
  PROFILE.buildings.forEach((def, i) => {
    const [sx, sy] = def.contains;
    if (!isBldg(sx, sy)) die(`building ${i + 1} anchor (${sx},${sy}) is not on a building glyph`);
    // BFS the connected component of building glyphs
    const cells = [];
    const q = [[sx, sy]];
    claimed[sy][sx] = true;
    while (q.length) {
      const [x, y] = q.pop();
      cells.push([x, y]);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx; const ny = y + dy;
        if (isBldg(nx, ny) && !claimed[ny][nx]) { claimed[ny][nx] = true; q.push([nx, ny]); }
      }
    }
    const xs = cells.map(([x]) => x); const ys = cells.map(([, y]) => y);
    const doors = cells.filter(([x, y]) => grid[y][x] === 'D');
    const b = {
      id: `B${i + 1}`, label: def.label, asset: def.asset, assetKey: def.assetKey,
      x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys),
      door: null, cells,
    };
    if (def.doorId) {
      if (doors.length !== 1) die(`building ${def.label}: expected exactly 1 door glyph, found ${doors.length}`);
      b.door = { id: def.doorId, x: doors[0][0], y: doors[0][1] };
    } else {
      fillerDoorCells.push(...doors);
    }
    buildings.push(b);
  });
  // no unclaimed building glyph may remain
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (PROFILE.buildingGlyphs.includes(grid[y][x]) && !claimed[y][x]) {
        die(`building glyph '${grid[y][x]}' at (${x},${y}) belongs to no profile building`);
      }
    }
  }
}
if (!buildings.length) warn('no buildings parsed from the Buildings table');

// §5 unified contract placement table (royal_palace-style design docs):
//   | `id` | <kind> | (x,y) | rationale |            (kind = NPC / sign / door (locked…) → …)
//   | `exit-id` | exit | south edge yNN, tileRange **[a,b]** → zone/`entry` | … |
//   | `entry-key` (entry) + spawnPoint | entry | (x,y) | … |
// Parsed as a FALLBACK only: it fills collections the older per-section formats left
// empty, so oasis/marketplace parsing (and their byte-identical output) is untouched.
const unified = { spawn: null, npcs: [], interactables: [], exits: [], entries: [] };
{
  const sec = tableRows(/^## 5\. Contract placement table/m);
  const spawnRow = md.match(/^\|\s*`?spawnPoint`?\s*\|\s*\((\d+),(\d+)\)\s*\|/m);
  if (spawnRow) unified.spawn = { x: +spawnRow[1], y: +spawnRow[2] };
  for (const m of md.matchAll(/^\|\s*entry\s+`([\w-]+)`\s*\|\s*\((\d+),(\d+)\)\s*\|/gm)) {
    unified.entries.push({ key: m[1], x: +m[2], y: +m[3] });
  }
  for (const m of md.matchAll(/^\|\s*`entries\.([\w-]+)`\s*\|\s*\((\d+),(\d+)\)\s*\|/gm)) {
    unified.entries.push({ key: m[1], x: +m[2], y: +m[3] });
  }
  for (const m of sec.matchAll(/^\|\s*`([\w-]+)`([^|]*)\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|/gm)) {
    const [, id, idExtra, kind, tileText] = m;
    if (/^exit$/i.test(kind)) {
      const edgeM = tileText.match(/(north|south|east|west)\s+edge/);
      const rangeM = tileText.match(/\[(\d+),(\d+)\]/);
      if (edgeM && rangeM) unified.exits.push({ id, edge: edgeM[1], range: [+rangeM[1], +rangeM[2]] });
      continue;
    }
    const xyM = tileText.match(/\((\d+),(\d+)\)/);
    if (!xyM) continue;
    const x = +xyM[1]; const y = +xyM[2];
    if (/^entry$/i.test(kind)) {
      unified.entries.push({ key: id, x, y });
      if (/spawnPoint/.test(idExtra)) unified.spawn = { x, y };
    } else if (/^NPC$/i.test(kind)) {
      unified.npcs.push({ id, x, y });
    } else {
      const it = { id, x, y, type: id.split('-')[0] };
      const lockM = kind.match(/locked:\s*`?([\w]+)`?/);
      if (lockM) { it.locked = true; it.unlockFlag = lockM[1]; }
      const intM = kind.match(/`([\w]+_interior)`/);
      if (intM) it.interiorId = intM[1];
      unified.interactables.push(it);
    }
  }
  for (const m of sec.matchAll(/^\|\s*`([\w-]+)`[^|]*\|\s*(north|south|east|west)\s*\|\s*\[(\d+),(\d+)\]\s*\|/gm)) {
    unified.exits.push({ id: m[1], edge: m[2], range: [+m[3], +m[4]] });
  }
}

// spawnPoint — "spawnPoint **(x,y)**" (oasis) or "`spawnPoint: (x,y)`" (marketplace)
// or the §5 unified entry row flagged "+ spawnPoint" (royal_palace)
const spawnM = md.match(/spawnPoint\s*\*\*\((\d+),(\d+)\)\*\*/) || md.match(/`spawnPoint:\s*\((\d+),(\d+)\)`/);
if (!spawnM && !unified.spawn) die('could not parse spawnPoint');
const spawn = spawnM ? { x: +spawnM[1], y: +spawnM[2] } : unified.spawn;

// Exits — oasis format "| `id` | edge=north, tileRange **[a,b]** …"
//         market format "| `id` | west ★ | y[16,18] | … |"
// Entries — oasis rows "| entry `key` | **(x,y)** |"
//           market prose "**Entries (keys preserved):** `from_library` → (2,17) …"
const exits = [];
const entries = [];
for (const m of md.matchAll(/^\|\s*`([\w-]+)`\s*\|\s*edge=(\w+),\s*tileRange\s*\*\*\[(\d+),(\d+)\]\*\*/gm)) {
  exits.push({ id: m[1], edge: m[2], range: [+m[3], +m[4]] });
}
for (const m of md.matchAll(/^\|\s*`([\w-]+)`\s*\|\s*(north|south|east|west)[^|]*\|\s*[xy]\[(\d+),(\d+)\]\s*\|/gm)) {
  exits.push({ id: m[1], edge: m[2], range: [+m[3], +m[4]] });
}
for (const m of md.matchAll(/^\|\s*`([\w-]+)`[^|]*\|\s*(north|south|east|west)\s*\|\s*\[(\d+),(\d+)\]\s*\|/gm)) {
  exits.push({ id: m[1], edge: m[2], range: [+m[3], +m[4]] });
}
for (const m of md.matchAll(/^\|\s*`([\w-]+)`\s*\|\s*edge=\*\*(north|south|east|west)\*\*,\s*tileRange=\**\[(\d+),(\d+)\]\**/gm)) {
  exits.push({ id: m[1], edge: m[2], range: [+m[3], +m[4]] });
}
for (const m of md.matchAll(/^\|\s*entry\s*`(\w+)`\s*\|\s*\*\*\((\d+),(\d+)\)\*\*/gm)) {
  entries.push({ key: m[1], x: +m[2], y: +m[3] });
}
for (const m of md.matchAll(/^\|\s*entry\s+`([\w-]+)`\s*\|\s*\((\d+),(\d+)\)\s*\|/gm)) {
  entries.push({ key: m[1], x: +m[2], y: +m[3] });
}
{
  const entLine = md.match(/\*\*Entries \(keys preserved\):\*\*([^\n]+)/);
  if (entLine) {
    for (const m of entLine[1].matchAll(/`(\w+)`\s*→\s*\((\d+),(\d+)\)/g)) {
      entries.push({ key: m[1], x: +m[2], y: +m[3] });
    }
  }
}
if (!exits.length) exits.push(...unified.exits);
if (!entries.length) entries.push(...unified.entries);
if (!exits.length) die('no exits parsed');
if (!entries.length) die('no entries parsed');

// Exit targets come from the contract §1 (design doc omits targetZone/targetEntry)
function contractExitTargets() {
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
if (!npcs.length) {
  const sec = md.match(/\*\*NPCs(?: \(\d+\))?(?::)?\*\*([\s\S]*?)(?=\n\*\*)/)?.[1] || '';
  npcs.push(...[...sec.matchAll(/^\|\s*`([\w-]+)`\s*\|\s*\((\d+),(\d+)\)\s*\|/gm)]
    .map((m) => ({ id: m[1], x: +m[2], y: +m[3] })));
}
if (!npcs.length) npcs.push(...unified.npcs);

const itSec = tableRows(/^\*\*Interactables \(\d+\):\*\*/m);
const interactables = [];
for (const m of itSec.matchAll(/^\|\s*`([\w.-]+)`\s*(\[[^\]]*\])?\s*\|\s*\((\d+),(\d+)\)\s*\|\s*([^|]*)\|/gm)) {
  const it = { id: m[1], x: +m[3], y: +m[4], type: m[1].split('-')[0] };
  const rat = (m[2] || '') + m[5];
  const lockM = rat.match(/\[locked:\s*`?([\w]+)`?\]/);
  if (lockM) { it.locked = true; it.unlockFlag = lockM[1]; }
  const intM = rat.match(/→\s*`?([\w]+_interior)`?/);
  if (intM) it.interiorId = intM[1];
  interactables.push(it);
}
if (!interactables.length) interactables.push(...unified.interactables);
if (!interactables.length) {
  const sec = md.match(/\*\*Interactables \(\d+\)\*\*([\s\S]*?)(?=\n\*\*)/)?.[1] || '';
  for (const m of sec.matchAll(/^\|\s*`([\w.-]+)`(?:\s*→\s*`?([\w]+_interior)`?)?\s*\|\s*\((\d+),(\d+)\)\s*\|/gm)) {
    interactables.push({
      id: m[1], x: +m[3], y: +m[4], type: m[1].split('-')[0],
      ...(m[2] ? { interiorId: m[2] } : {}),
    });
  }
}
if (!interactables.length) {
  for (const m of md.matchAll(/^\|\s*`([\w.-]+)`\s*\|\s*([^|]+?)\s*\|\s*\((\d+),(\d+)\)\s*\|/gm)) {
    const [, id, kind, x, y] = m;
    if (/^(sign|bookshelf|chest|door|statue|painting|pot|lantern|fountain|barrel|crate|inscription)/i.test(kind)) {
      const it = { id, x: +x, y: +y, type: kind.split(/\s|→/)[0] };
      const intM = kind.match(/`([\w]+_interior)`/);
      if (intM) it.interiorId = intM[1];
      interactables.push(it);
    }
  }
}

const spotSec = tableRows(/^\*\*Gathering spots \(\d+[^)]*\):\*\*/m);
const spots = [...spotSec.matchAll(/^\|\s*`(spot_[\w]+)`\s*\|\s*([\w]+)\s*\/\s*([\w]+)\s*\|\s*\((\d+),(\d+)\)/gm)]
  .map((m) => ({ id: m[1], item: m[2], gatherType: m[3], x: +m[4], y: +m[5] }));
if (!spots.length) {
  const sec = md.match(/\*\*Gathering spots \(\d+[^)]*\)\*\*([\s\S]*?)(?=\n\*\*)/)?.[1] || '';
  spots.push(...[...sec.matchAll(/^\|\s*`(spot_[\w]+)`\s*\|\s*([\w]+)\s*\/\s*([\w]+)\s*\|\s*\((\d+),(\d+)\)/gm)]
    .map((m) => ({ id: m[1], item: m[2], gatherType: m[3], x: +m[4], y: +m[5] })));
}

const trigSec = tableRows(/^\*\*Step triggers \(\d+\):\*\*/m);
const stepTriggers = [...trigSec.matchAll(/^\|\s*`([\w-]+)`\s*\|\s*\((\d+),(\d+)\)\s*(\d+)[×x](\d+)/gm)]
  .map((m) => ({ id: m[1], x: +m[2], y: +m[3], w: +m[4], h: +m[5] }));

const subAreas = [...md.matchAll(/`([\w-]+)`\s*\((\d+),(\d+)\)\s*(\d+)[×x](\d+)/g)]
  .filter((m) => /market|shore|residential|ruins|district|quarter|square/.test(m[1]))
  .map((m) => ({ id: m[1], x: +m[2], y: +m[3], w: +m[4], h: +m[5] }));

console.log(`parsed: ${npcs.length} NPCs, ${interactables.length} interactables, ${spots.length} spots, ${stepTriggers.length} stepTriggers, ${exits.length} exits, ${entries.length} entries, ${buildings.length} buildings, ${subAreas.length} subAreas`);

if (CENSUS) {
  const census = {};
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const ch = grid[y][x];
      if (!census[ch]) census[ch] = [];
      census[ch].push(`(${x},${y})`);
    }
  }
  for (const ch of Object.keys(census).sort()) {
    if (ch === '.' || ch === ',' || ch === '=' || ch === '-' || ch === '#' || ch === 'P') continue;
    // profile zones: skip pure terrain glyphs, keep marks + mark+block (wiring input)
    if (PROFILE && ch in PROFILE.classes && PROFILE.classes[ch] !== null
        && PROFILE.classes[ch] !== 'mark+block') continue;
    console.log(`  '${ch}' x${census[ch].length}: ${census[ch].join(' ')}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 2. Tilesets
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
// Profile zones declare their extra tilesets by short name (order = firstgid order,
// appended after the always-on sand+grass sheets). Legacy oasis keeps its original
// water-before-grass / cliff-after-grass order — byte-identical output.
const EXTRA_TILESETS = {
  water: ['kenmi-desert-tiles-desert-water-tiles-1', '../kenmi/desert/tiles/desert-water-tiles-1.png', 96, 48],
  cliff: ['kenmi-desert-tiles-desert-cliff-tiles-1', '../kenmi/desert/tiles/desert-cliff-tiles-1.png', 208, 176],
  waterfall: ['kenmi-desert-tiles-desert-cliff-waterfall-1', '../kenmi/desert/tiles/desert-cliff-waterfall-1.png', 288, 96],
  'waterfall-base': ['kenmi-base-tiles-waterfall-waterfall-1', '../kenmi/base/tiles/waterfall/waterfall-1.png', 288, 80],
  'cliff-stone': ['kenmi-base-tiles-cliff-stone-cliff-1-tile', '../kenmi/base/tiles/cliff/stone-cliff-1-tile.png', 224, 96],
  farmland: ['kenmi-base-tiles-farmland-farmland-tile', '../kenmi/base/tiles/farmland/farmland-tile.png', 112, 128],
  'farmland-wet': ['kenmi-base-tiles-farmland-farmland-wet-tile', '../kenmi/base/tiles/farmland/farmland-wet-tile.png', 112, 128],
  grass3: ['kenmi-base-tiles-grass-grass-tiles-3', '../kenmi/base/tiles/grass/grass-tiles-3.png', 256, 160],
  cobble: ['kenmi-base-tiles-cobble-road-cobble-road-2', '../kenmi/base/tiles/cobble-road/cobble-road-2.png', 48, 80],
  pave: ['kenmi-base-tiles-pavement-tiles', '../kenmi/base/tiles/pavement-tiles.png', 144, 128],
  wall: ['kenmi-desert-props-desert-fencewall', '../kenmi/desert/props/desert-fencewall.png', 64, 64],
  hedge: ['kenmi-base-tiles-hedge-tiles', '../kenmi/base/tiles/hedge-tiles.png', 64, 64],
  stone: ['kenmi-base-tiles-cobble-road-cobble-road-1', '../kenmi/base/tiles/cobble-road/cobble-road-1.png', 48, 80],
  cave: ['kenmi-base-tiles-cliff-stone-cliff-1-cave-entrance', '../kenmi/base/tiles/cliff/stone-cliff-1-cave-entrance.png', 48, 48],
  bridge: ['kenmi-base-tiles-bridge-bridge-stone-horizontal', '../kenmi/base/tiles/bridge/bridge-stone-horizontal.png', 192, 112],
  beach: ['kenmi-desert-tiles-desert-beach-tiles-1', '../kenmi/desert/tiles/desert-beach-tiles-1.png', 80, 48],
  deck: ['kenmi-base-tiles-wooden-deck-tiles', '../kenmi/base/tiles/wooden-deck-tiles.png', 80, 96],
  quay: ['kenmi-base-tiles-water-water-stone-tile-3', '../kenmi/base/tiles/water/water-stone-tile-3.png', 48, 80],
  foam: ['kenmi-desert-tiles-desert-water-foam-animation', '../kenmi/desert/tiles/desert-water-foam-animation.png', 320, 48],
};
let TS_WATER = null; let TS_CLIFF = null; let TS_WATERFALL = null; let TS_FARMLAND = null;
let TS_FARMLAND_WET = null; let TS_GRASS3 = null; let TS_COBBLE = null; let TS_PAVE = null;
let TS_WALL = null; let TS_HEDGE = null;
let TS_STONE = null; let TS_CAVE = null; let TS_BRIDGE = null;
let TS_BEACH = null; let TS_DECK = null; let TS_QUAY = null; let TS_FOAM = null;
if (!PROFILE) {
  TS_WATER = addTs(...EXTRA_TILESETS.water);
}
const TS_GRASS = addTs('kenmi-desert-tiles-desert-grass', '../kenmi/desert/tiles/desert-grass.png', 48, 80);
if (!PROFILE) {
  TS_CLIFF = addTs(...EXTRA_TILESETS.cliff);
} else {
  for (const short of PROFILE.tilesets) {
    if (!EXTRA_TILESETS[short]) die(`profile tileset "${short}" not in EXTRA_TILESETS`);
    const ts = addTs(...EXTRA_TILESETS[short]);
    if (short === 'water') TS_WATER = ts;
    else if (short === 'cliff' || short === 'cliff-stone') TS_CLIFF = ts;
    else if (short === 'waterfall' || short === 'waterfall-base') TS_WATERFALL = ts;
    else if (short === 'farmland') TS_FARMLAND = ts;
    else if (short === 'farmland-wet') TS_FARMLAND_WET = ts;
    else if (short === 'grass3') TS_GRASS3 = ts;
    else if (short === 'cobble') TS_COBBLE = ts;
    else if (short === 'pave') TS_PAVE = ts;
    else if (short === 'wall') TS_WALL = ts;
    else if (short === 'hedge') TS_HEDGE = ts;
    else if (short === 'stone') TS_STONE = ts;
    else if (short === 'cave') TS_CAVE = ts;
    else if (short === 'bridge') TS_BRIDGE = ts;
    else if (short === 'beach') TS_BEACH = ts;
    else if (short === 'deck') TS_DECK = ts;
    else if (short === 'quay') TS_QUAY = ts;
    else if (short === 'foam') TS_FOAM = ts;
  }
}
const tilesets = [TS_SAND1, TS_SAND2, TS_SAND3, TS_WATER, TS_GRASS, TS_GRASS3, TS_FARMLAND, TS_FARMLAND_WET, TS_WATERFALL, TS_CLIFF, TS_COBBLE, TS_PAVE, TS_WALL, TS_HEDGE, TS_STONE, TS_CAVE, TS_BRIDGE, TS_BEACH, TS_DECK, TS_QUAY, TS_FOAM]
  .filter(Boolean).sort((a, b) => a.firstgid - b.firstgid);

const SAND_SOLID = 6;                       // 5x3 beach sheets: (1,1) solid sand
const G_SAND = TS_SAND1.firstgid + SAND_SOLID;   // base sand `.` `,`
const G_PLAZA = TS_SAND2.firstgid + SAND_SOLID;  // oasis plaza `p` / market trampled floor `,`
const G_ROAD = TS_SAND3.firstgid + SAND_SOLID;   // oasis road/lane / market lane `-`
// water pool-in-sand blob (right 3x3 of the 6x3 sheet), keyed by open (land) sides
const WATER_F = { NW: 3, N: 4, NE: 5, W: 9, C: 10, E: 11, SW: 15, S: 16, SE: 17 };
const WATER_ALT_F = { NW: 0, N: 1, NE: 2, W: 6, C: 7, E: 8, SW: 12, S: 13, SE: 14 };
// grass overlay frames (3 cols): hole-blob edges + 2x2 patch corners + solid
const GRASS_F = {
  SOLID: 11,
  EDGE_N: 7, EDGE_S: 1, EDGE_W: 5, EDGE_E: 3,           // sand on that side
  CORNER_NW: 6, CORNER_NE: 8, CORNER_SW: 2, CORNER_SE: 0, // sand on both sides
};
const FARMLAND_F = {
  CORNER_TL: 0,
  EDGE_TOP: 1,
  CORNER_TR: 2,
  EDGE_LEFT: 7,
  SOLID: 8,
  EDGE_RIGHT: 9,
  CORNER_BL: 14,
  EDGE_BOTTOM: 15,
  CORNER_BR: 16,
};
const WATERFALL_F = { TOP: 0, MID: 18, BOTTOM: 36 };
const CLIFF_F = { FACE_TOP: 41, FACE_MID: 54, FACE_BASE: 67 };
const PLATEAU_TOP_F = [98, 99, 100, 101, 111, 112, 113, 114, 124, 125, 126, 127];
const PLATEAU_FACE_F = [20, 22, 23, 24, 33, 35, 36, 37, 46, 48, 49, 50];
const PLATEAU_OUTLINE_F = [15, 16, 27, 29, 42, 43, 44, 55, 56, 57, 95, 96, 108, 109];
const PLATEAU_LIP_F = [69, 70, 71, 80, 81, 92, 93, 94, 106, 107];
const PLATEAU_CRACK_F = [76, 77, 89, 90, 102, 103, 115, 116];
const RUBBLE_F = [98, 111, 124, 137, 100, 113, 126, 139]; // plain x4 + decorated x4
// cobble-road-2 blob (3x5): 0-8 = blob-on-sand transitions (f4 = solid centre),
// 9/12/13 solid variants, 10 sand-pothole variant, 11/14 transparent (never place)
const COBBLE_F = { NW: 0, N: 1, NE: 2, W: 3, C: 4, E: 5, SW: 6, S: 7, SE: 8, VAR: [9, 12, 13], POTHOLE: 10 };
const STONE_F = { ...COBBLE_F };
const CAVE_F = { MOUTH: 4 };
const BRIDGE_F = { SOLID: 13 };
const DECK_F = { HORIZONTAL: 0, VERTICAL: 5, END: 10 };
const BEACH_F = { SAND: 6, NORTH: 4, EAST: 5, SOUTH: 8, WEST: 3, CORNER: 6 };
// pavement-tiles: flat light-brick block = frames 0,1 / 9,10 (9-col sheet)
const PAVE_F = [0, 1, 9, 10];
// desert-fencewall (4x4) frame atlas by wall-neighbour mask — see header
const WALL_F = {
  VTOP: 0, HL: 1, HM: 2, HR: 3,
  VMID: 4, TL: 5, TD: 6, TR: 7,
  VBOT: 8, TE: 9, X: 10, TW: 11,
  STUB: 12, BL: 13, TU: 14, BR: 15,
};
// hedge-tiles (4x4, verified 6x-upscale 2026-07-03): col 0 = vertical run
// (top cap f0 / mid f4 / bottom f8 / isolated stub f12); row 0 = horizontal run
// (left cap f1 / mid f2 / right cap f3); f5..f15 = 3x3 solid blob whose corners
// double as L-corners for 1-wide hedge lines (f5 TL, f7 TR, f13 BL, f15 BR,
// f10 interior). No transparent frames in the sheet.
const HEDGE_F = {
  VTOP: 0, HL: 1, HM: 2, HR: 3, VMID: 4, TL: 5, TR: 7, VBOT: 8,
  MID: 10, BL: 13, BR: 15, STUB: 12,
};
const COLLIDE_GID = G_SAND; // any non-zero GID marks impassable (hidden layer)

// ────────────────────────────────────────────────────────────────────────────
// 3. Terrain resolution
// ────────────────────────────────────────────────────────────────────────────

const ground = new Array(W * H).fill(0);
const detail = new Array(W * H).fill(0);
const collision = new Array(W * H).fill(0);
const decalCells = [];
let terrain; // class grid used by the walkability sanity block below

const hash = (x, y) => { const h = (x * 73856093) ^ (y * 19349663); return ((h % 1024) + 1024) % 1024; };

if (!PROFILE) {
  // ══ LEGACY path (oasis_village) — original glyph profile, byte-identical output ══
  const TERRAIN_CHARS = new Set(['C', 'P', '.', ',', 'g', '~', 'w', '=', '-', 'p', 'r', 'o', 'X']);
  const raw = (x, y) => (x >= 0 && x < W && y >= 0 && y < H ? grid[y][x] : 'C');

  terrain = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => {
    const ch = raw(x, y);
    if (TERRAIN_CHARS.has(ch)) return ch;
    if (ch === '#') return '#';
    return null; // mark — resolve below
  }));

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

  const T = (x, y) => (x >= 0 && x < W && y >= 0 && y < H ? terrain[y][x] : 'C');
  const isWaterT = (x, y) => T(x, y) === '~' || T(x, y) === 'w';
  const isGrassT = (x, y) => T(x, y) === 'g';
  const isCliffT = (x, y) => T(x, y) === 'C';

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
} else {
  // ══ PROFILE path (desert_marketplace + later zones) ══
  // 3a. classify every cell; building glyphs handled after; unknown glyphs = marks.
  // 'mark+block' cells (royal_palace palms) resolve their underlay like a mark but
  // still paint Collision (sprite via zones.js).
  const markBlockCells = [];
  terrain = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => {
    const ch = grid[y][x];
    if (PROFILE.buildingGlyphs.includes(ch)) return 'bldg';
    if (ch === 'D') return null; // door cells: walkable, underlay by majority
    if (ch in PROFILE.classes) {
      if (PROFILE.classes[ch] === 'mark+block') { markBlockCells.push([x, y]); return null; }
      return PROFILE.classes[ch]; // may be null (mark)
    }
    return null; // contract marks (N x C s b I *) — majority underlay
  }));

  // 3b. resolve marks by orthogonal-neighbour majority over the profile priority.
  // baseAlias lets non-walkable classes vote as their ground material (royal_palace
  // hedges vote 'pave' so palm breaks in a hedge run inherit the curb).
  const WALKABLE = new Set(PROFILE.priority);
  const ALIAS = PROFILE.baseAlias || {};
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (terrain[y][x] !== null) continue;
        const counts = {};
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const t = (y + dy >= 0 && y + dy < H && x + dx >= 0 && x + dx < W) ? terrain[y + dy][x + dx] : null;
          const stripped = typeof t === 'string' ? t.replace('+block', '') : t;
          const base = stripped ? (ALIAS[stripped] || stripped) : stripped;
          if (!base || !WALKABLE.has(base)) continue;
          counts[base] = (counts[base] || 0) + 1;
        }
        const best = PROFILE.priority.filter((c) => counts[c])
          .sort((a, b) => counts[b] - counts[a] || PROFILE.priority.indexOf(a) - PROFILE.priority.indexOf(b))[0];
        if (best) terrain[y][x] = best;
      }
    }
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (terrain[y][x] === null) terrain[y][x] = 'sand';

  // 3c. door cells (contract + filler) stay walkable — carve them out of 'bldg'
  const doorCells = new Set(fillerDoorCells.map(([x, y]) => `${x},${y}`));
  for (const b of buildings) if (b.door) doorCells.add(`${b.door.x},${b.door.y}`);

  const cls = (x, y) => {
    if (x < 0 || x >= W || y < 0 || y >= H) return null;
    return terrain[y][x];
  };
  const base = (x, y) => { const c = cls(x, y); return typeof c === 'string' ? c.replace('+block', '') : c; };
  const isWall = (x, y) => cls(x, y) === 'wall';
  const isRoad = (x, y) => {
    const c = base(x, y);
    return c === 'road' || c === null; // OOB counts as road so exit cuts run to the edge
  };
  const isGrass = (x, y) => base(x, y) === 'grass';
  const isFarmland = (x, y) => {
    const c = base(x, y);
    return c === 'farmland' || c === 'farmland-wet';
  };
  const usesFarmlandWet = Boolean(PROFILE?.classes && Object.values(PROFILE.classes).includes('farmland-wet'));
  const offMapSea = (x, y) => {
    if (!PROFILE?.seaEdges) return x < 0 || x >= W || y < 0 || y >= H;
    return (PROFILE.seaEdges.includes('west') && x < 0)
      || (PROFILE.seaEdges.includes('east') && x >= W)
      || (PROFILE.seaEdges.includes('north') && y < 0)
      || (PROFILE.seaEdges.includes('south') && y >= H);
  };
  const isWaterP = (x, y) => {
    if (offMapSea(x, y)) return true;
    if (x < 0 || y < 0 || y >= H) return false;
    const c = base(x, y);
    return c === 'water' || (usesFarmlandWet && c === 'farmland-wet');
  };
  const isWaterLikeP = (x, y) => {
    if (offMapSea(x, y)) return true;
    if (x < 0 || y < 0 || y >= H) return false;
    const c = base(x, y);
    return c === 'water' || c === 'farmland-wet';
  };
  const isDeckP = (x, y) => base(x, y) === 'deck';
  const isCliffP = (x, y) => {
    if (x < 0 || x >= W || y < 0 || y >= H) return true; // container continues off-map
    return base(x, y) === 'cliff' || base(x, y) === 'dune';
  };
  const isWaterfallP = (x, y) => {
    if (x < 0 || x >= W || y < 0 || y >= H) return false;
    return base(x, y) === 'waterfall';
  };
  const isHedge = (x, y) => cls(x, y) === 'hedge';

  function waterFrameP(x, y) { // pool-in-sand blob keyed by open LAND sides (legacy math)
    const n = !isWaterP(x, y - 1); const s = !isWaterP(x, y + 1);
    const w = !isWaterP(x - 1, y); const e = !isWaterP(x + 1, y);
    const variant = hash(x, y) % 2 ? WATER_ALT_F : WATER_F;
    if (n && w && !s && !e) return variant.NW;
    if (n && e && !s && !w) return variant.NE;
    if (s && w && !n && !e) return variant.SW;
    if (s && e && !n && !w) return variant.SE;
    if (n && !s && !w && !e) return variant.N;
    if (s && !n && !w && !e) return variant.S;
    if (w && !e && !n && !s) return variant.W;
    if (e && !w && !n && !s) return variant.E;
    return WATER_F.C; // interior, straits and 3-sided nubs fall back to open water
  }

  function beachFrameP(x, y) {
    const n = isWaterP(x, y - 1); const s = isWaterP(x, y + 1);
    const w = isWaterP(x - 1, y); const e = isWaterP(x + 1, y);
    if (n && !s && !w && !e) return BEACH_F.NORTH;
    if (e && !w && !n && !s) return BEACH_F.EAST;
    if (s && !n && !w && !e) return BEACH_F.SOUTH;
    if (w && !e && !n && !s) return BEACH_F.WEST;
    if ((n || s) && (w || e)) return BEACH_F.CORNER;
    return BEACH_F.SAND;
  }

  function deckFrame(x, y) {
    const horizontal = isDeckP(x - 1, y) || isDeckP(x + 1, y);
    const vertical = isDeckP(x, y - 1) || isDeckP(x, y + 1);
    if (horizontal && !vertical) return DECK_F.HORIZONTAL;
    if (vertical && !horizontal) return DECK_F.VERTICAL;
    if (!horizontal && !vertical) return DECK_F.END;
    return horizontal ? DECK_F.HORIZONTAL : DECK_F.VERTICAL;
  }

  function channelWaterFrameP(x, y) {
    const n = !isWaterLikeP(x, y - 1); const s = !isWaterLikeP(x, y + 1);
    const w = !isWaterLikeP(x - 1, y); const e = !isWaterLikeP(x + 1, y);
    if (n && w && !s && !e) return WATER_F.NW;
    if (n && e && !s && !w) return WATER_F.NE;
    if (s && w && !n && !e) return WATER_F.SW;
    if (s && e && !n && !w) return WATER_F.SE;
    if (n && !s && !w && !e) return WATER_F.N;
    if (s && !n && !w && !e) return WATER_F.S;
    if (w && !e && !n && !s) return WATER_F.W;
    if (e && !w && !n && !s) return WATER_F.E;
    return WATER_F.C;
  }

  function cliffFrameP(x, y) {
    const frames = PROFILE?.cliffFrames || CLIFF_F;
    if (!isCliffP(x, y + 1)) return frames.FACE_BASE; // rock base meets the ground below
    if (!isCliffP(x, y - 1)) return frames.FACE_TOP;
    return frames.FACE_MID;
  }

  function plateauTopFrame(x, y) {
    return PLATEAU_TOP_F[hash(x + 13, y + 29) % PLATEAU_TOP_F.length];
  }

  function plateauFaceFrame(x, y) {
    return PLATEAU_FACE_F[hash(x + 31, y + 47) % PLATEAU_FACE_F.length];
  }

  function plateauDetailFrame(x, y) {
    const n = isCliffP(x, y - 1);
    const s = isCliffP(x, y + 1);
    const w = isCliffP(x - 1, y);
    const e = isCliffP(x + 1, y);
    if (!s && (w || e)) return PLATEAU_LIP_F[hash(x + 5, y + 11) % PLATEAU_LIP_F.length];
    if (!n && !s && (w || e)) return PLATEAU_OUTLINE_F[hash(x + 7, y + 17) % PLATEAU_OUTLINE_F.length];
    if (!n || !s || !w || !e) return PLATEAU_OUTLINE_F[hash(x + 19, y + 23) % PLATEAU_OUTLINE_F.length];
    if (hash(x + 41, y + 53) % 17 === 0) return PLATEAU_CRACK_F[hash(x + 61, y + 71) % PLATEAU_CRACK_F.length];
    return 0;
  }

  function hedgeFrame(x, y) {
    const hN = isHedge(x, y - 1); const hS = isHedge(x, y + 1);
    const hE = isHedge(x + 1, y); const hW = isHedge(x - 1, y);
    const count = hN + hS + hE + hW;
    if (count >= 3) return HEDGE_F.MID;      // T/cross — blob interior
    if (hS && hE) return HEDGE_F.TL;
    if (hS && hW) return HEDGE_F.TR;
    if (hN && hE) return HEDGE_F.BL;
    if (hN && hW) return HEDGE_F.BR;
    if (hE && hW) return HEDGE_F.HM;
    if (hN && hS) return HEDGE_F.VMID;
    if (hE) return HEDGE_F.HL;
    if (hW) return HEDGE_F.HR;
    if (hS) return HEDGE_F.VTOP;
    if (hN) return HEDGE_F.VBOT;
    return HEDGE_F.STUB;
  }

  function cobbleFrame(x, y) {
    const n = !isRoad(x, y - 1); const s = !isRoad(x, y + 1);
    const w = !isRoad(x - 1, y); const e = !isRoad(x + 1, y);
    if (n && w && !s && !e) return COBBLE_F.NW;
    if (n && e && !s && !w) return COBBLE_F.NE;
    if (s && w && !n && !e) return COBBLE_F.SW;
    if (s && e && !n && !w) return COBBLE_F.SE;
    if (n && !s && !w && !e) return COBBLE_F.N;
    if (s && !n && !w && !e) return COBBLE_F.S;
    if (w && !e && !n && !s) return COBBLE_F.W;
    if (e && !w && !n && !s) return COBBLE_F.E;
    // interior: mostly solid centre with occasional variants + rare pothole
    if (hash(x, y) % 37 === 0) return COBBLE_F.POTHOLE;
    if (hash(x, y) % 5 === 0) return COBBLE_F.VAR[hash(x, y) % COBBLE_F.VAR.length];
    return COBBLE_F.C;
  }

  function grassFrameP(x, y) {
    const n = !isGrass(x, y - 1); const s = !isGrass(x, y + 1);
    const w = !isGrass(x - 1, y); const e = !isGrass(x + 1, y);
    if (n && s && w && e) return GRASS_F.SOLID; // isolated planter tuft: solid, no quarter-round
    if (n && w) return GRASS_F.CORNER_NW;
    if (n && e) return GRASS_F.CORNER_NE;
    if (s && w) return GRASS_F.CORNER_SW;
    if (s && e) return GRASS_F.CORNER_SE;
    if (n) return GRASS_F.EDGE_N;
    if (s) return GRASS_F.EDGE_S;
    if (w) return GRASS_F.EDGE_W;
    if (e) return GRASS_F.EDGE_E;
    return GRASS_F.SOLID;
  }

  function farmlandFrameP(x, y) {
    const n = !isFarmland(x, y - 1); const s = !isFarmland(x, y + 1);
    const w = !isFarmland(x - 1, y); const e = !isFarmland(x + 1, y);
    if (n && w) return FARMLAND_F.CORNER_TL;
    if (n && e) return FARMLAND_F.CORNER_TR;
    if (s && w) return FARMLAND_F.CORNER_BL;
    if (s && e) return FARMLAND_F.CORNER_BR;
    if (n) return FARMLAND_F.EDGE_TOP;
    if (s) return FARMLAND_F.EDGE_BOTTOM;
    if (w) return FARMLAND_F.EDGE_LEFT;
    if (e) return FARMLAND_F.EDGE_RIGHT;
    return FARMLAND_F.SOLID;
  }

  function wallFrame(x, y) {
    const n = isWall(x, y - 1); const s = isWall(x, y + 1);
    const w = isWall(x - 1, y); const e = isWall(x + 1, y);
    if (n && s && e && w) return WALL_F.X;
    if (e && w && s) return WALL_F.TD;
    if (e && w && n) return WALL_F.TU;
    if (n && s && e) return WALL_F.TE;
    if (n && s && w) return WALL_F.TW;
    if (e && s) return WALL_F.TL;
    if (w && s) return WALL_F.TR;
    if (e && n) return WALL_F.BL;
    if (w && n) return WALL_F.BR;
    if (e && w) return WALL_F.HM;
    if (e) return WALL_F.HL;
    if (w) return WALL_F.HR;
    if (n && s) return WALL_F.VMID;
    if (s) return WALL_F.VTOP;
    if (n) return WALL_F.VBOT;
    return WALL_F.STUB;
  }

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const c = terrain[y][x];
      const b = typeof c === 'string' ? c.replace('+block', '') : c;
      const block = typeof c === 'string' && c.endsWith('+block');
      switch (b) {
        case 'wall':
          ground[i] = G_SAND;
          detail[i] = TS_WALL.firstgid + wallFrame(x, y);
          collision[i] = COLLIDE_GID;
          break;
        case 'lowwall':
          ground[i] = G_SAND;
          detail[i] = TS_WALL.firstgid + WALL_F.STUB;
          collision[i] = COLLIDE_GID;
          break;
        case 'water':
          ground[i] = TS_WATER.firstgid + waterFrameP(x, y);
          if (PROFILE?.waterRipples
            && isWaterP(x, y - 1) && isWaterP(x, y + 1)
            && isWaterP(x - 1, y) && isWaterP(x + 1, y)
            && hash(x + 41, y + 67) % 5 === 0) {
            const rippleFrames = [3, 8, 13, 18, 23];
            detail[i] = TS_FOAM.firstgid + rippleFrames[hash(x + 73, y + 19) % rippleFrames.length];
          }
          collision[i] = COLLIDE_GID; // bible §6: water is impassable
          break;
        case 'beach':
          ground[i] = G_SAND;
          if (isWaterP(x, y - 1) || isWaterP(x, y + 1) || isWaterP(x - 1, y) || isWaterP(x + 1, y)) {
            detail[i] = TS_BEACH.firstgid + beachFrameP(x, y);
          }
          break;
        case 'deck':
          ground[i] = TS_DECK.firstgid + deckFrame(x, y);
          break;
        case 'quay':
          ground[i] = TS_STONE.firstgid + STONE_F.C;
          break;
        case 'quay+block':
          ground[i] = TS_STONE.firstgid + STONE_F.C;
          collision[i] = COLLIDE_GID;
          break;
        case 'waterfall': {
          ground[i] = G_SAND;
          const waterfallFrames = PROFILE?.waterfallFrames || WATERFALL_F;
          const waterfallFrame = !isWaterfallP(x, y - 1)
            ? waterfallFrames.TOP
            : !isWaterfallP(x, y + 1)
              ? waterfallFrames.BOTTOM
              : waterfallFrames.MID;
          detail[i] = TS_WATERFALL.firstgid
            + waterfallFrame
            + (x % 2);
          collision[i] = COLLIDE_GID;
          break;
        }
        case 'cliff':
          ground[i] = TS_CLIFF.firstgid + cliffFrameP(x, y);
          collision[i] = COLLIDE_GID;
          break;
        case 'dune': {
          const face = y > 0 && isCliffP(x, y - 1);
          ground[i] = TS_CLIFF.firstgid + (face ? plateauFaceFrame(x, y) : plateauTopFrame(x, y));
          detail[i] = TS_CLIFF.firstgid + plateauDetailFrame(x, y);
          if (face) collision[i] = COLLIDE_GID;
          break;
        }
        case 'cave':
          ground[i] = TS_STONE.firstgid + STONE_F.C;
          detail[i] = TS_CAVE.firstgid + CAVE_F.MOUTH;
          collision[i] = COLLIDE_GID;
          break;
        case 'bridge':
          ground[i] = TS_STONE.firstgid + STONE_F.C;
          detail[i] = TS_BRIDGE.firstgid + BRIDGE_F.SOLID;
          break;
        case 'farmland':
          ground[i] = TS_FARMLAND.firstgid + farmlandFrameP(x, y);
          break;
        case 'farmland-wet':
          ground[i] = TS_WATER.firstgid + channelWaterFrameP(x, y);
          collision[i] = COLLIDE_GID;
          break;
        case 'scrub':
          ground[i] = G_SAND;
          detail[i] = TS_GRASS.firstgid + grassFrameP(x, y);
          break;
        case 'hedge': // hedge overlay on its 1-tile pavement curb (LINT-10 seam law)
          ground[i] = TS_PAVE.firstgid + PAVE_F[hash(x, y) % PAVE_F.length];
          detail[i] = TS_HEDGE.firstgid + hedgeFrame(x, y);
          collision[i] = COLLIDE_GID;
          break;
        case 'bldg':
          ground[i] = PROFILE.id === 'coastal_port'
            ? TS_GRASS3.firstgid + 151
            : G_SAND;
          if (!doorCells.has(`${x},${y}`)) collision[i] = COLLIDE_GID;
          break;
        case 'road':
          ground[i] = (TS_COBBLE || TS_STONE).firstgid + cobbleFrame(x, y);
          break;
        case 'stone':
          ground[i] = TS_STONE.firstgid + STONE_F.C;
          break;
        case 'lane':
          ground[i] = G_ROAD;
          break;
        case 'trample':
          ground[i] = G_PLAZA;
          break;
        case 'camp':
          // Camp wear is carried by the fire-circle dressing and clustered
          // props. A flat plaza frame reads as a painted stain on desert sand.
          ground[i] = G_SAND;
          break;
        case 'track':
          // Caravan trails fade into their sand surroundings; do not paint
          // them as a road slab.
          ground[i] = G_SAND;
          break;
        case 'pave':
          ground[i] = TS_PAVE.firstgid + PAVE_F[hash(x, y) % PAVE_F.length];
          break;
        case 'grass': {
          if (PROFILE.id === 'coastal_port') {
            ground[i] = TS_GRASS3.firstgid + 151;
            break;
          }
          if (PROFILE.id === 'farmland' && TS_GRASS3) {
            ground[i] = TS_GRASS3.firstgid + 151;
          } else {
            ground[i] = G_SAND;
            const touchesWater = isWaterP(x, y - 1) || isWaterP(x, y + 1)
              || isWaterP(x - 1, y) || isWaterP(x + 1, y);
            if (touchesWater) {
              detail[i] = TS_GRASS.firstgid + grassFrameP(x, y);
            } else if (hash(x + 23, y + 37) % 2 === 0) {
              detail[i] = TS_GRASS.firstgid + [9, 10, 12, 13][hash(x + 41, y + 53) % 4];
            }
          }
          break;
        }
      default: // sand
          ground[i] = G_SAND;
      }
      const density = PROFILE?.detailDensity?.[b] || 0;
      const coastalShore = PROFILE?.id === 'coastal_port'
        && (isWaterP(x, y - 1) || isWaterP(x, y + 1) || isWaterP(x - 1, y) || isWaterP(x + 1, y));
      if (density > 0 && !coastalShore && detail[i] === 0 && hash(x, y) % 100 < density) {
        const decalFrames = [9, 10, 12, 13];
        detail[i] = TS_GRASS.firstgid + decalFrames[hash(x + 17, y + 31) % decalFrames.length];
      }
      if (block) collision[i] = COLLIDE_GID;
    }
  }
  // mark+block cells (palms): underlay already resolved by majority; paint Collision
  for (const [x, y] of markBlockCells) collision[y * W + x] = COLLIDE_GID;
  // door cells: never collision (already skipped) — but assert none got painted
  for (const key of doorCells) {
    const [x, y] = key.split(',').map(Number);
    if (collision[y * W + x] !== 0) die(`door cell (${x},${y}) has painted collision`);
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
    P('assetKey', 'string', b.assetKey || `kenmi-desert-houses-${b.asset}`),
    P('label', 'string', b.label),
    ...(PROFILE?.id === 'coastal_port' ? [P('collide', 'bool', true)] : []),
    ...(b.door ? [P('doorId', 'string', b.door.id)] : [P('enterable', 'bool', false)]),
  ], 'building'));
const extraObjects = (PROFILE?.extraObjects || []).map((extra) => obj(extra.id,
  extra.x * SRC_TILE, extra.y * SRC_TILE, extra.w * SRC_TILE, extra.h * SRC_TILE, [
    P('assetKey', 'string', extra.assetKey),
    P('enterable', 'bool', false),
  ], 'prop'));
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
const decalObjects = (PROFILE && !PROFILE.decalsFromComma ? [] : decalCells)
  .map(([x, y]) => tileObj('decal-hint', x, y, [], 'decal'));

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
    objLayer('Buildings', [...buildingObjects, ...extraObjects]),
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
if (!PROFILE) {
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) census[terrain[y][x]] = (census[terrain[y][x]] || 0) + 1;
} else {
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const c = String(terrain[y][x]); census[c] = (census[c] || 0) + 1; }
}
const collideCount = collision.filter((g) => g !== 0).length;
console.log(`[generate-map-from-design] wrote ${path.relative(REPO, OUT)}`);
console.log(`  size ${W}x${H}, tilesets ${tilesets.length}, layers ${map.layers.length}, objects ${nextObjectId - 1}`);
console.log(`  terrain census: ${Object.entries(census).map(([k, v]) => `${k}=${v}`).join(' ')}`);
console.log(`  collision tiles: ${collideCount}, grass detail tiles: ${detail.filter((g) => g !== 0 && TS_GRASS && g >= TS_GRASS.firstgid && g < TS_GRASS.firstgid + 15).length}`);
if (warnings.length) console.log(`  ${warnings.length} warning(s) — review above`);
