'use client';

import React, { useMemo, useRef } from 'react';

import { FlightsChart } from '@/components/charts/flights-chart';
import { getPeriodLabel } from '@/lib/chart-utils';
import type { FlightHoursStatistics, TimePeriod } from '@/types/statistics';

interface FlightHoursTabPanelProps {
  data: FlightHoursStatistics | null;
  period: TimePeriod;
  loading?: boolean;
  customDays?: number; // Add customDays prop
}

export const FlightHoursTabPanel = ({
  data,
  period,
  loading = false,
  customDays,
}: FlightHoursTabPanelProps) => {
  const lastData = useRef<FlightHoursStatistics | null>(null);
  if (data) {
    lastData.current = data;
  }

  const chartData = useMemo(() => {
    const raw = lastData.current
      ? lastData.current.hoursTrend.map((d) => ({
          ...d,
          totalPireps: d.totalFlightTime / 60,
        }))
      : [];

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
      loading={false}
      height={320}
      title="Flight Hours"
      description={`Daily flight hours over ${getPeriodLabel(period, customDays)}`}
      tooltipMetric="totalFlightTime"
      customDays={customDays}
    />
  );
};
