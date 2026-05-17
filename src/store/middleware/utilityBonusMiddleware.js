export const utilityBonusMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();
  const utilities = state.home?.utilities || {};

  // Knowledge bonus: +XP on player/addXP (canonical) and vocabulary card updates.
  // The base XP reducer (player/addXP) takes a NUMBER payload — not {xp: ...}.
  // Previously this listened to 'player/addXp' (lowercase typo, dead branch)
  // AND would have dispatched a {xp, source} object payload — which the real
  // reducer would have summed into state.xp as `state.xp += { ... }` → NaN.
  if (action.type === 'player/addXP' && !action.meta?.utilityBonus) {
    const xp = typeof action.payload === 'number' ? action.payload : 0;
    if (xp > 0) {
      const knowledgeBonus = Math.floor(utilities.Knowledge / 10); // +1 XP per 10 Knowledge
      if (knowledgeBonus > 0) {
        store.dispatch({
          type: 'player/addXP',
          payload: knowledgeBonus,
          meta: { utilityBonus: true, source: 'knowledge_utility' },
        });
      }
    }
  }

  // Hospitality bonus: friendship gains amplified by a flat additional delta.
  // Must ADD to the existing delta, not REPLACE it. Previously this overwrote
  // the original payload.delta with the small bonus value.
  if (action.type === 'npc/adjustFriendship' && !action.meta?.utilityBonus) {
    const baseDelta = action.payload?.delta;
    if (typeof baseDelta === 'number' && baseDelta > 0) {
      const hospitalityBonus = Math.floor(utilities.Hospitality / 20); // +1 per 20
      if (hospitalityBonus > 0) {
        store.dispatch({
          type: 'npc/adjustFriendship',
          payload: { ...action.payload, delta: hospitalityBonus, reason: 'hospitality_utility' },
          meta: { utilityBonus: true },
        });
      }
    }
  }

  return result;
};

// Comfort and Barakah are read directly by game systems:
// - Comfort: selectUtility('Comfort') → battle/recovery systems check this value
// - Barakah: selectUtility('Barakah') → loot/drop systems check this value
// These bonuses are "pull" not "push" — systems read the value when needed.
// No middleware needed for those.
