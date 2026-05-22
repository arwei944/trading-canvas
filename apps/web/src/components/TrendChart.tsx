// apps/web/src/components/TrendChart.tsx

import { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { Box, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { exchangeService } from '@trading.canvas/core';
import type { TrendData } from '@trading.canvas/core';

interface TrendChartProps {
  apiId?: number | null;
  height?: number;
  data?: TrendData[];
}

type Interval = '24h' | '7d' | '30d' | '90d';

export function TrendChart({ apiId, height = 300, data: propData }: TrendChartProps) {
  const [interval, setInterval] = useState<Interval>('24h');
  const [data, setData] = useState<TrendData[]>(propData || []);

  useEffect(() => {
    if (propData) {
      setData(propData);
      return;
    }
    if (!apiId) return;

    exchangeService.getTrendChart(apiId, interval).then(setData);
  }, [apiId, interval, propData]);

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
        return `${point.name}<br/>价值: $${point.value.toFixed(2)}`;
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
        name: '资产价值',
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
            <ToggleButton value="24h">24小时</ToggleButton>
            <ToggleButton value="7d">7天</ToggleButton>
            <ToggleButton value="30d">30天</ToggleButton>
            <ToggleButton value="90d">90天</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}
      <ReactECharts option={option} style={{ height }} />
    </Box>
  );
}
