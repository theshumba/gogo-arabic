/**
 * BattleOverlay.jsx — React overlay container for all battle UI.
 *
 * Listens to EventBus for BattleScene state changes.
 * Renders BattleMenu (action select), BattleArabicInput (word prompt),
 * ComboCounter (streak), enemy intent text, and BattleResult (victory/defeat).
 *
 * Mounted inside GameLayout. Only visible when battle is active.
 */

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { EventBus } from '../../utils/eventBus.js';
import { EVENTS } from '../../utils/eventBusTypes.js';
import BattleMenu from './BattleMenu.jsx';
import BattleArabicInput from './BattleArabicInput.jsx';
import ComboCounter from './ComboCounter.jsx';
import BattleResult from './BattleResult.jsx';

export default function BattleOverlay() {
  const [battleActive, setBattleActive] = useState(false);
  const [phase, setPhase] = useState('idle');
  const [availableActions, setAvailableActions] = useState([]);
  const [prompt, setPrompt] = useState(null);
  const [enemyAction, setEnemyAction] = useState(null);
  const [battleResult, setBattleResult] = useState(null);

  const streak = useSelector((s) => s.battle.streak);

  useEffect(() => {
    const onBattleStarted = () => {
      setBattleActive(true);
      setPhase('intro');
      setBattleResult(null);
    };

    const onStateChanged = ({ to, actions }) => {
      setPhase(to);
      if (to === 'ACTION_SELECT' && actions) {
        setAvailableActions(actions);
      }
      if (to !== 'INPUT_PHASE') {
        setPrompt(null);
      }
      if (to !== 'ENEMY_TURN') {
        setEnemyAction(null);
      }
    };

    const onPromptWord = (wordData) => {
      setPrompt(wordData);
    };

    const onEnemyAction = (data) => {
      setEnemyAction(data);
    };

    const onBattleEnded = (result) => {
      setBattleResult(result);
      setPhase('result');
    };

    EventBus.on(EVENTS.BATTLE_STARTED, onBattleStarted);
    EventBus.on(EVENTS.BATTLE_STATE_CHANGED, onStateChanged);
    EventBus.on(EVENTS.BATTLE_PROMPT_WORD, onPromptWord);
    EventBus.on(EVENTS.BATTLE_ENEMY_ACTION, onEnemyAction);
    EventBus.on(EVENTS.BATTLE_ENDED, onBattleEnded);

    return () => {
      EventBus.off(EVENTS.BATTLE_STARTED, onBattleStarted);
      EventBus.off(EVENTS.BATTLE_STATE_CHANGED, onStateChanged);
      EventBus.off(EVENTS.BATTLE_PROMPT_WORD, onPromptWord);
      EventBus.off(EVENTS.BATTLE_ENEMY_ACTION, onEnemyAction);
      EventBus.off(EVENTS.BATTLE_ENDED, onBattleEnded);
    };
  }, []);

  const handleBattleClose = useCallback(() => {
    setBattleActive(false);
    setPhase('idle');
    setBattleResult(null);
  }, []);

  if (!battleActive) return null;

  return (
    <div
      className="battle-overlay-container"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 250 }}
    >
      {/* Battle menu — visible during ACTION_SELECT */}
      <div style={{ pointerEvents: 'auto' }}>
        <BattleMenu
          visible={phase === 'ACTION_SELECT'}
          availableActions={availableActions}
          onAction={() => setPhase('waiting')}
        />
      </div>

      {/* Arabic input — visible during INPUT_PHASE */}
      <div style={{ pointerEvents: 'auto' }}>
        <BattleArabicInput
          prompt={phase === 'INPUT_PHASE' ? prompt : null}
          onSubmit={() => setPhase('resolving')}
        />
      </div>

      {/* Combo counter — always visible when streak > 1 */}
      <ComboCounter streak={streak} />

      {/* Enemy action intent */}
      {phase === 'ENEMY_TURN' && enemyAction && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '12px',
            color: '#FF6666',
            textShadow: '0 0 8px rgba(255, 102, 102, 0.5)',
            pointerEvents: 'none',
            textAlign: 'center',
            direction: 'rtl',
          }}
        >
          <p>{enemyAction.intent}</p>
        </div>
      )}

      {/* Battle result overlay */}
      {phase === 'result' && battleResult && (
        <div style={{ pointerEvents: 'auto' }}>
          <BattleResult
            victory={battleResult.victory}
            bossId={battleResult.bossId}
            onClose={handleBattleClose}
          />
        </div>
      )}
    </div>
  );
}
