# Phase 2: Player Guidance - Research

**Researched:** 2026-02-08
**Domain:** Phaser 3 visual indicators, React HUD components, Redux quest state
**Confidence:** HIGH

## Summary

Phase 2 adds visual guidance systems to eliminate "what do I do next?" confusion through NPC quest markers (! and ?), active quest HUD display, and directional compass pointing to objectives. Implementation spans three layers: (1) Phaser sprites/text for markers above NPCs, (2) Redux state for tracking active quest and NPC quest availability, and (3) React HUD components for quest tracker and compass arrow.

The codebase already has strong foundations: NPCManager handles all 140 NPCs, questSlice tracks quest state with memoized selectors, EventBus bridges Phaser<->React, and DOMOverlayManager positions HTML elements over world coordinates. The primary architectural decision is whether to render markers in Phaser (sprites/text) or DOM (HTML positioned over NPCs).

**Primary recommendation:** Use Phaser sprites for quest markers (! and ?) for performance and consistency with existing NPC.js text rendering. Use React components in HUD for quest tracker and compass arrow. Add `activeQuest` field to questSlice and compute NPC marker state via memoized selectors based on quest prerequisites and progress.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Phaser 3 | 3.80+ | Game rendering engine | Already used for NPCs, handles sprite depth/positioning |
| React 19 | 19.x | HUD UI components | Already used for HUD, hooks for quest state |
| Redux Toolkit | 2.x | Quest state management | Already tracks quests, NPCs, player position |
| Framer Motion | 11.x | HUD animations | Already used in HUD.jsx for button interactions |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Math.atan2() | Native JS | Calculate compass angle | Directional arrow pointing to objective |
| Phaser.Text | Built-in | Render ! and ? markers | Text sprites above NPC heads |
| createSelector | RTK built-in | Memoized quest selectors | Compute marker states efficiently |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Phaser sprites | DOM overlays | DOM has Arabic font support but worse performance for 140 NPCs |
| Redux activeQuest | React useState | Redux integrates with existing quest system, persists across scenes |
| Math.atan2() | Vector libraries | Native JS avoids dependency, sufficient for 2D angle calculation |

**Installation:**
No new dependencies required. All libraries already installed.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── game/
│   ├── sprites/
│   │   └── NPC.js                    # Add quest marker sprites (! and ?)
│   └── systems/
│       └── NPCManager.js              # Update markers each frame
├── store/slices/
│   └── questSlice.js                  # Add activeQuest, marker selectors
├── components/HUD/
│   ├── HUD.jsx                        # Add quest tracker display
│   └── QuestCompass.jsx               # NEW: Compass arrow component
└── data/
    └── quests.json                    # Quest objective locations (may need)
```

### Pattern 1: Quest Marker State via Memoized Selectors

**What:** Compute which NPCs show ! or ? markers by deriving from quest state rather than storing marker flags.

**When to use:** When display state can be computed from existing state (avoids duplication and sync issues).

**Example:**
```javascript
// In questSlice.js
export const selectNpcQuestMarkers = createSelector(
  [selectAllQuests, (state) => state.quests.npcsVisited],
  (quests, npcsVisited) => {
    const markers = {}; // { npcId: 'exclamation' | 'question' | null }

    for (const [questId, quest] of Object.entries(quests)) {
      if (quest.status === 'active') {
        // Check if this NPC is the completion target
        // Show ? if quest is complete but not turned in
        if (quest.progress >= quest.target && quest.npcGiver) {
          markers[quest.npcGiver] = 'question';
        }
      } else if (quest.status === 'locked') {
        // Check if prerequisites are met (quest is available)
        const prereqsMet = quest.prerequisites.every(id =>
          quests[id]?.status === 'completed'
        );
        if (prereqsMet && quest.npcGiver) {
          markers[quest.npcGiver] = 'exclamation';
        }
      }
    }

    return markers;
  }
);
```

**Why this pattern:** Keeps quest state as single source of truth. NPCs automatically show correct markers when quest state changes. Memoized selector prevents recalculation unless quest state changes.

### Pattern 2: Phaser Sprites for NPC Markers

**What:** Add Phaser.Text sprites positioned above NPC heads, updated each frame from Redux store.

**When to use:** Visual indicators in game world that need to follow sprites and respect depth sorting.

**Example:**
```javascript
// In NPC.js constructor
this.questMarker = scene.add.text(x, y - 85, '', {
  fontFamily: "'Press Start 2P'",
  fontSize: '16px',
  color: '#FFD700',
  stroke: '#000000',
  strokeThickness: 2,
}).setOrigin(0.5).setVisible(false).setDepth(10000);

