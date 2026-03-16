# Phase 33: Living World (NPC Schedules + Movement) - Research

**Researched:** 2026-03-16
**Domain:** Phaser 3 NPC movement systems, schedule-driven behavior, day/night BGM switching
**Confidence:** HIGH (all critical findings verified against live codebase)

---

## Summary

This phase transforms the game's static NPCs into living citizens by adding time-based schedules, autonomous movement patterns, player-facing interaction polish, and night-time BGM. The codebase is well-structured for this: TimeSystem already emits `TIME_PHASE_CHANGED` events, NPCManager already owns the spawn lifecycle, NPC.js already uses Phaser Arcade physics, and audioConfig.js already has the `ZONE_BGM_MAP` structure that needs a night variant.

The primary pattern — declarative schedule arrays evaluated by a pure utility — is derived from Majora's Mask and Animal Crossing, both researched in `gogo-arabic-game-patterns.md`. The Companion sprite is the best reference for NPC movement: it already uses `scene.physics.moveToObject()` and directional walk animations from the same 4×4 spritesheet layout all NPCs use. The key implementation risk is **NPC.js currently calls `setImmovable(true)`** — wander/patrol NPCs must override this, as Companion.js already demonstrates.

The night BGM task is the simplest: `useZoneEvents.js` already switches BGM on `ZONE_CHANGE` by reading `ZONE_BGM_MAP[zone]`. The extension is to read from a `ZONE_NIGHT_BGM_MAP` when a `TIME_PHASE_CHANGED` event fires with `phase === 'night'`. No new audio files exist yet (`/public/assets/audio/bgm/` directory does not exist) — the implementation must gracefully handle missing files. The existing `audioManager.playBGM()` already does this via `onloaderror` callback silently.

**Primary recommendation:** Build all 7 tasks in strict dependency order — schedule data first, then ScheduleEvaluator, then NPCManager spawn filter, then NPC movement, then facing, then TimeSystem hook, then night BGM last since it has no blockers from the other tasks.

---

## Standard Stack

### Core (no new dependencies needed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| phaser | 3.90.0 | Arcade physics movement, tweens, timers | Already installed; `scene.physics.moveToObject()` and `scene.time.addEvent()` are the correct Phaser APIs for NPC movement |
| @reduxjs/toolkit | 2.11.2 | Reading `timeSlice` state in ScheduleEvaluator | Already installed; `store.getState()` pattern already used in all game systems |
| howler | 2.2.4 | Night BGM crossfade via `audioManager.playBGM()` | Already installed; `playBGM()` already handles crossfade and missing files gracefully |

### No new npm dependencies required
All functionality is built on existing Phaser 3 Arcade physics, the existing EventBus, and existing audio infrastructure.

---

## Architecture Patterns

### Recommended File Structure
```
src/
├── data/
│   ├── npcsEnriched.js        # Add schedule arrays (task 1) — barrel module, no direct change needed
│   ├── npcs.json              # Add schedule field to NPC entries
│   └── audioConfig.js         # Add ZONE_NIGHT_BGM_MAP (task 7)
├── game/
│   ├── systems/
│   │   ├── NPCManager.js      # Filter spawns by schedule (task 3)
│   │   ├── TimeSystem.js      # Already emits TIME_PHASE_CHANGED — no change needed beyond task 6
│   │   └── ScheduleEvaluator.js  # NEW: pure utility (task 2)
│   └── sprites/
│       └── NPC.js             # Add movement patterns + face-player (tasks 4, 5)
└── hooks/
    └── useZoneEvents.js       # Add night BGM handler (task 7)
```

### Pattern 1: Declarative Schedule Array on NPC Data
**What:** Each NPC has a `schedule` array. Each entry has `startHour`, `endHour`, `zone`, `location` (tile coordinates), and `behavior` (static/wander/patrol). Only NPCs whose schedule matches the current zone AND current hour are spawned.
**When to use:** All exterior NPCs (42+ in npcs.json). Interior NPCs skip schedule filtering.

**Schema:**
```js
// In npcs.json per NPC entry
{
  "id": "scholar-yusuf",
  "schedule": [
    { "startHour": 7, "endHour": 20, "zone": "oasis_village", "location": { "x": 9, "y": 6 }, "behavior": "static" },
    { "startHour": 20, "endHour": 7, "zone": "oasis_village", "location": { "x": 9, "y": 8 }, "behavior": "wander" }
  ]
}
```

