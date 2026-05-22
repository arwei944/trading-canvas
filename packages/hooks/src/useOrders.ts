// packages/hooks/src/useOrders.ts

import { useQuery } from '@tanstack/react-query';
import { exchangeService } from '@trading.canvas/core';
import type { OrderData } from '@trading.canvas/core';

export function useOrders(apiId: number | null, enabled = true) {
  const { data: orders = [], isLoading, error, refetch } = useQuery({
    queryKey: ['orders', apiId],
    queryFn: () => exchangeService.getOrders(apiId!),
    enabled: enabled && !!apiId,
    refetchInterval: 10000,
  });

  return { orders, isLoading, error: error?.message || null, refetch };
}
