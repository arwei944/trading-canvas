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
import { useExchangeStore } from '@trading.canvas/core';
import { useAssets, usePositions, useOrders } from '@trading.canvas/hooks';
import { SummaryCard } from '../components/SummaryCard';
import { AssetTable } from '../components/AssetTable';
import { TrendChart } from '../components/TrendChart';
import { AllocationPie } from '../components/AllocationPie';
import { PositionTable } from '../components/PositionTable';
import { OrderTable } from '../components/OrderTable';

export function DashboardPage() {
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
            label="总资产"
            value={stats?.assetsBalance ?? 0}
            prefix="$"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <SummaryCard
            label="总充值"
            value={stats?.totalDeposit ?? 0}
            prefix="$"
            suffix={`${stats?.totalDepositBtcValuation?.toFixed(4) ?? 0} BTC`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <SummaryCard
            label="总提现"
            value={stats?.totalWithdraw ?? 0}
            prefix="$"
            suffix={`${stats?.totalWithdrawBtcValuation?.toFixed(4) ?? 0} BTC`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <SummaryCard
            label="总盈亏"
            value={stats?.overallPnl ?? 0}
            prefix="$"
            color={(stats?.overallPnl ?? 0) >= 0 ? 'success' : 'error'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <SummaryCard
            label="合约盈亏"
            value={stats?.futuresPnl ?? 0}
            prefix="$"
            color={(stats?.futuresPnl ?? 0) >= 0 ? 'success' : 'error'}
          />
        </Grid>
      </Grid>

      {/* Tab 切换 */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="总览" />
          <Tab label="表现" />
          <Tab label="分析" />
        </Tabs>
      </Card>

      {/* 总览内容 */}
      {tab === 0 && (
        <Grid container spacing={3}>
          {/* 趋势图 */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>资产趋势</Typography>
                <TrendChart apiId={apiId} height={300} />
              </CardContent>
            </Card>
          </Grid>

          {/* 饼图 */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>资产分布</Typography>
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
                    全部资产 ({total})
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label="全部"
                      variant={accountType === 'ALL' ? 'filled' : 'outlined'}
                      onClick={() => setAccountType('ALL')}
                    />
                    <Chip
                      label="现货"
                      variant={accountType === 'SPOT' ? 'filled' : 'outlined'}
                      onClick={() => setAccountType('SPOT')}
                    />
                    <Chip
                      label="合约"
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
                <Typography variant="h6" sx={{ mb: 2 }}>当前合约持仓</Typography>
                {positionsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : positions.length > 0 ? (
                  <PositionTable positions={positions} />
                ) : (
                  <Typography color="text.secondary">暂无持仓</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* 委托表格 */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>当前委托</Typography>
                {ordersLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : orders.length > 0 ? (
                  <OrderTable orders={orders} />
                ) : (
                  <Typography color="text.secondary">暂无委托</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
