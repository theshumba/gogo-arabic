# Requirements: GoGo Arabic v10.0 Onboarding & First 5 Minutes

**Defined:** 2026-03-19
**Core Value:** Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world — never wondering "what should I do next?" or "how do I practice?"

## v10.0 Requirements

### Cinematic Intro

- [ ] **INTRO-01**: Player sees a 5-second text crawl after loading screen: "A young scholar discovers an ancient manuscript..."
- [ ] **INTRO-02**: Camera fades into Oasis Village at dawn, slowly panning to player character
- [ ] **INTRO-03**: First floating Arabic word appears in the world (glowing, interactive)
- [ ] **INTRO-04**: Player walks to the word, touches it, learns first word with reward animation
- [ ] **INTRO-05**: Guide Amira appears, speaks one line, gives first quest

### Learning Path

- [ ] **PATH-01**: After first word learned, Guide Amira asks "What draws you to Arabic?"
- [ ] **PATH-02**: Player picks one of three focus paths: Scholar (القارئ), Traveler (المسافر), Historian (المؤرخ)
- [ ] **PATH-03**: Path choice affects vocabulary ordering, NPC relationship bonuses, quest recommendations, and mentor assignment
- [ ] **PATH-04**: All paths teach the same Fusha (MSA) — difference is which words come first and which NPCs are highlighted
- [ ] **PATH-05**: Player can switch paths later (loses priority bonuses)

### First Quest

- [ ] **QUEST-01**: First quest: "Learn 3 Arabic words from objects in the village" — words float above pots, signs, buildings
- [ ] **QUEST-02**: Each word teaches with visual + Arabic + transliteration + audio
- [ ] **QUEST-03**: After 3 words: gold coin reward, achievement toast, "You know 3 Arabic words!"
- [ ] **QUEST-04**: Based on path choice: different first real quest and mentor NPC assigned
- [ ] **QUEST-05**: Player has learned the core loop in under 2 minutes without a single tutorial popup

### Onboarding UX

- [ ] **UX-01**: No menus, settings, or explanation screens during onboarding — pure discovery
- [ ] **UX-02**: Existing onboarding tutorial (6 steps) is bypassed/replaced by this cinematic flow
- [ ] **UX-03**: Onboarding state persisted so returning players skip it

## Future Requirements

- Path of the Polymath (المتعلم) — 4th learning path combining all three focuses (noted in .continue-here.md)
- Gradual HUD reveal during onboarding (Tier 8 AAA polish)
- Diagnostic assessment at game start to place players at right level (Tier 5)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Dialect selection during onboarding | All paths teach Fusha only — dialects excluded project-wide |
| Character creation/customization | Wardrobe system already exists, keep onboarding focused |
| Difficulty selection during onboarding | Defer to Tier 5 learning systems |
| Voice narration for intro | No audio infrastructure for voice, cultural constraint on music |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INTRO-01 | Phase 47 | Pending |
| INTRO-02 | Phase 47 | Pending |
| INTRO-03 | Phase 47 | Pending |
| INTRO-04 | Phase 47 | Pending |
| INTRO-05 | Phase 47 | Pending |
| UX-01 | Phase 47 | Pending |
| UX-02 | Phase 47 | Pending |
| PATH-01 | Phase 48 | Pending |
| PATH-02 | Phase 48 | Pending |
| PATH-03 | Phase 48 | Pending |
| PATH-04 | Phase 48 | Pending |
| PATH-05 | Phase 48 | Pending |
| QUEST-01 | Phase 49 | Pending |
| QUEST-02 | Phase 49 | Pending |
| QUEST-03 | Phase 49 | Pending |
| QUEST-04 | Phase 49 | Pending |
| QUEST-05 | Phase 49 | Pending |
| UX-03 | Phase 49 | Pending |

**Coverage:**
- v10.0 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0

---
*Requirements defined: 2026-03-19*
*Last updated: 2026-03-19 — all 18 requirements mapped to Phases 47-49*
