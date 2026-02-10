# Technology Stack: v4.0 Game Soul & Polish

**Project:** GoGo Arabic v4.0
**Research Date:** 2026-02-09
**Focus:** Audio system, visual effects, NPC behaviors, building interiors, game feel polish

---

## Existing Stack (DO NOT CHANGE)

### Frontend Core
| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| React | 19.2.4 | UI framework | Validated, keep |
| Phaser | 3.90.0 | Game engine | Validated, keep |
| Redux Toolkit | 2.11.2 | State management | Validated, keep |
| Framer Motion | 11.15.0 | UI animations | Validated, keep |
| React Router | 7.13.0 | Routing | Validated, keep |
| Howler.js | 2.2.4 | **ALREADY INSTALLED** | Keep, use for audio system |

### Testing & Quality
| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| Vitest | 3.0.0 | Unit test runner | Validated, keep |
| Playwright | 1.58.2 | E2E testing | Validated, keep |
| ESLint | 9.39.2 | Linting | Validated, keep |
| Prettier | 3.8.1 | Formatting | Validated, keep |

---

## NEW Additions for v4.0

### 1. Audio System — USE HOWLER.JS (Already Installed!)

**CRITICAL: Howler.js 2.2.4 is already in package.json. DO NOT install Phaser's audio system alongside it.**

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| **howler** | 2.2.4 | Music, SFX, ambient audio | **ALREADY INSTALLED.** More reliable than Phaser audio, better mobile support, 7KB, handles Web Audio Context suspend/resume automatically, audio sprites support |

