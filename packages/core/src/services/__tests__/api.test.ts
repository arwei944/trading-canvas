import { describe, it, expect, vi } from 'vitest';

// Mock axios
vi.mock('axios', () => {
  const mockAxios = {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    })),
  };
  return { default: mockAxios };
});

describe('ApiClient', () => {
  it('should create axios instance with default config', async () => {
    // Import api module to trigger axios.create
    await import('../api.js');
    const axios = (await import('axios')).default;
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: '',
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });
  });
});
