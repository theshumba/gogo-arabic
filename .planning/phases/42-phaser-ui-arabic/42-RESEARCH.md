# Phase 42: Phaser UI & Arabic BitmapFont — Research

**Researched:** 2026-03-17
**Domain:** Phaser 3 UI rendering, NineSlice panels, Kenmi pixel art integration, Arabic BitmapFont, React overlay migration
**Confidence:** HIGH (based on direct codebase inspection + Phaser source code)

---

## Summary

Plan 42-01 is ALREADY COMPLETE. The Phaser DialogueBox, ArabicText utility, PixelAE font preload, and NPC interaction hint migration from DOM overlay to Phaser sprite are all built and wired. What remains across plans 42-02 and 42-03 is migrating the **sign/object interaction popups** from React DOM overlays to Phaser NineSlice panels, wiring Kenmi UI art (frames, bars, icons) into the existing Phaser UI infrastructure, and promoting Arabic text rendering to the Kenmi pixel font where possible.

The codebase has a clean Phaser UI layer already in place: `src/game/ui/` contains `DialogueBox.js`, `NineSlice.js`, `UIPanel.js`, `PanelFactory.js`, and `ArabicText.js`. The NineSlice wrapper calls Phaser's native `scene.add.nineslice()` (Phaser 3.60+). The Kenmi UI pack (`kenmi-ui-ui-ui-frames`, `kenmi-ui-ui-ui-bars`, `kenmi-ui-ui-ui-icons`) is already loaded in BootScene via KENMI_CATALOG. The critical remaining work is: (1) replacing runtime-generated panel textures with Kenmi UI frames as NineSlice sources, (2) replacing React SignOverlay and ObjectInteractionOverlay with Phaser NineSlice panels, (3) replacing the React NPC name label DOM overlay with a Phaser text sprite properly running prepareArabicText(), and (4) confirming Kenmi pixel font (cute-fantasy-font-5x7) works as a BitmapFont for English in-game text.

The Arabic BitmapFont requirement (ARAB-01 through ARAB-04) is partially met: PixelAE is loaded as a web font and used via `createArabicText()` which calls `prepareArabicText()` (reshaping + RTL reversal). What is NOT yet done is Phaser BitmapFont registration for the Kenmi pixel font (requires XML descriptor or RetroFont.Parse config), and NPC Arabic name labels still use the DOM overlay `createNpcLabel()`.

**Primary recommendation:** Extend the existing Phaser UI layer — don't rewrite it. Swap the NineSlice texture sources from runtime-generated panels to Kenmi frames, build Phaser NineSlice replacements for SignOverlay and ObjectInteractionOverlay, remove the DOM NPC label, and register the Kenmi 5x7 font as a BitmapFont for English in-game text.

---

## User Constraints (from NEXT-STEPS.md Tier 1B — no CONTEXT.md for this phase)

### Locked Decisions (from STATE.md and NEXT-STEPS.md)

- UI-07 constraint: React overlays (HUD top bar, main menu, settings, profile, wardrobe) STAY as React — only in-game elements move to Phaser
- Phase 43 (zone cleanup) must run LAST — it removes placeholders only after Phase 42 replacements are confirmed working
- Loading screen (koi fish + Gogo Arabic + Yala Arabic) — DO NOT TOUCH EVER
- 42-01 is already COMPLETE — DialogueBox, ArabicText, PixelAE preload, NPC hint sprite are built

### Elements to Move to Phaser (Tier 1B)
- Sign overlay → Phaser NineSlice panel (SIGN_SHOW event → Phaser panel, not React SignOverlay)
- Object interaction overlay (fountain, statue, painting, etc.) → Phaser NineSlice panel (OBJECT_INTERACT event)
- NPC name labels (Arabic + English) → Phaser text sprites (remove domOverlay.createNpcLabel())
- In-game health/XP/stamina display if inside Phaser canvas → Kenmi UI bars

### Elements to Keep as React
- HUD top bar (level, DAD, map button, quests, luggage)
- Main menu / PauseMenu
- Settings
- Profile
- Wardrobe
- QuestLog
- ShopOverlay
- QuizOverlay
- LevelUpModal, NotificationToast, AchievementToast
- DialogueOverlay (rich NPC dialogue with choices, portraits, word cards — complex React UI)

