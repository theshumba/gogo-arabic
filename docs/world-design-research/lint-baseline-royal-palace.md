# Lint baseline — royal_palace (Phase 3 build, 2026-07-03)

`node scripts/lint-world-map.mjs royal_palace` → **exit 0, 0 errors, 12 warnings.**
All 12 are LINT-10 LAW-44 "straight district boundary" WARNs. Triage below; none are
linter false positives — every one is a REAL straight ground seam that the approved
design draws deliberately, in classes the bible itself licenses. No rules weakened.

## Triaged warnings (REAL — accepted, design-licensed)

| # | Finding | Why accepted |
|---|---|---|
| P3RP-1 | pave/sand boundary 19 long at (16,10) | The terrace front: pavement rows y10–12 (x16–34) meeting the palace-massing footprint's sand underlay (y9) and flank sands. The terrace is the LAW-29 ceremonial composition; the massing sprites cover the y9 sand in render. Same architecture-edge class as oasis P2-2..P2-4. |
| P3RP-2..9 | hedge-curb/sand boundaries 12–14 long at (3,21) (31,21) (4,22) (32,22) (32,28) (4,29) (31,29) (3,30) + 9-long at (3,21) | The two hedge-ringed garden rooms. The seam is the 1-tile pavement curb painted UNDER the `h` hedge line (the MISSING-ASSETS #5 grass↔sand workaround, design §8.10) vs the surrounding sand; in render the hedge sprite covers the curb, so the visible boundary is hedge, not ground. Rectangular garden rooms are the approved §3 geometry (Zelda Eastern-Palace hedge-room grammar). |
| P3RP-10 | sand/pave boundary 10 long at (27,24) | The ceremonial axis (x24–26) between inner gate and south gate — the ONE licensed straight >8 run (LAW-2/LAW-29; design §3 composition note). |
| P3RP-11 | cliff boundary 20 long at (48,16) | Map-rim container column (east sea-cliff outer edge at x48–49). LAW-41 container exemption, same class as the accepted oasis map-edge WARNs; the player-facing cliff edge (x45–47) jogs per LAW-48. |

## LINT-4 fixes applied during the pass (zones.js dressing, not map)

The grid's 23 contract palms + obelisk pillars already near-fill the LAW-31 ≤15/window
budget in the garden bands, so optional dressing was thinned until every window ≤15:
removed shore rock (28,3), vista bones (35,19), one flower per garden ((7,23)/(34,27)),
both garden grass-anims ((5,24)/(40,25)), the inner-gate flag pair ((21,20)/(29,20)),
wall-break jars (45,17), service barrel (8,30), SE grove tuft (40,31). Final worst
window = 15 exactly.

`--all` after the build: oasis_village + desert_marketplace unchanged (their accepted
baselines only), total 0 errors.
