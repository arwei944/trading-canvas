// packages/core/src/services/exchange.ts

import { apiClient, ApiResponse } from './api';
import type {
  ExchangeInfo,
  AssetResponse,
  AssetBalance,
  PositionData,
  OrderData,
  DepositWithdrawStats,
  TrendData,
  CalendarData,
  ApiResponse as ExchangeApiResponse
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
    const response = await apiClient.get<ApiResponse<ExchangeInfo[]>>(ENDPOINTS.EX_LIST);
    return response.data;
  }

  // 检查 API 权限
  static async checkPermissions(apiId: number): Promise<boolean> {
    const response = await apiClient.get<ApiResponse<boolean>>(
      ENDPOINTS.CHECK_PERMISSIONS,
      { apiId: String(apiId) }
    );
    return response.data;
  }

  // 获取同步状态
  static async getRefreshState(apiId: number): Promise<{ state: number; ratio: number }> {
    const response = await apiClient.get<ApiResponse<{ apiId: number; state: number; ratio: number }>>(
      ENDPOINTS.REFRESH_STATE,
      { apiId: String(apiId) }
    );
    return { state: response.data.state, ratio: response.data.ratio };
  }

  // 获取 BTC/ETH 价格
  static async getBTCETHPrice(): Promise<{ btcPrice: number; ethPrice: number }> {
    const response = await apiClient.get<{ btcPrice: number; ethPrice: number }>(
      ENDPOINTS.PRICE_BTC_ETH
    );
    return response;
  }

  // 获取资产余额
  static async getAssets(
    apiId: number,
    page = 1,
    pageSize = 10
  ): Promise<AssetResponse> {
    const response = await apiClient.get<ApiResponse<AssetResponse>>(
      ENDPOINTS.ASSET_BALANCE_V2,
      { apiId: String(apiId), pageSize: String(pageSize), pageNum: String(page) }
    );
    return response.data;
  }

  // 获取资产分布
  static async getAssetRatio(apiId: number): Promise<AssetBalance[]> {
    const response = await apiClient.get<ApiResponse<{ ALL: AssetBalance[] }>>(
      ENDPOINTS.ASSET_BALANCE_RATIO,
      { apiId: String(apiId) }
    );
    return response.data.ALL;
  }

  // 获取趋势图数据
  static async getTrendChart(
    apiId: number,
    interval: '24h' | '7d' | '30d' | '90d'
  ): Promise<TrendData[]> {
    const response = await apiClient.get<ApiResponse<Array<{ date: number; asset: number }>>>(
      ENDPOINTS.ASSET_TREND_CHART,
      { apiId: String(apiId), interval }
    );
    return response.data.map(item => ({
      date: new Date(item.date).toISOString().split('T')[0],
      value: item.asset,
    }));
  }

  // 获取合约持仓
  static async getPositions(apiId: number): Promise<PositionData[]> {
    const response = await apiClient.get<ApiResponse<PositionData[]>>(
      ENDPOINTS.CONTRACT_POSITION,
      { apiId: String(apiId) }
    );
    return response.data || [];
  }

  // 获取当前委托
  static async getOrders(apiId: number): Promise<OrderData[]> {
    const response = await apiClient.get<ApiResponse<OrderData[]>>(
      ENDPOINTS.ENTRUST_ORDERS,
      { apiId: String(apiId) }
    );
    return response.data || [];
  }

  // 获取充提统计
  static async getDepositWithdrawStats(apiId: number): Promise<DepositWithdrawStats> {
    const response = await apiClient.get<ApiResponse<DepositWithdrawStats>>(
      ENDPOINTS.DEPOSIT_WITHDRAW_STA,
      { apiId: String(apiId) }
    );
    return response.data;
  }

  // 获取分析摘要
  static async getAnalysisSummary(
    startDate: number,
    endDate: number
  ): Promise<Record<string, unknown>> {
    const response = await apiClient.get<ApiResponse<Record<string, unknown>>>(
      ENDPOINTS.ANALYSIS_SUMMARY,
      { startDate: String(startDate), endDate: String(endDate) }
    );
    return response.data;
  }

  // 获取按日期的资产变动
  static async getAssetChangeByDate(
    beginTime: number,
    endTime: number
  ): Promise<Record<string, number>> {
    const response = await apiClient.get<ApiResponse<Record<string, number>>>(
      ENDPOINTS.ASSET_CHANGE_DATE,
      { beginTime: String(beginTime), endTime: String(endTime) }
    );
    return response.data;
  }

  // 获取日历数据
  static async getCalendar(
    year: number,
    month: number,
    type: number = 1
  ): Promise<CalendarData[]> {
    // 模拟数据，实际应调用API
    const daysInMonth = new Date(year, month, 0).getDate();
    const result: CalendarData[] = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      // 随机生成盈亏数据
      const pnl = (Math.random() - 0.5) * 1000;
      result.push({
        date,
        pnl,
        count: Math.floor(Math.random() * 10),
      });
    }
    
    return result;
  }
}

// 导出实例
export const exchangeService = new ExchangeService();

// 导出独立函数
export const getExchanges = ExchangeService.getExchanges.bind(ExchangeService);
export const getAssets = ExchangeService.getAssets.bind(ExchangeService);
export const getPositions = ExchangeService.getPositions.bind(ExchangeService);
export const getOrders = ExchangeService.getOrders.bind(ExchangeService);
export const getTrendChart = ExchangeService.getTrendChart.bind(ExchangeService);
export const getDepositWithdrawStats = ExchangeService.getDepositWithdrawStats.bind(ExchangeService);
export const getCalendar = ExchangeService.getCalendar.bind(ExchangeService);
