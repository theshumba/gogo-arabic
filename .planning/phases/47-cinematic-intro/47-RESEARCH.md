# Phase 47: Cinematic Intro - Research

**Researched:** 2026-03-19
**Domain:** Phaser 3 cinematic sequencing — in-engine text crawl, camera choreography, interactive world objects
**Confidence:** HIGH

---

## Summary

Phase 47 replaces the existing React-based `CinematicIntro` component with a fully Phaser-native sequence. The current implementation (`CinematicIntro.jsx`) renders a DOM overlay text crawl and dispatches `setTutorialPhase('path_choice')` when done — this is exactly what UX-01 forbids. The new sequence must run entirely inside WorldScene using Phaser tweens, text objects, camera operations, and the existing `DialogueBox`.

The codebase already has all the building blocks in place. `WorldScene` has `this.cameras.main`, `this.tweens`, `this.time`, and `this.dialogueBox`. The `DayNightCycle` system already demonstrates how to set dawn tint (`0xffdca8`) using `this.overlay`. The `DialogueBox` class has a fully working `show(npcName, messages, onComplete)` API that handles player freeze/unfreeze and typewriter rendering. The `PlayerController` has `freeze()` / `unfreeze()` methods. `createArabicText()` and `prepareArabicText()` handle Arabic rendering in canvas.

The integration seam is clean: WorldScene's `create()` method already suppresses the zone name toast on first load (`_suppressZoneToast`). The cinematic sequence hooks in immediately after `buildZone()` completes, checks `store.getState().player.onboardingComplete` and `tutorialPhase`, and runs the sequence only for first-time players. When done, it dispatches `setTutorialPhase('awaiting_mentor')` via `store.dispatch()` — the same Redux path the old React component used, but called from Phaser.

**Primary recommendation:** Build a `CinematicIntroSequencer` class in `src/game/systems/CinematicIntroSequencer.js` that WorldScene constructs and calls `run()` on. The sequencer orchestrates all five beats (text crawl, camera pan, word spawn, word interaction, Amira arrival) using Phaser's `this.scene.time.delayedCall()` and `this.scene.tweens.add()` chained via callbacks, then dispatches to Redux on completion.

---

## User Constraints

No CONTEXT.md exists for this phase. Constraints come from requirements and accumulated project context.

### Locked Decisions (from REQUIREMENTS.md + STATE.md)
- UX-01: Zero React DOM overlays during cinematic — everything must be Phaser-native (text, sprites, tweens, cameras)
- UX-02: Existing 6-step OnboardingFlow is bypassed by flag, NOT deleted
- Old `CinematicIntro.jsx` (React) must be bypassed via `tutorialPhase` guard, not removed
- `onboardingComplete` and `tutorialPhase` already live in `playerSlice` — extend them, no new slice
- Guide Amira dialogue trees exist from v9.0 Phase 44 — add new lines, don't rewrite existing trees
- `FloatingWordObject` must be a Phaser interactive sprite (not React DOM)
- No voice narration (no audio infrastructure for narration)
- All vocabulary is Fusha (MSA) only

### Claude's Discretion
- Exact animation durations and easing curves
- Floating word visual design (glow effect technique)
- Whether CinematicIntroSequencer is a standalone class file or a method on WorldScene
- Dawn tint implementation (reuse DayNightCycle vs. direct camera tint)
- Particle effect for first word discovery moment

### Deferred Ideas (OUT OF SCOPE for Phase 47)
- Learning path choice (PATH-01 through PATH-05) — Phase 48
- First quest flow (QUEST-01 through QUEST-05) — Phase 49
- Gradual HUD reveal — Tier 8 AAA Polish
- Diagnostic assessment — Tier 5

---

## Standard Stack

### Core (already installed — no new dependencies)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Phaser 3 | ~3.60+ | Scene management, tweens, camera, text, input | Project standard |
| Redux Toolkit | existing | `tutorialPhase` + `onboardingComplete` state | Project standard |
| `js-arabic-reshaper` | existing | Arabic text rendering in canvas | Project standard via ArabicText.js |

