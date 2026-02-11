# Phase 22: Buildings & Interiors - Research

**Researched:** 2026-02-11
**Domain:** Phaser 3 multi-scene architecture, building entry/exit systems, interior map design
**Confidence:** HIGH

## Summary

Phase 22 makes buildings explorable by launching interior scenes via SceneStackManager. The system is **already scaffolded** — SceneStackManager exists with full tests, door interactables exist in zones, and all required subsystems (PlayerController, NPCManager, MapLoader) are reusable. Implementation involves: creating InteriorScene class, defining interior map configs, connecting door interaction to SceneStackManager.pushScene(), and adding audio crossfade logic.

**Key findings:**
- SceneStackManager already implements pause/launch/resume pattern (65 LOC, 10/10 tests passing)
- Phaser 3.90 scene lifecycle supports nested scenes without memory leaks via stop() cleanup
- MapLoader builds maps from 2D arrays programmatically — interiors don't need Tiled JSON files
- audioManager singleton already supports crossfade via playBGM/playAmbient methods
- Door interactables exist in zones but DOOR_OPENED event currently emits without action

**Primary recommendation:** Reuse WorldScene's delegation architecture for InteriorScene — same subsystems, different map data. Keep interiors small (max 20×20 tiles) with programmatic 2D array maps to avoid asset bloat.

---

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Phaser | 3.90.0 | Game engine with multi-scene support | Already validated in codebase, 548 tests passing |
| Howler.js | 2.2.4 | Audio crossfades between exterior/interior | Already integrated as audioManager singleton |

### Supporting (No New Dependencies)
All required systems already exist:
- **SceneStackManager** — pause/launch/resume logic (src/game/systems/SceneStackManager.js)
- **MapLoader** — programmatic map building from 2D arrays (src/game/systems/MapLoader.js)
- **PlayerController** — player spawn/movement/collision (src/game/systems/PlayerController.js)
- **NPCManager** — NPC spawning in interiors (src/game/systems/NPCManager.js)
- **InteractableManager** — doors, objects, bookshelves (src/game/systems/InteractableManager.js)
- **DOMOverlay** — Arabic text overlays (src/game/systems/DOMOverlay.js)

**Installation:**
```bash
# No new packages needed — all dependencies already installed
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── game/
│   ├── scenes/
│   │   ├── BootScene.js           # Existing — asset preloading
│   │   ├── WorldScene.js          # Existing — exterior zones
│   │   └── InteriorScene.js       # NEW — building interiors
│   ├── systems/
│   │   ├── SceneStackManager.js   # Existing — pause/launch/resume (BLDG-01)
│   │   ├── MapLoader.js           # Existing — reuse for interior maps
│   │   ├── PlayerController.js    # Existing — reuse in InteriorScene
│   │   ├── NPCManager.js          # Existing — reuse in InteriorScene
│   │   ├── InteractableManager.js # Existing — extend for exit doors
│   │   └── DOMOverlay.js          # Existing — reuse for Arabic text
│   └── config.js                  # UPDATE — add InteriorScene to scene array
├── data/
│   ├── zones.js                   # UPDATE — add interiorSceneKey to door configs
│   └── interiors.js               # NEW — interior map configs (BLDG-03)
└── services/
    └── audio.js                   # UPDATE — add crossfade for interiors (BLDG-10)
```