---

## Standard Stack

### Core (already in project, confirmed by codebase inspection)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Phaser | ^3.90.0 | Game engine — NineSlice, BitmapText, tweens | Already installed; 3.60+ native NineSlice |
| phaser3-rex-plugins | ^1.80.19 | RTL text, UI sizers, extended Phaser plugins | Already installed; not yet used for UI |
| js-arabic-reshaper | ^1.0.0 | Arabic letter joining for Phaser Canvas | Already installed and wired in ArabicText.js |

### Phaser UI APIs Used

| API | Method | Purpose |
|-----|--------|---------|
| NineSlice | `scene.add.nineslice(x, y, texture, frame, w, h, lw, rw, th, bh)` | Scalable panel background |
| BitmapText | `scene.add.bitmapText(x, y, key, text, size)` | Pixel font text via .fnt + .png |
| RetroFont | `Phaser.GameObjects.RetroFont.Parse(scene, config)` | Register spritesheet font WITHOUT .fnt file |
| Text | `scene.add.text(x, y, str, style)` + prepareArabicText() | Arabic text (PixelAE TTF loaded as web font) |
| Container | `scene.add.container()` | Group panel + text + buttons |
| Tween | `scene.tweens.add()` | Fade in/out panel |

### Kenmi UI Assets (already loaded in BootScene via KENMI_CATALOG)

| Catalog Key | File | Dimensions | Use |
|-------------|------|------------|-----|
| `kenmi-ui-ui-ui-frames` | ui-frames.png | 1296×336px | NineSlice panel backgrounds (27 cols × 7 rows, each frame 48×48px) |
| `kenmi-ui-ui-ui-bars` | ui-bars.png | 304×128px | Health/XP/stamina bar fills |
| `kenmi-ui-ui-ui-icons` | ui-icons.png | 624×256px | In-game icons (16×16 each, 39 cols × 16 rows) |
| `kenmi-ui-ui-ui-buttons` | ui-buttons.png | 1776×528px | Button sprites |
| `kenmi-ui-ui-ui-pop-up` | ui-pop-up.png | 96×96px | Small popup/speech bubble (4 variants: 2×2 grid, each 48×48) |
| `kenmi-ui-ui-cute-fantasy-font-5x7` | cute-fantasy-font-5x7.png | 135×35px | Pixel font for English text (5×7 glyphs, 27 cols × 5 rows) |
| `kenmi-ui-fonts-cute-fantasy-font-5x9` | cute-fantasy-font-5x9.png | 145×36px | Larger pixel font (5×9 glyphs, 29 cols × 4 rows) |

### Fonts

| Font | Status | How Loaded | Use |
|------|--------|-----------|-----|
| PixelAE (TTF) | Loaded via FontFace API in BootScene | `document.fonts.add()` | Arabic text in Phaser via `scene.add.text()` + `prepareArabicText()` |
| Cute Fantasy 5×7 | Loaded as image in BootScene | `this.load.image(...)` via KENMI_CATALOG | English pixel text — needs RetroFont.Parse to use as BitmapFont |
| Press Start 2P | CSS @font-face | HTML stylesheet | Currently used in Phaser text — replace with Cute Fantasy for in-game |

---

## Architecture Patterns

### Recommended Project Structure (existing — no change needed)

```
src/game/ui/
├── DialogueBox.js      # [COMPLETE] Phaser in-canvas dialogue panel
├── NineSlice.js        # [COMPLETE] createNineSlice() utility
├── UIPanel.js          # [COMPLETE] Container + NineSlice background
├── PanelFactory.js     # [COMPLETE] Pre-configured panel presets
├── ArabicText.js       # [COMPLETE] prepareArabicText() + createArabicText()
├── index.js            # [COMPLETE] Barrel export
├── SignPanel.js        # [NEW 42-02] Phaser NineSlice sign popup
└── ObjectPanel.js      # [NEW 42-02] Phaser NineSlice object interaction popup
```

