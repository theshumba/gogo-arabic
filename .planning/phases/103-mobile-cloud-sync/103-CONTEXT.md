# Phase 103: Mobile & Cloud Sync - Context

**Gathered:** 2026-05-26
**Status:** CONTEXT stub — NOT yet planned. Run `/gsd-plan-phase 103` when ready.
**Source:** Orchestrator-captured from v17.5 Platform Foundation milestone brief

<domain>
## Phase Boundary

Make Gogo Arabic playable on phones and survive device swaps. Add a touch input layer (virtual joystick + tap-to-interact), a responsive viewport that scales the Phaser canvas without distorting tile pixels, and a cloud sync layer that backs up the existing Phase 27.1 IndexedDB save to the existing `server/` so a learner can pick up on a new device.

This is the second phase of v17.5 Platform Foundation. It introduces new user-facing surfaces (touch controls, account-link UI) but does not change game logic, learning loop, or curriculum.

</domain>

<decisions>
## Implementation Decisions (locked at stub time)

### Scope
- **In scope:**
  - Touch input layer: virtual joystick on left half of screen, action button(s) on right half, tap-to-interact on world objects/NPCs.
  - Responsive viewport: Phaser canvas scales to viewport with integer or fitWidth scaling, never sub-pixel — tile art must stay crisp.
  - Mobile-aware UI: existing React menus/dashboards already render on mobile but get a once-over for touch target sizing (≥44px) and safe-area-inset support for notched phones.
  - Cloud sync: optional account (email + passwordless magic link) backed by existing `server/`. On save, sync IndexedDB → server. On boot, sync server → IndexedDB if newer. Last-write-wins per slot.
  - Conflict UI: if both sides have changes since last sync, show a "keep local / keep cloud" picker. No auto-merge.
  - PWA installable manifest + service worker for offline play. Already partly scaffolded — finish it.
- **Out of scope:**
  - Native iOS/Android apps (Capacitor, React Native, etc.).
  - Multi-device merge / CRDT-style sync — last-write-wins is the design.
  - Multiplayer features (already a separate future phase).
  - Push notifications (separate phase — depends on PWA but not blocking).
  - Social auth (Google/Apple sign-in) — passwordless email only this phase.
  - Payments / paid tiers (out of scope, separate venture decision).

### Hard Constraints
- Touch controls must NOT appear on desktop (`pointer: fine` media query). Keyboard/mouse path must stay untouched.
- Tile pixels must stay crisp: Phaser scale mode = `FIT` with `pixelArt: true`, canvas dimensions snap to integer multiples of design resolution.
- Cloud sync must be opt-in. Anonymous local-only play must remain fully functional and is the default.
- Save format must be backward-compatible with existing Phase 27.1 IndexedDB schema — migration, not replacement.
- Email auth must use the existing `server/` — no third-party auth provider (Clerk, Auth0) without explicit sign-off.
- All sync traffic over HTTPS, save payloads ≤256KB per slot, server stores ≤3 cloud save slots per account.

### Depends On
- Phase 27.1 IndexedDB Migration — local save layer is the source of truth.
- Phase 97 Visual Rebuild — viewport scaling depends on stable tile rendering.
- Phase 102 Observability — telemetry for mobile session %, sync success rate, auth funnel. NOT a hard dep but order-of-execution preference.

### Preserve
- Anonymous local-only play (the default, no friction).
- Existing `server/` API surface — extend, don't replace.
- Existing IndexedDB schema (Phase 27.1) — add a `lastSyncedAt` field and a sync queue, no breaking changes.
- All keyboard/mouse controls — touch is additive.

### Requirements (to be defined during plan-phase)
- Preliminary: MOB-01 (virtual joystick on touch devices), MOB-02 (tap-to-interact on world objects), MOB-03 (responsive viewport, crisp tiles), MOB-04 (safe-area-inset support), MOB-05 (no touch UI on desktop), MOB-06 (PWA installable), MOB-07 (service worker offline cache), SYNC-01 (email magic-link auth via existing server), SYNC-02 (IndexedDB → cloud push), SYNC-03 (cloud → IndexedDB pull), SYNC-04 (last-write-wins conflict UI), SYNC-05 (opt-in, anonymous play preserved), SYNC-06 (backward-compatible save migration).

</decisions>

<canonical_refs>
## Canonical References

- `.planning/PROJECT.md` — feature inventory
- `.planning/phases/27-indexeddb-migration/` — local save schema and migration patterns
- `server/src/server.js` — existing backend, extend here
- `src/game/scenes/` — Phaser scenes (touch controls hook in via Phaser Scene Input)
- `src/services/persistence/` — IndexedDB layer to extend with sync queue
- `public/manifest.json` (if exists) / `vite.config.js` — PWA configuration
- `package.json` — `framer-motion`, `react-router-dom` already present for menu work

</canonical_refs>

<specifics>
## Specific Ideas
- Virtual joystick: Phaser plugin `phaser3-rex-plugins` ships a VirtualJoyStick — well-tested, lightweight. Vet license first.
- Tap-to-interact: cast a small radius from tap location, pick nearest interactable, mirror keyboard "E" path.
- Magic-link email: use a hosted SMTP (Postmark or AWS SES) — DKIM matters for deliverability. Avoid running a mail server.
- Sync queue: append-only log of mutations in IndexedDB, drained on connectivity. Survives offline play and syncs on reconnect.
- Conflict UI: show timestamp + a one-line summary per slot ("Slot 1 — local 2 mins ago, cloud 3 hours ago"). Visual diff is overkill.
- PWA: use `vite-plugin-pwa` — it's the path of least resistance with Vite.

</specifics>

<deferred>
## Deferred Ideas
- CRDT-based real multi-device merge — overkill for single-player progress data.
- Social auth (Google, Apple) — adds dependency surface, ship email-only first.
- Cross-save between web and a future native app — design when native exists.
- Sync of FSRS scheduling state across devices with timestamp ordering — likely fine under last-write-wins, revisit if telemetry shows duplicate reviews.
- Family / shared-device profiles — separate phase.

</deferred>

---

*Phase: 103-mobile-cloud-sync*
*Context stubbed: 2026-05-26. Run `/gsd-plan-phase 103` to produce RESEARCH + PLAN + VALIDATION.*
*Depends on Phases 27.1, 97. Prefers Phase 102 ahead so we have mobile-session telemetry before validating.*
