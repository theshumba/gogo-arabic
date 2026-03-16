/**
 * Constants typically imported from zones.js, but duplicated here 
 * to avoid circular dependencies (zones.js -> realWorldZones -> mapPlaceholder -> zones.js).
 */
const SAND = 0;
const GRASS = 1;

/**
 * Generates a simple 40x30 placeholder map.
 * Used for new zones that don't have unique designs yet.
 */
export function buildPlaceholderMap() {
    const W = 40, H = 30;
    const m = [];
    for (let y = 0; y < H; y++) {
        const row = [];
        for (let x = 0; x < W; x++) {
            let tile = SAND;
            // Simple border
            if (x === 0 || x === W - 1 || y === 0 || y === H - 1) tile = GRASS;
            // Cross path
            if (x >= W / 2 - 2 && x <= W / 2 + 2) tile = GRASS;
            if (y >= H / 2 - 2 && y <= H / 2 + 2) tile = GRASS;
            row.push(tile);
        }
        m.push(row);
    }
    return m;
}

/**
 * Default spawn point for placeholder maps.
 */
export const defaultSpawnPoint = { x: 20, y: 15 };

/**
 * Default objects for placeholder maps.
 */
export const defaultObjects = [
    { key: 'kenmi-desert-temple-desert-obelisk-small-1', x: 10, y: 10, collide: true, collideW: 20, collideH: 20 },
    { key: 'kenmi-desert-temple-desert-obelisk-small-1', x: 30, y: 10, collide: true, collideW: 20, collideH: 20 },
    { key: 'kenmi-desert-temple-desert-obelisk-small-1', x: 10, y: 20, collide: true, collideW: 20, collideH: 20 },
    { key: 'kenmi-desert-temple-desert-obelisk-small-1', x: 30, y: 20, collide: true, collideW: 20, collideH: 20 },
];
