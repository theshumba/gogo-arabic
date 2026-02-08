# Phase 3: Feature Discoverability - Research

**Researched:** 2026-02-08
**Domain:** UI/UX navigation, in-game feature access patterns
**Confidence:** HIGH

## Summary

Phase 3 aims to expose hidden learning features (Grammar, Roots, Reading, Mini-Games, Word Duel battles) so players discover them organically during gameplay. Currently, these features exist and work well but are only accessible from the main menu, creating a discovery problem for players immersed in the game world.

The codebase has all the necessary infrastructure: lazy-loaded routes for each feature, EventBus communication between Phaser and React, HUD component system, NPC dialogue framework, and world map interface. The challenge is purely UX: making features discoverable without cluttering the interface or breaking immersion.

**Primary recommendation:** Use a multi-layer approach: (1) add "Activities" button to pause menu for Grammar/Roots/Reading/Mini-Games hub access, (2) integrate Word Duel bosses into world map with zone-based access, (3) make review badge in HUD clickable (already functional via Phase 1), (4) add contextual hints to existing NPC dialogues using the cultural dialogue system.

## Standard Stack

### Core (Already in Place)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| React Router v7 | latest | Route management, lazy loading | ✓ Working |
| Redux Toolkit | latest | State management (ui, quests, player slices) | ✓ Working |
| Framer Motion | latest | Modal/overlay animations | ✓ Working |
| EventBus | custom | Phaser<->React communication | ✓ Working |

### No New Dependencies Required
All required functionality exists. This is a **feature wiring task**, not a library integration task.

## Architecture Patterns

### Existing Navigation Patterns

The codebase uses three distinct navigation paradigms:

#### 1. **EventBus Navigation** (Phaser → React)
Used by in-game elements to trigger React route changes:

```javascript
// From HUD.jsx (already working)
const openReviewSession = useCallback(() => {
  EventBus.emit('open-review-session');
}, []);

// GameLayout.jsx listener
EventBus.on('open-review-session', () => {
  navigate('/review');
});
```

**Pattern for new features:**
- Emit named event from HUD/pause menu
- GameLayout.jsx listens and navigates
- Phaser player freezes during overlay

#### 2. **Direct React Router Navigation** (React → React)
Used by menus and overlays:

```javascript
// From routes.jsx
const { goToMenu, goTo, goBack } = useGameNavigation();

// Direct navigation
goTo('/grammar');
goTo('/mini-games');
goTo('/roots');
```

**Pattern for new features:**
- Pause menu and WorldMap use `useGameNavigation` hook
- Hook provides `goTo(path)` for any route
- No EventBus needed for React-only flows

#### 3. **URL Param Navigation** (Battle System)
Word Duel uses query params for boss selection:

```javascript
// From routes.jsx BattleRoute
const params = new URLSearchParams(window.location.search);
const bossId = params.get('boss') || 'oasis_spirit';

// Navigate to battle
navigate(`/battle?boss=${bossId}`);
```

**Pattern for boss access:**
- WorldMap can add boss nodes per zone
- Click boss node → navigate with boss param
- Battle component reads param and loads boss data

### Recommended Project Structure (No Changes Needed)

Current structure already supports phase:

```
src/
├── components/
│   ├── HUD/                 # HUD.jsx already has button patterns
│   ├── UI/                  # PauseMenu.jsx needs Activities button
│   ├── World/               # WorldMap.jsx can add boss nodes
│   ├── Battle/              # WordDuel.jsx already works with boss param
│   └── NPC/                 # DialogueOverlay.jsx supports hint injection
├── data/
│   ├── bosses.js           # 8 bosses with zone mappings
│   ├── culturalDialogues.js # NPC hint system ready
│   └── zones.js            # Zone definitions with NPC lists
└── routes.jsx              # All routes already defined
```

### Pattern 1: Pause Menu Extension

**What:** Add "Activities" button to pause menu that opens modal with feature grid

