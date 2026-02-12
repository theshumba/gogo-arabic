# UI/UX Design System — GoGo Arabic

**Version**: v5.0 → v11.0 Expansion
**Date**: 2026-02-12
**Scope**: Comprehensive design system for scaling from 15 overlays to 40+, unified component library, design tokens, accessibility patterns

---

## 1. Current UI Inventory

### 1.1 Component Audit

| Component | Type | Focus Trap | RTL | Reduced Motion | a11y Labels |
|-----------|------|------------|-----|----------------|-------------|
| HUD.jsx | Persistent overlay | N/A | Partial | Yes | Yes |
| DialogueOverlay.jsx | Modal | Yes | Yes | Yes | Yes |
| WordDuel.jsx | Full-screen game | Yes | Yes | Yes | Yes |
| ShopOverlay.jsx | Modal | Yes | No | Yes | Partial |
| WorldMap.jsx | Modal | No | Yes | Yes | Yes |
| LevelUpModal.jsx | Alert modal | No | No | Yes | Yes |
| SettingsMenu.jsx | Panel | Yes | Yes | Yes | Yes |
| QuestTracker.jsx | Persistent panel | N/A | Yes | Yes | Yes |
| TutorialHints.jsx | Floating hints | N/A | No | Yes | Partial |
| DailyDashboard.jsx | Panel | No | No | Yes | Partial |
| CharacterCreation.jsx | Full-screen | Yes | Yes | Yes | Yes |
| AlphabetExplorer.jsx | Full-screen | No | Yes | Yes | Yes |
| GrammarLesson.jsx | Full-screen | No | Yes | Yes | Yes |
| MainMenu.jsx | Full-screen | No | No | Yes | Yes |
| BattleResult.jsx | Alert modal | No | No | Yes | Partial |

### 1.2 Current Patterns

**Overlay Pattern** (most common):
```jsx
<motion.div className={styles.overlay} onClick={handleOverlayClose}>
  <motion.div className={styles.card} onClick={e => e.stopPropagation()}>
    {/* Header with title + close button */}
    {/* Content */}
  </motion.div>
</motion.div>
```

**Animation Pattern**:
```jsx
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const overlayVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const cardVariants = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } };
const transition = reduceMotion ? { duration: 0.15 } : { duration: 0.25, ease: 'easeOut' };
```

**Close Pattern**:
```jsx
const handleClose = useCallback(() => dispatch(closeDialogue()), [dispatch]);
const handleOverlayClose = useOverlayClose(handleClose);
```

### 1.3 Issues Identified

1. **Inconsistent focus management** — Only 4/15 components use `useFocusTrap`
2. **No shared animation constants** — Each component re-declares `overlayVariants`, `cardVariants`, `transition`
3. **Inconsistent overlay backdrop** — Some use semi-transparent black, some use background images
4. **No notification queue** — Toasts are ad-hoc per component (`setTimeout(() => setToast(null), 2000)`)
5. **No shared button component** — Each component styles buttons independently
6. **Background images are Japanese GIFs** — `shop-bg2.gif`, `wardrobe-bg.gif` etc.
7. **Missing keyboard navigation** — No arrow key nav in menus, no gamepad support
8. **No design tokens** — Colors, spacing, typography defined per-component in CSS modules

---

## 2. Design Token System

### 2.1 Color Tokens

