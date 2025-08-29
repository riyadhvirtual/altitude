'use client';

import React, { useMemo, useRef } from 'react';

import { FlightsChart } from '@/components/charts/flights-chart';
import { getPeriodLabel } from '@/lib/chart-utils';
import type { FlightStatistics, TimePeriod } from '@/types/statistics';

interface FlightsTabPanelProps {
  data: FlightStatistics | null;
  period: TimePeriod;
  loading?: boolean;
  customDays?: number;
}

export const FlightsTabPanel = ({
  data,
  period,
  loading = false,
  customDays,
}: FlightsTabPanelProps) => {
  const lastData = useRef<FlightStatistics | null>(null);
  if (data) {
    lastData.current = data;
  }

  const chartData = useMemo(() => {
    const raw = lastData.current ? lastData.current.dailyTrend : [];

    return raw;
  }, [data]);

  if (loading && !lastData.current) {
    return (
      <FlightsChart
        data={[]}
        period={period}
        loading={true}
        customDays={customDays}
      />
    );
  }

  return (
    <FlightsChart
      data={chartData}
      period={period}
      loading={loading}
      height={320}
      title="Flights Logged"
      description={`Daily flight activity over ${getPeriodLabel(period, customDays)}`}
      tooltipMetric="totalPireps"
      customDays={customDays}
    />
  );
};