**IMPORTANT:** A missing or empty `schedule` array means the NPC spawns unconditionally (backward compatible). ScheduleEvaluator returns `null` for NPCs with no schedule.

### Pattern 2: ScheduleEvaluator Pure Utility
**What:** A stateless utility that, given an NPC, current game time (hour), current zone, and story flags, returns the active schedule entry (or `null` if none matches).
**When to use:** Called by NPCManager at spawn time and by TimeSystem on phase change.

```js
// src/game/systems/ScheduleEvaluator.js
// Source: derived from Majora's Mask schedule pattern (gogo-arabic-game-patterns.md)
export function evaluateSchedule(npc, currentHour, currentZone, storyFlags) {
  if (!npc.schedule || npc.schedule.length === 0) return null; // no schedule = always spawn

  for (const entry of npc.schedule) {
    // Zone must match
    if (entry.zone !== currentZone) continue;

    // Hour range check (handles wrap-around midnight: e.g. 20-7)
    const inRange = entry.startHour <= entry.endHour
      ? currentHour >= entry.startHour && currentHour < entry.endHour
      : currentHour >= entry.startHour || currentHour < entry.endHour;

    if (!inRange) continue;

    // Optional story flag gate
    if (entry.requireFlag) {
      const flagValue = storyFlags?.[entry.requireFlag];
      if (!flagValue) continue;
    }

    return entry; // First matching entry wins
  }

  return null; // No active schedule for this zone/time
}

/**
 * Returns true if the NPC should spawn in the given zone at the given hour.
 * NPCs without a schedule always return true.
 */
export function shouldSpawnNpc(npc, currentHour, currentZone, storyFlags) {
  if (!npc.schedule || npc.schedule.length === 0) return true;
  return evaluateSchedule(npc, currentHour, currentZone, storyFlags) !== null;
}
```

### Pattern 3: NPCManager Spawn Filtering
**What:** Modify `NPCManager.create()` to call `shouldSpawnNpc()` before spawning each NPC. The zone's `npcConfigs` come from `zones.js`, but the full NPC data (including schedules) is in `npcsEnriched.js`. NPCManager needs to look up the full NPC data to check schedules.

**Key lookup:** `npcsEnriched.js` exports a default array. Build a Map for O(1) lookup at `create()` time.

```js
// In NPCManager.js
import npcsEnriched from '../../data/npcsEnriched.js';
import { shouldSpawnNpc } from './ScheduleEvaluator.js';
import { store } from '../../store/store.js';
import { selectGameTime } from '../../store/slices/timeSlice.js';

// Build lookup Map once at module level for O(1) access
const NPC_DATA_MAP = new Map(npcsEnriched.map(n => [n.id, n]));

// In create():
const { hour } = selectGameTime(store.getState());
const flags = store.getState().narrative.storyFlags;
const currentZone = this.scene.currentZone;

npcConfigs.forEach((cfg) => {
  const fullNpcData = NPC_DATA_MAP.get(cfg.id);
  if (fullNpcData && !shouldSpawnNpc(fullNpcData, hour, currentZone, flags)) {
    return; // Skip this NPC
  }
  // ... existing spawn logic
});
```

### Pattern 4: NPC Movement Patterns
**What:** NPCs can have one of four movement behaviors: `static` (current default), `wander`, `patrol`, `scripted`. The active schedule entry's `behavior` field drives which movement mode runs.

**Reference implementation:** `Companion.js` already uses `scene.physics.moveToObject()` and directional walk animations — copy this pattern exactly. NPC.js must call `setImmovable(false)` for moving NPCs.

**Walk animation frames:** The 4×4 spritesheet layout used by all sprites is:
- Row 0 (frames 0-3): Walk down
- Row 1 (frames 4-7): Walk left
- Row 2 (frames 8-11): Walk right
- Row 3 (frames 12-15): Walk up

These animation keys are created for companions in `Companion.js`. NPCs need the same keys created conditionally when they have a non-static behavior.