### Pattern 1: Kenmi NineSlice Panel (replacing runtime-generated textures)

**What:** Use Kenmi `ui-frames.png` sprite regions as NineSlice texture instead of the current programmatically-generated `panel-dark` texture.

**Key insight:** The Kenmi ui-frames.png contains 189 frame variants (27 cols × 7 rows, each 48×48px). The first frame of the first row (orange/warm variant) is the natural Kenmi dialogue box. Corner size is approximately 6px based on the frame border pixel width, which matches the existing `PANEL_PRESETS` cornerSize of 6.

**How to use:** Extract a specific frame from ui-frames.png for NineSlice. Since the texture is loaded as a flat image (not spritesheet), use Phaser's texture cropping or load specific regions. The cleanest approach is to register a new texture key pointing to a specific crop of ui-frames.png using `scene.textures.addSpriteSheetFromAtlas()` — OR add a new KENMI_CATALOG entry as a spritesheet with frameWidth=48, frameHeight=48, then reference by frame index.

**When to use:** For all new in-game Phaser panels (SignPanel, ObjectPanel). The existing runtime-generated panels (panel-dark, etc.) can remain for DialogueBox backward compatibility.

**Example:**
```javascript
// Source: src/game/scenes/BootScene.js — how to register Kenmi frames as spritesheet
// In BootScene preload(), override the catalog entry OR add extra registration:
this.load.spritesheet('kenmi-ui-frames-sheet', '/assets/kenmi/ui/ui/ui-frames.png', {
  frameWidth: 48,
  frameHeight: 48,
});

// Then in SignPanel.js:
const bg = scene.add.nineslice(
  x, y,
  'kenmi-ui-frames-sheet',
  0,           // frame 0 = first color variant (orange/warm)
  width, height,
  6, 6, 6, 6  // corner sizes in source pixels
);
```

### Pattern 2: Phaser NineSlice Sign Panel (replacing React SignOverlay)

**What:** When `SIGN_SHOW` event fires, a Phaser NineSlice panel slides in over the game canvas instead of dispatching to Redux to show a React overlay.

**Architecture:** The event stays Phaser-side. In WorldScene, listen for `SIGN_SHOW` on the EventBus. Show a Phaser Container panel. Dismiss on SPACE/ENTER.

**The migration:** InteractableManager already emits `EVENTS.SIGN_SHOW`. Currently, `useObjectEvents.js` (React) catches this and dispatches `openSign()` to Redux, which shows `<SignOverlay>`. Phase 42-02 redirects this flow: WorldScene catches `SIGN_SHOW` and shows the Phaser SignPanel instead. React side stops listening for `SIGN_SHOW` (or GameLayout stops rendering `<SignOverlay>` when the Phaser panel handles it).

**Example:**
```javascript
// Source: src/game/scenes/WorldScene.js pattern (matching _handleSimpleDialogue)
// In WorldScene.create():
EventBus.on(EVENTS.SIGN_SHOW, this._handleSignShow, this);

_handleSignShow({ arabic, english }) {
  if (this.signPanel) {
    this.signPanel.show(arabic, english);
    EventBus.emit(EVENTS.PLAYER_FREEZE);
  }
}
```

### Pattern 3: Phaser BitmapFont Registration (Kenmi 5x7 font)

**What:** Phaser BitmapFont requires either (a) an XML/FNT descriptor file, or (b) `Phaser.GameObjects.RetroFont.Parse()` for fixed-width grid fonts. The Kenmi cute-fantasy-font-5x7.png is a fixed-width grid, so RetroFont.Parse is the right approach — no descriptor file needed.

**Key constraint:** RetroFont.Parse only supports ASCII characters. Arabic text cannot use BitmapFont — it must continue using `scene.add.text()` with the PixelAE TTF font and `prepareArabicText()`. BitmapFont is only for English in-game text (NPC names in English, UI labels, "Press SPACE" prompts).

**Characters in cute-fantasy-font-5x7.png:** The 5x9 version shows `ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789` plus symbols. The 5x7 version likely has the same or a subset. Both are uppercase-only based on visual inspection.

