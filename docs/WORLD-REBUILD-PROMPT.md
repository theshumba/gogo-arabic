# Gogo Arabic — Complete Visual World Rebuild (kickoff prompt)

ultracode

You are working in `~/Documents/GitHub/gogo-arabic` (Phaser 3 Arabic-learning RPG, 16px Kenmi pixel art on a 64px tile grid). Create branch `feat/world-rebuild` off `main`.

## The mission
**Rebuild the entire visual world from scratch.** Throw away every existing zone layout — no patching, no reusing the current maps' geometry. Design and build a coherent, believable, walkable Arabian world as if it were being made for the first time: you walk out of a house onto a road, the road leads through the village to the bazaar, the bazaar has stalls, houses have exteriors you walk around and interiors you can enter, sand is sand, water is water. A place someone *designed*.

**What is untouchable:** all game logic — quests, dialogue, NPCs, FSRS/learning system, Redux, battles, curriculum. The existing zone IDs, NPC names, object/interactable IDs and exit connectivity are a preserved contract (see `WORLD-VS-LOGIC-CONCERN.md` in repo root): logic plugs back into the new world; only coordinates and layouts change.

## Context — read first
1. `docs/VISUAL-CLOSEOUT.md` — every rendering BUG was fixed and verified 2026-07-02. The pipeline works: scales are coherent, sprites crop correctly, Arabic shapes correctly, the authored-Tiled-map path is proven (oasis-village.json). **Do not re-open bug hunting or touch the scale/crop rules in MapLoader.** Your problem is DESIGN, not defects.
2. `WORLD-VS-LOGIC-CONCERN.md` — the world/logic contract above.
3. Capabilities that already exist — audit and REUSE, don't rebuild: `src/game/scenes/InteriorScene.js` (interiors), authored Tiled maps in `public/assets/maps/` (incl. legacy .tmx interiors like house.tmx), the Tiled MCP server at `.mcp/tiled-mcp-server` (43 tools incl. AutoMapping), screenshot harness `npm run capture:world-screenshots` → `docs/world-shots/` (dev server: `npm run dev`, localhost:3000), full asset library under `public/assets/kenmi/` (base/desert/characters/dungeons/militarycamp/ui + seasonal packs).

## Inputs from Melusi
Reference screenshots live in `docs/world-references/` — he has filled it with shots from games whose worlds look and feel the way Gogo Arabic should (Pokémon towns, Stardew, Animal Crossing, etc.). View EVERY image there with the Read tool before designing anything. If the folder is missing or empty, STOP and ask him to drop the images in — do not design without references.

## Phase 0 — Research + Design Bible (no map building yet)
Deploy research agents to produce `docs/WORLD-DESIGN-BIBLE.md`:
- **Reference analysis:** from Melusi's screenshots + outside research (level-design patterns, open-source Tiled maps like Tuxemon/Solarus as structural study material — licence check before copying anything), extract the rules that make those worlds read well: path language (widths, curves, where paths lead), building clustering, focal points, density budgets, edge treatments, water placement, prop rhythm.
- **Asset inventory:** catalogue what `public/assets/kenmi/` can actually build (tiles, buildings, props, characters, animals, interior tilesets). Anything the design wants but assets can't support goes on `docs/WORLD-MISSING-ASSETS.md` and is SKIPPED cleanly — never faked with wrong art.
- **Placement law (machine-enforceable):** write a map-lint script (`scripts/lint-world-map.mjs`) that validates every map against hard rules derived from Melusi's complaints: no overlapping placed objects, no object on water/walls unless flagged, rugs/carpets only on plausible ground, density caps per region (e.g. max animals per area, min spacing), every door reachable by path, every exit connected. This linter runs on every zone before commit, forever.

## Phase 1 — World design on paper
For each of the 8 zones (oasis_village, desert_marketplace, royal_palace, bedouin_camp, mountain_village, coastal_port, ancient_library, farmland): a written layout plan (tile-grid sketch: districts, roads, water, building placement, where each existing NPC/interactable/exit lands at an analogous point of interest) + which buildings get enterable interiors (reusing InteriorScene). Plus a one-page world connection map. Save as `docs/world-designs/`. These plans are cheap to change; maps are not — get them right first.

## Phase 2 — Proof zone: Oasis Village, end to end
Build it fully from its design: authored Tiled map, re-skinned with existing Kenmi assets only (verify every asset key exists), all contract objects placed, at least one enterable house interior working, map-linter clean, full vitest suite green. Then produce ONE side-by-side image (new zone screenshots vs the reference shots it was designed from) in `docs/world-shots/`.
**STOP. Show Melusi the side-by-side and wait for his approval. Do not touch any other zone until he says yes.** If he rejects, iterate on Oasis only.

## Phase 3 — The remaining 7 zones
One at a time after approval: design → build → lint → tests → one taste-gate screenshot for Melusi per zone. One atomic commit per zone (`feat(world): rebuild <zone>`); a rejected zone must revert cleanly without touching others.

## Phase 4 — Close-out docs
`docs/WORLD-REBUILD-CLOSEOUT.md`: what was built, per-zone evidence screenshots, the missing-assets wishlist, and a region blueprint (how the zones connect as one walkable region — routes, "letter schools" as gym-equivalents — as the plan for a future milestone; doc only, no logic changes).

## Hard rules
- Existing assets only; nothing invented, nothing downloaded without a licence check.
- Never stage pre-existing unrelated dirty files (check `git status` first: package.json, public/sw.js, src/routes.jsx, src/services/swRegistration.js, vite.config.js, test-results/).
- Full vitest green before every zone commit (regenerate world-snapshot fixtures only for intentional changes, the way commit a0c2c45 did).
- No silent gaps: anything skipped, capped, or deferred is written down.
- Melusi approves by LOOKING at screenshots only — never ask him to play-test anything unverified. Commit messages end with:
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
