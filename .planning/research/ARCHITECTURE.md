# Architecture Research: Game Soul & Polish Integration

**Domain:** Phaser 3 + React 19 Game Enhancement
**Researched:** 2026-02-09
**Confidence:** HIGH

## Executive Summary

This document defines how audio, particle effects, NPC idle behaviors, building interiors, and enhanced interactables integrate with the existing Phaser 3 system/scene architecture. The game uses a **single-scene-per-zone** model with subsystem delegation. New features integrate as new systems (AudioManager, ParticleEffectManager) and enhancements to existing systems (NPCManager, MapLoader, InteractableManager).

**Key architectural decisions:**
1. **AudioManager bridges Phaser WebAudio ↔ Redux settings** via existing audioManager singleton
2. **ParticleEffectManager** as new system for environmental/interaction particles
3. **NPCManager enhancement** for idle animation behaviors (no state machine needed for simple patterns)
4. **BuildingInteriorManager** as new system for interior scene transitions
5. **InteractableManager enhancement** for animated interactive objects

All new systems follow the existing delegation pattern: WorldScene owns, creates, and updates all systems.

---

## Current Architecture (Validated from Codebase)

### System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                          React Layer                              │
│  GameLayout.jsx (209 lines) — Orchestration via 3 hooks          │
│  ├─ useEventBusListeners (380 lines) — Phaser→React events       │
│  ├─ useAudio (31 lines) — Redux→audioManager sync                │
│  └─ useSessionTracking — Session persistence                     │
├──────────────────────────────────────────────────────────────────┤
│                         EventBus Bridge                           │
│  Phaser.Events.EventEmitter — Bidirectional event passing        │
├──────────────────────────────────────────────────────────────────┤
│                       Phaser 3 Layer                              │
│  WorldScene (263 lines) — Single scene, delegates to systems     │
│  ├─ PlayerController (71 lines) — Player spawn, movement         │
│  ├─ NPCManager (128 lines) — NPC spawning, interaction           │
│  ├─ InteractableManager (169 lines) — Chests, signs, books       │
│  ├─ MapLoader (294 lines) — Tiled map, collision, exits          │
│  ├─ DOMOverlay (182 lines) — HTML overlays for Arabic text       │
│  └─ ZoneTransition (46 lines) — Zone switching with fade         │
├──────────────────────────────────────────────────────────────────┤
│                      Redux Store (12 slices)                      │
│  player, vocabulary, quests, ui, alphabet, settings, npc, sync,  │
│  achievements, battle, dailyGoals, grammar + 2 middleware         │
└──────────────────────────────────────────────────────────────────┘
```

### Existing System Responsibilities

| System | Responsibility | State Location |
|--------|----------------|----------------|
| **WorldScene** | Scene orchestrator, owns all systems, handles frame update | Phaser scene instance |
| **PlayerController** | Player sprite, movement, freeze/unfreeze, stamina | Phaser sprite, emits to EventBus |
| **NPCManager** | NPC sprites, proximity detection, interaction prompts | Phaser sprites, reads Redux (quests) |
| **InteractableManager** | Chests, signs, bookshelves interaction logic | Phaser sprites, reads Redux (player) |
| **MapLoader** | Tiled map rendering, collision, water shimmer effect | Phaser game objects |
| **DOMOverlay** | HTML overlays for Arabic text (NPC names, prompts) | DOM elements, positioned via Phaser camera |
| **ZoneTransition** | Zone switching with camera fade | Phaser camera effects |
| **audioManager** (singleton) | Howler.js wrapper with 3 channels (ambient, sfx, pronunciation) | JavaScript singleton |
| **useAudio** (hook) | Syncs Redux settings.volume → audioManager | React hook in GameLayout |
| **EventBus** | Phaser ↔ React communication | Phaser.Events.EventEmitter |

---

## Integration Architecture for New Features

### 1. Audio System Integration

**Current state:** `audioManager` singleton (300 LOC) already exists with Howler.js integration. **No new system needed.**

#### Audio Data Flow

```
User adjusts volume in Settings UI
    ↓