### Key Existing Utilities (read before building)
| File | Purpose | Used For |
|------|---------|---------|
| `src/game/ui/ArabicText.js` | `createArabicText()`, `prepareArabicText()` | Arabic text crawl line, floating word label |
| `src/game/ui/DialogueBox.js` | `show(npcName, messages, onComplete)` | Amira's arrival line (INTRO-05) |
| `src/game/systems/DayNightCycle.js` | Dawn tint values (`0xffdca8`, alpha `0.3`) | Dawn atmosphere at scene start |
| `src/game/systems/ParticleEffectManager.js` | `burst(x, y, config)` | Word discovery reward animation |
| `src/store/slices/playerSlice.js` | `setTutorialPhase`, `completeOnboarding` | Sequence completion dispatch |

### No New Packages Required
All needed Phaser APIs (cameras, tweens, text, graphics, input) and Redux actions already exist.

---

## Architecture Patterns

### Recommended Structure
```
src/game/systems/
└── CinematicIntroSequencer.js   # New: orchestrates the 5-beat sequence

src/game/objects/
└── FloatingWordObject.js        # New: glowing interactive Arabic word sprite

src/components/Onboarding/
└── CinematicIntro.jsx           # Existing: bypass via tutorialPhase guard (not deleted)
```

### How WorldScene Triggers the Sequence

In `WorldScene.create()`, after `buildZone()` and `EventBus.emit(EVENTS.SCENE_READY, this)`:

```javascript
// Source: WorldScene.js create() pattern, store.getState() pattern
import { store } from '../../store/store.js';

const playerState = store.getState().player;
if (!playerState.onboardingComplete && playerState.tutorialPhase === 'cinematic_intro') {
  this.introSequencer = new CinematicIntroSequencer(this);
  this.introSequencer.run();
}
```

The guard `tutorialPhase === 'cinematic_intro'` is the exact same field that currently controls `{tutorialPhase === 'cinematic_intro' && <CinematicIntro />}` in `GameLayout.jsx`. No new Redux fields needed.

### Pattern 1: Phaser Camera Fade-In (INTRO-02)

The standard Phaser pattern for a black-to-scene fade is `this.cameras.main.fadeIn()`. This is the correct tool for "Camera fades into Oasis Village at dawn."

```javascript
// Source: Phaser 3 Camera API — cameras.main.fadeIn(duration, red, green, blue, callback)
// Called at sequence start; world is fully loaded behind the fade
this.scene.cameras.main.fadeIn(1500, 0, 0, 0, (camera, progress) => {
  if (progress === 1) {
    this._startCrawl(); // Proceed to text crawl
  }
});
```

**Dawn tint:** `DayNightCycle` uses a screen overlay rectangle at depth 9000 with MULTIPLY blend. For the cinematic, force-set dawn tint on the DayNightCycle overlay at sequence start, then let it normalise to current game time after.

### Pattern 2: Text Crawl (INTRO-01)

Text crawl = lines appearing sequentially with fade-in per line, all anchored to `setScrollFactor(0)` (fixed to camera viewport).

```javascript
// Source: WorldScene._showZoneNameToast() pattern + DialogueBox._showCurrentMessage() pattern
const crawlLines = [
  { text: 'A young scholar discovers an ancient manuscript...', arabic: false },
  { text: 'في زمنٍ بعيد...', arabic: true },
];

// For each line, use scene.time.delayedCall to stage appearances
// setScrollFactor(0) pins text to camera regardless of world scroll
const line = this.scene.add.text(centerX, y, displayText, style);
line.setScrollFactor(0).setDepth(9800).setAlpha(0);

this.scene.tweens.add({
  targets: line,
  alpha: 1,
  duration: 600,
  ease: 'Power2',
});
```

For Arabic lines, use `prepareArabicText(rawText)` from `ArabicText.js` before calling `setText()` — this is the established project pattern used in `DialogueBox._showCurrentMessage()`.

**Crawl container depth:** Use depth 9800 (below 10000 which is DialogueBox, above 9500 which is zone toast). The DayNightCycle overlay is at 9000.

**Crawl skip:** Listen for any pointer-down or SPACE/ENTER to skip the crawl and jump to the next beat. Use `this.scene.input.once('pointerdown', skip)` or a keyboard listener pattern.

### Pattern 3: Camera Pan (INTRO-02)

After crawl, pan camera from a starting position to the player's spawn position.

