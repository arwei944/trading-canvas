// apps/web/src/pages/DashboardPage.tsx

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useExchangeStore } from '@trading.canvas/core';
import type { AssetBalance } from '@trading.canvas/core';
import { useAssets, usePositions, useOrders } from '@trading.canvas/hooks';
import { SummaryCard } from '../components/SummaryCard';
import { AssetTable } from '../components/AssetTable';
import { TrendChart } from '../components/TrendChart';
import { AllocationPie } from '../components/AllocationPie';
import { PositionTable } from '../components/PositionTable';
import { OrderTable } from '../components/OrderTable';
import ReactECharts from 'echarts-for-react';

function AccountTypeChart({ assets }: { assets: AssetBalance[] }) {
  const { t } = useTranslation();
  const typeMap = new Map<string, number>();
  for (const asset of assets) {
    const type = asset.type || 'SPOT';
    const current = typeMap.get(type) || 0;
    typeMap.set(type, current + asset.usdValuation);
  }

  const data = Array.from(typeMap.entries()).map(([type, value]) => ({
    name: type,
    value: Math.round(value * 100) / 100,
  }));

  const typeColors: Record<string, string> = {
    SPOT: '#10b981',
    FUTURES: '#3b82f6',
    MARGIN: '#f59e0b',
    FUNDING: '#8b5cf6',
    EARN: '#ec4899',
    LENDING: '#06b6d4',
  };

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ${c} ({d}%)',
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#999' },
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 4,
        borderColor: '#1a1a2e',
        borderWidth: 2,
      },
      label: { show: false },
      data: data.map(d => ({
        ...d,
        itemStyle: { color: typeColors[d.name] || '#666' },
      })),
    }],
  };

  if (data.length === 0) {
    return <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>{t('dashboard.noData')}</Typography>;
  }

  return <ReactECharts option={option} style={{ height: 300 }} />;
}