// In NPCManager.js update loop
// Read Redux store directly (Phaser can't use React hooks)
const store = require('../../store/store').store;
const markers = selectNpcQuestMarkers(store.getState());

this.npcs.forEach((npc) => {
  const marker = markers[npc.npcId];
  if (marker === 'exclamation') {
    npc.questMarker.setText('!').setVisible(true).setColor('#FFD700');
  } else if (marker === 'question') {
    npc.questMarker.setText('?').setVisible(true).setColor('#00FF00');
  } else {
    npc.questMarker.setVisible(false);
  }
  // Update position to follow NPC
  npc.questMarker.setPosition(npc.x, npc.y - 85);
});
```

**Why this pattern:** Phaser sprites automatically scroll with camera, respect depth ordering with other sprites, and have better performance than DOM for many markers. Text rendering is crisp at pixel art sizes.

### Pattern 3: Active Quest HUD Tracker

**What:** React component displaying active quest name, current objective text, and progress (e.g., "Village Explorer: Talk to Fatima 1/3").

**When to use:** Persistent on-screen guidance that doesn't block gameplay.

**Example:**
```javascript
// In HUD.jsx
import { selectActiveQuest } from '../../store/slices/questSlice';

function ActiveQuestTracker() {
  const activeQuest = useSelector(selectActiveQuest);

  if (!activeQuest) return null;

  return (
    <div className={styles.questTracker}>
      <div className={styles.questTitle}>{activeQuest.title}</div>
      <div className={styles.questObjective}>
        {activeQuest.currentObjective}
        <span className={styles.questProgress}>
          {activeQuest.progress}/{activeQuest.target}
        </span>
      </div>
    </div>
  );
}

// In questSlice.js
export const selectActiveQuest = createSelector(
  [selectAllQuests, (state) => state.quests.activeQuestId],
  (quests, activeQuestId) => {
    if (!activeQuestId) return null;
    const quest = quests[activeQuestId];
    if (!quest || quest.status !== 'active') return null;

    // Fetch full quest data from quests.json
    const questData = questsData.find(q => q.id === activeQuestId);
    return {
      ...quest,
      title: questData.title,
      description: questData.description,
      currentObjective: questData.description, // Or derive from trackEvent
      target: questData.target,
    };
  }
);
```

**Why this pattern:** HUD component reads Redux state reactively. Memoized selector prevents recalculation. Falls back gracefully if no active quest.

### Pattern 4: Directional Compass Arrow

**What:** Rotating arrow in HUD pointing toward active quest objective location (NPC or zone coordinate).

**When to use:** Player needs directional guidance to objective that may be off-screen or far away.

**Example:**
```javascript
// New component: QuestCompass.jsx
import { useSelector } from 'react-redux';
import { selectActiveQuestObjectiveLocation } from '../../store/slices/questSlice';
import { selectPlayerPosition } from '../../store/slices/playerSlice';

function QuestCompass() {
  const playerPos = useSelector(selectPlayerPosition);
  const objectivePos = useSelector(selectActiveQuestObjectiveLocation);

  if (!objectivePos) return null;

  // Calculate angle from player to objective
  // Math.atan2 returns radians, convert to degrees
  const dx = objectivePos.x - playerPos.x;
  const dy = objectivePos.y - playerPos.y;
  const angleRad = Math.atan2(dy, dx);
  const angleDeg = (angleRad * 180) / Math.PI;

  return (
    <div className={styles.compass}>
      <div
        className={styles.compassArrow}
        style={{ transform: `rotate(${angleDeg}deg)` }}
      >
        ➤
      </div>
    </div>
  );
}

