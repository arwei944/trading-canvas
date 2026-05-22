// packages/hooks/src/useAssets.ts

import { useQuery } from '@tanstack/react-query';
import { exchangeService } from '@trading.canvas/core';
import type { AssetBalance, DepositWithdrawStats, AccountType } from '@trading.canvas/core';

export function useAssets(
  apiId: number | null,
  accountType: AccountType = 'ALL',
  page = 1,
  pageSize = 10,
  enabled = true
) {
  const assetsQuery = useQuery({
    queryKey: ['assets', apiId, accountType, page, pageSize],
    queryFn: () => exchangeService.getAssets(apiId!, page, pageSize),
    enabled: enabled && !!apiId,
    refetchInterval: 10000, // 10秒自动刷新
  });

  const statsQuery = useQuery({
    queryKey: ['depositStats', apiId],
    queryFn: () => exchangeService.getDepositWithdrawStats(apiId!),
    enabled: enabled && !!apiId,
    refetchInterval: 30000, // 30秒刷新统计
  });

  const assets = assetsQuery.data?.[accountType]?.list || [];
  const total = assetsQuery.data?.[accountType]?.total || 0;
  const stats = statsQuery.data || null;
  const isLoading = assetsQuery.isLoading || statsQuery.isLoading;
  const error = assetsQuery.error?.message || statsQuery.error?.message || null;

  return {
    assets,
    stats,
    total,
    isLoading,
    error,
    refetch: () => { assetsQuery.refetch(); statsQuery.refetch(); },
  };
}

// 获取资产分布（饼图用）
export function useAssetRatio(apiId: number | null, enabled = true) {
  const { data = [], isLoading } = useQuery({
    queryKey: ['assetRatio', apiId],
    queryFn: async () => {
      const result = await exchangeService.getAssetRatio(apiId!);
      return result.ALL || [];
    },
    enabled: enabled && !!apiId,
    refetchInterval: 15000,
  });

  return { assets: data, isLoading };
}
