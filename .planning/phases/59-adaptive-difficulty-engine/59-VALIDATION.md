---
phase: 59
slug: adaptive-difficulty-engine
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-22
---

# Phase 59 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.js (existing) |
| **Quick run command** | `npx vitest run src/hooks/__tests__/useQuiz.adaptive.test.js src/data/__tests__/quizTypes.test.js` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~25 seconds |

---

## Sampling Rate

- **After every useQuiz.js change:** Run `npx vitest run src/hooks/__tests__/`
- **After creating quizTypes.js:** Run `npx vitest run src/data/__tests__/quizTypes.test.js`
- **Before submit:** `npx vitest run` (full suite green)
- **Max feedback latency:** 25 seconds
- **No 3 consecutive tasks without automated verify**

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 59-01-01 | 01 | 1 | QUIZ-02 | unit | `npx vitest run src/hooks/__tests__/useQuiz.adaptive.test.js` | ❌ W0 | ⬜ pending |
| 59-02-01 | 02 | 2 | QUIZ-03 | unit | `npx vitest run src/data/__tests__/quizTypes.test.js` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/hooks/__tests__/useQuiz.adaptive.test.js` — create with isFsrsDue, getDistractorTier, pickDistractors tests (QUIZ-02)
- [ ] `src/data/__tests__/quizTypes.test.js` — create with QUIZ_TYPE_REGISTRY + selectQuizTypeForPlayer tests (QUIZ-03)

*Existing infrastructure covers framework (vitest already configured).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Grammar-weak routing visible in extended session | QUIZ-03 | Requires playing 10+ questions with intentional failures | 1. npm run dev 2. Open quiz 3. Answer grammar wrong 4. Count grammar types in next 5 questions |
| Distractor plausibility increases after streak | QUIZ-02 | Requires subjective Arabic knowledge | 1. Answer 10+ correctly 2. Observe wrong answers become same-category |
| FSRS-due cards appear even at easy tier | QUIZ-02 | Requires seeding overdue card | 1. Set card due to past 2. Answer wrong to trigger easy 3. Confirm due card appears |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 25s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
