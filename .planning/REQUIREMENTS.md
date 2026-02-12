# Requirements: GoGo Arabic v6.0 — Combat & RPG

**Defined:** 2026-02-12
**Core Value:** Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world — never wondering "what should I do next?" or "how do I practice?"

## v6.0 Requirements

Requirements for v6.0 milestone. Each maps to roadmap phases.

### Storage & Infrastructure

- [ ] **STOR-01**: Player can save games without localStorage overflow — FSRS cards and battle history migrated to IndexedDB
- [ ] **STOR-02**: Player sees a warning when storage usage exceeds 80% of quota
- [ ] **STOR-03**: Player's existing save data auto-migrates from localStorage to IndexedDB on first load after update

### Root Magic & Elemental Affinity

- [ ] **MGIC-01**: Player can discover Arabic root-element mappings through NPC dialogue and exploration (50 roots across 10 elements)
- [ ] **MGIC-02**: Player can cast spells by selecting a discovered root — spell effect and damage scale with root mastery and FSRS vocabulary accuracy
- [ ] **MGIC-03**: Player has MP that depletes on spell cast and recovers between battles
- [ ] **MGIC-04**: Player can equip up to 6 spells in a hotbar for quick access during battle
- [ ] **MGIC-05**: Player can upgrade spells by learning higher verb forms (Form I-X) of the same root
- [ ] **MGIC-06**: Player discovers primary and secondary elemental affinity through 50+ weighted gameplay choices (dialogue, quests, exploration)
- [ ] **MGIC-07**: Player's primary affinity grants 2x spell power and secondary grants 1.5x for matching elements
- [ ] **MGIC-08**: Player can combine roots from different elements for combo effects (data-driven, 20 initial combos)
- [ ] **MGIC-09**: Player sees Arabic calligraphy particle VFX when casting spells (10 distinct element visuals)
- [ ] **MGIC-10**: Player's root mastery syncs bidirectionally with FSRS — learning words increments root XP, root mastery suggests derived words for review
- [ ] **MGIC-11**: Player can view a spell list UI with element filter, root letters, MP cost, and mastery level
- [ ] **MGIC-12**: Player's grammar accuracy (conjugation, declension) modifies spell effectiveness as a damage multiplier

### Equipment, Inventory & Economy

- [ ] **EQUP-01**: Player can equip items in 8 slots (head covering, robe, cloak, belt, boots, gloves, accessory 1, accessory 2)
- [ ] **EQUP-02**: Player can view stat comparisons when inspecting equipment vs currently equipped items
- [ ] **EQUP-03**: Player can manage a 200-item inventory with grid UI, sort by type/rarity/Arabic alphabetical order
- [ ] **EQUP-04**: Player sees items in 5 rarity tiers with Arabic color names (common/uncommon/rare/epic/legendary)
- [ ] **EQUP-05**: Player can buy and sell items at zone-specific shops with dynamic inventory based on player level and world state
- [ ] **EQUP-06**: Player can haggle with shopkeepers using Arabic numerals (0-9999) in a negotiation mini-game
- [ ] **EQUP-07**: Player's equipment bonuses only fully activate for Arabic affix words the player has learned (50% bonus if unlearned, 100% if learned)
- [ ] **EQUP-08**: Player automatically learns new Arabic vocabulary when discovering items with unknown affix words
- [ ] **EQUP-09**: Player can view item lore snippets with historical/cultural context for each equipment piece
- [ ] **EQUP-10**: Player can benefit from equipment set bonuses when wearing matching themed sets (Scholar's Set, Merchant's Set, etc.)
- [ ] **EQUP-11**: Player sees equipped items rendered on their character sprite in both WorldScene and BattleScene
- [ ] **EQUP-12**: Player's equipment stats (HP, MP, damage, defense bonuses) apply in battle calculations

### Companion System

- [ ] **COMP-01**: Player can recruit 12 companions across zones (at least 2 per major zone) through story/quest progression
- [ ] **COMP-02**: Player can form a party with max 2 active companions (1 for battle, 1 for exploration)
- [ ] **COMP-03**: Player's battle companion acts autonomously using role-based AI (healer, attacker, defender, support)
- [ ] **COMP-04**: Player can track relationship level (0-100) with each companion, affecting dialogue options and battle performance
- [ ] **COMP-05**: Player can give gifts to companions to increase relationship level
- [ ] **COMP-06**: Player's exploration companion follows them in the world and makes contextual Arabic comments about zones, objects, and events
- [ ] **COMP-07**: Each companion has a language teaching specialization (grammar, vocabulary, pronunciation, culture) that influences their dialogue
- [ ] **COMP-08**: Companion dialogue complexity adapts to player's Arabic proficiency level (more Arabic at higher CEFR levels)
- [ ] **COMP-09**: Player can swap active companions at any camp or rest point
- [ ] **COMP-10**: Each companion has 200+ unique dialogue lines with distinct personality, speech patterns, and Arabic catchphrases
- [ ] **COMP-11**: Companion sprites are faceless (Islamic art style) with distinctive silhouettes and flowing robes
- [ ] **COMP-12**: Player can view companion roster UI showing all recruited/unrecruited companions, relationship bars, and teaching specializations

### Integration & Architecture

- [ ] **INTG-01**: All new EventBus events use strict namespacing (react:magic:cast, phaser:companion:recruited) with no collisions against existing 35 events
- [ ] **INTG-02**: All existing 592 tests pass after each phase — no regressions in core game systems
- [ ] **INTG-03**: Build remains under 500KB main bundle after all v6.0 features
- [ ] **INTG-04**: New features respect prefers-reduced-motion for spell VFX, companion animations, and equipment effects
- [ ] **INTG-05**: All new overlays (MagicOverlay, InventoryUI, CompanionUI, ShopUI) use CSS Modules, focus traps, and ARIA labels
- [ ] **INTG-06**: Battle rewards (XP, gold, items) from Phase 27 engine wire into player progression and inventory systems

