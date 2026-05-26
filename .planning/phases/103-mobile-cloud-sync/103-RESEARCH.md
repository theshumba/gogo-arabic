# Phase 103: Mobile & Cloud Sync — Research

**Researched:** 2026-05-26
**Domain:** Touch input layer (Phaser), responsive PWA viewport, opt-in passwordless cloud sync over existing Express+Mongo server
**Confidence:** MEDIUM-HIGH (auth/sync stack HIGH; rex-plugins standalone bundle size LOW)

## Summary

Phase 103 sits on top of an already-mature persistence stack — IndexedDB hybrid persist from Phase 27.1 [VERIFIED: `src/services/storage/indexedDBAdapter.js`], a 3-slot localStorage save manager [VERIFIED: `src/services/saveManager.js`], an existing `server/` with JWT-cookie auth + CSRF + Mongo + per-IP rate limiting [VERIFIED: `server/src/app.js`, `server/src/middleware/rateLimiter.js`], and a service worker shell already wired in Phase 72 [VERIFIED: `public/sw.js`]. Phase 103's job is to **add the missing surfaces** (touch input, viewport scaling for crisp tiles on mobile, magic-link auth, sync queue + conflict UI, PWA installability via the existing manifest), not to invent infrastructure from scratch.

Five non-obvious findings the planner must absorb:

1. **`User` model already has `syncVersion` and `lastSyncedAt` fields** [VERIFIED: `server/src/models/User.js:37-38`]. A previous sync attempt exists in `src/services/sync.js` with an `api.saveGame()` / `api.loadGame()` / `api.resolveConflict()` API surface and `/api/game/save|load|resolve` routes [VERIFIED: `src/services/api.js:60-67`]. Phase 103 should **extend, not replace** this — but the existing sync is whole-state push (no append-only mutation queue) and uses password auth via header `Authorization: Bearer`, not the JWT-cookie pattern the rest of the API uses. This is technical debt the planner should explicitly address.
2. **`saveManager.js` saves to localStorage with `gogo_save_<n>` keys, NOT IndexedDB** [VERIFIED: `src/services/saveManager.js:81,121,137,157`]. Phase 27.1 moved Redux slices to IndexedDB, but the 3-slot save system is a separate concern still on localStorage. Cloud sync of "save slots" therefore has TWO sources: the live Redux/IndexedDB state and the localStorage slot files. Decide which is canonical for cloud sync.
3. **Current Phaser config uses `Scale.RESIZE` + `pixelArt: true`** [VERIFIED: `src/game/config.js:25-26`]. The CONTEXT decision is `Scale.FIT` with integer scaling. Switching modes on a pixel-art game with `roundPixels: true` is well-trodden ground but the change touches the entire camera/render pipeline.
4. **iOS PWA does NOT share storage with Safari** [CITED: progressier.com magic-link-PWA article]. A magic link clicked in iOS Mail opens Safari, completing auth there — but the installed PWA has separate cookies/storage and remains logged out. This is a known iOS limitation, not a bug. The mitigation pattern is OTP-in-app (user types code instead of clicking link). The CONTEXT decision says "email magic-link" — flagging this for discuss-phase or design accommodation.
5. **The `index.html` viewport meta tag lacks `viewport-fit=cover`** [VERIFIED: `index.html:5`]. `safe-area-inset-*` returns 0 without it. MOB-04 (safe-area-inset support) is unimplementable until that tag is updated. One-line fix; easy to miss.