**When to use:** For features that are full-screen overlays (Grammar, Roots, Reading, Mini-Games)

**Example:**

```javascript
// PauseMenu.jsx extended
function PauseMenu({ onResume, onMainMenu }) {
  const navigate = useNavigate();
  const [showActivities, setShowActivities] = useState(false);

  if (showActivities) {
    return <ActivitiesMenu onBack={() => setShowActivities(false)} />;
  }

  return (
    <div>
      <button onClick={onResume}>Resume</button>
      <button onClick={() => setShowActivities(true)}>Activities</button>
      <button onClick={onMainMenu}>Main Menu</button>
    </div>
  );
}
```

**Why this pattern:**
- Pause menu is already overlay with z-index layering
- No risk of cluttering HUD bar
- Natural discovery point (player already pausing for menu)
- Framer Motion animations already implemented

### Pattern 2: World Map Boss Integration

**What:** Add boss node markers to WorldMap per zone (similar to existing zone nodes)

**When to use:** For zone-specific boss battles

**Example:**

```javascript
// WorldMap.jsx - add boss rendering
const renderBossNode = (boss) => {
  const zone = ZONES[boss.zone];
  const zonePos = ZONE_POSITIONS[boss.zone];
  const bossPos = { x: zonePos.x + 5, y: zonePos.y - 5 }; // Offset from zone

  return (
    <button
      className={styles.bossNode}
      onClick={() => navigate(`/battle?boss=${boss.id}`)}
      style={{ left: `${bossPos.x}%`, top: `${bossPos.y}%` }}
    >
      <div className={styles.bossSprite}>{boss.sprite}</div>
      <div className={styles.bossLabel}>{boss.name}</div>
    </button>
  );
};
```

**Why this pattern:**
- WorldMap already renders zone nodes with positioning
- Boss data includes `zone` field for mapping
- Players already use map for navigation/discovery
- Natural fit for "boss challenges in each zone"

### Pattern 3: Clickable Review Badge

**What:** Make HUD review badge clickable (already implemented in Phase 1, just verify)

**When to use:** For direct access to review sessions

**Current implementation (HUD.jsx lines 240-252):**

```javascript
{reviewDueCount > 0 && (
  <motion.button
    className={`${styles.btn} ${styles.reviewBtn}`}
    onClick={openReviewSession}
    aria-label={`Start review session - ${reviewDueCount} words due`}
  >
    Review
    <span className={styles.badge}>{reviewDueCount}</span>
  </motion.button>
)}
```

**Status:** ✓ Already working (Phase 1 fix)

### Pattern 4: NPC Contextual Hints

**What:** Add hint lines to NPC dialogues mentioning hidden features

**When to use:** For organic discovery during NPC interactions

**Example using existing cultural dialogue system:**

```javascript
// In culturalDialogues.js or new hints.js
{
  id: 'hint_grammar_lessons',
  npcRole: 'scholar',
  lines: [
    {
      speaker: 'npc',
      arabic: 'هل تعرف أن لدينا دروس قواعد اللغة؟',
      english: 'Did you know we have grammar lessons available?',
      action: 'hint_grammar'  // Flag for UI highlighting
    }
  ]
}
```

**Why this pattern:**
- Cultural dialogue system already exists and works
- NPCs already have roles (scholar, merchant, etc.)
- Can add hints as dialogue options without breaking trees
- Natural for immersive discovery

### Anti-Patterns to Avoid

- **Don't add HUD buttons for everything:** HUD is already dense. Use pause menu for full-screen features.
- **Don't break immersion:** Avoid "press F to access mini-games" tooltips. Use in-world elements (NPCs, map).
- **Don't duplicate routes:** All feature routes already exist. Wire navigation, don't create new routes.
- **Don't add tutorials:** Players learn by discovery. Hints from NPCs are better than popup tutorials.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal overlay for Activities menu | Custom z-index stacking | Framer Motion + existing overlay pattern | HUD/WorldMap already use this, proven z-index tokens |
| Boss positioning on map | Manual x/y calculations | Zone-relative offset system | WorldMap already has ZONE_POSITIONS, derive from there |
| Feature availability checks | Custom state logic | Redux selectors (unlockedZones, player level) | Already used by WorldMap unlock system |
| NPC hint triggers | New dialogue system | Cultural dialogue framework | Already in culturalDialogues.js with npcRole mapping |