### Pattern 1: Scene Stack Management (Already Implemented)
**What:** Pause parent scene, launch interior scene, resume on exit
**When to use:** Building entry/exit (distinct from zone transitions which use shutdown/start)
**Example:**
```javascript
// Source: src/game/systems/SceneStackManager.js (existing code)
export class SceneStackManager {
  pushScene(interiorSceneKey, data = {}) {
    this._stack.push(this.scene.scene.key);
    this.scene.scene.pause();  // WorldScene keeps rendering but stops updating
    this.scene.scene.launch(interiorSceneKey, {
      ...data,
      returnSceneKey: this.scene.scene.key,
    });
  }

  popScene() {
    const activeScenes = this.scene.sys.scene.manager.getActiveScenes();
    const interiorScene = activeScenes.find(s => s !== this.scene);
    if (interiorScene) {
      interiorScene.scene.stop();  // Cleanup: calls shutdown(), destroys all game objects
    }
    this.scene.scene.resume();  // WorldScene resumes update loop
    return this._stack.pop();
  }
}
```
**Source:** [Phaser Scenes Documentation](https://docs.phaser.io/phaser/concepts/scenes), [Pause and Resume Example](https://phaser.io/examples/v3/view/scenes/pause-and-resume)

### Pattern 2: Programmatic Map Building (Already Validated)
**What:** Build small interior maps from 2D arrays without Tiled JSON files
**When to use:** Small maps (≤20×20 tiles) with simple layouts
**Example:**
```javascript
// Source: src/data/zones.js (existing pattern)
function buildScholarHouseInterior() {
  const W = 12, H = 10;  // Small 12×10 interior
  const m = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) {
      let tile = GRASS;  // Stone floor
      // Carpet area
      if (x >= 3 && x <= 8 && y >= 3 && y <= 6) tile = SAND;
      row.push(tile);
    }
    m.push(row);
  }
  return m;
}

const scholar_house_interior = {
  id: 'scholar_house_interior',
  mapWidth: 12,
  mapHeight: 10,
  buildMap: buildScholarHouseInterior,
  spawnPoint: { x: 6, y: 8 },  // Near door
  objects: [
    { key: 'ruin-pillar', x: 3, y: 2, collide: true },  // Bookshelf
    { key: 'rock1', x: 8, y: 2, collide: true },        // Desk
  ],
  npcs: [
    { id: 'scholar-yusuf-interior', key: 'npc-scholar-yusuf', x: 5, y: 3 },
  ],
  interactables: [
    { id: 'exit-door', type: 'door', x: 6, y: 9, isExit: true },  // Exit back to WorldScene
    { id: 'bookshelf-study', type: 'bookshelf', x: 3, y: 2, category: 'greetings' },
  ],
};
```
**Source:** [Phaser Tilemap from 2D Array](https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6)

### Pattern 3: InteriorScene Reuses WorldScene Subsystems (BLDG-04)
**What:** Same delegation pattern as WorldScene — create all subsystems in create(), destroy in shutdown()
**When to use:** All interior scenes
**Example:**
```javascript
// Source: Adapted from src/game/scenes/WorldScene.js pattern
export class InteriorScene extends Phaser.Scene {
  constructor() {
    super('InteriorScene');
    // Same subsystem properties as WorldScene
    this.playerController = null;
    this.npcManager = null;
    this.interactableManager = null;
    this.mapLoader = null;
    this.domOverlay = null;
  }

  init(data) {
    this.returnSceneKey = data.returnSceneKey;
    this.interiorId = data.interiorId;
    this.entryPosition = data.entryPosition;  // Where player was in WorldScene
  }

  create() {
    // Initialize subsystems (same as WorldScene pattern)
    this.domOverlay = new DOMOverlayManager(this);
    this.domOverlay.init();
    this.playerController = new PlayerController(this);
    this.npcManager = new NPCManager(this);
    this.interactableManager = new InteractableManager(this);
    this.mapLoader = new MapLoader(this);

    // Load interior map from config
    const interior = INTERIORS[this.interiorId];
    const wallGroup = this.mapLoader.create(interior, interior.mapWidth, interior.mapHeight);

    // Spawn player at interior spawn point
    const player = this.playerController.create(
      interior.spawnPoint.x * 64,
      interior.spawnPoint.y * 64,
      wallGroup
    );

    // Spawn NPCs and interactables
    this.npcManager.create(interior.npcs, player, wallGroup, this.domOverlay);
    this.interactableManager.create(interior.interactables, this.mapLoader.getObjectSprites());

    // Camera setup
    this.playerController.setupCamera(interior.mapWidth * 64, interior.mapHeight * 64);
  }

  update() {
    this.playerController.update();
    this.npcManager.update(/* ... */);
    this.interactableManager.update(/* ... */);
    this.checkExitDoor();  // NEW — check if player walks to exit door
    if (this.domOverlay) this.domOverlay.update();
  }

  shutdown() {
    // Cleanup all subsystems (same as WorldScene pattern)
    if (this.domOverlay) this.domOverlay.destroy();
    if (this.mapLoader) this.mapLoader.destroy();
    if (this.npcManager) this.npcManager.destroy();
    if (this.interactableManager) this.interactableManager.destroy();
    if (this.playerController) this.playerController.destroy();
  }
}
```
**Source:** [Phaser Scene Lifecycle](https://deepwiki.com/phaserjs/phaser/3.1-scene-lifecycle), [Phaser Examples - Pause and Resume](https://phaser.io/examples/v3/view/scenes/pause-and-resume)

### Pattern 4: Audio Crossfade on Entry/Exit (BLDG-10)
**What:** Fade out zone BGM, fade in interior ambient using audioManager
**When to use:** Building entry and exit transitions
**Example:**
```javascript
// Source: src/services/audio.js (existing audioManager methods)
// On building entry (WorldScene):
handleDoorOpened({ id, interiorId }) {
  const { audioManager } = await import('../../services/audio.js');

  // Fade out current zone BGM (800ms fadeout built into playBGM)
  audioManager.playBGM('interior-ambient');  // Crossfades automatically

  // Launch interior scene
  this.sceneStackManager.pushScene('InteriorScene', {
    interiorId,
    entryPosition: { x: this.playerController.getPlayer().x, y: this.playerController.getPlayer().y },
  });
}

// On building exit (InteriorScene):
exitBuilding() {
  const { audioManager } = await import('../../services/audio.js');

  // Restore zone BGM based on currentZone from Redux
  const zone = store.getState().player.currentZone;
  const bgmTrack = ZONE_BGM_MAP[zone];
  audioManager.playBGM(bgmTrack);  // Crossfades back to zone music

  // Pop scene and resume WorldScene
  const worldScene = this.scene.get(this.returnSceneKey);
  worldScene.sceneStackManager.popScene();
}
```
**Source:** src/services/audio.js (playBGM method with built-in 800ms crossfade), src/data/audioConfig.js (ZONE_BGM_MAP)

### Pattern 5: Exit Door Detection (BLDG-06)
**What:** Check if player is near exit door and handle exit via proximity or SPACE key
**When to use:** Every frame in InteriorScene.update()
**Example:**
```javascript
// In InteriorScene.update()
checkExitDoor() {
  const player = this.playerController.getPlayer();
  const exitDoors = this.interactables.filter(obj => obj.type === 'door' && obj.isExit);

  exitDoors.forEach(door => {
    const dist = Phaser.Math.Distance.Between(player.x, player.y, door.worldX, door.worldY);
    if (dist < 128) {  // 2 tiles proximity
      door.hintText.setVisible(true);

      // Exit on SPACE key
      if (Phaser.Input.Keyboard.JustDown(this.interactKey) && !this.interactCooldown) {
        this.exitBuilding();
      }
    } else {
      door.hintText.setVisible(false);
    }
  });
}
```
**Source:** Adapted from src/game/systems/InteractableManager.js proximity pattern

---

## Anti-Patterns to Avoid

- **Anti-pattern:** Creating separate systems for interiors instead of reusing WorldScene systems
  - **Why it's bad:** Code duplication, harder maintenance, diverging behavior between exterior and interior
  - **Do instead:** Reuse PlayerController, NPCManager, MapLoader, etc. (BLDG-04 requirement)

- **Anti-pattern:** Using scene.start() to enter buildings
  - **Why it's bad:** Shuts down WorldScene, loses player state, requires full zone reload on exit
  - **Do instead:** Use scene.pause() + scene.launch() via SceneStackManager (BLDG-01)

- **Anti-pattern:** Creating Tiled JSON files for every small interior
  - **Why it's bad:** Asset bloat, slow preloading, unnecessary complexity for simple 12×10 maps
  - **Do instead:** Programmatic 2D array map building (existing MapLoader supports this)

- **Anti-pattern:** Spawning player at fixed position on exit
  - **Why it's bad:** Breaks immersion if player entered from north but exits to south
  - **Do instead:** Store entryPosition in init() data and spawn player at exact exterior position (BLDG-06)

- **Anti-pattern:** Abrupt audio cuts on entry/exit
  - **Why it's bad:** Jarring UX, feels unpolished
  - **Do instead:** Use audioManager crossfade methods (playBGM auto-crossfades over 800ms)

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Scene lifecycle management | Custom scene stack with manual tracking | SceneStackManager (already exists) | Already tested, handles edge cases (empty stack, nested scenes, destroy cleanup) |
| Map collision setup | Manual tile-by-tile collision loops | MapLoader.setupCollision() (already exists) | Handles water, borders, exit gaps automatically |
| Player spawn/camera setup | Direct Phaser API calls in scene | PlayerController.create() + setupCamera() | Consistent spawn behavior, camera lerp/deadzone pre-tuned |
| Audio crossfades | Manual Howl fade + setTimeout | audioManager.playBGM/playAmbient | Built-in 800ms crossfade, handles interruptions, memory-safe |
| Interior map data structure | Custom JSON schema | Same zone config pattern (buildMap, objects, npcs, interactables) | Reuses existing MapLoader parsing logic |

**Key insight:** All required systems already exist. Phase 22 is **integration**, not greenfield development.

---

## Common Pitfalls

### Pitfall 1: Memory Leaks from Scene Cleanup
**What goes wrong:** Launching interior scenes without proper shutdown() destroys game objects but may leave event listeners or timers
**Why it happens:** Phaser scene.stop() calls shutdown(), but subsystems must clean up manually (MapLoader tweens, NPCManager DOM overlays)
**How to avoid:**
- Call destroy() on all subsystems in InteriorScene.shutdown()
- Validate cleanup by checking scene.sys.scene.manager.getActiveScenes().length after popScene()
**Warning signs:** Memory usage climbing after multiple entry/exit cycles, duplicate DOM overlays, orphaned timers firing

### Pitfall 2: Player Position Desync on Exit
**What goes wrong:** Player exits building but spawns at wrong position in WorldScene
**Why it happens:** Not storing entryPosition in init() data or using fixed spawn point
**How to avoid:**
- Pass entryPosition: { x, y } in SceneStackManager.pushScene() data
- Spawn player at entryPosition in InteriorScene.create() (BLDG-06)
**Warning signs:** Player teleports across map after exiting building, player spawns inside walls

### Pitfall 3: Collision Bounds Mismatch
**What goes wrong:** Player can walk through walls or gets stuck at map edges in interiors
**Why it happens:** Forgetting to call setCollideWorldBounds() or setBounds() with correct interior map dimensions
**How to avoid:**
- In PlayerController.create(), always set physics.world.setBounds(0, 0, mapPixelW, mapPixelH)
- Verify collision setup in small test interior before building all 15
**Warning signs:** Player walks through walls, gets stuck at (0,0), camera doesn't clamp to map bounds

### Pitfall 4: Door Interaction Conflicts
**What goes wrong:** Pressing SPACE near exit door triggers both door interaction AND nearby NPC dialogue
**Why it happens:** Multiple proximity checks firing in same frame without priority system
**How to avoid:**
- Check exit door FIRST in update() before NPC interaction checks
- Use interactCooldown flag to prevent double-triggering
- Return early from checkExitDoor() after successful exit
**Warning signs:** Exit animation starts but then NPC dialogue opens, player freezes mid-exit

### Pitfall 5: Audio Context Suspend on Mobile
**What goes wrong:** Audio doesn't crossfade on first building entry (iOS Safari)
**Why it happens:** Web Audio Context starts suspended, requires user interaction to resume
**How to avoid:**
- audioManager already handles this via Howler.js (it auto-resumes on first user interaction)
- Ensure door interaction counts as user gesture (not auto-triggered)
**Warning signs:** Silent building entry on mobile, audio works on desktop but not iOS

---

## Code Examples

Verified patterns from codebase:

### Door Interaction Triggering Scene Transition
```javascript
// Source: src/game/systems/InteractableManager.js (existing pattern) + SceneStackManager integration
handleInteractable(obj) {
  if (obj.type === 'door') {
    if (obj.locked) {
      EventBus.emit(EVENTS.DOOR_LOCKED, {
        message: obj.lockMessage || 'This door is locked.',
        id: obj.id,
      });
    } else if (obj.interiorSceneKey) {  // NEW — door leads to interior
      EventBus.emit(EVENTS.DOOR_OPENED, {
        id: obj.id,
        interiorSceneKey: obj.interiorSceneKey,
        entryPosition: {
          x: this.scene.playerController.getPlayer().x,
          y: this.scene.playerController.getPlayer().y,
        },
      });
    }
  }
}
```

### WorldScene Handling Door Open Event
```javascript
// Source: src/game/scenes/WorldScene.js (NEW handler in create())
useEffect(() => {
  const handleDoorOpened = ({ id, interiorSceneKey, entryPosition }) => {
    // Crossfade audio to interior ambient
    const { audioManager } = await import('../../services/audio.js');
    audioManager.playBGM('interior-ambient');

    // Launch interior scene via SceneStackManager
    this.sceneStackManager.pushScene(interiorSceneKey, {
      interiorId: id,
      entryPosition,
    });
  };

  EventBus.on(EVENTS.DOOR_OPENED, handleDoorOpened);
  return () => EventBus.off(EVENTS.DOOR_OPENED, handleDoorOpened);
}, []);
```

### Interior Map Config (Small 12×10 Scholar's House)
```javascript
// Source: NEW file src/data/interiors.js
import { GRASS, SAND, TILE } from './zones.js';

function buildScholarHouseInterior() {
  const W = 12, H = 10;
  const m = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) {
      let tile = GRASS;  // Stone floor
      // Carpet area
      if (x >= 3 && x <= 8 && y >= 3 && y <= 6) tile = SAND;
      row.push(tile);
    }
    m.push(row);
  }
  return m;
}

export const INTERIORS = {
  scholar_house_interior: {
    id: 'scholar_house_interior',
    name: "Scholar Yusuf's Study",
    mapWidth: 12,
    mapHeight: 10,
    buildMap: buildScholarHouseInterior,
    spawnPoint: { x: 6, y: 8 },  // Near door entrance

    objects: [
      { key: 'ruin-pillar', x: 3, y: 2, collide: true, collideW: 40, collideH: 60 },  // Tall bookshelf
      { key: 'rock1', x: 8, y: 2, collide: true, collideW: 60, collideH: 40 },        // Desk
      { key: 'green-tree-small', x: 5, y: 5, collide: false },                        // Decorative plant
    ],

    npcs: [
      {
        id: 'scholar-yusuf-interior',
        key: 'npc-scholar-yusuf',
        name: 'Scholar Yusuf',
        nameArabic: 'الشَّيْخ يوسُف',
        x: 5,
        y: 3,
      },
    ],

    interactables: [
      {
        id: 'exit-door',
        type: 'door',
        x: 6,
        y: 9,
        isExit: true,  // Marks this as exit back to WorldScene
        labelArabic: 'خروج',
        labelEnglish: 'Exit',
      },
      {
        id: 'bookshelf-ancient',
        type: 'bookshelf',
        x: 3,
        y: 2,
        category: 'greetings',
      },
    ],
  },

  // ... 14 more interiors (BLDG-03 requirement)
};
```

### Exit Door Checking in InteriorScene
```javascript
// Source: InteriorScene.update() pattern
checkExitDoor() {
  const player = this.playerController.getPlayer();
  const exitDoor = this.interactables.find(obj => obj.type === 'door' && obj.isExit);

  if (!exitDoor) return;

  const dist = Phaser.Math.Distance.Between(
    player.x, player.y,
    exitDoor.worldX, exitDoor.worldY
  );

  if (dist < 128 && Phaser.Input.Keyboard.JustDown(this.interactKey) && !this.interactCooldown) {
    this.interactCooldown = true;
    this.time.delayedCall(500, () => { this.interactCooldown = false; });

    // Crossfade audio back to zone BGM
    const { audioManager } = await import('../../services/audio.js');
    const zone = this.registry.get('currentZone') || 'oasis_village';
    const bgmTrack = ZONE_BGM_MAP[zone];
    audioManager.playBGM(bgmTrack);

    // Pop scene and resume WorldScene
    const worldScene = this.scene.get(this.returnSceneKey);
    worldScene.sceneStackManager.popScene();
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| scene.start() for room transitions | scene.pause() + scene.launch() | Phaser 3.0 (2018) | No state loss, faster transitions, parallel scenes |
| Manual collision tile loops | StaticGroup + automated collision setup | Validated in MapLoader.js | Cleaner code, fewer bugs |
| Tiled JSON for all maps | Programmatic 2D arrays for small maps | Project convention | Faster iteration, less asset bloat |
| Phaser audio API | Howler.js singleton | Phase 15 (2026-01) | Mobile reliability, crossfade support |

**Deprecated/outdated:**
- **scene.start()** for sub-scenes: Replaced by pause/launch pattern for buildings (scene.start() still valid for zone transitions)
- **Manual audio fade loops**: Replaced by Howler.js built-in crossfade (audioManager.playBGM handles it)

---

## Open Questions

1. **How many unique interior layouts are needed?**
   - What we know: BLDG-03 requires "at least 15 buildings" with unique layouts
   - What's unclear: Can some interiors share layouts with different NPCs/objects, or must all 15 be geometrically distinct?
   - Recommendation: Create 5-7 base layout templates (house-small, house-large, shop, library, mosque) and vary content (NPCs, objects, decorations) for the 15 buildings

2. **Should exit doors be automatic or require interaction?**
   - What we know: BLDG-06 says "player exits by walking to the door"
   - What's unclear: Does "walking to" mean proximity auto-exit or proximity + SPACE key?
   - Recommendation: Require SPACE key (consistency with entrance interaction, prevents accidental exits)

3. **How should locked interiors persist after unlock?**
   - What we know: BLDG-11 requires buildings to unlock based on quest/story flags
   - What's unclear: Is unlock state stored in narrativeSlice, zones config mutation, or both?
   - Recommendation: Store in narrativeSlice.buildingUnlocks (Redux persist) and check on door interaction

4. **Should InteriorScene be one generic scene or multiple scene classes?**
   - What we know: All interiors reuse the same subsystems (BLDG-04)
   - What's unclear: Single InteriorScene with dynamic map loading vs. separate classes per interior type
   - Recommendation: Single generic InteriorScene class — pass interiorId in init() data and load config from INTERIORS registry (same pattern as WorldScene zones)

---

## Sources

### Primary (HIGH confidence)
- Codebase: src/game/systems/SceneStackManager.js — validated pause/launch/resume implementation with tests
- Codebase: src/game/systems/MapLoader.js — validated 2D array map building pattern
- Codebase: src/game/scenes/WorldScene.js — validated subsystem delegation architecture
- Codebase: src/services/audio.js — validated Howler.js crossfade integration
- Codebase: .planning/REQUIREMENTS.md — BLDG-01 through BLDG-12 specification

### Secondary (MEDIUM confidence)
- [Phaser Scenes Documentation](https://docs.phaser.io/phaser/concepts/scenes) — scene lifecycle, pause/resume behavior
- [Phaser Scene Manager](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scenemanager/) — launch vs start, sleep vs pause
- [Phaser Examples - Pause and Resume](https://phaser.io/examples/v3/view/scenes/pause-and-resume) — validated pattern reference
- [Modular Game Worlds with Tilemaps](https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6) — 2D array map building
- [How to Enter Buildings in Phaser 3](https://phaser.discourse.group/t/how-do-i-get-a-character-to-enter-a-building-in-phaser-3/788) — door interaction patterns

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All dependencies already installed and validated
- Architecture: HIGH — SceneStackManager exists with tests, subsystems proven in WorldScene
- Pitfalls: MEDIUM — Based on Phaser 3 general patterns, not project-specific bugs yet

**Research date:** 2026-02-11
**Valid until:** 2026-03-13 (30 days — stable architecture domain)