Redux settingsSlice.setAmbientVolume(70)
    ↓
useAudio hook reacts to Redux state change
    ↓
audioManager.setAmbientVolume(70) — converts 0-100 to 0-1
    ↓
Howler.js WebAudio API applies volume to active sounds
```

#### Integration Points

| Integration Point | Implementation | Files Modified |
|-------------------|----------------|----------------|
| **Ambient music per zone** | `WorldScene.buildZone()` calls `audioManager.playAmbient(zoneName)` | `WorldScene.js` |
| **SFX triggers from Phaser** | Emit EventBus events like `EventBus.emit('sfx-footstep')` | `Player.js`, `InteractableManager.js` |
| **Volume control in UI** | Already exists in settingsSlice + Settings component | No changes needed |
| **Audio cleanup on scene shutdown** | `WorldScene.shutdown()` calls `audioManager.stopAmbient()` | `WorldScene.js` |

#### Audio Implementation Pattern

**Existing pattern (DO NOT CHANGE):**
```javascript
// React component dispatches volume change
dispatch(setAmbientVolume(70));

// useAudio hook syncs to audioManager
useEffect(() => {
  audioManager.setAmbientVolume(settings.ambientVolume);
}, [settings.ambientVolume]);

// Phaser emits SFX events
EventBus.emit('sfx-footstep');

// useEventBusListeners handles in React
EventBus.on('sfx-footstep', () => playSFX('footstep'));
```

**New pattern for ambient per zone:**
```javascript
// WorldScene.buildZone() after zone loads
buildZone(zoneName, spawnX, spawnY) {
  // ... existing map/NPC/player setup

  // NEW: Start ambient for this zone
  const { audioManager } = await import('../../services/audio.js');
  audioManager.playAmbient(zoneName); // Maps to /assets/audio/ambient/ambient-{zoneName}.mp3
}
```

**Confidence:** HIGH (audioManager already integrated, only needs new call sites)

---

### 2. Particle Effects System

**New system required:** `ParticleEffectManager.js`

Phaser 3's particle emitters already use object pooling internally, so we create a manager to own and configure emitters for different effect types.

#### Particle Effect Types

| Effect | Trigger | Configuration | Lifecycle |
|--------|---------|---------------|-----------|
| **Footstep dust** | Player walks | Burst of 3-5 particles, 200ms lifespan, sand color | Already implemented in Player.js |
| **Water splash** | Walk on water edge | Burst of 5-10 blue particles, radial emission | New |
| **Chest sparkle** | Chest opens | Continuous sparkle for 1s, gold particles | New |
| **NPC greeting** | NPC interaction | Heart/star particles above NPC head | New |
| **Ambient effects** | Zone-specific (fireflies, snow, leaves) | Continuous emission, zone-wide | New |

#### ParticleEffectManager Architecture

```javascript
// src/game/systems/ParticleEffectManager.js
export class ParticleEffectManager {
  constructor(scene) {
    this.scene = scene;
    this.emitters = new Map(); // id -> emitter instance
    this.textures = new Map(); // type -> texture key
  }

  create() {
    // Create reusable particle textures (8x8 circles/stars)
    this._createParticleTextures();
  }

  // Create a one-shot particle burst at position
  emitBurst(effectType, x, y, config = {}) {
    const emitter = this.scene.add.particles(x, y, this.textures.get(effectType), {
      speed: config.speed || { min: 20, max: 40 },
      lifespan: config.lifespan || 300,
      quantity: config.quantity || 5,
      scale: config.scale || { start: 0.3, end: 0 },
      blendMode: config.blendMode || 'ADD',
    });

    // Auto-destroy after emission completes
    this.scene.time.delayedCall(config.lifespan || 300, () => {
      emitter.destroy();
    });
  }

  // Create a continuous emitter (for ambient effects)
  createContinuous(id, x, y, effectType, config = {}) {
    const emitter = this.scene.add.particles(x, y, this.textures.get(effectType), {
      ...config,
      frequency: config.frequency || 200,
      lifespan: config.lifespan || 2000,
    });
    this.emitters.set(id, emitter);
    return emitter;
  }