**Key insight:** This phase is 90% wiring, 10% new components. Resist the urge to build new systems when existing patterns work.

## Common Pitfalls

### Pitfall 1: HUD Button Overload
**What goes wrong:** Adding 4 new buttons to HUD bar creates visual clutter and mobile overflow

**Why it happens:** Each feature feels important, tempting to give it direct HUD access

**How to avoid:**
- Use pause menu "Activities" modal for Grammar/Roots/Reading/Mini-Games
- Only HUD-appropriate items: Map, Quests, Daily Goals, Achievements (already there)
- Review button only shows when reviews due (already implemented)

**Warning signs:** HUD bar scrolls horizontally, buttons shrink below readable size on mobile

### Pitfall 2: Breaking Phase 1 Fixes
**What goes wrong:** Adding new HUD buttons breaks z-index layering or mobile overflow fixes from Phase 1

**Why it happens:** Not following established z-index token system from `src/styles/variables.css`

**How to avoid:**
- Use `--z-pause-menu` for pause menu overlays (already 700)
- Use `--z-phaser-overlay` for modals (600)
- Never use literal z-index values like `999`
- Test mobile view (< 768px) after any HUD changes

**Warning signs:** Overlays behind game canvas, HUD buttons overlapping, horizontal scroll on mobile

### Pitfall 3: EventBus Listener Leaks
**What goes wrong:** Adding new EventBus listeners without cleanup causes duplicate handlers

**Why it happens:** Forgetting return cleanup function in useEffect

**How to avoid:**

```javascript
// WRONG - no cleanup
useEffect(() => {
  EventBus.on('open-activities', handleOpen);
}, []);

// CORRECT - cleanup function
useEffect(() => {
  const handleOpen = () => { /* ... */ };
  EventBus.on('open-activities', handleOpen);
  return () => EventBus.off('open-activities', handleOpen);
}, []);
```

**Warning signs:** Event fires multiple times, console shows duplicate logs, handlers called after component unmount

### Pitfall 4: Forgetting Phaser Player Freeze
**What goes wrong:** Opening activities menu while player can still move/interact

**Why it happens:** Not emitting 'freeze-player' before overlay, or not unfreezing on close

**How to avoid:**

```javascript
// Open activities
const openActivities = () => {
  EventBus.emit('freeze-player');  // CRITICAL
  setActivitiesOpen(true);
};

// Close activities
const closeActivities = () => {
  setActivitiesOpen(false);
  EventBus.emit('unfreeze-player');  // CRITICAL
};
```

**Warning signs:** Player moves behind overlay, NPCs still interactable while modal open, input captured by both game and UI

### Pitfall 5: NPC Hint Spam
**What goes wrong:** Every NPC mentions every feature, breaking immersion

**Why it happens:** Over-eager hint implementation, not respecting NPC roles/context

**How to avoid:**
- Limit to 3-5 NPCs total (requirement is "at least 3")
- Match hints to NPC roles (scholars mention grammar, merchants mention mini-games)
- Add hints as optional dialogue branches, not forced lines
- Consider tracking hints shown (localStorage) to avoid repeats

**Warning signs:** Every NPC dialogue feels like a tutorial, players complain about "too much explaining"

## Code Examples

Verified patterns from codebase:

### HUD Button with EventBus

