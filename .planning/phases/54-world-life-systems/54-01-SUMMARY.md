---
phase: 54-world-life-systems
plan: "01"
subsystem: economy
tags: [economy, shop, pricing, supply-demand, faction]
dependency_graph:
  requires:
    - factionSlice (alignment scores for getFactionModifier)
    - economySlice (supplyLevels state)
    - worldStateMiddleware (time/advanceTime hook for restoreSupply)
  provides:
    - pricingAgent.js — calculateDynamicPrice + getFactionModifier pure functions
    - supplyLevels in economySlice — per-shop per-item stock tracking
    - price direction indicators in ShopInventory
  affects:
    - shopGenerator.js — all item prices now dynamic (supply × faction modifier)
    - ShopOverlay — dispatches initSupply + decreaseSupply on open/buy
tech_stack:
  added: []
  patterns:
    - Pure-function pricing module (no Redux imports in pricingAgent.js)
    - Idempotent supply init (initSupply skips already-initialized items)
    - Time-based restoration hooked into worldStateMiddleware advanceTime handler
key_files:
  created:
    - src/game/systems/pricingAgent.js
  modified:
    - src/store/slices/economySlice.js
    - src/data/shopGenerator.js
    - src/store/middleware/worldStateMiddleware.js
    - src/components/Shop/ShopOverlay.jsx
    - src/components/Shop/ShopInventory.jsx
    - src/components/Shop/ShopInventory.module.css
decisions:
  - name: "factionDiscount line removed from shopGenerator"
    context: "Old 0.85 hardcoded discount at reputation >= 75 duplicated ECON-03 logic"
    outcome: "Replaced entirely by getFactionModifier() which also handles hostile markup (1.15)"
  - name: "priceModifiers state kept in economySlice but not used in shopGenerator"
    context: "External systems may still set priceModifiers; removing the key would be a breaking change"
    outcome: "priceModifiers state preserved; only the read in shopGenerator was removed (unused var eliminated)"
metrics:
  duration: "4 minutes"
  completed: "2026-03-20"
  tasks_completed: 2
  tasks_total: 2
---

# Phase 54 Plan 01: Dynamic Supply/Demand Pricing Summary

**One-liner:** Supply/demand economy with per-item stock tracking, faction discounts/markups, and red/green price direction arrows in the shop UI.

## What Was Built

### ECON-01: PricingAgent (pure functions)
`src/game/systems/pricingAgent.js` — zero Redux imports, testable in isolation.

- `calculateDynamicPrice(basePrice, supply, factionModifier)` — applies `base * (max/current) * modifier`, clamped to floor 50% / ceiling 200%.
- `getFactionModifier(shopFaction, factionAlignment)` — returns 0.85 (allied, score >= 75), 1.15 (hostile, score <= 10), or 1.0 (neutral).
- `SUPPLY_DEFAULTS` — max supply pools by rarity: common=10, uncommon=7, rare=5, epic=3, legendary=2.

### ECON-02: economySlice supply state
Added `supplyLevels: {}` to `economySlice` initial state plus three new reducers:
- `initSupply({ shopId, items })` — idempotent; only seeds items not yet tracked.
- `decreaseSupply({ shopId, itemId, amount })` — decreases current stock, clamped to 0.
- `restoreSupply({ shopId, restorePercent = 0.25 })` — adds `ceil(max * 0.25)` to all items in a shop, clamped to max.
- `selectSupplyLevels(shopId)` — parameterized selector for shop supply map.

### ECON-02: shopGenerator dynamic prices
`src/data/shopGenerator.js` now:
- Calls `getFactionModifier(shopFaction, factionReputation)` once per invocation.
- For each item: reads `supplyLevels[shopId][itemId]` (or default) and passes through `calculateDynamicPrice`.
- Adds `basePrice` (original 2× sell) and `outOfStock` fields to every item object.
- Removed old `factionDiscount` hardcoded multiplier — fully replaced by `getFactionModifier`.

### ECON-02: Supply restoration on rest
`worldStateMiddleware.js` now listens for `time/advanceTime` and dispatches `restoreSupply({ shopId, restorePercent: 0.25 })` for every shop that has initialized supply levels.

### ECON-04: ShopOverlay — supply init + decrease on purchase
`ShopOverlay.jsx`:
- On `shopInventory` useMemo: dispatches `initSupply` to seed stock on first open (idempotent).
- In `handleBuy`: dispatches `decreaseSupply({ shopId, itemId, amount: 1 })` after recording purchase.

### ECON-04: ShopInventory price direction arrows
`ShopInventory.jsx` buy-mode now renders:
- Red `▲` (U+25B2) when `price > basePrice` — prices have risen (bought-out stock).
- Green `▼` (U+25BC) when `price < basePrice` — prices have dropped (ally discount or restocked low supply).
- "Out of Stock" italic label when `outOfStock === true`.

CSS in `ShopInventory.module.css`: `.priceUp { color: #E63946 }`, `.priceDown { color: #2A9D8F }`, `.outOfStock { color: #E63946; font-style: italic }`.

## Verification Results

| Check | Result |
|-------|--------|
| `npm run build` exits 0 | PASS |
| `calculateDynamicPrice` called in shopGenerator | PASS (3 matches) |
| `supplyLevels` in economySlice | PASS (8 matches) |
| `decreaseSupply` in ShopOverlay | PASS |
| `priceUp` in ShopInventory | PASS |
| `restoreSupply` in worldStateMiddleware | PASS |
| `1.15` hostile markup in pricingAgent | PASS |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused `priceModifiers` variable read from shopGenerator**
- **Found during:** Task 1 — after replacing factionDiscount logic, `const priceModifiers = gameState.economy?.priceModifiers || {}` became a dead read
- **Fix:** Removed the unused variable. The state key `priceModifiers` still exists in economySlice for backward compatibility with any external consumers.
- **Files modified:** src/data/shopGenerator.js
- **Commit:** 1c0bca3

## Commits

| Task | Commit | Message |
|------|--------|---------|
| Task 1 | `1c0bca3` | feat(54-01): PricingAgent + supply/demand economy system |
| Task 2 | `b617089` | feat(54-01): Wire ShopOverlay supply wiring + price direction indicators |

## Self-Check: PASSED

All created files exist. Both task commits verified in git history.
