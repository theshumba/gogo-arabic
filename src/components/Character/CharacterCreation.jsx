import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  setName as setPlayerName,
  setSkinTone as setPlayerSkinTone,
  setOutfit as setPlayerOutfit,
  setHeadCovering as setPlayerHeadCovering,
} from '../../store/slices/playerSlice.js';
import { COLORS, FONTS, pixelBtnGold, pixelPanel, fullScreenBg } from '../../styles/theme.js';

// ---- Data ----
const SKIN_TONES = [
  { id: 0, label: 'Light', color: '#F5D0A9' },
  { id: 1, label: 'Medium', color: '#D4A76A' },
  { id: 2, label: 'Tan', color: '#A67B4B' },
  { id: 3, label: 'Dark', color: '#6B4226' },
];

const HEAD_COVERINGS = [
  { id: 'kufi', label: 'Kufi' },
  { id: 'ghutra', label: 'Ghutra' },
  { id: 'turban', label: 'Turban' },
  { id: 'hijab', label: 'Hijab' },
  { id: 'hood', label: 'Hood' },
  { id: 'none', label: 'None' },
];

const STARTING_OUTFITS = [
  { id: 'simple-thobe', label: 'Thobe', labelAr: 'ثوب', desc: 'White' },
  { id: 'simple-abaya', label: 'Abaya', labelAr: 'عباءة', desc: 'Black' },
  { id: 'travellers-cloak', label: 'Cloak', labelAr: 'عباءة', desc: 'Brown' },
];

// Skin tone tint CSS filters (approximate visual match)
const SKIN_TINT_FILTERS = [
  'brightness(1.2) saturate(0.8)',        // light
  'none',                                  // medium (default)
  'brightness(0.85) saturate(1.1)',        // tan
  'brightness(0.6) saturate(1.2)',         // dark
];

// ---- Styles ----
const styles = {
  container: {
    ...fullScreenBg('/img/char-bg.gif'),
    overflow: 'auto',
  },
  panel: {
    ...pixelPanel,
    padding: '24px 32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '500px',
    width: '92%',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  title: {
    fontFamily: FONTS.pixel,
    fontSize: '12px',
    color: COLORS.brown,
    marginBottom: '4px',
    textAlign: 'center',
  },
  titleAr: {
    fontFamily: "'Amiri', serif",
    fontSize: '22px',
    color: COLORS.brown,
    direction: 'rtl',
    marginBottom: '20px',
  },
  // Character preview
  preview: {
    width: '192px',
    height: '192px',
    position: 'relative',
    marginBottom: '16px',
    imageRendering: 'pixelated',
    border: `3px solid ${COLORS.dark}`,
    background: 'rgba(0,0,0,0.15)',
    overflow: 'hidden',
  },
  previewImg: {
    position: 'absolute',
    width: '192px',
    height: '192px',
    imageRendering: 'pixelated',
    top: 0,
    left: 0,
  },
  // Fields
  field: {
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
  },
  label: {
    fontFamily: FONTS.pixel,
    fontSize: '7px',
    color: COLORS.gray,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  input: {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    padding: '10px 14px',
    border: `3px solid ${COLORS.dark}`,
    background: COLORS.dark,
    color: COLORS.beige,
    textAlign: 'center',
    outline: 'none',
    width: '220px',
  },
  // Horizontal option row
  options: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  // Skin tone swatch
  swatch: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '3px solid transparent',
    cursor: 'pointer',
    transition: 'border-color 0.1s',
  },
  swatchSelected: {
    borderColor: COLORS.xpGold,
    boxShadow: `0 0 0 2px ${COLORS.dark}`,
  },
  // Text option button
  option: {
    fontFamily: FONTS.pixel,
    fontSize: '7px',
    padding: '8px 12px',
    border: `3px solid ${COLORS.dark}`,
    background: COLORS.creamyBeige,
    color: COLORS.dark,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    boxShadow: `
      inset -2px -2px 0px 0px rgba(0,0,0,0.1),
      inset 2px 2px 0px 0px rgba(255,255,255,0.3),
      0 2px 0 0 ${COLORS.brown}
    `,
  },
  optionSelected: {
    background: COLORS.xpGold,
    color: COLORS.brown,
    boxShadow: `
      inset -2px -2px 0px 0px rgba(0,0,0,0.2),
      inset 2px 2px 0px 0px rgba(255,255,255,0.3),
      0 2px 0 0 #a0842a
    `,
  },
  btn: {
    ...pixelBtnGold,
    marginTop: '16px',
    fontSize: '9px',
    padding: '14px 28px',
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};

/**
 * Draws a character preview on a canvas using the body + head sprites.
 */
function CharacterPreview({ outfit, headCovering, skinTone }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Clear
    ctx.clearRect(0, 0, 192, 192);

    // Load body sprite and draw the first frame (128x128 → scaled to 192x192)
    const bodyImg = new Image();
    bodyImg.crossOrigin = 'anonymous';
    bodyImg.src = `/assets/sprites/player/bodies/${outfit}.png`;
    bodyImg.onload = () => {
      // Draw first frame (top-left 128x128 cell) scaled to 192
      ctx.clearRect(0, 0, 192, 192);

      // Apply skin tone tint via globalCompositeOperation
      ctx.drawImage(bodyImg, 0, 0, 128, 128, 0, 0, 192, 192);

      // Apply tint overlay for skin tone
      if (skinTone !== 1) {
        ctx.globalCompositeOperation = 'multiply';
        const tintColors = ['#FFF5E8', '#FFFFFF', '#E8D0B0', '#C0A080'];
        ctx.fillStyle = tintColors[skinTone] || '#FFFFFF';
        ctx.fillRect(0, 0, 192, 192);
        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(bodyImg, 0, 0, 128, 128, 0, 0, 192, 192);
        ctx.globalCompositeOperation = 'source-over';
      }

      // Load and draw head covering on top
      const headImg = new Image();
      headImg.crossOrigin = 'anonymous';
      headImg.src = `/assets/sprites/player/heads/${headCovering}.png`;
      headImg.onload = () => {
        ctx.drawImage(headImg, 0, 0, 128, 128, 0, 0, 192, 192);

        // Tint head too
        if (skinTone !== 1) {
          ctx.globalCompositeOperation = 'multiply';
          const tintColors = ['#FFF5E8', '#FFFFFF', '#E8D0B0', '#C0A080'];
          ctx.fillStyle = tintColors[skinTone] || '#FFFFFF';
          ctx.fillRect(0, 0, 192, 192);
          ctx.globalCompositeOperation = 'destination-in';
          ctx.drawImage(headImg, 0, 0, 128, 128, 0, 0, 192, 192);
          ctx.globalCompositeOperation = 'source-over';
        }
      };
    };
  }, [outfit, headCovering, skinTone]);

  return (
    <canvas
      ref={canvasRef}
      width={192}
      height={192}
      style={{ imageRendering: 'pixelated', width: '192px', height: '192px' }}
    />
  );
}

