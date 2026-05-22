// packages/hooks/src/useCalendar.ts

import { useState, useEffect } from 'react';
import { exchangeService } from '@trading.canvas/core';
import type { CalendarData } from '@trading.canvas/core';

interface UseCalendarParams {
  year: number;
  month: number;
  type?: number; // 0=周, 1=月, 2=年
}

export function useCalendar(params: UseCalendarParams, enabled = true) {
  const [data, setData] = useState<CalendarData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const fetchCalendar = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await exchangeService.getCalendar(
          params.year,
          params.month,
          params.type || 1
        );
        setData(result);
      } catch (err: any) {
        setError(err.response?.data?.msg || '获取日历数据失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendar();
  }, [params.year, params.month, params.type, enabled]);

  return {
    data,
    isLoading,
    error,
  };
}