```javascript
// Source: Phaser 3 Camera API — camera.pan(x, y, duration, ease, force, callback)
// camera.pan moves the camera viewport center to world position (x, y)
this.scene.cameras.main.pan(
  targetX, targetY,   // player spawn world coords
  2000,               // ms
  'Power2',
  false,
  (cam, progress) => {
    if (progress === 1) this._spawnFloatingWord();
  }
);
```

The camera is already configured by `PlayerController.setupCamera()` with world bounds. The pan starts from an offset position (e.g. above/left of spawn) and moves toward the player.

### Pattern 4: FloatingWordObject — Interactive Phaser Sprite (INTRO-03 + INTRO-04)

This is the most complex beat. Key constraints:
- Must be a Phaser interactive sprite (not React DOM) per UX-01
- Must glow
- Must detect player proximity OR direct click/SPACE interaction

**Glow technique:** Phaser 3 does not have a built-in glow post-processing filter in canvas renderer. The standard pixel art approach is a pulsing alpha tween on a slightly-larger duplicate image behind the sprite, or a `Phaser.GameObjects.Graphics` circle drawn beneath the sprite.

```javascript
// Glow via pulsing background circle (Graphics object)
const glow = this.scene.add.graphics();
glow.fillStyle(0xd4a843, 0.3);
glow.fillCircle(0, 0, 32); // radius
glow.setPosition(wordX, wordY);

this.scene.tweens.add({
  targets: glow,
  alpha: { from: 0.15, to: 0.5 },
  duration: 800,
  yoyo: true,
  repeat: -1,
});
```

**Floating bobbing animation:**
```javascript
// Vertical bob tween — float effect
this.scene.tweens.add({
  targets: wordSprite,
  y: wordSprite.y - 8,
  duration: 1200,
  ease: 'Sine.easeInOut',
  yoyo: true,
  repeat: -1,
});
```

**Interaction detection (proximity):** Use the existing `InteractableManager` proximity pattern. `INTERACT_RANGE` is 128px (2 tiles). In `WorldScene.update()`, the sequencer registers a one-shot proximity check: when player comes within range AND presses SPACE, trigger the word discovery. Alternatively, register the word as a Phaser interactive object with `setInteractive()` and listen on `pointerdown`.

**Word discovery sequence (INTRO-04):**
1. Destroy glow + word sprite
2. Fire `particleEffects.burst()` at word position (already wired in WorldScene)
3. Show "You learned: [Arabic word]!" via DialogueBox (reuses existing system)
4. Dispatch `addFsrsCard` to vocabularySlice to record the learned word
5. Call `setTutorialPhase('awaiting_mentor')` ... but WAIT — Phase 47 ends with Amira's arrival (INTRO-05), so the phase advances AFTER Amira speaks

### Pattern 5: Guide Amira Arrival (INTRO-05)

After word discovery, trigger Amira to walk toward the player or appear near them, then show one line via `DialogueBox.show()`.

```javascript
// Source: DialogueBox.js show() API
// Guide Amira NPC is already spawned by NPCManager at zone load
// The sequencer just needs to trigger dialogue on that NPC instance

this.scene.dialogueBox.show(
  'Guide Amira',
  ["Welcome, traveller. I've been waiting for you."],
  () => {
    // onComplete: transition to awaiting_mentor phase
    store.dispatch(setTutorialPhase('awaiting_mentor'));
    this.cleanup();
  }
);
```

**Getting the Amira NPC sprite:** `this.scene.npcManager` manages all NPC sprites. Add a `getNpcById(id)` method if not already present, or use `this.scene.npcManager.npcs.find(n => n.id === 'guide-amira')`.

### Pattern 6: Bypassing the Old React CinematicIntro

The old `CinematicIntro.jsx` is rendered in `GameLayout.jsx` when `tutorialPhase === 'cinematic_intro'`. The new Phaser sequence takes over this role. The bypass strategy:

**Option A (recommended):** Change `GameLayout.jsx` so `<CinematicIntro />` is never rendered. Replace the condition with a comment. The file stays on disk. The old component becomes dead code — it will be removed in a future cleanup phase.

```jsx
// Before:
{tutorialPhase === 'cinematic_intro' && <CinematicIntro />}

// After:
{/* Phase 47: CinematicIntro replaced by Phaser-native sequence in CinematicIntroSequencer.js */}
```

