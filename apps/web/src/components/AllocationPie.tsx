import React, { useMemo } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import { AssetBalance } from '@trading.canvas/core';
import { useTranslation } from 'react-i18next';

export interface AllocationPieProps {
  assets: AssetBalance[];
  loading?: boolean;
}

/**
 * 资产分布饼图组件
 * 使用ECharts渲染交互式饼图
 */
export function AllocationPie({ assets, loading }: AllocationPieProps) {
  const { t } = useTranslation();

  // 处理数据，只显示Top 10，其余归为"其他"
  const chartData = useMemo(() => {
    if (!assets || assets.length === 0) return [];

    // 按市值排序
    const sorted = [...assets]
      .filter(a => Number(a.usdValuation) > 0)
      .sort((a, b) => Number(b.usdValuation) - Number(a.usdValuation));

    // 取前10
    const top10 = sorted.slice(0, 10);
    const rest = sorted.slice(10);

    // 计算"其他"的总额
    const otherValue = rest.reduce((sum, a) => sum + Number(a.usdValuation || 0), 0);

    const result = top10.map(asset => ({
      name: asset.asset,
      value: Number(asset.usdValuation || 0),
    }));

    if (otherValue > 0) {
      result.push({
        name: t('common.other'),
        value: otherValue,
      });
    }

    return result;
  }, [assets, t]);

  // 颜色配置
  const colors = [
    '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
    '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#b5b5b5'
  ];

  const option = useMemo(() => ({
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.name}<br/>
          $${params.value.toFixed(2)}<br/>
          ${params.percent.toFixed(1)}%`;
      },
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: {
        color: '#fff',
      },
    },
    series: [
      {
        name: t('dashboard.assetAllocation'),
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#1e1e1e',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#fff',
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        labelLine: {
          show: false,
        },
        data: chartData,
        color: colors,
      },
    ],
    graphic: chartData.length === 0 ? [
      {
        type: 'text',
        left: 'center',
        top: 'middle',
        style: {
          text: t('common.noData'),
          textAlign: 'center',
          fill: '#666',
          fontSize: 14,
        },
      },
    ] : undefined,
  }), [chartData, t]);

  // 计算总市值
  const totalValue = useMemo(() => {
    if (!assets) return 0;
    return assets.reduce((sum, a) => sum + Number(a.usdValuation || 0), 0);
  }, [assets]);

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography>{t('common.loading')}</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('dashboard.assetAllocation')}
        </Typography>
        <Typography variant="h4" color="primary" gutterBottom>
          ${totalValue.toFixed(2)}
        </Typography>
        <Box sx={{ height: 300 }}>
          <ReactECharts
            option={option}
            style={{ height: '100%', width: '100%' }}
            opts={{ renderer: 'svg' }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
