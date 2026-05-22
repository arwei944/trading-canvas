// packages/core/src/stores/exchangeStore.ts

import { create } from 'zustand';
import { ExchangeService } from '../services/exchange';
import type { ExchangeInfo, ExchangeAPI } from '../types';

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
  toggleStar: (apiId: number) => Promise<void>;
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
    try {
      await ExchangeService.addExchangeApi({
        exchange_id: api.exchangeId as number,
        name: api.name || '',
        api_key: api.apiKey || '',
        secret_key: api.secretKey || '',
        passphrase: api.passphrase,
      });
      // 重新获取列表
      await get().fetchExchanges();
    } catch (error: any) {
      set({ error: error.message || '添加API失败' });
    }
  },

  removeApi: async (apiId) => {
    try {
      await ExchangeService.removeExchangeApi(apiId);
      set((state) => ({
        apis: state.apis.filter(api => api.id !== apiId),
        selectedApiId: state.selectedApiId === apiId ? null : state.selectedApiId,
      }));
    } catch (error: any) {
      set({ error: error.message || '删除API失败' });
    }
  },

  toggleStar: async (apiId) => {
    try {
      await ExchangeService.toggleStarApi(apiId);
      set((state) => ({
        apis: state.apis.map(api =>
          api.id === apiId ? { ...api, star: api.star === 1 ? 0 : 1 } : api
        ),
      }));
    } catch (error: any) {
      set({ error: error.message || '操作失败' });
    }
  },

  clearError: () => set({ error: null }),
}));
