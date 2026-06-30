/**
 * FloatingArabicLabelManager
 * IMM-03: Renders floating Arabic labels above interactable world objects.
 * Labels fade based on FSRS vocabulary stability — new words are prominent,
 * mastered words fade to zero.
 */

import Phaser from 'phaser';
import { store } from '../../store/store.js';
import { getLabelsForZone } from '../../data/environmentalLabels.js';
import { createArabicText } from '../ui/ArabicText.js';

const LABEL_OFFSET_Y = -65;
const TRANSLIT_OFFSET_Y = -78;
const UPDATE_INTERVAL = 5000;
// Reveal a label only as the player walks up to its object (~2.5 tiles), matching
// InteractableManager/GatheringSpotManager — instead of showing all labels at once.
const LABEL_REVEAL_RANGE = 160;

export class FloatingArabicLabelManager {
  constructor(scene) {
    this.scene = scene;
    this.labels = [];
    this._lastUpdateTime = 0;
  }

  /**
   * Create floating labels for all matching interactables in the zone.
   * @param {string} zoneName - Zone ID from zones.js
   * @param {import('./InteractableManager.js').InteractableManager} interactableManager
   */
  create(zoneName, interactableManager) {
    this.destroy();
    const labelDefs = getLabelsForZone(zoneName);
    if (!labelDefs.length) return;

    const interactables = interactableManager.interactables || [];

    for (const def of labelDefs) {
      const obj = interactables.find((i) => i.id === def.interactableId);
      if (!obj) continue;

      const px = obj.worldX;
      const py = obj.worldY;

      // Arabic label above object — uses createArabicText for proper reshaping/RTL
      const arabicText = createArabicText(this.scene, px, py + LABEL_OFFSET_Y, def.arabic, {
        fontSize: '16px',
        color: '#e2b659',
        stroke: '#1a1a2e',
        strokeThickness: 4,
      });
      arabicText.setDepth(9998);

      // Transliteration below Arabic
      const translitText = this.scene.add.text(px, py + TRANSLIT_OFFSET_Y, def.transliteration, {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '6px',
        color: '#c8c8c8',
        stroke: '#1a1a2e',
        strokeThickness: 2,
      }).setOrigin(0.5).setDepth(9998);

      // Gentle bob animation on the Arabic text
      this.scene.tweens.add({
        targets: [arabicText],
        y: py + LABEL_OFFSET_Y - 4,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // Hidden until the player walks up close — proximity reveal (see update()).
      arabicText.setVisible(false);
      translitText.setVisible(false);

      this.labels.push({ def, arabicText, translitText, worldX: px, worldY: py });
    }

    this._recomputeMastery();
  }

  /**
   * Per-frame visibility: reveal a label's vocab only while the player is within
   * LABEL_REVEAL_RANGE of its object, combined with FSRS mastery (mastered words
   * stay hidden, fading ones dim). Mastery is recomputed on the throttled interval;
   * proximity is checked every frame so labels reveal as the player approaches.
   * @param {Phaser.GameObjects.GameObject & {x:number,y:number}} playerSprite
   * @param {number} time - Phaser scene time
   */
  update(playerSprite, time) {
    if (time - this._lastUpdateTime >= UPDATE_INTERVAL) {
      this._lastUpdateTime = time;
      this._recomputeMastery();
    }

    if (!playerSprite) return;

    for (const label of this.labels) {
      const near = Phaser.Math.Distance.Between(
        playerSprite.x, playerSprite.y, label.worldX, label.worldY
      ) < LABEL_REVEAL_RANGE;

      const showArabic = near && !label.mastered && label.masteryArabicAlpha > 0;
      label.arabicText.setVisible(showArabic);
      if (showArabic) label.arabicText.setAlpha(label.masteryArabicAlpha);

      const showTranslit = near && label.masteryTranslitVisible;
      label.translitText.setVisible(showTranslit);
      if (showTranslit) label.translitText.setAlpha(label.masteryTranslitAlpha);
    }
  }

  /**
   * Recompute each label's FSRS-driven target alpha/visibility (applied per-frame by
   * update(), gated on proximity). Stored on the label rather than applied directly.
   * - No card or 0 reps: full prominence (new word)
   * - Stability < 7: full Arabic, transliteration visible
   * - Stability 7–29: faded Arabic, transliteration hidden
   * - Stability >= 30: fully mastered (never shown)
   */
  _recomputeMastery() {
    const state = store.getState();
    const fsrsCards = state.vocabulary?.fsrsCards ?? {};

    for (const label of this.labels) {
      const cardData = fsrsCards[label.def.vocabWordId];

      if (!cardData || !cardData.card || cardData.card.reps === 0) {
        label.masteryArabicAlpha = 1.0;
        label.masteryTranslitVisible = true;
        label.masteryTranslitAlpha = 0.8;
        label.mastered = false;
        continue;
      }

      const stability = cardData.card.stability || 0;

      if (stability < 7) {
        label.masteryArabicAlpha = 1.0;
        label.masteryTranslitVisible = true;
        label.masteryTranslitAlpha = 0.6;
        label.mastered = false;
      } else if (stability < 30) {
        label.masteryArabicAlpha = 0.5;
        label.masteryTranslitVisible = false;
        label.masteryTranslitAlpha = 0;
        label.mastered = false;
      } else {
        label.masteryArabicAlpha = 0;
        label.masteryTranslitVisible = false;
        label.masteryTranslitAlpha = 0;
        label.mastered = true;
      }
    }
  }

  /**
   * Destroy all labels and free resources.
   */
  destroy() {
    for (const label of this.labels) {
      if (label.arabicText?.destroy) label.arabicText.destroy();
      if (label.translitText?.destroy) label.translitText.destroy();
    }
    this.labels = [];
    this._lastUpdateTime = 0;
  }
}
