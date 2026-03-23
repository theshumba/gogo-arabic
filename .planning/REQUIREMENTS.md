# Requirements: GoGo Arabic v12.0 — Learning Systems

**Defined:** 2026-03-22
**Core Value:** Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world

## v12.0 Requirements

### Bug Fixes & Migration

- [ ] **FIX-01**: Grammar achievement middleware mapping wired — completing a grammar lesson fires achievement checks
- [ ] **FIX-02**: Grammar lesson IDs migrated from numeric indices to string slugs with backward-compatible migration

### Skill Trees

- [ ] **SKILL-01**: Gameplay events (quest completion, grammar lesson, quiz, vocabulary review, calligraphy, poetry battle) award XP to the appropriate skill tree
- [ ] **SKILL-02**: Existing players' skill trees auto-initialize with nodes unlocked matching their current FSRS mastery, quest progress, and grammar completion
- [ ] **SKILL-03**: Skill tree node rewards gate content — unlocking a node can reveal new spells, companion options, zone access, or NPC dialogue
- [ ] **SKILL-04**: Skill tree UI shows XP progress per tree with unlockable node visualization

### Grammar Expansion

- [ ] **GRAM-01**: Grammar system expanded from 47 to 50 lessons covering A1 through B2 CEFR levels
- [ ] **GRAM-02**: Each grammar lesson has 12 exercise types with Arabic examples, not just fill-in-blank
- [ ] **GRAM-03**: Grammar lessons are gated by skill tree progression — B1 lessons require Grammar tree level 3, B2 requires level 5
- [ ] **GRAM-04**: Completing a grammar lesson awards Grammar skill tree XP and unlocks the next lesson

### Quiz Expansion

- [ ] **QUIZ-01**: Quiz system expanded from 12 to 18 types including GrammarFill, ClozePassage, WordOrder, DialectIdentify, RootExpand, CulturalContext
- [ ] **QUIZ-02**: Adaptive difficulty engine selects quiz difficulty based on FSRS retrievability — targets 70-85% success rate
- [ ] **QUIZ-03**: Quiz format (not just word selection) adapts to player weakness — more grammar quizzes for grammar-weak players

### CEFR Assessment

- [ ] **CEFR-01**: Diagnostic placement test (15-20 CAT questions) assigns starting CEFR level on first play — defaults one level lower than raw score
- [ ] **CEFR-02**: Placement test result pre-unlocks appropriate skill tree nodes and grammar lessons
- [x] **CEFR-03**: CEFR progress report shows level advancement over time with radar chart visualization (recharts)
- [ ] **CEFR-04**: Player can retake placement test from settings with warning that it resets CEFR tracking

### Achievements

- [x] **ACH-01**: Achievement system expanded from 44 to 250+ achievements across 15 categories
- [x] **ACH-02**: Achievements use 4-tier system (Bronze/Silver/Gold/Legendary) with increasing difficulty thresholds
- [x] **ACH-03**: Shareable social card ("I learned X Arabic words in Gogo Arabic") via SVG card + Web Share API / clipboard fallback (SVG-only, no external image dependencies)
- [x] **ACH-04**: Achievement progress visible in a dedicated Achievements panel with category filtering and tier display

## v12.0 Traceability (SHIPPED 2026-03-23)

| Requirement | Phase | Status |
|-------------|-------|--------|
| FIX-01 | Phase 56 | Complete |
| FIX-02 | Phase 56 | Complete |
| SKILL-01 | Phase 57 | Complete |
| SKILL-02 | Phase 57 | Complete |
| SKILL-03 | Phase 57 | Complete |
| SKILL-04 | Phase 57 | Complete |
| GRAM-02 | Phase 58 | Complete |
| GRAM-04 | Phase 58 | Complete |
| QUIZ-02 | Phase 59 | Complete |
| QUIZ-03 | Phase 59 | Complete |
| QUIZ-01 | Phase 60 | Complete |
| CEFR-01 | Phase 61 | Complete |
| CEFR-02 | Phase 61 | Complete |
| CEFR-04 | Phase 61 | Complete |
| GRAM-01 | Phase 62 | Complete |
| GRAM-03 | Phase 62 | Complete |
| ACH-01 | Phase 63 | Complete |
| ACH-02 | Phase 63 | Complete |
| ACH-04 | Phase 63 | Complete |
| CEFR-03 | Phase 64 | Complete |
| ACH-03 | Phase 64 | Complete |

---

## v13.0 Requirements — Systems Polish & Immersion

