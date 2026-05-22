// packages/hooks/src/usePrice.ts

import { useState, useEffect, useCallback } from 'react';
import { exchangeService } from '@trading.canvas/core';
import type { PriceData } from '@trading.canvas/core';

const POLL_INTERVAL = 5000; // 5秒

export function usePrice(enabled = true) {
  const [price, setPrice] = useState<PriceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPrice = useCallback(async () => {
    try {
      const data = await exchangeService.getBTCETHPrice();
      setPrice({
        symbol: 'BTC',
        price: data.btcPrice,
        change24h: 0,
        changePercent24h: 0,
      });
      setError(null);
    } catch (err) {
      setError('获取价格失败');
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    setIsLoading(true);
    fetchPrice().finally(() => setIsLoading(false));

    const interval = setInterval(fetchPrice, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [enabled, fetchPrice]);

  return { price, error, isLoading, refetch: fetchPrice };
}
