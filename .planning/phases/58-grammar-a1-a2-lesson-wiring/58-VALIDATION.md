---
phase: 58
slug: grammar-a1-a2-lesson-wiring
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-22
---

# Phase 58 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.js (existing) |
| **Quick run command** | `npx vitest run src/data/__tests__/grammarChecker.test.js src/store/__tests__/grammarSlice.test.js src/store/middleware/__tests__/learningProgressMiddleware.test.js` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every grammar.js batch:** Run grammarChecker tests
- **After grammarSlice change:** Run grammarSlice.test.js
- **After middleware change:** Run learningProgressMiddleware.test.js
- **Before submit:** `npx vitest run` (full suite green)
- **Max feedback latency:** 20 seconds
- **No 3 consecutive tasks without automated verify**

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 58-01-01 | 01 | 1 | GRAM-02 | unit | `npx vitest run src/data/__tests__/grammarChecker.test.js` | ❌ W0 | ⬜ pending |
| 58-02-01 | 02 | 2 | GRAM-04 | unit | `npx vitest run src/store/__tests__/grammarSlice.test.js` | Extend | ⬜ pending |
| 58-02-02 | 02 | 2 | GRAM-04 | integration | `npx vitest run src/store/middleware/__tests__/learningProgressMiddleware.test.js` | Extend | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/data/__tests__/grammarChecker.test.js` — create with exercise count/type validation (GRAM-02)
- [ ] `src/store/__tests__/grammarSlice.test.js` — extend with unlockedLessons + unlockNextLesson tests (GRAM-04)
- [ ] `src/store/middleware/__tests__/learningProgressMiddleware.test.js` — extend with auto-unlock integration test (GRAM-04)

*Existing infrastructure covers framework (vitest already configured).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Grammar XP bar in SkillTreeView advances after lesson | GRAM-04 | Browser rendering | 1. npm run dev 2. Complete grammar lesson 3. Open Skill Tree Grammar tab 4. Confirm XP bar advanced |
| Locked badge on unstarted lessons | GRAM-04 | React DOM visual | 1. Open Grammar section 2. Confirm first lesson "New", second "Locked" |
| Completing lesson 1 unlocks lesson 2 | GRAM-04 | State change visual | 1. Complete al-definite 2. Confirm next lesson shows "New" |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
