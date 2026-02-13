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
  const [companionAction, setCompanionAction] = useState(null);
  const [isCompanionTurn, setIsCompanionTurn] = useState(false);

  const streak = useSelector((s) => s.battle.streak);
  const activeParty = useSelector((s) => s.companions?.activeParty);
  const allCompanions = useSelector((s) => s.companions?.companions);
  const battleState = useSelector((s) => s.battle);

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

    const onCompanionTurnStart = ({ companionId: _companionId }) => {
      setIsCompanionTurn(true);
      setCompanionAction(null);
    };

    const onCompanionAction = ({ companionId: _companionId, action }) => {
      setCompanionAction(action);
    };

    const onCompanionTurnEnd = () => {
      setIsCompanionTurn(false);
      setCompanionAction(null);
    };

    EventBus.on(EVENTS.BATTLE_STARTED, onBattleStarted);
    EventBus.on(EVENTS.BATTLE_STATE_CHANGED, onStateChanged);
    EventBus.on(EVENTS.BATTLE_PROMPT_WORD, onPromptWord);
    EventBus.on(EVENTS.BATTLE_ENEMY_ACTION, onEnemyAction);
    EventBus.on(EVENTS.BATTLE_ENDED, onBattleEnded);
    EventBus.on(EVENTS.COMPANION_BATTLE_TURN_START, onCompanionTurnStart);
    EventBus.on(EVENTS.COMPANION_BATTLE_ACTION, onCompanionAction);
    EventBus.on(EVENTS.COMPANION_BATTLE_TURN_END, onCompanionTurnEnd);

    return () => {
      EventBus.off(EVENTS.BATTLE_STARTED, onBattleStarted);
      EventBus.off(EVENTS.BATTLE_STATE_CHANGED, onStateChanged);
      EventBus.off(EVENTS.BATTLE_PROMPT_WORD, onPromptWord);
      EventBus.off(EVENTS.BATTLE_ENEMY_ACTION, onEnemyAction);
      EventBus.off(EVENTS.BATTLE_ENDED, onBattleEnded);
      EventBus.off(EVENTS.COMPANION_BATTLE_TURN_START, onCompanionTurnStart);
      EventBus.off(EVENTS.COMPANION_BATTLE_ACTION, onCompanionAction);
      EventBus.off(EVENTS.COMPANION_BATTLE_TURN_END, onCompanionTurnEnd);
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

      {/* Companion turn indicator */}
      {isCompanionTurn && (
        <div
          style={{
            position: 'absolute',
            bottom: '200px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(26, 26, 46, 0.95)',
            border: '2px solid #4A90D9',
            borderRadius: '8px',
            padding: '12px 20px',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px', color: '#4A90D9', marginBottom: '6px' }}>
            Companion&apos;s Turn
          </div>
          {companionAction && (
            <div style={{ fontSize: '11px', color: '#f4fefa' }}>
              {companionAction.action === 'heal' && '💚 Healing...'}
              {companionAction.action === 'attack' && '⚔️ Attacking...'}
              {companionAction.action === 'defend' && '🛡️ Defending...'}
              {companionAction.action === 'buff' && '✨ Buffing...'}
              {companionAction.action === 'skill' && '💫 Using skill...'}
              {companionAction.action === 'dispel' && '🌀 Dispelling...'}
            </div>
          )}
        </div>
      )}

      {/* Companion HP/MP bars (if battle companion active) */}
      {activeParty?.battle && battleState?.companionHP !== undefined && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(26, 26, 46, 0.9)',
            border: '2px solid #4A90D9',
            borderRadius: '8px',
            padding: '12px',
            minWidth: '150px',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: '8px', color: '#4A90D9', fontFamily: "'Press Start 2P', monospace", marginBottom: '6px' }}>
            {allCompanions && allCompanions[activeParty.battle] ?
              (allCompanions[activeParty.battle].name || 'Companion') :
              'Companion'}
          </div>
          {/* HP Bar */}
          <div style={{ marginBottom: '4px' }}>
            <div style={{ fontSize: '7px', color: '#2ECC71', marginBottom: '2px' }}>HP</div>
            <div style={{ width: '120px', height: '8px', background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.max(0, Math.min(100, ((battleState.companionHP || 0) / (battleState.companionMaxHP || 1)) * 100))}%`,
                  height: '100%',
                  background: '#4CAF50',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
          {/* MP Bar */}
          <div>
            <div style={{ fontSize: '7px', color: '#2196F3', marginBottom: '2px' }}>MP</div>
            <div style={{ width: '120px', height: '6px', background: '#333', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.max(0, Math.min(100, ((battleState.companionMP || 0) / (battleState.companionMaxMP || 1)) * 100))}%`,
                  height: '100%',
                  background: '#2196F3',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
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
