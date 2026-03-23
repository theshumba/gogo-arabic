---
phase: 61
slug: cefr-placement-test
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 61 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.js (existing) |
| **Quick run command** | `npx vitest run src/services/__tests__/placementEngine.test.js src/data/__tests__/placementTest.test.js` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~25 seconds |

---

## Sampling Rate

- **After each placementEngine change:** Run placementEngine.test.js
- **After each placement data change:** Run placementTest.test.js
- **After Redux fan-out changes:** Run grammarSlice.test.js + placementEngine.test.js
- **Before submit:** `npx vitest run` (full suite green)
- **Max feedback latency:** 25 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 61-01-01 | 01 | 1 | CEFR-01 | unit | `npx vitest run src/data/__tests__/placementTest.test.js src/services/__tests__/placementEngine.test.js` | ❌ W0 | ⬜ pending |
| 61-02-01 | 02 | 2 | CEFR-01 | integration | `npx vitest run src/components/Placement/__tests__/PlacementTestOverlay.test.jsx` | ❌ W0 | ⬜ pending |
| 61-03-01 | 03 | 2 | CEFR-02, CEFR-04 | unit+integration | `npx vitest run src/services/__tests__/placementEngine.test.js src/store/__tests__/grammarSlice.test.js` | Extend | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/data/__tests__/placementTest.test.js` — item bank coverage, CEFR distribution, domain spread
- [ ] `src/services/__tests__/placementEngine.test.js` — assignCefrLevel, dropOneTier, deriveGrammarUnlocks, deriveSkillTreeUnlocks
- [ ] `src/components/Placement/__tests__/PlacementTestOverlay.test.jsx` — render conditions, completion flow
- [ ] `src/store/__tests__/grammarSlice.test.js` — extend with bulkUnlockLessons tests

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Placement test offered on first launch | CEFR-01 | Requires fresh game state in browser | 1. Clear localStorage 2. npm run dev 3. Create character 4. Confirm placement overlay appears |
| "Start Lower" button drops level | CEFR-01 | UI interaction flow | 1. Complete placement 2. Click "Start Lower" 3. Confirm assigned level drops one tier |
| Settings retake with warning | CEFR-04 | Navigation + dialog flow | 1. Open Settings 2. Click "Retake Placement" 3. Confirm warning dialog appears |
| A2 placement pre-unlocks A2 grammar | CEFR-02 | State verification in browser | 1. Complete placement at A2 2. Open Grammar 3. Confirm A2 lessons unlocked |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 25s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