```javascript
// Source: HUD.jsx lines 112-118
const openAlphabet = useCallback(() => {
  EventBus.emit('open-alphabet');
}, []);

<motion.button
  className={`${styles.btn} ${styles.lettersBtn}`}
  onClick={openAlphabet}
  aria-label="Alphabet module. Press L key."
  {...buttonProps}
>
  <span role="img" aria-label="letters">أ ب</span>
</motion.button>
```

### GameLayout EventBus Listener

```javascript
// Source: GameLayout.jsx lines 214-220
const handleOpenAlphabet = () => {
  navigate('/alphabet');
};

EventBus.on('open-alphabet', handleOpenAlphabet);

return () => {
  EventBus.off('open-alphabet', handleOpenAlphabet);
};
```

### World Map Node Click Handler

```javascript
// Source: WorldMap.jsx lines 73-85
const handleZoneClick = (zoneId) => {
  if (!unlockedZones.includes(zoneId)) {
    dispatch(showNotification({ message: 'Zone locked!', type: 'quest' }));
    return;
  }
  if (zoneId === currentZone) {
    onBack();
    return;
  }
  // Fast travel
  EventBus.emit('fast-travel', { zoneName: zoneId });
  onBack();
};
```

### Boss Data Structure

```javascript
// Source: bosses.js
{
  id: 'oasis_spirit',
  name: 'Oasis Spirit',
  nameArabic: 'روح الواحة',
  zone: 'oasis_village',  // Maps to ZONES key
  sprite: '🌊',
  hp: 80,
  difficulty: 1,
  rewards: { xp: 300, dirhams: 150 }
}

// Helper function already exists
getBossesByZone(zone) // Returns array of bosses for zone
```

### Pause Menu Pattern

```javascript
// Source: GameLayout.jsx lines 55-69, 512-520
function PauseMenu({ onResume, onMainMenu }) {
  return (
    <div className={styles.pauseMenuOverlay}>
      <div className={styles.pauseMenuTitle}>Paused</div>
      <div className={styles.pauseMenuButtons}>
        <button onClick={onResume} className={styles.pauseMenuBtnResume}>
          Resume
        </button>
        <button onClick={onMainMenu} className={styles.pauseMenuBtnMenu}>
          Main Menu
        </button>
      </div>
    </div>
  );
}

// In GameLayout render
{menuOpen && (
  <PauseMenu
    onResume={() => dispatch(toggleMenu())}
    onMainMenu={() => {
      dispatch(toggleMenu());
      navigate('/');
    }}
  />
)}
```

### NPC Dialogue Hint Structure

```javascript
// Source: culturalDialogues.js lines 14-54
{
  id: 'calligraphy_history',
  topic: 'Arabic Calligraphy',
  category: 'art',
  npcRole: 'scholar',  // Maps to NPC types
  lines: [
    {
      speaker: 'npc',
      arabic: 'الخَطُّ العَرَبِيُّ مِن أَعْظَمِ الفُنونِ في العالَم',
      english: 'Arabic calligraphy is one of the world\'s greatest art forms.',
      transliteration: 'al-khaṭṭ al-ʿarabī min aʿẓam al-funūn fī al-ʿālam',
      teachWord: 'q_0002'  // Optional: tie to vocabulary
    }
  ]
}
```

## State of the Art

| Approach | Status | Notes |
|----------|--------|-------|
| **Pause menu "Activities" hub** | Proven pattern | Used by many RPGs (Pokémon pause menu, Zelda inventory) |
| **World map boss nodes** | Modern standard | Common in JRPGs (FF, Dragon Quest), matches existing zone nodes |
| **Clickable HUD badges** | Already implemented | Phase 1 added clickable review button |
| **NPC contextual hints** | Classic RPG pattern | Zelda/Pokémon "old man in cave" hints, fits immersive design |

**Current best practice (2026):** Multi-layer discovery (HUD + pause menu + world elements + NPC hints) beats single "Activities menu" approach. Players have different discovery preferences.

**Deprecated/outdated:**
- Popup tutorials on first launch: Interrupts flow, players skip anyway
- Always-visible feature list: Clutters UI, breaks immersion
- Achievement unlocks for features: Hides content behind grind