**Why Howler.js over Phaser 3 audio:**
- Phaser has known Web Audio memory leaks (GitHub issue #5224)
- Howler handles mobile user interaction requirements automatically
- Better cross-platform reliability (iOS, Android)
- Lighter weight (7KB vs Phaser's audio subsystem)
- More intuitive API for non-game-loop audio
- Community consensus: use Howler for production games

**Integration approach:**
1. Keep Phaser config with `audio: { noAudio: true }` to disable Phaser's audio
2. Initialize Howler in `BootScene.js`
3. Create audio manager class wrapping Howler API
4. Use Redux for audio state (volume, muted)

**No installation needed** — Howler already in dependencies!

**Audio formats to use:**
- **Music:** OGG format (best compression, open-source, ~50-70% smaller than MP3 with same quality)
- **SFX:** OGG format (fast decoding, small files)
- **Fallback:** MP3 for broad compatibility (Howler auto-selects based on browser support)

**Recommended pattern:**
```js
// src/game/systems/AudioManager.js
import { Howl, Howler } from 'howler';

export class AudioManager {
  constructor() {
    this.music = {};
    this.sfx = {};

    // Background music (looping)
    this.music.oasisTheme = new Howl({
      src: ['/assets/audio/music/oasis-theme.ogg', '/assets/audio/music/oasis-theme.mp3'],
      loop: true,
      volume: 0.5,
    });

    // Sound effects (one-shot)
    this.sfx.questComplete = new Howl({
      src: ['/assets/audio/sfx/quest-complete.ogg'],
      volume: 0.7,
    });

    // Audio sprites (multiple SFX in one file)
    this.sfx.uiSounds = new Howl({
      src: ['/assets/audio/sfx/ui-sprite.ogg'],
      sprite: {
        click: [0, 200],      // 0ms to 200ms
        hover: [300, 150],    // 300ms to 450ms
        error: [500, 300],    // 500ms to 800ms
      }
    });
  }

  playMusic(key) {
    if (this.music[key]) {
      this.music[key].play();
    }
  }

  stopMusic(key) {
    if (this.music[key]) {
      this.music[key].stop();
    }
  }

  playSfx(key, sprite = null) {
    if (sprite && this.sfx[key]) {
      this.sfx[key].play(sprite);
    } else if (this.sfx[key]) {
      this.sfx[key].play();
    }
  }

  setMasterVolume(vol) {
    Howler.volume(vol);
  }

  mute(muted) {
    Howler.mute(muted);
  }
}
```

**Free audio resources:**
- [OpenGameArt.org CC0 Music](https://opengameart.org/content/cc0-music)
- [OpenGameArt.org CC0 Sound Effects](https://opengameart.org/content/cc0-sound-effects)
- [itch.io CC0 music assets](https://itch.io/game-assets/free/tag-music)
- [Pixabay CC0 sound effects](https://pixabay.com/sound-effects/search/cc0/)

**Confidence:** HIGH (Howler already installed, community-proven, official docs current)

---

### 2. Particle Effects — USE PHASER 3 BUILT-IN

**NO NEW LIBRARY NEEDED.** Phaser 3.90.0 has built-in particle system.

**Why use Phaser particles:**
- Native to engine, zero dependencies
- GPU-accelerated
- ParticleEmitter redesigned in v3.60+ (no manager needed)
- Supports object pools, emit zones, complex behaviors

**Integration pattern:**
```js
// In WorldScene.js or NPC sprite
createQuestCompleteEffect(x, y) {
  const emitter = this.add.particles(x, y, 'particle-star', {
    speed: { min: 100, max: 200 },
    angle: { min: 0, max: 360 },
    scale: { start: 1, end: 0 },
    lifespan: 600,
    gravityY: 150,
    quantity: 12,
    blendMode: 'ADD',
  });

  // One-shot burst
  emitter.explode(12);
}

// NPC idle sparkle (continuous)
createNpcIdleParticles(npc) {
  const emitter = this.add.particles(npc.x, npc.y - 40, 'particle-sparkle', {
    speed: 20,
    scale: { start: 0.3, end: 0 },
    alpha: { start: 0.8, end: 0 },
    lifespan: 1000,
    frequency: 300,
    quantity: 1,
    blendMode: 'ADD',
  });

  // Update position every frame
  this.events.on('update', () => {
    emitter.setPosition(npc.x, npc.y - 40);
  });

  return emitter;
}
```

**Particle texture requirements:**
- Single-color PNG with alpha channel
- Size: 8x8 to 32x32 pixels (keep small for performance)
- Examples: circle, star, square, diamond
- Can use sprite sheet frames as particle textures

**Use cases for particles:**
- Quest marker sparkle above NPCs
- Chest open burst
- Level-up effect
- Review session success stars
- Footstep dust when walking on sand
- Water ripples near oasis
- Ambient fireflies in forest zone

**Confidence:** HIGH (Phaser 3 built-in, official examples, v3.90 stable)

---

### 3. Game Feel / "Juice" — USE PHASER 3 BUILT-IN TWEENS + OPTIONAL PLUGIN

**Phaser 3 has built-in tweens and camera effects. External plugins optional.**

#### Option A: Phaser 3 Built-In (Recommended)

**NO NEW LIBRARY NEEDED.** Use Phaser's tween system and camera effects.

**Built-in capabilities:**
- **Tweens:** Smooth property animations (position, scale, rotation, alpha)
- **Camera shake:** `this.cameras.main.shake(duration, intensity)`
- **Camera flash:** `this.cameras.main.flash(duration, red, green, blue)`
- **Camera zoom:** `this.cameras.main.zoomTo(zoom, duration)`
- **Timeline:** Chain multiple tweens

**Examples:**
```js
// Screen shake on wrong quiz answer
shakeScreen() {
  this.cameras.main.shake(300, 0.01); // 300ms, intensity 0.01
}

// Bounce animation on button press
bounceSprite(sprite) {
  this.tweens.add({
    targets: sprite,
    scaleX: 1.1,
    scaleY: 0.9,
    duration: 100,
    yoyo: true,
    ease: 'Quad.easeInOut',
  });
}

// Float animation for collectible
floatItem(sprite) {
  this.tweens.add({
    targets: sprite,
    y: sprite.y - 10,
    duration: 1000,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
}

// Pulse effect for quest marker
pulseMarker(marker) {
  this.tweens.add({
    targets: marker,
    scale: { from: 1, to: 1.3 },
    alpha: { from: 1, to: 0.7 },
    duration: 800,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
}

// Impact freeze (pause + resume)
impactFreeze(duration = 150) {
  this.physics.pause();
  this.time.delayedCall(duration, () => {
    this.physics.resume();
  });
}
```

**Confidence:** HIGH (Phaser 3 core features, well-documented)

#### Option B: PhaserFX Plugin (Optional, for advanced effects)

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| **PhaserFX** | 1.0+ | Advanced juice effects | Itch.io library, one-line effects (sway, wobble, float, rubber-band), camera shake/flash/zoom presets |

**Installation:** Manual (download from [itch.io](https://janekovics.itch.io/phaserfx))

**Only consider if:**
- You want pre-built effect presets
- Team lacks animation experience
- Need complex motion patterns quickly

**Recommendation:** Start with built-in Phaser tweens. Add PhaserFX only if needed.

**Confidence:** MEDIUM (Plugin exists, manual install, not on npm)

---

### 4. NPC Idle Behaviors & Pathfinding

**For idle animations:** Use Phaser 3 built-in tweens + timers.
**For pathfinding:** Add easystar.js if needed.

#### Idle Behaviors (No Library Needed)

**Use Phaser's built-in systems:**
- Timers for behavior state switching
- Tweens for simple movement
- Animation system for sprite changes

**Example idle behaviors:**
```js
// In NPC.js or NPCManager.js
class NPCIdleBehavior {
  constructor(scene, npc) {
    this.scene = scene;
    this.npc = npc;
    this.state = 'idle'; // idle, turn, nod

    // Random idle animation every 3-7 seconds
    this.scheduleNextIdle();
  }

  scheduleNextIdle() {
    const delay = Phaser.Math.Between(3000, 7000);
    this.scene.time.delayedCall(delay, () => {
      this.performIdleAction();
    });
  }

  performIdleAction() {
    const actions = ['nod', 'turn', 'look'];
    const action = Phaser.Utils.Array.GetRandom(actions);

    if (action === 'nod') {
      // Tween head down and up
      this.scene.tweens.add({
        targets: this.npc,
        scaleY: 0.95,
        duration: 200,
        yoyo: true,
        onComplete: () => this.scheduleNextIdle()
      });
    } else if (action === 'turn') {
      // Change facing direction briefly
      this.npc.setFlipX(!this.npc.flipX);
      this.scene.time.delayedCall(2000, () => {
        this.npc.setFlipX(!this.npc.flipX);
        this.scheduleNextIdle();
      });
    }
  }
}
```

**Types of idle behaviors to implement:**
1. **Static idle:** Breathing animation (subtle scale Y tween)
2. **Random gestures:** Nod, turn, look around
3. **Position shift:** Small step left/right (no pathfinding needed)
4. **Quest marker pulse:** Already uses tweens, expand it
5. **Ambient particles:** Sparkles for quest NPCs (see Particles section)

**Confidence:** HIGH (Phaser built-in features)

#### Pathfinding (Optional, if NPCs need to walk paths)

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| **easystarjs** | 0.4.4 | A* pathfinding for NPCs | Async, 7KB, integrates with Tiled tilemaps, used by Phaser community |

**Installation:**
```bash
npm install easystarjs@^0.4.4
```

**When to use:**
- NPCs that patrol zones
- NPCs that walk to player
- NPCs that avoid obstacles dynamically

**When NOT to use:**
- Simple static NPCs (current game has this)
- NPCs that only turn/animate in place

**Integration example:**
```js
import EasyStar from 'easystarjs';

class NPCPatrol {
  constructor(scene, npc, waypoints) {
    this.scene = scene;
    this.npc = npc;
    this.waypoints = waypoints; // Array of {x, y} tile coords
    this.currentWaypoint = 0;

    // Initialize EasyStar
    this.pathfinder = new EasyStar.js();

    // Set grid from MapLoader (collision layer)
    const grid = scene.mapLoader.getCollisionGrid();
    this.pathfinder.setGrid(grid);
    this.pathfinder.setAcceptableTiles([0]); // 0 = walkable

    this.moveToNextWaypoint();
  }

  moveToNextWaypoint() {
    const target = this.waypoints[this.currentWaypoint];
    const startX = Math.floor(this.npc.x / 64);
    const startY = Math.floor(this.npc.y / 64);

    this.pathfinder.findPath(startX, startY, target.x, target.y, (path) => {
      if (path) {
        this.followPath(path);
      }
    });

    this.pathfinder.calculate();
  }

  followPath(path) {
    // Convert path to tweens or velocity changes
    // (Implementation depends on desired movement style)
  }
}
```

**Recommendation:** Skip pathfinding for v4.0 unless you add patrol NPCs. Current game uses static NPCs — simple idle animations are sufficient.

**Confidence:** HIGH (easystarjs verified on npm, widely used)

---

### 5. Building Interiors & Layer Transitions

**NO NEW LIBRARY NEEDED.** Use Phaser 3 built-in tilemap layers + scene system.

**Approach:** Multi-layer Tiled maps with depth sorting.

**Current architecture:** Zones are data-driven (`zones.js`), MapLoader builds maps procedurally. For building interiors, extend this pattern.

#### Option A: Layer-Based Interiors (Recommended)

**How it works:**
1. Tiled map has multiple layers: `ground`, `walls`, `roofs`, `interior-ground`, `interior-walls`
2. NPCs/player have dynamic depth based on Y position
3. Roofs render above player when outside, below player when inside
4. Trigger zones toggle layer visibility

**Tiled layer structure:**
```
Layers:
  - ground (depth: 0)
  - interior-floor (depth: 1, starts invisible)
  - walls (depth: 2)
  - interior-walls (depth: 3, starts invisible)
  - objects (depth: 4, dynamic Y-sort with player/NPCs)
  - roof-exterior (depth: 1000, visible when outside)
  - roof-interior (depth: 5, visible when inside)
```

**Code pattern:**
```js
// In MapLoader.js
createInteriorTrigger(x, y, width, height, interiorLayers) {
  const zone = this.scene.add.zone(x, y, width, height);
  this.scene.physics.add.existing(zone);

  this.scene.physics.add.overlap(
    this.scene.playerController.getPlayer(),
    zone,
    () => this.enterInterior(interiorLayers)
  );
}

enterInterior(interiorLayers) {
  // Hide exterior layers
  this.map.getLayer('roof-exterior').setVisible(false);

  // Show interior layers
  interiorLayers.forEach(layer => {
    this.map.getLayer(layer).setVisible(true);
  });

  // Emit event for audio change (exterior → interior ambient)
  EventBus.emit('interior-entered');
}

exitInterior(interiorLayers) {
  // Reverse the process
}
```

**Integration with zones.js:**
```js
// In zones.js
const oasis_village = {
  // ... existing properties

  interiors: [
    {
      id: 'scholar-house',
      triggerX: 8,
      triggerY: 4,
      triggerW: 3,
      triggerH: 2,
      layers: ['interior-scholar-floor', 'interior-scholar-walls'],
      npcs: ['scholar-yusuf'], // NPC stays in same position
      ambientSound: 'interior-quiet',
    }
  ],
};
```

**Benefits:**
- No scene changes (faster, no load time)
- NPCs persist in same world space
- Simpler state management
- Standard Phaser + Tiled pattern

**Confidence:** HIGH (Phaser tilemap layers well-documented, Tiled standard practice)

#### Option B: Separate Interior Scenes (Alternative)

**How it works:**
1. Each building interior is a separate Phaser scene
2. Trigger zone calls `this.scene.start('ScholarHouseInterior')`
3. Pass player position data via scene data
4. Scene transition with fade effect

**When to use:**
- Large, complex interiors (50+ tiles)
- Interiors with unique mechanics
- Performance concerns (too many layers)

**Example:**
```js
// In InteractableManager.js
createDoorTrigger(x, y, targetScene, entryPoint) {
  const door = this.scene.add.zone(x, y, 64, 64);
  this.scene.physics.add.existing(door);

  this.scene.physics.add.overlap(
    this.scene.playerController.getPlayer(),
    door,
    () => {
      this.scene.cameras.main.fade(300, 0, 0, 0);
      this.scene.time.delayedCall(300, () => {
        this.scene.scene.start(targetScene, { entryPoint });
      });
    }
  );
}
```

**Recommendation:** Use layer-based for v4.0 (simpler, fits current architecture). Use scenes if interiors become complex.

**Confidence:** HIGH (both patterns standard in Phaser 3)

---

### 6. Y-Sorting / Depth Management

**NO NEW LIBRARY NEEDED.** Use Phaser 3 built-in depth sorting.

**Current implementation:** NPCs and player likely use fixed depths. For interiors, need dynamic depth based on Y position.

**Pattern:**
```js
// In WorldScene.js update loop
update() {
  // ... existing code

  // Dynamic depth sorting for player, NPCs, and objects
  this.sortDepths();
}

sortDepths() {
  const entities = [
    this.playerController.getPlayer(),
    ...this.npcManager.getNPCs(),
    ...this.mapLoader.getObjectSprites(), // Trees, rocks with Y-sort
  ];

  entities.forEach(entity => {
    // Depth = Y position (higher Y = further down screen = in front)
    entity.setDepth(entity.y);
  });
}
```

**For multi-layer objects (trees with bases):**
```js
// Tree base at depth Y, tree top at depth Y + 1000
this.treeBase.setDepth(this.y);
this.treeTop.setDepth(this.y + 1000);
```

**Confidence:** HIGH (Phaser 3 core feature)

---

## What NOT to Add (Avoid Over-Engineering)

### ❌ Phaser Audio System
**Why skip:** Howler.js already installed, more reliable, better mobile support. Memory leak issues in Phaser audio (GitHub #5224).

### ❌ rot.js (roguelike toolkit)
**Why skip:** Game is not procedurally generated. Zones are hand-crafted. rot.js adds 100KB+ for features you won't use.

### ❌ phaser3-rex-plugins FSM plugin
**Why skip:** Simple idle behaviors don't need FSM library. Use plain JS classes with timers. Add FSM only if NPC AI becomes complex (5+ states, transitions).

### ❌ Spine or DragonBones animation
**Why skip:** Pixel art game uses sprite sheets. Skeletal animation overkill. Adds 200KB+ runtime.

### ❌ Matter.js physics engine
**Why skip:** Phaser's Arcade physics sufficient for top-down RPG. Matter.js for complex physics puzzles only.

### ❌ Webpack or Rollup
**Why skip:** Vite already configured, fast, works great. No reason to change bundler.

### ❌ phaser3-particle-editor GUI
**Why skip:** Hand-tuning particle configs faster than learning external tool. Code-based configs easier to version control.

---

## Installation Summary

### New Dependencies

**None required!** All new features use:
1. **Howler.js** — Already installed (2.2.4)
2. **Phaser 3 built-ins** — Particles, tweens, camera effects, tilemaps
3. **Optional:** easystarjs (only if you add NPC pathfinding)

### Optional Dependencies

```bash
# ONLY if you need NPC pathfinding (patrol routes, dynamic movement)
npm install easystarjs@^0.4.4
```

---

## Integration Checklist

### Audio System
- [ ] Create `src/game/systems/AudioManager.js` wrapping Howler
- [ ] Add Phaser config `audio: { noAudio: true }` in `src/game/PhaserGame.jsx`
- [ ] Initialize AudioManager in `BootScene.js`
- [ ] Add Redux slice for audio settings (volume, muted)
- [ ] Download CC0 music and SFX from OpenGameArt/itch.io
- [ ] Convert audio to OGG format (primary) + MP3 fallback
- [ ] Organize audio: `public/assets/audio/music/`, `public/assets/audio/sfx/`
- [ ] Create audio sprite sheet for UI sounds (click, hover, error)
- [ ] Add zone-specific music in `zones.js` config
- [ ] Implement fade-in/fade-out for music transitions

### Particle Effects
- [ ] Create particle textures (8x8 PNG): star, circle, sparkle
- [ ] Add particle textures to `public/assets/particles/`
- [ ] Load particles in `BootScene.js`
- [ ] Add quest marker sparkle particles to NPCs with active quests
- [ ] Add chest open burst effect in `InteractableManager.js`
- [ ] Add level-up particle fountain effect (triggered by Redux achievement)
- [ ] Add footstep dust particles when walking on sand tiles
- [ ] Add water ripple particles near oasis water tiles

### Game Feel / Juice
- [ ] Add screen shake on quiz wrong answer (camera.shake)
- [ ] Add screen flash on quiz correct answer (camera.flash)
- [ ] Add button bounce tween in React UI components
- [ ] Add float animation to interactable objects (chests, bookshelves)
- [ ] Add pulse animation to quest markers
- [ ] Add impact freeze on battle hit (physics.pause → resume)
- [ ] Add zoom effect on level-up (camera.zoomTo)
- [ ] Add rotation tween for coin collection

### NPC Idle Behaviors
- [ ] Create `NPCIdleBehavior` class in `src/game/systems/`
- [ ] Add breathing animation (subtle scaleY tween) to all NPCs
- [ ] Add random gesture timer (nod, turn, look) every 3-7 seconds
- [ ] Add quest NPC sparkle particles (continuous emitter)
- [ ] Add onboarding NPC glow pulse (already exists, verify it uses tweens)
- [ ] Extend NPC class with `idleBehavior` property
- [ ] Test idle behaviors don't interfere with player interaction

### Building Interiors
- [ ] Decide: layer-based (recommended) or scene-based interiors
- [ ] Extend `zones.js` schema with `interiors` array
- [ ] Add `enterInterior` / `exitInterior` methods to `MapLoader.js`
- [ ] Create interior trigger zones in Tiled or `zones.js`
- [ ] Add interior-specific ambient audio in AudioManager
- [ ] Test roof rendering above player (outside) and below player (inside)
- [ ] Add Y-sorting for dynamic depth (player, NPCs, objects)
- [ ] Create interior map data for 3-5 buildings in Oasis Village

### Audio Integration with Events
- [ ] EventBus.emit('play-sfx', { key: 'click' }) in UI components
- [ ] EventBus.emit('play-music', { zone: 'oasis_village' }) in WorldScene
- [ ] EventBus.emit('stop-music') on scene exit
- [ ] Play SFX on: NPC interact, chest open, quest complete, level up, dirham collect
- [ ] Add ambient sounds: wind in desert, water near oasis, birds in forest

---

## Technical Architecture Integration

### EventBus Audio Bridge (Phaser ↔ React)

```js
// In GameLayout.jsx (React side)
useEffect(() => {
  const handlePlaySfx = ({ key, sprite }) => {
    audioManager.playSfx(key, sprite);
  };

  EventBus.on('play-sfx', handlePlaySfx);

  return () => {
    EventBus.off('play-sfx', handlePlaySfx);
  };
}, []);

// In Phaser scene or React component
EventBus.emit('play-sfx', { key: 'ui-sounds', sprite: 'click' });
```

### Redux Audio State

```js
// In src/store/slices/settingsSlice.js (extend existing slice)
const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    // ... existing settings
    audio: {
      musicVolume: 0.5,
      sfxVolume: 0.7,
      musicMuted: false,
      sfxMuted: false,
      currentMusic: null, // Track for music transitions
    }
  },
  reducers: {
    setMusicVolume(state, action) {
      state.audio.musicVolume = action.payload;
      // EventBus will sync to AudioManager
    },
    toggleMusicMute(state) {
      state.audio.musicMuted = !state.audio.musicMuted;
    },
    setCurrentMusic(state, action) {
      state.audio.currentMusic = action.payload;
    }
  }
});
```

### Zone Music Mapping

```js
// In zones.js
const oasis_village = {
  // ... existing properties
  music: {
    background: 'oasis-theme',
    combat: 'battle-drums',
    ambient: 'desert-wind',
  },
};

// In WorldScene.loadZone()
loadZone(zoneName, entryX, entryY) {
  // ... existing code

  const zone = ZONES[zoneName];
  EventBus.emit('play-music', { key: zone.music.background });
  EventBus.emit('play-ambient', { key: zone.music.ambient });
}
```

---

## Performance Considerations

### Particle Budget
- Max 3 continuous emitters active simultaneously
- Use object pooling (Phaser handles this automatically)
- Limit particle lifespan to < 2 seconds for most effects
- Use low-res particle textures (8x8 or 16x16)

### Audio Loading
- Preload zone music in BootScene (main menu theme only)
- Lazy-load zone-specific music on zone transition
- Use audio sprites for UI sounds (one file, many sounds)
- OGG format reduces file size by 50-70% vs MP3

### Depth Sorting
- Only sort entities that need it (player, NPCs, Y-sorted objects)
- Skip sorting for static objects (rocks, trees with fixed depth)
- Sort once per frame in WorldScene.update(), not per entity

### Interior Performance
- Layer-based interiors: no performance cost (just toggle visibility)
- Scene-based interiors: ~50ms load time (acceptable for occasional transitions)

---

## Confidence Assessment

| Area | Confidence | Reasoning |
|------|------------|-----------|
| Audio (Howler) | HIGH | Already installed, community-proven, official docs stable |
| Particles (Phaser) | HIGH | Built-in Phaser 3 feature, v3.60+ API stable, examples abundant |
| Game Feel (Tweens) | HIGH | Phaser 3 core tweens well-documented, camera effects standard |
| NPC Idle (Timers + Tweens) | HIGH | Simple pattern, no library needed, Phaser built-ins sufficient |
| Interiors (Layers) | HIGH | Standard Tiled + Phaser pattern, community tutorials available |
| Pathfinding (EasyStar) | HIGH | Verified npm package, widely used, skip if not needed |
| Overall | HIGH | All features use existing libs or Phaser built-ins, minimal risk |

---

## Sources

### Web Search Sources (verified 2026-02-09)

**Audio:**
- [Web Audio Best Practices for Games in Phaser 3 - Ourcade](https://blog.ourcade.co/posts/2020/phaser-3-web-audio-best-practices-games/)
- [Audio - Phaser Help](https://docs.phaser.io/phaser/concepts/audio)
- [Audio - Notes of Phaser 3](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/audio/)
- [Howler.js official site](https://howlerjs.com/)
- [Howler.js GitHub](https://github.com/goldfire/howler.js)
- [Best audio format: mp3, wav, or ogg - HTML5 Game Devs](https://www.html5gamedevs.com/topic/7095-best-audio-format-to-use-mp3-wav-or-ogg/)
- [Comparison of audio formats for games - DEV Community](https://dev.to/tenry/comparison-of-audio-formats-for-games-jak)

**Particles:**
- [Particles - Notes of Phaser 3](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/particles/)
- [ParticleEmitter - Phaser Help](https://docs.phaser.io/api-documentation/class/gameobjects-particles-particleemitter)
- [How to Make a Particle Trail Effect in Phaser 3 - Ourcade](https://blog.ourcade.co/posts/2020/how-to-make-particle-trail-effect-phaser-3/)
- [Phaser Examples - Particle Emitter](https://phaser.io/examples/v3/category/game-objects/particle-emitter)

**Game Feel / Juice:**
- [phaser3-juice-plugin GitHub](https://github.com/RetroVX/phaser3-juice-plugin)
- [PhaserFX - Game Effects Library](https://janekovics.itch.io/phaserfx)
- [Animations and tweens - MDN](https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_breakout_game_Phaser/Animations_and_tweens)
- [Shake position - Notes of Phaser 3](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/shake-position/)
- [Camera Shake - Phaser 3 API](https://photonstorm.github.io/phaser3-docs/Phaser.Cameras.Scene2D.Effects.Shake.html)

**NPC AI / Pathfinding:**
- [Phaser 3 AI Integration Techniques - Restack](https://www.restack.io/p/ai-powered-autonomous-robotics-answer-phaser-3-ai-integration-cat-ai)
- [Mastering 2D Game Path Finding with Phaser3 - Medium](https://medium.com/@tajammalmaqbool11/mastering-2d-game-path-finding-with-phaser3-ai-path-finding-301807c74ba3)
- [A to Z guide to pathfinding with Easystar and Phaser 3 - Dynetis](https://www.dynetisgames.com/2018/03/06/pathfinding-easystar-phaser-3/)
- [EasyStar.js npm](https://www.npmjs.com/package/easystarjs)
- [FSM - Notes of Phaser 3](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/fsm/)
- [State Pattern for Character Movement in Phaser 3 - Ourcade](https://blog.ourcade.co/posts/2020/state-pattern-character-movement-phaser-3/)

**Building Interiors / Tiled:**
- [Modular Game Worlds in Phaser 3 (Tilemaps #1) - Michael Hadley](https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6)
- [Tiled Generated Map with Phaser 3 - Medium](https://medium.com/@junhongwang/tiled-generated-map-with-phaser-3-d2c16ffe75b6)
- [Phaser 3 and Tiled: Building a Platformer - Stack Abuse](https://stackabuse.com/phaser-3-and-tiled-building-a-platformer/)
- [Tile map - Notes of Phaser 3](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/tilemap/)

**Free Assets:**
- [CC0 Sound Effects - OpenGameArt.org](https://opengameart.org/content/cc0-sound-effects)
- [CC0 Music - OpenGameArt.org](https://opengameart.org/content/cc0-music)
- [CC0 Pixel Art - itch.io](https://itch.io/game-assets/free/tag-cc0/tag-pixel-art)
- [Free Music - itch.io](https://itch.io/game-assets/free/tag-music)
- [Pixabay CC0 Sound Effects](https://pixabay.com/sound-effects/search/cc0/)

### Package Versions (verified via npm 2026-02-09)
- howler: 2.2.4 (already installed)
- easystarjs: 0.4.4 (latest)
- phaser3-rex-plugins: 1.80.18 (latest, for FSM if needed)

### Verified from Codebase
- Howler.js already in package.json dependencies
- Phaser 3.90.0 confirmed
- EventBus pattern established for Phaser ↔ React communication
- Existing sprite system (Player, NPC) uses 128x128 frames
- Zones data-driven in `zones.js`, MapLoader builds maps
- NPCs already have idle animation (simple 3fps cycle)
- DOMOverlay system for NPC labels/prompts
- Redux slices for player, quests, settings (extend for audio state)

**No Context7 checks performed** — web search and official docs sufficient for v4.0 stack research.
