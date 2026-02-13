# Phase 32: Status Effects & Advanced Combat - Research

**Researched:** 2026-02-13
**Domain:** Advanced turn-based combat mechanics with educational game integration
**Confidence:** HIGH

## Summary

Phase 32 builds on the existing v6.0 turn-based battle system (Phases 27-31) to add strategic depth through status effects with Arabic names, grammar-based combo mechanics, multi-target positioning, battle items, and arena challenge modes. The core principle: every advanced mechanic teaches Arabic vocabulary or grammar patterns.

The existing architecture provides strong foundations: battleSlice manages status effects arrays, BattleStateMachine drives turn flow with FSM patterns, elementCombos.js demonstrates combo detection logic, and statusEffects.js defines 14 effects with Arabic names. The challenge is expanding from single-target battles to multi-enemy encounters, integrating grammar-based combo chains (noun+adjective, verb conjugation sequences, full sentence construction), and creating wave-based arena modes with leaderboards.

**Primary recommendation:** Extend existing systems incrementally rather than building parallel architectures. Status effects vocabulary should auto-queue to FSRS (middleware pattern from craftingVocabMiddleware.js). Grammar combos should validate against completed lessons in grammarSlice. Arena modes should reuse BattleScene with modified configurations.

## Standard Stack

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Phaser 3 | 3.80.1 | BattleScene rendering, sprite animations, turn flow | Industry standard for 2D game rendering in web, proven in existing battle system |
| Redux Toolkit | 2.2.x | battleSlice state (status effects, combo meter, arena stats) | Already manages 17 slices including battle, established patterns for state management |
| Framer Motion | 11.x | React overlay animations (combo counter, status effect icons) | Used in ComboCounter.jsx, smooth spring animations for UI feedback |
| Howler.js | 2.2.x | Battle SFX, status effect sounds | Project-wide audio standard, no music constraint enforced |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| ts-fsrs | 4.1.0 | Schedule status effect vocabulary for review | Already integrated, auto-queue new Arabic words learned in combat |
| Lodash | 4.17.x | Array utilities for combo detection, multi-target selection | Used throughout codebase, helpful for grammar validation logic |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Phaser particles | Custom Canvas | Phaser has optimized particle pools, custom would require reimplementation |
| Redux state for combos | Local component state | Combos need persistence across turns and post-battle analytics, Redux provides time-travel debugging |
| FSRS middleware | Manual queue updates | Middleware ensures 100% coverage of status effect vocabulary, manual risks missing words |

**Installation:**
No new packages required. All systems extend existing stack.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── data/
│   ├── statusEffects.js          # EXPAND: 14 → 20+ effects with compound effects
│   ├── grammarCombos.js          # NEW: noun+adj, verb chains, sentence templates
│   └── arenaChallenges.js        # NEW: wave configs, boss rush sequences, puzzle battles
├── game/systems/battle/
│   ├── BattleStateMachine.js     # EXTEND: add COMBO_PHASE, MULTI_TARGET_SELECT states
│   ├── MultiTargetManager.js     # NEW: handle up to 4 enemies, front/back positioning
│   ├── GrammarComboDetector.js   # NEW: validate Arabic grammar patterns for combos
│   └── ArenaController.js        # NEW: manage wave progression, scoring, leaderboards
├── store/slices/
│   ├── battleSlice.js            # EXTEND: add grammarCombo, activeArena, comboMeter
│   └── arenaSlice.js             # NEW: leaderboard, challenge completion, best scores
├── store/middleware/
│   └── statusEffectVocabMiddleware.js  # NEW: auto-queue status effect Arabic to FSRS
└── components/Battle/
    ├── StatusEffectBar.jsx       # NEW: show active buffs/debuffs with Arabic names
    ├── GrammarComboInput.jsx     # NEW: multi-step input for sentence construction
    └── ArenaHUD.jsx              # NEW: wave counter, score, streak display