**Wander implementation (Phaser timer-based):**
```js
// In NPC.js — startWander(bounds)
_startWander(bounds) {
  this.setImmovable(false);
  this._wanderTimer = this.scene.time.addEvent({
    delay: 2000 + Math.random() * 3000,
    loop: true,
    callback: () => {
      if (!this.active) return;
      // Pick random point within wanderRadius of spawn position
      const angle = Math.random() * Math.PI * 2;
      const radius = 32 + Math.random() * (this._wanderRadius || 64);
      const tx = this._spawnX + Math.cos(angle) * radius;
      const ty = this._spawnY + Math.sin(angle) * radius;
      this.scene.physics.moveToObject(
        this, { x: tx, y: ty }, 40
      );
      this._playDirectionalWalkAnim();
      // Stop after reaching target (checked in update)
      this._wanderTarget = { x: tx, y: ty };
    }
  });
}
```

**Patrol implementation:**
```js
// patrol config: { path: ['right','right','stand','down'], durations: [2000,2000,1500,2000], loop: true }
// In NPC.js — _stepPatrol()
_advancePatrol() {
  const step = this._patrolPath[this._patrolIndex];
  const dur = this._patrolDurations[this._patrolIndex];
  const speed = 40;

  const dirMap = {
    right: { vx: speed, vy: 0 },
    left: { vx: -speed, vy: 0 },
    up: { vx: 0, vy: -speed },
    down: { vx: 0, vy: speed },
    stand: { vx: 0, vy: 0 },
  };

  const { vx, vy } = dirMap[step] || { vx: 0, vy: 0 };
  this.setVelocity(vx, vy);
  if (step !== 'stand') this._playDirectionalWalkAnim();
  else this._playIdleAnim();

  this._patrolTimer = this.scene.time.delayedCall(dur, () => {
    this._patrolIndex = (this._patrolIndex + 1) % this._patrolPath.length;
    this._advancePatrol();
  });
}
```

### Pattern 5: NPC Faces Player on Interact
**What:** When `NPC_INTERACT` fires, the NPC flips horizontally if the player is to the NPC's right (or uses directional frame if 4-directional). Since current NPC sprites only have down-facing idle frames (not 4-directional), `setFlipX` is the correct approach.

```js
// In NPCManager.update() — when interaction detected:
if (inRange && Phaser.Input.Keyboard.JustDown(interactKey) && !interactCooldown) {
  // Face player: flip X axis based on relative position
  npc.setFlipX(playerSprite.x > npc.x);
  // ... existing interact logic
}
```

### Pattern 6: TimeSystem Triggers Schedule Re-evaluation
**What:** When `TIME_PHASE_CHANGED` fires, NPCManager should re-evaluate all currently spawned NPCs' schedules. NPCs whose schedule no longer matches should move to their new schedule location (not despawn/respawn — that would be jarring).

