import { useSelector, useDispatch } from 'react-redux';
import { closeDialogue, showNotification } from '../../store/slices/uiSlice.js';
import { claimReward } from '../../store/slices/questSlice.js';
import { addXP, addDirhams } from '../../store/slices/playerSlice.js';
import { EventBus } from '../../game/EventBus.js';
import questsData from '../../data/quests.json';
import { ZONES, ZONE_ORDER } from '../../data/zones.js';
import { COLORS, FONTS, pixelPanel, pixelBtnDark, pixelBtnGold } from '../../styles/theme.js';

const styles = {
  overlay: {
    position: 'absolute',
    inset: 0,
    background: COLORS.overlay,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  card: {
    ...pixelPanel,
    minWidth: '450px',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '10px',
    borderBottom: `4px solid ${COLORS.dark}`,
  },
  title: {
    fontFamily: FONTS.pixel,
    fontSize: '14px',
    color: COLORS.brown,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  closeBtn: {
    ...pixelBtnDark,
    padding: '6px 12px',
    fontSize: '8px',
  },
  zoneHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '16px',
    marginBottom: '8px',
    paddingBottom: '6px',
    borderBottom: `3px solid ${COLORS.lightGray}`,
  },
  zoneName: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    color: COLORS.xpGold,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  zoneNameArabic: {
    fontFamily: FONTS.arabic,
    fontSize: '14px',
    color: COLORS.xpGold,
    direction: 'rtl',
  },
  questItem: {
    padding: '12px',
    border: `4px solid ${COLORS.dark}`,
    background: COLORS.white,
    marginBottom: '10px',
  },
  questActive: {
    borderColor: COLORS.xpGold,
    background: '#fdf8e8',
  },
  questCompleted: {
    borderColor: COLORS.green,
    background: '#eafaf1',
  },
  questLocked: {
    opacity: 0.4,
    borderColor: COLORS.lightGray,
    background: COLORS.light,
  },
  questTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  questTitle: {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    color: COLORS.dark,
    fontWeight: 'bold',
  },
  questTitleActive: {
    color: COLORS.gold,
  },
  questDesc: {
    fontFamily: FONTS.pixel,
    fontSize: '8px',
    color: COLORS.brown,
    marginBottom: '8px',
    lineHeight: '1.6',
  },
  progressBarOuter: {
    height: '8px',
    background: COLORS.dark,
    border: `2px solid ${COLORS.gray}`,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: COLORS.xpGold,
    transition: 'width 0.3s',
  },
  progressFillComplete: {
    background: COLORS.green,
  },
  progressRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '6px',
  },
  progressText: {
    fontFamily: FONTS.pixel,
    fontSize: '7px',
    color: COLORS.gray,
  },
  reward: {
    fontFamily: FONTS.pixel,
    fontSize: '7px',
    color: COLORS.xpGold,
  },
  badgeActive: {
    fontFamily: FONTS.pixel,
    fontSize: '7px',
    padding: '2px 6px',
    background: COLORS.xpGold,
    color: COLORS.brown,
    border: `2px solid ${COLORS.gold}`,
    textTransform: 'uppercase',
  },
  badgeComplete: {
    fontFamily: FONTS.pixel,
    fontSize: '7px',
    padding: '2px 6px',
    background: COLORS.green,
    color: COLORS.white,
    border: `2px solid #1fa855`,
    textTransform: 'uppercase',
  },
  badgeLocked: {
    fontFamily: FONTS.pixel,
    fontSize: '7px',
    padding: '2px 6px',
    background: COLORS.gray,
    color: COLORS.lightGray,
    border: `2px solid ${COLORS.dark}`,
    textTransform: 'uppercase',
  },
  claimBtn: {
    ...pixelBtnGold,
    padding: '6px 14px',
    fontSize: '7px',
    marginTop: '8px',
  },
  claimedText: {
    fontFamily: FONTS.pixel,
    fontSize: '7px',
    color: COLORS.green,
    marginTop: '8px',
    textTransform: 'uppercase',
  },
};

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

  const handleClose = () => {
    dispatch(closeDialogue());
    EventBus.emit('unfreeze-player');
  };

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

    let itemStyle = styles.questItem;
    let titleExtra = {};
    let badge = null;

    if (status === 'completed') {
      itemStyle = { ...itemStyle, ...styles.questCompleted };
      badge = <span style={styles.badgeComplete}>Complete</span>;
    } else if (status === 'active') {
      itemStyle = { ...itemStyle, ...styles.questActive };
      titleExtra = styles.questTitleActive;
      badge = <span style={styles.badgeActive}>Active</span>;
    } else {
      itemStyle = { ...itemStyle, ...styles.questLocked };
      badge = <span style={styles.badgeLocked}>Locked</span>;
    }

    return (
      <div key={qd.id} style={itemStyle}>
        <div style={styles.questTitleRow}>
          <span style={{ ...styles.questTitle, ...titleExtra }}>{qd.title}</span>
          {badge}
        </div>
        <div style={styles.questDesc}>{qd.description}</div>
        <div style={styles.progressBarOuter}>
          <div style={{
            ...styles.progressFill,
            ...(status === 'completed' ? styles.progressFillComplete : {}),
            width: `${pct}%`,
          }} />
        </div>
        <div style={styles.progressRow}>
          <span style={styles.progressText}>{progress}/{target}</span>
          <span style={styles.reward}>
            {qd.reward.xp} XP + {qd.reward.dirhams} Dirhams
          </span>
        </div>
        {status === 'completed' && !rewardClaimed && (
          <button
            style={styles.claimBtn}
            onClick={() => handleClaim(qd.id)}
          >
            Claim Reward
          </button>
        )}
        {status === 'completed' && rewardClaimed && (
          <div style={styles.claimedText}>Reward Claimed</div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.title}>Quest Log</div>
          <button style={styles.closeBtn} onClick={handleClose}>Close</button>
        </div>

        {ZONE_ORDER.map((zoneId) => {
          const zoneQuests = questGroups[zoneId];
          if (!zoneQuests || zoneQuests.length === 0) return null;
          const zone = ZONES[zoneId];

          return (
            <div key={zoneId}>
              <div style={styles.zoneHeader}>
                <span style={styles.zoneName}>{zone?.name || zoneId}</span>
                {zone?.nameArabic && (
                  <span style={styles.zoneNameArabic}>{zone.nameArabic}</span>
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