```

### Pattern 1: Status Effect Vocabulary Auto-Queueing
**What:** When a status effect is applied (player or enemy), automatically add its Arabic vocabulary to FSRS review queue
**When to use:** Every applyStatusEffect action
**Example:**
```javascript
// src/store/middleware/statusEffectVocabMiddleware.js
export const statusEffectVocabMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (action.type === 'battle/applyStatusEffect') {
    const { effect } = action.payload;
    const statusData = getStatusEffect(effect.id);

    if (statusData && statusData.arabic) {
      // Create FSRS card for this status effect word
      const wordId = `status_${effect.id}`;
      const existingCard = store.getState().vocabulary.fsrsCards[wordId];

      if (!existingCard) {
        // Add to vocabulary with source tag
        store.dispatch(addFsrsCard({
          wordId,
          card: createEmptyCard(),  // from ts-fsrs
          source: 'battle_status_effect'
        }));
      }
    }
  }

  return result;
};
```

### Pattern 2: Grammar Combo Detection
**What:** Validate Arabic grammar patterns (noun+adjective agreement, verb conjugation chains) for damage multipliers
**When to use:** During combo input phase after player submits Arabic text
**Example:**
```javascript
// src/game/systems/battle/GrammarComboDetector.js
export class GrammarComboDetector {
  constructor(grammarLessons) {
    this.completedLessons = grammarLessons; // from grammarSlice
  }

  detectNounAdjectiveCombo(arabicInput) {
    // Check if player has completed إضافة lesson
    if (!this.completedLessons.includes('lesson_idafa')) {
      return { valid: false, reason: 'lesson_locked' };
    }

    // Parse input for noun + adjective with correct agreement
    const tokens = arabicInput.trim().split(/\s+/);
    if (tokens.length !== 2) return { valid: false };

    const [noun, adjective] = tokens;
    // Validate gender/number agreement (simplified example)
    const agreement = this.checkAgreement(noun, adjective);

    return {
      valid: agreement.matches,
      damageMultiplier: agreement.matches ? 1.3 : 1.0,
      comboType: 'noun_adjective',
      arabicUsed: arabicInput
    };
  }

  detectVerbConjugationChain(currentVerb, previousVerbs) {
    // Must use same root across different forms (e.g., Form I → Form II → Form IV)
    const currentRoot = extractRoot(currentVerb);
    const allSameRoot = previousVerbs.every(v => extractRoot(v) === currentRoot);

    if (!allSameRoot) return { valid: false };

    // Escalating damage: 1.2x per additional form in chain
    const chainLength = previousVerbs.length + 1;
    const damageMultiplier = 1.0 + (chainLength * 0.2);

    return {
      valid: true,
      damageMultiplier,
      comboType: 'verb_chain',
      chainLength,
      root: currentRoot
    };
  }
}
```

### Pattern 3: Multi-Target Battle Configuration
**What:** Extend BattleScene to handle 2-4 enemies with front/back row positioning
**When to use:** Arena waves, boss rush, advanced story encounters
**Example:**
```javascript
// src/game/systems/battle/MultiTargetManager.js
export class MultiTargetManager {
  constructor(scene) {
    this.scene = scene;
    this.enemies = [];  // Array of { sprite, data, row: 'front'|'back' }
    this.playerRow = 'front';
  }

  spawnEnemies(enemyParty) {
    // Position up to 4 enemies in front/back rows
    enemyParty.forEach((enemyId, idx) => {
      const row = idx < 2 ? 'front' : 'back';
      const x = this.getEnemyX(idx, row);
      const y = this.getEnemyY(row);

      const sprite = this.scene.sprites.spawnEnemy(enemyId, x, y);
      this.enemies.push({
        sprite,
        data: getEnemy(enemyId),
        row,
        index: idx,
        hp: getEnemy(enemyId).baseHP
      });
    });
  }

  selectTarget(playerAction) {
    if (playerAction.targetType === 'single') {
      // Front row enemies easier to target
      return this.enemies.filter(e => e.row === 'front');
    } else if (playerAction.targetType === 'all_front') {
      return this.enemies.filter(e => e.row === 'front');
    } else if (playerAction.targetType === 'all') {
      return this.enemies;
    }
  }

  calculatePositionModifier(attackerRow, targetRow) {
    // Front row attacks: 100% damage
    // Back row attacks front: 100% damage
    // Back row attacks back: 70% damage (reach penalty)
    // Front row attacks back: 80% damage

    if (attackerRow === 'front' && targetRow === 'front') return 1.0;
    if (attackerRow === 'back' && targetRow === 'front') return 1.0;
    if (attackerRow === 'front' && targetRow === 'back') return 0.8;
    if (attackerRow === 'back' && targetRow === 'back') return 0.7;
  }
}
```

### Pattern 4: Wave-Based Arena Mode
**What:** Reuse BattleScene with progressive difficulty waves, scoring, and leaderboards
**When to use:** Arena challenge mode, survival mode
**Example:**
```javascript
// src/game/systems/battle/ArenaController.js
export class ArenaController {
  constructor(scene, arenaConfig) {
    this.scene = scene;
    this.config = arenaConfig;  // { mode: 'survival', maxWaves: 10, difficultyScale: 1.2 }
    this.currentWave = 0;
    this.score = 0;
    this.streak = 0;
  }