export default function CharacterCreation({ onDone }) {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [skinTone, setSkinTone] = useState(1); // medium
  const [headCovering, setHeadCovering] = useState('kufi');
  const [outfit, setOutfit] = useState('simple-thobe');

  const handleStart = () => {
    if (!name.trim()) return;
    dispatch(setPlayerName(name.trim()));
    dispatch(setPlayerSkinTone(skinTone));
    dispatch(setPlayerOutfit(outfit));
    dispatch(setPlayerHeadCovering(headCovering));
    onDone();
  };

  return (
    <div style={styles.container}>
      <div style={styles.panel}>
        <div style={styles.title}>Create Your Character</div>
        <div style={styles.titleAr}>أنشئ شخصيتك</div>

        {/* Live character preview */}
        <div style={styles.preview}>
          <CharacterPreview
            outfit={outfit}
            headCovering={headCovering}
            skinTone={skinTone}
          />
        </div>

        {/* Name input */}
        <div style={styles.field}>
          <span style={styles.label}>Your Name / اسمك</span>
          <input
            style={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
            maxLength={20}
          />
        </div>

        {/* Skin tone selector */}
        <div style={styles.field}>
          <span style={styles.label}>Skin Tone / لون البشرة</span>
          <div style={styles.options}>
            {SKIN_TONES.map((tone) => (
              <button
                key={tone.id}
                style={{
                  ...styles.swatch,
                  backgroundColor: tone.color,
                  ...(skinTone === tone.id ? styles.swatchSelected : {}),
                }}
                onClick={() => setSkinTone(tone.id)}
                title={tone.label}
              />
            ))}
          </div>
        </div>

        {/* Head covering selector */}
        <div style={styles.field}>
          <span style={styles.label}>Head Covering / غطاء الرأس</span>
          <div style={styles.options}>
            {HEAD_COVERINGS.map((hc) => (
              <button
                key={hc.id}
                style={{
                  ...styles.option,
                  ...(headCovering === hc.id ? styles.optionSelected : {}),
                }}
                onClick={() => setHeadCovering(hc.id)}
              >
                {hc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Starting outfit selector */}
        <div style={styles.field}>
          <span style={styles.label}>Starting Outfit / الزي</span>
          <div style={styles.options}>
            {STARTING_OUTFITS.map((o) => (
              <button
                key={o.id}
                style={{
                  ...styles.option,
                  ...(outfit === o.id ? styles.optionSelected : {}),
                }}
                onClick={() => setOutfit(o.id)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <button
          style={{ ...styles.btn, ...(!name.trim() ? styles.btnDisabled : {}) }}
          onClick={handleStart}
          disabled={!name.trim()}
        >
          Begin Journey / ابدأ الرحلة
        </button>
      </div>
    </div>
  );
}
