---
phase: 56
slug: bug-fixes-redux-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-22
---

# Phase 56 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.js (existing) |
| **Quick run command** | `npx vitest run src/store/middleware/__tests__/achievementMiddleware.test.js src/store/__tests__/migrations.test.js src/store/__tests__/newSlicesRegistration.test.js src/store/middleware/__tests__/learningProgressMiddleware.test.js` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick run command (phase-specific tests)
- **After every plan wave:** Run `npx vitest run` (full suite)
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 56-01-01 | 01 | 1 | FIX-01 | integration | `npx vitest run src/store/middleware/__tests__/achievementMiddleware.test.js` | ❌ W0 | ⬜ pending |
| 56-01-02 | 01 | 1 | FIX-02 | unit | `npx vitest run src/store/__tests__/migrations.test.js` | ❌ W0 | ⬜ pending |
| 56-02-01 | 02 | 1 | FIX-02 | integration | `npx vitest run src/store/__tests__/newSlicesRegistration.test.js` | ❌ W0 | ⬜ pending |
| 56-02-02 | 02 | 1 | FIX-02 | unit | `npx vitest run src/store/middleware/__tests__/learningProgressMiddleware.test.js` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/store/middleware/__tests__/achievementMiddleware.test.js` — extend with grammar_lessons test suite (FIX-01)
- [ ] `src/store/__tests__/migrations.test.js` — create with v11 migration tests (FIX-02)
- [ ] `src/store/__tests__/newSlicesRegistration.test.js` — create with placementSlice + cefrProgressSlice tests
- [ ] `src/store/middleware/__tests__/learningProgressMiddleware.test.js` — create with scaffold smoke tests

*Existing infrastructure covers framework (vitest already configured).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Achievement toast appears in game session | FIX-01 | Requires running game in browser with Phaser | 1. Load game 2. Open DevTools Redux tab 3. Dispatch grammar/completeLesson 4. Check achievements.unlockedAchievements |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