**Example:**
```javascript
// Source: Phaser.GameObjects.RetroFont.Parse docs
// In BootScene.create() after textures load:
const retroConfig = Phaser.GameObjects.RetroFont.Parse(this, {
  image: 'kenmi-ui-ui-cute-fantasy-font-5x7',
  width: 5,
  height: 7,
  chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,!?-:',
  charsPerRow: 27,  // 135px / 5px per glyph = 27
  spacing: { x: 0, y: 0 },
});
this.cache.bitmapFont.add('kenmi-pixel-5x7', retroConfig);

// Then anywhere in the game:
const label = scene.add.bitmapText(x, y, 'kenmi-pixel-5x7', 'PRESS SPACE', 5);
label.setScale(4); // scale 4x to match 64px game grid
```

### Pattern 4: NPC Name Label Migration (DOM overlay → Phaser text)

**What:** Currently, `NPCManager.create()` calls `domOverlay.createNpcLabel(npcId, x, y, arabicName, englishName)` which creates a positioned DOM div above each NPC. This needs to move to Phaser text objects on the NPC sprite itself.

**Status:** The interaction HINT (the bouncing ▼ arrow) is ALREADY a Phaser text sprite on NPC. The name label (`this.nameLabel`) is ALREADY a Phaser text sprite on NPC (added in 42-01). The DOM label is redundant but still created in NPCManager.

**What to remove:** The `domOverlay.createNpcLabel()` call in NPCManager.create(). The `domOverlay.updatePosition()` call for the label in NPCManager.update(). The Arabic name text in the DOM label.

**What to add to NPC.js:** A second text label for the Arabic name using `createArabicText()` (from ArabicText.js), positioned above the English nameLabel.

### Anti-Patterns to Avoid

- **Running prepareArabicText() on BitmapText:** BitmapFont only covers ASCII. Arabic text must always use `scene.add.text()` with PixelAE font. Never try to render Arabic through RetroFont.
- **Creating new DOM overlays:** DOMOverlayManager already exists but is being phased out for in-game elements. Do not add new `createOverlay()` calls for in-game UI.
- **Listening to SIGN_SHOW in both React and Phaser simultaneously:** When Phaser takes ownership of sign display, the React `useObjectEvents.js` hook must stop dispatching `openSign()` for that event, or `<SignOverlay>` must be conditionally removed from GameLayout.
- **Panel cornerSize mismatch:** The Kenmi ui-frames 48x48 frames have decorative corners that are approximately 6px (matching existing PANEL_PRESETS). Using wrong cornerSize stretches the border artwork.
- **Forgetting setScrollFactor(0):** All in-game HUD panels that must stay fixed to the viewport (not scroll with the world camera) need `container.setScrollFactor(0)` and `setDepth(10000+)`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Scalable panels | Custom 9-patch renderer | `scene.add.nineslice()` (Phaser 3.60+) | Already in codebase, native Phaser |
| Arabic letter joining | Custom shaping algorithm | `reshape()` from js-arabic-reshaper | Already in ArabicText.js |
| RTL text reversal | Manual character reversal | `prepareArabicText()` from ArabicText.js | Already exists, handles mixed text |
| Pixel font registration | Hand-write XML descriptor | `Phaser.GameObjects.RetroFont.Parse()` | Built into Phaser, no file needed |
| UI panel presets | One-off panel configurations | `PanelFactory` static methods | Already exists |
| DOM overlay cleanup | Manual element removal loop | `domOverlay.destroy()` | Already in DOMOverlayManager |

**Key insight:** All the hard infrastructure is already built. This phase is wiring and swapping textures, not building new systems.

---

## Common Pitfalls

### Pitfall 1: NineSlice cornerSize with Kenmi frames at 4x scale

**What goes wrong:** The Kenmi ui-frames.png frames are 48x48px at their original (1x) scale. When the NineSlice stretches to fill e.g. 400x120px for a dialogue box, the cornerSize=6 refers to source pixels (in the 48x48 texture), not screen pixels. If you accidentally scale 4x thinking about the 64px game grid, the corners become 24px of the source which is half the tile — the border pixels would stretch incorrectly.