**Primary recommendation:** Reuse Phase 72 SW infrastructure (don't add `vite-plugin-pwa` yet — the hand-rolled SW already does what MOB-06/07 need). Use `phaser3-rex-plugins`' VirtualJoyStick standalone module (MIT-licensed [VERIFIED: npm view], `~50KB` minified standalone path per docs). Implement magic-link via existing `server/` with `nodemailer` + Resend SMTP (3,000/mo free covers this project) [VERIFIED: npm view nodemailer@8.0.9, resend@6.12.4]. For SYNC, add a `lastSyncedAt` field per slot to `saveManager.js` save payload and an `outbox` IndexedDB queue table. Conflict UI = a single new React modal listing local vs cloud per slot.

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Scope — In:**
- Touch input layer: virtual joystick on left half of screen, action button(s) on right half, tap-to-interact on world objects/NPCs.
- Responsive viewport: Phaser canvas scales to viewport with integer or fitWidth scaling, never sub-pixel — tile art must stay crisp.
- Mobile-aware UI: existing React menus/dashboards already render on mobile but get a once-over for touch target sizing (≥44px) and safe-area-inset support for notched phones.
- Cloud sync: optional account (email + passwordless magic link) backed by existing `server/`. On save, sync IndexedDB → server. On boot, sync server → IndexedDB if newer. Last-write-wins per slot.
- Conflict UI: if both sides have changes since last sync, show a "keep local / keep cloud" picker. No auto-merge.
- PWA installable manifest + service worker for offline play. Already partly scaffolded — finish it.

**Scope — Out:**
- Native iOS/Android apps (Capacitor, React Native, etc.).
- Multi-device merge / CRDT-style sync — last-write-wins is the design.
- Multiplayer features.
- Push notifications.
- Social auth (Google/Apple sign-in).
- Payments / paid tiers.

**Hard Constraints:**
- Touch controls must NOT appear on desktop (`pointer: fine` media query). Keyboard/mouse path stays untouched.
- Tile pixels must stay crisp: Phaser scale mode = `FIT` with `pixelArt: true`, canvas dimensions snap to integer multiples of design resolution.
- Cloud sync must be opt-in. Anonymous local-only play remains fully functional and is the default.
- Save format must be backward-compatible with existing Phase 27.1 IndexedDB schema — migration, not replacement.
- Email auth must use the existing `server/` — no third-party auth provider (Clerk, Auth0) without explicit sign-off.
- All sync traffic over HTTPS, save payloads ≤256KB per slot, server stores ≤3 cloud save slots per account.

### Claude's Discretion
- Choice of virtual joystick library (rex vs. alternative)
- Choice of SMTP provider (Postmark / SES / Resend) within the "hosted SMTP, not a self-run mail server" constraint
- Whether to add `vite-plugin-pwa` or extend the existing hand-rolled `public/sw.js`
- Schema details for the mutation queue (table layout, retry policy)
- Conflict UI visual layout (timestamp + per-slot summary is the spec)

### Deferred Ideas (OUT OF SCOPE)
- CRDT-based real multi-device merge
- Social auth (Google, Apple)
- Cross-save between web and a future native app
- Sync of FSRS scheduling state across devices with timestamp ordering
- Family / shared-device profiles

## Project Constraints (from CLAUDE.md)
No `./CLAUDE.md` file exists at repository root [VERIFIED: `ls /Users/theshumba/Documents/GitHub/gogo-arabic/CLAUDE.md` returned exit code 1]. No project-level CLAUDE.md directives apply. Project conventions are sourced from `.planning/PROJECT.md` and CONTEXT.md instead.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MOB-01 | Virtual joystick on `pointer: coarse` left-half | rex-plugins VirtualJoyStick standalone module; `createCursorKeys()` returns Phaser-compatible cursor key objects that drop into the existing `Player.js:131,260-263` keyboard wiring [VERIFIED: rex docs + Player.js inspection] |
| MOB-02 | Tap-to-interact radius cast | `WorldScene` already has `this.input.on('pointerdown')` precedent in `CalligraphyScene.js:147`. `InteractableManager` exists at `src/game/systems/InteractableManager.js` — call its same handler from a pointer event [VERIFIED: codebase grep] |
| MOB-03 | Phaser `Scale.FIT` + `pixelArt: true` + integer scaling | Standard Phaser pattern. `pixelArt: true` already set; switch `mode` from `RESIZE` (line 26) to `FIT`, add `zoom` snap, leave `roundPixels: true` [VERIFIED: Phaser docs] |
| MOB-04 | `safe-area-inset-*` | Requires `viewport-fit=cover` in `index.html` viewport meta tag — **currently missing** [VERIFIED: `index.html:5`]. Apply `env(safe-area-inset-*)` to `GameLayout.module.css` root container [CITED: MDN env() docs] |
| MOB-05 | No touch UI on desktop | CSS `@media (pointer: coarse)` gate on touch components. Joystick/button containers `display: none` for `(pointer: fine)` [VERIFIED: WCAG 2.5.5 + pointer media query spec] |
| MOB-06 | PWA installable | `public/manifest.json` already complete (name, icons, theme_color, display: standalone, start_url) [VERIFIED: public/manifest.json]. Verify icons render at 192/512, splash works on iOS. No new code needed for the manifest itself |
| MOB-07 | Service worker offline cache + last-zone restore | `public/sw.js` already implements cache-first/network-first/stale-while-revalidate (Phase 72) [VERIFIED]. Need: (a) ensure `/api/` calls NEVER cache success responses for auth-bound endpoints (currently `networkFirst` caches them — bug), (b) on offline boot, last zone should restore from existing IndexedDB Redux state — already works |
| SYNC-01 | Magic-link auth via existing server, rate-limited | New `POST /api/v1/auth/magic-link/request` + `GET /api/v1/auth/magic-link/verify?token=…` routes. Reuse existing `authLimiter` (5/15min/IP) [VERIFIED: `rateLimiter.js:21`]. Token = signed JWT short-lived (10min) OR random + Mongo-stored hash; mark consumed after first use [CITED: oneuptime.com magic-link guide] |
| SYNC-02 | IndexedDB → cloud push via append-only queue | New `outbox` object store inside existing `gogo-arabic-idb` DB (separate from `redux-state` store). Drain on `online` event + after each save. Pattern already exists in `src/services/offlineSync.js` — `ACTION_QUEUE_STORE` precedent [VERIFIED] |
| SYNC-03 | Cloud → IndexedDB pull on boot | New `GET /api/v1/cloudsave/pull` returns `{slots: [{slot, lastSyncedAt, payload}]}`. On boot, compare cloud `lastSyncedAt` vs local — replace if cloud newer |
| SYNC-04 | Conflict UI keep-local / keep-cloud | New React modal (lazy-loaded like other overlays in `GameLayout.jsx`). Pattern: `useFocusTrap` + `framer-motion` already in stack |
| SYNC-05 | Opt-in; anonymous local-only is default | Default path = no `/api/v1/cloudsave/*` calls. Only enable after user opts in via Settings → "Sync with cloud" button. No auth cookie = local-only mode |
| SYNC-06 | Backward-compatible save migration | Add `lastSyncedAt` field to save payload in `saveManager.js`; default to `null` if absent during read (handles old saves). NO migration of existing localStorage `gogo_save_<n>` keys — additive field only [VERIFIED: pattern matches `saveManager.js:204-228`] |

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Virtual joystick rendering & input | Browser/Client (Phaser) | — | Input device; never crosses network |
| Tap-to-interact hit testing | Browser/Client (Phaser scene) | — | World coordinates only exist in Phaser scene |
| Phaser canvas scaling | Browser/Client | — | Pure rendering concern |
| Safe-area-inset CSS | Browser/Client (React shell) | — | DOM layout only |
| PWA manifest | CDN/Static | Browser/Client | Static file served by host; browser installs |
| Service worker | Browser/Client | — | Runs in browser SW thread |
| Magic-link token generation | API/Backend | Database (token store) | Secret signing key lives server-side |
| Magic-link email send | API/Backend | External SMTP (Resend) | SMTP credentials are server secrets |
| Auth session cookie | API/Backend | Browser/Client (cookie store) | Server issues, browser persists |
| Sync push (outbox drain) | Browser/Client (drains) | API/Backend (receives) | Client owns the queue; server is the sink |
| Sync pull (boot) | API/Backend (computes diff) | Browser/Client (applies) | Server holds canonical `lastSyncedAt` per slot |
| Conflict UI | Browser/Client (React modal) | — | Pure UI; uses local + server payloads as input |
| Cloud slot storage | Database (MongoDB) | API/Backend (controllers) | Mongo `User.snapshots` precedent at `User.js:40-49` |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `phaser3-rex-plugins` | 1.80.20 [VERIFIED: npm view 2026-05-26] | VirtualJoyStick — touch input simulating cursor keys | MIT-licensed [VERIFIED: npm view], 7+ years maintained, direct `createCursorKeys()` API matches existing `Player.js:131` wiring with zero refactor — joystick output drops into `cursors.left.isDown` checks at lines 260-263 |
| `nodemailer` | 8.0.9 [VERIFIED: npm view 2026-05-26] | Server-side SMTP send for magic-link emails | De-facto Node SMTP library, works with Resend/Postmark/SES SMTP relay |
| `resend` (SMTP via API key) | 6.12.4 [VERIFIED: npm view 2026-05-26] | Hosted transactional email provider | 3,000 emails/month free [CITED: Resend pricing], modern DX, low DKIM/SPF setup overhead — sufficient for indie-scale magic links |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Existing `jsonwebtoken` 9.0.3 (server) | (already installed) | Magic-link token signing if going JWT route | If choosing JWT-style (signed payload includes email + nonce + exp). Already in server bundle |
| Existing `express-rate-limit` 7.5.1 (server) | (already installed) [VERIFIED: server/package.json] | Per-IP and per-email rate limiting on magic-link request endpoint | Reuse `authLimiter` (5/15min/IP); add a per-email limiter (5/hour/email) [CITED: oneuptime.com magic-link guide] |
| Existing `helmet` 8.1.0 (server) | (already installed) | Security headers on new magic-link endpoints | No change — middleware applies globally |
| Existing `express` 5.2.1 routes pattern | (already installed) | New `magicLink.js` controller alongside `authController.js` | Follow existing controller-route-validation pattern at `server/src/controllers/authController.js` |
| Existing `bcryptjs` 3.0.3 (server) | (already installed) | Hashing stored magic-link tokens (defense-in-depth) | If storing token hash in Mongo (recommended over plain) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `phaser3-rex-plugins` VirtualJoyStick | Hand-rolled SVG/DOM joystick | rex VJS is `7.37MB` total package but standalone import path `phaser3-rex-plugins/plugins/virtualjoystick-plugin.js` ships only the joystick — bundle hit small. Hand-roll loses `createCursorKeys()` Phaser integration and re-invents touch math. **Pick rex** unless bundle audit (Step 2.6 sibling) shows >50KB delta |
| `phaser3-rex-plugins` (whole library import) | Standalone plugin file `phaser3-rex-plugins/plugins/virtualjoystick-plugin.js` | Whole library is 7.37MB; standalone is much smaller (exact size [LOW] — docs don't publish a number). **Use standalone import** |
| Resend SMTP | Postmark | Postmark only 100/mo free, then $15/mo — too expensive for cold start. Better deliverability but not yet needed [CITED: 2026 pricing comparison] |
| Resend SMTP | AWS SES | Cheapest at scale ($0.10/1K) but high DKIM/domain-verification setup overhead. Resend wins on time-to-first-email for indie [CITED: 2026 pricing comparison] |
| `vite-plugin-pwa` | Extend existing hand-rolled `public/sw.js` | `vite-plugin-pwa` (8.0.9 [VERIFIED: npm view]) auto-generates SW + manifest, manages cache versioning. BUT the hand-rolled SW already handles cache-first/network-first/stale-while-revalidate AND has a `2 MiB` default precache cap [CITED: vite-pwa docs] that would silently drop large Phaser assets. **Stay with hand-rolled `public/sw.js`** — fix the bugs (API caching, scope) rather than swap |
| Email magic-link clickable URL | Email OTP code typed in-app | Magic links break in iOS PWA (storage isolated from Safari) [CITED: progressier.com] and break in corporate email pre-fetch scanners that consume one-time tokens [CITED: obie.medium.com]. OTP-in-app is safer cross-platform. CONTEXT locks "magic link" but flag this for discuss-phase |
| Single mutation outbox table | Per-slice queues | Single queue with `{slot, timestamp, payload, op}` rows is simpler; FSRS reviews already use this exact pattern in `offlineSync.js:152-204` (whitelist + replay) [VERIFIED] |

**Installation (server):**

```bash
cd server && npm install nodemailer resend
```

**Installation (client):**

```bash
npm install phaser3-rex-plugins
```

(No `vite-plugin-pwa` install. Workbox not needed.)

**Version verification (2026-05-26):**
- `phaser3-rex-plugins` 1.80.20 [VERIFIED: npm view, last modified 2026-03-31]
- `phaser` 4.1.0 published (project locked at `^3.90.0`) — stay on Phaser 3; rex 1.80.x supports both 3 and 4 [VERIFIED: rex docs say "phaser4-rex-plugins" for v4 fork, current pkg `phaser3-rex-plugins` covers Phaser 3]
- `nodemailer` 8.0.9 [VERIFIED: npm view]
- `resend` 6.12.4 [VERIFIED: npm view]
- `vite-plugin-pwa` 8.0.9 [VERIFIED: npm view] — not used per recommendation above

## Package Legitimacy Audit

> slopcheck CLI **unavailable in this environment** (`pip` not installed, `pipx` not present, `slopcheck` not on PATH). All packages tagged `[ASSUMED]` per protocol; planner MUST gate each install behind a `checkpoint:human-verify` task.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| `phaser3-rex-plugins` | npm | created 2018-07-30, last published 2026-03-31 (~8 yrs maintained) [VERIFIED: npm view time] | not queried | github.com/rexrainbow/phaser3-rex-notes [VERIFIED: npm view repository.url] | [ASSUMED] — slopcheck unavailable | **Approved, with checkpoint** — well-known Phaser ecosystem package, active maintainer (rexrainbow), public docs site |
| `nodemailer` | npm | mature (>10 yrs) | not queried | github.com/nodemailer/nodemailer [VERIFIED: npm view repository.url] | [ASSUMED] | **Approved, with checkpoint** — de-facto standard, used by millions of projects |
| `resend` | npm | published, active | not queried | github.com/resend/resend-node [VERIFIED: npm view repository.url] | [ASSUMED] | **Approved, with checkpoint** — first-party SDK from Resend Inc., the SMTP provider being chosen |

**Packages removed due to slopcheck [SLOP] verdict:** none (tool unavailable; no removal performed)
**Packages flagged as suspicious [SUS]:** none discovered via manual inspection of repo URLs

**Postinstall script check:** Not run (no `npm view <pkg> scripts.postinstall` executed in this session). Planner must run before install.

*All packages above are tagged `[ASSUMED]` and the planner must gate each install behind a `checkpoint:human-verify` task.*

## Architecture Patterns

### System Architecture Diagram

```
                                  ┌─────────────────────────────────────────┐
                                  │  iOS Mail / Gmail / Outlook (client)    │
                                  │  user clicks magic link                 │
                                  └────────────────┬────────────────────────┘
                                                   │ GET /verify?token=…
                                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                  React Shell (browser, served from CDN/static)               │
│                                                                              │
│  ┌────────────┐ pointer:coarse ┌────────────────┐                            │
│  │ React UI   │◀───────────────│ Touch overlays │ (joystick + tap regions)   │
│  │ overlays   │ pointer:fine   │ (gated by CSS  │                            │
│  └────┬───────┘   hide         │  media query)  │                            │
│       │                         └────────┬───────┘                           │
│       │                                  │ pointer events                    │
│       │                                  ▼                                   │
│       │             ┌────────────────────────────────────┐                   │
│       │             │  Phaser Scene (WorldScene)         │                   │
│       │             │  - rex VirtualJoyStick             │                   │
│       │             │  - input.on('pointerdown') → cast  │                   │
│       │             │  - cursors API consumed by Player  │                   │
│       │             └──────────────┬─────────────────────┘                   │
│       │ dispatch                   │ updates                                 │
│       ▼                            ▼                                         │
│  ┌────────────────────────────────────────────────────────┐                  │
│  │ Redux Store (existing)                                 │                  │
│  │   - settings slice (cloud sync opt-in flag)            │                  │
│  │   - sync slice (new: outbox status, conflict state)    │                  │
│  │   - player/vocabulary/battle/… (Phase 27.1)            │                  │
│  └─────────────┬───────────────────────────────┬──────────┘                  │
│                │ persist                       │ persist                     │
│                ▼                               ▼                             │
│  ┌──────────────────────────┐  ┌──────────────────────────────────────────┐  │
│  │ localStorage             │  │ IndexedDB ('gogo-arabic-idb')            │  │
│  │  - lightweight slices    │  │  - 'redux-state' store (existing)        │  │
│  │  - gogo_save_<n> slot    │  │  - 'outbox' store (NEW: sync queue)      │  │
│  │    files                 │  │  - 'gogo-arabic-offline-sync' (existing) │  │
│  └──────────────────────────┘  └──────────────────────────────────────────┘  │
│                                                │                             │
│                                                │ drains when navigator.onLine│
│                                                ▼                             │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Service Worker (public/sw.js)                                          │  │
│  │  - cache-first for sprites/audio/fonts/JSON                            │  │
│  │  - stale-while-revalidate for JS/CSS                                   │  │
│  │  - network-only (FIX) for /api/ — currently network-first (bug)        │  │
│  │  - navigation fallback → index.html                                    │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────┬────────────────────────────────────┘
                                          │ fetch /api/v1/...
                                          │ (cookie: jwt, x-csrf-token)
                                          ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                    Express 5 server (server/src/app.js)                      │
│                                                                              │
│  helmet → CORS → cookieParser → globalLimiter → CSRF → routes                │
│                                                                              │
│  /api/v1/auth/magic-link/request    POST  (new)  authLimiter + email-limiter │
│  /api/v1/auth/magic-link/verify     GET   (new)  rate-limited, single-use    │
│  /api/v1/cloudsave/pull             GET   (new)  authenticated, per-user     │
│  /api/v1/cloudsave/push             POST  (new)  authenticated, ≤256KB body  │
│                                                                              │
│  (existing) /api/v1/auth/{register,login,logout,verify}                      │
│  (existing) /api/v1/game/{save,load,resolve}  ← prior sync API still mounted │
└────────┬─────────────────────────────────────────────────┬───────────────────┘
         │                                                 │
         ▼                                                 ▼
┌────────────────────────┐                  ┌──────────────────────────────┐
│ Resend SMTP API        │                  │ MongoDB                      │
│ (magic-link email send)│                  │  - User (existing)           │
└────────────────────────┘                  │  - MagicLinkToken (new)      │
                                            │  - CloudSave (new, ≤3/user)  │
                                            └──────────────────────────────┘
```

### Recommended Project Structure

```
src/
├── components/
│   ├── Mobile/                          # NEW — touch UI components
│   │   ├── TouchControls.jsx            # Wrapper: joystick + action button
│   │   ├── VirtualJoystick.jsx          # rex VJS mounted in Phaser scene
│   │   ├── TouchControls.module.css     # pointer:coarse gate, safe-area
│   │   └── __tests__/
│   ├── Sync/                            # NEW — cloud sync UI
│   │   ├── CloudSyncSettings.jsx        # opt-in toggle, account link
│   │   ├── MagicLinkRequestForm.jsx     # email input + "send link"
│   │   ├── ConflictResolutionModal.jsx  # keep-local / keep-cloud per slot
│   │   ├── SyncStatusIndicator.jsx      # HUD widget: synced / queued N
│   │   └── __tests__/
│   └── Router/
│       └── GameLayout.jsx               # MODIFY — render TouchControls
├── services/
│   ├── storage/
│   │   ├── outboxAdapter.js             # NEW — IDB outbox queue (parallel to indexedDBAdapter)
│   │   └── migrations.js                # MODIFY — version 13 adds outbox store
│   ├── cloudSync.js                     # NEW — pull on boot, push on save, conflict detect
│   ├── magicLinkAuth.js                 # NEW — request/verify client-side
│   ├── api.js                           # MODIFY — add cloudsave + magic-link endpoints
│   └── saveManager.js                   # MODIFY — add lastSyncedAt field to payload
├── game/
│   ├── config.js                        # MODIFY — Scale.RESIZE → Scale.FIT, add zoom snap
│   ├── PhaserGame.jsx                   # MODIFY — pass touch overlay refs
│   └── systems/
│       ├── TouchInputAdapter.js         # NEW — bridges rex joystick → existing Player cursors
│       └── TapToInteract.js             # NEW — pointer hit-test → InteractableManager
└── store/
    └── slices/
        ├── settingsSlice.js             # MODIFY — add cloudSyncEnabled flag
        └── cloudSyncSlice.js            # NEW — outbox depth, last sync time, conflict pending

server/
└── src/
    ├── controllers/
    │   ├── magicLinkController.js       # NEW — requestLink, verifyLink
    │   └── cloudSaveController.js       # NEW — pullSlots, pushSlot, listSlots
    ├── routes/
    │   ├── magicLink.js                 # NEW
    │   └── cloudsave.js                 # NEW
    ├── models/
    │   ├── MagicLinkToken.js            # NEW — { tokenHash, email, expiresAt, consumedAt }
    │   └── CloudSave.js                 # NEW — { userId, slot 1|2|3, payload, lastSyncedAt }
    ├── middleware/
    │   └── rateLimiter.js               # MODIFY — add magicLinkEmailLimiter
    └── utils/
        └── sendMagicLinkEmail.js        # NEW — nodemailer + Resend

index.html                               # MODIFY — viewport meta add viewport-fit=cover
public/
├── manifest.json                        # NO CHANGE (already complete)
└── sw.js                                # MODIFY — change /api/ from network-first to network-only
```

### Pattern 1: Virtual Joystick Mirroring Keyboard Cursors

**What:** rex VirtualJoyStick `createCursorKeys()` returns objects with the same `.left.isDown` shape as Phaser's native `input.keyboard.createCursorKeys()`. The existing `Player.js:260-263` code reads `this.cursors.left.isDown || this.wasd.left.isDown` — we extend the chain.

**When to use:** All touch-device movement input.

**Example:**

```javascript
// Source: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/virtualjoystick/
// src/game/systems/TouchInputAdapter.js
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';

// In gameConfig.plugins.global:
//   { key: 'rexVirtualJoystick', plugin: VirtualJoystickPlugin, mapping: 'rexVirtualJoystick' }

// In WorldScene.create() — only on touch devices:
if (window.matchMedia('(pointer: coarse)').matches) {
  const joystick = this.plugins.get('rexVirtualJoystick').add(this, {
    x: 150,
    y: this.cameras.main.height - 150,
    radius: 100,
    base: this.add.circle(0, 0, 100, 0x888888, 0.3),
    thumb: this.add.circle(0, 0, 50, 0xcccccc, 0.6),
    dir: '8dir',           // 8-way movement
    forceMin: 16,          // dead-zone
    fixed: true,           // ignore camera scroll
  });
  // In Player.update(), append the joystick keys to the existing cursor reads:
  const joyCursors = joystick.createCursorKeys();
  this.touchCursors = joyCursors;  // store on scene, Player reads them
}
```

Then in `Player.js:260-263`:
```javascript
const left  = this.cursors.left.isDown  || this.wasd.left.isDown
            || (this.scene.touchCursors?.left?.isDown ?? false);
// same for right/up/down
```

### Pattern 2: Tap-to-Interact via Pointer Hit-Test

**What:** A pointerdown event on the WorldScene casts a small radius around the world-space pointer coordinate, finds the nearest interactable, and fires the same handler keyboard "E" fires.

**When to use:** Replaces hover+E on touch.

**Example:**

```javascript
// Source: Phaser docs (input.activePointer.worldX) + existing InteractableManager
// src/game/systems/TapToInteract.js
export class TapToInteract {
  constructor(scene) {
    this.scene = scene;
    this.RADIUS = 64; // pixels in world space; one tile
  }
  init() {
    this.scene.input.on('pointerdown', (pointer) => {
      // Skip if a joystick swallowed it (rex VJS sets pointer.event.cancelBubble; check)
      if (pointer.event?.target?.closest('[data-touch-control]')) return;

      const wx = pointer.worldX, wy = pointer.worldY;
      const interactable = this.scene.interactableManager.findNearest(wx, wy, this.RADIUS);
      if (interactable) {
        this.scene.interactableManager.activate(interactable); // same path as 'E'
      }
    });
  }
}
```

### Pattern 3: Phaser FIT + Integer Zoom for Crisp Pixel Art

**What:** Switch from `Scale.RESIZE` (current) to `Scale.FIT`, snap zoom to integer multiples of the design resolution to prevent sub-pixel tile drift on high-DPR mobile.

**When to use:** MOB-03.

**Example:**

```javascript
// Source: Phaser docs (Scale.FIT, pixelArt, roundPixels) + supernapie.com retina guide
// src/game/config.js — MODIFY
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const gameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  pixelArt: true,           // already set — shortcut for antialias:false + roundPixels:true
  antialias: false,         // explicit redundancy
  roundPixels: true,        // already set
  scale: {
    mode: Phaser.Scale.FIT,            // ← CHANGE FROM RESIZE
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: 'phaser-container',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    // FIT scales to fit while preserving aspect; integer rounding handled by
    // the renderer because pixelArt:true. DO NOT also set zoom or apply
    // devicePixelRatio multiplication — that path produces blur for pixel art
    // (the retina recipe at supernapie.com is for vector art).
  },
  // ...rest unchanged
};
```

**Why not the `devicePixelRatio` retina pattern:** That pattern (multiply width×DPR, zoom=1/DPR) is for VECTOR art that benefits from upscaled rendering. For pixel art, you WANT chunky scaling — `pixelArt: true` + `Scale.FIT` is correct. The retina pattern would defeat the crisp tile goal.

### Pattern 4: Append-Only Outbox Queue for Cloud Sync

**What:** Every cloud-sync-relevant mutation appends a row to an IDB `outbox` store. A drain loop fires on `online`, on save completion, and on app focus. Server-side push is idempotent by `clientRequestId`.

**When to use:** SYNC-02.

**Example:**

```javascript
// Source: precedent in src/services/offlineSync.js (ACTION_QUEUE_STORE pattern)
// src/services/storage/outboxAdapter.js
const OUTBOX_DB = 'gogo-arabic-idb';   // same DB as Phase 27.1
const OUTBOX_STORE = 'outbox';         // new store added in migration v13

export async function enqueue({ slot, payload, clientRequestId }) {
  const db = await openDB(OUTBOX_DB);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE, 'readwrite');
    tx.objectStore(OUTBOX_STORE).add({
      slot, payload, clientRequestId,
      enqueuedAt: Date.now(),
      attempts: 0,
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function drain(pushFn) {
  if (!navigator.onLine) return 0;
  const db = await openDB(OUTBOX_DB);
  const rows = await getAll(db, OUTBOX_STORE);
  let drained = 0;
  for (const row of rows) {
    try {
      await pushFn(row);                                  // POST /api/v1/cloudsave/push
      await deleteRow(db, OUTBOX_STORE, row.id);
      drained++;
    } catch (err) {
      // Backoff: increment attempts, leave in queue, abort drain on 4xx
      if (err.status >= 400 && err.status < 500) throw err;
      break;
    }
  }
  return drained;
}
```

**IDB schema migration (added to existing `src/services/storage/migrations.js`):**
```javascript
// Version 13: Add outbox store for cloud sync (Phase 103)
13: (state) => {
  // No state shape change; only IDB schema bump.
  // The DB upgrade happens in indexedDBAdapter.js onupgradeneeded (oldVersion < 2)
  return state;
}
```

And in `src/services/storage/indexedDBAdapter.js` `onupgradeneeded`:
```javascript
if (event.oldVersion < 2) {
  if (!db.objectStoreNames.contains('outbox')) {
    db.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true });
  }
}
```

### Pattern 5: Magic-Link Auth Route

**What:** Two endpoints — request (creates token, emails link) and verify (consumes token, issues JWT cookie identical to existing login flow).

**When to use:** SYNC-01.

**Example:**

```javascript
// Source: oneuptime.com magic-link guide + existing authController.js pattern
// server/src/controllers/magicLinkController.js
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import MagicLinkToken from '../models/MagicLinkToken.js';
import User from '../models/User.js';
import { sendMagicLinkEmail } from '../utils/sendMagicLinkEmail.js';
import { AppError } from '../utils/AppError.js';

const TOKEN_BYTES = 32;
const TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function requestMagicLink(req, res, next) {
  try {
    const { email } = req.body;
    // (zod validation applied via middleware before this handler)

    const rawToken = crypto.randomBytes(TOKEN_BYTES).toString('hex');
    const tokenHash = await bcrypt.hash(rawToken, 10);

    await MagicLinkToken.create({
      email: email.toLowerCase().trim(),
      tokenHash,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      consumedAt: null,
    });

    const link = `${process.env.APP_URL}/auth/magic-link/verify?token=${rawToken}&email=${encodeURIComponent(email)}`;
    await sendMagicLinkEmail({ to: email, link });

    // ALWAYS return 200 — don't leak whether email exists (account enumeration defense)
    res.json({ success: true, message: 'If that email is registered, a link is on its way.' });
  } catch (err) { next(err); }
}

export async function verifyMagicLink(req, res, next) {
  try {
    const { token, email } = req.query;
    const record = await MagicLinkToken.findOne({
      email: email.toLowerCase().trim(),
      consumedAt: null,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!record || !(await bcrypt.compare(token, record.tokenHash))) {
      return next(AppError.unauthorized('Invalid or expired link'));
    }

    // Mark consumed FIRST (prevents replay if subsequent step throws)
    record.consumedAt = new Date();
    await record.save();

    // Find or create user
    let user = await User.findOne({ email: record.email });
    if (!user) {
      user = await User.create({ email: record.email, name: record.email.split('@')[0], password: crypto.randomBytes(32).toString('hex') });
      // password column kept for schema compatibility; user can never log in via /login
    }

    // Issue JWT cookie identical to existing login flow (see authController.js:setAuthCookie)
    setAuthCookie(res, user._id);
    // Issue CSRF cookie identical pattern
    res.cookie('csrf-token', crypto.randomBytes(32).toString('hex'), { /* ... */ });

    res.redirect('/?magic_link_success=1');
  } catch (err) { next(err); }
}
```

### Pattern 6: Conflict UI

**What:** A React modal that, when local and cloud both have updates since `lastSyncedAt`, shows per-slot rows with timestamps and a single-choice picker.

**When to use:** SYNC-04.

**Example:**

```jsx
// Source: existing modal pattern from LevelUpModal / ConflictResolutionModal style
// src/components/Sync/ConflictResolutionModal.jsx
export function ConflictResolutionModal({ conflicts, onResolve }) {
  // conflicts: [{ slot: 1, local: {ts, level, zone}, cloud: {ts, level, zone} }]
  const [picks, setPicks] = useState({}); // { 1: 'local' | 'cloud', 2: ..., 3: ... }

  return (
    <Modal title="Cloud save conflict">
      <p>Your local progress and cloud saves both changed since the last sync.
         Pick which version to keep for each slot.</p>
      {conflicts.map(c => (
        <ConflictRow key={c.slot} slot={c.slot}
          localDesc={`Lvl ${c.local.level} · ${c.local.zone} · ${timeAgo(c.local.ts)}`}
          cloudDesc={`Lvl ${c.cloud.level} · ${c.cloud.zone} · ${timeAgo(c.cloud.ts)}`}
          choice={picks[c.slot]}
          onChoice={v => setPicks(p => ({ ...p, [c.slot]: v }))} />
      ))}
      <button disabled={Object.keys(picks).length !== conflicts.length}
              onClick={() => onResolve(picks)}>
        Apply
      </button>
    </Modal>
  );
}
```

### Anti-Patterns to Avoid

- **Caching `/api/` responses in SW.** Current `public/sw.js:60` routes `/api/` through `networkFirst` which CACHES success responses. For auth-bound endpoints this means a logged-out user could see another user's cached `/api/user/profile`. Switch `/api/` to `NetworkOnly` (no cache, no fallback) — auth must hit network.
- **Caching the magic-link verify URL.** SW must NOT cache `GET /auth/magic-link/verify`. Add a `Cache-Control: no-store` on the server response and add the path to `navigateFallbackDenylist`-equivalent in the hand-rolled SW.
- **DevicePixelRatio multiplication for pixel art.** The retina recipe (multiply width×DPR, zoom=1/DPR) is for VECTOR art. For pixel art it produces blur. Don't apply.
- **Sending the magic link `email=…` in a separate query param.** Email enumeration via timing. Use only `token` and look up the email server-side from the hashed-token row.
- **Auto-merging save state.** CONTEXT locks "last-write-wins per slot, no CRDT, conflict UI for picking." Don't be clever.
- **Putting joystick + tap-to-interact pointer handlers on the same listener.** rex VJS swallows its pointers correctly, but tap-to-interact must `pointer.event.target.closest('[data-touch-control]')` to avoid firing when the user lifts off the joystick.
- **Setting `viewport-fit=cover` without applying `env(safe-area-inset-*)`.** Causes content to render under the notch [CITED: ishadeed.com]. Both lines change in the same commit.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Virtual joystick touch math | Custom SVG/DOM joystick with `touchmove` | `phaser3-rex-plugins` VirtualJoyStick standalone module | rex provides `createCursorKeys()` API that drops into Phaser's existing cursor-keys consumer pattern in one line. Hand-rolling re-invents touch deadzone, multi-touch, and pointer-capture math |
| Transactional email send | Self-hosted SMTP server (postfix etc.) | Hosted SMTP (Resend / Postmark) | DKIM/SPF/DMARC setup + IP warmup + spam-list management is weeks of work. Resend handles it for free up to 3K/mo [CITED: Resend pricing] |
| One-time token generation | DIY token format | `crypto.randomBytes(32).toString('hex')` + bcrypt hash | Standard pattern. Don't try to invent base32-encoded short codes etc. |
| JWT-cookie session | Hand-rolled session table | Existing `setAuthCookie` helper in `authController.js:9` | Server already has this. Magic-link verify just reuses it |
| PWA install detection | Custom `beforeinstallprompt` UI | Existing manifest at `public/manifest.json` triggers iOS Add-to-Home-Screen automatically | iOS doesn't fire `beforeinstallprompt` at all. For Android, the browser shows its own prompt. Only build custom UI if telemetry shows install rate is too low |
| SW cache strategy | Workbox + vite-plugin-pwa | Existing hand-rolled `public/sw.js` from Phase 72 | The 2 MiB precache cap of Workbox would silently drop Phaser assets [CITED: vite-pwa-org.netlify.app FAQ]. Hand-rolled SW already has cache-first/network-first/stale-while-revalidate — just fix the `/api/` strategy |
| Tap hit-testing | Iterate every game object | `InteractableManager.findNearest(x, y, radius)` (call existing method or add it) | Manager already indexes interactables for keyboard-E path. Reuse the index |

**Key insight:** Phase 103 looks broad but ~70% of the infrastructure already exists in the codebase. The trap is to reach for new dependencies (`vite-plugin-pwa`, social auth SDKs, OAuth libraries) when the existing server + sw.js + IndexedDB layer can be extended in tight, focused diffs.

## Runtime State Inventory

Phase 103 is **additive, not a rename/refactor** — no string-renaming sweeps, no data-migration of existing collections. Inventory still done for completeness:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | (a) `gogo-arabic-idb` IndexedDB (`redux-state` object store) — existing, gets a new sibling store `outbox`. (b) localStorage keys `gogo_save_1..3` and `gogo_save_<n>_pending` — existing, payload gets a new optional `lastSyncedAt` field (backward-compatible). (c) Mongo `users` collection — existing, gets a new sibling `cloudsaves` collection and `magiclinktokens` collection. | Additive only — additive migration v13 in `migrations.js`, additive IDB store in `indexedDBAdapter.js` onupgradeneeded, additive Mongo collections. NO data migration of existing records. |
| Live service config | None. App is single-tier (Express + Mongo). No external SaaS workflows (n8n, Airflow) embed any project string. | None |
| OS-registered state | None. Project runs as `vite dev` / `node server/src/server.js` — no systemd, no Windows Task Scheduler, no launchd plist. | None |
| Secrets/env vars | `server/.env` will need: `RESEND_API_KEY` (new), `APP_URL` (new — for magic-link URL construction), `MAGIC_LINK_FROM_EMAIL` (new). Existing `JWT_SECRET`, `MONGODB_URI`, `CORS_ORIGINS`, `RATE_LIMIT_AUTH` reused unchanged. | Add 3 new env vars; document in `server/.env.example`. No existing var name changes. |
| Build artifacts | None. No compiled binary or egg-info to invalidate. `dist/` is rebuilt every `npm run build`. | None |

## Common Pitfalls

### Pitfall 1: iOS PWA Magic-Link Storage Separation

**What goes wrong:** User installs Gogo Arabic as a PWA on iOS. Later, they request a magic link. They tap the link in Mail. iOS opens the link in **Safari**, not in the installed PWA. The verify endpoint sets a JWT cookie in Safari's cookie jar. The user opens the installed PWA — still logged out. They wonder why "the link didn't work."

**Why it happens:** Apple does not support deep linking from email apps into installed PWAs. Safari and the installed PWA have isolated cookie/storage contexts [CITED: progressier.com magic-link PWA article, magicbell.com PWA iOS limitations 2026].

**How to avoid:**
1. Detect "running as installed PWA" via `window.matchMedia('(display-mode: standalone)').matches`. If true AND device is iOS, switch the UI from "we'll email you a link" to "we'll email you a 6-digit code; type it here" (OTP-in-app pattern).
2. Alternative: a single MagicLinkToken can be redeemed twice (once via link click in Safari, once via in-app code entry) — but this widens the attack window. OTP is cleaner.
3. CONTEXT locks "magic link" — this needs a discuss-phase clarification. RESEARCH flags it. The planner should add a `checkpoint:human-verify` task asking whether to ship OTP-in-app fallback for iOS PWA users.

**Warning signs:** Telemetry shows iOS PWA users requesting many magic links and never reaching `/api/v1/auth/verify` success.

### Pitfall 2: Email Pre-Fetch Consumes One-Time Token

**What goes wrong:** Corporate users on Outlook 365 + Defender, Mimecast, or Proofpoint have their inbound email links pre-scanned. The scanner fetches `GET /verify?token=…` BEFORE the user clicks. The endpoint marks the token consumed. When the user clicks, the link is dead. They get "invalid or expired."

**Why it happens:** Email security tools follow links to scan for phishing [CITED: obie.medium.com prefetching breaks magic link].

**How to avoid:**
1. The verify endpoint should NOT consume the token on GET; instead, render a small HTML page with a "Click to log in" button that POSTs to verify. Scanners follow GETs, not POSTs that require an Origin header.
2. Alternatively: use the token to render a session-only cookie, then the actual login POST happens from the rendered page.
3. Set `allowedAttempts: 3` on the token (default to 1 is too tight; bots + real user = 2-3 fetches in normal flow) per the discuss thread in better-auth/better-auth#6985.

**Warning signs:** Users on corporate email report 100% magic-link failure rate.

### Pitfall 3: Phaser Scale.FIT Jitter on Orientation Change

**What goes wrong:** Mobile user rotates landscape→portrait→landscape. The Phaser canvas resizes but the tile grid drifts by a fractional pixel; user sees flickering tile edges or a slight zoom pulse.

**Why it happens:** Phaser 3.85.0+ has a known issue where orientation-change events sometimes don't trigger a complete re-fit [CITED: phaserjs/phaser#7213]. Sub-pixel drift compounds because `pixelArt: true` rounds positions but not the canvas size itself.

**How to avoid:**
1. Force a manual `game.scale.refresh()` on `orientationchange` and `resize` events.
2. Constrain canvas dimensions to integer multiples of design resolution: in the scale callback, `displayWidth = Math.floor(window.innerWidth / GAME_WIDTH) * GAME_WIDTH`.
3. Test on iOS Safari rotation specifically — Chrome desktop doesn't show this.

**Warning signs:** Tile edges flicker for ~200ms after rotating the device.

### Pitfall 4: Cloud Sync Pull Stomps Local Progress Made While Offline

**What goes wrong:** User plays offline, gains XP. Comes online. Boot-time pull sees cloud `lastSyncedAt` is newer than local (because cloud was updated from another device a week ago). Pull replaces local state. Offline progress lost.

**Why it happens:** Naive "pull if cloud newer" without checking local-modification timestamp. The cloud is "newer" only relative to local's *last-sync-receipt*, not local's *last-modification*.

**How to avoid:**
1. Track TWO local timestamps per slot: `lastSyncedAt` (= last successful pull/push) and `lastModifiedAt` (= last local change).
2. Conflict exists when `local.lastModifiedAt > local.lastSyncedAt` AND `cloud.lastSyncedAt > local.lastSyncedAt`. Show the conflict UI; don't auto-replace.
3. CONTEXT decision: "show conflict UI when both sides have changes since last sync" — research confirms this is the right framing.

**Warning signs:** User reports "the game ate my progress" after coming back online.

### Pitfall 5: Service Worker Caches Authenticated `/api/` Response, Leaks Across Users

**What goes wrong:** User A logs in on a shared device, plays. User B logs in. SW serves User A's cached `/api/user/profile` for a few seconds until network resolves and overwrites it.

**Why it happens:** Current `public/sw.js:60` uses `networkFirst` for `/api/`, which caches successes. Shared-device or post-logout pattern: stale auth data visible.

**How to avoid:**
1. Change `/api/` handler to NetworkOnly (no cache write).
2. On logout, `caches.keys()` → delete all caches with the `api` prefix.
3. Add `Vary: Cookie` server-side response header so even if cached, the cache key differs per session.

**Warning signs:** Two browser profiles on the same machine show each other's data briefly.

### Pitfall 6: `viewport-fit=cover` Without Safe-Area Padding = Content Under the Notch

**What goes wrong:** Adding `viewport-fit=cover` to the viewport meta makes the page render edge-to-edge — including UNDER the iPhone notch and home indicator. Top HUD and bottom buttons disappear behind hardware features.

**Why it happens:** `viewport-fit=cover` only opts INTO using safe-area-inset values; you must also apply them as CSS padding [CITED: ishadeed.com, css-tricks.com The Notch and CSS].

**How to avoid:** Ship the viewport meta change and the CSS padding change in the SAME commit:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
```

```css
/* src/components/Router/GameLayout.module.css */
.layoutRoot {
  padding-top: max(0px, env(safe-area-inset-top));
  padding-bottom: max(0px, env(safe-area-inset-bottom));
  padding-left: max(0px, env(safe-area-inset-left));
  padding-right: max(0px, env(safe-area-inset-right));
}
```

**Warning signs:** Top of HUD or bottom controls invisible on iPhone X+ devices.

### Pitfall 7: Whole-rex-library Import Inflates Bundle by 7+ MB

**What goes wrong:** Developer writes `import { VirtualJoystickPlugin } from 'phaser3-rex-plugins';` (default barrel export). Tree-shaking fails because the library uses CommonJS-flavored exports internally. Bundle grows by the whole 7.37 MB package.

**Why it happens:** rex-plugins is structured as a monolithic plugin pack; only the per-plugin paths (`phaser3-rex-plugins/plugins/virtualjoystick-plugin.js`) ship the standalone plugin.

**How to avoid:** Always import via the per-plugin path:
```javascript
// Correct:
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';
// Wrong:
import { VirtualJoystickPlugin } from 'phaser3-rex-plugins';
```

Add a bundle-size assertion to the build (e.g., fail if `phaser3-rex-plugins/**` chunk > 100 KB).

**Warning signs:** `dist/` size jumps by several MB after adding the joystick.

## Code Examples

### Verified Pattern: `pointer: coarse` Media Query Gate

```javascript
// Source: MDN @media (pointer)
// src/components/Mobile/TouchControls.module.css
.touchControlsRoot {
  display: none;
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 100;
}

@media (pointer: coarse) {
  .touchControlsRoot { display: block; }
  .touchControlsRoot > * { pointer-events: auto; }
}
```

### Verified Pattern: Resend SMTP via Nodemailer

```javascript
// Source: Resend + Nodemailer docs
// server/src/utils/sendMagicLinkEmail.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 465,
  secure: true,
  auth: { user: 'resend', pass: process.env.RESEND_API_KEY },
});

export async function sendMagicLinkEmail({ to, link }) {
  await transporter.sendMail({
    from: process.env.MAGIC_LINK_FROM_EMAIL,    // e.g., 'login@yourdomain.com'
    to,
    subject: 'Your Gogo Arabic login link',
    text: `Tap here to log in: ${link}\n\nThis link expires in 10 minutes.`,
    html: `<p>Tap here to log in: <a href="${link}">Open Gogo Arabic</a></p>
           <p style="color:#888;font-size:0.9em">This link expires in 10 minutes.</p>`,
    headers: { 'X-Entity-Ref-ID': crypto.randomUUID() },  // dedupe header for some scanners
  });
}
```

### Verified Pattern: Drain Outbox on `online` Event

```javascript
// Source: precedent in src/services/offlineSync.js + sync.js initSyncListeners
// src/services/cloudSync.js
import { drain } from './storage/outboxAdapter.js';
import { pushSlot } from './api.js';

export function initCloudSyncListeners() {
  const tryDrain = async () => {
    try { await drain(pushSlot); } catch { /* swallow; retry on next event */ }
  };
  window.addEventListener('online', tryDrain);
  window.addEventListener('focus', tryDrain);
  // Also drain immediately if we're already online at boot
  if (navigator.onLine) tryDrain();
  return () => {
    window.removeEventListener('online', tryDrain);
    window.removeEventListener('focus', tryDrain);
  };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Phaser Scale.RESIZE (current project setting) | Scale.FIT with `pixelArt: true` for pixel-art games | Phaser 3.15+ stable behavior | Crisp tiles on mobile; no sub-pixel drift |
