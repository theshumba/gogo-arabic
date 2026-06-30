#!/usr/bin/env node
/**
 * generate-oasis-map.mjs — Deterministic authoring of the Oasis Village world.
 *
 * Emits public/assets/maps/oasis-village.json, a Tiled JSON map that the runtime
 * loads via TiledMapLoader. The previous runtime path code-generated a "sea of
 * empty sand" with no collision; this authors a bounded, dense oasis instead.
 *
 * HARD CONTRACT (do not break — keeps src/data/zones.js#oasis_village valid):
 *   - 40 wide x 30 tall, 16px tiles (runtime scales x4 -> 64px).
 *   - Tileset "name" === the loaded Phaser texture key (addTilesetImage(name,name)).
 *   - Layers: "Ground" (full, no empty cells), hidden "Collision" (non-empty =
 *     impassable), object layer "Exits".
 *
 * Terrain composition:
 *   - 2-tile sand-dune BORDER ring (impassable) so the edges read as bounds.
 *   - GRASS covers the interior where buildings/props/NPCs sit.
 *   - A WATER oasis pond near the centre, ringed by a thin SAND beach shore.
 *   - SAND paths carved through the grass connecting the building plots.
 *
 * Autotiling: grass<->non-grass and water<->non-water borders use proper straight
 * EDGE + outer CORNER transition tiles derived from MapLoader's frame tables.
 * Concave/inner corners fall back to the solid-centre tile (acceptable for v1).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');
const OUT = path.join(REPO, 'public/assets/maps/oasis-village.json');

const W = 40;
const H = 30;
const TS = 16; // tile size in source pixels

// ------------------------------------------------------------------
// Tilesets — firstgid assigned sequentially. The "name" MUST equal the
// loaded Phaser texture key (the loader does addTilesetImage(name, name)).
// ------------------------------------------------------------------
const SAND_FIRST = 1;     // tilecount 15  -> GIDs 1..15
const GRASS_FIRST = 16;   // tilecount 160 -> GIDs 16..175
const WATER_FIRST = 176;  // tilecount 15  -> GIDs 176..190

const tilesets = [
  {
    firstgid: SAND_FIRST,
    name: 'kenmi-desert-tiles-desert-beach-tiles-1',
    image: '../kenmi/desert/tiles/desert-beach-tiles-1.png',
    imagewidth: 80,
    imageheight: 48,
    tilewidth: 16,
    tileheight: 16,
    columns: 5,
    tilecount: 15,
    margin: 0,
    spacing: 0,
  },
  {
    firstgid: GRASS_FIRST,
    name: 'kenmi-base-tiles-grass-grass-tiles-3',
    image: '../kenmi/base/tiles/grass/grass-tiles-3.png',
    imagewidth: 256,
    imageheight: 160,
    tilewidth: 16,
    tileheight: 16,
    columns: 16,
    tilecount: 160,
    margin: 0,
    spacing: 0,
  },
  {
    firstgid: WATER_FIRST,
    name: 'kenmi-base-tiles-water-water-tile-3',
    image: '../kenmi/base/tiles/water/water-tile-3.png',
    imagewidth: 48,
    imageheight: 80,
    tilewidth: 16,
    tileheight: 16,
    columns: 3,
    tilecount: 15,
    margin: 0,
    spacing: 0,
  },
];

// ------------------------------------------------------------------
// Local frame indices (into each sheet) -> GIDs.
// Derived from MapLoader.js BEACH / GRASS_F and the static 3x5 water layout
// (the runtime's WATER_F targets the 24-wide animated sheet; the static
// water-tile-3 sheet here is 3 cols x 5 rows with the same row meaning).
// ------------------------------------------------------------------
const SAND_COLS = 5;
const SAND_SOLID = SAND_COLS + 1; // (col1,row1) = 6 -> solid sand centre

const GC = 16; // grass columns
const GRASS = {
  CORNER_TL: GC * 5,       // 80
  EDGE_TOP: GC * 5 + 1,    // 81
  CORNER_TR: GC * 5 + 2,   // 82
  EDGE_LEFT: GC * 6,       // 96
  EDGE_RIGHT: GC * 6 + 2,  // 98
  CORNER_BL: GC * 7,       // 112
  EDGE_BOTTOM: GC * 7 + 1, // 113
  CORNER_BR: GC * 7 + 2,   // 114
  SOLID: GC * 9 + 5,       // 149
  VAR_1: GC * 9 + 6,       // 150
  VAR_2: GC * 9 + 7,       // 151
};

const WC = 3; // water columns (static sheet)
const WATER = {
  CORNER_TL: 0,
  EDGE_TOP: 1,
  CORNER_TR: 2,
  EDGE_LEFT: WC,         // 3
  SOLID: WC + 1,         // 4 (col1,row1)
  EDGE_RIGHT: WC + 2,    // 5
  CORNER_BL: WC * 2,     // 6
  EDGE_BOTTOM: WC * 2 + 1, // 7
  CORNER_BR: WC * 2 + 2, // 8
};

const gidSand = (f) => SAND_FIRST + f;
const gidGrass = (f) => GRASS_FIRST + f;
const gidWater = (f) => WATER_FIRST + f;

// ------------------------------------------------------------------
// Terrain classification grid: BORDER | WATER | SAND | GRASS
// ------------------------------------------------------------------
const T = { BORDER: 'border', WATER: 'water', SAND: 'sand', GRASS: 'grass' };

const terrain = Array.from({ length: H }, () => new Array(W).fill(T.GRASS));

// Pond: ellipse near map centre (~x18-24, y12-18 per design brief).
const PCX = 20;
const PCY = 15;
const inPond = (x, y) => {
  const dx = (x - PCX) / 3.6;
  const dy = (y - PCY) / 2.7;
  return dx * dx + dy * dy < 1;
};

// Base pass: border ring (2 tiles), pond water, else grass.
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (x < 2 || x >= W - 2 || y < 2 || y >= H - 2) {
      terrain[y][x] = T.BORDER;
    } else if (inPond(x, y)) {
      terrain[y][x] = T.WATER;
    } else {
      terrain[y][x] = T.GRASS;
    }
  }
}

// Sand beach shore: any grass cell 8-adjacent to water becomes sand.
const isWater = (x, y) => x >= 0 && x < W && y >= 0 && y < H && terrain[y][x] === T.WATER;
const shore = [];
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (terrain[y][x] !== T.GRASS) continue;
    let adj = false;
    for (let dy = -1; dy <= 1 && !adj; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (isWater(x + dx, y + dy)) { adj = true; break; }
      }
    }
    if (adj) shore.push([x, y]);
  }
}
for (const [x, y] of shore) terrain[y][x] = T.SAND;

// Sand paths connecting the building plots (only overwrite grass, never water).
const carve = (x, y) => {
  if (x < 2 || x >= W - 2 || y < 2 || y >= H - 2) return;
  if (terrain[y][x] === T.GRASS) terrain[y][x] = T.SAND;
};
// Main east-west street near the spawn row (spawnPoint y=20).
for (let x = 2; x < W - 2; x++) { carve(x, 20); carve(x, 21); }
// North spur: from the Ancient Library exit (x17-23) down toward the pond.
for (let y = 2; y < 13; y++) { carve(19, y); carve(20, y); }
// South spur: pond down to the south houses.
for (let y = 18; y < W - 2 && y < H - 2; y++) { carve(19, y); carve(20, y); }
// West lane past the market / scholar quarter.
for (let x = 2; x < 20; x++) { carve(x, 7); carve(x, 8); }
// East lane toward the large east house / guild.
for (let x = 20; x < W - 2; x++) { carve(x, 12); carve(x, 13); }

// ------------------------------------------------------------------
// Autotiling helpers
// ------------------------------------------------------------------
const isGrass = (x, y) => x >= 0 && x < W && y >= 0 && y < H && terrain[y][x] === T.GRASS;

function grassFrame(x, y) {
  const n = !isGrass(x, y - 1);
  const s = !isGrass(x, y + 1);
  const w = !isGrass(x - 1, y);
  const e = !isGrass(x + 1, y);
  // Outer corners (two adjacent open sides) first.
  if (n && w) return GRASS.CORNER_TL;
  if (n && e) return GRASS.CORNER_TR;
  if (s && w) return GRASS.CORNER_BL;
  if (s && e) return GRASS.CORNER_BR;
  // Straight edges.
  if (n) return GRASS.EDGE_TOP;
  if (s) return GRASS.EDGE_BOTTOM;
  if (w) return GRASS.EDGE_LEFT;
  if (e) return GRASS.EDGE_RIGHT;
  // Solid interior — deterministic sprinkle of variants for texture.
  const h = (x * 73856093) ^ (y * 19349663);
  const m = ((h % 11) + 11) % 11;
  if (m === 0) return GRASS.VAR_1;
  if (m === 1) return GRASS.VAR_2;
  return GRASS.SOLID;
}

function waterFrame(x, y) {
  const n = !isWater(x, y - 1);
  const s = !isWater(x, y + 1);
  const w = !isWater(x - 1, y);
  const e = !isWater(x + 1, y);
  if (n && w) return WATER.CORNER_TL;
  if (n && e) return WATER.CORNER_TR;
  if (s && w) return WATER.CORNER_BL;
  if (s && e) return WATER.CORNER_BR;
  if (n) return WATER.EDGE_TOP;
  if (s) return WATER.EDGE_BOTTOM;
  if (w) return WATER.EDGE_LEFT;
  if (e) return WATER.EDGE_RIGHT;
  return WATER.SOLID;
}

// ------------------------------------------------------------------
// Build the Ground + Collision data arrays.
// ------------------------------------------------------------------
const ground = new Array(W * H).fill(0);
const collision = new Array(W * H).fill(0);
const COLLIDE_MARK = gidSand(SAND_SOLID); // any non-zero GID marks impassable

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    const t = terrain[y][x];
    if (t === T.BORDER) {
      ground[i] = gidSand(SAND_SOLID);
      collision[i] = COLLIDE_MARK; // outer ring + hard edge impassable
    } else if (t === T.SAND) {
      ground[i] = gidSand(SAND_SOLID);
    } else if (t === T.WATER) {
      ground[i] = gidWater(waterFrame(x, y));
      collision[i] = COLLIDE_MARK; // cannot walk into the oasis water
    } else {
      ground[i] = gidGrass(grassFrame(x, y));
    }
  }
}

// Sanity: Ground must be fully populated (no empty cells).
if (ground.some((g) => g === 0)) {
  throw new Error('Ground layer has empty cells — every tile must be non-zero.');
}
// Sanity: every placed GID must fall in a tileset range or be 0.
const ranges = tilesets.map((ts) => [ts.firstgid, ts.firstgid + ts.tilecount - 1]);
const validGid = (g) => g === 0 || ranges.some(([a, b]) => g >= a && g <= b);
for (const g of ground) if (!validGid(g)) throw new Error(`Invalid Ground GID ${g}`);
for (const g of collision) if (!validGid(g)) throw new Error(`Invalid Collision GID ${g}`);

// ------------------------------------------------------------------
// Exits object layer — mirrors src/data/zones.js#oasis_village.exits.
// The Ancient Library exit: edge north, tileRange [17,23].
// TiledMapLoader converts obj.x*scale/TILE (scale=4, TILE=64) => obj.x/16 tiles,
// then north tileRange = [floor(x), floor(x+w)-1]. So x=272(=17*16), w=112(=7*16)
// reproduces tileRange [17,23].
// ------------------------------------------------------------------
const exits = [
  {
    id: 1,
    name: 'oasis-to-library',
    type: 'exit',
    x: 17 * TS,
    y: 0,
    width: 7 * TS,
    height: TS,
    rotation: 0,
    visible: true,
    properties: [
      { name: 'targetZone', type: 'string', value: 'ancient_library' },
      { name: 'targetEntry', type: 'string', value: 'from_oasis' },
      { name: 'edge', type: 'string', value: 'north' },
    ],
  },
];

// ------------------------------------------------------------------
// Assemble the Tiled map.
// ------------------------------------------------------------------
const map = {
  compressionlevel: -1,
  width: W,
  height: H,
  tilewidth: TS,
  tileheight: TS,
  infinite: false,
  orientation: 'orthogonal',
  renderorder: 'right-down',
  type: 'map',
  version: '1.10',
  tiledversion: '1.11.0',
  nextlayerid: 4,
  nextobjectid: exits.length + 1,
  tilesets,
  layers: [
    {
      id: 1,
      name: 'Ground',
      type: 'tilelayer',
      visible: true,
      opacity: 1,
      x: 0,
      y: 0,
      width: W,
      height: H,
      data: ground,
    },
    {
      id: 2,
      name: 'Collision',
      type: 'tilelayer',
      visible: false,
      opacity: 1,
      x: 0,
      y: 0,
      width: W,
      height: H,
      data: collision,
    },
    {
      id: 3,
      name: 'Exits',
      type: 'objectgroup',
      visible: true,
      opacity: 1,
      x: 0,
      y: 0,
      draworder: 'topleft',
      objects: exits,
    },
  ],
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(map, null, 2) + '\n', 'utf8');

// Quick terrain census for the log.
const census = { border: 0, water: 0, sand: 0, grass: 0 };
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) census[terrain[y][x]]++;
const collideCount = collision.filter((g) => g !== 0).length;
console.log(`[generate-oasis-map] wrote ${path.relative(REPO, OUT)}`);
console.log(`  size ${W}x${H}, tilesets ${tilesets.length}, layers ${map.layers.length}`);
console.log(`  terrain: grass=${census.grass} sand=${census.sand} water=${census.water} border=${census.border}`);
console.log(`  collision tiles: ${collideCount}`);
