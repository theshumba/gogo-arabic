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
- [ ] **CEFR-03**: CEFR progress report shows level advancement over time with radar chart visualization (recharts)
- [ ] **CEFR-04**: Player can retake placement test from settings with warning that it resets CEFR tracking

### Achievements

- [x] **ACH-01**: Achievement system expanded from 44 to 250+ achievements across 15 categories
- [x] **ACH-02**: Achievements use 4-tier system (Bronze/Silver/Gold/Legendary) with increasing difficulty thresholds
- [ ] **ACH-03**: Shareable social card ("I learned X Arabic words in Gogo Arabic") generated as PNG for sharing
- [x] **ACH-04**: Achievement progress visible in a dedicated Achievements panel with category filtering and tier display

## v13.0 Requirements (Deferred)

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
| TTS/audio quiz types | No TTS infrastructure — defer to v13.0 |
| Real-time multiplayer | High complexity, single-player focus |
| ML-based adaptive algorithms | FSRS retrievability is sufficient signal |
| Dialect switching | Confuses learners, exponential content |
| Procedural grammar generation | Educational content needs curation |
| D3.js skill tree graphs | CSS flexbox layout sufficient for linear-branching trees |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FIX-01 | Phase 56 | Pending |
| FIX-02 | Phase 56 | Pending |
| SKILL-01 | Phase 57 | Pending |
| SKILL-02 | Phase 57 | Pending |
| SKILL-03 | Phase 57 | Pending |
| SKILL-04 | Phase 57 | Pending |
| GRAM-02 | Phase 58 | Pending |
| GRAM-04 | Phase 58 | Pending |
| QUIZ-02 | Phase 59 | Pending |
| QUIZ-03 | Phase 59 | Pending |
| QUIZ-01 | Phase 60 | Pending |
| CEFR-01 | Phase 61 | Pending |
| CEFR-02 | Phase 61 | Pending |
| CEFR-04 | Phase 61 | Pending |
| GRAM-01 | Phase 62 | Pending |
| GRAM-03 | Phase 62 | Pending |
| ACH-01 | Phase 63 | Complete |
| ACH-02 | Phase 63 | Complete |
| ACH-04 | Phase 63 | Complete |
| CEFR-03 | Phase 64 | Pending |
| ACH-03 | Phase 64 | Pending |

**Coverage:**
- v12.0 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0

---
*Requirements defined: 2026-03-22*
*Last updated: 2026-03-22 — traceability complete, all 21 requirements mapped to Phases 56-64*