The Phaser sequencer checks `tutorialPhase === 'cinematic_intro'` from the Redux store directly, so the gate logic is preserved in Phaser.

### Anti-Patterns to Avoid
- **Creating a new Phaser scene for the cinematic:** Unnecessary complexity. WorldScene is already loaded with the zone behind the fade. Use it.
- **Using `scene.pause()` to show cinematic:** Freezing WorldScene breaks its systems. Use `this.frozen = true` via `PlayerController.freeze()` instead.
- **DOM text overlay for the crawl:** Explicitly violates UX-01.
- **Calling `setTutorialPhase('path_choice')` from the sequencer:** Phase 47 ends at `'awaiting_mentor'` (Amira gives a quest). Path choice is Phase 48. The old React `CinematicIntro` dispatched `path_choice` — the new sequencer dispatches `awaiting_mentor` after Amira speaks.
- **Forgetting to freeze the player:** The text crawl and camera pan must freeze player movement. Use `EventBus.emit(EVENTS.PLAYER_FREEZE)` — same pattern as DialogueBox.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Arabic canvas text rendering | Custom Unicode shaping | `prepareArabicText()` + `createArabicText()` from `ArabicText.js` | Already handles reshaping + RTL reversal |
| Dialogue display | Custom text box | `DialogueBox.show(npcName, messages, onComplete)` | Handles typewriter, freeze/unfreeze, Arabic detection, cursor blink |
| Particle burst on word discovery | Custom particle code | `ParticleEffectManager.burst(x, y, config)` | Already manages lazy texture, lifespan, auto-destroy |
| Camera fade to black | Manual alpha tweening | `cameras.main.fadeIn()` / `cameras.main.fadeOut()` | Phaser native, properly composited |
| Redux state persistence | Custom IndexedDB | `playerSlice` is already in localStorage whitelist; `tutorialPhase` and `onboardingComplete` auto-persist |
| Proximity detection | Custom distance check | Pattern from `InteractableManager` using `INTERACT_RANGE = 128` | Consistent with rest of world objects |

**Key insight:** Every building block already exists. This phase is about sequencing and wiring, not new infrastructure.

---

## Common Pitfalls

### Pitfall 1: Text Crawl Renders Behind the Camera Fade
**What goes wrong:** `cameras.main.fadeIn()` draws a black rectangle at a high internal depth. If crawl text is set to depth < 9999, the text appears behind the fade overlay.
**Why it happens:** Phaser camera fade effects are rendered on top of the scene. The fade rectangle does not participate in the scene's depth-sort.
**How to avoid:** Render the text crawl AFTER the fadeIn completes (in its callback), not during the fade itself. The sequence order is: `fadeIn` → `crawl` → `pan` → `word` → `Amira`, not simultaneous.
**Warning signs:** Text is invisible until fade completes then suddenly appears.

### Pitfall 2: `setScrollFactor(0)` + Container Depth Confusion
**What goes wrong:** `setScrollFactor(0)` pins objects to the camera viewport but depth ordering is still relative to the world scene. If other scene objects are at high depths, they may overlap the crawl text.
**Why it happens:** `DayNightCycle` overlay is at depth 9000. DialogueBox container is at depth 10000. Zone toast is at depth 9500.
**How to avoid:** Use depth 9800 for crawl text (above DayNightCycle overlay, below DialogueBox).
**Warning signs:** Text is clipped by day/night overlay or occluded by other fixed-to-camera elements.

### Pitfall 3: Player Movement Before Sequencer Cleanup
**What goes wrong:** If the sequencer doesn't freeze the player, the player can walk during the camera pan and break the choreography.
**Why it happens:** `PlayerController.freeze()` must be called explicitly. `this.frozen = true` on WorldScene alone doesn't stop the player sprite.
**How to avoid:** Call `EventBus.emit(EVENTS.PLAYER_FREEZE)` at the very start of the sequence. Call `EventBus.emit(EVENTS.PLAYER_UNFREEZE)` in `cleanup()` after Amira's dialogue completes.
**Warning signs:** Player sprite walks during the camera pan.

