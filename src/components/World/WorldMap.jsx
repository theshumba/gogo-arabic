import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { showNotification } from '../../store/slices/uiSlice.js';
import { EventBus } from '../../utils/eventBus.js';
import { ZONES, ZONE_ORDER } from '../../data/zones.js';
import quests from '../../data/quests.json';
import styles from './WorldMap.module.css';

const ZONE_POSITIONS = {
  oasis_village:      { x: 50, y: 75 },
  ancient_library:    { x: 50, y: 58 },
  desert_marketplace: { x: 72, y: 52 },
  farmland:           { x: 72, y: 35 },
  bedouin_camp:       { x: 88, y: 28 },
  mountain_village:   { x: 70, y: 15 },
  coastal_port:       { x: 45, y: 18 },
  royal_palace:       { x: 30, y: 5 },
};

const ZONE_CONNECTIONS = [
  ['oasis_village', 'ancient_library'],
  ['ancient_library', 'desert_marketplace'],
  ['desert_marketplace', 'farmland'],
  ['farmland', 'bedouin_camp'],
  ['bedouin_camp', 'mountain_village'],
  ['mountain_village', 'coastal_port'],
  ['coastal_port', 'royal_palace'],
];

export default function WorldMap({ onBack }) {
  const dispatch = useDispatch();
  const unlockedZones = useSelector((s) => s.player.unlockedZones);
  const currentZone = useSelector((s) => s.player.currentZone);
  const completedQuests = useSelector((s) => s.quests.quests);
  const [hoveredZone, setHoveredZone] = useState(null);

  // Calculate zone statistics
  const getZoneStats = (zoneId) => {
    const zoneQuests = quests.filter((q) => q.zone === zoneId);
    const completed = zoneQuests.filter((q) => completedQuests[q.id]?.status === 'completed').length;
    const total = zoneQuests.length;
    const completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Determine difficulty based on unlock requirements
    const zone = ZONES[zoneId];
    let difficulty = 'Beginner';
    if (zone.unlock) {
      if (zone.unlock.minLevel >= 15) difficulty = 'Advanced';
      else if (zone.unlock.minLevel >= 8) difficulty = 'Intermediate';
    }

    return {
      questsCompleted: completed,
      questsTotal: total,
      completionPercent,
      difficulty,
    };
  };

  const handleZoneClick = (zoneId) => {
    if (!unlockedZones.includes(zoneId)) {
      dispatch(showNotification({ message: 'Zone locked!', type: 'quest' }));
      return;
    }
    if (zoneId === currentZone) {
      onBack();
      return;
    }
    // Fast travel
    EventBus.emit('fast-travel', { zoneName: zoneId });
    onBack();
  };

  const renderConnection = ([fromId, toId], idx) => {
    const from = ZONE_POSITIONS[fromId];
    const to = ZONE_POSITIONS[toId];
    if (!from || !to) return null;

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    const bothUnlocked = unlockedZones.includes(fromId) && unlockedZones.includes(toId);

    return (
      <div
        key={`conn-${idx}`}
        className={`${styles.connectionLine} ${bothUnlocked ? styles.connectionLineUnlocked : ''}`}
        style={{
          left: `${from.x}%`,
          top: `${from.y}%`,
          width: `${length}%`,
          transform: `rotate(${angle}deg)`,
        }}
      />
    );
  };

  const renderZoneNode = (zoneId) => {
    const zone = ZONES[zoneId];
    const pos = ZONE_POSITIONS[zoneId];
    if (!zone || !pos) return null;

    const isUnlocked = unlockedZones.includes(zoneId);
    const isCurrent = currentZone === zoneId;
    const isHovered = hoveredZone === zoneId;
    const stats = getZoneStats(zoneId);

    let dotClassName = styles.zoneDot;
    let statusIndicator = null;

    if (isCurrent) {
      dotClassName = `${styles.zoneDot} ${styles.zoneDotCurrent}`;
      statusIndicator = <div className={styles.currentIndicator}>Current</div>;
    } else if (isUnlocked) {
      if (stats.completionPercent === 100) {
        dotClassName = `${styles.zoneDot} ${styles.zoneDotCompleted}`;
        statusIndicator = <div className={styles.completedIndicator}>✓</div>;
      } else {
        dotClassName = `${styles.zoneDot} ${styles.zoneDotUnlocked}`;
      }
    }

    const ariaLabel = isUnlocked
      ? `${zone.name}. ${isCurrent ? 'Current zone.' : ''} ${stats.questsCompleted} of ${stats.questsTotal} quests completed. ${stats.completionPercent}% complete. ${stats.difficulty} difficulty. ${isCurrent ? 'Press Enter to close map' : 'Press Enter to fast travel'}.`
      : `${zone.name}. Locked zone.`;

    return (
      <button
        key={zoneId}
        className={`${styles.zoneNode} ${!isUnlocked ? styles.zoneNodeLocked : ''} ${isHovered ? styles.zoneNodeHovered : ''}`}
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
        }}
        onClick={() => handleZoneClick(zoneId)}
        onMouseEnter={() => setHoveredZone(zoneId)}
        onMouseLeave={() => setHoveredZone(null)}
        aria-label={ariaLabel}
        aria-disabled={!isUnlocked}
      >
        <div className={dotClassName} aria-hidden="true">
          {statusIndicator}
        </div>
        <div className={styles.zoneLabelArabic} lang="ar" aria-hidden="true">{zone.nameArabic}</div>
        <div className={styles.zoneLabel} aria-hidden="true">{zone.name}</div>

        {/* Zone Info Tooltip */}
        {isHovered && isUnlocked && (
          <div className={styles.zoneTooltip}>
            <div className={styles.tooltipHeader}>
              <span className={styles.tooltipTitle}>{zone.name}</span>
              <span className={styles.tooltipTitleArabic}>{zone.nameArabic}</span>
            </div>
            <div className={styles.tooltipBody}>
              <div className={styles.tooltipRow}>
                <span className={styles.tooltipLabel}>Quests:</span>
                <span className={styles.tooltipValue}>{stats.questsCompleted}/{stats.questsTotal}</span>
              </div>
              <div className={styles.tooltipRow}>
                <span className={styles.tooltipLabel}>Progress:</span>
                <span className={styles.tooltipValue}>{stats.completionPercent}%</span>
              </div>
              <div className={styles.tooltipRow}>
                <span className={styles.tooltipLabel}>Difficulty:</span>
                <span className={`${styles.tooltipValue} ${styles[`difficulty${stats.difficulty}`]}`}>
                  {stats.difficulty}
                </span>
              </div>
            </div>
            <div className={styles.tooltipProgress}>
              <div
                className={styles.tooltipProgressFill}
                style={{ width: `${stats.completionPercent}%` }}
              />
            </div>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className={styles.overlay} role="dialog" aria-label="World Map">
      <div className={styles.card}>
        <div className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h1 className={styles.title}>World Map</h1>
            <span className={styles.titleArabic} lang="ar" aria-hidden="true">خَريطَة العالَم</span>
          </div>
          <button className={styles.closeBtn} onClick={onBack} aria-label="Close world map">Close</button>
        </div>

        <div className={styles.mapContainer} role="region" aria-label="Interactive world map with zone locations">
          <div className={styles.mapInner}>
            {ZONE_CONNECTIONS.map(renderConnection)}
            {ZONE_ORDER.map(renderZoneNode)}
          </div>
        </div>

        <div className={styles.legend} role="group" aria-label="Map legend">
          <div className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: 'var(--color-cyan)' }} aria-hidden="true" />
            <span>Current Zone</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: 'var(--color-green)' }} aria-hidden="true" />
            <span>Completed</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: 'var(--color-xp-gold)' }} aria-hidden="true" />
            <span>Unlocked</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: 'var(--color-gray)' }} aria-hidden="true" />
            <span>Locked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
