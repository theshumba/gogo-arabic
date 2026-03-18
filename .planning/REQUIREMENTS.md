# Requirements: GoGo Arabic v9.0

**Defined:** 2026-03-18
**Core Value:** Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world — never wondering "what should I do next?" or "how do I practice?"

## v9.0 Requirements

### NPC Dialogue (Tier 4A)

- [ ] **DIAL-01**: All 23 main NPCs have rewritten dialogue trees with distinct personality, humor, and cultural depth
- [ ] **DIAL-02**: Each key NPC teaches unique Arabic culture/history sourced from real historical records (Islamic Golden Age, Silk Road, House of Wisdom, etc.)
- [ ] **DIAL-03**: 500+ new dialogue lines added across all NPCs (currently ~1,043 — target 1,543+)
- [ ] **DIAL-04**: Cultural notes appear when vocabulary is learned, showing Arabic loanwords in English and historical context
- [ ] **DIAL-05**: NPC dialogue includes teachWord fields that integrate with FSRS vocabulary system

### Quest Storylines (Tier 4B)

- [ ] **QUEST-01**: 8-act main storyline following a time-traveling scholar collecting manuscript pages across all zones
- [ ] **QUEST-02**: Each zone has at least 2 side quests with Arabic learning tied to narrative (not just "learn X words")
- [ ] **QUEST-03**: Companion personal quests that deepen NPC relationships and teach zone-specific vocabulary
- [ ] **QUEST-04**: Discovery quests — find hidden Arabic inscriptions in the world that teach root families
- [ ] **QUEST-05**: Quest dialogues branch based on player's learningPath (Scholar/Traveler/Historian) choice

### Vocabulary Expansion (Tier 4C)

- [ ] **VOCAB-01**: Vocabulary expanded from 1,220 to 5,000+ words in vocabularyAll.js
- [ ] **VOCAB-02**: Every word tagged with CEFR level: A1 (500 words), A2 (1,000), B1 (2,000), B2 (1,500)
- [ ] **VOCAB-03**: Words organized by root family groupings (trilateral roots like ك-ت-ب → كتاب، كاتب، مكتوب، مكتبة)
- [ ] **VOCAB-04**: Words organized by semantic clusters (food, family, travel, nature, body, colors, numbers, etc.)
- [ ] **VOCAB-05**: Frequency-based ordering within each CEFR level (most common words taught first)
- [ ] **VOCAB-06**: Each new word has: arabic, english, transliteration, root, category, cefrLevel, frequency fields

## Future Requirements

### Sound & Atmosphere (Tier 2 — deferred, needs audio files)

- **SND-01**: 8 unique ambient loops (one per zone biome)
- **SND-02**: UI sounds (panel open/close, button click, text typewriter tick)
- **SND-03**: Arabic-specific SFX (correct answer ding, vocabulary learned flourish)

### Learning Systems (Tier 5 — future milestone)

- **LEARN-01**: 6 visual skill trees (Reading, Writing, Listening, Conversation, Grammar, Culture)
- **LEARN-02**: Grammar expansion from 7 to 50 lessons (A1-B2)
- **LEARN-03**: 18 quiz types with adaptive difficulty engine
- **LEARN-04**: 250+ achievements across all categories

## Out of Scope

| Feature | Reason |
|---------|--------|
| Dialect switching | Confuses learners, exponential content |
| Voice recognition | Complex ML, accuracy issues |
| Multiplayer | Single-player focus |
| Mobile native app | Web-first |
| Procedural quests | Educational content needs curation |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DIAL-01 | Phase 44 | Pending |
| DIAL-02 | Phase 44 | Pending |
| DIAL-03 | Phase 44 | Pending |
| DIAL-04 | Phase 44 | Pending |
| DIAL-05 | Phase 44 | Pending |
| QUEST-01 | Phase 45 | Pending |
| QUEST-02 | Phase 45 | Pending |
| QUEST-03 | Phase 45 | Pending |
| QUEST-04 | Phase 45 | Pending |
| QUEST-05 | Phase 45 | Pending |
| VOCAB-01 | Phase 46 | Pending |
| VOCAB-02 | Phase 46 | Pending |
| VOCAB-03 | Phase 46 | Pending |
| VOCAB-04 | Phase 46 | Pending |
| VOCAB-05 | Phase 46 | Pending |
| VOCAB-06 | Phase 46 | Pending |

**Coverage:**
- v9.0 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-18*
*Last updated: 2026-03-18 after v9.0 milestone start*
