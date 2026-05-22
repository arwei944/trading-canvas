// packages/hooks/src/useAssets.ts

import { useState, useEffect, useCallback } from 'react';
import { exchangeService } from '@trading.canvas/core';
import type { AssetBalance, DepositWithdrawStats, AccountType } from '@trading.canvas/core';

const POLL_INTERVAL = 5000; // 5秒轮询

export function useAssets(
  apiId: number | null,
  accountType: AccountType = 'ALL',
  page = 1,
  pageSize = 10,
  enabled = true
) {
  const [assets, setAssets] = useState<AssetBalance[]>([]);
  const [stats, setStats] = useState<DepositWithdrawStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchAssets = useCallback(async () => {
    if (!apiId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const [assetsData, statsData] = await Promise.all([
        exchangeService.getAssets(apiId, page, pageSize),
        exchangeService.getDepositWithdrawStats(apiId),
      ]);

      setAssets(assetsData[accountType]?.list || []);
      setTotal(assetsData[accountType]?.total || 0);
      setStats(statsData);
    } catch (err: any) {
      setError(err.response?.data?.msg || '获取资产失败');
    } finally {
      setIsLoading(false);
    }
  }, [apiId, accountType, page, pageSize]);

  const refetch = useCallback(async () => {
    await fetchAssets();
  }, [fetchAssets]);

  // 初始加载和轮询
  useEffect(() => {
    if (!enabled || !apiId) return;

    setIsLoading(true);
    fetchAssets().finally(() => setIsLoading(false));

    const interval = setInterval(fetchAssets, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [enabled, apiId, fetchAssets]);

  return {
    assets,
    stats,
    total,
    isLoading,
    error,
    refetch,
  };
}

// 获取资产分布（饼图用）
export function useAssetRatio(apiId: number | null, enabled = true) {
  const [assets, setAssets] = useState<AssetBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !apiId) return;

    setIsLoading(true);
    exchangeService.getAssetRatio(apiId)
      .then(setAssets)
      .finally(() => setIsLoading(false));
  }, [enabled, apiId]);

  return { assets, isLoading };
}
