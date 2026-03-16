---
plan: 42-01
phase: 42
one_liner: "Phaser DialogueBox wired to WorldScene + PixelAE Arabic font + ArabicText utility"
status: complete
---

# Plan 42-01: Phaser UI & Arabic BitmapFont

## What Was Built
- DialogueBox wired into WorldScene with SPACE/ENTER input to advance dialogue
- NPC interaction prompts replaced from DOM overlay to Phaser bouncing gold arrow
- EventBus 'phaser:npc:simple-dialogue' event triggers in-canvas dialogue
- PixelAE Arabic font loaded via @font-face + FontFace API preload in BootScene
- ArabicText utility with js-arabic-reshaper for letter joining and RTL reversal
- createArabicText() and prepareArabicText() exported for use across game
- React overlays preserved for complex dialogues (HUD, menus, settings stay React)

## Key Files
- `src/game/scenes/WorldScene.js` — DialogueBox instantiation + input handling
- `src/game/sprites/NPC.js` — Phaser interaction prompt replacing DOM overlay
- `src/game/ui/ArabicText.js` — Arabic reshaping + RTL + Phaser text creation
- `src/game/scenes/BootScene.js` — PixelAE font preload
- `index.html` — @font-face declarations