### Performance
- [ ] **PERF-01**: GameLayout chunk split from 1.2MB to under 500KB via dynamic imports for overlay components
- [ ] **PERF-02**: vocabulary-data chunk split from 1.7MB via zone-based vocabulary loading or binary format
- [ ] **PERF-03**: npc-data chunk reduced from 577KB via lazy NPC dialogue loading per zone
- [ ] **PERF-04**: CSS Modules migration for remaining inline-styled components (consistent styling approach)

### Systems Wiring
- [ ] **WIRE-01**: Quiz completion events feed into daily goals middleware — completing a quiz session updates daily goal progress
- [ ] **WIRE-02**: Zone-entry micro-reviews — entering a new zone triggers 2-3 FSRS-due word reviews inline
- [ ] **WIRE-03**: Progressive tashkeel fading — Arabic vowel marks (diacritics) fade based on FSRS mastery per word
- [ ] **WIRE-04**: NPC quest indicators (!/? markers) visible above NPC heads in Phaser world view

### Quiz Completion
- [ ] **QUIZ-04**: DialectIdentify quiz type — player identifies which Arabic dialect a phrase belongs to (B2, cefrMin:'B2')
- [ ] **QUIZ-05**: RootExpand quiz type — given a trilateral root, player selects all derived words (B2, cefrMin:'B2')
- [ ] **QUIZ-06**: CulturalContext quiz type — player matches Arabic expressions to cultural contexts (B2, cefrMin:'B2')

### Immersion
- [ ] **IMM-01**: In-dialogue comprehension checks — NPCs quiz player mid-conversation ("What did I just say?")
- [ ] **IMM-02**: Welcome back experience — returning players see last session summary + FSRS due count + suggested activity
- [ ] **IMM-03**: Environmental Arabic labels — floating Arabic text above world objects (tree = شجرة) teaches vocabulary passively
- [ ] **IMM-04**: Anonymous quiz statistics — "72% of players get this right" shown on quiz questions (localStorage-based accumulator)

### Testing
- [ ] **TEST-01**: Integration tests for battle system (~2.6K LOC untested)
- [ ] **TEST-02**: Integration tests for grammar overlay flow (lesson → exercises → quiz → completion)
- [ ] **TEST-03**: Integration tests for quest system (accept → objectives → complete → reward)

## v14.0 Requirements (Deferred)

### Narrative & Social
- **NAR-01**: Divergent experience engine with faction-gated content paths
- **NAR-02**: Daily/weekly rotating events with unique vocabulary
- **NAR-03**: Gift + relationship system (100+ gifts)
- **NAR-04**: Lore codex (300+ entries)

### Audio Quiz Types
- **AUD-01**: Listening comprehension quiz type (requires TTS infrastructure)
- **AUD-02**: Dictation quiz type (requires TTS infrastructure)

## Out of Scope

| Feature | Reason |
|---------|--------|
| TTS/audio quiz types | No TTS infrastructure — defer to v14.0 |
| Real-time multiplayer | High complexity, single-player focus |
| ML-based adaptive algorithms | FSRS retrievability is sufficient signal |
| Dialect switching | Confuses learners, exponential content |
| Procedural grammar generation | Educational content needs curation |
| D3.js skill tree graphs | CSS flexbox layout sufficient for linear-branching trees |

## v13.0 Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PERF-01 | Phase 65 | Pending |
| PERF-02 | Phase 65 | Pending |
| PERF-03 | Phase 65 | Pending |
| PERF-04 | Phase 66 | Pending |
| WIRE-01 | Phase 67 | Pending |
| WIRE-02 | Phase 67 | Pending |
| WIRE-03 | Phase 67 | Pending |
| WIRE-04 | Phase 67 | Pending |
| QUIZ-04 | Phase 68 | Pending |
| QUIZ-05 | Phase 68 | Pending |
| QUIZ-06 | Phase 68 | Pending |
| IMM-01 | Phase 69 | Pending |
| IMM-02 | Phase 69 | Pending |
| IMM-03 | Phase 70 | Pending |
| IMM-04 | Phase 70 | Pending |
| TEST-01 | Phase 71 | Pending |
| TEST-02 | Phase 71 | Pending |
| TEST-03 | Phase 71 | Pending |

**Coverage:**
- v13.0 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0

---
*Requirements defined: 2026-03-22*
*Last updated: 2026-03-23 — v12.0 complete, v13.0 requirements defined with 18 requirements across 7 phases (65-71)*
