# Gogo Arabic — World Beauty v2 + HUD Fix (kickoff prompt)

ultracode

You are working in `~/Documents/GitHub/gogo-arabic` (Phaser 3 Arabic-learning RPG, 16px Kenmi pixel art on a 64px tile grid). Work on a new branch `feat/world-beauty-v2` off `main`.

## Context — read these repo docs FIRST, in this order
1. `docs/VISUAL-CLOSEOUT.md` — the visual layer was CLOSED 2026-07-02: every rendering BUG (scales, sprites, textures, borders, labels, Arabic shaping) is fixed and verified. **Do NOT re-open bug hunting. Do NOT touch the rendering pipeline (MapLoader scale rules, croppedPropScale, nativeObjectScale, NPC/Player normalization).** Frozen evidence screenshots: `docs/world-shots/`.
2. `WORLD-VS-LOGIC-CONCERN.md` (repo root) — world and logic are decoupled; the contract is: zone IDs, NPC names, quest hooks, object IDs and exits must be PRESERVED. Only their x/y coordinates may move (in `src/data/zones.js` and the Tiled maps).
3. `docs/VISUAL-FIX-OPTIONS.md` — background on the architecture (8 zones; oasis_village runs on an authored Tiled map under `public/assets/maps/`, the other 7 are procedural via `src/data/zones.js` + MapLoader).

**The problem you are solving is DESIGN, not defects:** the maps render correctly but were never composed by anyone — blocky grass rectangles, paths to nowhere, no focal points. Your job is to give each zone a real, human-quality layout. Melusi's bar: "Pokémon / Stardew / Animal Crossing town quality."

Tooling: dev server `npm run dev` (localhost:3000). Screenshot harness `npm run capture:world-screenshots` → `docs/world-shots/` (captures pure game pixels, UI hidden). Tests: `npx vitest run`. A Tiled MCP server with an AutoMapping engine is committed at `.mcp/tiled-mcp-server` if useful. Never stage pre-existing unrelated dirty files (check `git status` first; e.g. package.json, public/sw.js, src/routes.jsx, src/services/swRegistration.js, vite.config.js, test-results/). Commit style: `fix(hud):` / `feat(world):`, atomic, one commit per zone.

## Track 1 — HUD overlap fix (do this FIRST, it is small and independent)
The HUD elements overlap because each is positioned independently with no layout rules. Known defects (screenshots from Melusi, 2026-07-02):
- Quest tracker ("The Scholar's Path") renders UNDER/OVER the top-left stats bar (Lv/XP/water bars) — unreadable collision.
- The day/night clock card (top-right, "15:58 العصر") covers the buttons behind it (CERT/trophy row).
Task: inventory ALL HUD elements (React overlay in `src/` + any Phaser scrollFactor-0 UI), define anchor regions so overlap is impossible (quest tracker positioned below the MEASURED stats-bar height; clock clamped clear of the button row; zone card bottom-right), fix, then verify with UI-VISIBLE screenshots (Playwright full-page, NOT the pixel harness) at viewport widths 1280, 1512 and 1920. All three must show zero overlapping/clipped HUD elements. Commit as its own atomic commit(s) before starting Track 2.

## Track 2 — World maps via skeleton transplant
Do the zones ONE AT A TIME with a hard human gate after the first.

**Phase 0 — Source hunt + licence check.** Find human-authored map STRUCTURE to transplant:
- Open-source Tiled maps: Tuxemon (towns + routes, .tmx), Solarus quests, sample maps shipped with tileset packs, Phaser RPG example repos. For each candidate map, CHECK ITS LICENCE: permissive (CC0/CC-BY/MIT) → you may transplant the .tmx skeleton directly (with attribution if required); share-alike or proprietary → use it as a VISUAL reference only and rebuild the layout by eye (composition is not copyrightable — this also covers Pokémon/Stardew/Animal Crossing screenshot references).
- Collect 2–3 reference screenshots per zone archetype (desert village, market town, palace, camp, mountain village, port, library district, farmland).

**Phase 1 — PROOF ZONE: Oasis Village v2.** Pick the best-matching town skeleton. Re-express it as the authored Tiled map (`public/assets/maps/oasis-village.json` pipeline already works): organic paths that lead somewhere, houses clustered around a focal point (the pond/well), palm groves, a plaza. Re-skin entirely with EXISTING Kenmi assets (verify every asset key exists in `public/assets/`; invent nothing). Place every existing NPC, interactable, gathering spot and exit from `src/data/zones.js` at analogous points of interest (shop-spot → souk stall, centre-spot → madrasa/fountain). Preserve the zone contract (IDs unchanged, coordinates updated). Verify: tests green, screenshot the result, and produce ONE side-by-side image (new map vs reference) saved to `docs/world-shots/`.
**Then STOP and show Melusi the side-by-side. Do not proceed to any other zone until he approves.** If he rejects, iterate on Oasis only.

**Phase 2 — Remaining 7 zones,** one at a time after approval, same loop (skeleton → re-skin → contract-preserving object placement → tests → one taste-gate screenshot per zone for approval). Zones: desert_marketplace (souk town), royal_palace (palace + gardens), bedouin_camp, mountain_village, coastal_port, ancient_library, farmland. Either migrate each to an authored Tiled map (preferred, matches oasis) or re-author its zones.js layout — pick per zone by whichever executes more reliably, and say which you chose.

**Phase 3 — Region blueprint (DOC ONLY, no build).** Write `docs/REGION-BLUEPRINT.md`: how the 8 zones connect as one walkable Pokémon-style region — routes between towns, gyms → "letter schools", badges → certificates, suggested progression order tied to the Arabic curriculum. This is the plan for a FUTURE milestone; do not change any game logic now.

## Hard rules
- Game logic is untouchable: quests, dialogue, FSRS, Redux, battle, curriculum. Zone/NPC/object IDs and exit connectivity are a preserved contract.
- One atomic commit per zone; a rejected zone must revert cleanly without touching others.
- Full vitest suite must be green before each zone commit (regenerate world-snapshot fixtures only when the change is intentional, the way commit a0c2c45 did).
- If you bound coverage or skip anything, say so explicitly — no silent gaps.
- Melusi's approval gates are the only visual sign-off: one screenshot per zone, yes/no. Never ask him to play-test a broken build.