| Password + email login | Passwordless magic-link / OTP | 2020-2023 (Slack, Notion, Vercel popularized) | Lower friction; no password reset infra needed |
| Hand-rolled SW with custom strategies | `vite-plugin-pwa` + Workbox | 2021+ | Better for greenfield; for an existing hand-rolled SW (Phase 72), migration cost > benefit |
| Whole-state push sync | Append-only mutation outbox | CRDT-era influence, mid-2020s | Survives offline; idempotent retries; cleaner conflict surface |
| `Authorization: Bearer` header | httpOnly JWT cookie + CSRF token | OWASP 2020+ | Removes XSS-stealable tokens. Project already uses this for `/login` but `src/services/api.js:5-7` still reads `localStorage.getItem('token')` — TECH DEBT to clean up during this phase |

**Deprecated/outdated:**
- Storing JWT in `localStorage` (current `src/services/api.js:5-7` does this; cookie-based path in `authController.js:15-21` is the new correct path).
- Magic-link `GET` endpoint that consumes on first fetch (pre-fetch scanners break it).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | rex VirtualJoyStick standalone bundle is "small" (no published number). | Standard Stack / Alternatives | Bundle could be larger than expected. Mitigation: add bundle-size check in Wave 0 |
| A2 | Resend free tier (3K/mo) is sufficient for project's foreseeable magic-link volume. | Standard Stack | If user signups exceed 100/day, upgrade to $20/mo plan. Cheap to switch later |
| A3 | iOS PWA storage isolation will affect a meaningful % of users. | Pitfall 1 | If <5% of users are iOS PWA installers, defer OTP-in-app fallback to a future phase |
| A4 | `phaser3-rex-plugins` works with project's current Phaser 3.90.0 (rex docs reference Phaser 3 and a separate `phaser4-rex-plugins` for v4). | Standard Stack | If incompatible, fall back to a different VJS plugin or hand-roll. **Verify before install in Wave 0** |
| A5 | Existing `gogo-arabic-idb` IDB DB_VERSION can be bumped from 1 to 2 to add `outbox` store without breaking Phase 27.1 data. | Pattern 4 / IDB migration | IDB versionchange events are well-defined; risk LOW. Verified by reading `indexedDBAdapter.js:62-75` onupgradeneeded pattern |
| A6 | `User` model `password` field can hold a random opaque value for magic-link-only users (never used for login). | Pattern 5 | Mongoose schema requires `password` minlength 6 [VERIFIED: `User.js:7`]. Random 32-byte hex passes. Future cleanup: make `password` optional |
| A7 | Existing `authLimiter` 5/15min/IP is appropriate for magic-link request rate-limit. | Standard Stack | If users frequently hit it (multi-user NAT), add a separate per-email limiter (5/hour/email) |
| A8 | Service worker scope `/sw.js` (root) is correct; no `/api/` registration override needed. | Architecture diagram | Verified by reading `swRegistration.js:18` — registers at `/sw.js`. Scope defaults to `/` |