```css
/* src/styles/tokens.css */

:root {
  /* --- Brand Colors --- */
  --color-gold: #D4A843;
  --color-gold-light: #F5E6C8;
  --color-gold-dark: #8B6914;

  /* --- Semantic Colors --- */
  --color-xp-gold: #FFD700;
  --color-hp-red: #E74C3C;
  --color-mp-blue: #3498DB;
  --color-correct: #27AE60;
  --color-wrong: #E74C3C;
  --color-streak: #F39C12;

  /* --- UI Chrome --- */
  --color-bg-primary: #1A1A2E;
  --color-bg-secondary: #16213E;
  --color-bg-tertiary: #0F3460;
  --color-bg-overlay: rgba(0, 0, 0, 0.75);
  --color-bg-card: rgba(26, 26, 46, 0.95);

  --color-border: rgba(212, 168, 67, 0.3);
  --color-border-active: rgba(212, 168, 67, 0.8);
  --color-border-focus: #3498DB;

  /* --- Text --- */
  --color-text-primary: #F5F5F5;
  --color-text-secondary: #B0B0B0;
  --color-text-arabic: #FFD700;
  --color-text-disabled: #666666;

  /* --- Status --- */
  --color-success: #27AE60;
  --color-warning: #F39C12;
  --color-error: #E74C3C;
  --color-info: #3498DB;

  /* --- Zone Accents (set dynamically per zone) --- */
  --color-zone-accent: var(--color-gold);
  --color-zone-bg: var(--color-bg-primary);

  /* --- Spacing Scale (4px base) --- */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* --- Typography --- */
  --font-ui: 'Press Start 2P', monospace;
  --font-arabic: 'Amiri', 'Noto Naskh Arabic', serif;
  --font-body: system-ui, -apple-system, sans-serif;

  --text-xs: 8px;
  --text-sm: 10px;
  --text-base: 12px;
  --text-lg: 14px;
  --text-xl: 16px;
  --text-2xl: 20px;
  --text-3xl: 24px;

  /* --- Borders --- */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-pill: 9999px;
  --border-width: 2px;
  --border-width-thick: 3px;

  /* --- Shadows --- */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 10px rgba(212, 168, 67, 0.4);

  /* --- Z-Index Scale --- */
  --z-hud: 100;
  --z-quest-tracker: 200;
  --z-tutorial: 300;
  --z-overlay: 400;
  --z-modal: 500;
  --z-notification: 600;
  --z-tooltip: 700;

  /* --- Animation --- */
  --duration-fast: 0.15s;
  --duration-normal: 0.25s;
  --duration-slow: 0.4s;
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-sharp: cubic-bezier(0.4, 0, 0.6, 1);
}

/* Reduced motion override */
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-fast: 0s;
    --duration-normal: 0.1s;
    --duration-slow: 0.15s;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  :root {
    --color-border: rgba(212, 168, 67, 0.8);
    --color-text-secondary: #D0D0D0;
    --color-bg-overlay: rgba(0, 0, 0, 0.9);
  }
}
```

### 2.2 JavaScript Token Access

```javascript
// src/styles/tokens.js — JS mirror of CSS tokens for Phaser/runtime use

export const COLORS = Object.freeze({
  gold: '#D4A843',
  goldLight: '#F5E6C8',
  goldDark: '#8B6914',
  xpGold: '#FFD700',
  hpRed: '#E74C3C',
  mpBlue: '#3498DB',
  correct: '#27AE60',
  wrong: '#E74C3C',
  streak: '#F39C12',
  bgPrimary: '#1A1A2E',
  bgSecondary: '#16213E',
  textPrimary: '#F5F5F5',
  textArabic: '#FFD700',
});

export const DURATIONS = Object.freeze({
  fast: 150,
  normal: 250,
  slow: 400,
});

export const Z_INDEX = Object.freeze({
  hud: 100,
  questTracker: 200,
  tutorial: 300,
  overlay: 400,
  modal: 500,
  notification: 600,
  tooltip: 700,
});
```

---

## 3. Shared Component Library

### 3.1 PixelButton

The core interactive element. All buttons in the game should use this component for consistent look, feel, and accessibility.

```jsx
// src/components/ui/PixelButton.jsx

import { forwardRef, useCallback } from 'react';
import { audioManager } from '../../services/audio.js';
import styles from './PixelButton.module.css';

const PixelButton = forwardRef(function PixelButton({
  children,
  variant = 'primary',  // 'primary' | 'secondary' | 'danger' | 'ghost'
  size = 'md',           // 'sm' | 'md' | 'lg'
  disabled = false,
  onClick,
  sfx = 'click',
  className = '',
  ...props
}, ref) {
  const handleClick = useCallback((e) => {
    if (disabled) return;
    if (sfx) audioManager.playSFX(sfx);
    onClick?.(e);
  }, [disabled, sfx, onClick]);

  return (
    <button
      ref={ref}
      className={`${styles.btn} ${styles[variant]} ${styles[size]} ${className}`}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      <span className={styles.content}>{children}</span>
      <span className={styles.shadow} aria-hidden="true" />
    </button>
  );
});

export default PixelButton;
```