### Pitfall 4: FloatingWordObject Persists After Scene Reload
**What goes wrong:** The floating word sprite is created during the cinematic. If the player reloads the page mid-sequence (and `onboardingComplete` is still false), the word may be recreated but the old one's tween may have a stale reference.
**Why it happens:** Phaser tweens hold references to their targets. If the scene restarts without explicit `tween.remove()` + `sprite.destroy()`, the old tween continues ticking on a destroyed object.
**How to avoid:** `CinematicIntroSequencer.cleanup()` must call `this.floatingWord.destroy()` and stop all active tweens via their stored references. Guard the sequencer creation with `tutorialPhase === 'cinematic_intro'` check on every `buildZone()` call.
**Warning signs:** Console errors about "Cannot set properties of null (setting 'y')" from tween callbacks.

### Pitfall 5: `tutorialPhase` Not Persisted Yet for New Player
**What goes wrong:** First-time player: `playerSlice.initialState.tutorialPhase === 'cinematic_intro'`. But redux-persist may rehydrate with `null` or an old value on a second visit.
**Why it happens:** `playerSlice` is in the localStorage whitelist (`persist:gogo-arabic`). If a player started a game before Phase 47 shipped, their persisted `tutorialPhase` may be `'awaiting_mentor'` or `'complete'` already.
**How to avoid:** The guard `!playerState.onboardingComplete && playerState.tutorialPhase === 'cinematic_intro'` is correct — existing players have `onboardingComplete === true`, so they skip entirely. New players who never played have the initial state. No migration needed.
**Warning signs:** Veteran players see the cinematic on every reload.

### Pitfall 6: Arabic Text Crawl Displays as Unjoined Letters
**What goes wrong:** Raw Arabic Unicode displays as disconnected isolated letter forms in Phaser canvas text.
**Why it happens:** Phaser's canvas text renderer does not perform OpenType shaping (letter joining). Without reshaping + reversal, Arabic looks broken.
**How to avoid:** Always pass Arabic strings through `prepareArabicText()` before `setText()`. For text objects created from scratch, use `createArabicText()`.
**Warning signs:** Arabic characters appear as isolated, unconnected letter forms; text reads right-to-left but visually left-to-right.

### Pitfall 7: Camera Pan Runs Before Zone is Fully Rendered
**What goes wrong:** Camera starts panning before NPC sprites and tilemap tiles are fully placed, causing visible pop-in during the pan.
**Why it happens:** `buildZone()` is synchronous but some async asset lookups (Kenmi catalog) may resolve after the pan starts.
**How to avoid:** Wrap the fade+crawl in a `this.time.delayedCall(200, ...)` after `buildZone()` to ensure one render cycle completes. Or start the pan only from the crawl's completion callback (not from `create()`).

---

## Code Examples

Verified patterns from existing source files:

### Camera Fade In (from Phaser 3 Camera API — used in project context)
```javascript
// Fade from black to scene over 1.5s, then proceed
this.cameras.main.fadeIn(1500, 0, 0, 0, (camera, progress) => {
  if (progress === 1) {
    this._startTextCrawl();
  }
});
```

### Phaser Text Fixed to Camera (from WorldScene._showZoneNameToast)
```javascript
// Source: WorldScene.js _showZoneNameToast() — production pattern
const label = this.add.text(centerX, y, 'YOUR TEXT', {
  fontFamily: "'Press Start 2P', monospace",
  fontSize: '14px',
  color: '#f4fefa',
}).setOrigin(0.5).setScrollFactor(0).setDepth(9800).setAlpha(0);

this.tweens.add({
  targets: label,
  alpha: 1,
  duration: 600,
  ease: 'Power2',
});
```

### Arabic Text for Canvas (from ArabicText.js — production utility)
```javascript
// Source: src/game/ui/ArabicText.js
import { createArabicText, prepareArabicText } from '../ui/ArabicText.js';

// Create a new Arabic text object
const arabicLabel = createArabicText(this, x, y, 'في زمنٍ بعيد...', {
  fontSize: '18px',
  color: '#d4a843',
});
arabicLabel.setScrollFactor(0).setDepth(9800);

// Or update an existing text object
existingText.setText(prepareArabicText('مرحباً'));
```