## Open Questions

1. **Does iOS PWA magic-link failure need an OTP-in-app fallback in this phase?**
   - What we know: iOS PWA can't receive Safari's auth cookie after a magic link click.
   - What's unclear: Whether the project's user base meaningfully overlaps with iOS PWA installers.
   - Recommendation: Add a `checkpoint:human-verify` task in the plan asking the user to decide: ship OTP fallback now, or ship magic-link-only and accept iOS PWA limitation, or defer cloud sync feature on iOS PWA entirely.

2. **Cloud sync canonical source: live Redux state or `gogo_save_<n>` localStorage slot files?**
   - What we know: Two save sources exist — Redux/IDB (auto-persisted, "current play session") and 3-slot manual save files in localStorage ("snapshots user explicitly created").
   - What's unclear: Which one does "cloud save" cover — the manual snapshots, or a live mirror?
   - Recommendation: Cloud sync covers ONLY the 3 manual slots (matches CONTEXT "≤3 cloud save slots per account"). Live Redux/IDB state is single-device-only this phase.

3. **Existing `/api/game/save|load|resolve` routes (sync.js) — keep, replace, or co-exist?**
   - What we know: `src/services/sync.js` + `server/src/routes/game.js` already implement whole-state push with version vectors. Looks like an earlier sync attempt.
   - What's unclear: Is anything in the app actively calling these? (grep shows `sync.js` imports but no obvious dispatch site found in this research pass.)
   - Recommendation: Wave 0 task: audit whether `sync.js` is dead code. If dead, delete; if live, deprecate alongside new `/api/v1/cloudsave/*`.

