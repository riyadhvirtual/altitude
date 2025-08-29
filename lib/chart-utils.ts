import { useTheme } from 'next-themes';
import { useMemo } from 'react';

import type { TimePeriod } from '@/types/statistics';

/**
 * Chart theming hook that provides colors based on current theme
 */
export const useChartConfig = () => {
  const { theme } = useTheme();

  return useMemo(
    () => ({
      primary: theme === 'dark' ? '#3b82f6' : '#2563eb',
      secondary: theme === 'dark' ? '#64748b' : '#475569',
      success: theme === 'dark' ? '#22c55e' : '#16a34a',
      danger: theme === 'dark' ? '#ef4444' : '#dc2626',
      warning: theme === 'dark' ? '#f59e0b' : '#d97706',
      background: theme === 'dark' ? '#020617' : '#ffffff',
      text: theme === 'dark' ? '#cbd5e1' : '#475569',
      grid: theme === 'dark' ? '#334155' : '#e2e8f0',
      muted: theme === 'dark' ? '#64748b' : '#94a3b8',
    }),
    [theme]
  );
};

/**
 * Get trend color based on trend direction
 */
export const getTrendColor = (trend: 'up' | 'down' | 'stable'): string => {
  switch (trend) {
    case 'up':
      return '#22c55e'; // green-500
    case 'down':
      return '#ef4444'; // red-500
    case 'stable':
      return '#6b7280'; // gray-500
    default:
      return '#6b7280';
  }
};

/**
 * Get period label for display
 */
export const getPeriodLabel = (
  period: TimePeriod,
  customDays?: number
): string => {
  switch (period) {
    case '7d':
      return 'the last 7 days';
    case '30d':
      return 'the last 30 days';
    case '90d':
      return 'the last 90 days';
    case 'all':
      return 'all time';
    case 'custom':
      return customDays ? `the last ${customDays} days` : 'the custom period';
    default:
      return 'the selected period';
  }
};

/**
 * Get period display name
 */
export const getPeriodDisplayName = (
  period: TimePeriod,
  customDays?: number
): string => {
  switch (period) {
    case '7d':
      return '7 Days';
    case '30d':
      return '30 Days';
    case '90d':
      return '90 Days';
    case 'all':
      return 'All Time';
    case 'custom':
      return customDays ? `${customDays} Days` : 'Custom';
    default:
      return period;
  }
};

/**
 * Chart responsive breakpoints
 */
export const chartBreakpoints = {
  mobile: { width: 320, height: 240 },
  tablet: { width: 768, height: 280 },
  desktop: { width: 1024, height: 320 },
};

/**
 * Get responsive chart height based on screen width
 */
export const getResponsiveChartHeight = (screenWidth: number): number => {
  if (screenWidth < 768) {
    return chartBreakpoints.mobile.height;
  }
  if (screenWidth < 1024) {
    return chartBreakpoints.tablet.height;
  }
  return chartBreakpoints.desktop.height;
};

/**
 * Format large numbers with K/M suffixes
 */
export const formatLargeNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

/**
 * Generate gradient ID for charts
 */
export const generateGradientId = (
  prefix: string,
  trend?: 'up' | 'down' | 'stable'
): string => {
  return trend ? `${prefix}-${trend}` : prefix;
};

/**
 * Chart margin configurations for different chart types
 */
export const chartMargins = {
  sparkline: { top: 2, right: 2, bottom: 2, left: 2 },
  main: { top: 10, right: 30, bottom: 0, left: 0 },
  detailed: { top: 20, right: 40, bottom: 40, left: 20 },
};

/**
 * Animation configurations
 */
export const chartAnimations = {
  duration: 300,
  easing: 'ease-out',
  sparkline: { duration: 200 },
  main: { duration: 500 },
};
