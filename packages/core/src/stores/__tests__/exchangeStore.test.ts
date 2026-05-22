import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock ExchangeService
vi.mock('../../services/exchange', () => ({
  ExchangeService: {
    getExchanges: vi.fn(),
    addExchangeApi: vi.fn(),
    removeExchangeApi: vi.fn(),
    toggleStarApi: vi.fn(),
  },
}));

describe('exchangeStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have correct initial state', async () => {
    const { useExchangeStore } = await import('../exchangeStore');
    const state = useExchangeStore.getState();
    expect(state.exchanges).toEqual([]);
    expect(state.apis).toEqual([]);
    expect(state.selectedApiId).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });
});