4. **Should we add an OTP fallback to magic-link to handle email-prefetch scanners?**
   - What we know: Corporate scanners consume one-time tokens.
   - What's unclear: How much of the user base is on corporate email vs personal Gmail/iCloud.
   - Recommendation: Use the "render-a-button" pattern (verify is a POST, not GET) — solves scanner issue without OTP. OTP fallback only if scanner failures observed post-launch.

5. **Bundle-size budget for `phaser3-rex-plugins/plugins/virtualjoystick-plugin.js`?**
   - What we know: Whole rex package is 7.37 MB. Standalone plugin is much smaller. No published number found.
   - What's unclear: Exact KB.
   - Recommendation: Wave 0 task — install the package, build, run `npm run build:analyze`, measure. If >100 KB, look for alternatives.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js (≥18) | Server + Vite | ✓ | v24.13.0 [VERIFIED] | — |
| npm | Install | ✓ | 11.6.2 [VERIFIED] | — |
| MongoDB server | Server (User, new MagicLinkToken, CloudSave) | ✗ no `mongod` on PATH [VERIFIED] | — | Existing `server/.env.example` points to `mongodb://localhost:27017` — user runs Mongo locally or via Docker/Atlas. NOT a build blocker; runtime requirement. |
| `sqlite3` | Not needed (server uses Mongo) | ✓ | available [VERIFIED] | — |
| Playwright | E2E tests for boot → install PWA → magic-link → sync flow | ✓ | playwright.config.js exists; `playwright` 1.58.2 in devDeps [VERIFIED] | — |
| Resend account + API key | Magic-link email send (server runtime) | unknown [ASSUMED — needs human confirmation] | — | If user lacks Resend account, swap to `nodemailer` direct SMTP (Gmail SMTP works for dev) — but production needs proper SPF/DKIM domain |
| Custom domain with SPF/DKIM/DMARC | Production magic-link emails | unknown [ASSUMED — needs human confirmation] | — | Resend's shared `onboarding@resend.dev` works for dev/test only; production needs a verified sending domain |
| `slopcheck` CLI | Package legitimacy audit | ✗ [VERIFIED — pip not installed] | — | All recommended packages tagged `[ASSUMED]`; planner gates installs with `checkpoint:human-verify` |

