// packages/hooks/src/usePrice.ts

import { useQuery } from '@tanstack/react-query';
import { exchangeService } from '@trading.canvas/core';
import type { PriceData } from '@trading.canvas/core';

export function usePrice(enabled = true) {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['price'],
    queryFn: async () => {
      const result = await exchangeService.getBTCETHPrice();
      return {
        symbol: 'BTC',
        price: result.btcPrice,
        change24h: 0,
        changePercent24h: 0,
      } as PriceData;
    },
    enabled,
    refetchInterval: 30000,
  });

  return { price: data || null, error: error?.message || null, isLoading, refetch };
}