## Open Questions

### 1. Activities Menu: Pause Menu vs HUD Button?

**What we know:**
- HUD already has 8+ buttons (Map, Quests, Goals, Achievements, Review, Alphabet, Menu)
- Pause menu currently minimal (Resume, Main Menu)
- Mobile HUD is tight on space (< 768px)

**What's unclear:**
- Would a small "Activities" HUD button be better than pause menu access?
- Is pause menu too hidden for discovery?

**Recommendation:**
- Start with pause menu approach (less risky for Phase 1 fixes)
- Can add small HUD button in polish phase if needed
- Validate with mobile testing first

### 2. Boss Access: World Map vs NPC Dialogue?

**What we know:**
- 8 bosses map to 8 zones (perfect 1:1)
- WorldMap already has zone positioning and unlock logic
- Some zones have 3-5 NPCs each

**What's unclear:**
- Should bosses be accessed via world map nodes OR via talking to specific NPCs?
- Requirement says "zone NPCs or world map interface" (either valid)

**Recommendation:**
- Use world map approach (cleaner, scales better)
- Boss nodes appear when zone is unlocked
- Optional: Add 1 NPC per zone who mentions the boss (dual access)

### 3. NPC Hint Selection: Which NPCs, Which Features?

**What we know:**
- 140 NPCs total across 8 zones
- Need "at least 3 NPCs" with hints
- NPC roles exist: scholar, merchant, student, elder, etc.

**What's unclear:**
- Which specific NPCs get hints?
- Should hints be one-time or repeatable?
- Do hints need tracking (avoid repetition)?

**Recommendation:**
- Select 4-5 diverse NPCs: 1 scholar (grammar), 1 merchant (mini-games), 1 elder (roots), 1 student (reading), 1 generic (battles)
- Use early zones (oasis, library) for maximum discovery
- Make hints optional dialogue branches (not forced)
- No tracking needed (optional branch means player controls repetition)

### 4. Review Button: Already Sufficient?

**What we know:**
- Review button appears in HUD when reviewDueCount > 0
- Clicking it emits 'open-review-session' event
- Phase 1 already implemented this (requirement DISC-03 may be done)

**What's unclear:**
- Is current implementation sufficient for DISC-03?
- Should button always be visible (not just when reviews due)?

**Recommendation:**
- Verify with user testing
- Current behavior (only show when due) is probably better UX
- Mark DISC-03 as "verify only" in plan

## Sources

### Primary (HIGH confidence)
- **Codebase audit (2026-02-08):** Direct reading of 15+ core files
  - `/src/routes.jsx` - All feature routes already defined
  - `/src/components/HUD/HUD.jsx` - HUD button patterns, EventBus usage
  - `/src/components/UI/PauseMenu.jsx` - Minimal pause menu structure
  - `/src/components/World/WorldMap.jsx` - Zone node rendering, positioning, unlock logic
  - `/src/components/Router/GameLayout.jsx` - EventBus listener patterns
  - `/src/data/bosses.js` - Boss data structure, zone mappings
  - `/src/data/culturalDialogues.js` - NPC hint system structure
  - `/src/data/zones.js` - Zone definitions, NPC lists

### Secondary (MEDIUM confidence)
- **PROJECT.md and MEMORY.md:** Phase context, completed phases, architecture overview
- **Phase 1 & 2 verification docs:** Z-index tokens, mobile fixes, HUD patterns

### Tertiary (LOW confidence)
- None - all findings from direct codebase inspection

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already in use, no new deps
- Architecture: HIGH - 4 patterns identified and verified in code
- Pitfalls: HIGH - based on existing phase learnings and common React/EventBus issues
- Implementation: HIGH - all code examples from working codebase

**Research date:** 2026-02-08
**Valid until:** 60 days (stable codebase, no fast-moving external deps)
**Phase status:** Ready for planning