**Correct approach:** Listen to `TIME_PHASE_CHANGED` in NPCManager. For each NPC, call `evaluateSchedule()` with the new hour. If the result is `null` (NPC shouldn't be in this zone at this time), hide the NPC sprite and disable physics. If it has a new location, tween the NPC to the new position.

```js
// In NPCManager constructor:
EventBus.on(EVENTS.TIME_PHASE_CHANGED, this._onPhaseChanged, this);

// In NPCManager destroy():
EventBus.off(EVENTS.TIME_PHASE_CHANGED, this._onPhaseChanged, this);

// New method:
_onPhaseChanged({ phase: _phase }) {
  const { hour } = selectGameTime(store.getState());
  const flags = store.getState().narrative.storyFlags;

  this.npcs.forEach((npc) => {
    const fullData = NPC_DATA_MAP.get(npc.npcId);
    if (!fullData?.schedule?.length) return; // No schedule, always active

    const entry = evaluateSchedule(fullData, hour, this.scene.currentZone, flags);
    if (!entry) {
      // Hide NPC (moved away)
      npc.setActive(false).setVisible(false);
    } else {
      npc.setActive(true).setVisible(true);
      // Move to new schedule location
      const newX = entry.location.x * 64 + 32;
      const newY = entry.location.y * 64 + 32;
      this.scene.tweens.add({
        targets: npc,
        x: newX, y: newY,
        duration: 2000,
        ease: 'Linear',
      });
    }
  });
}
```

### Pattern 7: Night BGM in audioConfig.js + useZoneEvents.js
**What:** Add a `ZONE_NIGHT_BGM_MAP` to `audioConfig.js`. In `useZoneEvents.js`, listen to `TIME_PHASE_CHANGED` and switch BGM when `phase === 'night'` or when returning from night.

**audioConfig.js addition:**
```js
export const ZONE_NIGHT_BGM_MAP = {
  oasis_village: 'oasis-night',
  ancient_library: 'library-night',
  desert_marketplace: 'marketplace-night',
  farmland: 'farmland-night',
  bedouin_camp: 'bedouin-night',
  mountain_village: 'mountain-night',
  coastal_port: 'port-night',
  royal_palace: 'palace-night',
};
```

**useZoneEvents.js addition (inside useEffect):**
```js
const handlePhaseChanged = ({ phase }) => {
  const currentZone = store.getState().player.currentZone;
  const isNight = phase === TIME_PHASES.NIGHT;
  const bgmTrack = isNight
    ? ZONE_NIGHT_BGM_MAP[currentZone]
    : ZONE_BGM_MAP[currentZone];
  if (bgmTrack) {
    audioManager.playBGM(bgmTrack); // Gracefully skips if file missing
  }
};

EventBus.on(EVENTS.TIME_PHASE_CHANGED, handlePhaseChanged);
// Add cleanup: EventBus.off(EVENTS.TIME_PHASE_CHANGED, handlePhaseChanged);
```

**IMPORTANT CONSTRAINT:** The decisions file (`gogo-arabic-decisions.md`) states "NO music at all — only real ambient environmental sounds." This means nightBgm tracks may actually be ambient tracks, not music. The `audioManager.playBGM()` API is the correct mechanism (it's just a looping audio track), but the actual track content should be night ambience (crickets, etc.), not musical BGM. Plan accordingly — the audio file naming can follow the existing convention (`bgm-oasis-night.mp3`) even if the content is ambient in nature.

### Anti-Patterns to Avoid
- **Despawning and respawning NPCs on phase change:** This causes visual pop-in. Instead, hide (`setActive(false).setVisible(false)`) and tween to new position.
- **Running wander logic in NPCManager.update() for every NPC every frame:** Use Phaser `scene.time.addEvent()` with a delay (already the pattern in NPC.js idle timer). Only update movement state periodically.
- **Creating walk animations unconditionally for all NPCs:** NPC.js already guards animation creation with `scene.anims.exists()`. Same guard must wrap any new walk animation creation.
- **Calling `setImmovable(false)` for all NPCs:** Only non-static NPCs need this. Static NPCs must remain immovable so they block player movement.
- **Looking up NPC data by iterating the full array on every spawn:** Use a `Map` keyed by `id` for O(1) lookup — there are 42+ NPCs.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Moving NPC toward a position | Custom velocity calculation | `scene.physics.moveToObject(npc, target, speed)` | Already used by Companion.js — Phaser handles angle math |
| Periodic wander tick | Manual `update()` accumulator | `scene.time.addEvent({ delay, loop, callback })` | Already used by NPC.js idle timer — proven pattern in this codebase |
| Delayed patrol step | setTimeout | `scene.time.delayedCall(dur, cb)` | Phaser-aware, gets cleaned up with scene, respects scene pause |
| Sprite flip direction | Manual frame calculation | `npc.setFlipX(bool)` | Phaser built-in — one call |
| BGM crossfade | Write crossfade logic | `audioManager.playBGM(trackName)` | Already implemented in `audio.js` lines 194-236 with 800ms crossfade |
| Checking if NPC is in correct zone | Zone lookup + conditional logic | `shouldSpawnNpc(npc, hour, zone, flags)` — the ScheduleEvaluator pure fn | Testable, pure, reusable |

**Key insight:** Every movement primitive this phase needs already exists in `Companion.js` and `NPC.js`. The task is wiring them together, not inventing new systems.

---

## Common Pitfalls

### Pitfall 1: setImmovable(true) Blocks Movement Physics
**What goes wrong:** NPC.js calls `this.setImmovable(true)` in the constructor. Calling `setVelocity()` or `moveToObject()` on an immovable body has no effect — the NPC won't move.
**Why it happens:** Static NPCs must be immovable to block player; but moving NPCs can't be.
**How to avoid:** When starting a wander/patrol behavior, call `this.setImmovable(false)` first. When stopping movement, restore `this.setImmovable(true)` if you want blocking behavior again.
**Warning signs:** `moveToObject()` is called but NPC stays at origin with zero velocity.

### Pitfall 2: Walk Animations Not Registered for NPC Sprites
**What goes wrong:** NPC sprites use idle-only animations (2-frame idle, 2-frame blink). Walk animations (`npc-id-walk-down` etc.) are not created in the constructor. Calling `this.anims.play('scholar-yusuf-walk-left')` silently fails.
**Why it happens:** `Companion.js` creates walk animations because companions move; `NPC.js` only creates idle animations.
**How to avoid:** In `NPC.js`, conditionally create walk animations when `hasEnoughFrames` is true AND the NPC has a non-static behavior. Guard with `scene.anims.exists()` check (already the pattern).
**Warning signs:** NPC moves (position changes) but shows static frame with no animation.

### Pitfall 3: Phase Change Fires on Initial Load with lastPhase = null
**What goes wrong:** `TimeSystem.js` initializes `this.lastPhase = null`. On the first tick, any phase counts as a change and fires `TIME_PHASE_CHANGED`. If NPCManager listens to this event, it fires before NPCs are fully spawned.
**Why it happens:** `TimeSystem.update()` compares `currentPhase !== this.lastPhase` — null !== 'dawn' is true.
**How to avoid:** In `NPCManager._onPhaseChanged()`, guard with `if (!this.npcs.length) return;`. Or check if NPCManager has been initialized before acting on the event.
**Warning signs:** Console errors about undefined NPC data on startup.

### Pitfall 4: DOM Overlay Labels Don't Follow Moving NPCs
**What goes wrong:** NPC name labels, quest markers, and interaction prompts are DOM overlay elements whose positions are updated in `NPCManager.update()` via `domOverlay.updatePosition()`. If NPCs move via physics/tweens, the DOM overlay positions lag or appear at wrong positions.
**Why it happens:** `setInteractionHint()` and `domOverlay.updatePosition()` use the NPC's current `x, y` — which is correct for moving NPCs as long as they're called every frame in `update()`.
**How to avoid:** The existing `NPCManager.update()` already calls `domOverlay.updatePosition()` for every NPC every frame. This continues to work for moving NPCs. No change needed.
**Warning signs:** NPC name label stays at spawn position while NPC wanders.

### Pitfall 5: NPC Wander Collides Off-Map or Into Walls
**What goes wrong:** Random wander target coordinates fall outside map bounds or inside wall collision groups. NPC gets stuck against a wall with velocity fighting the physics collider.
**Why it happens:** Random coordinate calculation doesn't respect map bounds or wall positions.
**How to avoid:** Clamp wander targets to map bounds using `this.scene.currentMapW` and `this.scene.currentMapH` (both available on the scene). Keep wander radius small (2-3 tiles = 128-192px) to stay near spawn. For patrol paths, use fixed tile coordinates from the schedule data — the designer controls the path.
**Warning signs:** NPCs pile up at map edges or oscillate against walls.

### Pitfall 6: Night BGM Switching Re-triggers on Every TIME_TICK
**What goes wrong:** If night BGM logic is added to the `TIME_TICK` handler (fires every game minute) instead of `TIME_PHASE_CHANGED` (fires only on phase transitions), `audioManager.playBGM()` is called every minute. It has a dedup check (`this.bgmTrack === trackName`) so it won't restart the same track, but it adds unnecessary overhead.
**Why it happens:** Developers confuse `TIME_TICK` (every minute) with `TIME_PHASE_CHANGED` (every few hours).
**How to avoid:** Listen to `TIME_PHASE_CHANGED` only — this is the correct event. Already emitted by `TimeSystem.js` line 38.

---

## Code Examples

Verified against live codebase (Phaser 3.90.0):

### How TimeSystem Emits Phase Change
```js
// src/game/systems/TimeSystem.js lines 36-40
const currentPhase = selectTimePhase(store.getState());
if (currentPhase !== this.lastPhase) {
  this.lastPhase = currentPhase;
  EventBus.emit(EVENTS.TIME_PHASE_CHANGED, { phase: currentPhase });
}
```
The event payload is `{ phase: string }` where phase is one of: `'dawn'`, `'morning'`, `'noon'`, `'afternoon'`, `'sunset'`, `'night'`.

### How Companion Uses physics.moveToObject
```js
// src/game/sprites/Companion.js lines 67-70
this.scene.physics.moveToObject(this, this.followTarget, this.moveSpeed);
this._playDirectionalWalkAnim();
```
`physics.moveToObject(gameObject, destination, speed)` sets velocity toward destination at given pixels/second. Returns the angle. This is the correct API for both Companion movement and NPC wander/patrol.

### How Companion Reads Velocity for Directional Animation
```js
// src/game/sprites/Companion.js lines 94-103
_playDirectionalWalkAnim() {
  const vx = this.body.velocity.x;
  const vy = this.body.velocity.y;
  const id = this.npcId;
  if (Math.abs(vx) > Math.abs(vy)) {
    this.anims.play(vx < 0 ? `${id}-walk-left` : `${id}-walk-right`, true);
  } else {
    this.anims.play(vy < 0 ? `${id}-walk-up` : `${id}-walk-down`, true);
  }
}
```
Reuse this exact logic in NPC.js.

### How audioManager.playBGM Handles Missing Files
```js
// src/services/audio.js lines 218-227
const newBgm = new Howl({
  src: [src],
  loop: true,
  volume: 0,
  onloaderror: () => {
    // File doesn't exist for this track -- silently skip
    this.bgm = null;
    this.bgmTrack = null;
  },
});
```
Night BGM tracks that don't have audio files will silently fail — no crash, no error spam. This is the correct behavior for a feature in development.

### How BGM is Currently Switched on Zone Change
```js
// src/hooks/useZoneEvents.js lines 29-37
const handleZoneChange = ({ zone }) => {
  dispatch(setCurrentZone(zone));
  const bgmTrack = ZONE_BGM_MAP[zone];
  if (bgmTrack) {
    audioManager.playBGM(bgmTrack);
  }
  // ...
};
```
Night BGM logic follows the same pattern with `ZONE_NIGHT_BGM_MAP` and a `TIME_PHASE_CHANGED` listener added alongside this handler.

### How NPC.js Idle Timer Uses scene.time.addEvent
```js
// src/game/sprites/NPC.js lines 55-66
this.idleTimer = scene.time.addEvent({
  delay: 2000 + Math.random() * 2000,
  loop: true,
  callback: () => {
    if (!this.active) return;
    const anim = Math.random() < 0.5 ? idleKey : blinkKey;
    if (scene.anims.exists(anim)) {
      this.anims.play(anim);
    }
  },
});
```
Wander timer should follow this exact structure.

### How selectGameTime Gives Current Hour
```js
// src/store/slices/timeSlice.js lines 54-59
export const selectGameTime = (state) => {
  const minutesToday = state.time.totalGameMinutes % MINUTES_PER_DAY;
  const hour = Math.floor(minutesToday / 60);
  const minute = Math.floor(minutesToday % 60);
  return { hour, minute };
};
```
Use `selectGameTime(store.getState()).hour` in ScheduleEvaluator and NPCManager.

---

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|------------------|-------|
| All NPCs spawn unconditionally | NPCManager filters by schedule | Phase 33 introduces this |
| NPCs are fully static | NPCs wander/patrol | Phase 33 introduces this |
| Single BGM per zone (day only) | Day BGM + Night BGM | Phase 33 introduces this |
| NPCs always face forward | NPCs face player on interact | Phase 33 introduces this |

**Decision file note:** `gogo-arabic-decisions.md` specifies "NO music at all — only real ambient environmental sounds." The `nightBgm` feature should therefore use ambient sound files (crickets, wind) rather than musical tracks. The `playBGM()` API handles this fine — the channel label "BGM" is a misnomer here. The feature is correct; just ensure the audio assets are environmental ambience, not music.

---

## Open Questions

1. **Do night BGM audio files exist?**
   - What we know: `/public/assets/audio/bgm/` directory does not exist. `/public/assets/audio/ambient/` directory exists but was empty when checked.
   - What's unclear: Whether the user plans to supply night ambience tracks or stub them.
   - Recommendation: Implement the feature with `onloaderror` graceful fallback already present. Add placeholder track names. Flag in PLAN tasks that audio files need to be provided separately.

2. **Should NPCs despawn from zones they're not scheduled for, or just hide?**
   - What we know: The phase description says "filter spawns" — suggesting not spawning at all. But runtime re-evaluation on phase change suggests hiding is better for UX.
   - What's unclear: Whether the performance difference matters at 42 NPCs.
   - Recommendation: Not spawning is cleaner. On phase change, hide (`setVisible(false).setActive(false)`) rather than destroy+recreate to avoid GameObject teardown cost. At 42 NPCs, either approach is fine.

3. **Which NPCs should receive schedules in npcs.json?**
   - What we know: 42+ NPCs exist. The v7 plan says to add schedules.
   - What's unclear: Whether ALL NPCs need schedules or just key ones.
   - Recommendation: Add schedules to the 4 oasis_village NPCs as the full proof-of-concept (guide-amira, scholar-yusuf, merchant-fatima, student-khalid). Leave all other NPCs without schedules (backward-compatible: no schedule = always spawn). Document the pattern for future expansion.

4. **Should `wander` NPCs get walk animations from 4-direction spritesheets?**
   - What we know: NPCs use the same 4×4 spritesheet layout as Player and Companion. Frame layout is documented. Current NPC.js only creates 2-frame idle animations.
   - What's unclear: Whether NPC spritesheets actually have 16 frames or only the first few.
   - Recommendation: Guard walk animation creation with `frameCount >= 16` check (same as existing `hasEnoughFrames` guard for idle). Fall back to `setFrame(0)` + `setFlipX()` if texture doesn't have enough frames.

---

## Sources

### Primary (HIGH confidence)
- Live codebase read: `src/game/sprites/NPC.js` — confirmed setImmovable(true), idle timer pattern, frame layout
- Live codebase read: `src/game/sprites/Companion.js` — confirmed moveToObject pattern, directional walk anims
- Live codebase read: `src/game/systems/NPCManager.js` — confirmed spawn lifecycle, update loop structure
- Live codebase read: `src/game/systems/TimeSystem.js` — confirmed TIME_PHASE_CHANGED emission, lastPhase tracking
- Live codebase read: `src/game/systems/DayNightCycle.js` — confirmed EventBus.on(EVENTS.TIME_PHASE_CHANGED) listener pattern
- Live codebase read: `src/hooks/useZoneEvents.js` — confirmed BGM switch on ZONE_CHANGE, structure for night BGM extension
- Live codebase read: `src/data/audioConfig.js` — confirmed ZONE_BGM_MAP structure
- Live codebase read: `src/services/audio.js` — confirmed playBGM crossfade + onloaderror graceful fallback
- Live codebase read: `src/store/slices/timeSlice.js` — confirmed TIME_PHASES constants, selectGameTime selector
- Live codebase read: `src/data/zones.js` — confirmed NPC spawn configs in zone data
- Live codebase read: `src/game/scenes/WorldScene.js` — confirmed system wiring, update loop, currentZone property
- Memory file: `gogo-arabic-game-patterns.md` — confirmed NPC schedule pattern from Majora's Mask/Animal Crossing research
- Memory file: `gogo-arabic-decisions.md` — confirmed "NO music, ambient only" constraint

### Secondary (MEDIUM confidence)
- Memory file: `gogo-arabic-v7-plan.md` — task list and key file assignments (32 days old, verified against current code)

### Tertiary (LOW confidence — needs validation)
- Assumption that all NPC spritesheets have 16 frames (4×4 layout). Not all NPC textures were inspected. Guard with frameCount check.
- Night BGM track names (`oasis-night`, etc.) assumed — no audio files exist to verify naming convention is consistent.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — No new deps; all APIs verified in live codebase
- Architecture: HIGH — All patterns traced to existing working code (Companion.js, DayNightCycle.js)
- Pitfalls: HIGH — setImmovable trap verified in NPC.js line 18; animation guard verified in NPC.js lines 32-48
- Night BGM: MEDIUM — Infrastructure confirmed working; audio file existence unverified

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (stable codebase, 30-day estimate)
