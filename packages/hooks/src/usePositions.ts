// packages/hooks/src/usePositions.ts

import { useQuery } from '@tanstack/react-query';
import { exchangeService } from '@trading.canvas/core';
import type { PositionData } from '@trading.canvas/core';

export function usePositions(apiId: number | null, enabled = true) {
  const { data: positions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['positions', apiId],
    queryFn: () => exchangeService.getPositions(apiId!),
    enabled: enabled && !!apiId,
    refetchInterval: 10000,
  });

  return { positions, isLoading, error: error?.message || null, refetch };
}
