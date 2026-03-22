import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  containerStyle, headerStyle, titleStyle, bodyStyle, textStyle, btnStyle,
  choiceStyle, choiceCorrectStyle, choiceWrongStyle, getFeedbackStyle,
  pixelBtnDark, FONTS, COLORS,
} from '../grammarStyles.js';

export default function ExerciseStage({
  lesson, currentIndex, score, answers, matchedPairs, selectedMatchIndex,
  showFeedback, feedbackMessage, formatArabic,
  onAnswerSelect, onMatchSelect, onNext, onQuit,
}) {
  const exercise = lesson.exercises[currentIndex];

  // Internal state for multi-step exercise types
  const [multiSelected, setMultiSelected] = useState([]);
  const [clozeIndex, setClozeIndex] = useState(0);
  const [classifyIndex, setClassifyIndex] = useState(0);

  return (
    <motion.div
      style={containerStyle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div style={headerStyle}>
        <button onClick={onQuit} style={pixelBtnDark}>Quit</button>
        <div style={titleStyle}>
          Exercise {currentIndex + 1} / {lesson.exercises.length}
        </div>
        <div style={{ fontFamily: FONTS.pixel, fontSize: '12px', color: COLORS.xpGold }}>
          Score: {score}/{lesson.exercises.length}
        </div>
      </div>

      <div style={bodyStyle}>
        {exercise.type === 'fill-blank' && (
          <>
            <div style={{ ...textStyle, fontSize: '14px', textAlign: 'center', marginBottom: '30px' }}>
              {exercise.prompt}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {exercise.options.map((option, idx) => {
                let style = choiceStyle;
                if (showFeedback) {
                  if (option === exercise.answer) style = choiceCorrectStyle;
                  else if (option === answers[currentIndex]) style = choiceWrongStyle;
                }
                return (
                  <button key={idx} onClick={() => onAnswerSelect(option)} style={style} disabled={showFeedback}>
                    {idx + 1}. {option}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {exercise.type === 'translate' && (
          <>
            <div style={{ ...textStyle, fontSize: '14px', textAlign: 'center', marginBottom: '30px' }}>
              Translate: {exercise.prompt}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {exercise.options.map((option, idx) => {
                let style = choiceStyle;
                if (showFeedback) {
                  if (option === exercise.answer) style = choiceCorrectStyle;
                  else if (option === answers[currentIndex]) style = choiceWrongStyle;
                }
                return (
                  <button
                    key={idx}
                    onClick={() => onAnswerSelect(option)}
                    style={{ ...style, fontFamily: FONTS.arabicDisplay, fontSize: '16px' }}
                    disabled={showFeedback}
                  >
                    {idx + 1}. {formatArabic(option)}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {exercise.type === 'match' && (
          <>
            <div style={{ ...textStyle, fontSize: '14px', textAlign: 'center', marginBottom: '30px' }}>
              {exercise.prompt}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
              {exercise.pairs.flatMap((pair, idx) => [
                <button
                  key={`${idx}-0`}
                  onClick={() => onMatchSelect(idx * 2, pair[0])}
                  style={{
                    ...choiceStyle,
                    fontFamily: FONTS.arabicDisplay,
                    fontSize: '16px',
                    background: matchedPairs[idx * 2]
                      ? COLORS.green
                      : selectedMatchIndex === idx * 2
                      ? COLORS.cyan
                      : COLORS.gray,
                    color: COLORS.white,
                  }}
                  disabled={matchedPairs[idx * 2]}
                >
                  {formatArabic(pair[0])}
                </button>,
                <button
                  key={`${idx}-1`}
                  onClick={() => onMatchSelect(idx * 2 + 1, pair[1])}
                  style={{
                    ...choiceStyle,
                    background: matchedPairs[idx * 2 + 1]
                      ? COLORS.green
                      : selectedMatchIndex === idx * 2 + 1
                      ? COLORS.cyan
                      : COLORS.gray,
                    color: COLORS.white,
                  }}
                  disabled={matchedPairs[idx * 2 + 1]}
                >
                  {pair[1]}
                </button>,
              ])}
            </div>
          </>
        )}

        {/* ── conjugation-drill ─────────────────────────────────────────── */}
        {exercise.type === 'conjugation-drill' && (
          <>
            <div style={{ ...textStyle, fontSize: '14px', textAlign: 'center', marginBottom: '10px' }}>
              Conjugate: <span style={{ fontFamily: FONTS.arabicDisplay, fontSize: '20px' }}>{formatArabic(exercise.verb)}</span>
              {exercise.root && (
                <span style={{ color: COLORS.brown, marginLeft: '8px' }}>
                  (root: {formatArabic(exercise.root)})
                </span>
              )}
            </div>
            <div style={{ ...textStyle, textAlign: 'center', marginBottom: '20px' }}>
              Pronoun: <strong>{formatArabic(exercise.pronoun)}</strong> &mdash; Paradigm: {exercise.paradigm}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {exercise.options.map((option, idx) => {
                let style = choiceStyle;
                if (showFeedback) {
                  if (option === exercise.answer) style = choiceCorrectStyle;
                  else if (option === answers[currentIndex]) style = choiceWrongStyle;
                }
                return (
                  <button key={idx} onClick={() => onAnswerSelect(option)} style={{ ...style, fontFamily: FONTS.arabicDisplay, fontSize: '18px' }} disabled={showFeedback}>
                    {idx + 1}. {formatArabic(option)}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ── sentence-transformation ───────────────────────────────────── */}
        {exercise.type === 'sentence-transformation' && (
          <>
            <div style={{ ...textStyle, fontSize: '14px', textAlign: 'center', marginBottom: '10px' }}>
              {exercise.prompt}
            </div>
            {exercise.hint && (
              <div style={{ ...textStyle, fontSize: '11px', fontStyle: 'italic', textAlign: 'center', color: COLORS.brown, marginBottom: '20px' }}>
                Hint: {exercise.hint}
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {exercise.options.map((option, idx) => {
                let style = choiceStyle;
                if (showFeedback) {
                  if (option === exercise.answer) style = choiceCorrectStyle;
                  else if (option === answers[currentIndex]) style = choiceWrongStyle;
                }
                return (
                  <button key={idx} onClick={() => onAnswerSelect(option)} style={{ ...style, fontFamily: FONTS.arabicDisplay, fontSize: '16px' }} disabled={showFeedback}>
                    {idx + 1}. {formatArabic(option)}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ── word-order ────────────────────────────────────────────────── */}
        {exercise.type === 'word-order' && (
          <>
            <div style={{ ...textStyle, fontSize: '14px', textAlign: 'center', marginBottom: '20px' }}>
              {exercise.prompt}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {exercise.options.map((option, idx) => {
                let style = choiceStyle;
                if (showFeedback) {
                  if (option === exercise.answer) style = choiceCorrectStyle;
                  else if (option === answers[currentIndex]) style = choiceWrongStyle;
                }
                return (
                  <button key={idx} onClick={() => onAnswerSelect(option)} style={{ ...style, fontFamily: FONTS.arabicDisplay, fontSize: '16px' }} disabled={showFeedback}>
                    {idx + 1}. {formatArabic(option)}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ── error-identification ──────────────────────────────────────── */}
        {exercise.type === 'error-identification' && (
          <>
            <div style={{ ...textStyle, fontSize: '12px', textAlign: 'center', marginBottom: '8px', color: COLORS.brown }}>
              Find the error:
            </div>
            <div style={{ ...textStyle, fontSize: '18px', textAlign: 'center', fontFamily: FONTS.arabicDisplay, marginBottom: '20px' }}>
              {formatArabic(exercise.sentence)}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {exercise.options.map((option, idx) => {
                let style = choiceStyle;
                if (showFeedback) {
                  if (option === exercise.error) style = choiceCorrectStyle;
                  else if (option === answers[currentIndex]) style = choiceWrongStyle;
                }
                return (
                  <button key={idx} onClick={() => onAnswerSelect(option)} style={{ ...style, fontFamily: FONTS.arabicDisplay, fontSize: '16px' }} disabled={showFeedback}>
                    {idx + 1}. {formatArabic(option)}
                  </button>
                );
              })}
            </div>
            {showFeedback && feedbackMessage.includes('Correct') && (
              <div style={{ ...textStyle, textAlign: 'center', marginTop: '10px' }}>
                Correction: <strong>{formatArabic(exercise.correction)}</strong>
              </div>
            )}
          </>
        )}

        {/* ── multiple-select ───────────────────────────────────────────── */}
        {exercise.type === 'multiple-select' && (
          <>
            <div style={{ ...textStyle, fontSize: '14px', textAlign: 'center', marginBottom: '20px' }}>
              {exercise.prompt}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {exercise.options.map((option, idx) => {
                const isSelected = multiSelected.includes(option);
                const isCorrect = exercise.correctAnswers.includes(option);
                let style = isSelected ? { ...choiceStyle, background: COLORS.cyan, color: COLORS.white } : choiceStyle;
                if (showFeedback) {
                  if (isCorrect) style = choiceCorrectStyle;
                  else if (isSelected) style = choiceWrongStyle;
                }
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (showFeedback) return;
                      const next = isSelected
                        ? multiSelected.filter((s) => s !== option)
                        : [...multiSelected, option];
                      setMultiSelected(next);
                    }}
                    style={style}
                    disabled={showFeedback}
                  >
                    {idx + 1}. {formatArabic(option)}
                  </button>
                );
              })}
            </div>
            {!showFeedback && (
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                  onClick={() => {
                    const joined = exercise.correctAnswers.slice().sort().join(',');
                    onAnswerSelect(joined);
                    setMultiSelected([]);
                  }}
                  style={btnStyle}
                >
                  Check ({multiSelected.length} selected)
                </button>
              </div>
            )}
          </>
        )}

        {/* ── true-false ────────────────────────────────────────────────── */}
        {exercise.type === 'true-false' && (
          <>
            <div style={{ ...textStyle, fontSize: '14px', textAlign: 'center', marginBottom: '30px', fontFamily: FONTS.arabicDisplay }}>
              {formatArabic(exercise.statement)}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {['true', 'false'].map((option, idx) => {
                let style = choiceStyle;
                if (showFeedback) {
                  if (option === exercise.answer) style = choiceCorrectStyle;
                  else if (option === answers[currentIndex]) style = choiceWrongStyle;
                }
                return (
                  <button key={idx} onClick={() => onAnswerSelect(option)} style={style} disabled={showFeedback}>
                    {idx + 1}. {option === 'true' ? 'True ✓' : 'False ✗'}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ── cloze ─────────────────────────────────────────────────────── */}
        {exercise.type === 'cloze' && (
          <>
            <div style={{ ...textStyle, fontSize: '14px', textAlign: 'center', marginBottom: '20px' }}>
              Fill in the blanks:
            </div>
            <div style={{ ...textStyle, fontSize: '18px', textAlign: 'center', fontFamily: FONTS.arabicDisplay, marginBottom: '20px' }}>
              {formatArabic(exercise.text)}
            </div>
            {exercise.blanks[clozeIndex] && (
              <>
                <div style={{ ...textStyle, textAlign: 'center', marginBottom: '10px', color: COLORS.brown }}>
                  Blank {clozeIndex + 1} of {exercise.blanks.length}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {exercise.blanks[clozeIndex].options.map((option, idx) => {
                    const isLastBlank = clozeIndex === exercise.blanks.length - 1;
                    let style = choiceStyle;
                    if (showFeedback && isLastBlank) {
                      if (option === exercise.blanks[clozeIndex].answer) style = choiceCorrectStyle;
                      else if (option === answers[currentIndex]) style = choiceWrongStyle;
                    }
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (showFeedback) return;
                          const correct = option === exercise.blanks[clozeIndex].answer;
                          if (correct && clozeIndex < exercise.blanks.length - 1) {
                            setClozeIndex(clozeIndex + 1);
                          } else {
                            onAnswerSelect(option);
                            setClozeIndex(0);
                          }
                        }}
                        style={{ ...style, fontFamily: FONTS.arabicDisplay, fontSize: '18px' }}
                        disabled={showFeedback}
                      >
                        {idx + 1}. {formatArabic(option)}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* ── classify ──────────────────────────────────────────────────── */}
        {exercise.type === 'classify' && exercise.items[classifyIndex] && (
          <>
            <div style={{ ...textStyle, fontSize: '14px', textAlign: 'center', marginBottom: '20px' }}>
              {exercise.prompt}
            </div>
            <div style={{ ...textStyle, fontSize: '20px', textAlign: 'center', fontFamily: FONTS.arabicDisplay, marginBottom: '10px' }}>
              {formatArabic(exercise.items[classifyIndex].text)}
            </div>
            <div style={{ ...textStyle, textAlign: 'center', marginBottom: '20px', color: COLORS.brown }}>
              Item {classifyIndex + 1} of {exercise.items.length}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {exercise.categories.map((cat, idx) => {
                const correctCat = exercise.items[classifyIndex].category;
                const isLastItem = classifyIndex === exercise.items.length - 1;
                let style = choiceStyle;
                if (showFeedback && isLastItem) {
                  if (cat === correctCat) style = choiceCorrectStyle;
                  else if (cat === answers[currentIndex]) style = choiceWrongStyle;
                }
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (showFeedback) return;
                      const correct = cat === correctCat;
                      if (correct && classifyIndex < exercise.items.length - 1) {
                        setClassifyIndex(classifyIndex + 1);
                      } else {
                        onAnswerSelect(cat);
                        setClassifyIndex(0);
                      }
                    }}
                    style={style}
                    disabled={showFeedback}
                  >
                    {idx + 1}. {cat}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ── build-sentence ────────────────────────────────────────────── */}
        {exercise.type === 'build-sentence' && (
          <>
            <div style={{ ...textStyle, fontSize: '14px', textAlign: 'center', marginBottom: '20px' }}>
              {exercise.prompt}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {exercise.options.map((option, idx) => {
                let style = choiceStyle;
                if (showFeedback) {
                  if (option === exercise.answer) style = choiceCorrectStyle;
                  else if (option === answers[currentIndex]) style = choiceWrongStyle;
                }
                return (
                  <button key={idx} onClick={() => onAnswerSelect(option)} style={{ ...style, fontFamily: FONTS.arabicDisplay, fontSize: '16px' }} disabled={showFeedback}>
                    {idx + 1}. {formatArabic(option)}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {showFeedback && (
          <>
            <div style={getFeedbackStyle(feedbackMessage)}>{feedbackMessage}</div>
            <button onClick={onNext} style={btnStyle}>Next</button>
          </>
        )}
      </div>
    </motion.div>
  );
}
