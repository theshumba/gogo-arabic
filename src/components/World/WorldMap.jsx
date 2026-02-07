import { useSelector, useDispatch } from 'react-redux';
import { setScreen, showNotification } from '../../store/slices/uiSlice.js';
import { EventBus } from '../../utils/eventBus.js';
import { ZONES, ZONE_ORDER } from '../../data/zones.js';
import { COLORS, FONTS, pixelPanel, pixelBtnGold, pixelBtnDark } from '../../styles/theme.js';

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
    width: '90%',
    maxWidth: '700px',
    maxHeight: '85vh',
    padding: '20px',
    position: 'relative',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: `4px solid ${COLORS.dark}`,
  },
  title: {
    fontFamily: FONTS.pixel,
    fontSize: '14px',
    color: COLORS.brown,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  titleArabic: {
    fontFamily: FONTS.arabic,
    fontSize: '20px',
    color: COLORS.brown,
    marginLeft: '12px',
    direction: 'rtl',
  },
  closeBtn: {
    ...pixelBtnDark,
    padding: '6px 12px',
    fontSize: '8px',
  },
  mapContainer: {
    position: 'relative',
    width: '100%',
    paddingBottom: '60%',
    background: 'linear-gradient(180deg, #1a3a5c 0%, #2d5a3d 30%, #c9a84c 65%, #e8d5a0 100%)',
    border: `4px solid ${COLORS.dark}`,
    overflow: 'hidden',
  },
  mapInner: {
    position: 'absolute',
    inset: 0,
  },
  connectionLine: {
    position: 'absolute',
    background: COLORS.xpGold,
    transformOrigin: '0 50%',
    height: '3px',
    opacity: 0.4,
    zIndex: 1,
  },
  connectionLineUnlocked: {
    opacity: 0.9,
    background: COLORS.xpGold,
    boxShadow: `0 0 4px ${COLORS.xpGold}`,
  },
  zoneNode: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    cursor: 'pointer',
    zIndex: 2,
    textAlign: 'center',
    transition: 'transform 0.1s',
  },
  zoneNodeLocked: {
    cursor: 'not-allowed',
    opacity: 0.4,
  },
  zoneDot: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: `4px solid ${COLORS.dark}`,
    background: COLORS.gray,
    margin: '0 auto 4px',
    boxShadow: `
      inset -2px -2px 0px 0px rgba(0,0,0,0.3),
      inset 2px 2px 0px 0px rgba(255,255,255,0.1)
    `,
  },
  zoneDotUnlocked: {
    background: COLORS.xpGold,
    boxShadow: `
      inset -2px -2px 0px 0px rgba(0,0,0,0.2),
      inset 2px 2px 0px 0px rgba(255,255,255,0.3),
      0 0 8px ${COLORS.xpGold}
    `,
  },
  zoneDotCurrent: {
    background: COLORS.cyan,
    boxShadow: `
      inset -2px -2px 0px 0px rgba(0,0,0,0.2),
      inset 2px 2px 0px 0px rgba(255,255,255,0.3),
      0 0 12px ${COLORS.cyan}
    `,
  },
  zoneLabel: {
    fontFamily: FONTS.pixel,
    fontSize: '6px',
    color: COLORS.white,
    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
    whiteSpace: 'nowrap',
    lineHeight: 1.4,
  },
  zoneLabelArabic: {
    fontFamily: FONTS.arabic,
    fontSize: '10px',
    color: COLORS.xpGold,
    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
    direction: 'rtl',
  },
  legend: {
    display: 'flex',
    gap: '16px',
    marginTop: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: FONTS.pixel,
    fontSize: '7px',
    color: COLORS.brown,
  },
  legendDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: `2px solid ${COLORS.dark}`,
  },
};

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
        style={{
          ...styles.connectionLine,
          ...(bothUnlocked ? styles.connectionLineUnlocked : {}),
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

    let dotStyle = styles.zoneDot;
    if (isCurrent) {
      dotStyle = { ...dotStyle, ...styles.zoneDotCurrent };
    } else if (isUnlocked) {
      dotStyle = { ...dotStyle, ...styles.zoneDotUnlocked };
    }

    return (
      <div
        key={zoneId}
        style={{
          ...styles.zoneNode,
          ...(!isUnlocked ? styles.zoneNodeLocked : {}),
          left: `${pos.x}%`,
          top: `${pos.y}%`,
        }}
        onClick={() => handleZoneClick(zoneId)}
        onMouseDown={(e) => {
          if (isUnlocked) e.currentTarget.style.transform = 'translate(-50%, -50%) scale(0.95)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'translate(-50%, -50%)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translate(-50%, -50%)';
        }}
      >
        <div style={dotStyle} />
        <div style={styles.zoneLabelArabic}>{zone.nameArabic}</div>
        <div style={styles.zoneLabel}>{zone.name}</div>
      </div>
    );
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={styles.title}>World Map</span>
            <span style={styles.titleArabic}>خَريطَة العالَم</span>
          </div>
          <button style={styles.closeBtn} onClick={onBack}>Close</button>
        </div>

        <div style={styles.mapContainer}>
          <div style={styles.mapInner}>
            {ZONE_CONNECTIONS.map(renderConnection)}
            {ZONE_ORDER.map(renderZoneNode)}
          </div>
        </div>

        <div style={styles.legend}>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendDot, background: COLORS.cyan }} />
            Current Zone
          </div>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendDot, background: COLORS.xpGold }} />
            Unlocked
          </div>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendDot, background: COLORS.gray }} />
            Locked
          </div>
        </div>
      </div>
    </div>
  );
}