// In questSlice.js - new selector
export const selectActiveQuestObjectiveLocation = createSelector(
  [selectActiveQuest, (state) => state.npc.dialogueState],
  (activeQuest, npcDialogueState) => {
    if (!activeQuest) return null;

    // For NPC-based quests, return NPC location
    if (activeQuest.npcGiver) {
      const npcConfig = ZONES[activeQuest.zone].npcs.find(
        n => n.id === activeQuest.npcGiver
      );
      if (npcConfig) {
        return { x: npcConfig.x * 64, y: npcConfig.y * 64 };
      }
    }

    // For zone exploration quests, return zone center
    const zone = ZONES[activeQuest.zone];
    return {
      x: (zone.mapWidth / 2) * 64,
      y: (zone.mapHeight / 2) * 64,
    };
  }
);
```

**Why this pattern:** Math.atan2() handles all quadrants correctly and avoids division-by-zero. CSS transform for rotation is hardware-accelerated. Selector computes objective location once per state change.

### Pattern 5: Active Quest Selection

**What:** Add `activeQuestId` field to questSlice, allow player to set active quest from quest log.

**When to use:** Player has multiple active quests and needs to choose which to track.

**Example:**
```javascript
// In questSlice.js
const initialState = {
  quests: {},
  activeQuestId: null, // NEW: tracks which quest is active
  // ... existing state
};

const questSlice = createSlice({
  name: 'quests',
  initialState,
  reducers: {
    setActiveQuest(state, action) {
      // payload: questId
      const questId = action.payload;
      if (state.quests[questId]?.status === 'active') {
        state.activeQuestId = questId;
      }
    },

    // Auto-set first active quest if none selected
    initializeQuests(state, action) {
      // ... existing logic

      // Auto-set first active quest
      if (!state.activeQuestId) {
        const firstActive = Object.keys(state.quests).find(
          id => state.quests[id].status === 'active'
        );
        if (firstActive) {
          state.activeQuestId = firstActive;
        }
      }
    },
  },
});
```

**Why this pattern:** Simple scalar state (single quest ID). Easy to persist in localStorage. UI can show "Set Active" button in quest log.

### Anti-Patterns to Avoid

- **Storing derived marker state separately:** Don't add `npcMarkers: {}` to state. Compute from quest state via selectors to avoid sync bugs.
- **DOM overlays for markers:** DOMOverlayManager works but updating 140+ NPCs each frame is slower than Phaser sprites. Reserve DOM for Arabic text (NPC names).
- **Polling Redux in Phaser update loop:** Reading store.getState() is acceptable in Phaser (can't use hooks), but don't subscribe/listen — just read current state each frame.
- **Hard-coding objective locations:** Quest data structure may not include objective coordinates. Derive from NPC positions in ZONES or quest requirements.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Angle calculation | Custom vector math | Math.atan2() | Native, handles all quadrants, avoids edge cases |
| Quest marker rendering | Canvas drawing | Phaser.Text sprites | Automatic depth sorting, collision, camera scrolling |
| Active quest selection | Array of active quests | Single activeQuestId scalar | Simpler UI, clearer player intent |
| Objective location lookup | New quest data fields | Derive from existing NPC/zone data | Avoids data duplication, uses existing coordinates |

**Key insight:** Phaser and Redux Toolkit already handle the hard parts (sprite positioning, state management, memoization). The challenge is connecting layers correctly (Phaser reads Redux, React reads Redux, both stay in sync).

## Common Pitfalls

### Pitfall 1: Phaser Reading Stale Redux State

**What goes wrong:** Phaser update loop reads Redux store, but React components update and Phaser sees old data.

**Why it happens:** Redux updates are synchronous but Phaser update loop runs independently of React render cycle.

**How to avoid:** Always read `store.getState()` fresh in Phaser update loop. Don't cache Redux state in Phaser instance variables.

**Warning signs:** Markers don't update when quest state changes, compass points to wrong location after quest completion.

### Pitfall 2: Quest Marker Logic Doesn't Match Quest Flow

**What goes wrong:** NPC shows ! but clicking them doesn't start quest, or shows ? but quest isn't completable.

**Why it happens:** Marker selector logic doesn't match quest unlocking/completion logic in GameLayout.jsx.

**How to avoid:** Use same prerequisite checking logic for markers as quest system. Test with multiple quests active.

**Warning signs:** Players report "I clicked the NPC with ! but nothing happened" or "Quest says complete but NPC has no ?".

### Pitfall 3: Missing Objective Location Data

**What goes wrong:** Compass arrow implementation fails because quests.json doesn't specify objective coordinates.

**Why it happens:** Quests track progress via events (word_learned_greetings, npcs_visited) not explicit coordinates.

**How to avoid:** For NPC-based quests, look up NPC location from ZONES data. For other quests, show compass only when objective has known location, or hide compass for non-spatial quests.

**Warning signs:** selectActiveQuestObjectiveLocation returns null for valid active quests.

### Pitfall 4: Performance Degradation with Many NPCs

**What goes wrong:** Game FPS drops when rendering 140 quest markers every frame.

**Why it happens:** Updating many DOM elements or sprites without dirty-flag optimization.

**How to avoid:** Use Phaser sprites (faster than DOM). Only update marker visibility when quest state changes (compare marker state from previous frame). Consider only showing markers for NPCs within camera viewport.

**Warning signs:** Profiler shows NPCManager.update() taking >10ms, FPS drops below 30.

### Pitfall 5: Z-Index Conflicts Between Markers and Names

**What goes wrong:** Quest markers render behind NPC name labels or vice versa.

**Why it happens:** NPC.js uses multiple text objects (name, hint, marker) with different depth values.

**How to avoid:** Use consistent depth ordering: NPC sprite (default) < name label (9999) < quest marker (10000). Document depth values in NPC.js.

**Warning signs:** Markers partially obscured by names, or markers block interaction hints.

## Code Examples

Verified patterns from codebase and Phaser 3 documentation:

### Reading Redux Store in Phaser (Existing Pattern)
```javascript
// From src/game/systems/NPCManager.js (line 54-96)
// Phaser systems can't use React hooks, so read store directly
update(playerSprite, domOverlay, interactKey, interactCooldown, setInteractCooldown) {
  this.npcs.forEach((npc) => {
    const dist = Phaser.Math.Distance.Between(
      playerSprite.x, playerSprite.y, npc.x, npc.y
    );

    const inRange = dist < INTERACT_RANGE;
    npc.setInteractionHint(inRange);

    // Handle interaction...
  });
}
```

**Source:** Existing codebase pattern in NPCManager.js. Import store via `import { store } from '../../store/store.js'` and call `store.getState()`.

### Phaser Text Sprites Above Characters (Existing Pattern)
```javascript
// From src/game/sprites/NPC.js (line 35-48)
this.hintText = scene.add.text(x, y - 70, 'SPACE', {
  fontFamily: "'Press Start 2P'",
  fontSize: '8px',
  color: '#f4fefa',
  backgroundColor: '#2b292c',
  padding: { x: 6, y: 4 },
}).setOrigin(0.5).setVisible(false).setDepth(9999);

