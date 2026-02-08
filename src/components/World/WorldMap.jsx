import { useSelector, useDispatch } from 'react-redux';
import { setScreen, showNotification } from '../../store/slices/uiSlice.js';
import { EventBus } from '../../utils/eventBus.js';
import { ZONES, ZONE_ORDER } from '../../data/zones.js';
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

    let dotClassName = styles.zoneDot;
    if (isCurrent) {
      dotClassName = `${styles.zoneDot} ${styles.zoneDotCurrent}`;
    } else if (isUnlocked) {
      dotClassName = `${styles.zoneDot} ${styles.zoneDotUnlocked}`;
    }

    return (
      <div
        key={zoneId}
        className={`${styles.zoneNode} ${!isUnlocked ? styles.zoneNodeLocked : ''}`}
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
        }}
        onClick={() => handleZoneClick(zoneId)}
      >
        <div className={dotClassName} />
        <div className={styles.zoneLabelArabic}>{zone.nameArabic}</div>
        <div className={styles.zoneLabel}>{zone.name}</div>
      </div>
    );
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className={styles.title}>World Map</span>
            <span className={styles.titleArabic}>خَريطَة العالَم</span>
          </div>
          <button className={styles.closeBtn} onClick={onBack}>Close</button>
        </div>

        <div className={styles.mapContainer}>
          <div className={styles.mapInner}>
            {ZONE_CONNECTIONS.map(renderConnection)}
            {ZONE_ORDER.map(renderZoneNode)}
          </div>
        </div>

        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: 'var(--color-cyan)' }} />
            Current Zone
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: 'var(--color-xp-gold)' }} />
            Unlocked
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: 'var(--color-gray)' }} />
            Locked
          </div>
        </div>
      </div>
    </div>
  );
}
