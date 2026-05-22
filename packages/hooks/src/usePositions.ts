// packages/hooks/src/usePositions.ts

import { useState, useEffect, useCallback } from 'react';
import { exchangeService } from '@trading.canvas/core';
import type { PositionData } from '@trading.canvas/core';

const POLL_INTERVAL = 5000;

export function usePositions(apiId: number | null, enabled = true) {
  const [positions, setPositions] = useState<PositionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!apiId) return;
    try {
      const data = await exchangeService.getPositions(apiId);
      setPositions(data);
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

  return { positions, isLoading, error, refetch: fetch };
}