  updatePosition(id, x, y) {
    const emitter = this.emitters.get(id);
    if (emitter) emitter.setPosition(x, y);
  }

  destroy() {
    for (const [, emitter] of this.emitters) {
      emitter.destroy();
    }
    this.emitters.clear();
  }
}
```

#### Integration with WorldScene

```javascript
// WorldScene.create()
this.particleEffects = new ParticleEffectManager(this);
this.particleEffects.create();

// Example usage in InteractableManager.handleInteractable()
if (obj.type === 'chest' && !alreadyOpened) {
  // Emit chest sparkle effect
  this.scene.particleEffects.emitBurst('sparkle', obj.worldX, obj.worldY - 30, {
    quantity: 15,
    lifespan: 1000,
    scale: { start: 0.4, end: 0 },
  });
}
```

**Memory management:** Phaser's particle system already pools particles internally. ParticleEffectManager only needs to destroy emitters when done.

**Performance:** Limit max particles per emitter (10-20 for bursts, 50-100 for continuous). Use `blendMode: 'ADD'` sparingly (GPU-intensive).

**Confidence:** HIGH (Phaser 3 particle API well-documented, pattern from web search)

**Sources:**
- [Particles - Notes of Phaser 3](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/particles/)
- [ParticleEmitter | Phaser Help](https://docs.phaser.io/api-documentation/class/gameobjects-particles-particleemitter)
- [Game Optimization with Object Pools in Phaser 3](https://blog.ourcade.co/posts/2020/phaser-3-optimization-object-pool-basic/)

---

### 3. NPC Idle Behaviors

**System enhancement:** Extend `NPCManager.js` to support behavior patterns.

Current NPC implementation (128 LOC) uses simple idle animation (slow cycle through down-facing frames). For v4.0, add richer behaviors: wandering, looking around, emoting.

#### Behavior Types

| Behavior | Description | Implementation |
|----------|-------------|----------------|
| **Idle (current)** | Slow animation cycle (3fps) | Already implemented |
| **Wander** | Random walk in 2-tile radius every 5-10s | New: tween-based position change |
| **Look Around** | Face different directions every 3-5s | New: change animation direction |
| **Emote** | Show emoji above head (?, !, heart) | New: temporary sprite above NPC |
| **Activity** | Zone-specific (sweep, read, hammer) | New: special animation frames |

#### State Machine vs. Simple Timer Pattern

**State machine (Finite State Machine):** Overkill for NPC idle behaviors. Useful for complex AI (enemy combat, patrol routes), but adds 100+ LOC for minimal gain here.

**Simple timer pattern (RECOMMENDED):** Use Phaser's `time.addEvent()` for behavior changes.

```javascript
// In NPC.constructor() or NPCManager.create()
this.behaviorTimer = scene.time.addEvent({
  delay: Phaser.Math.Between(3000, 7000), // Random interval
  callback: this._performIdleBehavior,
  callbackScope: this,
  loop: true,
});

