import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../test/testUtils.jsx';
import HUD from '../HUD.jsx';

// Mock EventBus
vi.mock('../../../utils/eventBus.js', () => ({
  EventBus: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
}));

describe('HUD Component', () => {
  const mockOnMenu = vi.fn();

  beforeEach(() => {
    mockOnMenu.mockClear();
  });

  it('should render player level', () => {
    const preloadedState = {
      player: {
        level: 5,
        xp: 500,
        xpToNextLevel: 1000,
        streak: 3,
        dirhams: 100,
        wordsLearned: 25,
      },
    };

    renderWithProviders(<HUD onMenu={mockOnMenu} />, { preloadedState });

    expect(screen.getByText(/Lv\.5/i)).toBeInTheDocument();
  });

  it('should render XP progress bar with correct values', () => {
    const preloadedState = {
      player: {
        level: 1,
        xp: 50,
        xpToNextLevel: 100,
        streak: 0,
        dirhams: 0,
        wordsLearned: 0,
      },
    };

    renderWithProviders(<HUD onMenu={mockOnMenu} />, { preloadedState });

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('should display dirhams count', () => {
    const preloadedState = {
      player: {
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        streak: 0,
        dirhams: 250,
        wordsLearned: 0,
      },
    };

    renderWithProviders(<HUD onMenu={mockOnMenu} />, { preloadedState });

    expect(screen.getByLabelText(/250 Dirhams/i)).toBeInTheDocument();
  });

  it('should display words learned count', () => {
    const preloadedState = {
      player: {
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        streak: 0,
        dirhams: 0,
        wordsLearned: 42,
      },
    };

    renderWithProviders(<HUD onMenu={mockOnMenu} />, { preloadedState });

    expect(screen.getByLabelText(/42 words learned/i)).toBeInTheDocument();
  });

  it('should display streak count', () => {
    const preloadedState = {
      player: {
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        streak: 7,
        dirhams: 0,
        wordsLearned: 0,
      },
    };

    renderWithProviders(<HUD onMenu={mockOnMenu} />, { preloadedState });

    expect(screen.getByLabelText(/streak: 7 days/i)).toBeInTheDocument();
  });

  it('should display active quest count badge when quests exist', () => {
    const preloadedState = {
      player: {
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        streak: 0,
        dirhams: 0,
        wordsLearned: 0,
      },
      quests: {
        activeQuests: ['quest1', 'quest2', 'quest3'],
        completedQuests: [],
      },
    };

    renderWithProviders(<HUD onMenu={mockOnMenu} />, { preloadedState });

    expect(screen.getByLabelText(/3 active quests/i)).toBeInTheDocument();
  });

  it('should display achievement count', () => {
    const preloadedState = {
      player: {
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        streak: 0,
        dirhams: 0,
        wordsLearned: 0,
      },
      achievements: {
        unlocked: ['achievement1', 'achievement2'],
        definitions: {},
      },
    };

    renderWithProviders(<HUD onMenu={mockOnMenu} />, { preloadedState });

    expect(screen.getByLabelText(/2 unlocked/i)).toBeInTheDocument();
  });

  it('should display review due count when reviews exist', () => {
    const preloadedState = {
      player: {
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        streak: 0,
        dirhams: 0,
        wordsLearned: 0,
      },
      vocabulary: {
        words: [],
        fsrsCards: {},
        reviewQueue: ['word1', 'word2', 'word3', 'word4', 'word5'],
        stats: { totalReviews: 0, accuracy: 0, streakDays: 0 },
      },
    };

    renderWithProviders(<HUD onMenu={mockOnMenu} />, { preloadedState });

    expect(screen.getByLabelText(/5 reviews due/i)).toBeInTheDocument();
  });

  it('should call onMenu when Menu button is clicked', () => {
    renderWithProviders(<HUD onMenu={mockOnMenu} />);

    const menuButton = screen.getByLabelText(/open menu/i);
    fireEvent.click(menuButton);

    expect(mockOnMenu).toHaveBeenCalledTimes(1);
  });

  it('should open quest log when Quests button is clicked', () => {
    const { store } = renderWithProviders(<HUD onMenu={mockOnMenu} />);

    const questsButton = screen.getByLabelText(/quest log/i);
    fireEvent.click(questsButton);

    const state = store.getState();
    expect(state.ui.dialogueOpen).toBe(true);
    expect(state.ui.currentDialogue.type).toBe('quest-log');
  });

  it('should open achievements panel when Achievements button is clicked', () => {
    renderWithProviders(<HUD onMenu={mockOnMenu} />);

    const achievementsButton = screen.getByLabelText(/achievements/i);
    fireEvent.click(achievementsButton);

    // Achievement panel should be rendered
    expect(screen.getByText(/achievements/i)).toBeInTheDocument();
  });

  it('should calculate XP percentage correctly', () => {
    const preloadedState = {
      player: {
        level: 1,
        xp: 75,
        xpToNextLevel: 100,
        streak: 0,
        dirhams: 0,
        wordsLearned: 0,
      },
    };

    renderWithProviders(<HUD onMenu={mockOnMenu} />, { preloadedState });

    const progressBar = screen.getByRole('progressbar');
    const fillDiv = progressBar.querySelector('div');

    // 75/100 = 75%
    expect(fillDiv).toHaveStyle({ width: '75%' });
  });

  it('should cap XP percentage at 100%', () => {
    const preloadedState = {
      player: {
        level: 1,
        xp: 150,
        xpToNextLevel: 100,
        streak: 0,
        dirhams: 0,
        wordsLearned: 0,
      },
    };

    renderWithProviders(<HUD onMenu={mockOnMenu} />, { preloadedState });

    const progressBar = screen.getByRole('progressbar');
    const fillDiv = progressBar.querySelector('div');

    expect(fillDiv).toHaveStyle({ width: '100%' });
  });

  it('should have accessible ARIA labels', () => {
    const preloadedState = {
      player: {
        level: 3,
        xp: 300,
        xpToNextLevel: 450,
        streak: 5,
        dirhams: 123,
        wordsLearned: 30,
      },
    };

    renderWithProviders(<HUD onMenu={mockOnMenu} />, { preloadedState });

    expect(screen.getByLabelText(/Level 3/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/300 XP out of 450/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/streak: 5 days/i)).toBeInTheDocument();
    expect(screen.getByRole('banner')).toHaveAttribute('aria-label', 'Game HUD');
  });
});
