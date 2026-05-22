// packages/hooks/src/useCalendar.ts

import { useQuery } from '@tanstack/react-query';
import { exchangeService } from '@trading.canvas/core';
import type { CalendarData } from '@trading.canvas/core';

interface UseCalendarParams {
  year: number;
  month: number;
  type?: number; // 0=周, 1=月, 2=年
}

export function useCalendar(params: UseCalendarParams, enabled = true) {
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['calendar', params.year, params.month, params.type],
    queryFn: () => exchangeService.getCalendar(params.year, params.month, params.type || 1),
    enabled,
  });

  return {
    data,
    isLoading,
    error: error?.message || null,
  };
}
