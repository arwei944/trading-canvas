import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  IconButton,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import { ArrowBack, Refresh } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import {
  SummaryCard,
  TrendChart,
  AssetTable,
  PositionTable,
  OrderTable,
} from '../components';

/**
 * 账户详情页面
 * 显示单个交易所账户的详细数据
 */
export function AccountDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // 模拟数据
  const accountData = {
    name: 'Binance Main',
    exchange: 'Binance',
    totalBalance: 12568.42,
    todayPnl: 234.56,
    todayPnlRate: 1.9,
    totalPnl: 3568.42,
    totalPnlRate: 39.6,
  };

  const assets = [
    { asset: 'BTC', amount: '0.5234', price: 42150.0, usdValuation: 22061.0, radio: 75.2 },
    { asset: 'ETH', amount: '8.234', price: 2280.0, usdValuation: 18773.0, radio: 64.1 },
    { asset: 'BNB', amount: '45.6', price: 312.0, usdValuation: 14227.0, radio: 48.6 },
    { asset: 'USDT', amount: '5000', price: 1.0, usdValuation: 5000.0, radio: 17.1 },
  ];

  const positions = [
    {
      positionId: '1',
      exchangeName: 'Binance',
      symbol: 'BTCUSDT',
      side: 'LONG',
      amount: 0.1,
      avgPrice: 41500,
      markPrice: 42150,
      liquidationPrice: 38000,
      unrealizedPnl: 65.0,
      roi: 0.0157,
      leverage: 10,
      isolatedMargin: 4150,
    },
    {
      positionId: '2',
      exchangeName: 'Binance',
      symbol: 'ETHUSDT',
      side: 'SHORT',
      amount: 2.0,
      avgPrice: 2350,
      markPrice: 2280,
      liquidationPrice: 2600,
      unrealizedPnl: 140.0,
      roi: 0.0298,
      leverage: 5,
      isolatedMargin: 4700,
    },
  ];

  const orders = [
    {
      orderId: '1',
      exchangeName: 'Binance',
      symbol: 'BTCUSDT',
      side: 'BUY',
      type: 'LIMIT',
      price: 41500,
      amount: 0.1,
      executedQty: 0.1,
      avgPrice: 41500,
      cummulativeQuoteQty: 4150,
      status: 2,
      time: Date.now() - 3600000,
      createTime: Date.now() - 3600000,
    },
    {
      orderId: '2',
      exchangeName: 'Binance',
      symbol: 'ETHUSDT',
      side: 'SELL',
      type: 'LIMIT',
      price: 2350,
      amount: 2.0,
      executedQty: 2.0,
      avgPrice: 2350,
      cummulativeQuoteQty: 4700,
      status: 2,
      time: Date.now() - 7200000,
      createTime: Date.now() - 7200000,
    },
  ];

  const trendData = [
    { date: '2024-01-01', value: 8500 },
    { date: '2024-01-08', value: 9200 },
    { date: '2024-01-15', value: 8800 },
    { date: '2024-01-22', value: 10500 },
    { date: '2024-01-29', value: 11200 },
    { date: '2024-02-05', value: 10800 },
    { date: '2024-02-12', value: 12000 },
  ];

  return (
    <Box>
      {/* 头部 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/dashboard')}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4">
              {accountData.name}
            </Typography>
            <Chip label={accountData.exchange} size="small" />
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
        >
          {t('accountDetail.refresh')}
        </Button>
      </Box>

      {/* 统计卡片 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <SummaryCard
            title={t('accountDetail.accountBalance')}
            value={`$${accountData.totalBalance.toFixed(2)}`}
            color="primary"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <SummaryCard
            title={t('accountDetail.todayPnl')}
            value={`$${accountData.todayPnl >= 0 ? '+' : ''}${accountData.todayPnl.toFixed(2)}`}
            change={`${accountData.todayPnlRate >= 0 ? '+' : ''}${accountData.todayPnlRate.toFixed(2)}%`}
            color={accountData.todayPnl >= 0 ? 'success' : 'error'}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <SummaryCard
            title={t('accountDetail.totalPnl')}
            value={`$${accountData.totalPnl >= 0 ? '+' : ''}${accountData.totalPnl.toFixed(2)}`}
            change={`${accountData.totalPnlRate >= 0 ? '+' : ''}${accountData.totalPnlRate.toFixed(2)}%`}
            color={accountData.totalPnl >= 0 ? 'success' : 'error'}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <SummaryCard
            title={t('accountDetail.positionCount')}
            value={positions.length.toString()}
            subtitle={t('accountDetail.positionUnit')}
          />
        </Grid>
      </Grid>

      {/* 趋势图 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('dashboard.trendChart')}
          </Typography>
          <Box sx={{ height: 300 }}>
            <TrendChart data={trendData} />
          </Box>
        </CardContent>
      </Card>

      {/* 标签页 */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
          >
            <Tab label={t('accountDetail.tabAssets')} />
            <Tab label={t('accountDetail.tabPositions')} />
            <Tab label={t('accountDetail.tabOrders')} />
          </Tabs>
        </Box>
        <CardContent>
          {activeTab === 0 && <AssetTable assets={assets} />}
          {activeTab === 1 && <PositionTable positions={positions} />}
          {activeTab === 2 && <OrderTable orders={orders} />}
        </CardContent>
      </Card>
    </Box>
  );
}
