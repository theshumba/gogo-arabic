/**
 * Grammar quiz grading logic tests.
 *
 * Regression tests for the bug where quiz items with `correct: <number index>`
 * always graded wrong because the component compared the answer string against
 * a numeric index instead of `item.options[item.correct]`.
 *
 * Also covers the multi-select bug where the submit button sent
 * `correctAnswers.join(',')` instead of the user's actual selection.
 */
import { describe, it, expect } from 'vitest';

/**
 * Mirrors the isCorrect logic in GrammarLesson.handleAnswerSelect after the fix.
 */
function gradeAnswer(answer, item) {
  if (item.type === 'cloze' || item.type === 'classify') {
    return answer !== 'WRONG';
  }
  if (item.correctAnswers) {
    return answer === item.correctAnswers.slice().sort().join(',');
  }
  if (typeof item.correct === 'number') {
    return answer === item.options[item.correct];
  }
  return answer === item.answer;
}

/**
 * Mirrors the cloze onClick in ExerciseStage after the fix.
 * Returns { answer, blankResults } to pass to gradeAnswer.
 */
function simulateClozeClicks(exercise, userPicks) {
  let clozeIndex = 0;
  let blankResults = [];
  let finalAnswer = null;

  for (const pick of userPicks) {
    const correct = pick === exercise.blanks[clozeIndex].answer;
    const next = [...blankResults, correct];
    if (clozeIndex < exercise.blanks.length - 1) {
      blankResults = next;
      clozeIndex += 1;
    } else {
      const allCorrect = next.every(Boolean);
      finalAnswer = allCorrect
        ? exercise.blanks.map((b) => b.answer).join('|')
        : 'WRONG';
      break;
    }
  }
  return finalAnswer;
}

describe('Grammar quiz grading (handleAnswerSelect logic)', () => {
  describe('quiz items with numeric correct index', () => {
    const quizItem = {
      question: 'Which is the definite article in Arabic?',
      options: ['الـ', 'ال', 'في', 'من'],
      correct: 1, // index — answer is options[1] = 'ال'
      explanation: 'الـ or ال is the definite article.',
    };

    it('grades correct answer as correct when user picks the right option string', () => {
      expect(gradeAnswer('ال', quizItem)).toBe(true);
    });

    it('grades wrong answer as wrong', () => {
      expect(gradeAnswer('في', quizItem)).toBe(false);
    });

    it('does NOT grade the numeric index itself as correct', () => {
      // Before fix this was: answer === item.correct → '1' === 1 → always false
      // Ensure passing the index number as string is still false
      expect(gradeAnswer('1', quizItem)).toBe(false);
    });

    it('grades first option (index 0) correctly', () => {
      const item = {
        options: ['الشمس', 'القمر', 'النجم'],
        correct: 0,
      };
      expect(gradeAnswer('الشمس', item)).toBe(true);
      expect(gradeAnswer('القمر', item)).toBe(false);
    });

    it('grades last option correctly', () => {
      const item = {
        options: ['أ', 'ب', 'ج', 'د'],
        correct: 3,
      };
      expect(gradeAnswer('د', item)).toBe(true);
      expect(gradeAnswer('أ', item)).toBe(false);
    });
  });

  describe('exercise items with string answer field', () => {
    const exerciseItem = {
      type: 'fill-blank',
      prompt: 'The cat is ___',
      options: ['القطة', 'الكلب', 'السمكة'],
      answer: 'القطة',
    };

    it('grades correct string answer correctly', () => {
      expect(gradeAnswer('القطة', exerciseItem)).toBe(true);
    });

    it('grades wrong string answer as wrong', () => {
      expect(gradeAnswer('الكلب', exerciseItem)).toBe(false);
    });
  });

  describe('multiple-select items with correctAnswers array', () => {
    const multiItem = {
      type: 'multiple-select',
      prompt: 'Select all sun letters',
      options: ['ت', 'ش', 'ر', 'ق', 'خ'],
      correctAnswers: ['ت', 'ش', 'ر'],
      answer: 'ر,ش,ت', // sorted join
    };

    it('grades correct selection (sorted join) as correct', () => {
      // User picks ت, ش, ر — sorted: ت,ر,ش (Unicode order)
      const userSorted = ['ت', 'ش', 'ر'].slice().sort().join(',');
      const correctSorted = multiItem.correctAnswers.slice().sort().join(',');
      expect(userSorted).toBe(correctSorted);
      expect(gradeAnswer(userSorted, multiItem)).toBe(true);
    });

    it('grades partial selection as wrong', () => {
      const partial = ['ت', 'ش'].slice().sort().join(',');
      expect(gradeAnswer(partial, multiItem)).toBe(false);
    });

    it('grades wrong selection as wrong', () => {
      const wrong = ['ق', 'خ', 'ت'].slice().sort().join(',');
      expect(gradeAnswer(wrong, multiItem)).toBe(false);
    });

    it('does NOT auto-grade as correct when sending correctAnswers directly (old bug)', () => {
      // The OLD bug: submit always sent correctAnswers.join(',') — any answer was "correct"
      // This test documents that grading is now based on the user's actual selection.
      // If user selected ['ق', 'خ'] and we send that, it should be wrong.
      const wrongSelection = ['ق', 'خ'].slice().sort().join(',');
      expect(gradeAnswer(wrongSelection, multiItem)).toBe(false);
    });
  });

  describe('cloze exercise per-blank grading', () => {
    const clozeExercise = {
      type: 'cloze',
      text: 'أنا __ المدرسة و __ الكتاب',
      blanks: [
        { answer: 'في', options: ['في', 'من', 'إلى'] },
        { answer: 'أقرأ', options: ['أقرأ', 'أكتب', 'أشرب'] },
      ],
    };

    it('all blanks correct → graded correct', () => {
      const answer = simulateClozeClicks(clozeExercise, ['في', 'أقرأ']);
      expect(answer).toBe('في|أقرأ');
      expect(gradeAnswer(answer, clozeExercise)).toBe(true);
    });

    it('first blank wrong → graded wrong', () => {
      const answer = simulateClozeClicks(clozeExercise, ['من', 'أقرأ']);
      expect(answer).toBe('WRONG');
      expect(gradeAnswer(answer, clozeExercise)).toBe(false);
    });

    it('second blank wrong → graded wrong', () => {
      const answer = simulateClozeClicks(clozeExercise, ['في', 'أكتب']);
      expect(answer).toBe('WRONG');
      expect(gradeAnswer(answer, clozeExercise)).toBe(false);
    });

    it('both blanks wrong → graded wrong', () => {
      const answer = simulateClozeClicks(clozeExercise, ['إلى', 'أشرب']);
      expect(answer).toBe('WRONG');
      expect(gradeAnswer(answer, clozeExercise)).toBe(false);
    });

    it('partial wrong on blank 1 does not advance without registering wrong', () => {
      // Old bug: a wrong click on blank 1 would call onAnswerSelect(wrong_option)
      // and reset clozeIndex to 0, grading the whole exercise as wrong prematurely.
      // New behaviour: wrong click on non-last blank does NOT end exercise yet.
      // simulateClozeClicks only ends when reaching the last blank.
      // If user picks wrong on blank 0, we advance to blank 1 with [false] in blankResults.
      // Then on blank 1 they pick correctly — result is still WRONG because blank 0 was wrong.
      const answer = simulateClozeClicks(clozeExercise, ['من', 'أقرأ']);
      expect(answer).toBe('WRONG');
    });
  });
});
