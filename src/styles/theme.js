/**
 * Shared pixel-art theme constants
 * Palette inspired by SimpleLuke/japanese-learning-RPG + monster-quest
 */

export const COLORS = {
  // Warm backgrounds (from SimpleLuke)
  beige: '#f5f3da',
  brown: '#391D23',
  darkBrown: '#1f0c10',
  brown2: '#2e1700',
  burgundy: '#800200',
  pastelRed: '#C1311C',
  oliveGreen: '#BAB86C',
  darkGold: '#A26B35',
  creamyBeige: '#F3EAD7',

  // Monster-quest palette
  white: '#f4fefa',
  pureWhite: '#ffffff',
  dark: '#2b292c',
  light: '#c8c8c8',
  gray: '#3a373b',
  gold: '#bfa100',
  lightGray: '#4b484d',
  black: '#000000',

  // Accent colors
  cyan: '#06c1de',
  cyanHover: '#06b6d1',
  fire: '#f8a060',
  water: '#50b0d8',
  plant: '#64a990',
  red: '#f03131',
  blue: '#66d7ee',
  green: '#2ecc71',

  // Game-specific
  xpGold: '#e2b659',
  panel: '#1e1e2e',
  panelBorder: 'rgba(255,255,255,0.15)',
  overlay: 'rgba(0,0,0,0.85)',
};

export const FONTS = {
  pixel: "'Press Start 2P', cursive",
  arabic: "'Noto Kufi Arabic', sans-serif",
  pixeloid: "'PixeloidSans', sans-serif",
};

// Reusable pixel-art button style
export const pixelBtn = {
  fontFamily: FONTS.pixel,
  fontSize: '12px',
  padding: '14px 28px',
  border: 'none',
  cursor: 'pointer',
  imageRendering: 'pixelated',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  position: 'relative',
  background: COLORS.cyan,
  color: COLORS.dark,
  boxShadow: `
    inset -4px -4px 0px 0px rgba(0,0,0,0.2),
    inset 4px 4px 0px 0px rgba(255,255,255,0.2),
    0 4px 0 0 #048a9e
  `,
  transition: 'transform 0.05s',
};

export const pixelBtnGold = {
  ...pixelBtn,
  background: COLORS.xpGold,
  color: COLORS.brown,
  boxShadow: `
    inset -4px -4px 0px 0px rgba(0,0,0,0.2),
    inset 4px 4px 0px 0px rgba(255,255,255,0.3),
    0 4px 0 0 #a0842a
  `,
};

export const pixelBtnDark = {
  ...pixelBtn,
  background: COLORS.gray,
  color: COLORS.white,
  boxShadow: `
    inset -4px -4px 0px 0px rgba(0,0,0,0.3),
    inset 4px 4px 0px 0px rgba(255,255,255,0.1),
    0 4px 0 0 #1a191b
  `,
};

// Pixel panel card
export const pixelPanel = {
  background: COLORS.beige,
  border: `4px solid ${COLORS.dark}`,
  padding: '20px',
  color: COLORS.dark,
  fontFamily: FONTS.pixel,
  fontSize: '10px',
  imageRendering: 'pixelated',
};

// Full-screen container with bg image
export const fullScreenBg = (bgUrl) => ({
  width: '100%',
  height: '100%',
  backgroundImage: `url(${bgUrl})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  imageRendering: 'pixelated',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: FONTS.pixel,
});
