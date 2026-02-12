/**
 * eventBusTypes.js — Centralized EventBus event name registry
 *
 * Naming convention: source:category:action
 *   - source: where the event originates (phaser | react)
 *   - category: subsystem (player | npc | zone | object | quiz | nav | sfx | vfx | scene | battle)
 *   - action: what happened (verb or noun-verb)
 *
 * Old name → new constant mapping (for traceability):
 *   freeze-player             → PLAYER_FREEZE
 *   unfreeze-player           → PLAYER_UNFREEZE
 *   player-position-update    → PLAYER_POSITION_UPDATE
 *   player-stamina-update     → PLAYER_STAMINA_UPDATE
 *   npc-interact              → NPC_INTERACT
 *   zone-change               → ZONE_CHANGE
 *   zone-transition           → ZONE_TRANSITION
 *   check-zone-unlock         → ZONE_CHECK_UNLOCK
 *   fast-travel               → FAST_TRAVEL
 *   show-sign                 → SIGN_SHOW
 *   bookshelf-interact        → BOOKSHELF_INTERACT
 *   chest-opened              → CHEST_OPENED
 *   chest-empty               → CHEST_EMPTY
 *   door-locked               → DOOR_LOCKED
 *   door-opened               → DOOR_OPENED
 *   open-quiz                 → QUIZ_OPEN
 *   quiz-closed               → QUIZ_CLOSED
 *   open-review-session       → REVIEW_SESSION_OPEN
 *   open-alphabet             → ALPHABET_OPEN
 *   open-world-map            → WORLD_MAP_OPEN
 *   open-shop                 → SHOP_OPEN
 *   sfx-correct               → SFX_CORRECT
 *   sfx-wrong                 → SFX_WRONG
 *   sfx-wordlearned           → SFX_WORDLEARNED
 *   sfx-levelup               → SFX_LEVELUP
 *   sfx-quest                 → SFX_QUEST
 *   sfx-click                 → SFX_CLICK
 *   vfx-shake                 → VFX_SHAKE
 *   vfx-particles-burst       → VFX_PARTICLES_BURST
 *   vfx-particles-continuous  → VFX_PARTICLES_CONTINUOUS
 *   scene-ready               → SCENE_READY
 *   outfit-changed            → OUTFIT_CHANGED
 *   boss-dialogue             → BOSS_DIALOGUE
 */