export function DashboardPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { exchanges, selectedApiId, selectApi, fetchExchanges } = useExchangeStore();
  const [tab, setTab] = useState(0);
  const [accountType, setAccountType] = useState<'ALL' | 'SPOT' | 'FUTURES'>('ALL');

  const apiId = id ? Number(id) : selectedApiId;

  // 获取数据
  const { assets, stats, total, isLoading: assetsLoading } = useAssets(apiId, accountType);
  const { positions, isLoading: positionsLoading } = usePositions(apiId);
  const { orders, isLoading: ordersLoading } = useOrders(apiId);

  useEffect(() => {
    fetchExchanges();
  }, [fetchExchanges]);

  return (
    <Box>
      {/* 汇总卡片 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <SummaryCard
            label={t('dashboard.totalBalance')}
            value={stats?.assetsBalance ?? 0}
            prefix="$"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <SummaryCard
            label={t('dashboard.totalDeposit')}
            value={stats?.totalDeposit ?? 0}
            prefix="$"
            suffix={`${stats?.totalDepositBtcValuation?.toFixed(4) ?? 0} BTC`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <SummaryCard
            label={t('dashboard.totalWithdraw')}
            value={stats?.totalWithdraw ?? 0}
            prefix="$"
            suffix={`${stats?.totalWithdrawBtcValuation?.toFixed(4) ?? 0} BTC`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <SummaryCard
            label={t('dashboard.totalPnl')}
            value={stats?.overallPnl ?? 0}
            prefix="$"
            color={(stats?.overallPnl ?? 0) >= 0 ? 'success' : 'error'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <SummaryCard
            label={t('dashboard.futuresPnl')}
            value={stats?.futuresPnl ?? 0}
            prefix="$"
            color={(stats?.futuresPnl ?? 0) >= 0 ? 'success' : 'error'}
          />
        </Grid>
      </Grid>

      {/* Tab 切换 */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label={t('dashboard.tabOverview')} />
          <Tab label={t('dashboard.tabPerformance')} />
          <Tab label={t('dashboard.tabAnalysis')} />
        </Tabs>
      </Card>

      {/* 总览内容 */}
      {tab === 0 && (
        <Grid container spacing={3}>
          {/* 趋势图 */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>{t('dashboard.trendChart')}</Typography>
                <TrendChart apiId={apiId} height={300} />
              </CardContent>
            </Card>
          </Grid>

          {/* 饼图 */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>{t('dashboard.assetAllocation')}</Typography>
                <AllocationPie assets={assets} />
              </CardContent>
            </Card>
          </Grid>

          {/* 资产表格 */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">
                    {t('dashboard.allAssets')} ({total})
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={t('dashboard.filterAll')}
                      variant={accountType === 'ALL' ? 'filled' : 'outlined'}
                      onClick={() => setAccountType('ALL')}
                    />
                    <Chip
                      label={t('dashboard.filterSpot')}
                      variant={accountType === 'SPOT' ? 'filled' : 'outlined'}
                      onClick={() => setAccountType('SPOT')}
                    />
                    <Chip
                      label={t('dashboard.filterFutures')}
                      variant={accountType === 'FUTURES' ? 'filled' : 'outlined'}
                      onClick={() => setAccountType('FUTURES')}
                    />
                  </Box>
                </Box>
                {assetsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <AssetTable assets={assets} />
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* 持仓表格 */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>{t('dashboard.currentPositions')}</Typography>
                {positionsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : positions.length > 0 ? (
                  <PositionTable positions={positions} />
                ) : (
                  <Typography color="text.secondary">{t('dashboard.noPositions')}</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* 委托表格 */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>{t('dashboard.currentOrders')}</Typography>
                {ordersLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : orders.length > 0 ? (
                  <OrderTable orders={orders} />
                ) : (
                  <Typography color="text.secondary">{t('dashboard.noOrders')}</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 表现内容 */}
      {tab === 1 && (
        <Grid container spacing={3}>
          {/* 盈亏概览卡片 */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">{t('dashboard.totalPnl')}</Typography>
                    <Typography variant="h5" sx={{ color: (stats?.overallPnl ?? 0) >= 0 ? 'success.main' : 'error.main', fontWeight: 'bold' }}>
                      ${(stats?.overallPnl ?? 0).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stats?.overallPnlPercent?.toFixed(2)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">{t('dashboard.change24h')}</Typography>
                    <Typography variant="h5" sx={{ color: (stats?.assetsBalance24HChange ?? 0) >= 0 ? 'success.main' : 'error.main', fontWeight: 'bold' }}>
                      ${Math.abs(stats?.assetsBalance24HChange ?? 0).toFixed(2)}
                      {(stats?.assetsBalance24HChange ?? 0) >= 0 ? '↑' : '↓'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">{t('dashboard.futuresPnl')}</Typography>
                    <Typography variant="h5" sx={{ color: (stats?.futuresPnl ?? 0) >= 0 ? 'success.main' : 'error.main', fontWeight: 'bold' }}>
                      ${(stats?.futuresPnl ?? 0).toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* 资产趋势图（更大） */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>{t('dashboard.trendChart')}</Typography>
                <TrendChart apiId={apiId} height={400} />
              </CardContent>
            </Card>
          </Grid>

          {/* 合约持仓详情 */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>{t('dashboard.positionDetails')}</Typography>
                {positionsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : positions.length > 0 ? (
                  <PositionTable positions={positions} />
                ) : (
                  <Typography color="text.secondary">{t('dashboard.noPositions')}</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 分析内容 */}
      {tab === 2 && (
        <Grid container spacing={3}>
          {/* 资产分布 */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>{t('dashboard.assetAllocation')}</Typography>
                <AllocationPie assets={assets} />
              </CardContent>
            </Card>
          </Grid>

          {/* 账户类型分布 */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>{t('dashboard.accountTypeDistribution')}</Typography>
                <AccountTypeChart assets={assets} />
              </CardContent>
            </Card>
          </Grid>

          {/* 充提统计 */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>{t('dashboard.depositWithdrawStats')}</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">{t('dashboard.totalDeposit')}</Typography>
                      <Typography variant="h6">${(stats?.totalDeposit ?? 0).toFixed(2)}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(stats?.totalDepositBtcValuation ?? 0).toFixed(4)} BTC
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">{t('dashboard.totalWithdraw')}</Typography>
                      <Typography variant="h6">${(stats?.totalWithdraw ?? 0).toFixed(2)}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(stats?.totalWithdrawBtcValuation ?? 0).toFixed(4)} BTC
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">{t('dashboard.totalBalance')}</Typography>
                      <Typography variant="h6">${(stats?.assetsBalance ?? 0).toFixed(2)}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">{t('dashboard.returnRate')}</Typography>
                      <Typography variant="h6" sx={{ color: (stats?.overallPnlPercent ?? 0) >= 0 ? 'success.main' : 'error.main' }}>
                        {(stats?.overallPnlPercent ?? 0).toFixed(2)}%
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* 当前委托 */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>{t('dashboard.currentOrders')}</Typography>
                {ordersLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : orders.length > 0 ? (
                  <OrderTable orders={orders} />
                ) : (
                  <Typography color="text.secondary">{t('dashboard.noOrders')}</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
