# World Rebuild — Inline Execution Prompt (Phase 3)

Paste everything below the line into a fresh Claude Code session opened in this repo.
One paste = one zone, built end to end, then a hard stop for Melusi's screenshot approval.
Repeat until all 7 remaining zones are done; the final paste produces the closeout doc.

---

Work **inline in this session only — do NOT use the Workflow tool, do NOT spawn subagents or agent teams, no ultracode**. This is a token-conscious sequential build; you have everything you need in the repo.

You are continuing the Gogo Arabic visual-world rebuild (Phaser 3, 16px Kenmi art, 64px tile grid) on branch `feat/world-rebuild` — verify you're on it before touching anything. Phases 0–2 are committed: Design Bible + linter (`3fa5e86`), all 8 zone designs (`3924b73`), and the oasis_village proof zone (`cc3df39`), which Melusi approved. Your job now: build exactly ONE more zone, then stop.

**Step 0 — pick the zone.** Build order: desert_marketplace, royal_palace, bedouin_camp, mountain_village, coastal_port, ancient_library, farmland. Run `git log --oneline --grep="feat(world): rebuild"` and take the first zone in that order with no rebuild commit. If all 7 have commits, skip to Step 8 (closeout) instead.

**Step 1 — load ground truth.** Read, in this order: `docs/world-designs/<zone>.md` (the approved design — build EXACTLY this, ASCII grid + placement table are canonical), `docs/WORLD-DESIGN-BIBLE.md` (the LAWs + collision doctrine), `docs/world-design-research/contract-and-pipeline.md` (Tiled template, contract ids, hardcoded-coordinate checklist §5–6, fixture policy), and skim `docs/world-designs/oasis_village.md`'s build-notes appendix for precedents.

**Step 2 — generate the map.** Run `node scripts/generate-map-from-design.mjs <zone>` to produce `public/assets/maps/<zone kebab-case>.json`. First back up the current map file as `<name>.json.pre-rebuild` (untracked). The generator was built to parse any design doc; if this zone's design uses legend chars, tilesets, or autotile families the generator doesn't know yet (e.g. sea water, mountain rock, farmland crops), EXTEND the generator — never write a one-off script and never hand-edit the JSON output. Verify every GID/texture key you map actually exists in the tilesets (existing Kenmi assets only; anything missing goes in `docs/WORLD-MISSING-ASSETS.md`, no silent gaps).

**Step 3 — wire the logic.** Update `src/data/zones.js` (and `src/data/gatheringSpots.js` if the zone has spots): every NPC, interactable, gathering spot, exit/entry coordinate to the design's placement table. Contract ids NEVER change — coordinates only. Then walk the hardcoded-coordinate checklist in contract-and-pipeline.md for this zone and update any hits (note old→new). Trace each enterable door to its interior id per contract §8.

**Step 4 — lint until clean.** Loop `node scripts/lint-world-map.mjs <zone>` until exit 0. Fix at the right layer (generator → regenerate, zones.js, or design doc with written justification). Linter false positives: fix the linter, negative-test the fix, record in `docs/world-design-research/lint-baseline-<zone>.md` — never weaken a rule. Finish with `--all` to confirm previously-built zones (oasis + earlier Phase-3 zones) still pass.

**Step 5 — full vitest green.** `npx vitest run` (long timeout). Regenerate ONLY this zone's world-snapshot fixture (intentional layout change, policy per commit a0c2c45). Any other fixture changing, or any logic/quest/FSRS/battle failure = you broke wiring; fix it, never regenerate around it.

**Step 6 — look at it and fix what you see.** Dev server up (`npm run dev`, check port 3000 free first), run the capture harness (`npm run capture:world-screenshots`), then Read the zone's PNG(s) in `docs/world-shots/` and judge against the design concept and the Bible: designed composition (anchor, path language, clusters, entrance framing), no black diamonds, no broken autotile seams, no floating props, no blocked doors. Fix → re-lint → re-capture → re-look until genuinely good. Then a live Playwright probe: walk from spawn along the main road; enter the designated door → interior loads → exit back. Kill the dev server. NEVER ask Melusi to play-test — screenshots only.

