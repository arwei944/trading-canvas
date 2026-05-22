import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Paper,
} from '@mui/material';
import ReactECharts from 'echarts-for-react';
import { useTranslation } from 'react-i18next';
import { useCalendar } from '@trading.canvas/hooks';
import { ChartSkeleton } from '../components/Skeleton';

export interface CalendarPageProps {
  year?: number;
  month?: number;
}

/**
 * 盈亏日历页面
 * 显示每日的盈亏数据，以热力图形式展示
 */
export function CalendarPage({ year, month }: CalendarPageProps) {
  const { t } = useTranslation();
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(year || currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(month || currentDate.getMonth() + 1);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  const { data: calendarData, isLoading } = useCalendar({
    year: selectedYear,
    month: selectedMonth,
    type: timeRange === 'week' ? 0 : timeRange === 'month' ? 1 : 2,
  });

  // 统计数据
  const stats = useMemo(() => {
    if (!calendarData) {
      return {
        totalPnl: 0,
        winDays: 0,
        lossDays: 0,
        winRate: 0,
        bestDay: { date: '', pnl: 0 },
        worstDay: { date: '', pnl: 0 },
      };
    }

    const totalPnl = calendarData.reduce((sum, day) => sum + Number(day.pnl || 0), 0);
    const winDays = calendarData.filter(day => Number(day.pnl || 0) > 0).length;
    const lossDays = calendarData.filter(day => Number(day.pnl || 0) < 0).length;
    const totalDays = calendarData.length || 1;
    const winRate = (winDays / totalDays) * 100;

    const sorted = [...calendarData].sort((a, b) =>
      Number(b.pnl || 0) - Number(a.pnl || 0)
    );

    return {
      totalPnl,
      winDays,
      lossDays,
      winRate,
      bestDay: sorted[0] || { date: '', pnl: 0 },
      worstDay: sorted[sorted.length - 1] || { date: '', pnl: 0 },
    };
  }, [calendarData]);

  // 日历热力图配置
  const calendarOption = useMemo(() => {
    if (!calendarData || calendarData.length === 0) {
      return {};
    }

    const heatmapData = calendarData.map(day => [
      day.date,
      Number(day.pnl || 0),
    ]);

    return {
      tooltip: {
        formatter: (params: any) => {
          return `${params.value[0]}<br/>${t('calendar.pnlLabel')}: $${params.value[1].toFixed(2)}`;
        },
      },
      visualMap: {
        min: Math.min(...calendarData.map(d => Number(d.pnl || 0))),
        max: Math.max(...calendarData.map(d => Number(d.pnl || 0))),
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 20,
        inRange: {
          color: ['#ff6b6b', '#ff8787', '#ffa8a8', '#fff', '#a8e6cf', '#56ab2f'],
        },
        textStyle: {
          color: '#fff',
        },
      },
      calendar: {
        top: 80,
        left: 50,
        right: 30,
        cellSize: ['auto', 20],
        range: [`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`],
        itemStyle: {
          borderWidth: 0.5,
          borderColor: '#333',
        },
        yearLabel: { show: false },
        dayLabel: {
          color: '#fff',
          fontSize: 10,
        },
        monthLabel: {
          color: '#fff',
          fontSize: 11,
        },
        splitLine: { show: false },
      },
      series: [
        {
          type: 'heatmap',
          coordinateSystem: 'calendar',
          data: heatmapData,
        },
      ],
    };
  }, [calendarData, selectedYear, selectedMonth, t]);

  // 每日盈亏趋势图
  const trendOption = useMemo(() => {
    if (!calendarData || calendarData.length === 0) {
      return {};
    }

    const dates = calendarData.map(d => d.date);
    const values = calendarData.map(d => Number(d.pnl || 0));

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const p = params[0];
          return `${p.axisValue}<br/>${t('calendar.pnlLabel')}: $${p.value.toFixed(2)}`;
        },
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          color: '#fff',
          rotate: 45,
        },
        axisLine: { lineStyle: { color: '#333' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#fff',
          formatter: (value: number) => `$${value.toFixed(0)}`,
        },
        axisLine: { lineStyle: { color: '#333' } },
        splitLine: { lineStyle: { color: '#222' } },
      },
      series: [
        {
          type: 'bar',
          data: values,
          itemStyle: {
            color: (params: any) =>
              params.value >= 0 ? '#56ab2f' : '#ff6b6b',
          },
          barWidth: '60%',
        },
      ],
      graphic: calendarData.length === 0 ? [
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
    };
  }, [calendarData, t]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t('calendar.title')}
      </Typography>

      {/* 控制栏 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <ToggleButtonGroup
              value={timeRange}
              exclusive
              onChange={(_, value) => value && setTimeRange(value)}
              size="small"
            >
              <ToggleButton value="week">{t('calendar.thisWeek')}</ToggleButton>
              <ToggleButton value="month">{t('calendar.thisMonth')}</ToggleButton>
              <ToggleButton value="year">{t('calendar.thisYear')}</ToggleButton>
            </ToggleButtonGroup>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                style={{
                  backgroundColor: '#1e1e1e',
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: 4,
                  padding: '4px 8px',
                }}
              >
                {(() => {
                  const currentYear = new Date().getFullYear();
                  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
                  return years.map(y => (
                    <option key={y} value={y}>{t('calendar.year', { count: y })}</option>
                  ));
                })()}
              </select>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                style={{
                  backgroundColor: '#1e1e1e',
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: 4,
                  padding: '4px 8px',
                }}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{t('calendar.month', { count: m })}</option>
                ))}
              </select>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 统计卡片 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                {t('calendar.totalPnl')}
              </Typography>
              <Typography
                variant="h5"
                color={stats.totalPnl >= 0 ? 'success.main' : 'error.main'}
              >
                {stats.totalPnl >= 0 ? '+' : ''}${stats.totalPnl.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                {t('calendar.winDays')}
              </Typography>
              <Typography variant="h5" color="success.main">
                {stats.winDays}{t('calendar.days')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                {t('calendar.lossDays')}
              </Typography>
              <Typography variant="h5" color="error.main">
                {stats.lossDays}{t('calendar.days')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                {t('calendar.winRate')}
              </Typography>
              <Typography variant="h5">
                {stats.winRate.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                {t('calendar.bestWorst')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                <Chip
                  label={`+$${stats.bestDay.pnl.toFixed(0)}`}
                  size="small"
                  color="success"
                />
                <Chip
                  label={`$${stats.worstDay.pnl.toFixed(0)}`}
                  size="small"
                  color="error"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 日历热力图 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('calendar.heatmap')}
          </Typography>
          <Box sx={{ height: 300 }}>
            {isLoading ? (
              <ChartSkeleton height={300} />
            ) : (
              <ReactECharts
                option={calendarOption}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* 每日盈亏柱状图 */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('calendar.dailyPnl')}
          </Typography>
          <Box sx={{ height: 300 }}>
            {isLoading ? (
              <ChartSkeleton height={300} />
            ) : (
              <ReactECharts
                option={trendOption}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