### DialogueBox Amira Arrival (from DialogueBox.js — production API)
```javascript
// Source: src/game/ui/DialogueBox.js show() method
// WorldScene already has this.dialogueBox initialized in create()
this.scene.dialogueBox.show(
  'Guide Amira',
  ["Peace be upon you, traveller.", "I have been waiting for you."],
  () => {
    // Called after player dismisses last message (SPACE/ENTER)
    store.dispatch(setTutorialPhase('awaiting_mentor'));
    this.cleanup();
  }
);
```

### Particle Burst on Word Discovery (from ParticleEffectManager.js — production API)
```javascript
// Source: src/game/systems/ParticleEffectManager.js burst()
// WorldScene already has this.particleEffects initialized
this.scene.particleEffects.burst(wordX, wordY, {
  count: 30,
  tint: 0xd4a843, // gold
  speed: { min: 60, max: 180 },
  lifespan: 900,
});
```

### Pulsing Glow Under Floating Word (Phaser Graphics — verified pattern)
```javascript
// Phaser Graphics + tween for glow pulse effect
const glow = this.scene.add.graphics();
glow.fillStyle(0xd4a843, 1);
glow.fillCircle(0, 0, 28);
glow.setPosition(wordX, wordY);
glow.setAlpha(0.2);

this.glowTween = this.scene.tweens.add({
  targets: glow,
  alpha: { from: 0.1, to: 0.4 },
  duration: 900,
  yoyo: true,
  repeat: -1,
  ease: 'Sine.easeInOut',
});
```

### Player Freeze/Unfreeze (from EventBus patterns in WorldScene)
```javascript
// Source: WorldScene.js, DialogueBox.js — production EventBus patterns
import { EventBus } from '../../utils/eventBus.js';
import { EVENTS } from '../../utils/eventBusTypes.js';

// Freeze player at sequence start
EventBus.emit(EVENTS.PLAYER_FREEZE);

// Unfreeze after sequence ends
EventBus.emit(EVENTS.PLAYER_UNFREEZE);
```

### Redux Dispatch from Phaser (from WorldScene + DialogueEngine — production pattern)
```javascript
// Source: WorldScene.js, DialogueEngine.js — store.dispatch() called directly from Phaser systems
import { store } from '../../store/store.js';
import { setTutorialPhase } from '../../store/slices/playerSlice.js';

store.dispatch(setTutorialPhase('awaiting_mentor'));
```

---

## Integration Map: What Changes vs What Stays

| File | Change | Type |
|------|--------|------|
| `src/game/systems/CinematicIntroSequencer.js` | Create new | NEW |
| `src/game/objects/FloatingWordObject.js` | Create new | NEW |
| `src/game/scenes/WorldScene.js` | Add sequencer trigger in `create()` | EDIT (small) |
| `src/components/Router/GameLayout.jsx` | Remove `<CinematicIntro />` render line | EDIT (1 line) |
| `src/components/Onboarding/CinematicIntro.jsx` | Leave on disk, becomes dead code | NO CHANGE |
| `src/components/Onboarding/index.js` | No change | NO CHANGE |
| `src/store/slices/playerSlice.js` | No change — `tutorialPhase` values already correct | NO CHANGE |
| `src/utils/eventBusTypes.js` | Optionally add `CINEMATIC_INTRO_COMPLETE` event | OPTIONAL EDIT |

**Why `setTutorialPhase('awaiting_mentor')` not `'path_choice'`:** The old React `CinematicIntro.jsx` dispatches `'path_choice'`. But in v10.0, path choice is Phase 48 (happens AFTER onboarding, not part of the cinematic). Phase 47 ends when Amira gives the first quest and the player is in the world — that's `'awaiting_mentor'`. The `GameLayout.jsx` already shows `<TutorialHints />` when `tutorialPhase !== 'cinematic_intro' && tutorialPhase !== 'path_choice' && !onboardingComplete`, so setting `'awaiting_mentor'` correctly un-blocks TutorialHints if needed.

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| React `CinematicIntro.jsx` (DOM text crawl, black background) | Phaser-native sequence in WorldScene (camera fade, Phaser text, camera pan) | World is visible behind fade; cinematic is IN the game world |
| 6-step tutorial popup flow (`tutorialPhase: 'awaiting_mentor'` → `'met_mentor'` → ...) | Replaced by in-world discovery (see word, walk to it, learn it) | No interruption to exploration |
| `FloatingWordObject` not yet implemented | New Phaser sprite with glow + bob tween + proximity/input detection | First Arabic word is a world object, not a UI popup |