**CSS for depth press effect**:
```css
/* src/components/ui/PixelButton.module.css */

.btn {
  position: relative;
  font-family: var(--font-ui);
  border: var(--border-width) solid var(--color-border);
  cursor: pointer;
  user-select: none;
  transition: transform var(--duration-fast) var(--ease-default);
}

.btn:active:not(:disabled) {
  transform: translateY(2px);
}

.btn:active:not(:disabled) .shadow {
  transform: translateY(-2px);
}

.btn:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

.shadow {
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 0 0 var(--radius-sm) var(--radius-sm);
  transition: transform var(--duration-fast) var(--ease-default);
}

/* Variants */
.primary {
  background: linear-gradient(180deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: var(--color-bg-primary);
}

.secondary {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.danger {
  background: var(--color-error);
  color: white;
}

.ghost {
  background: transparent;
  border-color: transparent;
  color: var(--color-text-secondary);
}

/* Sizes */
.sm { padding: var(--space-1) var(--space-3); font-size: var(--text-xs); }
.md { padding: var(--space-2) var(--space-4); font-size: var(--text-sm); }
.lg { padding: var(--space-3) var(--space-6); font-size: var(--text-base); }

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### 3.2 Overlay (Base Modal)

```jsx
// src/components/ui/Overlay.jsx

import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap } from '../../hooks/useFocusTrap.js';
import { useOverlayClose } from '../../hooks/useOverlayClose.js';
import styles from './Overlay.module.css';

const reduceMotion = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const OVERLAY_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const CARD_VARIANTS = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

const TRANSITION = reduceMotion
  ? { duration: 0.1 }
  : { duration: 0.25, ease: [0.4, 0, 0.2, 1] };

export default function Overlay({
  children,
  onClose,
  title,
  titleArabic,
  ariaLabel,
  size = 'md',       // 'sm' | 'md' | 'lg' | 'full'
  showClose = true,
}) {
  const focusTrapRef = useFocusTrap(true, null);
  const handleOverlayClose = useOverlayClose(onClose);

  return (
    <motion.div
      ref={focusTrapRef}
      className={styles.overlay}
      onClick={handleOverlayClose}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel || title}
      variants={OVERLAY_VARIANTS}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={TRANSITION}
    >
      <motion.div
        className={`${styles.card} ${styles[size]}`}
        onClick={(e) => e.stopPropagation()}
        variants={CARD_VARIANTS}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={TRANSITION}
      >
        {(title || showClose) && (
          <div className={styles.header}>
            <div className={styles.titleGroup}>
              {title && <h2 className={styles.title}>{title}</h2>}
              {titleArabic && (
                <span className={styles.titleArabic} lang="ar" dir="rtl" aria-hidden="true">
                  {titleArabic}
                </span>
              )}
            </div>
            {showClose && (
              <button
                className={styles.closeBtn}
                onClick={onClose}
                aria-label="Close"
              >
                ×
              </button>
            )}
          </div>
        )}
        <div className={styles.body}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}
```

### 3.3 NotificationQueue

Unified toast/notification system replacing ad-hoc `setTimeout` patterns across components.

```jsx
// src/components/ui/NotificationQueue.jsx

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EventBus from '../../services/EventBus.js';
import { EVENTS } from '../../utils/eventBusTypes.js';
import styles from './NotificationQueue.module.css';

const MAX_VISIBLE = 3;
const DEFAULT_DURATION = 3000;

