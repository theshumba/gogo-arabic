import { COLORS, FONTS, pixelBtnGold, pixelBtnDark } from '../../styles/theme.js';
import { useGameNavigation } from '../../hooks/useGameNavigation.js';

/**
 * MiniGamesHub Component
 *
 * Central hub for all mini-games and learning activities.
 * Displays available games with descriptions and navigation.
 */
export default function MiniGamesHub() {
  const { goTo, goToMenu } = useGameNavigation();

  const games = [
    {
      id: 'word-search',
      title: 'Word Search',
      titleArabic: 'البحث عن الكلمات',
      description: 'Find hidden Arabic words in a grid puzzle. Words can be horizontal or vertical.',
      path: '/mini-games/word-search',
      difficulty: 'Easy - Hard',
      icon: '🔍',
    },
    {
      id: 'reading',
      title: 'Reading Comprehension',
      titleArabic: 'فهم القراءة',
      description: 'Read Arabic passages and answer comprehension questions. Practice reading skills with real texts.',
      path: '/mini-games/reading',
      difficulty: 'Level 1-4',
      icon: '📖',
    },
    {
      id: 'roots',
      title: 'Root Explorer',
      titleArabic: 'مستكشف الجذور',
      description: 'Explore the Arabic root system. See how 3-letter roots form related words.',
      path: '/roots',
      difficulty: 'Educational',
      icon: '🌳',
    },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Mini-Games Hub</h1>
        <h2 style={styles.titleArabic}>مركز الألعاب الصغيرة</h2>
        <p style={styles.subtitle}>
          Fun and interactive ways to practice your Arabic skills
        </p>
      </div>

      {/* Games Grid */}
      <div style={styles.gamesGrid}>
        {games.map((game) => (
          <div key={game.id} style={styles.gameCard}>
            <div style={styles.gameIcon}>{game.icon}</div>
            <h3 style={styles.gameTitle}>{game.title}</h3>
            <h4 style={styles.gameTitleArabic}>{game.titleArabic}</h4>
            <p style={styles.gameDescription}>{game.description}</p>
            <div style={styles.gameDifficulty}>
              Difficulty: {game.difficulty}
            </div>
            <button
              onClick={() => goTo(game.path)}
              style={{
                ...pixelBtnGold,
                marginTop: 'auto',
                width: '100%',
              }}
            >
              Play Now
            </button>
          </div>
        ))}
      </div>

      {/* Coming Soon */}
      <div style={styles.comingSoon}>
        <h3 style={styles.comingSoonTitle}>Coming Soon</h3>
        <div style={styles.comingSoonGrid}>
          <div style={styles.comingSoonItem}>
            <span style={styles.comingSoonIcon}>⚔️</span>
            <span style={styles.comingSoonText}>Word Duel Battle</span>
          </div>
          <div style={styles.comingSoonItem}>
            <span style={styles.comingSoonIcon}>🎯</span>
            <span style={styles.comingSoonText}>Speed Quiz Challenge</span>
          </div>
          <div style={styles.comingSoonItem}>
            <span style={styles.comingSoonIcon}>🧩</span>
            <span style={styles.comingSoonText}>Sentence Scramble</span>
          </div>
          <div style={styles.comingSoonItem}>
            <span style={styles.comingSoonIcon}>🎲</span>
            <span style={styles.comingSoonText}>Grammar Quest</span>
          </div>
        </div>
      </div>

      {/* Back button */}
      <button onClick={goToMenu} style={{ ...pixelBtnDark, marginTop: '30px' }}>
        Back to Main Menu
      </button>
    </div>
  );
}

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    background: COLORS.beige,
    overflow: 'auto',
    padding: '20px',
    boxSizing: 'border-box',
    fontFamily: FONTS.pixel,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontFamily: FONTS.pixel,
    fontSize: '24px',
    color: COLORS.brown,
    margin: '0 0 10px 0',
  },
  titleArabic: {
    fontFamily: FONTS.arabicDisplay,
    fontSize: '32px',
    color: COLORS.darkGold,
    margin: '0 0 16px 0',
    direction: 'rtl',
  },
  subtitle: {
    fontSize: '11px',
    color: COLORS.brown,
    maxWidth: '600px',
    margin: '0 auto',
  },
  gamesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    maxWidth: '1200px',
    width: '100%',
    marginBottom: '40px',
  },
  gameCard: {
    background: COLORS.white,
    border: `4px solid ${COLORS.brown}`,
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'transform 0.2s',
    cursor: 'pointer',
    ':hover': {
      transform: 'translateY(-4px)',
    },
  },
  gameIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  gameTitle: {
    fontSize: '16px',
    color: COLORS.brown,
    margin: '0 0 8px 0',
    textAlign: 'center',
  },
  gameTitleArabic: {
    fontFamily: FONTS.arabicDisplay,
    fontSize: '20px',
    color: COLORS.darkGold,
    margin: '0 0 16px 0',
    direction: 'rtl',
    textAlign: 'center',
  },
  gameDescription: {
    fontSize: '10px',
    color: COLORS.brown,
    textAlign: 'center',
    lineHeight: '1.6',
    marginBottom: '16px',
    flexGrow: 1,
  },
  gameDifficulty: {
    fontSize: '9px',
    color: COLORS.darkGold,
    background: COLORS.beige,
    padding: '6px 12px',
    border: `2px solid ${COLORS.brown}`,
    marginBottom: '16px',
  },
  comingSoon: {
    background: COLORS.creamyBeige,
    border: `3px dashed ${COLORS.brown}`,
    padding: '24px',
    maxWidth: '800px',
    width: '100%',
    textAlign: 'center',
  },
  comingSoonTitle: {
    fontSize: '14px',
    color: COLORS.brown,
    marginBottom: '16px',
  },
  comingSoonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
  },
  comingSoonItem: {
    background: COLORS.white,
    border: `2px solid ${COLORS.brown}`,
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    opacity: 0.7,
  },
  comingSoonIcon: {
    fontSize: '20px',
  },
  comingSoonText: {
    fontSize: '9px',
    color: COLORS.brown,
  },
};