  startWave() {
    this.currentWave++;

    // Scale difficulty: more enemies, higher HP, harder Arabic
    const enemyCount = Math.min(4, 1 + Math.floor(this.currentWave / 3));
    const hpMultiplier = 1 + (this.currentWave * 0.15);
    const arabicDifficulty = this.getArabicDifficulty(this.currentWave);

    // Generate wave enemies
    const waveEnemies = this.generateWaveEnemies(enemyCount, hpMultiplier);

    // Launch battle with wave config
    EventBus.emit(EVENTS.ARENA_WAVE_START, {
      wave: this.currentWave,
      enemies: waveEnemies,
      arabicDifficulty,
      timeLimit: 120000  // 2 minutes per wave
    });
  }

  onWaveComplete(battleResult) {
    // Award points based on accuracy, time, streak
    const waveScore = this.calculateWaveScore(battleResult);
    this.score += waveScore;

    if (battleResult.victory) {
      this.streak++;

      // Check if arena complete
      if (this.currentWave >= this.config.maxWaves) {
        this.completeArena();
      } else {
        // Next wave after brief pause
        this.scene.time.delayedCall(3000, () => this.startWave());
      }
    } else {
      // Arena failed
      this.submitScore();
    }
  }

  calculateWaveScore(result) {
    const baseScore = 100;
    const accuracyBonus = result.accuracy * 50;
    const speedBonus = Math.max(0, 50 - (result.timeElapsed / 1000));
    const streakBonus = this.streak * 20;

    return Math.floor(baseScore + accuracyBonus + speedBonus + streakBonus);
  }

