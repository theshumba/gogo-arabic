/**
 * CodexMenu.jsx — Read-only codex browser
 *
 * Shows unlocked entries and overall progress (X / 308).
 * codex.js data file is not yet created — renders progress stats
 * and an "explore to unlock entries" message alongside unlocked entry IDs.
 *
 * @param {Function} [props.onBack] - Optional back navigation callback
 */
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  selectUnlockedEntries,
  selectCodexProgress,
  selectNewEntryCount,
  clearNewCount,
  markRead,
} from '../../store/slices/codexSlice.js';

const containerStyle = {
  backgroundColor: '#1a1a2e',
  backgroundImage:
    'radial-gradient(circle at 60% 30%, rgba(139, 105, 20, 0.08) 0%, transparent 50%), ' +
    'repeating-linear-gradient(60deg, rgba(212, 168, 67, 0.03) 0px, rgba(212, 168, 67, 0.03) 1px, transparent 1px, transparent 40px)',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
};

const panelStyle = {
  background: 'rgba(26, 26, 46, 0.97)',
  border: '1px solid rgba(212, 168, 67, 0.3)',
  borderRadius: 12,
  padding: '32px 28px',
  maxWidth: 680,
  width: '100%',
  maxHeight: '90vh',
  overflowY: 'auto',
};

const titleStyle = {
  color: '#D4A843',
  fontSize: 28,
  fontWeight: 700,
  letterSpacing: 2,
  textAlign: 'center',
  marginBottom: 4,
};

const subtitleStyle = {
  color: '#a08020',
  fontSize: 18,
  textAlign: 'center',
  marginBottom: 24,
  fontFamily: 'serif',
  direction: 'rtl',
};

const progressLabelStyle = {
  color: '#ccc',
  fontSize: 13,
  marginBottom: 6,
  display: 'flex',
  justifyContent: 'space-between',
};

const progressBarTrackStyle = {
  background: '#2a2a3e',
  borderRadius: 6,
  height: 10,
  marginBottom: 24,
  overflow: 'hidden',
};

const sectionHeadingStyle = {
  color: '#D4A843',
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: 1.5,
  textTransform: 'uppercase',
  marginBottom: 12,
  borderBottom: '1px solid rgba(212, 168, 67, 0.2)',
  paddingBottom: 6,
};

const entryGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
  gap: 8,
  marginBottom: 24,
};

const entryCardStyle = {
  background: 'rgba(212, 168, 67, 0.08)',
  border: '1px solid rgba(212, 168, 67, 0.25)',
  borderRadius: 6,
  padding: '8px 10px',
  color: '#D4A843',
  fontSize: 12,
  wordBreak: 'break-all',
  cursor: 'default',
};

const lockedCardStyle = {
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 6,
  padding: '8px 10px',
  color: '#444',
  fontSize: 12,
};

const emptyMsgStyle = {
  color: '#888',
  fontSize: 14,
  lineHeight: 1.6,
  textAlign: 'center',
  padding: '20px 0',
};

const backBtnStyle = {
  background: 'transparent',
  border: '1px solid #D4A843',
  color: '#D4A843',
  borderRadius: 6,
  padding: '10px 28px',
  fontSize: 14,
  cursor: 'pointer',
  display: 'block',
  margin: '0 auto',
  letterSpacing: 1,
};

const TOTAL_ENTRIES = 308;

export default function CodexMenu({ onBack }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const unlockedEntries = useSelector(selectUnlockedEntries);
  const progress = useSelector(selectCodexProgress);
  const newCount = useSelector(selectNewEntryCount);

  // Clear "new" badge count when player views the codex
  if (newCount > 0) {
    dispatch(clearNewCount());
  }

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const progressFillStyle = {
    background: '#E63946',
    borderRadius: 6,
    height: '100%',
    width: `${progress.percentage}%`,
    transition: 'width 0.4s ease',
  };

  return (
    <div style={containerStyle}>
      <div style={panelStyle}>
        {/* Header */}
        <div style={titleStyle}>Codex</div>
        <div style={subtitleStyle}>الموسوعة</div>

        {/* Progress bar */}
        <div style={progressLabelStyle}>
          <span>Entries Unlocked</span>
          <span>
            {progress.unlocked} / {TOTAL_ENTRIES} ({progress.percentage}%)
          </span>
        </div>
        <div style={progressBarTrackStyle}>
          <div style={progressFillStyle} />
        </div>

        {/* Entries section */}
        {unlockedEntries.length === 0 ? (
          <div style={emptyMsgStyle}>
            No entries yet — discover lore by talking to NPCs and exploring the world.
            <br />
            <span style={{ color: '#555', fontSize: 12 }}>
              Cultural notes from dialogue will unlock entries here.
            </span>
          </div>
        ) : (
          <>
            <div style={sectionHeadingStyle}>Unlocked Entries</div>
            <div style={entryGridStyle}>
              {unlockedEntries.map((entryId) => (
                <div
                  key={entryId}
                  style={entryCardStyle}
                  onClick={() => dispatch(markRead(entryId))}
                  title={entryId}
                >
                  {entryId.replace(/_/g, ' ')}
                </div>
              ))}
            </div>

            {/* Locked slots preview */}
            {unlockedEntries.length < TOTAL_ENTRIES && (
              <>
                <div style={sectionHeadingStyle}>
                  Locked ({TOTAL_ENTRIES - unlockedEntries.length} remaining)
                </div>
                <div style={entryGridStyle}>
                  {Array.from({
                    length: Math.min(20, TOTAL_ENTRIES - unlockedEntries.length),
                  }).map((_, i) => (
                    <div key={`locked_${i}`} style={lockedCardStyle}>
                      ???
                    </div>
                  ))}
                  {TOTAL_ENTRIES - unlockedEntries.length > 20 && (
                    <div style={{ ...lockedCardStyle, color: '#555' }}>
                      +{TOTAL_ENTRIES - unlockedEntries.length - 20} more...
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* Back button */}
        <button style={backBtnStyle} onClick={handleBack} aria-label="Back">
          Back
        </button>
      </div>
    </div>
  );
}
