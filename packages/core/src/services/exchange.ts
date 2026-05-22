// packages/core/src/services/exchange.ts

import { apiClient } from './api';
import type {
  ExchangeInfo,
  ExchangeAPI,
  AssetResponse,
  AssetBalance,
  PositionData,
  OrderData,
  DepositWithdrawStats,
  TrendData,
  CalendarData,
} from '../types';

// API 端点
const ENDPOINTS = {
  EX_LIST: '/ex/api/ex_list',
  CHECK_PERMISSIONS: '/ex/api/checkApiIdPermissions',
  REFRESH_STATE: '/ex/api/refresh/state',
  PRICE_BTC_ETH: '/ex/price/getBTCAndETHPrice',
  ASSET_BALANCE_V2: '/ex/asset/account/balance/v2',
  ASSET_BALANCE_RATIO: '/ex/asset/account/balance/ratio',
  ASSET_TREND_CHART: '/ex/asset/trendChart',
  CONTRACT_POSITION: '/ex/contractPosition',
  ENTRUST_ORDERS: '/ex/entrustOrders',
  DEPOSIT_WITHDRAW_STA: '/ex/depositAndWithdraw/sta',
  ANALYSIS_SUMMARY: '/ex/analysisStat/summary',
  ASSET_CHANGE_DATE: '/ex/asset/change/date',
} as const;

// 交易所服务
export class ExchangeService {
  // 获取交易所列表
  static async getExchanges(): Promise<ExchangeInfo[]> {
    return apiClient.get<ExchangeInfo[]>(ENDPOINTS.EX_LIST);
  }

  // 检查 API 权限
  static async checkPermissions(apiId: number): Promise<boolean> {
    return apiClient.get<boolean>(ENDPOINTS.CHECK_PERMISSIONS, { apiId: String(apiId) });
  }

  // 获取同步状态
  static async getRefreshState(apiId: number): Promise<{ state: number; ratio: number }> {
    return apiClient.get<{ apiId: number; state: number; ratio: number }>(
      ENDPOINTS.REFRESH_STATE,
      { apiId: String(apiId) }
    );
  }

  // 获取 BTC/ETH 价格
  static async getBTCETHPrice(): Promise<{ btcPrice: number; ethPrice: number }> {
    return apiClient.get<{ btcPrice: number; ethPrice: number }>(ENDPOINTS.PRICE_BTC_ETH);
  }

  // 获取资产余额
  static async getAssets(apiId: number, page = 1, pageSize = 10): Promise<AssetResponse> {
    return apiClient.get<AssetResponse>(
      ENDPOINTS.ASSET_BALANCE_V2,
      { apiId: String(apiId), pageSize: String(pageSize), pageNum: String(page) }
    );
  }

  // 获取资产分布
  static async getAssetRatio(apiId: number): Promise<{ ALL: AssetBalance[] }> {
    return apiClient.get<{ ALL: AssetBalance[] }>(ENDPOINTS.ASSET_BALANCE_RATIO, { apiId: String(apiId) });
  }

  // 获取趋势图数据
  async getTrendChart(apiId: number, interval: '24h' | '7d' | '30d' | '90d'): Promise<TrendData[]> {
    const data = await apiClient.get<Array<{ date: number; asset: number }>>(
      ENDPOINTS.ASSET_TREND_CHART,
      { apiId: String(apiId), interval }
    );
    return data.map(item => ({
      date: new Date(item.date).toISOString().split('T')[0],
      value: item.asset,
    }));
  }

  // 获取合约持仓
  static async getPositions(apiId: number): Promise<PositionData[]> {
    return apiClient.get<PositionData[]>(ENDPOINTS.CONTRACT_POSITION, { apiId: String(apiId) }) || [];
  }

  // 获取当前委托
  static async getOrders(apiId: number): Promise<OrderData[]> {
    return apiClient.get<OrderData[]>(ENDPOINTS.ENTRUST_ORDERS, { apiId: String(apiId) }) || [];
  }

  // 获取充提统计
  static async getDepositWithdrawStats(apiId: number): Promise<DepositWithdrawStats> {
    return apiClient.get<DepositWithdrawStats>(ENDPOINTS.DEPOSIT_WITHDRAW_STA, { apiId: String(apiId) });
  }

  // 获取分析摘要
  static async getAnalysisSummary(startDate: number, endDate: number): Promise<Record<string, unknown>> {
    return apiClient.get<Record<string, unknown>>(
      ENDPOINTS.ANALYSIS_SUMMARY,
      { startDate: String(startDate), endDate: String(endDate) }
    );
  }

  // 获取按日期的资产变动
  static async getAssetChangeByDate(beginTime: number, endTime: number): Promise<Record<string, number>> {
    return apiClient.get<Record<string, number>>(
      ENDPOINTS.ASSET_CHANGE_DATE,
      { beginTime: String(beginTime), endTime: String(endTime) }
    );
  }

  // 获取日历数据
  static async getCalendar(year: number, month: number, type: number = 1): Promise<CalendarData[]> {
    return apiClient.get<CalendarData[]>('/ex/calendar', { year: String(year), month: String(month), type: String(type) });
  }

  // 添加交易所 API
  static async addExchangeApi(data: {
    exchange_id: number;
    name: string;
    api_key: string;
    secret_key: string;
    passphrase?: string;
  }): Promise<ExchangeAPI> {
    return apiClient.post<ExchangeAPI>('/ex/api/add', data as Record<string, unknown>);
  }

  // 删除交易所 API
  static async removeExchangeApi(apiId: number): Promise<void> {
    await apiClient.delete<void>('/ex/api/delete', { apiId } as Record<string, unknown>);
  }

  // 更新交易所 API
  static async updateExchangeApi(data: {
    apiId: number;
    name?: string;
    api_key?: string;
    secret_key?: string;
    passphrase?: string;
  }): Promise<ExchangeAPI> {
    const { apiId, ...body } = data;
    return apiClient.put<ExchangeAPI>('/ex/api/update', { apiId, ...body } as Record<string, unknown>);
  }

  // 切换星标
  static async toggleStarApi(apiId: number): Promise<void> {
    await apiClient.put<void>('/ex/api/star', { apiId } as Record<string, unknown>);
  }
}

// 导出实例
export const exchangeService = new ExchangeService();

// 导出独立函数（通过实例方法绑定）
export const getExchanges = (...args: Parameters<ExchangeService['getExchanges']>) => exchangeService.getExchanges(...args);
export const getAssets = (...args: Parameters<ExchangeService['getAssets']>) => exchangeService.getAssets(...args);
export const getPositions = (...args: Parameters<ExchangeService['getPositions']>) => exchangeService.getPositions(...args);
export const getOrders = (...args: Parameters<ExchangeService['getOrders']>) => exchangeService.getOrders(...args);
export const getTrendChart = (...args: Parameters<ExchangeService['getTrendChart']>) => exchangeService.getTrendChart(...args);
export const getDepositWithdrawStats = (...args: Parameters<ExchangeService['getDepositWithdrawStats']>) => exchangeService.getDepositWithdrawStats(...args);
export const getCalendar = (...args: Parameters<ExchangeService['getCalendar']>) => exchangeService.getCalendar(...args);