  submitScore() {
    // Submit to arenaSlice leaderboard
    store.dispatch(submitArenaScore({
      mode: this.config.mode,
      score: this.score,
      wavesCompleted: this.currentWave,
      timestamp: Date.now()
    }));
  }
}
```

### Anti-Patterns to Avoid
- **Building parallel state trees:** Don't create separate "arenaState" — extend battleSlice with arena-specific fields
- **Synchronous FSRS updates in hot loops:** Status effects can apply multiple times per turn — batch vocabulary additions
- **Hard-coded grammar rules:** Grammar combos must reference grammarSlice completed lessons, not inline validation
- **Client-side leaderboards without validation:** Arena scores must include replay data for anti-cheat verification

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Arabic grammar validation | Custom regex parser | Reference grammarSlice completed lessons + validate against lesson patterns | Arabic morphology is complex (gender, number, case, definiteness) — lesson completion gates combo availability |
| Status effect stacking logic | Ad-hoc merge functions | Structured effect composition system (additive vs multiplicative vs mutually exclusive) | Compound effects (حماية + قوة) need clear precedence rules, existing elementCombos.js pattern applies |
| Leaderboard anti-cheat | Client-only score validation | Replay data + server verification (Phase 10 backend) | Scores can be manipulated client-side — store battle inputs for validation |
| Multi-target selection UI | Custom Phaser input handlers | Extend BattleMenu.jsx with target selection mode | React handles input complexity better than Phaser DOM — maintain existing separation |

**Key insight:** Status effects and combos both follow "knowing Arabic unlocks power" — don't bypass FSRS/grammar validation. Every mechanic teaches.

## Common Pitfalls

### Pitfall 1: Status Effect Vocabulary Overload
**What goes wrong:** Adding 20+ status effects instantly floods FSRS queue, overwhelming new players
**Why it happens:** Auto-queueing every status effect without filtering by player level
**How to avoid:**
- Gate advanced status effects behind player level (level 1-5: 5 basic effects, level 6-10: 10 effects, level 11+: all 20)
- Only queue effect vocabulary when player *successfully applies* it, not when it's applied to them
- Use FSRS difficulty ratings — easy effects (حماية, قوة) first, complex effects (حيرة, بركة) later

**Warning signs:** Review queue > 50 words after a single battle, player confusion about unfamiliar status effect names

### Pitfall 2: Grammar Combo Validation Bypass
**What goes wrong:** Players accidentally trigger combos without understanding Arabic grammar patterns
**Why it happens:** Loose pattern matching treats coincidental word sequences as intentional combos
**How to avoid:**
- Require explicit combo mode toggle (player indicates intent to combo)
- Check grammarSlice for lesson completion before enabling combo types
- Show combo preview with Arabic grammar explanation before executing
- Combos require 90%+ accuracy, not just pattern match

**Warning signs:** Players report combos triggering "randomly", combo damage feels unearned

### Pitfall 3: Multi-Target Battle State Desync
**What goes wrong:** Redux battleSlice tracks single enemy HP, multi-enemy battles desync sprite visuals
**Why it happens:** Extending single-enemy state to array without updating all selectors and reducers
**How to avoid:**
- Refactor battleSlice.bossHP → battleSlice.enemies array: `[{ enemyId, hp, maxHp, effects, row }]`
- Update all selectors to handle arrays: `selectEnemyHP(state, enemyIndex)`
- BattleSpriteManager subscribes to store changes, syncs sprite positions with state
- Use enemy.index as stable key, not array position (enemies can die mid-battle)

**Warning signs:** HP bars show wrong values, defeated enemies still visible, damage applied to wrong target

### Pitfall 4: Arena Mode Memory Leaks
**What goes wrong:** Wave-based battles don't clean up BattleScene between waves, memory grows until crash
**Why it happens:** Reusing scene without calling sprite.destroy() and pool.clear()
**How to avoid:**
- Clear sprite pools between waves: `this.damagePool.clear()`, `this.effectManager.clearActive()`
- Destroy enemy sprites when wave ends: `this.sprites.clearEnemies()`
- Don't recreate scene — reset state and respawn sprites within same scene instance
- Monitor memory in DevTools during 10+ wave test runs

**Warning signs:** Browser slows down after wave 5+, Phaser warns "texture already exists", RAM usage climbs

### Pitfall 5: Boss Rush Story Continuity
**What goes wrong:** Boss rush mode removes story context, bosses feel disconnected
**Why it happens:** Reusing boss encounters without narrative interludes
**How to avoid:**
- Add story slides between boss rush fights (React overlay with Arabic text + translation)
- Reference narrative chapter system (from narrativeSlice) for boss backstory
- Unlock boss rush only after defeating bosses in story mode
- Include companion dialogue reactions during boss rush (if companion present)

**Warning signs:** Players skip boss rush mode, feel it's "just grinding", don't connect bosses to narrative

## Code Examples

### Example 1: Status Effect Compound Logic
```javascript
// src/data/statusEffects.js — extend existing file
export const COMPOUND_EFFECTS = {
  // حماية (Protection) + قوة (Strength) = صمود (Resilience)
  resilience: {
    components: ['shield', 'strength'],
    arabic: 'صمود',
    english: 'Resilience',
    effect: { dmgBoost: 1.2, dmgReduce: 0.6 },  // Combines both bonuses
    turns: 2,
    description: 'Shield and strength merge into resilient defense.'
  },

  // سم (Poison) + حرق (Burn) = تآكل (Corrosion)
  corrosion: {
    components: ['poison', 'burn'],
    arabic: 'تآكل',
    english: 'Corrosion',
    effect: { dot: 15 },  // Amplified DOT
    turns: 2,
    description: 'Poison and fire create corrosive damage.'
  }
};

export function detectCompoundEffect(activeEffects) {
  // Check if active effects contain any compound components
  const effectIds = activeEffects.map(e => e.id);

  for (const [compoundId, compound] of Object.entries(COMPOUND_EFFECTS)) {
    const hasAllComponents = compound.components.every(c => effectIds.includes(c));

    if (hasAllComponents) {
      return {
        id: compoundId,
        ...compound,
        // Remove component effects, replace with compound
        shouldReplace: compound.components
      };
    }
  }

  return null;
}
```

### Example 2: Sentence Construction Ultimate Attack
```javascript
// src/components/Battle/GrammarComboInput.jsx
import { useState } from 'react';
import { useSelector } from 'react-redux';