export const EVENTS = Object.freeze({
  // ────────────────────────────────────────────────
  // PLAYER — movement, state, and stamina events
  // ────────────────────────────────────────────────
  /** React → Phaser: freeze player movement (e.g. when overlay opens) */
  PLAYER_FREEZE: 'react:player:freeze',
  /** React → Phaser: unfreeze player movement (e.g. when overlay closes) */
  PLAYER_UNFREEZE: 'react:player:unfreeze',
  /** Phaser → React: player world position for HUD compass (throttled ~10Hz) */
  PLAYER_POSITION_UPDATE: 'phaser:player:position-update',
  /** Phaser → React: player stamina for HUD bar (emitted while sprinting/recharging) */
  PLAYER_STAMINA_UPDATE: 'phaser:player:stamina-update',
  /** React → Phaser: player outfit changed, update Phaser sprite */
  OUTFIT_CHANGED: 'react:player:outfit-changed',

  // ────────────────────────────────────────────────
  // NPC — dialogue and interaction
  // ────────────────────────────────────────────────
  /** Phaser → React: player pressed SPACE near NPC, open dialogue overlay */
  NPC_INTERACT: 'phaser:npc:interact',

  // ────────────────────────────────────────────────
  // DIALOGUE — dialogue lifecycle events (Phase 20)
  // ────────────────────────────────────────────────
  /** React → Phaser: player selected a topic from hub menu */
  DIALOGUE_TOPIC_SELECTED: 'react:dialogue:topic-selected',
  /** Phaser → React: dialogue effect executed (for UI feedback) */
  DIALOGUE_EFFECT_EXECUTED: 'react:dialogue:effect-executed',
  /** React → Phaser: request mid-dialogue quiz */
  DIALOGUE_QUIZ_REQUESTED: 'react:dialogue:quiz-requested',
  /** React → React: dialogue conversation ended normally */
  DIALOGUE_ENDED: 'react:dialogue:ended',
  /** React → React: relationship changed during dialogue (for UI feedback) */
  DIALOGUE_RELATIONSHIP_CHANGED: 'react:dialogue:relationship-changed',

  // ────────────────────────────────────────────────
  // ZONE — transitions, unlock gating, fast travel
  // ────────────────────────────────────────────────
  /** Phaser → React: player entered a new zone, update Redux currentZone */
  ZONE_CHANGE: 'phaser:zone:change',
  /** React → Phaser: trigger WorldScene.zoneTransition.transitionTo() */
  ZONE_TRANSITION: 'phaser:zone:transition',
  /** Phaser → React: player stepped on exit trigger, check unlock requirements */
  ZONE_CHECK_UNLOCK: 'phaser:zone:check-unlock',
  /** React → React: zone gate blocked, show requirements to player */
  ZONE_GATE_BLOCKED: 'react:zone:gate-blocked',
  /** React → Phaser: fast travel from world map to target zone */
  FAST_TRAVEL: 'react:zone:fast-travel',

  // ────────────────────────────────────────────────
  // OBJECTS — interactable world objects
  // ────────────────────────────────────────────────
  /** Phaser → React: player interacted with a sign object */
  SIGN_SHOW: 'phaser:object:sign-show',
  /** Phaser → React: player interacted with a bookshelf */
  BOOKSHELF_INTERACT: 'phaser:object:bookshelf-interact',
  /** Phaser → React: player opened a chest (first time) */
  CHEST_OPENED: 'phaser:object:chest-opened',
  /** Phaser → React: player tried to open an already-opened chest */
  CHEST_EMPTY: 'phaser:object:chest-empty',
  /** Phaser → React: player tried to open a locked door */
  DOOR_LOCKED: 'phaser:object:door-locked',
  /** Phaser → React: player opened an unlocked door */
  DOOR_OPENED: 'phaser:object:door-opened',
  /** Phaser → React: player interacted with a world object (fountain, statue, etc.) */
  OBJECT_INTERACT: 'phaser:object:world-interact',

  // ────────────────────────────────────────────────
  // QUIZ / LEARNING — quiz lifecycle and navigation
  // ────────────────────────────────────────────────
  /** Phaser → React: open the quiz overlay with config */
  QUIZ_OPEN: 'phaser:quiz:open',
  /** React → (internal): quiz overlay closed, resume BGM */
  QUIZ_CLOSED: 'react:quiz:closed',
  /** React → React: navigate to /review (spaced repetition session) */
  REVIEW_SESSION_OPEN: 'react:nav:open-review',
  /** React → React: navigate to /alphabet */
  ALPHABET_OPEN: 'react:nav:open-alphabet',
  /** React → React: navigate to /game/map (world map overlay) */
  WORLD_MAP_OPEN: 'react:nav:open-world-map',
  /** React → React: open NPC shop overlay */
  SHOP_OPEN: 'react:nav:open-shop',

  // ────────────────────────────────────────────────
  // SFX — sound effects triggered from React side
  // ────────────────────────────────────────────────
  /** React/Phaser → React: play correct-answer sound */
  SFX_CORRECT: 'react:sfx:correct',
  /** React/Phaser → React: play wrong-answer sound */
  SFX_WRONG: 'react:sfx:wrong',
  /** React → React: play word-learned fanfare */
  SFX_WORDLEARNED: 'react:sfx:wordlearned',
  /** React → React: play level-up fanfare */
  SFX_LEVELUP: 'react:sfx:levelup',
  /** React → React: play quest-complete sound */
  SFX_QUEST: 'react:sfx:quest',
  /** React → React: play UI click sound */
  SFX_CLICK: 'react:sfx:click',

  // ────────────────────────────────────────────────
  // VFX — visual effects in Phaser
  // ────────────────────────────────────────────────
  /** React → Phaser: screen shake with configurable intensity */
  VFX_SHAKE: 'phaser:vfx:shake',
  /** React → Phaser: single burst of particles at position */
  VFX_PARTICLES_BURST: 'phaser:vfx:particles-burst',
  /** React → Phaser: continuous particle emitter for duration */
  VFX_PARTICLES_CONTINUOUS: 'phaser:vfx:particles-continuous',

  // ────────────────────────────────────────────────
  // NARRATIVE — story flags, relationships (Phase 20+)
  // ────────────────────────────────────────────────
  /** React → Redux: set a story flag in narrativeSlice */
  NARRATIVE_FLAG_SET: 'react:narrative:flag-set',
  /** React → Redux: change NPC relationship level in narrativeSlice */
  NARRATIVE_RELATIONSHIP_CHANGED: 'react:narrative:relationship-changed',

  // ────────────────────────────────────────────────
  // SCENE — Phaser scene lifecycle
  // ────────────────────────────────────────────────
  /** Phaser → React: BootScene/WorldScene finished initializing */
  SCENE_READY: 'phaser:scene:ready',
  /** Phaser → Phaser: building entered, interior scene launched */
  BUILDING_ENTERED: 'phaser:scene:building-entered',
  /** Phaser → Phaser: building exited, WorldScene resumed */
  BUILDING_EXITED: 'phaser:scene:building-exited',

  // ────────────────────────────────────────────────
  // BATTLE — Word Duel boss fight events (v5.0 legacy)
  // ────────────────────────────────────────────────
  /** React → React: display boss dialogue line during battle */
  BOSS_DIALOGUE: 'react:battle:boss-dialogue',

  // ────────────────────────────────────────────────
  // BATTLE v6.0 — Turn-based BattleScene events
  // ────────────────────────────────────────────────

  // React → Phaser BattleScene
  /** React → Phaser: player selected an action (Attack/Magic/Item/Defend/Flee) */
  BATTLE_ACTION_SELECTED: 'react:battle:action-selected',
  /** React → Phaser: player submitted Arabic answer */
  BATTLE_ARABIC_INPUT: 'react:battle:arabic-input',
  /** React → Phaser: player chose to flee */
  BATTLE_FLEE_REQUESTED: 'react:battle:flee-requested',
  /** React → Phaser: player used an item */
  BATTLE_ITEM_USED: 'react:battle:item-used',

  // Phaser BattleScene → React
  /** Phaser → React: battle initialized, show battle UI */
  BATTLE_STARTED: 'phaser:battle:started',
  /** Phaser → React: battle over, show results overlay */
  BATTLE_ENDED: 'phaser:battle:ended',
  /** Phaser → React: FSM state transition, update React menu */
  BATTLE_STATE_CHANGED: 'phaser:battle:state-changed',
  /** Phaser → React: show Arabic input prompt to player */
  BATTLE_PROMPT_WORD: 'phaser:battle:prompt-word',
  /** Phaser → React: animation done, enable next input */
  BATTLE_TURN_RESOLVED: 'phaser:battle:turn-resolved',
  /** Phaser → React: enemy is acting, show enemy intent */
  BATTLE_ENEMY_ACTION: 'phaser:battle:enemy-action',
  /** Phaser → React: combo counter changed */
  BATTLE_COMBO_UPDATE: 'phaser:battle:combo-update',
});
