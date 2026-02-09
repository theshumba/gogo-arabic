import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

/**
 * useKeyboardShortcuts
 * Game keyboard shortcuts (M for map, L for alphabet)
 */
export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const dialogueOpen = useSelector((state) => state.ui.dialogueOpen);
  const quizOpen = useSelector((state) => state.ui.quizOpen);
  const menuOpen = useSelector((state) => state.ui.menuOpen);
  const signOpen = useSelector((state) => state.ui.signOpen);

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Don't trigger if user is typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Don't trigger if a modal/overlay is open
      if (dialogueOpen || quizOpen || menuOpen || signOpen) return;

      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        navigate('/game/map');
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        navigate('/alphabet');
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [navigate, dialogueOpen, quizOpen, menuOpen, signOpen]);
}
