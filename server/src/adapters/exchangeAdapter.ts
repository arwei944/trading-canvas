import ccxt from 'ccxt';
import type { ExchangeApi } from '../types.js';

// 交易所 ID 到 ccxt 类名的映射
const EXCHANGE_MAP: Record<number, string> = {
  1: 'binance',
  2: 'okx',
  3: 'bybit',
  4: 'bitget',
  6: 'gateio',
  8: 'huobi',
};

export function createExchange(api: ExchangeApi): ccxt.Exchange {
  const exchangeName = EXCHANGE_MAP[api.exchange_id];
  if (!exchangeName) {
    throw new Error(`Unsupported exchange: ${api.exchange_id}`);
  }

  const ExchangeClass = (ccxt as any)[exchangeName];
  if (!ExchangeClass) {
    throw new Error(`ccxt exchange not found: ${exchangeName}`);
  }

  const config: Record<string, any> = {
    apiKey: api.api_key,
    secret: api.secret_key,
    enableRateLimit: true,
    timeout: 60000,
    options: { defaultType: 'spot' },
  };

  // OKX 需要 passphrase
  if (api.passphrase && ['okx'].includes(exchangeName)) {
    config.password = api.passphrase;
  }

  return new ExchangeClass(config);
}

export function getExchangeName(exchangeId: number): string {
  return EXCHANGE_MAP[exchangeId] || 'unknown';
}
