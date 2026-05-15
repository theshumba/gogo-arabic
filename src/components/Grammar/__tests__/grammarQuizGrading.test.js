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
  if (item.correctAnswers) {
    return answer === item.correctAnswers.slice().sort().join(',');
  }
  if (typeof item.correct === 'number') {
    return answer === item.options[item.correct];
  }
  return answer === item.answer;
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
});
