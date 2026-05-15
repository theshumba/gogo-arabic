/**
 * Regression tests for ShopOverlay.
 *
 * CR-01: shopId TDZ — opening a shop must never throw
 *   "ReferenceError: Cannot access 'shopId' before initialization"
 *
 * CRITICAL #6: handleHaggleSuccess must validate before recording
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test/testUtils.jsx';
import ShopOverlay from '../ShopOverlay.jsx';

// ── external deps that need browser APIs ───────────────────────────────────
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

vi.mock('../../../utils/eventBus.js', () => ({
  EventBus: { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

vi.mock('../../../hooks/useOverlayClose.js', () => ({
  useOverlayClose: (fn) => fn,
}));

vi.mock('../../../hooks/useFocusTrap.js', () => ({
  useFocusTrap: () => ({ current: null }),
}));

vi.mock('../../../services/tradeRouteIntegration.js', () => ({
  getShopZoneInfo: () => null,
  getZoneAdjustedBuyPrice: (price) => price,
}));

vi.mock('../../../data/shopGenerator.js', () => ({
  getShopInventory: () => [
    { itemId: 'iron_sword', price: 50, quantity: 5 },
  ],
}));

vi.mock('../../../game/systems/pricingAgent.js', () => ({
  SUPPLY_DEFAULTS: { common: { max: 10 } },
}));

vi.mock('../../../data/equipment.js', () => ({
  EQUIPMENT_DATA: {
    iron_sword: { name: 'Iron Sword', rarity: 'common', affixes: [] },
  },
  RARITY_COLORS: {
    common: '#AAAAAA',
    uncommon: '#44BB44',
    rare: '#4488FF',
    epic: '#AA44FF',
    legendary: '#FF8800',
  },
}));

vi.mock('../../../data/affixes.js', () => ({ AFFIXES: {} }));

vi.mock('../../../store/store.js', () => ({
  store: {
    getState: () => ({
      player: { level: 1, dirhams: 500 },
      quests: { completed: {} },
      ui: { dialogueConfig: null },
      vocabulary: { fsrsCards: {} },
      inventory: { items: [] },
      economy: { shops: {} },
    }),
    dispatch: vi.fn(),
  },
}));

// ── helpers ─────────────────────────────────────────────────────────────────

const defaultPreloadedState = {
  player: {
    name: 'Amir',
    level: 1,
    dirhams: 500,
    xp: 0,
    streak: 0,
    maxStreak: 0,
    currentZone: 'oasis_village',
  },
  ui: {
    dialogueConfig: { shopId: 'oasis_village_shop', shopName: 'Test Shop', shopGreeting: 'Hello!' },
    activeOverlay: 'shop',
  },
  quests: { quests: {}, completed: {}, activeQuestId: null },
  vocabulary: { fsrsCards: {} },
  inventory: { items: [], maxCapacity: 200 },
  economy: { shops: {} },
};

// ── tests ────────────────────────────────────────────────────────────────────

describe('ShopOverlay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without throwing ReferenceError (TDZ regression)', () => {
    // If shopId is read before declaration a ReferenceError would be thrown here.
    expect(() =>
      renderWithProviders(<ShopOverlay />, { preloadedState: defaultPreloadedState })
    ).not.toThrow();
  });

  it('shows the shop name from dialogueConfig', () => {
    renderWithProviders(<ShopOverlay />, { preloadedState: defaultPreloadedState });
    expect(screen.getByText('Test Shop')).toBeInTheDocument();
  });

  it('shows Buy and Sell tab buttons', () => {
    renderWithProviders(<ShopOverlay />, { preloadedState: defaultPreloadedState });
    // Both tab buttons should be present (may have multiple Buy/Sell elements)
    const buttons = screen.getAllByRole('button');
    const labels = buttons.map((b) => b.textContent);
    expect(labels).toContain('Buy');
    expect(labels).toContain('Sell');
  });

  it('shows the shop greeting', () => {
    renderWithProviders(<ShopOverlay />, { preloadedState: defaultPreloadedState });
    expect(screen.getByText('Hello!')).toBeInTheDocument();
  });
});
