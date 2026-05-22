// packages/core/src/types/index.ts

// ============ 交易所类型 ============
export type ExchangeId = 1 | 2 | 3 | 4 | 6 | 8;

export interface ExchangeAPI {
  id: number;
  exchange_id: number;
  name: string;
  api_key: string;       // 后端返回空字符串（脱敏）
  secret_key: string;    // 后端返回空字符串（脱敏）
  passphrase?: string;
  star: number;          // 0 或 1
  status: number;
  created_at: number;    // 毫秒时间戳
  updated_at: number | null;    // 毫秒时间戳
}

export interface ExchangeInfo {
  exchangeName: string;
  exchangeLogo: string;
  exchangeId: ExchangeId;
  exSize: number;
  apis: ExchangeAPI[];
}

export const EXCHANGE_MAP: Record<ExchangeId, { name: string; logo: string }> = {
  1: { name: 'Binance', logo: 'https://cdn-static.hugging.com/static/hg/binance.jpg' },
  2: { name: 'OKX', logo: 'https://cdn-static.hugging.com/static/hg/okx.png' },
  3: { name: 'Bybit', logo: 'https://cdn-static.hugging.com/static/hg/bybit.png' },
  4: { name: 'Bitget', logo: 'https://cdn-static.hugging.com/static/hg/bitget.png' },
  6: { name: 'Gate.io', logo: 'https://cdn-static.hugging.com/static/hg/gate.png' },
  8: { name: 'Huobi', logo: 'https://cdn-static.hugging.com/static/hg/huobi.png' },
};

// 导出exchanges供ApiManagerPage使用
export const exchanges: Record<number, { id: number; name: string }> = {
  1: { id: 1, name: 'Binance' },
  2: { id: 2, name: 'OKX' },
  3: { id: 3, name: 'Bybit' },
  4: { id: 4, name: 'Bitget' },
  6: { id: 6, name: 'Gate.io' },
  8: { id: 8, name: 'Huobi' },
};

// ============ 资产类型 ============
export type AccountType = 'ALL' | 'SPOT' | 'MARGIN' | 'LENDING' | 'FUTURES' | 'FUNDING' | 'EARN';

export interface ExchangeDistribution {
  radio: number;
  amount: number;
  usdValuation: number;
  exApiId: number;
  exApiName: string;
  exchangeId: ExchangeId;
  exchangeName: string;
  exchangeLogo: string;
}

export interface AssetBalance {
  radio: number;
  price: number;
  asset: string;
  symbolLogo: string | null;
  amount: string;
  usdValuation: number;
  type: AccountType | null;
  updateTime: number | null;
  exApiId: number | null;
  priceChange24H: number;
  priceChangePercent24H: number;
  assetUsdChange24H: number | null;
  assetUsdChange7D: number | null;
  assetUsdChange30D: number | null;
  assetUsdChange90D: number | null;
  exAssetProApiVos?: ExchangeDistribution[];
}

export interface PagedAssets {
  total: number;
  pageSize: number;
  list: AssetBalance[];
  pageNum: number;
}

export interface AssetResponse {
  ALL: PagedAssets;
  SPOT: PagedAssets;
  MARGIN: PagedAssets;
  LENDING: PagedAssets;
  FUTURES: PagedAssets;
  FUNDING: PagedAssets;
  EARN: PagedAssets;
}

export interface DepositWithdrawStats {
  totalDeposit: number;
  totalWithdraw: number;
  totalDepositBtcValuation: number;
  totalWithdrawBtcValuation: number;
  overallPnl: number;
  overallPnlPercent: number;
  futuresPnl: number;
  assetsBalance: number;
  assetsBalance24HChange: number;
}

// ============ 持仓类型 ============
export type PositionSide = 'LONG' | 'SHORT' | 'BOTH';
export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'LIMIT' | 'MARKET' | 'STOP' | 'STOP_MARKET' | 'TAKE_PROFIT';
export type OrderStatus = 'NEW' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELED' | 'REJECTED';

export interface PositionData {
  positionId: string;
  symbol: string;
  exchangeName: string;
  side: PositionSide;
  amount: number;
  avgPrice: number;
  markPrice: number;
  liquidationPrice: number;
  unrealizedPnl: number;
  roi: number;
  leverage?: number;
  margin?: number;
  isolatedMargin?: number;
}

export interface OrderData {
  orderId: string;
  symbol: string;
  exchangeName: string;
  side: OrderSide;
  type: OrderType;
  price: number | null;
  amount: number;
  origQty: number;
  executedQty: number;
  avgPrice: number | null;
  cummulativeQuoteQty: number;
  dealCash: number;
  status: number; // 0=等待中, 1=部分成交, 2=完全成交, 3=已撤销, 4=无效
  time: number;
  createTime: number;
}

// ============ 日历类型 ============
export interface CalendarData {
  date: string;
  pnl: number;
  count: number;
}

// ============ 趋势图类型 ============
export interface TrendData {
  date: string;
  value: number;
}

// ============ 价格类型 ============
export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
}

// ============ 标签和笔记 ============
export interface TradeTag {
  id: number;
  name: string;
  color: string;
  created_at: number;
  noteCount?: number;
  tradeCount?: number;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  created_at: number;
  updated_at: number;
  tags?: TradeTag[];
}

// ============ API 响应类型 ============
export interface ApiResponse<T> {
  code: string;
  msg: string;
  data: T;
  success: boolean;
}

// ============ 历史委托类型 ============
export interface HistoryOrder {
  id: string;
  symbol: string;
  side: string;
  price: number;
  amount: number;
  cost: number;
  fee: number;
  feeCurrency: string;
  orderId: string;
  timestamp: number;
  datetime: string;
}
