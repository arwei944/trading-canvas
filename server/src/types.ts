export interface ExchangeApi {
  id: number;
  exchange_id: number;
  name: string;
  api_key: string;
  secret_key: string;
  passphrase?: string;
  star: 0 | 1;
  status: number;
  created_at: number;
  updated_at: number | null;
}

export interface ExchangeName {
  id: number;
  name: string;
  logo: string | null;
}

export interface ExchangeInfo {
  exchangeName: string;
  exchangeLogo: string;
  exchangeId: number;
  exSize: number;
  apis: ExchangeApi[];
}

export interface AssetBalance {
  radio: number;
  price: number;
  asset: string;
  symbolLogo: string | null;
  amount: string;
  usdValuation: number;
  type: string | null;
  updateTime: number | null;
  exApiId: number | null;
  priceChange24H: number;
  priceChangePercent24H: number;
  assetUsdChange24H: number | null;
  assetUsdChange7D: number | null;
  assetUsdChange30D: number | null;
  assetUsdChange90D: number | null;
}

export interface PositionData {
  positionId: string;
  symbol: string;
  exchangeName: string;
  side: string;
  amount: number;
  avgPrice: number;
  markPrice: number;
  liquidationPrice: number;
  unrealizedPnl: number;
  roi: number;
  leverage?: number;
  margin?: number;
}

export interface OrderData {
  orderId: string;
  symbol: string;
  exchangeName: string;
  side: string;
  type: string;
  price: number | null;
  amount: number;
  origQty: number;
  executedQty: number;
  avgPrice: number | null;
  cummulativeQuoteQty: number;
  dealCash: number;
  status: number;
  time: number;
  createTime: number;
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

export interface CalendarData {
  date: string;
  pnl: number;
  count: number;
}

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
