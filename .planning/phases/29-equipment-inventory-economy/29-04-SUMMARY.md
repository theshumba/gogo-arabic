---
phase: 29-equipment-inventory-economy
plan: 04
subsystem: ui
tags: [react, redux, framer-motion, arabic, i18n, equipment, economy, haggling]

# Dependency graph
requires:
  - phase: 29-01
    provides: inventorySlice, economySlice, shopGenerator, equipment data, affixes data, Arabic number utils

provides:
  - Full shop system with dynamic inventory, buy/sell, and haggling mini-game
  - ShopInventory reusable grid component for buy/sell modes
  - HagglingGame Arabic numeral negotiation component
  - Affix auto-discovery on item purchase (FSRS integration)
  - Bilingual shop UI (Arabic + English)

affects: [29-02, 29-03, 30-companion-system]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Arabic numeral input (Eastern + Western) in haggling
    - Affix auto-teach pattern: purchase → check vocabulary → add to FSRS
    - Rare item sell confirmation modal
    - Shopkeeper mood-based feedback

key-files:
  created:
    - src/components/Shop/ShopInventory.jsx
    - src/components/Shop/ShopInventory.module.css
    - src/components/Shop/HagglingGame.jsx
  modified:
    - src/components/Shop/ShopOverlay.jsx
    - src/components/Shop/ShopOverlay.module.css

key-decisions:
  - "Haggle button only shows for items over 100 dirhams"
  - "Rare+ items require confirmation before selling"
  - "Affix discovery toast shows both Arabic and English word"
  - "Haggling max 3 attempts with bilingual feedback"
  - "Shopkeeper mood emoji changes based on offer quality"
  - "Prices display in both Eastern Arabic (٨٠٠) and Western (800) numerals"

patterns-established:
  - "Reusable ShopInventory component for buy/sell grids (mode prop)"
  - "Affix learn status indicator: green dot = learned, yellow dot + 50% badge = unlearned"
  - "normalizeArabicNumber() accepts mixed Eastern/Western input"
  - "Haggling discount range: 10-30% via MIN_PRICE/SWEET_SPOT/MERCHANT_TARGET logic"

# Metrics
duration: 12min
completed: 2026-02-12
---

# Phase 29 Plan 04: Shop System UI Summary

**Complete shop interface with dynamic inventory, buy/sell flows, Arabic numeral haggling mini-game, and affix auto-discovery**

## Performance

- **Duration:** 12 min
- **Started:** 2026-02-12T21:07:43Z
- **Completed:** 2026-02-12T21:19:47Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Extended ShopOverlay with dynamic inventory from shopGenerator.js (filtered by player level and world state)
- Buy/sell tabs with ShopInventory reusable grid component
- HagglingGame mini-game accepting both Eastern Arabic (٠-٩) and Western (0-9) numerals
- Affix auto-discovery: unlearned affixes added to FSRS queue on item purchase
- Bilingual UI: Arabic + English prices, feedback, and shopkeeper greetings

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend ShopOverlay with dynamic inventory and sell functionality** - `d71850e` (feat)
2. **Task 2: Create HagglingGame mini-game with Arabic numeral input** - `fddce47` (feat)

## Files Created/Modified

### Created
- `src/components/Shop/ShopInventory.jsx` - Reusable item grid component for buy/sell modes with rarity borders, affix indicators, and price display in both Arabic numerals
- `src/components/Shop/ShopInventory.module.css` - Grid layout, item cards, affix dots, buy/sell/haggle button styles
- `src/components/Shop/HagglingGame.jsx` - Arabic numeral negotiation mini-game with 3 max attempts, bilingual feedback, and shopkeeper mood

### Modified
- `src/components/Shop/ShopOverlay.jsx` - Replaced static items with dynamic shopInventory from getShopInventory(), added buy/sell tabs, affix discovery logic, rare item sell confirmation
- `src/components/Shop/ShopOverlay.module.css` - Added haggling dialog styles, confirmation modal, greeting display, and shopkeeper mood emoji

## Decisions Made

**1. Haggle threshold: 100 dirhams**
- Haggle button only shows for items priced above 100 dirhams to avoid haggling over small purchases
- Prevents UI clutter for common items

**2. Rare+ sell confirmation**
- Rare, epic, and legendary items trigger confirmation modal before selling
- Prevents accidental sales of valuable items

**3. Affix discovery toast**
- Shows discovered affix in both Arabic (حاد) and English (Sharp) format
- 4-second toast duration for multiple affixes (vs 2s for normal purchases)

**4. Shopkeeper mood states**
- 4 moods: neutral (🤝), thinking (🤔), pleased (😊), offended (😠)
- Changes based on haggling offer quality
- Provides visual feedback for player's negotiation performance

**5. Price display format**
- All prices show Eastern Arabic (٨٠٠) first, then Western (800 dirhams) below
- Normalized offer preview in haggling: "٦٠٠ = 600 dirhams"
- Uses formatAsEasternArabic() utility

**6. Haggling discount logic**
- MIN_PRICE: 70% of original (30% off max)
- MERCHANT_TARGET: 85% of original (15% off sweet spot)
- SWEET_SPOT: 90% of original (10% off easy acceptance)
- Offers above original price accepted with "Gladly!" response

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for:**
- Phase 29 Plan 02/03 (Phaser EquipmentManager and InventoryUI) - shop purchase flow wired to inventorySlice
- Phase 30 (Companion System) - companions can give items as gifts via addItem()

**Affix discovery system complete:**
- Unlearned affixes auto-add to FSRS queue
- Unlock affix bonuses tracked in inventorySlice.affixesUnlocked
- AFFIX_DISCOVERED event emitted for achievements/analytics

**Shop economy wired:**
- Dynamic inventory based on player level, quests, and reputation
- Buy price = sellPrice * 2 * reputation modifier
- Haggling results tracked in economySlice.hagglingHistory (last 50)

## Self-Check: PASSED

**Files created:**
- ✓ src/components/Shop/ShopInventory.jsx (6,432 bytes)
- ✓ src/components/Shop/ShopInventory.module.css (3,313 bytes)
- ✓ src/components/Shop/HagglingGame.jsx (8,460 bytes)

**Commits:**
- ✓ d71850e (Task 1: ShopOverlay extension)
- ✓ fddce47 (Task 2: HagglingGame)

All claims verified.

---
*Phase: 29-equipment-inventory-economy*
*Plan: 04*
*Completed: 2026-02-12*
