import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Custom navigation hook that wraps react-router's useNavigate
 * Provides semantic navigation methods for the game
 */
export function useGameNavigation() {
  const navigate = useNavigate();

  const goToMenu = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const goToCharacterCreation = useCallback(() => {
    navigate('/character/create');
  }, [navigate]);

  const goToGame = useCallback(() => {
    navigate('/game');
  }, [navigate]);

  const goToAlphabet = useCallback(() => {
    navigate('/alphabet');
  }, [navigate]);

  const goToReview = useCallback(() => {
    navigate('/review');
  }, [navigate]);

  const goToSettings = useCallback(() => {
    navigate('/settings');
  }, [navigate]);

  const goToWorldMap = useCallback(() => {
    navigate('/game/map');
  }, [navigate]);

  const goToStats = useCallback(() => {
    navigate('/stats');
  }, [navigate]);

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Generic navigate function for custom paths
  const goTo = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  return {
    navigate,
    goToMenu,
    goToCharacterCreation,
    goToGame,
    goToAlphabet,
    goToReview,
    goToSettings,
    goToWorldMap,
    goToStats,
    goBack,
    goTo,
  };
}
