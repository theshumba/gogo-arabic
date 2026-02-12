/**
 * EnemyAI.js — Pattern-based enemy AI for turn-based combat.
 *
 * 5 AI patterns: aggressive, defensive, balanced, adaptive, boss.
 * Adaptive AI uses FSRS data to target the player's weakest vocabulary.
 * Boss AI changes behavior at HP thresholds (enrage phases).
 */

export class EnemyAI {
  /**
   * @param {Object} enemyData - Enemy config from enemies.js
   * @param {Object} playerFSRS - Player's FSRS vocabulary data (wordId -> card)
   */
  constructor(enemyData, playerFSRS) {
    this.enemy = enemyData;
    this.fsrs = playerFSRS || {};
    this.pattern = enemyData.aiPattern || 'balanced';
  }

  /**
   * Decide enemy action based on AI pattern and battle state.
   * @param {Object} battleState - Current battle state from Redux
   * @returns {{ type: string, damage: number, enemyIndex: number, intentText: string, element?: string, healAmount?: number, targetWord?: string }}
   */
  decide(battleState) {
    const patterns = {
      aggressive: this._aggressivePattern,
      defensive: this._defensivePattern,
      balanced: this._balancedPattern,
      adaptive: this._adaptivePattern,
      boss: this._bossPattern,
    };

    const patternFn = patterns[this.pattern] || patterns.balanced;
    return patternFn.call(this, battleState);
  }

  _aggressivePattern(state) {
    // 80% attack, 15% special, 5% defend
    const roll = Math.random();
    if (roll < 0.8) return this._basicAttack();
    if (roll < 0.95) return this._specialAttack();
    return this._defend();
  }

  _defensivePattern(state) {
    // Heal when low, defend often
    if (state.bossHP < state.maxBossHP * 0.3) return this._heal();
    const roll = Math.random();
    if (roll < 0.4) return this._defend();
    if (roll < 0.8) return this._basicAttack();
    return this._specialAttack();
  }

  _balancedPattern(state) {
    const roll = Math.random();
    if (roll < 0.5) return this._basicAttack();
    if (roll < 0.75) return this._specialAttack();
    if (roll < 0.9) return this._defend();
    return this._heal();
  }

  /**
   * Adaptive AI: targets the player's weakest vocabulary.
   * Uses FSRS data to select words the player struggles with.
   */
  _adaptivePattern(state) {
    const weakWords = Object.entries(this.fsrs)
      .filter(([, card]) => card.card?.stability < 5)
      .sort((a, b) => (a[1].card?.stability || 0) - (b[1].card?.stability || 0))
      .slice(0, 5);

    if (weakWords.length > 0 && Math.random() < 0.6) {
      return {
        type: 'quiz_attack',
        damage: this.enemy.baseDamage,
        enemyIndex: 0,
        targetWord: weakWords[Math.floor(Math.random() * weakWords.length)][0],
        intentText: `${this.enemy.nameArabic} targets your weak point!`,
      };
    }

    return this._balancedPattern(state);
  }

  /**
   * Boss AI: phase-based behavior changes at HP thresholds.
   * >70% HP: balanced, 30-70%: aggressive (enrage), <30%: desperate (specials + heals)
   */
  _bossPattern(state) {
    const hpRatio = state.bossHP / state.maxBossHP;

    if (hpRatio > 0.7) {
      return this._balancedPattern(state);
    } else if (hpRatio > 0.3) {
      return this._aggressivePattern(state);
    } else {
      if (Math.random() < 0.4) return this._heal();
      return this._specialAttack();
    }
  }

  _basicAttack() {
    return {
      type: 'attack',
      damage: this.enemy.baseDamage,
      enemyIndex: 0,
      intentText: `${this.enemy.nameArabic} attacks!`,
    };
  }

  _specialAttack() {
    return {
      type: 'special',
      damage: Math.floor(this.enemy.baseDamage * 1.5),
      element: this.enemy.element,
      enemyIndex: 0,
      intentText: `${this.enemy.nameArabic} uses a special attack!`,
    };
  }

  _defend() {
    return {
      type: 'defend',
      damage: 0,
      enemyIndex: 0,
      intentText: `${this.enemy.nameArabic} takes a defensive stance.`,
    };
  }

  _heal() {
    return {
      type: 'heal',
      damage: 0,
      healAmount: Math.floor(this.enemy.baseDamage * 0.5),
      enemyIndex: 0,
      intentText: `${this.enemy.nameArabic} recovers!`,
    };
  }
}