**Why it happens:** Confusion between source pixel space (the texture) and screen space (the rendered result). NineSlice cornerSize is always in source texture pixels.

**How to avoid:** Always specify cornerSize in terms of source image pixels. For Kenmi 48x48 frames, cornerSize=6 is correct (leaves 36x36 center, matching the panel artwork). The final rendered size is whatever width/height you pass to nineslice() — independent of cornerSize.

**Warning signs:** Corners look stretched or corners don't match (they bleed into the center region).

### Pitfall 2: Font not ready when BitmapText is created

**What goes wrong:** PixelAE is loaded via `FontFace.load()` async Promise (not Phaser's synchronous preload queue). If a Phaser scene creates a `scene.add.text()` with `fontFamily: 'PixelAE'` before the Promise resolves, the browser falls back to a system font.

**Why it happens:** Phaser's `preload()` and `create()` run synchronously. `FontFace.load()` is async. The Promise.all in BootScene starts loading but the scene creates objects immediately after.

**How to avoid:** The existing BootScene code does `Promise.all([...]).then(() => fonts.forEach(f => document.fonts.add(f)))`. This works IF the Phaser scene doesn't render text immediately. For critical Arabic text, add a 100ms delay or check `document.fonts.check("1em PixelAE")` before use. For BitmapFont (RetroFont.Parse), this is not an issue since it reads from Phaser's already-loaded texture cache.

**Warning signs:** Arabic text looks wrong (not pixel style) or falls back to serif font in first frame.

### Pitfall 3: React event bus listener conflict after Phaser takes ownership

**What goes wrong:** Both `useObjectEvents.js` (React hook) and `WorldScene.js` (Phaser) listen for `EVENTS.SIGN_SHOW`. React dispatches `openSign()` to Redux → `<SignOverlay>` renders. Phaser ALSO shows its NineSlice panel. Player sees both.

**Why it happens:** The React listener is registered in `useObjectEvents.js` via `EventBus.on(EVENTS.SIGN_SHOW, ...)` on mount. When Phaser is extended to handle the same event, both fire.

**How to avoid:** When Phaser takes ownership of an event, remove the React listener. In `useObjectEvents.js`, comment out or guard the `SIGN_SHOW` handler. In `GameLayout.jsx`, remove `{signOpen && <SignOverlay />}`. One owner per event.

**Warning signs:** Two overlays appear (React card on top of Phaser panel) or Redux sign state becomes stuck.

### Pitfall 4: DOM NPC labels persisting after migration

**What goes wrong:** `NPCManager.create()` calls `domOverlay.createNpcLabel()` which adds DOM divs. Even after NPC.js `nameLabel` is the primary label, the DOM div still floats above (duplicating the label).

**Why it happens:** The DOM overlay is never explicitly removed when Phaser takes over. `domOverlay.destroy()` only runs on scene shutdown.

**How to avoid:** Either stop calling `domOverlay.createNpcLabel()` in `NPCManager.create()`, or immediately call `domOverlay.removeOverlay()` for the label right after creating it, or add an Arabic nameLabel to `NPC.js` and skip the DOM call entirely.

**Warning signs:** Two name labels appear above each NPC (one DOM, one Phaser). DOM label doesn't track camera correctly.

### Pitfall 5: Arabic text in NPC name label renders as boxes

**What goes wrong:** `this.nameLabel = scene.add.text(x, y, name, { fontFamily: "'Press Start 2P'" })` renders English fine but will fail for Arabic text if `nameArabic` is passed without `prepareArabicText()`.

**Why it happens:** Press Start 2P has no Arabic glyphs. Even with PixelAE, raw Arabic string must be reshaped and reversed before passing to `setText()`.

**How to avoid:** Always call `prepareArabicText(npcData.nameArabic)` before passing to `scene.add.text()`. Use `createArabicText()` from ArabicText.js which handles this automatically.

**Warning signs:** Arabic characters render as empty squares (tofu) or in disconnected isolated letter forms.

---

## Code Examples

### Register Kenmi 5x7 Pixel Font as BitmapFont

```javascript
// Source: Phaser 3 built-in — src/game/scenes/BootScene.js create()
// Call AFTER this.scene.start('WorldScene') — textures must be loaded first

const retroConfig = Phaser.GameObjects.RetroFont.Parse(this, {
  image: 'kenmi-ui-ui-cute-fantasy-font-5x7',  // already loaded by KENMI_CATALOG
  width: 5,
  height: 7,
  chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,!?-:\'',
  charsPerRow: 27,   // 135px total / 5px per glyph = 27
  spacing: { x: 0, y: 0 },
});
this.cache.bitmapFont.add('kenmi-pixel', retroConfig);
```

### Kenmi Frames as NineSlice Spritesheet

```javascript
// In BootScene.preload() — add this alongside KENMI_CATALOG loop
// (kenmi-ui-ui-ui-frames is already loaded as flat image by catalog)
// Add an additional spritesheet registration for NineSlice use:
this.load.spritesheet('kenmi-ui-frames-sheet', '/assets/kenmi/ui/ui/ui-frames.png', {
  frameWidth: 48,
  frameHeight: 48,
});
// Frame 0 = row 0, col 0 = orange/warm panel (dialogue box color)
// Frame 7 = row 0, col 7 = lighter orange variant
// Row index maps: 0=orange, 1=grey/silver, 2=green, 3=blue, 4=gold, 5=red, 6=purple
```

### Phaser SignPanel (replacing React SignOverlay)

```javascript
// New file: src/game/ui/SignPanel.js
import Phaser from 'phaser';
import { createNineSlice } from './NineSlice.js';
import { createArabicText } from './ArabicText.js';
import { EventBus } from '../../utils/eventBus.js';
import { EVENTS } from '../../utils/eventBusTypes.js';

export class SignPanel {
  constructor(scene) {
    this.scene = scene;
    this.container = null;
    this.isVisible = false;
    this._create();
  }

  _create() {
    const { width, height } = this.scene.cameras.main;
    const panelW = Math.min(width - 80, 400);
    const panelH = 120;
    const panelX = (width - panelW) / 2;
    const panelY = (height - panelH) / 2;

    this.container = this.scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(10000);
    this.container.setVisible(false);

    // NineSlice background using Kenmi frame (frame 0 = orange warm variant)
    this.bg = this.scene.add.nineslice(
      panelX, panelY,
      'kenmi-ui-frames-sheet', 0,
      panelW, panelH,
      6, 6, 6, 6
    );
    this.bg.setOrigin(0);
    this.scene.children.remove(this.bg);
    this.container.add(this.bg);

    // Arabic text (RTL, PixelAE font)
    this.arabicLabel = createArabicText(
      this.scene, panelX + panelW / 2, panelY + 28, '',
      { fontSize: '18px' }
    );
    this.scene.children.remove(this.arabicLabel);
    this.container.add(this.arabicLabel);

    // English text
    this.englishLabel = this.scene.add.text(
      panelX + panelW / 2, panelY + 60, '',
      { fontFamily: "'Press Start 2P'", fontSize: '9px', color: '#f4fefa' }
    ).setOrigin(0.5);
    this.scene.children.remove(this.englishLabel);
    this.container.add(this.englishLabel);

    // Dismiss hint
    this.hintLabel = this.scene.add.text(
      panelX + panelW / 2, panelY + panelH - 16, 'SPACE to dismiss',
      { fontFamily: "'Press Start 2P'", fontSize: '7px', color: '#d4a843' }
    ).setOrigin(0.5);
    this.scene.children.remove(this.hintLabel);
    this.container.add(this.hintLabel);
  }

  show(arabic, english) {
    this.arabicLabel.setText(arabic ? require('./ArabicText.js').prepareArabicText(arabic) : '');
    this.englishLabel.setText(english || '');
    this.container.setVisible(true);
    this.isVisible = true;
  }

  hide() {
    this.container.setVisible(false);
    this.isVisible = false;
    EventBus.emit(EVENTS.PLAYER_UNFREEZE);
  }

  advance() {
    if (!this.isVisible) return false;
    this.hide();
    return true;
  }

  destroy() {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }
}
```

### Add Arabic Name Label to NPC Sprite

```javascript
// Source: src/game/sprites/NPC.js — add below existing this.nameLabel
import { createArabicText } from '../ui/ArabicText.js';

// In NPC constructor, after this.nameLabel:
this.arabicNameLabel = createArabicText(
  scene, x, y - 70, cfg.nameArabic || '',
  { fontSize: '12px', color: '#d4a843' }
).setDepth(9999);

// In setInteractionHint():
this.arabicNameLabel.setPosition(this.x, this.y - 70);
```

### WorldScene wiring for SignPanel and ObjectPanel

```javascript
// In WorldScene.create() — alongside existing dialogueBox setup:
import { SignPanel } from '../ui/SignPanel.js';
import { ObjectPanel } from '../ui/ObjectPanel.js';

this.signPanel = new SignPanel(this);
this.objectPanel = new ObjectPanel(this);

EventBus.on(EVENTS.SIGN_SHOW, this._handleSignShow, this);
EventBus.on(EVENTS.OBJECT_INTERACT, this._handleObjectInteract, this);

// In WorldScene.update() — advance on SPACE:
if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
  if (this.dialogueBox?.advance()) return;
  if (this.signPanel?.advance()) return;
  if (this.objectPanel?.advance()) return;
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|-----------------|--------|
| DOM overlay for NPC name labels | Phaser text sprites on NPC (42-01) | No DOM sync per-frame for labels |
| DOM overlay for interaction prompt | Phaser bouncing text on NPC sprite (42-01) | Cleaner, world-space positioning |
| React DialogueOverlay for all dialogue | React for complex (choices/portraits), Phaser DialogueBox for simple NPC messages (42-01) | Split ownership is clear |
| Runtime-generated panel textures | Kenmi ui-frames.png as NineSlice source (42-02) | Pixel art visual style, no programmatic fallback |
| React SignOverlay (Redux dispatch) | Phaser NineSlice SignPanel (42-02) | Zero React involved for simple reads |
| React ObjectInteractionOverlay | Phaser NineSlice ObjectPanel (42-02) | But note: complex objects with vocab cards may stay React |
| Arabic text as DOM div (crisp but misaligned) | `prepareArabicText()` + PixelAE + `scene.add.text()` (42-01) | In canvas, camera-space correct |
| Press Start 2P for all Phaser text | Kenmi cute-fantasy 5x7 as BitmapFont (42-03) | True pixel art style consistency |

**Deprecated in this phase:**
- `domOverlay.createNpcLabel()` calls in NPCManager — replaced by NPC.arabicNameLabel Phaser sprite
- Runtime `_generatePanelTextures()` for new panels (existing panel-dark stays for DialogueBox backward compat)
- React `<SignOverlay>` and `{signOpen && ...}` in GameLayout

---

## Open Questions

1. **Does ObjectInteractionOverlay (fountain, statue, etc.) fully move to Phaser?**
   - What we know: ObjectInteractionOverlay shows arabic label, english label, description, cultural note, vocab word card, and loot message. This is complex — more than a sign.
   - What's unclear: The vocab word card and cultural note are content-rich. Phaser text supports this but it's more work than a simple sign panel.
   - Recommendation: Phase 42-02 should handle the basic ObjectPanel (arabic + english + description). Vocab word card can remain in React for now (the Redux OBJECT_INTERACT handler can route simple vs complex cases). Phase 43 cleanup removes the React overlay after confirmation.

2. **Kenmi ui-bars.png format for health/XP display**
   - What we know: The bars image is 304×128px with colored bar rows. Health/XP/stamina bars currently live in the React HUD (which STAYS as React per UI-07). So Kenmi bars may not be needed in Phaser at all if bars remain in HUD.
   - What's unclear: Do battle scene bars (CHAR-04 enemy health) need Phaser Kenmi bars? BattleScene is separate from WorldScene.
   - Recommendation: Use Kenmi bars as `scene.add.graphics()` fill fill masks or as `scene.add.image()` with `setCrop()` for dynamic fill. No Phaser bar API exists natively — graphics fillRect is standard.

3. **cute-fantasy-font-5x7 character set**
   - What we know: Image is 135×35px (27 cols × 5 rows), visible characters from 5x9 variant include uppercase A-Z + digits + symbols.
   - What's unclear: The 5x7 version appears mostly white/transparent (image appears blank at small size). Need to verify at native resolution whether it contains rendered glyphs or is empty.
   - Recommendation: Verify by opening the image at native 135×35 zoom. If empty, use the 5x9 variant instead. The BootScene already loads both.

4. **Does DOMOverlayManager stay or get removed?**
   - What we know: Phase 43 is cleanup. DOMOverlayManager is still used for NPC labels (updatePosition calls remain). After 42-02 removes the createNpcLabel calls, DOMOverlayManager.overlays will be empty but the class still runs update() every frame.
   - Recommendation: Keep DOMOverlayManager in place through Phase 42. Phase 43 removes it entirely after all overlay types are confirmed moved to Phaser.

---

## What Phase 42 Must NOT Touch

These are confirmed React-only and are locked per UI-07:

- `src/components/HUD/HUD.jsx` — HUD top bar with XP bar, level, buttons (stays React)
- `src/components/NPC/DialogueOverlay.jsx` — Complex NPC dialogue with portraits, choices, word cards (stays React)
- `src/components/Menu/PauseMenu.jsx` — Main menu (stays React)
- `src/components/Router/GameLayout.jsx` — Layout wrapper (modify minimally: remove SignOverlay line only)
- `src/game/scenes/BootScene.js` loading screen — DO NOT TOUCH EVER

---

## Sources

### Primary (HIGH confidence)

- Direct codebase inspection — `src/game/ui/*.js` (DialogueBox, NineSlice, UIPanel, PanelFactory, ArabicText all read)
- Direct codebase inspection — `src/game/scenes/WorldScene.js` (existing wiring patterns)
- Direct codebase inspection — `src/game/sprites/NPC.js` (existing Phaser text pattern)
- Direct codebase inspection — `src/game/systems/DOMOverlay.js`, `NPCManager.js`, `InteractableManager.js`
- Direct codebase inspection — `src/components/World/SignOverlay.jsx`, `ObjectInteractionOverlay.jsx`
- Direct codebase inspection — `src/components/Router/GameLayout.jsx` (overlay routing)
- Direct codebase inspection — `src/data/kenmiCatalog.js` (all UI catalog keys verified)
- Phaser source read — `node_modules/phaser/src/gameobjects/bitmaptext/ParseRetroFont.js` (RetroFont.Parse API)
- Phaser source read — `node_modules/phaser/src/loader/filetypes/BitmapFontFile.js` (bitmapFont needs XML)
- Asset inspection (PIL) — ui-frames.png 1296×336, ui-bars.png 304×128, ui-icons.png 624×256, cute-fantasy-font-5x7 135×35
- Visual inspection — ui-frames.png, ui-bars.png, ui-icons.png, ui-pop-up.png, ui-premade.png, ui-buttons.png images viewed

### Secondary (MEDIUM confidence)

- `.planning/phases/42-phaser-ui-arabic/42-01-SUMMARY.md` — Confirms 42-01 complete items
- `.planning/STATE.md` — Confirms v8.0 context and decisions
- `.planning/NEXT-STEPS.md` Tier 1B — Confirms which overlays stay React vs move to Phaser

---

## Metadata

**Confidence breakdown:**
- Existing infrastructure (DialogueBox, NineSlice, ArabicText): HIGH — read source directly
- Kenmi asset format (48×48 frames, catalog keys): HIGH — read catalog + measured images with PIL
- RetroFont.Parse for Kenmi pixel font: HIGH — read Phaser source
- SignPanel/ObjectPanel migration pattern: HIGH — existing WorldScene dialogue pattern is identical
- cute-fantasy-font-5x7 glyph set completeness: MEDIUM — image appears white at viewing size; need native-pixel verification
- Kenmi ui-bars usage in Phaser (if needed): MEDIUM — bars stay in React HUD per UI-07; Phaser use case unclear

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (Phaser stable; Kenmi assets static)
