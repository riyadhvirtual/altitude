'use client';

import React, { useMemo, useRef } from 'react';

import { FlightsChart } from '@/components/charts/flights-chart';
import { getPeriodLabel } from '@/lib/chart-utils';
import type { PilotStatistics, TimePeriod } from '@/types/statistics';

interface PilotsTabPanelProps {
  data: PilotStatistics | null;
  period: TimePeriod;
  loading?: boolean;
  customDays?: number; // Add customDays prop
}

export const PilotsTabPanel = ({
  data,
  period,
  loading = false,
  customDays,
}: PilotsTabPanelProps) => {
  const lastData = useRef<PilotStatistics | null>(null);
  if (data) {
    lastData.current = data;
  }

  const chartData = useMemo(() => {
    const raw = lastData.current
      ? lastData.current.registrationTrend.map((d) => ({
          ...d,
          totalPireps: d.newPilots,
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
      title="New Pilot Registrations"
      description={`Daily pilot registrations over ${getPeriodLabel(period, customDays)}`}
      tooltipMetric="newPilots"
      customDays={customDays}
    />
  );
};
