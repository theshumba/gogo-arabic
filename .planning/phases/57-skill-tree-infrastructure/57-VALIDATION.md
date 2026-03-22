---
phase: 57
slug: skill-tree-infrastructure
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-22
---

# Phase 57 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.js (existing) |
| **Quick run command** | `npx vitest run src/store/middleware/__tests__/learningProgressMiddleware.test.js src/data/__tests__/initializeSkillTree.test.js src/data/__tests__/skillTreeRewards.test.js` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick run command (phase-specific tests)
- **After every plan wave:** Run `npx vitest run` (full suite)
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 57-01-01 | 01 | 1 | SKILL-01 | integration | `npx vitest run src/store/middleware/__tests__/learningProgressMiddleware.test.js` | ❌ W0 | ⬜ pending |
| 57-01-02 | 01 | 1 | SKILL-02 | unit | `npx vitest run src/data/__tests__/initializeSkillTree.test.js` | ❌ W0 | ⬜ pending |
| 57-02-01 | 02 | 2 | SKILL-03 | unit | `npx vitest run src/data/__tests__/skillTreeRewards.test.js` | ❌ W0 | ⬜ pending |
| 57-03-01 | 03 | 3 | SKILL-04 | manual | `grep -n "frontier\|nextNode\|progressBar\|xpProgress" src/components/Skills/SkillTreeView.jsx` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/store/middleware/__tests__/learningProgressMiddleware.test.js` — extend with XP routing tests (SKILL-01)
- [ ] `src/data/__tests__/initializeSkillTree.test.js` — create with migration/init tests (SKILL-02)
- [ ] `src/data/__tests__/skillTreeRewards.test.js` — create with reward type + ActionSetExecutor tests (SKILL-03)

*Existing infrastructure covers framework (vitest already configured).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| SkillTreeView XP bars visually advance | SKILL-04 | Requires browser rendering | 1. `npm run dev` 2. Open SkillTreeView 3. Dispatch `addSkillXP` in Redux DevTools 4. Confirm XP bar moves |
| Next-node highlights and collapsed locked nodes | SKILL-04 | Visual styling verification | 1. Navigate to skill tree tab 2. Confirm frontier node highlighted 3. Confirm deeply locked nodes show collapsed summary |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
