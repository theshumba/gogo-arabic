---
phase: 19-infrastructure-architecture
plan: 04
status: DONE
commits: [86a0436, 4aa9e84]
---

# 19-04 Summary: SceneStackManager + Zod Dialogue Validation

## What was done

### Task 1: SceneStackManager + WorldScene Integration
Created `SceneStackManager` for building entry/exit scene lifecycle (push/pop via pause/launch/resume). Integrated into WorldScene following the canonical delegation pattern.

### Task 2: Zod Dialogue Schema + Build-Time Validation
Installed Zod, created `dialogueSchema.js` validating NPC data structure, and added a Vite plugin that validates `npcs.json` at build time. Malformed data fails the build with clear error messages.

## Artifacts created/modified

| File | Action | Purpose |
|------|--------|---------|
| `src/game/systems/SceneStackManager.js` | Created (63 LOC) | push/pop scene lifecycle for building entry/exit |
| `src/game/systems/__tests__/SceneStackManager.test.js` | Created (100 LOC) | 7 unit tests covering push/pop/destroy/nesting |
| `src/game/scenes/WorldScene.js` | Modified (+8 LOC) | Import, create, and destroy SceneStackManager |
| `src/data/dialogueSchema.js` | Created (58 LOC) | Zod schema + validateDialogueData() |
| `vite.config.js` | Modified (+20 LOC) | Build-time NPC data validation plugin |
| `package.json` | Modified | Added `zod` dependency |

## Verification
- `npx vitest run` — 558 passing (+7 new), 3 pre-existing failures (unchanged)
- `npx vite build` — passes with `[validate-dialogue] NPC data validated successfully`
- Main bundle: 280.57KB (under 500KB limit)
- WorldScene: `SceneStackManager` created in `create()`, destroyed in `shutdown()`
- Zod validation only runs at build time (not during dev server start)
- `prefers-reduced-motion` comment stub in SceneStackManager for future animations

## Key decisions
- Schema uses `.passthrough()` on all objects to allow extra NPC fields without validation
- Choice `next` field allows `null` (meaning end of conversation branch)
- Validation runs in Vite `buildStart` hook, gated to production builds only
- Zod is tree-shaken from runtime bundle (only imported dynamically by build plugin)
