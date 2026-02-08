import { useSelector, useDispatch } from 'react-redux';
import { closeDialogue, showNotification } from '../../store/slices/uiSlice.js';
import { claimReward, setActiveQuest } from '../../store/slices/questSlice.js';
import { addXP, addDirhams } from '../../store/slices/playerSlice.js';
import { EventBus } from '../../utils/eventBus.js';
import questsData from '../../data/quests.json';
import { ZONES, ZONE_ORDER } from '../../data/zones.js';
import { useFocusTrap } from '../../hooks/useFocusTrap.js';
import styles from './QuestLog.module.css';

// Group quests by zone
function groupQuestsByZone() {
  const groups = {};
  for (const zoneId of ZONE_ORDER) {
    groups[zoneId] = questsData.filter((q) => q.zone === zoneId);
  }
  // Add any quests without a zone at the end
  const unzoned = questsData.filter((q) => !q.zone);
  if (unzoned.length > 0) {
    groups._other = unzoned;
  }
  return groups;
}

export default function QuestLog() {
  const dispatch = useDispatch();
  const quests = useSelector((s) => s.quests.quests);
  const activeQuestId = useSelector((s) => s.quests.activeQuestId);

  const handleClose = () => {
    dispatch(closeDialogue());
    EventBus.emit('unfreeze-player');
  };

  const focusTrapRef = useFocusTrap(true, handleClose);

  const handleClaim = (questId) => {
    const qd = questsData.find((q) => q.id === questId);
    if (qd?.reward) {
      dispatch(addXP(qd.reward.xp));
      dispatch(addDirhams(qd.reward.dirhams));
      dispatch(showNotification({
        message: `+${qd.reward.xp} XP, +${qd.reward.dirhams} Dirhams`,
        type: 'xp',
      }));
    }
    dispatch(claimReward(questId));
  };

  const questGroups = groupQuestsByZone();

  const renderQuest = (qd) => {
    const state = quests[qd.id];
    const status = state?.status || 'locked';
    const progress = state?.progress || 0;
    const rewardClaimed = state?.rewardClaimed || false;
    const target = qd.target;
    const pct = Math.min(100, (progress / target) * 100);

    let itemClassName = styles.questItem;
    let titleClassName = styles.questTitle;
    let badge = null;

    if (status === 'completed') {
      itemClassName = `${styles.questItem} ${styles.questCompleted}`;
      badge = <span className={styles.badgeComplete}>Complete</span>;
    } else if (status === 'active') {
      itemClassName = `${styles.questItem} ${styles.questActive}`;
      titleClassName = `${styles.questTitle} ${styles.questTitleActive}`;
      badge = <span className={styles.badgeActive}>Active</span>;
    } else {
      itemClassName = `${styles.questItem} ${styles.questLocked}`;
      badge = <span className={styles.badgeLocked}>Locked</span>;
    }

    return (
      <div key={qd.id} className={itemClassName}>
        <div className={styles.questTitleRow}>
          <span className={titleClassName}>{qd.title}</span>
          {badge}
        </div>
        <div className={styles.questDesc}>{qd.description}</div>
        <div className={styles.progressBarOuter}>
          <div
            className={`${styles.progressFill} ${status === 'completed' ? styles.progressFillComplete : ''}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className={styles.progressRow}>
          <span className={styles.progressText}>{progress}/{target}</span>
          <span className={styles.reward}>
            {qd.reward.xp} XP + {qd.reward.dirhams} Dirhams
          </span>
        </div>
        {status === 'active' && (
          <button
            className={`${styles.trackBtn} ${activeQuestId === qd.id ? styles.trackBtnActive : ''}`}
            onClick={() => dispatch(setActiveQuest(qd.id))}
            disabled={activeQuestId === qd.id}
          >
            {activeQuestId === qd.id ? 'Tracking' : 'Track Quest'}
          </button>
        )}
        {status === 'completed' && !rewardClaimed && (
          <button
            className={styles.claimBtn}
            onClick={() => handleClaim(qd.id)}
          >
            Claim Reward
          </button>
        )}
        {status === 'completed' && rewardClaimed && (
          <div className={styles.claimedText}>Reward Claimed</div>
        )}
      </div>
    );
  };

  return (
    <div ref={focusTrapRef} className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.title}>Quest Log</div>
          <button className={styles.closeBtn} onClick={handleClose}>Close</button>
        </div>

        {ZONE_ORDER.map((zoneId) => {
          const zoneQuests = questGroups[zoneId];
          if (!zoneQuests || zoneQuests.length === 0) return null;
          const zone = ZONES[zoneId];

          return (
            <div key={zoneId}>
              <div className={styles.zoneHeader}>
                <span className={styles.zoneName}>{zone?.name || zoneId}</span>
                {zone?.nameArabic && (
                  <span className={styles.zoneNameArabic}>{zone.nameArabic}</span>
                )}
              </div>
              {zoneQuests.map(renderQuest)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
