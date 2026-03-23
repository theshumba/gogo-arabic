import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { COLORS, FONTS, pixelBtnDark } from '../../styles/theme.js';
import { grammarCategories } from '../../data/grammar.js';
import { selectLessonsByCategory, selectGrammarProgress } from '../../store/slices/grammarSlice.js';
import GrammarLesson from './GrammarLesson.jsx';

const GRAMMAR_COUNT_KEY = 'gogo_grammar_lesson_count';

export default function GrammarModule({ onBack }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [newContentToast, setNewContentToast] = useState(null);
  const lessonsByCategory = useSelector(selectLessonsByCategory);
  const overallProgress = useSelector(selectGrammarProgress);

  // "New content added" toast for existing players
  useEffect(() => {
    const grammarLessons = Object.values(lessonsByCategory).flat();
    const currentCount = grammarLessons.length;
    const storedCount = parseInt(localStorage.getItem(GRAMMAR_COUNT_KEY) || '0', 10);

    if (storedCount > 0 && currentCount > storedCount) {
      const added = currentCount - storedCount;
      setNewContentToast(`${added} new grammar lesson${added > 1 ? 's' : ''} added!`);
      const timer = setTimeout(() => setNewContentToast(null), 4000);
      localStorage.setItem(GRAMMAR_COUNT_KEY, String(currentCount));
      return () => clearTimeout(timer);
    }

    localStorage.setItem(GRAMMAR_COUNT_KEY, String(currentCount));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // If a lesson is selected, show the lesson component
  if (selectedLessonId) {
    return (
      <GrammarLesson
        lessonId={selectedLessonId}
        onBack={() => setSelectedLessonId(null)}
      />
    );
  }

  // Filter lessons based on selected category
  const filteredLessons =
    selectedCategory === 'all'
      ? Object.values(lessonsByCategory).flat()
      : lessonsByCategory[selectedCategory] || [];

  const containerStyle = {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: COLORS.beige,
    overflowY: 'auto',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    background: COLORS.brown,
    borderBottom: `4px solid ${COLORS.darkBrown}`,
  };

  const titleStyle = {
    fontFamily: FONTS.pixel,
    fontSize: '18px',
    color: COLORS.xpGold,
    textAlign: 'center',
    flex: 1,
  };

  const bodyStyle = {
    flex: 1,
    padding: '40px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  };

  const progressBarStyle = {
    width: '100%',
    height: '30px',
    background: COLORS.white,
    border: `3px solid ${COLORS.brown}`,
    position: 'relative',
    marginBottom: '40px',
  };

  const progressFillStyle = {
    height: '100%',
    background: COLORS.xpGold,
    transition: 'width 0.3s ease',
  };

  const progressTextStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontFamily: FONTS.pixel,
    fontSize: '12px',
    color: COLORS.dark,
    fontWeight: 'bold',
  };

  const categoryTabsStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '30px',
  };

  const tabStyle = (isActive) => ({
    ...pixelBtnDark,
    background: isActive ? COLORS.xpGold : COLORS.gray,
    color: isActive ? COLORS.brown : COLORS.white,
    padding: '12px 20px',
    fontSize: '11px',
  });

  const lessonGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  };

  return (
    <motion.div
      style={containerStyle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div style={headerStyle}>
        <button onClick={onBack} style={pixelBtnDark}>
          Back
        </button>
        <div style={titleStyle}>Grammar Lessons</div>
        <div style={{ width: '80px' }} />
      </div>

      <div style={bodyStyle}>
        {/* New content toast */}
        {newContentToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: COLORS.xpGold,
              color: COLORS.brown,
              fontFamily: FONTS.pixel,
              fontSize: '12px',
              padding: '12px 24px',
              textAlign: 'center',
              marginBottom: '20px',
              border: `3px solid ${COLORS.brown}`,
            }}
          >
            {newContentToast}
          </motion.div>
        )}

        {/* Overall Progress */}
        <div style={progressBarStyle}>
          <div style={{ ...progressFillStyle, width: `${overallProgress}%` }} />
          <div style={progressTextStyle}>Overall Progress: {overallProgress}%</div>
        </div>

        {/* Category Filters */}
        <div style={categoryTabsStyle}>
          <button
            onClick={() => setSelectedCategory('all')}
            style={tabStyle(selectedCategory === 'all')}
          >
            All Lessons
          </button>
          {grammarCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              style={tabStyle(selectedCategory === category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Lesson Grid */}
        {filteredLessons.length === 0 ? (
          <div
            style={{
              fontFamily: FONTS.pixel,
              fontSize: '12px',
              color: COLORS.dark,
              textAlign: 'center',
              marginTop: '60px',
            }}
          >
            No lessons in this category yet.
          </div>
        ) : (
          <div style={lessonGridStyle}>
            {filteredLessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onClick={lesson.isUnlocked ? () => setSelectedLessonId(lesson.id) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Separate component for lesson cards with hover state
function LessonCard({ lesson, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle = {
    background: lesson.isUnlocked ? COLORS.white : '#e8e8e8',
    border: `4px solid ${lesson.isCompleted ? COLORS.green : lesson.isUnlocked ? COLORS.brown : lesson.isCefrLocked ? '#8B4513' : '#999'}`,
    padding: '20px',
    cursor: lesson.isUnlocked ? 'pointer' : 'not-allowed',
    transition: 'transform 0.1s, box-shadow 0.1s',
    position: 'relative',
    opacity: lesson.isUnlocked ? 1 : 0.5,
    transform: isHovered && lesson.isUnlocked ? 'translateY(-2px)' : 'none',
    boxShadow: isHovered && lesson.isUnlocked ? `0 4px 8px ${COLORS.darkBrown}` : 'none',
  };

  const badgeText = lesson.isCompleted
    ? 'Completed'
    : lesson.isCefrLocked
    ? `Requires Grammar Tree Level ${lesson.cefrGateLevel}`
    : lesson.isUnlocked
    ? 'New'
    : 'Locked';

  const badgeColor = lesson.isCompleted
    ? COLORS.green
    : lesson.isCefrLocked
    ? '#8B4513' // brown for skill tree gate
    : lesson.isUnlocked
    ? COLORS.gray
    : '#666';

  const statusBadgeStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    color: COLORS.white,
    background: badgeColor,
    padding: '4px 8px',
    borderRadius: '2px',
    maxWidth: '160px',
    textAlign: 'right',
  };

  const titleStyle = {
    fontFamily: FONTS.pixel,
    fontSize: '12px',
    color: COLORS.brown,
    marginBottom: '8px',
  };

  const titleArabicStyle = {
    fontFamily: FONTS.arabicDisplay,
    fontSize: '16px',
    color: COLORS.brown2,
    marginBottom: '12px',
  };

  const difficultyStyle = {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    color: COLORS.darkGold,
    marginBottom: '10px',
  };

  const categoryStyle = {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    color: COLORS.gray,
    textTransform: 'uppercase',
    marginBottom: '15px',
  };

  const scoreStyle = {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    color: COLORS.dark,
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: `2px solid ${COLORS.light}`,
  };

  return (
    <motion.div
      style={cardStyle}
      onClick={lesson.isUnlocked ? onClick : undefined}
      onMouseEnter={() => lesson.isUnlocked && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileTap={lesson.isUnlocked ? { scale: 0.98 } : undefined}
    >
      <div style={statusBadgeStyle}>{badgeText}</div>

      {lesson.isCefrLocked && (
        <div style={{ fontFamily: FONTS.pixel, fontSize: '9px', color: '#8B4513', marginTop: '28px', marginBottom: '4px' }}>
          Your level: {lesson.currentTreeLevel}
        </div>
      )}

      <div style={titleStyle}>{lesson.title}</div>
      <div style={titleArabicStyle}>{lesson.titleArabic}</div>

      <div style={difficultyStyle}>
        Difficulty: {'⭐'.repeat(lesson.difficulty)}
      </div>

      <div style={categoryStyle}>
        {grammarCategories.find((c) => c.id === lesson.category)?.name || lesson.category}
      </div>

      {lesson.score && (
        <div style={scoreStyle}>
          Best Score: {Math.round((lesson.score.exerciseScore + lesson.score.quizScore) / 2)}%
          <br />
          Attempts: {lesson.score.attempts}
        </div>
      )}
    </motion.div>
  );
}
