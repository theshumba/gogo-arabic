---
phase: 60
slug: quiz-expansion-core-3-types
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-22
---

# Phase 60 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.js (existing) |
| **Quick run command** | `npx vitest run src/data/__tests__/quizTypes.test.js src/components/Quiz/__tests__/` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~25 seconds |

---

## Sampling Rate

- **After each new component:** Run component test file + quizTypes.test.js
- **After useQuiz.js changes:** Run `npx vitest run src/hooks/__tests__/`
- **Before submit:** `npx vitest run` (full suite green)
- **Max feedback latency:** 25 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 60-01-01 | 01 | 1 | QUIZ-01 | unit+integration | `npx vitest run src/components/Quiz/__tests__/GrammarFill.test.jsx src/data/__tests__/quizTypes.test.js` | ❌ W0 | ⬜ pending |
| 60-02-01 | 02 | 1 | QUIZ-01 | unit+integration | `npx vitest run src/components/Quiz/__tests__/WordOrder.test.jsx src/data/__tests__/quizTypes.test.js` | ❌ W0 | ⬜ pending |
| 60-03-01 | 03 | 2 | QUIZ-01 | unit+integration | `npx vitest run src/components/Quiz/__tests__/ClozePassage.test.jsx src/data/__tests__/quizTypes.test.js` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/Quiz/__tests__/GrammarFill.test.jsx` — render, choice buttons, onAnswer, feedback
- [ ] `src/components/Quiz/__tests__/WordOrder.test.jsx` — tile bank, drag placement, submit, tile return
- [ ] `src/components/Quiz/__tests__/ClozePassage.test.jsx` — passage display, blanks, choices, fallback
- [ ] `src/data/__tests__/quizTypes.test.js` — update existing Phase 60 minLevel:999 test to real values + deferred stubs cefrMin:'B2'

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| GrammarFill verb paradigm display renders correctly in Arabic | QUIZ-01 | RTL layout + Arabic font rendering | 1. npm run dev 2. Set CEFR to A2 3. Play quiz until GrammarFill appears 4. Verify verb root + pronoun display |
| WordOrder drag-and-drop feels responsive | QUIZ-01 | Touch/mouse interaction quality | 1. Play WordOrder quiz 2. Click tiles to place/remove 3. Verify no lag or misplacement |
| ClozePassage paragraph reads naturally in Arabic | QUIZ-01 | Arabic text quality assessment | 1. Play ClozePassage quiz 2. Read paragraph 3. Verify blanks are in logical positions |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 25s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
