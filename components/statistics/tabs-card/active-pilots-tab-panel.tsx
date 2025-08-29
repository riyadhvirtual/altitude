'use client';

import React, { useMemo, useRef } from 'react';

import { FlightsChart } from '@/components/charts/flights-chart';
import { getPeriodLabel } from '@/lib/chart-utils';
import type { ActivePilotStatistics, TimePeriod } from '@/types/statistics';

interface ActivePilotsTabPanelProps {
  data: ActivePilotStatistics | null;
  period: TimePeriod;
  loading?: boolean;
  customDays?: number; // Add customDays prop
}

export const ActivePilotsTabPanel = ({
  data,
  period,
  loading = false,
  customDays,
}: ActivePilotsTabPanelProps) => {
  const lastData = useRef<ActivePilotStatistics | null>(null);
  if (data) {
    lastData.current = data;
  }

  const chartData = useMemo(() => {
    const raw = lastData.current
      ? lastData.current.dailyTrend.map((d) => ({
          ...d,
          totalPireps: d.activePilots,
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
      loading={loading}
      height={320}
      title="Active Pilots"
      description={`Daily active pilots over ${getPeriodLabel(period, customDays)}`}
      tooltipMetric="activePilots"
      customDays={customDays}
    />
  );
};
