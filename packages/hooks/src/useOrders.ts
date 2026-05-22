// packages/hooks/src/useOrders.ts

import { useState, useEffect, useCallback } from 'react';
import { exchangeService } from '@trading.canvas/core';
import type { OrderData } from '@trading.canvas/core';

const POLL_INTERVAL = 5000;

export function useOrders(apiId: number | null, enabled = true) {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!apiId) return;
    try {
      const data = await exchangeService.getOrders(apiId);
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    }
  }, [apiId]);

  useEffect(() => {
    if (!enabled || !apiId) return;

    setIsLoading(true);
    fetch().finally(() => setIsLoading(false));

    const interval = setInterval(fetch, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [enabled, apiId, fetch]);

  return { orders, isLoading, error, refetch: fetch };
}