## Future Requirements (v6.1+)

### Crafting & Professions (Phase 31)

- **CRFT-01**: Player can learn 6 professions (Calligrapher, Cook, Blacksmith, Herbalist, Weaver, Builder) each teaching 50 domain-specific Arabic words
- **CRFT-02**: Player can discover recipes through exploration, NPC teaching, and experimentation
- **CRFT-03**: Player can craft items through profession-specific mini-games (calligraphy tracing, recipe following, rhythm games)
- **CRFT-04**: Crafted item quality scales with Arabic accuracy during crafting

### Advanced Combat (Phase 32)

- **ACBT-01**: Player can apply 20+ Arabic-named status effects in battle (each auto-added to FSRS queue)
- **ACBT-02**: Player can build grammar-based combos (noun+adjective, verb conjugation chains, sentence construction)
- **ACBT-03**: Player can fight multi-target battles (up to 4 enemies) with positioning system
- **ACBT-04**: Player can access weekly challenge arena and survival mode

### Companion Quests (Phase 47)

- **CQST-01**: Each companion has 3-5 personal quests (36-60 total companion quests)
- **CQST-02**: Companion quests require specific companions to be recruited and active
- **CQST-03**: Completing companion quests unlocks exclusive abilities and dialogue

## Out of Scope

| Feature | Reason |
|---------|--------|
| Romance options for companions | Cultural sensitivity (Islamic context), inappropriate for some age groups |
| Companion permadeath | Too punishing for educational game — defeat = temporary unavailability |
| Full party control (manual control all members) | Overwhelming for learners, slows combat — trust AI |
| Companion karma/evil paths | Binary morality inappropriate for nuanced cultural teaching |
| Loot boxes / gacha mechanics | Predatory, undermines educational trust |
| Real-money item shop | Pay-to-win, inappropriate for education |
| Weapon durability breakage | Tedious micromanagement — optional repair at blacksmith instead |
| Free-form spell creation | Balance nightmare, untestable — curated 50 canonical spells |
| Voice pronunciation casting | Infrastructure not ready — defer to future |
| Calligraphic tactile spell casting | High complexity — defer to v11.0 AAA polish |
| Companion idle chatter (companion-to-companion) | Needs NPC schedules — defer to Phase 47 |
| Arabic inscription system for crafted items | High validation complexity — defer to v11.0 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| STOR-01 | Phase 27.1 | Pending |
| STOR-02 | Phase 27.1 | Pending |
| STOR-03 | Phase 27.1 | Pending |
| MGIC-01 | Phase 28 | Pending |
| MGIC-02 | Phase 28 | Pending |
| MGIC-03 | Phase 28 | Pending |
| MGIC-04 | Phase 28 | Pending |
| MGIC-05 | Phase 28 | Pending |
| MGIC-06 | Phase 28 | Pending |
| MGIC-07 | Phase 28 | Pending |
| MGIC-08 | Phase 28 | Pending |
| MGIC-09 | Phase 28 | Pending |
| MGIC-10 | Phase 28 | Pending |
| MGIC-11 | Phase 28 | Pending |
| MGIC-12 | Phase 28 | Pending |
| EQUP-01 | Phase 29 | Pending |
| EQUP-02 | Phase 29 | Pending |
| EQUP-03 | Phase 29 | Pending |
| EQUP-04 | Phase 29 | Pending |
| EQUP-05 | Phase 29 | Pending |
| EQUP-06 | Phase 29 | Pending |
| EQUP-07 | Phase 29 | Pending |
| EQUP-08 | Phase 29 | Pending |
| EQUP-09 | Phase 29 | Pending |
| EQUP-10 | Phase 29 | Pending |
| EQUP-11 | Phase 29 | Pending |
| EQUP-12 | Phase 29 | Pending |
| COMP-01 | Phase 30 | Pending |
| COMP-02 | Phase 30 | Pending |
| COMP-03 | Phase 30 | Pending |
| COMP-04 | Phase 30 | Pending |
| COMP-05 | Phase 30 | Pending |
| COMP-06 | Phase 30 | Pending |
| COMP-07 | Phase 30 | Pending |
| COMP-08 | Phase 30 | Pending |
| COMP-09 | Phase 30 | Pending |
| COMP-10 | Phase 30 | Pending |
| COMP-11 | Phase 30 | Pending |
| COMP-12 | Phase 30 | Pending |
| INTG-01 | Phase 28 | Pending |
| INTG-02 | Phase 30 | Pending |
| INTG-03 | Phase 29 | Pending |
| INTG-04 | Phase 29 | Pending |
| INTG-05 | Phase 29 | Pending |
| INTG-06 | Phase 29 | Pending |

**Coverage:**
- v6.0 requirements: 45 total
- Mapped to phases: 45/45 (100%)
- Unmapped: 0

**Distribution:**
- Phase 27.1 (Storage): 3 requirements
- Phase 28 (Magic): 13 requirements (12 MGIC + 1 INTG)
- Phase 29 (Equipment): 16 requirements (12 EQUP + 4 INTG)
- Phase 30 (Companions): 13 requirements (12 COMP + 1 INTG)

---
*Requirements defined: 2026-02-12*
*Last updated: 2026-02-12 — traceability complete, 100% coverage*