**Deprecated:**
- `CinematicIntro.jsx` React overlay — superseded by `CinematicIntroSequencer.js`
- `GameLayout.jsx` line `{tutorialPhase === 'cinematic_intro' && <CinematicIntro />}` — to be commented out

---

## Open Questions

1. **Should FloatingWordObject use a Kenmi sprite or a Phaser Graphics-drawn shape?**
   - What we know: `InteractableManager` uses Kenmi sprite keys (e.g. `'kenmi-desert-props-golden-pots'`). No dedicated "word object" sprite exists in Kenmi catalog.
   - What's unclear: Whether a text-only object (Arabic word in gold, surrounded by glow) looks better than a sprite-based container.
   - Recommendation: Use a Phaser Container holding: (1) Graphics glow circle, (2) `createArabicText()` for the Arabic word, (3) small English transliteration text below. No sprite needed — pure Phaser Graphics + Text.

2. **Which first Arabic word to teach?**
   - What we know: The first word must be meaningful. The vocabulary system uses FSRS (`addFsrsCard`). The vocabulary data is in `vocabulary-final.json` and `vocabularyAll.js`.
   - What's unclear: Which specific word ID / Arabic text to use for INTRO-03/04.
   - Recommendation: Use "مَاء" (maa', water) — a pond/oasis is visible in the zone, it's A1 CEFR, 3 characters, visually simple. Or "نَخْلَة" (palm tree) if there's a palm nearby. The planner should pick one from `vocabulary-final.json`.

3. **Should Amira walk toward the player or appear nearby?**
   - What we know: Amira is spawned by `NPCManager` at zone coordinates (x:14, y:18). Player spawns at zone `spawnPoint`. NPC movement AI exists in `NPCManager`.
   - What's unclear: Whether the sequencer needs to move Amira's sprite or if she simply appears at her spawn and speaks.
   - Recommendation: Keep it simple — Amira speaks from her spawn position. Camera pans to her spawn after word discovery. Moving NPCs programmatically requires pathfinding integration which is out of scope.

---

## Sources

### Primary (HIGH confidence)
- `src/game/scenes/WorldScene.js` — full scene lifecycle, `create()` pattern, camera, EventBus wiring
- `src/game/ui/DialogueBox.js` — `show()` API, freeze/unfreeze pattern, typewriter
- `src/game/ui/ArabicText.js` — `createArabicText()`, `prepareArabicText()` API
- `src/game/systems/DayNightCycle.js` — dawn tint values, overlay depth pattern
- `src/game/systems/ParticleEffectManager.js` — `burst()` API
- `src/store/slices/playerSlice.js` — `tutorialPhase` enum, `setTutorialPhase()`, `completeOnboarding()`
- `src/store/store.js` — persistence architecture, localStorage whitelist includes `player`
- `src/utils/eventBusTypes.js` — `PLAYER_FREEZE`, `PLAYER_UNFREEZE` events
- `src/components/Router/GameLayout.jsx` — existing `tutorialPhase === 'cinematic_intro'` guard
- `src/components/Onboarding/CinematicIntro.jsx` — old React implementation to be bypassed
- `src/data/zones.js` — Amira spawn coords (x:14, y:18), zone structure

### Secondary (MEDIUM confidence)
- Phaser 3 camera API: `fadeIn()`, `pan()` — well-established Phaser 3.x APIs, verified against project usage in DayNightCycle and ZoneTransition
- Phaser 3 tween `yoyo: true, repeat: -1` for looping — standard API used throughout codebase (DialogueBox cursor blink, DayNightCycle)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies; everything already in project
- Architecture patterns: HIGH — derived directly from existing production code in same codebase
- Integration seam (where to hook in WorldScene): HIGH — `create()` flow and `tutorialPhase` guard are clearly mapped
- FloatingWordObject glow technique: MEDIUM — Graphics-based glow is standard Phaser canvas pattern, but exact look depends on iteration
- First word choice: LOW — depends on vocabulary data review; recommendation given but needs planner decision

**Research date:** 2026-03-19
**Valid until:** 2026-06-19 (stable — Phaser 3.x API and project architecture are stable)
