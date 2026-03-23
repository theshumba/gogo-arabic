---
phase: 64
slug: cefr-reports-social-sharing
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 64 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.js (existing) |
| **Quick run command** | `npx vitest run src/store/slices/__tests__/cefrProgressSlice.test.js` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~25 seconds |

---

## Sampling Rate

- **After cefrProgressSlice changes:** Run cefrProgressSlice.test.js
- **After vite.config.js changes:** Run `npx vite build --mode development 2>&1 | grep charts`
- **Before submit:** `npx vitest run` (full suite green)
- **Max feedback latency:** 25 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 64-01-01 | 01 | 1 | CEFR-03 | unit | `npx vitest run src/store/slices/__tests__/cefrProgressSlice.test.js` | ❌ W0 | ⬜ pending |
| 64-03-01 | 03 | 2 | ACH-03 | manual | Browser test: navigator.share / clipboard | N/A | ⬜ pending |

---

## Wave 0 Requirements

- [ ] `src/store/slices/__tests__/cefrProgressSlice.test.js` — create with recordCefrSnapshot, no-regression, same-day idempotency tests

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| RadarChart + LineChart render in browser | CEFR-03 | Canvas/SVG rendering | 1. npm run dev 2. Complete placement 3. Open CEFR Report 4. Verify both charts visible |
| Level never goes backwards visually | CEFR-03 | Visual timeline check | 1. Record A1 snapshot 2. Advance to A2 3. Verify line only goes up |
| Social card share via Web Share API | ACH-03 | Browser API | 1. Open share card 2. Click Share 3. Verify native share sheet opens |
| Clipboard fallback when share unavailable | ACH-03 | Browser API | 1. Open in Firefox (no navigator.share) 2. Click Copy 3. Verify clipboard contains text |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 25s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
