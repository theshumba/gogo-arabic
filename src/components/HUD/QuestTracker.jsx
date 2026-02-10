import { useState, useEffect, memo } from 'react';
import { useSelector } from 'react-redux';
import { selectActiveQuest, selectActiveQuestObjectiveLocation } from '../../store/slices/questSlice.js';
import { EventBus } from '../../utils/eventBus.js';
import { EVENTS } from '../../utils/eventBusTypes.js';
import styles from './QuestTracker.module.css';

function QuestTracker() {
  const activeQuest = useSelector(selectActiveQuest);
  const objectiveLocation = useSelector(selectActiveQuestObjectiveLocation);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });

  // Listen for player position updates from Phaser
  useEffect(() => {
    const handlePositionUpdate = (pos) => {
      setPlayerPos(pos);
    };

    EventBus.on(EVENTS.PLAYER_POSITION_UPDATE, handlePositionUpdate);
    return () => {
      EventBus.off(EVENTS.PLAYER_POSITION_UPDATE, handlePositionUpdate);
    };
  }, []);

  if (!activeQuest) return null;

  // Calculate compass angle
  let compassAngle = null;
  if (objectiveLocation && playerPos.x !== 0 && playerPos.y !== 0) {
    const dx = objectiveLocation.x - playerPos.x;
    const dy = objectiveLocation.y - playerPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only show compass if objective is more than 2 tiles away (128px)
    if (distance > 128) {
      const angleRad = Math.atan2(dy, dx);
      compassAngle = (angleRad * 180) / Math.PI;
    }
  }

  const progressPct = activeQuest.target > 0
    ? Math.min(100, (activeQuest.progress / activeQuest.target) * 100)
    : 0;

  return (
    <div className={styles.tracker} role="status" aria-label={`Active quest: ${activeQuest.title}`}>
      <div className={styles.questInfo}>
        <div className={styles.questName}>{activeQuest.title}</div>
        <div className={styles.questObjective}>
          <span className={styles.progressText}>
            {activeQuest.progress}/{activeQuest.target}
          </span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
      {compassAngle !== null && (
        <div
          className={styles.compass}
          aria-label={`Objective direction: ${Math.round(compassAngle)} degrees`}
        >
          <div
            className={styles.compassArrow}
            style={{ transform: `rotate(${compassAngle}deg)` }}
          >
            &#9658;
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(QuestTracker);
