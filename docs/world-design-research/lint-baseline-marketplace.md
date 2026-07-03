# Lint baseline — desert_marketplace (Phase 3 zone build, 2026-07-03)

`node scripts/lint-world-map.mjs desert_marketplace` → exit 0, **0 errors, 1 warning**.

## Triaged warnings (accepted, not fixed)

**P3-M1 — LINT-10 LAW-44 WARN: straight sand/other district boundary 9 tiles long at (0,19).**
The south edge of the main caravan road (cobble, family `other`) runs straight along
x0–x8 where row 18 road meets row 19 sand — 9 boundary tiles vs the >8 cap, the extra
tile being the west exit cut at (0,18) joining the run. REAL but accepted: the design's
adversarial review explicitly accepted the west-gate→plaza→warehouse road as the zone's
deliberate straight commercial axis (LAW-2 note, "screenshot-reviewed, not
machine-checked"), and re-scalloping the approved §3 road contour to shave one boundary
tile would change approved geometry for no compositional gain. Screenshot-review call,
same class as oasis P2-2..P2-4.

## Notes

- No linter rule changes were needed for this zone (the water-sheet false-positive fix
  from the oasis pass, P2-1, is already in). The new tilesets this zone introduces
  (`cobble-road-2`, `pavement-tiles`, `desert-fencewall`) classify as family `other` and
  interact with LINT-10 exactly as intended: cobble↔pavement seams are family-internal
  and free; cobble/pavement↔sand seams are counted.
- Walls/towers are painted as `desert-fencewall` tiles on the GroundDetail layer with
  sand Ground beneath, so LAW-44 family runs are unaffected by the perimeter wall.
