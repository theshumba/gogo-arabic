# Code Review: Game Systems (Battle / Companions / Equipment / Magic)
Reviewed: 2026-05-05
Files in scope: 30 (battle: 14, companions: 4, equipment: 2, magic: 2, objects: 4, ui: 6 — minus shared `__tests__` index files; tests reviewed separately)

## Summary
- **Multiple double-damage and double-spend exploits** in the magic system: `RootMagicManager.castSpell` deducts MP and (later) `dealDamage` _while_ `BattleStateMachine._resolveAction` falls through to `_applyDamage` with `resolvedDamage=0` — but the parallel async path inside the manager's `delayedCall` then races the FSM's `TURN_END`, allowing players to act again before the spell's damage lands. Several other places dispatch `dealDamage` twice for one player turn (combo bonus damage in `_checkComboOpportunity`, plus the original damage).
- **Equipment defense formula is inverted**: `BattleStateMachine._applyEnemyDamage` divides incoming damage by the defense multiplier (1.0 = neutral). Set `defense > 1.0` and the player takes _less_ damage, but set `defense < 1.0` (debuff) and the player takes _more_ damage than baseline — yet `EquipmentStats` only ever computes additive bonuses, never returning anything `< 1.0`. The math is internally inconsistent with the rest of the codebase that treats damage/defense as multiplicative.
- **Phaser lifecycle leaks across the board**: `BattleEffectManager.hitStop` uses `setTimeout` (not Phaser's time system) and may fire after scene shutdown, restoring time-scales on a destroyed scene. `RootMagicManager` schedules `delayedCall` with no cancellation token — if the battle ends before 800ms, the callback still fires and dispatches damage on a stale battle. `ArenaController` schedules a 3000ms `delayedCall` for the next wave with only an `isActive` check; the timer itself is never `.remove()`'d on `destroy()`.
- **Event listener race conditions**: `BattleStateMachine` registers _three different listeners_ on the same `EVENTS.BATTLE_ARABIC_INPUT` event (grammar combo, flee, normal input handler in `handleArabicInput`). Triggering one state can fire stale listeners from previous transitions because `destroy()` does not cancel mid-state listeners that were registered on a state-by-state basis. Cancelling combo or flee mid-flow leaks the listener.
- **State desync risk between Phaser FSM and Redux**: `BattleStateMachine.isPlayerTurn` is a local boolean that toggles independently of `setCurrentTurn`. If the FSM runs `_endTurn` twice without an intervening `_nextTurn` (possible via `FLEE_CHALLENGE` → `TURN_END`), `currentTurn` in Redux disagrees with the FSM. Combat flee even sets `isPlayerTurn = false` without dispatching `setCurrentTurn`.

## Findings

### CRITICAL Magic spell double-damage / no-cancel race
**File:** `src/game/systems/magic/RootMagicManager.js:79-114`
**Category:** bug, redux-sync
**Issue:** `castSpell` schedules a `scene.time.delayedCall(800, …)` that dispatches `dealDamage` and emits events. There is no token returned/tracked to cancel it. If `BattleStateMachine.destroy()` is called (battle ended, scene shutdown, defeat) inside that 800ms window, the callback still runs and: (a) dispatches `dealDamage` on a battle that no longer exists (mutates `state.battle.bossHP` of a fresh battle if one started immediately), (b) emits `MAGIC_CAST_COMPLETE` to React after PostBattleReview is showing. `resetBattleState()` clears `recentCasts` but does nothing to abort scheduled timers.
**Why it matters:** Spell-cast right before a victory transition can leak damage into the _next_ encounter or into a non-battle scene. Reproduces every time a finisher spell is the killing blow on a multi-target battle (the kill animation runs concurrently with the magic delayed call).
**Suggested fix:** Track all scheduled timers in `this._pendingTimers = []` and call `timer.remove(false)` in a new `destroy()`/`cancel()` method called from `BattleStateMachine.destroy()`.

```js
this._pendingTimers ||= [];
const timer = this.scene.time.delayedCall(800, () => { ... });
this._pendingTimers.push(timer);
// in resetBattleState() / destroy():
this._pendingTimers.forEach(t => t?.remove?.(false));
this._pendingTimers = [];
```

---

### CRITICAL Magic combo dispatches a second `dealDamage` mid-turn
**File:** `src/game/systems/magic/RootMagicManager.js:165-208`
**Category:** bug, balance
**Issue:** `_checkComboOpportunity` runs inside the spell `delayedCall` and, on combo match, dispatches a second `dealDamage({ damage: bonusDamage, correct: true })`. This **also bumps `state.streak += 1`** and increments `state.currentRound` (see `battleSlice.js:128-145`). The same player turn now records two correct rounds and a streak bonus that wasn't earned, and the streak inflation flows back into the next damage calc as `comboMult` in `BattleDamageCalculator`.
**Why it matters:** Trivially exploitable streak inflation. Two casts of any combo-eligible spells produce a 4-streak from 2 turns, which crosses the `streak >= 3` critical-hit threshold. Damage compounds geometrically.
**Suggested fix:** Use a dedicated reducer (`dealCombatDamage` or `dealBonusDamage`) that mutates `bossHP` without touching `streak` or `currentRound`. Alternatively, dispatch `dealDamage({ damage: bonus, correct: true })` then immediately compensate via `setStreak(originalStreak)` — but a clean reducer is far safer.

---

### CRITICAL Magic resolution returns `resolvedDamage=0`, then `_applyDamage` treats it as a miss
**File:** `src/game/systems/battle/BattleStateMachine.js:843-855, 895-901`
**Category:** bug, balance
**Issue:** When magic succeeds, `_resolveAction` sets `action.resolvedDamage = 0` (the comment says "Damage is handled by RootMagicManager, not here"). But `_applyDamage` then runs:
```js
if (isMiss || !wasCorrect) {
  const counterDamage = Math.max(1, Math.floor((resolvedDamage || 5) * 0.5));
  store.dispatch(dealDamage({ damage: counterDamage, correct: false }));
}
else if (resolvedDamage > 0) { ... }
```
For `wasCorrect=true, isMiss=false, resolvedDamage=0` we fall into _neither_ branch, so `_applyDamage` does nothing visible — but the FSM still transitions to `ANIMATE_HIT` immediately. Meanwhile `RootMagicManager.castSpell`'s `delayedCall(800ms)` is still pending. The visible HP bar update happens 800ms later, after the FSM has already moved through `TURN_END` → `ENEMY_TURN` (which may animate before the player damage even applies). On a kill, the FSM may transition to `VICTORY` before the spell damage lands, leaving `bossHP > 0` until the late dispatch arrives — and `_handleVictory` already dispatched `endBattle`.
**Why it matters:** Visible HP bar lag, victory triggered before damage applied (cosmetic), and on multi-target battles the next animation can play on a still-alive enemy that should have been killed.
**Suggested fix:** Have `_resolveAction` await the magic damage (compute it inline and have `RootMagicManager.castSpell` return the damage rather than deferring), or move the entire magic resolution into the FSM and let the manager only do VFX. The current dual-code-path is fundamentally racy.

---

### CRITICAL Equipment defense math is inverted
**File:** `src/game/systems/battle/BattleStateMachine.js:1146-1151`
**Category:** bug, balance
**Issue:**
```js
const equipmentDefenseMult = this.scene.equipmentStats?.getStatForBattle('defense') || 1.0;
let reducedDamage = Math.floor(damage / equipmentDefenseMult);
```
But `EquipmentStats.getStatForBattle('defense')` returns the cached value from `calculateTotalEquipmentStats`. If equipment grants `+0.2 defense bonus`, callers cannot tell whether that is an additive bonus (so the cached value is `1.2`, division correct) or a multiplicative defense rating (so cached is `0.8` for "20% damage reduction", and division is wrong). Either way: a `defense_up` _buff_ that lowers the cached value would make the player take _more_ damage, not less. There is no clamping, so `defense=0` would cause `Infinity` damage and `defense=NaN` would cause `NaN`.
**Why it matters:** Either the formula is flipped, or any future status effect / debuff that lowers defense will catastrophically increase damage instead of reducing it. No guard for 0 or negative defense. This is also inconsistent with `BattleDamageCalculator.calculateDamage` which uses `equipmentDamageMult` _multiplicatively_ in line 85 — defense should be `damage * (1 - reduction)` or `damage / multiplier` consistently with the multiplier system.
**Suggested fix:** Pick one model. If `defense` is a multiplicative reduction factor (e.g. `0.8` = takes 80% damage), then `damage * defense`. If it's a divisor / armor rating, clamp the divisor to `Math.max(0.1, defenseMult)`. Add unit tests covering: defense=1.0, defense=0.5, defense=2.0, defense=0, defense=-1, defense=undefined.

---

### CRITICAL Stale event listener leak when GRAMMAR_COMBO is re-entered
**File:** `src/game/systems/battle/BattleStateMachine.js:445-523, 1373-1390`
**Category:** phaser-lifecycle, bug
**Issue:** `_handleGrammarCombo` registers `this._grammarComboListener` on `EVENTS.BATTLE_ARABIC_INPUT`. The listener removes itself on the first invocation. But: (a) if the player cancels the combo (line 460–464), the listener removes itself only when invoked — `cancelled` still triggers a removal, OK. However (b) if the FSM transitions out of `GRAMMAR_COMBO` for any other reason (e.g. `destroy()` called mid-flow because the user navigates away, or another scene state change), the listener is removed by `destroy()`. **But** the same event `BATTLE_ARABIC_INPUT` is _also_ used by the `handleArabicInput` direct-method path (line 417). Imagine: player picks combo, the React UI submits an answer, the listener fires, but the FSM has _also_ registered a flee listener (line 538) on the same event because the previous battle ended in a flee challenge whose listener was never cleaned up. Both listeners fire on the next answer.
**Why it matters:** Each listener emits `recordArabicUsed`, transitions the FSM, dispatches Redux changes — possibly twice for one input. Severe state corruption potential.
**Suggested fix:** Use a single dispatcher pattern: register exactly one listener on `BATTLE_ARABIC_INPUT` in the constructor, route by `this.state` inside the handler. Or use unique event names: `BATTLE_GRAMMAR_INPUT`, `BATTLE_FLEE_INPUT`, `BATTLE_ATTACK_INPUT`.

---

### HIGH Player-turn / Redux-turn desync after failed flee
**File:** `src/game/systems/battle/BattleStateMachine.js:560-563`
**Category:** redux-sync, bug
**Issue:** On flee failure: `this.isPlayerTurn = false; this._transition(STATES.TURN_END);` — `setCurrentTurn('enemy')` is **never dispatched**. `_endTurn` then runs:
```js
this.isPlayerTurn = !this.isPlayerTurn; // becomes true
```
So FSM thinks it's player turn next, but Redux still has `currentTurn === 'player'` from the original turn (or whatever it was). React UI reading `currentTurn` to gate input is now wrong.
**Why it matters:** UI shows "your turn" while the enemy is animating, or vice versa. Players can submit input during enemy turn. Tests don't catch this because they assert FSM state, not Redux currentTurn.
**Suggested fix:** Always pair `this.isPlayerTurn = X` with `store.dispatch(setCurrentTurn(X ? 'player' : 'enemy'))`. Better: derive `isPlayerTurn` from Redux instead of duplicating state.

---

### HIGH `dealDamage` on a miss double-counts the round
**File:** `src/game/systems/battle/BattleStateMachine.js:898-901`
**Category:** bug, balance
**Issue:**
```js
if (isMiss || !wasCorrect) {
  const counterDamage = Math.max(1, Math.floor((resolvedDamage || 5) * 0.5));
  store.dispatch(dealDamage({ damage: counterDamage, correct: false }));
}
```
But the enemy turn _will also run_ next via `_animateHit`'s `_transition(STATES.TURN_END)` → `_nextTurn` → `ENEMY_TURN` → `_applyEnemyDamage` → another `dealDamageToPlayer` dispatch. Players take both miss-counter damage AND a full enemy attack. Compare to `_animateHit:1001-1010` which also calls `damagePool.show(... counterDamage ...)` — but this is just visual; the second damage source is real. `dealDamage(correct=false)` resets streak _and_ increments `currentRound`, so a single miss "uses" two rounds of the player's allotted attempts.
**Why it matters:** Players take 1.5× expected damage on miss. Streak resets correctly but `currentRound` inflates, distorting victory accuracy calculation in `_calculateRewards`.
**Suggested fix:** Pick one: either the miss applies counter-damage and skips enemy turn (set `isPlayerTurn = !this.isPlayerTurn` early to skip), or the miss does no extra damage and lets the enemy turn handle it. Currently both happen.

---

### HIGH Input handler accepts `BATTLE_ARABIC_INPUT` when state is `INPUT_PHASE` (only) — but the listener is bound permanently
**File:** `src/game/systems/battle/BattleStateMachine.js:417-432`
**Category:** bug
**Issue:** `handleArabicInput` is exposed as a public method but the source doesn't show how/where the EventBus is wired to it. Searching the file: `handleAction`, `handleArabicInput`, `handleFlee` are public methods, presumably called directly by React components via a scene reference (or via a separate event listener registration in BattleScene which is out-of-scope). However, `handleArabicInput` early-returns if state ≠ `INPUT_PHASE`. The grammar combo and flee paths register **separate** listeners that listen for the _same_ `BATTLE_ARABIC_INPUT` event. So when React submits Arabic input during `GRAMMAR_COMBO`, both the combo listener and (if `handleArabicInput` is wired to the EventBus elsewhere) the public method run — but the public method's `this.state !== INPUT_PHASE` check silently swallows the call without notifying React. Hard to debug.
**Why it matters:** Silent state swallow + concurrent listener execution is a recipe for race-condition reports that are impossible to reproduce.
**Suggested fix:** Audit BattleScene wiring (out of scope file) to ensure exactly one input dispatcher exists, or normalise to: always call a private `_handleAnyInput(result)` that switches on `this.state`.

---

### HIGH `_applyEnemyDamage` does not gate on action type — heals/defends still trigger animations
**File:** `src/game/systems/battle/BattleStateMachine.js:1130-1135, 1137-1177`
**Category:** bug
**Issue:** `_startEnemyTurn` correctly routes `heal` and `defend` away from `ENEMY_ANIMATE`. But `_animateEnemyAction` is reached for everything else and always runs `playEnemyAttack`. For `quiz_attack`, `status_attack`, `counter_attack` (from EnemyAI patterns: Adaptive, Trickster, Turtle, Scholar) — all play the attack animation, but `_applyEnemyDamage` reads only `damage` and `type==='special'` for spell effect. `status_attack` damage is applied (50% of base) but the **status effect itself is never dispatched** — the `statusEffect` field on the action is dropped on the floor.
**Why it matters:** Trickster's status debuffs (poison/burn/slow/confuse/silence/freeze) are computed by EnemyAI and never reach the player. A whole AI pattern is broken.
**Suggested fix:** In `_applyEnemyDamage`, check `if (this.currentAction.statusEffect)` and dispatch `applyStatusEffect({ target: 'player', effect: { id: statusEffect, remainingTurns: 3, ... } })`. Same for `quiz_attack` — currently no quiz UI is triggered.

---

### HIGH `recordArabicUsed` accuracy on grammar-combo failure recorded as 0 with the failing comboType
**File:** `src/game/systems/battle/BattleStateMachine.js:478-486`
**Category:** redux-sync, balance
**Issue:** Grammar combo failure dispatches:
```js
store.dispatch(recordArabicUsed({
  word: arabicWord,
  accuracy: result?.valid ? (result.accuracy || 1.0) : 0,
  comboType: comboType || 'grammar',
}));
```
On `result?.valid === true` and `result.accuracy === undefined` (the noun_adjective and verb_chain paths return no `accuracy` — only sentence combos do, see `GrammarComboDetector` lines 95-101 vs 271-272), this falls through to `result.accuracy || 1.0` = `1.0`. So a noun-adj match recorded as accuracy=1.0 even if the player typed it perfectly OR with diacritics off. Conversely if `result.accuracy === 0` (some perverse partial match), `0 || 1.0` flips it to 1.0 — masking the true score.
**Why it matters:** `arabicUsedThisBattle` is the source of truth for PostBattleReview FSRS updates. Every noun-adj combo gets a 100% accuracy stamp regardless of typing quality, so FSRS stability stays artificially high → player never sees those words again → real fluency divergence from FSRS belief.
**Suggested fix:** Make `accuracy` an explicit field on every detector return. Use `result.accuracy ?? 1.0` (nullish coalesce) only as a documented contract, or better: treat absence as "not measured" and skip the FSRS update.

---

### HIGH Companion AI buff dispatch does not pass `effectId` to Redux
**File:** `src/game/systems/battle/BattleStateMachine.js:1078-1082`
**Category:** redux-sync, bug
**Issue:**
```js
case 'buff':
  store.dispatch(applyPlayerEffect({ id: action.effectId, duration: action.duration, source: 'companion' }));
```
But the companion AI returns `effectId: 'strength' / 'defense_up' / 'accuracy_up'` and a duration in **turns** (`duration: 3`) — not milliseconds. Compare to `applyBuff` (the consumable item path) which uses milliseconds. The reducer `applyPlayerEffect` (battleSlice.js:298) stores the value verbatim. `tickStatusEffects` decrements `remainingTurns` by 1 each turn — but the companion buff stores `duration: 3` not `remainingTurns: 3`. Field name mismatch silently makes the buff never tick down → permanent buff.
**Why it matters:** Support companion's buffs are eternal once applied. Stacking exploit: re-summon the support companion in successive battles, all buffs persist into next battle since they never tick out.
**Suggested fix:** Normalize the field name to `remainingTurns` everywhere, and have `applyPlayerEffect` accept `{ id, remainingTurns, source }`. Add `applyPlayerEffect.test.js` asserting tick-down behavior.

---

### HIGH `removeEnemyEffect(0)` always removes the first effect, ignoring index intent
**File:** `src/game/systems/battle/BattleStateMachine.js:1084-1087`
**Category:** bug
**Issue:** Companion `dispel` action calls `removeEnemyEffect(0)`. The reducer (battleSlice.js:307) presumably removes by array index. But the action's own `target` field says `'enemy'` and there's no concept of "which buff" to dispel. If the enemy has [shield, strength], dispelling 0 removes shield. If the player wanted to remove the more-dangerous strength, tough luck.
**Why it matters:** Defender companion's strategic value is broken — the AI _should_ pick the most threatening buff to dispel. Currently it just removes whatever happens to be at index 0 (typically the oldest or first applied).
**Suggested fix:** `removeEnemyEffect` should accept an `id` not an `index`, or the AI should pick the highest-priority buff and pass its index. Add a priority field to `EFFECT_DEFINITIONS`.

---

### HIGH `EnemyAI._scholarPattern` "weakest category" reduce is broken on first iteration
**File:** `src/game/systems/battle/EnemyAI.js:198-202`
**Category:** bug
**Issue:**
```js
const weakestCat = categories.reduce((weakest, cat) => {
  const avgA = categoryStability[weakest] / categoryCounts[weakest];
  const avgB = categoryStability[cat] / categoryCounts[cat];
  return avgB < avgA ? cat : weakest;
});
```
`reduce` with no initial accumulator uses `categories[0]` as `weakest` and starts iteration at `categories[1]`. So the first comparison happens between index 0 and index 1. This is correct **only** if `categories.length >= 2`. With `categories.length === 1`, reduce returns `categories[0]` immediately — fine. With `categories.length === 0`, it throws "Reduce of empty array with no initial value." There IS a `categories.length > 0` guard (line 196), so that's safe. **But**: the test uses `categories.reduce(...)` where the callback re-reads `categoryStability[weakest] / categoryCounts[weakest]` for every iteration — that's wasted work but not a bug.

The actual bug is the test's expected behavior: the function returns one of the **strings in `categories`** but `categories = Object.keys(categoryCounts)`, and the code compares averages but doesn't tie-break. With ties, behavior is unstable — order depends on insertion order of `categoryCounts`, which is deterministic only because Object iteration order for string keys is insertion-order in V8. Cross-engine portability is fragile.
**Why it matters:** Edge case: Scholar AI with one weak category works, but tied weak categories return whichever was inserted first into the FSRS object — non-deterministic across save/loads if FSRS card insertion order isn't preserved.
**Suggested fix:** Sort categories deterministically, or accept the implicit ordering and document it. Add a test for the tie case.

---

### HIGH `BattleEffectManager.hitStop` uses global `setTimeout` that survives scene shutdown
**File:** `src/game/systems/battle/BattleEffectManager.js:195-213, 372-391`
**Category:** phaser-lifecycle
**Issue:** `setTimeout(() => { if (this.scene?.sys?.isActive()) { ... } }, durationMs)` — guard is correct for the scene check, BUT:
1. The guard only protects the time-scale restoration. The closure still holds a reference to `this.scene` for the entire `setTimeout` duration, preventing GC.
2. `destroy()` does `clearTimeout(this._hitStopTimeout)` but that only stops the active timer. If `hitStop` is never called (no critical hit happened), `_hitStopTimeout` is `undefined` and `clearTimeout(undefined)` is harmless — fine.
3. `destroy()` resets `this.scene.anims.globalTimeScale = 1` etc., but `this.scene.anims` may be a different scene's anims by the time destroy runs (Phaser shares `anims` globally on `game.anims`). Setting it on the dying scene affects every scene.
**Why it matters:** A hit-stop near scene transition can leak the scene into the closure for ~50ms, but more importantly the global-time-scale reset can briefly affect the next scene's animations. `scene.anims.globalTimeScale` is `game.anims.globalTimeScale` — global state.
**Suggested fix:** Use `this.scene.time.addEvent({ delay: durationMs, callback: ... })` (auto-cancelled on scene shutdown). Don't use raw setTimeout.

---

### HIGH `_handleVictory` schedules `delayedCall(2000ms)` but does not destroy magic manager / clear state machine
**File:** `src/game/systems/battle/BattleStateMachine.js:1266-1296`
**Category:** phaser-lifecycle, bug
**Issue:** Victory flow:
1. Resets magic battle state → ok
2. Clears grammar combo state → ok
3. Emits `BATTLE_POST_REVIEW`
4. `delayedCall(2000)` then dispatches `endBattle` and calls `scene.exitBattle`

If the player dismisses the React PostBattleReview overlay early, or scene transitions for any reason in those 2 seconds, `endBattle` may dispatch on a stale state. Also, `_handleVictory` does not call `this.destroy()` itself — it relies on BattleScene's `shutdown` to clean up. If shutdown doesn't fire (the scene is paused, not stopped), listeners leak.
**Why it matters:** Repeated battles in the same scene session accumulate stale `BATTLE_ARABIC_INPUT` listeners, multiplying handler calls.
**Suggested fix:** Tie the `delayedCall` to a guarded callback that checks `this.state === STATES.VICTORY` before dispatching. Have `_handleVictory` explicitly call `this.destroy()` after the dispatch, not rely on scene lifecycle.

---

### HIGH `MagicManager.castSpell` reads playerMP directly but does not hold a transaction
**File:** `src/game/systems/magic/RootMagicManager.js:53-66`
**Category:** redux-sync, bug
**Issue:** Sequence:
```js
const playerMP = state.battle.playerMP;
if (playerMP < spell.mpCost) { return false; }
store.dispatch(spendMP(spell.mpCost));
```
Between read and dispatch, another dispatch can mutate `playerMP` (e.g. a status effect ticking, a companion ability draining MP). The reducer (`spendMP`) clamps to `Math.max(0, ...)`, so we never go negative — but we _can_ spend MP we no longer have without realizing. The MP_DEPLETED event also reflects an outdated view.
**Why it matters:** Tiny race window, but in a single-player game with synchronous dispatch it shouldn't actually happen. Documented as a defense-in-depth issue: future async middleware (e.g. saga, listener) could open the window.
**Suggested fix:** Move the cost check inside the `spendMP` reducer (return `false`/throw if insufficient, or use a `tryCast` reducer). Lower priority than the timing bugs.

---

### HIGH `_handleMagicCast` builds a fake challenge word from the rootId
**File:** `src/game/systems/battle/BattleStateMachine.js:706-725`
**Category:** bug
**Issue:**
```js
challengeWord = {
  id: randomWordId,
  arabic: randomWordId, // Simplified - actual word would come from vocabulary data
  english: rootInfo.meaning || 'word',
  element: spell.element,
};
```
The comment admits this is a stub. `randomWordId` is an _ID_ string (e.g. `kitab_book`), not Arabic text. `arabic: randomWordId` puts a Latin-letter ID into a field expected to render as Arabic. React's `BattleArabicInput` then prompts the player to type "kitab_book" instead of "كتاب". Worse, `recordArabicUsed` (line 424) is later called with `this._currentBattleWord.arabic` = the ID, polluting the FSRS-tracked Arabic-used set with non-Arabic strings.
**Why it matters:** Magic cast challenge prompt is gibberish. PostBattleReview shows the player they "used" `kitab_book` as Arabic.
**Suggested fix:** Look up actual word data via vocabularyAll.js. Until then, fall back to `_selectBattleWord()` (which does it correctly) and pretend magic prompts are normal attack prompts.

---

### MEDIUM Multi-target damage path bypasses `dealDamage` streak/round increment
**File:** `src/game/systems/battle/BattleStateMachine.js:902-924`
**Category:** redux-sync, balance
**Issue:** Multi-target dispatches `dealDamageToEnemy` (which doesn't touch `streak` or `currentRound`), then `dealDamage({ damage: 0, correct: true })` to "update single-enemy tracking for streak". But damage=0 with correct=true still calls `state.bossHP = Math.max(0, state.bossHP - 0)` and `state.streak += 1, state.currentRound += 1`. The `bossHP` at that point reflects the _sum_ of all enemies' HP (`initMultiTargetBattle` sets `bossHP = sum`), so subtracting 0 is harmless — but the comment misleads: a future refactor that changes `bossHP` semantics will break this.
**Why it matters:** Coupled & fragile. Two calls to dispatch `currentRound` and `streak` could race if anything else listens.
**Suggested fix:** Add a dedicated reducer `recordSuccessfulHit` that increments streak/round without touching bossHP. Document that `bossHP` in multi-target mode is a denormalized sum.

---

### MEDIUM `EquipmentManager.update` runs every frame even when nothing equipped
**File:** `src/game/systems/equipment/EquipmentManager.js:122-163`
**Category:** complexity (out-of-scope perf, but correctness-adjacent)
**Issue:** `update()` runs every frame, checks `playerSprite.active`, then iterates `Object.values(this.equipmentSprites)`. With nothing equipped, the loop body is never entered — fine. But `this.lastPlayerX/Y/Frame` are still updated implicitly on first call, then on subsequent calls they're never updated when no sprites exist (line 159-162 only runs if `playerMoved || frameChanged`), so `lastPlayerX` is stale forever. First time a sprite is equipped, the next update() compares against ancient `lastPlayerX` and unconditionally repositions — fine, just confusing.

The bigger risk: `setFrame(frameName)` (line 146) is only called if `sprite.anims && sprite.anims.currentAnim` — most equipment textures are static (no animation), so `sprite.anims.currentAnim` is null and `setFrame` is skipped. Equipment texture stays on whatever frame it was created with. When the player walks, the body sprite cycles but equipment stays static.
**Why it matters:** Visual desync between body and equipment during walk cycles. Helmets float, robes don't sway.
**Suggested fix:** Always `setFrame(playerSprite.frame.name)` (Phaser silently no-ops if frame doesn't exist on the texture).

---

### MEDIUM `EquipmentStats.refresh` rebinds same handler to two events, so `destroy()` only removes one
**File:** `src/game/systems/equipment/EquipmentStats.js:24-29, 71-74`
**Category:** phaser-lifecycle
**Issue:**
```js
this._onEquipmentChanged = this.refresh.bind(this);
this._onStatsUpdated = this.refresh.bind(this);
EventBus.on(EVENTS.EQUIPMENT_CHANGED, this._onEquipmentChanged);
EventBus.on(EVENTS.EQUIPMENT_STATS_UPDATED, this._onStatsUpdated);
```
These are two separate bound functions (different identity), so registration is correct. `destroy()` removes both — also correct. But: `EquipmentManager.updateSprites` _emits_ `EQUIPMENT_STATS_UPDATED` after rendering. If `EquipmentManager` and `EquipmentStats` both exist in a battle scene, then `EQUIPMENT_CHANGED` fires → both listeners fire → `EquipmentStats.refresh()` runs → `EquipmentManager.updateSprites` runs → emits `EQUIPMENT_STATS_UPDATED` → `EquipmentStats.refresh()` runs **again**. Two refreshes per change. Not a leak, but wasted work; if `calculateTotalEquipmentStats` ever has side effects, double-calls become problematic.
**Why it matters:** Double-refresh is harmless today, but the event topology (manager triggers an event listened to by another manager) creates an implicit cascade that's easy to break.
**Suggested fix:** Either make `EquipmentManager.updateSprites` directly call `EquipmentStats.refresh()` (tighter coupling, but explicit), or document that `EQUIPMENT_STATS_UPDATED` is fan-out only — never react to your own event.

---

### MEDIUM `PuzzleBattleManager` `_usedPuzzleIndices` only tracks indices, not items — repeats possible after pool exhaustion
**File:** `src/game/systems/battle/PuzzleBattleManager.js:236-267, 293-308`
**Category:** bug, balance
**Issue:**
```js
const items = []; // collected from multiple knowledge pools
const available = items.filter((_, i) => !this._usedPuzzleIndices.includes(i));
const pool = available.length > 0 ? available : items;
const item = pool[Math.floor(Math.random() * pool.length)];
this._usedPuzzleIndices.push(items.indexOf(item));
```
1. `items` is rebuilt every call — its length and ordering depend on which pools the requiredKnowledge contains. If the pools change between calls (they shouldn't, but the code allows it), `_usedPuzzleIndices` becomes meaningless.
2. `items.indexOf(item)` returns the _first_ occurrence. If two pools contributed identical items (same `expectedAnswer`), only the first index is marked used — duplicates can repeat.
3. No reset when the pool is exhausted: `_usedPuzzleIndices` grows unboundedly. After clearing the pool once, every subsequent puzzle is from `items` (the unfiltered pool) — but `_usedPuzzleIndices` keeps growing, so the filter does nothing useful.
**Why it matters:** Same puzzle can repeat back-to-back in long puzzle battles, defeating the educational rotation. Memory grows monotonically.
**Suggested fix:** Track items by content (e.g. a JSON-stringified key) in a `Set`, and reset the set when it covers all items.

---

### MEDIUM `BossRushController` has no FSM-style guard on out-of-order events
**File:** `src/game/systems/battle/BossRushController.js:111-119, 168-198`
**Category:** bug
**Issue:** `onInterludeDismissed` and `onBossDefeated` are external callbacks that mutate `this.currentBossIndex`. If `onBossDefeated` fires twice (e.g. duplicate `BATTLE_POST_REVIEW` event from a re-rendered React component), `currentBossIndex` advances twice and the player skips a boss. There's a `this.isActive` guard, but no per-boss completion token.
**Why it matters:** A duplicate-emit somewhere in React (which has happened before in this codebase per the file's own change history) skips bosses without the player fighting them.
**Suggested fix:** Add `_lastDefeatedBossId` and reject `onBossDefeated` calls that don't match the current expected boss.

---

### MEDIUM `BattleStateMachine._calculateRewards` divides `wordsUsed.length / currentRound`
**File:** `src/game/systems/battle/BattleStateMachine.js:1324-1326`
**Category:** bug, balance
**Issue:**
```js
const accuracy = state.currentRound > 0 ? state.wordsUsed.length / state.currentRound : 0;
```
`wordsUsed` is deduped (battleSlice.js:204 — `if (!state.wordsUsed.includes(wordId))`), so this is unique-words-used / total-rounds. If a player uses the same word across 5 rounds, `wordsUsed.length === 1` and `currentRound === 5`, accuracy = 0.2 — but the player got it right every time. The metric measures _vocabulary breadth_, not _accuracy_.
**Why it matters:** XP/dirhams scale by `accuracyBonus` (`1 + accuracy * 0.3`), so players using the same word repeatedly get penalized for not branching out. Conflicts with intent — speedrunners using their best-known word are punished.
**Suggested fix:** Track `correctAnswers` and `totalAnswers` separately. `accuracy = correctAnswers / totalAnswers`.

---

### MEDIUM `FloatingWordObject` registers SPACE key but never unregisters
**File:** `src/game/objects/FloatingWordObject.js:120-122, 210-231`
**Category:** phaser-lifecycle
**Issue:** `this._interactKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);` — `destroy()` does not call `this.scene.input.keyboard.removeKey(SPACE)`. Phaser's input key registry has reference counting; multiple `addKey` calls return the same instance but if the scene shuts down with stale registrations, key processing may continue on a destroyed scene.
**Why it matters:** Memory growth across multiple discoveries — minor in practice because scene shutdown clears keyboard input on its own. Defensive cleanup is still standard.
**Suggested fix:** `this.scene.input?.keyboard?.removeKey(this._interactKey, false)` in `destroy()`.

---

### MEDIUM `DialogueBox._showCurrentMessage` typewriter timer never fires `onComplete` if message length is 0
**File:** `src/game/ui/DialogueBox.js:248-260`
**Category:** bug
**Issue:** `repeat: displayMsg.length - 1` — if `displayMsg.length === 0`, `repeat: -1` makes a forever-repeating no-op timer. The closure increments `charIndex` (now 1), `setText('')`, and never reaches the `>= length` check that hides the cursor. `isTyping` stays `true` forever; calling `advance()` skips to the (empty) message and re-enters the same broken state.
**Why it matters:** An empty dialogue line freezes the dialogue box. Player can't progress. Unfreezes only if scene is destroyed.
**Suggested fix:** Guard early: `if (!displayMsg) { this.isTyping = false; this._showCursor(); return; }`.

---

### MEDIUM `RiddleGate.handleInteract` uses `this.riddle.answers` but constructor stores `this.riddle = config.riddle` with no validation
**File:** `src/game/objects/RiddleGate.js:9, 33-37`
**Category:** bug
**Issue:** Comment example: `riddle: { question: '...', answer: ['key', 'miftah'] }` — note singular `answer`. But code reads `this.riddle.answers` (plural). One of them is wrong; given the comment's `answer`, the dispatch sends `answers: undefined` to the dialogue handler. Either the riddle template uses `answers` (and the comment is wrong) or the code uses the wrong field name.
**Why it matters:** Riddles never accept any input correctly because the answer list is undefined.
**Suggested fix:** Pick a field name. Validate in constructor that the riddle has both `question` and `answers` (array). Throw or warn if missing.

---

### MEDIUM `SecretWall.reveal/hide` toggles `isHidden` semantics inverted
**File:** `src/game/objects/SecretWall.js:7, 29-43`
**Category:** bug, complexity
**Issue:** Field name `isHidden`. Initial: `this.isHidden = false`. `reveal()` sets `this.isHidden = true` (the wall is _hidden_ from view, i.e. revealed-as-passable). `hide()` sets `this.isHidden = false`. That is, "isHidden=true" means the WALL is hidden (passable). The semantic noun is inverted: the wall is _revealed_ (made transparent) and the field tracks whether the wall has been _dispelled_, not whether it's currently _showing_. Reader has to invert their mental model; introduces high bug risk.
**Why it matters:** Future maintenance bug magnet. `if (!conditionMet && this.isHidden)` is read as "if condition false and wall hidden, hide it" — actually means "if condition false and wall already passable, make it appear" which only makes sense if you understand the inverted semantics.
**Suggested fix:** Rename to `this.isRevealed` (the wall has been dispelled/passable) or `this.isPassable`. Update the two callers.

---

### LOW Console.log / console.warn in production paths
**File:** `src/game/systems/battle/BattleStateMachine.js:698`, `src/game/systems/equipment/EquipmentManager.js:76`, `src/game/systems/equipment/EquipmentStats.js:64`, `src/game/systems/companions/CompanionManager.js:44`, `src/game/systems/magic/RootMagicManager.js:50`, `src/game/systems/battle/BattleEffectManager.js:235`
**Category:** dead-code, complexity
**Issue:** All scattered `console.error` / `console.warn` in production code. None are gated behind `import.meta.env.DEV` or a logger abstraction.
**Why it matters:** Production console pollution; some of these errors (e.g. `RootMagicManager:50` "No spell equipped in slot") fire on legitimate user actions and create noise that hides real issues.
**Suggested fix:** Route through a `logger` utility that no-ops in production except for true errors.

---

### LOW `BattleSpriteManager._playAndReturn` lambda captures `idleKey` closure but no error handling
**File:** `src/game/systems/battle/BattleSpriteManager.js:312-323`
**Category:** complexity
**Issue:** `sprite.once('animationcomplete', () => { sprite.play(idleKey); onComplete?.(); });` — if the sprite is destroyed mid-animation (scene shutdown, enemy defeat), `sprite.play(idleKey)` runs on a destroyed object and throws. `onComplete?.()` then never runs, leaving the FSM stuck in `ANIMATE_HIT`.
**Why it matters:** Edge case but reproducible: kill an enemy with a spell, the enemy fades out tween destroys the sprite, mid-`hurt` animation. Sometimes battle freezes.
**Suggested fix:** Guard with `if (!sprite.active) { onComplete?.(); return; }` before `play(idleKey)`.

---

### LOW `BattleDamagePool.show` silently drops messages when pool exhausted
**File:** `src/game/systems/battle/BattleDamagePool.js:64-65`
**Category:** complexity
**Issue:** `if (!entry) return;` — pool size 20, and a flurry of multi-target hits can exceed 20 simultaneous floats (each lasts 800ms, animations stack up). Damage numbers vanish silently.
**Why it matters:** Player can't see what just happened — damage feedback is critical UX. Silent drop is the worst failure mode.
**Suggested fix:** Reuse the oldest active entry (cancel its tween, repurpose) rather than dropping. Or grow the pool dynamically.

---

### LOW `MultiTargetManager.getEnemyPosition` recomputes row indices every call
**File:** `src/game/systems/battle/MultiTargetManager.js:66-91`
**Category:** complexity (perf-adjacent, kept because it's called on every render-update)
**Issue:** `frontIndices` and `backIndices` are recomputed on every `getEnemyPosition` call by filtering the entire enemies array. Cache once after `initEnemies`.
**Why it matters:** Minor, but worth flagging since the function is called for every enemy on every reposition.
**Suggested fix:** Memoize on `initEnemies`.

---

### LOW `CompanionContext._estimateCEFR` and `CompanionDialogueManager._estimateCEFR` are duplicated
**File:** `src/game/systems/companions/CompanionContext.js:79-87`, `src/game/systems/companions/CompanionDialogueManager.js:122-130`
**Category:** code-duplication
**Issue:** Identical CEFR-from-vocab-count function in both files. If the thresholds change, both must be updated.
**Suggested fix:** Extract to `src/utils/cefrEstimate.js`.

---

## Patterns / Systemic Concerns

1. **Three sources of truth for player turn state**: `BattleStateMachine.isPlayerTurn` (boolean), `state.battle.currentTurn` (string), and the implicit FSM state (`PLAYER_TURN` vs `ENEMY_TURN`). They drift on flee, on companion turns (the FSM toggles `isPlayerTurn` _before_ companion turn at line 1202 but doesn't dispatch `setCurrentTurn('companion')`, which doesn't exist). Pick one and derive the rest.

2. **Async damage resolution is dual-pathed**: Magic damage is computed in `RootMagicManager` (with its own delayedCall), normal damage is computed in `BattleDamageCalculator` (synchronously). The FSM has to handle both, leading to the `resolvedDamage = 0` workaround. Unifying around one pattern (FSM owns all damage application; managers only emit VFX) would eliminate a class of races.

3. **Listener registration scattered across many call sites**: `BattleStateMachine` registers/de-registers listeners across 4 different state handlers. Each is correct in isolation but the cross-state semantics aren't enforced. A "listener manager" with per-state scoping (register on enter, auto-remove on exit) would prevent the leaked-cancel-listener bugs.

4. **Buff duration units are inconsistent**: Companion buffs use turns (3), consumable items use ms (60000), reducer (`applyPlayerEffect`) doesn't validate. Anything reading `e.remainingTurns` after a consumable buff sees `60000` and decrements it by 1 each turn — not a bug, just very long buff duration. Standardize on turns for combat, ms for overworld.

5. **No central guard for "is battle still active"**: Many delayedCalls dispatch into `state.battle` without checking `state.battle.activeBattle !== null`. After `endBattle`, the slice resets, but in-flight callbacks land on the post-reset state.

6. **Tests heavily mock the dependency graph**, which makes them green even when the underlying integration is broken. The integration test file (`battle.integration.test.js`) is excellent for the slice; the FSM-level tests barely exercise the FSM. Recommend a state-machine integration test that drives `start → handleAction → handleArabicInput → ENEMY_TURN → resolve` end-to-end with only the scene mocked.

7. **`recordArabicUsed` is the FSRS update vector but its accuracy values are derived inconsistently** across the four call sites (normal attack uses `result?.accuracy || 0`, grammar combo uses `result?.valid ? (result.accuracy || 1.0) : 0`, flee uses `result?.accuracy || 0`, and magic doesn't call `recordArabicUsed` at all). The FSRS schedule will drift from the player's actual fluency over many battles.

## Out of scope but flagged

- **MapLoader.js (74 KB)** lives in `src/game/systems/` (not `world/`) and may be world-related — outside scope but co-resident with battle systems is unusual.
- **DialogueEngine.js / InkDialogueEngine.js** in the same systems directory listen on EventBus and may interact with companion dialogue paths reviewed here — particularly if `CompanionDialogueManager.getDialogueForTopic` results are piped through `DialogueEngine`. Worth a separate pass.
- **EVENTS namespace duplication**: `BATTLE_FLEE_CHALLENGE` and `BATTLE_FLEE_FAILED` are emitted from `BattleStateMachine`, but I could not find handlers within scope. If React handles them, fine; if not, dead emissions.
- **`store.subscribe`** is not used anywhere in the reviewed files, but `store.getState()` is called on every frame in some hot paths (companion update, equipment update). For a future perf pass: cache the slice locally and re-read only when an event dispatches a relevant change.
