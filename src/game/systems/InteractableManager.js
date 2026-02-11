import Phaser from 'phaser';
import { EventBus } from '../../utils/eventBus.js';
import { EVENTS } from '../../utils/eventBusTypes.js';
import { store } from '../../store/store.js';
import { stripDiacritics } from '../../utils/arabicUtils.js';

// Interactable proximity threshold: 2 tiles = 128px
const INTERACT_RANGE = 64 * 2;

/**
 * InteractableManager
 * Manages chests, bookshelves, signs — anything the player can interact with that isn't an NPC
 */
export class InteractableManager {
  constructor(scene) {
    this.scene = scene;
    this.interactables = [];
    this.doorTweens = [];
  }

  /**
   * Create interactable objects from zone config
   */
  create(interactableConfigs, objectSprites) {
    this.interactables = [];

    interactableConfigs.forEach((cfg) => {
      const px = cfg.x * 64 + 32;
      const py = cfg.y * 64 + 32;

      // Choose sprite based on type
      let spriteKey;
      if (cfg.type === 'sign') spriteKey = 'gate-pillar';
      else if (cfg.type === 'bookshelf') spriteKey = 'ruin-pillar';
      else if (cfg.type === 'chest') spriteKey = 'rock1';
      else if (cfg.type === 'door') spriteKey = 'house-small';

      const sprite = this.scene.add.image(px, py, spriteKey).setOrigin(0.5, 0.8);
      sprite.setScale(0.7);

      // Tint already-opened chests from persisted state
      if (cfg.type === 'chest') {
        const openedChests = store.getState().player.openedChests || [];
        if (openedChests.includes(cfg.id)) {
          sprite.setTint(0x666666);
        }
      }
      objectSprites.push(sprite);

      // Label above the object (respects harakat setting)
      const showDiacritics = store.getState().settings?.showDiacritics ?? true;
      const rawLabel = cfg.type === 'sign' ? cfg.textArabic
        : cfg.type === 'bookshelf' ? 'Bookshelf'
        : cfg.type === 'door' ? (cfg.labelArabic || 'Door')
        : 'Chest';
      const useArabicFont = cfg.type === 'sign' || (cfg.type === 'door' && cfg.labelArabic);
      const labelText = (useArabicFont && !showDiacritics) ? stripDiacritics(rawLabel) : rawLabel;
      const label = this.scene.add.text(px, py - 50, labelText, {
        fontFamily: useArabicFont ? "'Noto Naskh Arabic', serif" : "'Press Start 2P', monospace",
        fontSize: useArabicFont ? '14px' : '7px',
        color: '#e2b659',
        stroke: '#2b292c',
        strokeThickness: 3,
        align: 'center',
      }).setOrigin(0.5).setDepth(9999);

      // Interaction hint (hidden by default)
      const hintText = this.scene.add.text(px, py + 30, '[SPACE]', {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '7px',
        color: '#f4fefa',
        stroke: '#2b292c',
        strokeThickness: 2,
      }).setOrigin(0.5).setVisible(false).setDepth(9999);

      const interactable = {
        ...cfg,
        sprite,
        label,
        hintText,
        worldX: px,
        worldY: py,
      };
      this.interactables.push(interactable);

      // Door glow effect: pulsing alpha for unlocked doors with interiors
      if (cfg.type === 'door') {
        if (!cfg.locked && cfg.interiorId) {
          const tween = this.scene.tweens.add({
            targets: sprite,
            alpha: { from: 0.85, to: 1.0 },
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
          });
          this.doorTweens.push(tween);
        } else if (cfg.locked) {
          sprite.setTint(0x888888);
        }
      }
    });
  }

  /**
   * Update interactable zones (called every frame)
   * Checks proximity and handles SPACE key for interaction
   */
  update(playerSprite, interactKey, interactCooldown, setInteractCooldown) {
    let nearInteractable = false;

    this.interactables.forEach((obj) => {
      const dist = Phaser.Math.Distance.Between(
        playerSprite.x,
        playerSprite.y,
        obj.worldX,
        obj.worldY
      );
      const inRange = dist < INTERACT_RANGE;
      obj.hintText.setVisible(inRange);

      if (
        inRange &&
        !nearInteractable &&
        Phaser.Input.Keyboard.JustDown(interactKey) &&
        !interactCooldown
      ) {
        nearInteractable = true;
        setInteractCooldown(true);
        this.scene.time.delayedCall(500, () => {
          setInteractCooldown(false);
        });
        this.handleInteractable(obj);
      }
    });
  }

  /**
   * Handle interaction with an object (sign, chest, bookshelf)
   */
  handleInteractable(obj) {
    const playerState = store.getState().player;
    const openedChests = playerState.openedChests || [];
    const readBooks = playerState.readBooks || [];

    if (obj.type === 'sign') {
      EventBus.emit(EVENTS.SIGN_SHOW, {
        arabic: obj.textArabic,
        english: obj.textEnglish,
      });
      EventBus.emit(EVENTS.PLAYER_FREEZE);
    } else if (obj.type === 'bookshelf') {
      if (!readBooks.includes(obj.id)) {
        EventBus.emit(EVENTS.BOOKSHELF_INTERACT, {
          category: obj.category,
          id: obj.id,
        });
        EventBus.emit(EVENTS.PLAYER_FREEZE);
      } else {
        EventBus.emit(EVENTS.BOOKSHELF_INTERACT, {
          category: obj.category,
          id: obj.id,
          reread: true,
        });
        EventBus.emit(EVENTS.PLAYER_FREEZE);
      }
    } else if (obj.type === 'chest') {
      if (!openedChests.includes(obj.id)) {
        const amount = Math.floor(
          Math.random() * (obj.maxDirhams - obj.minDirhams + 1)
        ) + obj.minDirhams;
        EventBus.emit(EVENTS.CHEST_OPENED, { amount, id: obj.id });
        // Visual feedback: tint the chest to show it's opened
        if (obj.sprite) obj.sprite.setTint(0x666666);
      } else {
        EventBus.emit(EVENTS.CHEST_EMPTY, { id: obj.id });
      }
    } else if (obj.type === 'door') {
      let isLocked = obj.locked;
      if (isLocked && obj.unlockFlag) {
        const state = store.getState();
        const flagValue = state.narrative?.storyFlags?.[obj.unlockFlag];
        if (flagValue) {
          isLocked = false;
          obj.locked = false;
          if (obj.sprite) obj.sprite.clearTint();
        }
      }
      if (isLocked) {
        EventBus.emit(EVENTS.DOOR_LOCKED, {
          message: obj.lockMessage || 'This door is locked.',
          id: obj.id,
        });
      } else if (obj.interiorId) {
        const player = this.scene.playerController?.getPlayer();
        EventBus.emit(EVENTS.DOOR_OPENED, {
          id: obj.id,
          interiorId: obj.interiorId,
          entryPosition: player ? { x: player.x, y: player.y } : null,
        });
      } else {
        EventBus.emit(EVENTS.DOOR_OPENED, { id: obj.id });
      }
    }
  }

  /**
   * Destroy all interactables
   */
  destroy() {
    this.doorTweens.forEach((t) => { if (t) t.remove(); });
    this.doorTweens = [];

    this.interactables.forEach((obj) => {
      if (obj.sprite) obj.sprite.destroy();
      if (obj.label) obj.label.destroy();
      if (obj.hintText) obj.hintText.destroy();
    });
    this.interactables = [];
  }
}