export default function NotificationQueue() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handler = ({ message, type = 'info', duration = DEFAULT_DURATION, id }) => {
      const notification = {
        id: id || `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        message,
        type, // 'info' | 'success' | 'warning' | 'error' | 'achievement'
        duration,
        createdAt: Date.now(),
      };

      setNotifications(prev => [...prev.slice(-(MAX_VISIBLE - 1)), notification]);

      if (duration > 0) {
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, duration);
      }
    };

    EventBus.on(EVENTS.NOTIFICATION_SHOW, handler);
    return () => EventBus.off(EVENTS.NOTIFICATION_SHOW, handler);
  }, []);

  return (
    <div className={styles.container} role="status" aria-live="polite">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            className={`${styles.notification} ${styles[n.type]}`}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <span className={styles.message}>{n.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

### 3.4 ScrollContainer

Scrollable container with momentum and pixel-art-styled scrollbar.

```jsx
// src/components/ui/ScrollContainer.jsx

import { useRef, useCallback } from 'react';
import styles from './ScrollContainer.module.css';

export default function ScrollContainer({
  children,
  maxHeight = '300px',
  className = '',
  ariaLabel,
}) {
  const ref = useRef(null);

  return (
    <div
      ref={ref}
      className={`${styles.container} ${className}`}
      style={{ maxHeight }}
      role="region"
      aria-label={ariaLabel}
      tabIndex={0}
    >
      {children}
    </div>
  );
}
```

---

## 4. Layout Patterns

### 4.1 HUD Layout (3-Tier Hierarchy)

The HUD should follow a clear visual hierarchy:

```
┌─────────────────────────────────────┐
│ Tier 1: CRITICAL (always visible)   │
│ HP bar │ MP bar │ Level │ Dirhams   │
├─────────────────────────────────────┤
│ Tier 2: CONTEXTUAL (show on hover) │
│ Quest tracker │ Mini-map │ Compass  │
├─────────────────────────────────────┤
│ Tier 3: TRANSIENT (auto-hide)      │
│ Notifications │ XP gains │ Streaks │
└─────────────────────────────────────┘
```

**Gradual reveal schedule**:
- Level 1 (new player): Only HP bar + Dirhams
- Level 2: Add quest tracker
- Level 3: Add vocabulary counter
- Level 5: Full HUD
- Level 10: Mini-map (when available)

### 4.2 Menu Transition Choreography

All overlays follow a consistent open/close choreography:

**Open sequence**:
1. Backdrop fades in (100ms)
2. Card scales up from 0.95 + fades in (200ms, easeOut)
3. Content elements stagger in (50ms each, optional)
4. Focus moves to first interactive element

**Close sequence**:
1. Content fades out (100ms)
2. Card scales down + fades out (150ms, easeIn)
3. Backdrop fades out (100ms)
4. Focus returns to trigger element

### 4.3 Responsive Breakpoints

```css
/* Mobile-first breakpoints */
--bp-sm: 480px;    /* Small phone → large phone */
--bp-md: 768px;    /* Phone → tablet */
--bp-lg: 1024px;   /* Tablet → desktop */
--bp-xl: 1280px;   /* Desktop → wide desktop */

/* Game canvas scaling */
/* Base: 800x600 (internal resolution) */
/* Scales to fit viewport while maintaining aspect ratio */
/* UI overlays use viewport units, not canvas pixels */
```

---

## 5. Accessibility System

### 5.1 Focus Management Strategy

Every modal/overlay MUST:
1. Trap focus within the overlay (use `useFocusTrap`)
2. Return focus to the triggering element on close
3. Close on Escape key press
4. Prevent body scroll while open

```jsx
// Enhanced useFocusTrap hook with focus restoration
function useFocusTrap(isActive, onEscape) {
  const ref = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    // Save current focus for restoration
    previousFocusRef.current = document.activeElement;

    // Focus first focusable element
    const focusable = ref.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable?.length > 0) {
      focusable[0].focus();
    }

    return () => {
      // Restore focus on cleanup
      previousFocusRef.current?.focus?.();
    };
  }, [isActive]);

  // ... trap logic + escape handler
}
```

### 5.2 Color Blind Mode

Three modes using CSS filter overlays:

| Mode | CSS Filter | Affects |
|------|-----------|---------|
| Protanopia (red-blind) | Custom palette swap | HP bars, error states |
| Deuteranopia (green-blind) | Custom palette swap | Correct/wrong feedback |
| Tritanopia (blue-blind) | Custom palette swap | MP bars, info states |

Implementation: Add pattern/icon indicators alongside all color-coded elements so color is never the sole information channel.

### 5.3 Font Scale

4 presets applied via CSS custom property override:

| Preset | Scale | Use Case |
|--------|-------|----------|
| Small | 0.85x | Dense information screens |
| Normal | 1.0x | Default |
| Large | 1.25x | Mild vision impairment |
| Extra Large | 1.5x | Significant vision impairment |

```css
/* Applied to :root based on setting */
:root[data-font-scale="large"] {
  --text-xs: 10px;
  --text-sm: 13px;
  --text-base: 15px;
  --text-lg: 18px;
  --text-xl: 20px;
  --text-2xl: 25px;
  --text-3xl: 30px;
}
```

### 5.4 Text Speed Controls

4 presets for dialogue text reveal:

| Preset | Speed | Chars/frame |
|--------|-------|-------------|
| Instant | 0ms | All at once |
| Fast | 20ms | 3 chars |
| Normal | 40ms | 1 char |
| Slow | 80ms | 1 char |

### 5.5 Screen Reader Optimization

- All interactive elements have `aria-label`
- Dynamic content uses `aria-live` regions
- Decorative Arabic text uses `aria-hidden="true"`
- Game state changes announced via `aria-live="polite"`
- Battle actions announced via `aria-live="assertive"`

### 5.6 Keyboard Navigation

| Context | Key | Action |
|---------|-----|--------|
| Menu | Arrow Up/Down | Navigate items |
| Menu | Enter/Space | Select item |
| Menu | Escape | Close/back |
| Dialogue | Space/Enter | Advance text |
| Dialogue | 1-4 | Select choice |
| Battle | 1-4 | Select action |
| Battle | Enter | Confirm input |
| Overworld | Arrow keys | Move player |
| Overworld | Space | Interact |
| Overworld | M | Open map |
| Overworld | I | Open inventory |
| Overworld | Q | Open quests |

---

## 6. Phaser-React UI Bridge

### 6.1 Current Bridge Pattern

Phaser communicates UI state to React via EventBus:
```
Phaser (game logic) → EventBus.emit() → React (listens in useEffect)
React (user action) → EventBus.emit() → Phaser (listens in scene)
```

### 6.2 DOMOverlay System

The existing `DOMOverlay` system in Phaser creates DOM elements positioned relative to game objects (interaction prompts, NPC names). This should be extended for:

- Floating damage numbers (Phaser-native for performance)
- NPC speech bubbles (DOM for text rendering quality)
- Area labels on zone entry
- Item pickup notifications

### 6.3 State Synchronization Rules

1. **Redux is the source of truth** for all persistent game state
2. **Phaser scene state** is the source of truth for transient visual state (animations, particles, camera)
3. **EventBus** bridges the two — never read Phaser state from React or vice versa directly
4. **Batch updates**: When multiple Redux dispatches occur in sequence (e.g., battle resolution), batch them using `batch()` from react-redux or use a single action with multiple state changes

---

## 7. Component Expansion Plan (v6.0-v11.0)

### 7.1 v6.0 Combat UI Components

| Component | Type | New/Existing |
|-----------|------|-------------|
| BattleOverlay.jsx | Full-screen container | New |
| BattleMenu.jsx | Action selection (Attack/Magic/Defend/Flee) | New |
| BattleArabicInput.jsx | Arabic word input prompt | New |
| ComboCounter.jsx | Streak display | New |
| BattleResult.jsx | Victory/defeat screen | Existing (enhanced) |
| SpellMenu.jsx | Magic submenu with root elements | New |
| BattleHPBar.jsx | Animated HP/MP bars | New |
| StatusEffectIcons.jsx | Active buff/debuff display | New |

### 7.2 v7.0 World UI Components

| Component | Type | New/Existing |
|-----------|------|-------------|
| ZoneLoadingScreen.jsx | Loading tips during zone transition | New |
| MiniMap.jsx | Corner mini-map with fog of war | New |
| Compass.jsx | Direction indicator | New |
| WeatherIndicator.jsx | Current weather display | New |
| TimeDisplay.jsx | Day/night cycle indicator | New |
| TransportMenu.jsx | Mount/caravan/boat selection | New |

### 7.3 v8.0 Learning UI Components

| Component | Type | New/Existing |
|-----------|------|-------------|
| SkillTree.jsx | 6-branch skill tree visualization | New |
| GrammarExercise.jsx | 12 exercise type renderer | New |
| QuizEngine.jsx | 18 quiz type engine | New (replacing WordDuel quiz) |
| VocabCard.jsx | FSRS review card with animations | New |
| ProgressDashboard.jsx | CEFR progress visualization | New |
| AdaptiveHints.jsx | Contextual learning hints | New |

### 7.4 v9.0 Narrative UI Components

| Component | Type | New/Existing |
|-----------|------|-------------|
| JournalOverlay.jsx | Player journal with entries | New |
| FactionPanel.jsx | Faction reputation display | New |
| RelationshipPanel.jsx | NPC relationship status | New |
| CodexOverlay.jsx | Lore entries browser | New |
| GiftMenu.jsx | Gift selection for NPCs | New |
| QuestLog.jsx | Full quest log with categories | New (enhanced) |

### 7.5 v10.0 Infrastructure UI Components

| Component | Type | New/Existing |
|-----------|------|-------------|
| SaveSlotMenu.jsx | 3 save slots + auto-save indicator | New |
| DevConsole.jsx | Developer tools overlay | New |
| ContentBrowser.jsx | Authoring tool UI | New |
| PerformanceOverlay.jsx | FPS/memory display (dev) | New |

### 7.6 v11.0 Polish UI Components

| Component | Type | New/Existing |
|-----------|------|-------------|
| TutorialSequence.jsx | Step-by-step interactive tutorial | New |
| AccessibilityPanel.jsx | All accessibility settings | New |
| GamepadIndicator.jsx | Controller button prompts | New |
| CelebrationSequence.jsx | Achievement celebration animation | New |

---

## 8. Animation Library

### 8.1 Shared Framer Motion Variants

```javascript
// src/styles/animations.js

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

