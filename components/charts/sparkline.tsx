'use client';

import { Line, LineChart, ResponsiveContainer } from 'recharts';

import { getTrendColor } from '@/lib/chart-utils';

export interface SparklineProps {
  data: number[];
  trend: 'up' | 'down' | 'stable';
  width?: number;
  height?: number;
  strokeWidth?: number;
  animated?: boolean;
}

export const Sparkline = ({
  data,
  trend,
  width,
  height = 48,
  strokeWidth = 1.5,
  animated = true,
}: SparklineProps) => {
  const strokeColor = getTrendColor(trend);
  const chartData = data.map((value, index) => ({ value, index }));

  if (data.length === 0) {
    return (
      <div
        style={width ? { width, height } : { height }}
        className="flex items-center justify-center text-muted-foreground w-full"
      >
        <span className="text-xs">No data</span>
      </div>
    );
  }

  return (
    <div
      style={width ? { width, height } : { height }}
      className={width ? '' : 'w-full'}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
        >
          <Line
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            dot={false}
            activeDot={false}
            animationDuration={animated ? 300 : 0}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