// Update position in setInteractionHint
setInteractionHint(visible) {
  this.hintText.setVisible(visible);
  this.hintText.setPosition(this.x, this.y - 70);
}
```

**Source:** Existing pattern in NPC.js. Quest markers will follow same approach with different text and color.

### Math.atan2 for Directional Arrow
```javascript
// Source: MDN Web Docs - Math.atan2()
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2

// Calculate angle from point A to point B
const dx = pointB.x - pointA.x;
const dy = pointB.y - pointA.y;
const angleRadians = Math.atan2(dy, dx);
const angleDegrees = (angleRadians * 180) / Math.PI;

// Apply to CSS transform
element.style.transform = `rotate(${angleDegrees}deg)`;
```

**Source:** [MDN - Math.atan2()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2). Math.atan2() is standard for 2D directional calculation, handles all quadrants correctly.

### Memoized Selectors (Existing Pattern)
```javascript
// From src/store/slices/questSlice.js (line 172-178)
export const selectActiveQuests = createSelector(
  [selectAllQuests],
  (quests) => Object.entries(quests)
    .filter(([, quest]) => quest.status === 'active')
    .reduce((acc, [id, quest]) => ({ ...acc, [id]: quest }), {})
);
```

**Source:** Existing pattern in questSlice.js. New selectors for markers and objective location will follow same structure.

### EventBus Communication (Existing Pattern)
```javascript
// From src/components/Router/GameLayout.jsx (line 141-184)
useEffect(() => {
  const handleNpcInteract = ({ npcId, npcName }) => {
    playSFX('click');
    dispatch(openDialogue({ npcId, npcName }));
    dispatch(visitNpc(npcId));

    // Quest tracking logic...
  };

  EventBus.on('npc-interact', handleNpcInteract);

  return () => {
    EventBus.off('npc-interact', handleNpcInteract);
  };
}, [dispatch, fsrsCards, quests, playSFX, navigate]);
```

**Source:** Existing pattern in GameLayout.jsx. May need new events like 'set-active-quest' or compass updates can be reactive via Redux selectors.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Quest markers via individual NPC flags | Derive markers from quest state via selectors | Redux Toolkit 1.0+ (2020) | Eliminates state duplication, prevents sync bugs |
| Manual angle calculation | Math.atan2() standard library | Always available | Simpler code, handles edge cases |
| jQuery DOM manipulation | React components + CSS transforms | React 16.8+ (2019) | Declarative, hardware-accelerated animations |
| Storing objective coords in quest data | Derive from NPC/zone configs | Data-driven design | Single source of truth for locations |

**Deprecated/outdated:**
- **Canvas drawing for text overlays:** Phaser 3 Text sprites are preferred (automatic depth sorting, better performance).
- **Global Redux state subscriptions in Phaser:** Don't use `store.subscribe()` in Phaser. Just read `store.getState()` each frame.

## Open Questions

1. **Should compass always point to active quest, or only when objective is off-screen?**
   - What we know: Many RPGs hide compass when objective is on-screen to reduce clutter.
   - What's unclear: Player preference — is always-visible compass helpful or distracting?
   - Recommendation: Start with always-visible (simpler), add distance check later if feedback says it's cluttered.

2. **How to handle quests with multiple objectives (e.g., "Talk to 3 NPCs")?**
   - What we know: Quests track progress but not "which NPCs still need visiting".
   - What's unclear: Should compass point to nearest remaining objective, or fixed order?
   - Recommendation: For exploration quests with specific NPCs (quest.requirements.npcsVisited), show ! on all required NPCs. Compass points to nearest unvisited. For generic quests, hide compass.

3. **Should quest markers persist when quest is completed but reward not claimed?**
   - What we know: World of Warcraft shows ? for turn-in, players expect this pattern.
   - What's unclear: Does questSlice track rewardClaimed separately from completed?
   - Recommendation: Check `quest.status === 'completed' && !quest.rewardClaimed`. Show ? until player talks to NPC again to claim reward.

4. **What if player has 0 active quests?**
   - What we know: HUD currently shows quest log button with badge count.
   - What's unclear: Should HUD show "No Active Quest" message, or hide tracker entirely?
   - Recommendation: Hide tracker entirely when no active quest (cleaner UI). Quest log is still accessible via button.

## Sources

### Primary (HIGH confidence)
- [Phaser 3 Official Docs - Sprite](https://docs.phaser.io/phaser/concepts/gameobjects/sprite) - Sprite rendering and depth
- [MDN - Math.atan2()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2) - Angle calculation
- [Redux Toolkit Docs - createSelector](https://redux-toolkit.js.org/api/createSelector) - Memoized selectors
- GoGo Arabic codebase - NPCManager.js, questSlice.js, HUD.jsx, NPC.js, DOMOverlay.js (verified existing patterns)

### Secondary (MEDIUM confidence)
- [Phaser Discourse - How to make text hover above sprite](https://phaser.discourse.group/t/how-to-make-text-hover-be-above-sprite-e-g-addchild/4637) - Community best practices
- [Game UI Database - Compass](https://www.gameuidatabase.com/index.php?scrn=165) - UI reference examples
- [HUD Quest Tracker - CurseForge](https://www.curseforge.com/wow/addons/hud-quest-tracker-formerly-quest-pointer) - WoW quest tracker addon reference
- [State Management in React 2026](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns) - Redux patterns in 2026

### Tertiary (LOW confidence)
- [World of Warcraft Forums - Quest Marks](https://us.forums.blizzard.com/en/wow/t/quest-marks-exclamation-does-not-appear-on-npc-heads/801120) - Player expectations for quest markers
- [GitHub - OnScreenPointer](https://github.com/mubasharUnity/OnScreenPointer) - Unity implementation reference
- [Envato Tuts+ - Positioning On-Screen Indicators](https://code.tutsplus.com/positioning-on-screen-indicators-to-point-to-off-screen-targets--gamedev-6644t) - Math for off-screen indicators

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use, no new dependencies
- Architecture patterns: HIGH - Existing codebase patterns verified, Phaser/Redux documented
- Pitfalls: MEDIUM - Based on common game dev issues and codebase structure review
- Implementation math: HIGH - Math.atan2() well-documented, standard approach

**Research date:** 2026-02-08
**Valid until:** 2026-04-08 (60 days - stable stack, established patterns)
