// packages/core/src/stores/exchangeStore.ts

import { create } from 'zustand';
import { ExchangeService } from '../services/exchange';
import type { ExchangeInfo, ExchangeId, ExchangeAPI } from '../types';

interface ExchangeState {
  exchanges: ExchangeInfo[];
  apis: ExchangeAPI[]; // 扁平化的API列表
  selectedApiId: number | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchExchanges: () => Promise<void>;
  selectApi: (apiId: number | null) => void;
  addApi: (api: Partial<ExchangeAPI>) => Promise<void>;
  removeApi: (apiId: number) => Promise<void>;
  toggleStar: (apiId: number) => void;
  clearError: () => void;
}

export const useExchangeStore = create<ExchangeState>((set, get) => ({
  exchanges: [],
  apis: [],
  selectedApiId: null,
  isLoading: false,
  error: null,

  fetchExchanges: async () => {
    set({ isLoading: true, error: null });
    try {
      const exchanges = await ExchangeService.getExchanges();
      // 扁平化所有API
      const allApis = exchanges.flatMap(ex => ex.apis);
      set({ exchanges, apis: allApis, isLoading: false });

      // 默认选择第一个 API
      if (allApis.length > 0) {
        set({ selectedApiId: allApis[0].id });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.msg || '获取交易所列表失败',
        isLoading: false,
      });
    }
  },

  selectApi: (apiId) => set({ selectedApiId: apiId }),

  addApi: async (api) => {
    // 模拟添加API
    const newApi: ExchangeAPI = {
      id: Date.now(),
      userId: 1,
      exchangeId: (api.exchangeId || 1) as ExchangeId,
      name: api.name || 'New API',
      apiKey: api.apiKey || '',
      secretKey: api.secretKey || '',
      passphrase: api.passphrase,
      type: 1,
      status: 1,
      star: 0,
      createTime: Date.now(),
      updateTime: null,
      expire: 1,
      refreshRatio: null,
      gateIpList: null,
    };
    
    set((state) => ({
      apis: [...state.apis, newApi],
    }));
  },

  removeApi: async (apiId) => {
    set((state) => ({
      apis: state.apis.filter(api => api.id !== apiId),
      selectedApiId: state.selectedApiId === apiId ? null : state.selectedApiId,
    }));
  },

  toggleStar: (apiId) => {
    set((state) => ({
      apis: state.apis.map(api =>
        api.id === apiId ? { ...api, star: api.star === 1 ? 0 : 1 } : api
      ),
    }));
  },

  clearError: () => set({ error: null }),
}));