_performIdleBehavior() {
  const behaviors = ['look', 'emote', 'wander'];
  const choice = Phaser.Utils.Array.GetRandom(behaviors);

  if (choice === 'look') {
    const directions = ['down', 'left', 'right', 'up'];
    const dir = Phaser.Utils.Array.GetRandom(directions);
    this.anims.play(`${this.npcId}-idle-${dir}`);
  } else if (choice === 'wander') {
    // Small movement within bounds (only if not during player interaction)
    if (!this.isInteracting) {
      const offsetX = Phaser.Math.Between(-64, 64);
      const offsetY = Phaser.Math.Between(-64, 64);
      this.scene.tweens.add({
        targets: this,
        x: this.spawnX + offsetX,
        y: this.spawnY + offsetY,
        duration: 2000,
        ease: 'Sine.easeInOut',
        yoyo: true,
      });
    }
  }
}
```

**Confidence:** HIGH (Timer-based behavior pattern simpler than state machines, recommended for simple idle behaviors)

**Sources:**
- [State Pattern for Character Movement in Phaser 3](https://blog.ourcade.co/posts/2020/state-pattern-character-movement-phaser-3/)
- [How To Use State Machines To Control Behavior And Animations In Phaser](https://gamedevacademy.org/how-to-use-state-machines-to-control-behavior-and-animations-in-phaser/)

---

### 4. Building Interior System

**New system required:** `BuildingInteriorManager.js`

Buildings are **separate Phaser scenes**, NOT just different map layers. This approach:
- Keeps memory low (only one zone + one interior loaded at a time)
- Allows different ambient audio per interior
- Supports interior-specific NPCs/interactables without zone data bloat

#### Interior Scene Pattern

```javascript
// src/game/scenes/InteriorScene.js
export class InteriorScene extends Phaser.Scene {
  constructor() {
    super('InteriorScene');
    this.buildingId = null; // Set by transition
    this.exitData = null;   // Where to return when exiting
  }

  init(data) {
    this.buildingId = data.buildingId;
    this.exitData = data.exitData; // { zoneName, exitX, exitY }
  }

  create() {
    // Load interior-specific map, NPCs, objects
    const interiorConfig = BUILDING_INTERIORS[this.buildingId];

    // Same system delegation as WorldScene
    this.mapLoader = new MapLoader(this);
    this.npcManager = new NPCManager(this);
    this.interactableManager = new InteractableManager(this);

    // Build interior map
    const wallGroup = this.mapLoader.create(interiorConfig, interiorConfig.mapWidth, interiorConfig.mapHeight);

    // Spawn player at door entrance
    this.playerController = new PlayerController(this);
    this.playerController.create(interiorConfig.entranceX, interiorConfig.entranceY, wallGroup);

    // Interior ambient audio
    audioManager.playAmbient(interiorConfig.ambientKey || 'interior-default');

    // Exit trigger at door
    this.createExitTrigger();
  }

  createExitTrigger() {
    // Invisible zone at door position
    const exitZone = this.add.zone(this.exitX, this.exitY, 64, 64);
    this.physics.add.overlap(this.playerController.getPlayer(), exitZone, () => {
      // Return to exterior
      this.scene.stop('InteriorScene');
      this.scene.resume('WorldScene');
      EventBus.emit('exit-interior', this.exitData);
    });
  }
}
```

#### Building Entrance Integration

**Modify MapLoader to support building entrances:**

```javascript
// In MapLoader.create(), new object type: 'building'
{
  type: 'building',
  id: 'house-1',
  x: 15,
  y: 10,
  spriteKey: 'house-exterior',
  interiorSceneKey: 'InteriorScene',
  buildingId: 'village-house-1',
}

// InteractableManager handles building interaction
if (obj.type === 'building') {
  EventBus.emit('enter-building', {
    buildingId: obj.buildingId,
    exitData: { zoneName: this.currentZone, exitX: player.x, exitY: player.y }
  });
  EventBus.emit('freeze-player');
}
```

**useEventBusListeners handles scene transition:**

```javascript
const handleEnterBuilding = ({ buildingId, exitData }) => {
  playSFX('door');
  const game = phaserRef.current?.game;
  if (game) {
    const worldScene = game.scene.getScene('WorldScene');
    worldScene.scene.pause('WorldScene'); // Pause but don't destroy
    worldScene.scene.launch('InteriorScene', { buildingId, exitData });
  }
};

