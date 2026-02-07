import { useSelector } from 'react-redux';
import { useEffect, useCallback } from 'react';
import { audioManager } from '../services/audio.js';

/**
 * React hook that wraps the audioManager singleton and keeps its
 * channel volumes in sync with the Redux settings slice.
 *
 * Settings slice fields:
 *   ambientVolume        (0-100) -> ambient channel
 *   sfxVolume            (0-100) -> sfx channel
 *   pronunciationVolume  (0-100) -> pronunciation channel
 */
export function useAudio() {
  const settings = useSelector((state) => state.settings);

  // Sync audio manager volumes whenever Redux settings change
  useEffect(() => {
    audioManager.setAmbientVolume(settings.ambientVolume);
    audioManager.setSfxVolume(settings.sfxVolume);
    audioManager.setPronunciationVolume(settings.pronunciationVolume);
  }, [settings.ambientVolume, settings.sfxVolume, settings.pronunciationVolume]);

  return {
    playSFX: useCallback((name) => audioManager.playSFX(name), []),
    playWord: useCallback((wordId) => audioManager.playWord(wordId), []),
    playLetter: useCallback((letter) => audioManager.playLetter(letter), []),
    playAmbient: useCallback((zone) => audioManager.playAmbient(zone), []),
    stopAmbient: useCallback(() => audioManager.stopAmbient(), []),
  };
}
