# Visual Layer Black Squares — Root Cause & Fix

## Status: FIXED (2026-03-19)

## Root Cause
BootScene loaded 7 desert tile PNGs **twice** with the same file paths but different types:

1. Lines 224-230: `this.load.image('desert-beach-tiles-1', '/assets/kenmi/desert/tiles/...')` — flat image, no frames
2. KENMI_CATALOG loop: `this.load.spritesheet('kenmi-desert-tiles-desert-beach-tiles-1', '/assets/kenmi/desert/tiles/...')` — spritesheet with 16x16 frames

**Phaser 3 deduplicates loads by URL.** Since the `image` load was queued first, the file was processed as a flat image. When the `spritesheet` load encountered the same URL, Phaser reused the already-loaded data without applying frame slicing. Result: `tex.frames` only contained `__BASE` (the whole image), not numbered frame indices like `'0'`, `'1'`, etc.

When MapLoader called `scene.add.image(x, y, key, frameIndex)`, Phaser couldn't find frame `3` or `7` etc., so it fell back to `__BASE` or rendered nothing → **black squares**.

## Fix
- Removed the 7 hardcoded `this.load.image()` calls from BootScene
- Added Tiled map key aliases in `create()` using `textures.addImage()` after the spritesheets are loaded
- This lets the KENMI_CATALOG spritesheet loads run without URL conflicts
