// apps/web/src/components/TrendChart.tsx

import { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { Box, ToggleButtonGroup, ToggleButton, Typography, CircularProgress } from '@mui/material';
import { exchangeService } from '@trading.canvas/core';
import type { TrendData } from '@trading.canvas/core';
import { useTranslation } from 'react-i18next';

interface TrendChartProps {
  apiId?: number | null;
  height?: number;
  data?: TrendData[];
}

type Interval = '24h' | '7d' | '30d' | '90d';

export function TrendChart({ apiId, height = 300, data: propData }: TrendChartProps) {
  const { t } = useTranslation();
  const [interval, setInterval] = useState<Interval>('24h');
  const [data, setData] = useState<TrendData[]>(propData || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propData) {
      setData(propData);
      return;
    }
    if (!apiId) return;

    setIsLoading(true);
    setError(null);
    exchangeService
      .getTrendChart(apiId, interval)
      .then(setData)
      .catch((err: any) => setError(err.message || t('trend.fetchFailed')))
      .finally(() => setIsLoading(false));
  }, [apiId, interval, propData, t]);

  const option = {
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const point = params[0];
        return `${point.name}<br/>${t('trend.value')}: $${point.value.toFixed(2)}`;
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map(d => d.date),
      axisLabel: {
        color: '#fff',
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => `$${value.toFixed(0)}`,
        color: '#fff',
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255,255,255,0.1)',
        },
      },
    },
    series: [
      {
        name: t('dashboard.trendChart'),
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: '#10b981',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0)' },
            ],
          },
        },
        data: data.map(d => d.value),
      },
    ],
  };

  return (
    <Box>
      {!propData && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <ToggleButtonGroup
            value={interval}
            exclusive
            onChange={(_, v) => v && setInterval(v)}
            size="small"
          >
            <ToggleButton value="24h">{t('trend.24h')}</ToggleButton>
            <ToggleButton value="7d">{t('trend.7d')}</ToggleButton>
            <ToggleButton value="30d">{t('trend.30d')}</ToggleButton>
            <ToggleButton value="90d">{t('trend.90d')}</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ textAlign: 'center', py: 4 }}>
          {error}
        </Typography>
      ) : (
        <ReactECharts option={option} style={{ height }} />
      )}
    </Box>
  );
}