export default function GrammarComboInput({ onSubmit, prompt }) {
  const [sentence, setSentence] = useState({ subject: '', verb: '', object: '' });
  const completedLessons = useSelector(s => s.grammar.completedLessons);

  // Ultimate attack requires sentence lesson completion
  const canUseUltimate = completedLessons.includes('lesson_sentences');

  if (!canUseUltimate) {
    return <div>Ultimate locked. Complete sentence lesson first.</div>;
  }

  const handleSubmit = () => {
    // Construct full Arabic sentence
    const arabicSentence = `${sentence.subject} ${sentence.verb} ${sentence.object}`;

    // Validate sentence structure
    const validation = validateArabicSentence(arabicSentence, prompt.template);

    onSubmit({
      arabicSentence,
      isValid: validation.correct,
      accuracy: validation.accuracy,
      damageMultiplier: validation.correct ? 3.0 : 1.0,  // Massive damage for correct sentence
      comboType: 'ultimate_sentence'
    });
  };

  return (
    <div className="grammar-combo-input">
      <p className="prompt" lang="ar">{prompt.template}</p>

      {/* Subject input */}
      <input
        type="text"
        placeholder="فاعل (Subject)"
        value={sentence.subject}
        onChange={(e) => setSentence(prev => ({ ...prev, subject: e.target.value }))}
        lang="ar"
        dir="rtl"
      />

      {/* Verb input */}
      <input
        type="text"
        placeholder="فعل (Verb)"
        value={sentence.verb}
        onChange={(e) => setSentence(prev => ({ ...prev, verb: e.target.value }))}
        lang="ar"
        dir="rtl"
      />

      {/* Object input */}
      <input
        type="text"
        placeholder="مفعول به (Object)"
        value={sentence.object}
        onChange={(e) => setSentence(prev => ({ ...prev, object: e.target.value }))}
        lang="ar"
        dir="rtl"
      />

      <button onClick={handleSubmit}>Launch Ultimate!</button>
    </div>
  );
}
```

### Example 3: Retreat via Arabic Question
```javascript
// Extend BattleStateMachine._handleFlee()
_handleFlee() {
  // Flee requires answering Arabic question correctly
  const fleeQuestion = this._selectFleeQuestion();

  // Show flee challenge in React overlay
  EventBus.emit(EVENTS.BATTLE_FLEE_CHALLENGE, {
    word: fleeQuestion,
    timeLimit: 10000,  // 10 seconds
    onAnswer: (result) => {
      if (result.accuracy >= 0.8) {
        // Successful flee
        const exitResult = {
          victory: false,
          fled: true,
          fleeAccuracy: result.accuracy,
          rewards: { xp: 0, dirhams: 0 }
        };
        store.dispatch(endBattle(exitResult));
        this.scene.exitBattle(exitResult);
      } else {
        // Failed flee — enemy gets free turn
        EventBus.emit(EVENTS.BATTLE_FLEE_FAILED);
        this.isPlayerTurn = false;
        this._transition(STATES.ENEMY_TURN);
      }
    }
  });
}