EventBus.on('enter-building', handleEnterBuilding);
```

**Pros:**
- Clean separation (interiors don't bloat zone data)
- Different ambient per interior
- Easy to add unique NPCs/quests inside buildings

**Cons:**
- Slight load time when entering (mitigated by small interior maps)

**Confidence:** HIGH (Scene transitions are standard Phaser pattern, documented in web search)

**Sources:**
- [Scene Transition with Fade Out in Phaser 3](https://blog.ourcade.co/posts/2020/phaser-3-fade-out-scene-transition/)
- [Create Scenes And Scene Transitions At Phaser3 Library](https://steemit.com/utopian-io/@onepice/create-scenes-and-scene-transitions-at-phaser3-library)

---

### 5. Enhanced Interactables

**System enhancement:** Extend `InteractableManager.js` with animated objects.

Current implementation (169 LOC) supports static objects (chests, signs, bookshelves). For v4.0, add:
- Animated sprites (spinning coins, glowing crystals, bubbling potions)
- Interactive animations (door opening, lever pulling)
- State-based visuals (already done for chests via tint)

#### Enhanced Interactable Types

| Type | Current State | New Behavior |
|------|---------------|--------------|
| **Chest** | Static sprite, tint when opened | Add particle burst on open |
| **Door** | N/A | Animated sprite (closed → opening → open) |
| **Lever** | N/A | Two-frame animation (up ↔ down) |
| **Crystal** | N/A | Continuous glow animation (tween alpha) |
| **Fountain** | N/A | Water particle emitter |

#### Implementation Pattern

```javascript
// In InteractableManager.create()
if (cfg.type === 'door') {
  const sprite = this.scene.add.sprite(px, py, 'door-closed');

  // Create animation if not exists
  if (!this.scene.anims.exists('door-open')) {
    this.scene.anims.create({
      key: 'door-open',
      frames: this.scene.anims.generateFrameNumbers('door-sprite', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: 0, // Play once
    });
  }

  this.interactables.push({
    ...cfg,
    sprite,
    state: 'closed', // Track state for toggle
  });
}

// In handleInteractable()
if (obj.type === 'door') {
  if (obj.state === 'closed') {
    obj.sprite.anims.play('door-open');
    obj.state = 'open';
    // Trigger event (unlock area, spawn NPC, etc.)
    EventBus.emit('door-opened', { id: obj.id });
  }
}
```

**Texture Atlas for Animated Objects:**

Use Phaser's atlas loader for animated interactables:

```javascript
// In BootScene.preload()
this.load.atlas('interactables', 'assets/sprites/interactables.png', 'assets/sprites/interactables.json');

// Access frames via generateFrameNames
this.anims.create({
  key: 'door-open',
  frames: this.anims.generateFrameNames('interactables', { prefix: 'door-', start: 1, end: 4, suffix: '.png' }),
  frameRate: 8,
});
```

**Confidence:** MEDIUM (Texture atlas pattern well-documented, but specific frame configurations may need tuning)

**Sources:**
- [Working with Texture Atlases in Phaser 3](https://airum82.medium.com/working-with-texture-atlases-in-phaser-3-25c4df9a747a)
- [Animate a Compressed Sprite Atlas in a Phaser Game](https://www.thepolyglotdeveloper.com/2020/08/animate-compressed-sprite-atlas-phaser-game/)

---

## System Dependencies & Build Order

### Dependency Graph

```
ParticleEffectManager (no dependencies) ────┐
                                             ├─→ WorldScene.create()
AudioManager (no dependencies) ─────────────┤
                                             │
NPCManager (reads Redux) ───────────────────┤
                                             │
InteractableManager (reads Redux) ──────────┤
    ↓ (emits particles)                      │
ParticleEffectManager.emitBurst() ──────────┘

BuildingInteriorManager ─→ InteriorScene (NEW SCENE)
    ↓ (delegates to)
    PlayerController, NPCManager, InteractableManager, MapLoader
```

### Recommended Build Order

| Phase | Feature | Reason |
|-------|---------|--------|
| **1** | AudioManager integration (ambient per zone) | No dependencies, improves immersion immediately |
| **2** | ParticleEffectManager (basic bursts) | Simple system, visual feedback for interactions |
| **3** | Enhanced InteractableManager (animated objects) | Builds on ParticleEffectManager for chest sparkles |
| **4** | NPC idle behaviors | Standalone enhancement, no dependencies |
| **5** | Building interiors (InteriorScene) | Most complex, requires new scene + data files |

---

## Files to Create vs. Modify

### New Files

| File | Purpose | LOC Estimate |
|------|---------|--------------|
| `src/game/systems/ParticleEffectManager.js` | Particle emitter manager | ~150 |
| `src/game/scenes/InteriorScene.js` | Building interior scene | ~200 |
| `src/data/buildingInteriors.js` | Interior map/NPC/object configs | ~500 (data) |
| `src/game/systems/__tests__/ParticleEffectManager.test.js` | Unit tests | ~80 |

### Files to Modify

| File | Modifications | LOC Change |
|------|---------------|------------|
| `src/game/scenes/WorldScene.js` | Add ParticleEffectManager instantiation, ambient audio calls | +20 |
| `src/game/systems/NPCManager.js` | Add idle behavior timers | +40 |
| `src/game/systems/InteractableManager.js` | Add animated object support, particle emission | +60 |
| `src/game/systems/MapLoader.js` | Add building entrance object type | +30 |
| `src/hooks/useEventBusListeners.js` | Add `enter-building`, `exit-interior` handlers | +25 |
| `src/game/sprites/NPC.js` | Add behavior methods (look, wander, emote) | +50 |

**Total new code:** ~1,135 LOC
**Modified code:** ~225 LOC

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Global Particle Emitter Reuse

**What people do:** Create one emitter, reposition it for every effect
**Why it's wrong:** Emitters have configuration (color, speed, lifespan). Reusing requires reconfiguring every time, error-prone.
**Do this instead:** Create effect-specific emitters, destroy after use (Phaser pools particles internally).

### Anti-Pattern 2: State Machines for Simple NPC Behaviors

**What people do:** Implement FSM with states, transitions, guards for idle animations
**Why it's wrong:** 100+ LOC for behavior that's just "change animation every 5 seconds"
**Do this instead:** Use `scene.time.addEvent()` with random intervals. FSMs are for complex AI (combat, pathfinding).

### Anti-Pattern 3: Polling for Audio Volume Changes

**What people do:** `update()` loop reads Redux state every frame, applies to audioManager
**Why it's wrong:** Unnecessary computation 60 times per second
**Do this instead:** Use React's `useEffect` to sync Redux → audioManager only when volume changes (already implemented correctly in useAudio hook).

### Anti-Pattern 4: Loading All Interior Scenes at Startup

**What people do:** Preload all building interiors in BootScene
**Why it's wrong:** Long initial load, high memory usage for content player may never see
**Do this instead:** Lazy-load interiors on first entry using `scene.launch()` (Phaser handles caching).

### Anti-Pattern 5: Destroying Particle Emitters in update()

**What people do:** Check `emitter.emitting` in `update()`, call `destroy()` when false
**Why it's wrong:** Runs check 60 times per second for one-off events
**Do this instead:** Use `scene.time.delayedCall(lifespan, () => emitter.destroy())` when creating emitter.

---

## Performance Considerations

### Memory

| System | Memory Impact | Mitigation |
|--------|---------------|------------|
| **Particle emitters** | ~1KB per active emitter | Destroy one-shot emitters after completion |
| **Interior scenes** | ~500KB per scene | Lazy-load, unload when exiting |
| **Texture atlases** | ~2MB for full sprite set | Use atlas compression (see STACK.md) |
| **Audio** | ~1MB per ambient track | Howler.js streams, only 1 ambient active at a time |

### Frame Budget (60fps = 16.67ms per frame)

| System | Update Cost | Notes |
|--------|-------------|-------|
| **NPCManager.update()** | ~0.5ms (140 NPCs) | Proximity checks use squared distance (no sqrt) |
| **ParticleEffectManager** | ~0.1ms | Phaser handles particle updates natively |
| **DOMOverlay.update()** | ~0.2ms | Only updates when camera moves (dirty flag) |
| **Audio (ambient)** | 0ms | Howler.js runs in WebAudio thread |

**Current total:** ~5ms/frame for game systems (leaves 11ms for rendering)
**With new systems:** Estimate +1ms (ParticleEffectManager + NPC behaviors)

**Optimization:** If FPS drops below 55, reduce:
1. Max particles per emitter (50 → 30)
2. NPC idle behavior frequency (5s → 10s intervals)
3. Particle alpha blend (use NORMAL instead of ADD)

---

## Integration Testing Strategy

### Unit Tests (New)

| System | Test Focus | Tools |
|--------|------------|-------|
| **ParticleEffectManager** | Emitter creation, position updates, cleanup | Vitest + Phaser mocks |
| **InteriorScene** | Scene initialization, player spawn, exit triggers | Vitest + Phaser mocks |

### Integration Tests (Existing + Enhanced)

| System | Test Focus | Tools |
|--------|------------|-------|
| **useEventBusListeners** | `enter-building`, `exit-interior` handlers | Vitest + renderWithProviders |
| **WorldScene** | Ambient audio starts on zone load | Phaser scene test (manual) |

### E2E Tests (New)

| Flow | Steps | Tools |
|------|-------|-------|
| **Building entry** | Walk to door → interact → see interior → exit | Playwright |
| **Particle effects** | Open chest → see sparkles | Playwright (visual regression) |

---

## Confidence Assessment

| Area | Confidence | Reasoning |
|------|------------|-----------|
| **Audio integration** | HIGH | audioManager already exists, only needs new call sites |
| **Particle system** | HIGH | Phaser 3 particle API well-documented, pattern validated by existing Player.js dust particles |
| **NPC behaviors** | HIGH | Timer-based pattern simpler than state machines, recommended for simple AI |
| **Building interiors** | HIGH | Scene transition pattern standard in Phaser 3, multiple tutorials confirm approach |
| **Enhanced interactables** | MEDIUM | Texture atlas animation pattern documented, but specific frame configs may need tuning |
| **Performance estimates** | MEDIUM | Based on existing system costs + web search optimizations, not profiled |

---

## Sources

### Official Documentation
- [Phaser 3 Particles Documentation](https://docs.phaser.io/phaser/concepts/gameobjects/particles)
- [Phaser 3 Animations Documentation](https://docs.phaser.io/phaser/concepts/animations)
- [Phaser 3 Textures Documentation](https://docs.phaser.io/phaser/concepts/textures)

### Tutorials & Best Practices
- [Particles - Notes of Phaser 3](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/particles/)
- [Game Optimization with Object Pools in Phaser 3](https://blog.ourcade.co/posts/2020/phaser-3-optimization-object-pool-basic/)
- [How I optimized my Phaser 3 action game — in 2025](https://franzeus.medium.com/how-i-optimized-my-phaser-3-action-game-in-2025-5a648753f62b)
- [State Pattern for Character Movement in Phaser 3](https://blog.ourcade.co/posts/2020/state-pattern-character-movement-phaser-3/)
- [Scene Transition with Fade Out in Phaser 3](https://blog.ourcade.co/posts/2020/phaser-3-fade-out-scene-transition/)
- [Working with Texture Atlases in Phaser 3](https://airum82.medium.com/working-with-texture-atlases-in-phaser-3-25c4df9a747a)

### Architecture References
- [How to use Phaser with React and Redux](https://morethancodingwithdario.hashnode.dev/how-to-use-phaser-with-react-and-redux)
- [Successfully Integrating Phaser 3 into your React/Redux App (Part 1)](https://hopefourie.medium.com/successfully-integrating-phaser-3-into-your-react-redux-app-part-1-bade7feb460)

### Codebase Analysis
- Validated from existing files: `WorldScene.js`, `NPCManager.js`, `InteractableManager.js`, `MapLoader.js`, `DOMOverlay.js`, `Player.js`, `NPC.js`, `audio.js`, `useAudio.js`, `useEventBusListeners.js`, `settingsSlice.js`

---

**Architecture research for:** GoGo Arabic v4.0 Game Soul & Polish
**Researched:** 2026-02-09
**Confidence:** HIGH (validated against existing codebase, web search confirmed patterns)
