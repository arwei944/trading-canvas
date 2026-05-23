import { describe, it, expect, vi, beforeAll } from 'vitest';

// Mock dependencies
vi.mock('../db/index.js', () => ({
  getDb: vi.fn(() => ({
    prepare: vi.fn(() => ({
      all: vi.fn(() => []),
      get: vi.fn(() => null),
      run: vi.fn(() => ({ changes: 1, lastInsertRowid: 1 })),
    })),
  })),
}));

vi.mock('../services/exchangeService.js', () => ({
  getExchangeList: vi.fn(() => []),
  getAllApis: vi.fn(() => []),
  addExchangeApi: vi.fn(() => ({ id: 1 })),
  deleteExchangeApi: vi.fn(() => true),
  toggleStar: vi.fn(() => true),
  checkPermissions: vi.fn(() => true),
  updateExchangeApi: vi.fn(() => ({ id: 1 })),
  getDecryptedApi: vi.fn(() => null),
}));

vi.mock('../services/dataSyncService.js', () => ({
  getBTCETHPrice: vi.fn(() => ({ btcPrice: 67000, ethPrice: 3500 })),
  getAssets: vi.fn(() => ({ SPOT: { list: [], total: 0 } })),
  getPositions: vi.fn(() => []),
  getOrders: vi.fn(() => []),
  getDepositWithdrawStats: vi.fn(() => ({
    totalDeposit: 0, totalWithdraw: 0, overallPnl: 0,
    overallPnlPercent: 0, futuresPnl: 0, assetsBalance: 0,
    assetsBalance24HChange: 0, totalDepositBtcValuation: 0,
    totalWithdrawBtcValuation: 0,
  })),
  getTrendChart: vi.fn(() => []),
  getCalendar: vi.fn(() => []),
  getAssetRatio: vi.fn(() => ({ ALL: [] })),
  getAssetChangeByDate: vi.fn(() => []),
  getAnalysisSummary: vi.fn(() => ({})),
  syncApiData: vi.fn(),
  syncAllApis: vi.fn(),
  getSyncState: vi.fn(() => ({ isSyncing: false, status: 'idle' })),
  getHistoryOrders: vi.fn(() => []),
}));

vi.mock('../services/syncLogService.js', () => ({
  getSyncLogs: vi.fn(() => []),
}));

describe('Route handlers', () => {
  it('should export route modules without errors', async () => {
    // 验证路由模块可以正常加载
    const { apiRouter } = await import('../routes/exchangeRoutes.js');
    expect(apiRouter).toBeDefined();
  });

  it('should export data routes without errors', async () => {
    const { dataRouter } = await import('../routes/dataRoutes.js');
    expect(dataRouter).toBeDefined();
  });
});