**Missing dependencies with no fallback:** Resend account creation + sending-domain DKIM setup is a **prerequisite human task** for SYNC-01 to work end-to-end in production.

**Missing dependencies with fallback:** MongoDB local install — user already has the codebase running, so Mongo is presumably accessible; if not, Docker `mongo:7` image is the standard fallback.

## Validation Architecture

> Including this section per default policy — `.planning/config.json` has `workflow.nyquist_validation` unset (= enabled).

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `vitest` 3.0.0 (client) + `vitest` 4.0.18 (server) [VERIFIED: package.json] |
| Config file | `vitest.config.js` (implied; not directly read) + `server/vitest.config.js` [VERIFIED: ls server/] |
| Quick run command | `npm test -- <pattern>` |
| Full suite command | `npm run test:run` (client) + `cd server && npm run test:run` (server) |

E2E: Playwright (`playwright` 1.58.2) with `playwright.config.js` at repo root [VERIFIED].

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MOB-01 | Joystick mounts on `pointer: coarse`, mirrors cursor keys | unit (with `matchMedia` mock) | `npm test -- TouchControls` | ❌ Wave 0 — `src/components/Mobile/__tests__/TouchControls.test.jsx` |
| MOB-02 | Pointerdown in scene → InteractableManager.activate called | integration (Phaser scene mock) | `npm test -- TapToInteract` | ❌ Wave 0 |
| MOB-03 | Scale.FIT config produces integer-multiple canvas dims | unit (mock window dims) | `npm test -- game/config` | ❌ Wave 0 |
| MOB-04 | `env(safe-area-inset-*)` reachable in computed style | manual-only (jsdom can't simulate notch) | (visual on real iPhone) | manual |
| MOB-05 | `pointer:fine` → joystick hidden | unit (matchMedia mock) | `npm test -- TouchControls` | ❌ Wave 0 |
| MOB-06 | manifest.json validates against W3C schema | unit | `npm test -- manifest` | ❌ Wave 0; install required is real-device only |
| MOB-07 | SW returns cached app shell when offline | integration (msw + sw mock) | `npm test -- sw` | ❌ Wave 0 |
| SYNC-01 | requestMagicLink creates token, returns 200; verifyMagicLink consumes once | integration (server) | `cd server && npm test -- magicLink` | ❌ Wave 0 |
| SYNC-02 | outbox.enqueue + drain happy path; survives offline | integration (fake-indexeddb already in devDeps [VERIFIED]) | `npm test -- outbox` | ❌ Wave 0 |
| SYNC-03 | Boot pull replaces local when cloud is newer | integration | `npm test -- cloudSync.pull` | ❌ Wave 0 |
| SYNC-04 | Conflict detection + UI choice applies correctly | component test | `npm test -- ConflictResolutionModal` | ❌ Wave 0 |
| SYNC-05 | App fully functional with no cloud sync opt-in | integration (smoke) | existing test suite passes unchanged | (existing tests; verify no regression) |
| SYNC-06 | Old save (no `lastSyncedAt`) loads + saves correctly post-upgrade | unit | `npm test -- saveManager.migration` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- <touched test pattern>` (typically <5s)
- **Per wave merge:** `npm run test:run && cd server && npm run test:run` (full suite, 1-2 min target)
- **Phase gate:** Full vitest + Playwright smoke run green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/components/Mobile/__tests__/TouchControls.test.jsx` — covers MOB-01, MOB-05
- [ ] `src/game/systems/__tests__/TapToInteract.test.js` — covers MOB-02
- [ ] `src/game/__tests__/config.test.js` — covers MOB-03 (Scale.FIT math)
- [ ] `src/services/storage/__tests__/outboxAdapter.test.js` — covers SYNC-02
- [ ] `src/services/__tests__/cloudSync.test.js` — covers SYNC-03
- [ ] `src/components/Sync/__tests__/ConflictResolutionModal.test.jsx` — covers SYNC-04
- [ ] `src/services/__tests__/saveManager.lastSyncedAt.test.js` — covers SYNC-06
- [ ] `server/src/__tests__/magicLink.test.js` — covers SYNC-01 (integration, mongodb-memory-server already in devDeps [VERIFIED])
- [ ] `server/src/__tests__/cloudSave.test.js` — covers cloud save push/pull endpoints
- [ ] Playwright spec: `tests/e2e/mobile-sync.spec.ts` — end-to-end: install PWA, request magic link (with stubbed SMTP), redeem, sync, pull on second device simulation (use Playwright contexts)
- [ ] Test framework install — NONE needed (vitest, Playwright, fake-indexeddb, mongodb-memory-server all already in devDeps)

## Security Domain

`security_enforcement` not explicitly set in `.planning/config.json` → treated as enabled.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | **yes** | Magic-link token: random 32 bytes, bcrypt-hashed storage, 10-min TTL, single-use (`consumedAt`), constant-time bcrypt compare. Reuse existing JWT-cookie pattern post-verify [VERIFIED: authController.js:9-21] |
| V3 Session Management | **yes** | httpOnly + Secure (prod) + SameSite=Strict (prod) JWT cookie, 7-day expiry. Same flags for CSRF cookie [VERIFIED: existing pattern in authController.js:15-21] |
| V4 Access Control | **yes** | Cloud save endpoints require `authenticate` middleware [VERIFIED: middleware/auth.js exists]; per-user data filtered by `req.userId` |
| V5 Input Validation | **yes** | zod 3.x already on server [VERIFIED]; add `magicLinkRequestSchema` ({email: z.string().email()}) and `cloudSavePushSchema` ({slot: z.number().int().min(1).max(3), payload: z.record(z.unknown())}) with `<256KB` body limit. Express body limit already `1mb` [VERIFIED: app.js:62] — tighten to per-route 256KB for SYNC push |
| V6 Cryptography | **yes** | `crypto.randomBytes(32)` for token, `bcrypt.hash(token, 10)` for storage hash, `bcrypt.compare(rawToken, storedHash)` for verify. Never hand-roll or use `Math.random()` |
| V7 Error handling | yes | Existing `errorHandler.js` middleware — reuse. Magic-link verify failures return generic "Invalid or expired link" — don't leak why |
| V9 Communications | yes | All sync traffic over HTTPS (production); SW must not downgrade to HTTP. CORS already restricts origins via `CORS_ORIGINS` env [VERIFIED: app.js:39-58] |
| V10 Malicious code | yes | New deps `nodemailer`, `resend`, `phaser3-rex-plugins` — see Package Legitimacy Audit |
| V12 File and resources | n/a | No file uploads in this phase |
| V13 API and Web Service | yes | API versioning at `/api/v1/*` already in place [VERIFIED: app.js:83] — add magic-link and cloudsave under v1 |

### Known Threat Patterns for Express 5 + Mongo + JWT-cookie stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Account enumeration via magic-link request | Information Disclosure | Always return 200 from `requestMagicLink` regardless of whether email exists [CITED: pattern 5 example] |
| Magic-link token replay | Spoofing | Mark `consumedAt` BEFORE issuing JWT cookie; bcrypt-hashed token in DB so even DB leak doesn't yield plaintext token |
| Email pre-fetch consuming token | Spoofing / DoS | Render a confirmation page on GET; perform actual verify on POST (button click) [CITED: obie.medium.com prefetching] |
| Magic-link brute force | Spoofing | 32 random bytes = 2^256 search space — infeasible. Plus per-IP rate limiter (existing `authLimiter`) + per-email rate limiter (new) |
| CSRF on POST magic-link verify | Tampering | Existing CSRF middleware applies to all POST routes [VERIFIED: app.js:80] |
| Cookie theft via XSS | Spoofing | `httpOnly` JWT cookie already set [VERIFIED: authController.js:16] — XSS can't read |
| Cookie sent in cross-site request | Tampering | `SameSite=Strict` in production [VERIFIED: authController.js:18] |
| Mongo injection via email lookup | Tampering | Mongoose schema validation; `email.toLowerCase().trim()` before query; no `$where` operators used |
| Cloud save payload exhaustion (DoS via large body) | DoS | Per-route body limit 256KB; CONTEXT cap. Use `express.json({ limit: '256kb' })` middleware on cloudsave routes |
| Cross-user cloud save leak | Information Disclosure | All queries filter by `req.userId` from authenticated cookie; never trust slot user-supplied user ID |
| SW caches authenticated response, leaks across users | Information Disclosure | Switch `/api/` SW strategy from `networkFirst` to `NetworkOnly`; clear caches on logout [Pitfall 5] |
| Stored XSS via magic-link redirect URL | XSS | Hardcode the redirect target `/?magic_link_success=1`; do NOT echo user-supplied `?next=` parameter |

## Sources

### Primary (HIGH confidence)
- Existing codebase (all `[VERIFIED]` tags) — direct file reads of `server/src/app.js`, `server/src/controllers/authController.js`, `server/src/models/User.js`, `server/src/middleware/rateLimiter.js`, `server/package.json`, `src/game/config.js`, `src/game/PhaserGame.jsx`, `src/game/sprites/Player.js`, `src/services/storage/indexedDBAdapter.js`, `src/services/storage/migrations.js`, `src/services/saveManager.js`, `src/services/sync.js`, `src/services/api.js`, `src/services/offlineSync.js`, `src/services/swRegistration.js`, `public/sw.js`, `public/manifest.json`, `index.html`, `package.json`, `vite.config.js`
- `.planning/phases/27-indexeddb-migration/27.1-RESEARCH.md` and `27.1-VERIFICATION.md` — Phase 27.1 architecture decisions
- npm registry queries (2026-05-26): `phaser3-rex-plugins@1.80.20`, `nodemailer@8.0.9`, `resend@6.12.4`, `vite-plugin-pwa@8.0.9`, `phaser@4.1.0`, `bcryptjs@3.0.3`, `express-rate-limit@7.5.1`, `workbox-window@7.4.1`
- [Phaser 3 ScaleManager docs](https://docs.phaser.io/api-documentation/class/scale-scalemanager) — FIT vs RESIZE semantics
- [MDN env() CSS function](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env) — safe-area-inset-* spec
- [W3C WCAG 2.1 SC 2.5.5 Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html) — 44×44 minimum target size

### Secondary (MEDIUM confidence)
- [rex-plugins VirtualJoyStick docs](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/virtualjoystick/) — integration recipe
- [vite-plugin-pwa generateSW docs](https://vite-pwa-org.netlify.app/workbox/generate-sw) — runtime caching pitfalls + 2 MiB precache cap
- [Progressier — Can you use magic links in a PWA?](https://intercom.help/progressier/en/articles/10433517-can-you-use-magic-links-in-a-pwa) — iOS PWA storage isolation
- [Obie Fernandez — Prefetching breaks magic link login](https://obie.medium.com/prefetching-breaks-magic-link-password-less-login-systems-unless-you-take-precautions-a4c011a3e165) — email-scanner mitigation
- [oneuptime.com — Implement Magic Link Authentication](https://oneuptime.com/blog/post/2026-01-21-redis-magic-link-authentication/view) — token lifecycle pattern
- [2026 email pricing comparison](https://www.buildmvpfast.com/api-costs/email) — Resend / Postmark / SES tradeoffs
- [css-tricks.com — The Notch and CSS](https://css-tricks.com/the-notch-and-css/) — viewport-fit=cover + env(safe-area-inset-*) recipe
- [Supernapie — Support retina with Phaser 3](https://supernapie.com/blog/support-retina-with-phaser-3/) — devicePixelRatio handling (counter-example for pixel art)

### Tertiary (LOW confidence)
- [Phaser issue #7213 — Scale Manager orientation change bug](https://github.com/phaserjs/phaser/issues/7213) — known issue 3.85.0+; project is on 3.90.0 [VERIFIED]
- WebSearch results on rex VJS bundle size — no authoritative published number; standalone import path *should* be small but unverified [ASSUMED]
- [Magicbell PWA iOS limitations 2026](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide) — secondary corroboration of iOS PWA storage isolation

## Metadata

**Confidence breakdown:**
- Standard stack (server-side: nodemailer + Resend + existing JWT): HIGH — all stack pieces validated against npm + existing server code
- Standard stack (client-side: rex VirtualJoyStick standalone bundle size): LOW — exact bundle KB not published; planner must measure in Wave 0
- Architecture (IDB outbox + last-write-wins + conflict UI): HIGH — pattern matches existing `offlineSync.js` precedent and CONTEXT decisions
- Pitfalls (iOS PWA, email pre-fetch, scale jitter, SW cache leak, viewport-fit): HIGH — corroborated by multiple secondary sources + spec-level MDN docs
- Magic-link UX on iOS PWA: MEDIUM — documented limitation but mitigation strategy (OTP-in-app) conflicts with CONTEXT "magic link" decision; needs discuss-phase

**Research date:** 2026-05-26
**Valid until:** 2026-07-25 (60 days — server stack mature, Phaser 3 stable, rex VJS unchanged for years, only Resend pricing might shift)