_selectFleeQuestion() {
  // Pick vocabulary from current zone (context-relevant)
  const zone = store.getState().battle.battleZone;
  const zoneWords = getVocabularyByZone(zone);
  const dueWords = zoneWords.filter(w => {
    const card = store.getState().vocabulary.fsrsCards[w.id];
    return card && new Date(card.card.due) <= Date.now();
  });

  return dueWords[Math.floor(Math.random() * dueWords.length)];
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Status effects as passive modifiers | Status effects teach vocabulary actively | 2020s (Duolingo, Pokemon integration) | Every buff/debuff becomes a learning opportunity |
| Grammar as separate lesson mode | Grammar as combat mechanic (combo system) | Emerging 2025-2026 | Grammar knowledge directly powers attacks |
| Single boss battles | Multi-target positioning (front/back row) | Classic JRPGs (FF, DQ), modernized | Strategic depth without adding system complexity |
| Wave survival = endless grind | Wave survival = spaced repetition checkpoint | 2026 educational games | Difficulty scales with Arabic mastery, not just HP scaling |
| Boss rush = speedrun mode | Boss rush = narrative review | Story-focused RPGs (Persona, Undertale) | Reinforces story beats between action sequences |

**Deprecated/outdated:**
- **Client-only leaderboards:** Vulnerable to cheating — modern games store replay data for verification
- **Pure DPS races in arena:** Educational games should reward accuracy over speed — add accuracy multipliers
- **Unlock all combos at once:** Overwhelming for learners — gate combos behind lesson completion

## Open Questions

1. **Multi-enemy battle balance:**
   - What we know: Front/back row positioning exists in classic JRPGs, damage modifiers well-established
   - What's unclear: Optimal enemy count for Arabic input complexity (4 enemies = 4x word prompts?)
   - Recommendation: Start with 2 enemies max, expand to 4 only in arena mode where difficulty is expected

2. **Grammar combo feedback timing:**
   - What we know: Players need immediate feedback on combo validity
   - What's unclear: Should combo preview show before or after Arabic input submission?
   - Recommendation: Two-step system — preview after input, execute on confirmation (prevents accidental combos)

3. **Arena leaderboard persistence:**
   - What we know: Backend not ready until Phase 10 infrastructure
   - What's unclear: Store leaderboards in localStorage (client-only) or wait for backend?
   - Recommendation: Implement localStorage leaderboards now, add backend sync in Phase 52 (migration path clear)

4. **Status effect visual clutter:**
   - What we know: 20+ effects can crowd battle UI
   - What's unclear: Show all effects or only most impactful?
   - Recommendation: StatusEffectBar shows up to 5 effects, hover/click reveals full list

## Sources

### Primary (HIGH confidence)
- Existing codebase analysis:
  - `/src/store/slices/battleSlice.js` — status effects arrays, turn tracking, companion battle state
  - `/src/data/statusEffects.js` — 14 effects with Arabic names, buff/debuff types
  - `/src/data/elementCombos.js` — combo detection pattern (20 combos, element pairs)
  - `/src/game/systems/battle/BattleStateMachine.js` — FSM states, turn flow, flee mechanics
  - `/src/.planning/research/EXPANSION-COMBAT-RPG.md` — Phase 32 detailed requirements
  - `/src/.planning/research/BATTLE-SYSTEM-ARCHITECTURE.md` — BattleScene subsystem patterns

### Secondary (MEDIUM confidence)
- [Creating a robust Status Effect System like in RPG games - Unity Discussions](https://discussions.unity.com/t/creating-a-robust-status-effect-system-like-in-rpg-games/941438)
- [A Status Effect Stacking Algorithm - Game Developer](https://www.gamedeveloper.com/design/a-status-effect-stacking-algorithm)
- [Row Formation (YEP) - Yanfly.moe Wiki](https://www.yanfly.moe/wiki/Row_Formation_(YEP))
- [Devlog #4: Multi-Target Selection - Grid Battle System](https://himeworks.itch.io/grid-battle-system/devlog/168497/devlog-4-multi-target-selection)
- [Survival Game Design - Game Design Skills](https://gamedesignskills.com/game-design/survival/)
- [Slayer: The Demon Haunted World Boss Rush Mode Update](https://playercounter.com/slayer-the-demon-haunted-world-rolls-out-major-update-boss-rush-mode-and-8-months-of-evolution/)

### Tertiary (LOW confidence)
- [How to Gamify Language Learning: Guide for 2026](https://www.joinsabi.com/blog/gamification-language-learning) — General gamification principles, not specific to grammar combos

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All libraries already in use, no new dependencies
- Architecture: HIGH — Existing battle system provides strong foundation, patterns proven in Phases 27-31
- Pitfalls: MEDIUM-HIGH — Based on codebase analysis + general RPG development experience, some project-specific assumptions
- Grammar combo mechanics: MEDIUM — Novel integration of language learning with combat, less established precedent

**Research date:** 2026-02-13
**Valid until:** 2026-03-13 (30 days — battle system architecture is stable, libraries mature)

**Key gaps identified:**
1. No existing multi-enemy battle state structure (requires battleSlice refactor)
2. Grammar validation logic not yet implemented (need lesson completion gates)
3. Arena mode scoring formula needs balancing (accuracy vs speed weighting)
4. Status effect compound detection needs priority rules (which compounds override others)

**Next steps for planner:**
1. Define battleSlice schema for multi-enemy arrays
2. Specify grammar combo input flow (React components + validation sequence)
3. Design arena wave progression curve (enemy count, HP scaling, Arabic difficulty)
4. Map status effect vocabulary to CEFR levels (A1 effects first, B1+ later)