export const staggerChildren = {
  visible: { transition: { staggerChildren: 0.05 } },
};

// Battle-specific
export const shakeX = {
  shake: {
    x: [0, -5, 5, -3, 3, 0],
    transition: { duration: 0.4 },
  },
};

export const pulseGlow = {
  pulse: {
    boxShadow: [
      '0 0 0px rgba(212, 168, 67, 0)',
      '0 0 15px rgba(212, 168, 67, 0.5)',
      '0 0 0px rgba(212, 168, 67, 0)',
    ],
    transition: { duration: 1.5, repeat: Infinity },
  },
};

// Standard transition presets
export const getTransition = (reduceMotion) => ({
  fast: reduceMotion ? { duration: 0 } : { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
  normal: reduceMotion ? { duration: 0.1 } : { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  slow: reduceMotion ? { duration: 0.15 } : { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  bounce: reduceMotion ? { duration: 0.1 } : { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] },
});
```

### 8.2 Dialogue Text Effects

For story dialogue (Phase 45), text can have inline effects:

| Effect | Visual | Use Case |
|--------|--------|----------|
| Shake | Characters vibrate | Fear, earthquakes |
| Wave | Characters oscillate vertically | Water, dreamy |
| Grow | Characters pulse larger | Emphasis, shouting |
| Fade | Characters fade in/out | Whispers, ghostly |
| Color | Character color change | Magic, emotion |
| Pause | Delay before next characters | Dramatic timing |

Encoded in dialogue text as tags:
```
"The ground {shake}trembles{/shake} beneath your feet..."
"She whispers {fade}a secret{/fade} only you can hear..."
```

---

## 9. Islamic Design Patterns for UI

### 9.1 Border Frames

All UI panels use a 9-slice sprite based on Islamic geometric patterns:

```
┌─────────┬─────────────────────┬─────────┐
│ corner  │  top edge (repeat)  │ corner  │
├─────────┼─────────────────────┼─────────┤
│ left    │                     │ right   │
│ edge    │    content area     │ edge    │
│(repeat) │                     │(repeat) │
├─────────┼─────────────────────┼─────────┤
│ corner  │ bottom edge (repeat)│ corner  │
└─────────┴─────────────────────┴─────────┘
```

Corner tiles use 4-fold star patterns. Edge tiles use arabesque vine or geometric repeat.

### 9.2 Backgrounds

UI backgrounds use layered approach:
1. Base color (dark, from zone palette)
2. Geometric pattern overlay (10-15% opacity)
3. Vignette gradient (darker edges)
4. Content area (slightly lighter)

### 9.3 Dividers and Separators

Instead of plain `<hr>`, use geometric pattern dividers:
- Simple: ─ ◆ ─ (diamond center)
- Medium: ──── ✦ ──── (star center with lines)
- Ornate: Full geometric band (for section breaks)

---

## 10. Gamepad Support (v11.0)

### 10.1 Input Mapping

| Gamepad | Keyboard | Action |
|---------|----------|--------|
| D-pad / Left Stick | Arrow keys | Navigate / Move |
| A / Cross | Enter / Space | Confirm / Interact |
| B / Circle | Escape | Cancel / Back |
| X / Square | I | Inventory |
| Y / Triangle | M | Map |
| Start | Tab | Pause / Menu |
| L1/R1 | Q/E | Tab switch (in menus) |
| L2/R2 | — | Zoom (when available) |

### 10.2 Button Prompt System

Show contextual button prompts that match the player's input device:

```jsx
// src/components/ui/ButtonPrompt.jsx
// Detects keyboard vs gamepad and shows appropriate icon

<ButtonPrompt action="confirm" />
// Renders: "Enter ↵" (keyboard) or "Ⓐ" (Xbox) or "✕" (PlayStation)
```

### 10.3 Focus Navigation

All UI must support D-pad/stick navigation:
- Focus ring visible at all times when using gamepad
- Auto-focus on first element when entering a menu
- Wrap-around navigation (last item → first item)
- Group navigation (L1/R1 to jump between sections)

---

## 11. Implementation Priority

### Phase 1: Foundation (v6.0, immediate)

1. Create `src/styles/tokens.css` and `src/styles/tokens.js`
2. Create `PixelButton` component
3. Create `Overlay` base component
4. Migrate all overlays to use shared `Overlay` base
5. Add `useFocusTrap` to all modal components (standardize)
6. Create shared animation constants (`src/styles/animations.js`)

### Phase 2: Notification System (v6.0-v7.0)

7. Create `NotificationQueue` component
8. Add `NOTIFICATION_SHOW` to EventBus event types
9. Migrate all ad-hoc toasts to use NotificationQueue
10. Create `ScrollContainer` component

### Phase 3: Accessibility (v10.0-v11.0)

11. Implement font scale system
12. Implement text speed controls
13. Implement color blind mode
14. Implement gamepad detection and button prompts
15. Screen reader optimization pass

### Phase 4: Polish (v11.0)

16. Islamic geometric UI frames (9-slice sprites)
17. Menu transition choreography
18. Gradual HUD reveal system
19. Dialogue text effects engine
20. Celebration sequence system

---

## 12. Component File Structure

```
src/
  components/
    ui/                          # Shared UI components
      PixelButton.jsx
      PixelButton.module.css
      Overlay.jsx
      Overlay.module.css
      NotificationQueue.jsx
      NotificationQueue.module.css
      ScrollContainer.jsx
      ScrollContainer.module.css
      ButtonPrompt.jsx
      IslamicFrame.jsx
      Divider.jsx
    Battle/                      # Battle-specific UI
      BattleOverlay.jsx
      BattleMenu.jsx
      BattleArabicInput.jsx
      ComboCounter.jsx
      BattleResult.jsx           # (existing)
      SpellMenu.jsx
      BattleHPBar.jsx
      StatusEffectIcons.jsx
    Dialogue/                    # Dialogue-specific UI
      DialogueOverlay.jsx        # (existing, enhanced)
      DialogueTextRenderer.jsx   # Text effects engine
    HUD/                         # Heads-up display
      HUD.jsx                    # (existing, enhanced)
      MiniMap.jsx
      Compass.jsx
      WeatherIndicator.jsx
      TimeDisplay.jsx
    Learning/                    # Learning-specific UI
      SkillTree.jsx
      QuizEngine.jsx
      VocabCard.jsx
      ProgressDashboard.jsx
    Menu/                        # Menu screens
      MainMenu.jsx               # (existing)
      SettingsMenu.jsx            # (existing)
      SaveSlotMenu.jsx
      AccessibilityPanel.jsx
    Narrative/                   # Story/social UI
      JournalOverlay.jsx
      CodexOverlay.jsx
      FactionPanel.jsx
      RelationshipPanel.jsx
  styles/
    tokens.css                   # CSS custom properties
    tokens.js                    # JS mirror
    animations.js                # Shared animation variants
    global.css                   # (existing)
```

---

*Generated: 2026-02-12*
*Based on codebase analysis of: HUD.jsx, DialogueOverlay.jsx, LevelUpModal.jsx, WordDuel.jsx, TutorialHints.jsx, useFocusTrap.js, SettingsMenu.jsx, WorldMap.jsx, ShopOverlay.jsx, MainMenu.jsx*
*Related docs: EXPANSION-SUMMARY.md, AAA-QUALITY-GAPS.md*
