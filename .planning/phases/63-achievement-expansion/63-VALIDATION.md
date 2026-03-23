---
phase: 63
slug: achievement-expansion
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 63 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x |
| **Config file** | jest.config.cjs |
| **Quick run command** | `npx jest --testPathPattern=achievement --bail` |
| **Full suite command** | `npx jest` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern=achievement --bail`
- **After every plan wave:** Run `npx jest`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 63-01-01 | 01 | 1 | ACH-01, ACH-02 | unit | `npx jest --testPathPattern=achievements` | ✅ | ⬜ pending |
| 63-02-01 | 02 | 1 | ACH-01 | unit | `npx jest --testPathPattern=achievementMiddleware` | ✅ | ⬜ pending |
| 63-03-01 | 03 | 2 | ACH-04 | unit | `npx jest --testPathPattern=AchievementPanel` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Tier badge renders visually correct | ACH-02 | Visual appearance | Open AchievementPanel, verify Bronze/Silver/Gold/Legendary badges show distinct colors |
| Category filter tabs UX | ACH-04 | Interaction flow | Click each category tab, verify filtered list updates |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 45s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