**Step 7 — side-by-side + commit.** Compose ONE comparison PNG at `docs/world-shots/<zone-kebab>-rebuild-side-by-side.png` (~2000px: left = the reference images named in the design doc §0, from `~/Desktop/Gogo-World-References/`; right = new captures, clear labels — follow the oasis one's format). Read it to confirm it renders. Self-gate honestly: re-run lint + vitest, spot-check 12 contract ids, `git diff src/game/systems/MapLoader.js` must be EMPTY (its scale/crop rules are untouchable), `git status` must show no stray changes. Then ONE atomic commit `feat(world): rebuild <zone>` containing only: the map JSON, zones.js/gatheringSpots.js, any checklist-listed coord files, generator/linter changes, lint-baseline doc, design-doc appendix, this zone's fixture, this zone's shots (`git add -f` — docs/world-shots/ is gitignored). NEVER stage: package.json, public/sw.js, src/routes.jsx, src/services/swRegistration.js, vite.config.js, test-results/, or pre-existing untracked junk. End the commit message with:
`Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

Then copy the side-by-side to `~/Desktop/Gogo World Rebuild - Progress 3 Jul/` with a numbered label, tell Melusi the one-line verdict + any honest caveats, and **STOP. Do not start another zone — Melusi approves each zone by looking at the side-by-side.**

**Step 8 — closeout (only when all 7 zones are committed).** Write `docs/WORLD-REBUILD-CLOSEOUT.md`: per-zone summary (commit, deviations, triaged warnings), generator/linter evolution, missing-assets ledger, and what "done" looks like vs the original `docs/WORLD-REBUILD-PROMPT.md`. Commit it (`docs(world): rebuild closeout`) and stop.

**Session learnings from the desert_marketplace build (2026-07-03, commit 58cb88b) — read before Step 1:**
- The generator now has a per-zone **PROFILE engine** (`ZONE_PROFILES` in generate-map-from-design.mjs): each zone declares its own glyph→class map + tilesets, because legend chars conflict across design docs. oasis_village stays on the legacy path — after ANY generator change, regenerate oasis and `git diff` it: must stay byte-identical. Add a profile entry for your zone; marketplace's is the template. Non-desert zones (mountain snow, coastal, farmland grass) may need new tilesets — verify every sheet's frames pixel-by-pixel (render a 6x upscale and LOOK) before mapping GIDs; several sheets have fully transparent frames that must never be placed.
- **Port 3000 is often Melusi's other project's dev server — never kill it.** Run `npm run dev -- --port 3001 --strictPort` and `GOGO_BASE_URL=http://localhost:3001 npm run capture:world-screenshots`.
- The capture harness recaptures ALL 8 zones; other zones' PNGs diff by animation-frame noise — `git checkout` them before committing so the zone commit stays atomic.
- `docs/world-shots/` is gitignored: `git add -f` this zone's PNG + side-by-side. Fixture regen: `CAPTURE_WORLD_SNAPSHOTS=1 npx vitest run src/test/fixtures/captureViaVitest.test.js` — only the built zone's fixture may diff.
- Probe pattern: copy `scripts/.probe-market.tmp.mjs` (untracked) — full-map zoom shot, district closeups, walk probe, door→interior→exit probe. Interactables verified rendering via a live sprite dump when a sprite looks missing (crates are low-contrast, not absent).
- Sprite legality: any spritesheet prop needs a PROP_CROP_REGIONS row or ANIMATED_DECO_PROPS entry (MapLoader is CLOSED — don't add rows; substitute or defer with an appendix note, oasis-camel precedent). Door interactables self-render a blue marker rug at the door — only author an extra door rug if the stacked shopfront-display look is wanted.
- Reference collages: some files in Gogo-World-References are vgmaps rips (town + interiors + menus in one image) — crop the town region for the side-by-side (CSS overflow crop in the compositor HTML; sips --cropOffset is unreliable).
