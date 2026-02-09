import { describe, it, expect, beforeEach } from 'vitest';
import settingsReducer, {
  toggleTransliteration,
  toggleDiacritics,
  setKeyboardMode,
  setAmbientVolume,
  setSfxVolume,
  setPronunciationVolume,
  setTextSize,
} from '../slices/settingsSlice.js';

describe('settingsSlice', () => {
  let initialState;

  beforeEach(() => {
    initialState = settingsReducer(undefined, { type: 'unknown' });
  });

  describe('initial state', () => {
    it('should return the initial state', () => {
      expect(initialState).toEqual({
        showTransliteration: true,
        showDiacritics: true,
        keyboardMode: 'onscreen',
        ambientVolume: 70,
        sfxVolume: 80,
        pronunciationVolume: 100,
        textSize: 'medium',
      });
    });
  });

  describe('toggleTransliteration', () => {
    it('should toggle transliteration from true to false', () => {
      const state = settingsReducer(initialState, toggleTransliteration());

      expect(state.showTransliteration).toBe(false);
    });

    it('should toggle transliteration from false to true', () => {
      const startState = { ...initialState, showTransliteration: false };
      const state = settingsReducer(startState, toggleTransliteration());

      expect(state.showTransliteration).toBe(true);
    });

    it('should toggle multiple times', () => {
      let state = settingsReducer(initialState, toggleTransliteration());
      expect(state.showTransliteration).toBe(false);

      state = settingsReducer(state, toggleTransliteration());
      expect(state.showTransliteration).toBe(true);

      state = settingsReducer(state, toggleTransliteration());
      expect(state.showTransliteration).toBe(false);
    });
  });

  describe('toggleDiacritics', () => {
    it('should toggle diacritics from true to false', () => {
      const state = settingsReducer(initialState, toggleDiacritics());

      expect(state.showDiacritics).toBe(false);
    });

    it('should toggle diacritics from false to true', () => {
      const startState = { ...initialState, showDiacritics: false };
      const state = settingsReducer(startState, toggleDiacritics());

      expect(state.showDiacritics).toBe(true);
    });
  });

  describe('setKeyboardMode', () => {
    it('should set keyboard mode to onscreen', () => {
      const startState = { ...initialState, keyboardMode: 'physical' };
      const state = settingsReducer(startState, setKeyboardMode('onscreen'));

      expect(state.keyboardMode).toBe('onscreen');
    });

    it('should set keyboard mode to physical', () => {
      const state = settingsReducer(initialState, setKeyboardMode('physical'));

      expect(state.keyboardMode).toBe('physical');
    });
  });

  describe('setAmbientVolume', () => {
    it('should set ambient volume to valid value', () => {
      const state = settingsReducer(initialState, setAmbientVolume(50));

      expect(state.ambientVolume).toBe(50);
    });

    it('should clamp volume below 0 to 0', () => {
      const state = settingsReducer(initialState, setAmbientVolume(-10));

      expect(state.ambientVolume).toBe(0);
    });

    it('should clamp volume above 100 to 100', () => {
      const state = settingsReducer(initialState, setAmbientVolume(150));

      expect(state.ambientVolume).toBe(100);
    });

    it('should handle boundary values', () => {
      let state = settingsReducer(initialState, setAmbientVolume(0));
      expect(state.ambientVolume).toBe(0);

      state = settingsReducer(initialState, setAmbientVolume(100));
      expect(state.ambientVolume).toBe(100);
    });
  });

  describe('setSfxVolume', () => {
    it('should set sfx volume to valid value', () => {
      const state = settingsReducer(initialState, setSfxVolume(60));

      expect(state.sfxVolume).toBe(60);
    });

    it('should clamp volume below 0 to 0', () => {
      const state = settingsReducer(initialState, setSfxVolume(-5));

      expect(state.sfxVolume).toBe(0);
    });

    it('should clamp volume above 100 to 100', () => {
      const state = settingsReducer(initialState, setSfxVolume(200));

      expect(state.sfxVolume).toBe(100);
    });
  });

  describe('setPronunciationVolume', () => {
    it('should set pronunciation volume to valid value', () => {
      const state = settingsReducer(initialState, setPronunciationVolume(75));

      expect(state.pronunciationVolume).toBe(75);
    });

    it('should clamp volume below 0 to 0', () => {
      const state = settingsReducer(initialState, setPronunciationVolume(-20));

      expect(state.pronunciationVolume).toBe(0);
    });

    it('should clamp volume above 100 to 100', () => {
      const state = settingsReducer(initialState, setPronunciationVolume(120));

      expect(state.pronunciationVolume).toBe(100);
    });
  });

  describe('setTextSize', () => {
    it('should set text size to small', () => {
      const state = settingsReducer(initialState, setTextSize('small'));

      expect(state.textSize).toBe('small');
    });

    it('should set text size to medium', () => {
      const state = settingsReducer(initialState, setTextSize('medium'));

      expect(state.textSize).toBe('medium');
    });

    it('should set text size to large', () => {
      const state = settingsReducer(initialState, setTextSize('large'));

      expect(state.textSize).toBe('large');
    });

    it('should allow changing text size multiple times', () => {
      let state = settingsReducer(initialState, setTextSize('small'));
      expect(state.textSize).toBe('small');

      state = settingsReducer(state, setTextSize('large'));
      expect(state.textSize).toBe('large');

      state = settingsReducer(state, setTextSize('medium'));
      expect(state.textSize).toBe('medium');
    });
  });
});
