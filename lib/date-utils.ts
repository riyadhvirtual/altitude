import { format } from 'date-fns';

import type { TimePeriod } from '@/types/statistics';

/**
 * Format date for different time periods in charts
 */
export const formatDateForPeriod = (
  dateStr: string,
  period: TimePeriod,
  customDays?: number
): string => {
  const date = new Date(dateStr);

  switch (period) {
    case '7d':
      return format(date, 'EEE'); // Mon, Tue, Wed
    case '30d':
      return format(date, 'MMM d'); // Jan 1, Jan 2
    case '90d':
      return format(date, 'MMM d'); // Jan 1, Feb 1
    case 'all':
      return format(date, 'MMM yyyy'); // Jan 2024
    case 'custom':
      // Handle custom periods with appropriate formatting based on length
      if (customDays && customDays <= 7) {
        return format(date, 'EEE'); // Mon, Tue, Wed for short periods
      } else if (customDays && customDays <= 90) {
        return format(date, 'MMM d'); // Jan 1, Jan 2 for medium periods
      } else {
        return format(date, 'MMM yyyy'); // Jan 2024 for long periods
      }
    default:
      return format(date, 'MMM d');
  }
};

/**
 * Format date for tooltips with full context
 */
export const formatDateForTooltip = (dateStr: string): string => {
  const date = new Date(dateStr);
  return format(date, 'EEEE, MMMM d, yyyy'); // Monday, January 1, 2024
};

/**
 * Format date for display headers
 */
export const formatDateForDisplay = (date: Date): string => {
  return format(date, 'MMMM d, yyyy'); // January 1, 2024
};

/**
 * Get date range description for period
 */
export const getDateRangeDescription = (period: TimePeriod): string => {
  const now = new Date();

  switch (period) {
    case '7d': {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return `${format(start, 'MMM d')} - ${format(now, 'MMM d, yyyy')}`;
    }
    case '30d': {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return `${format(start, 'MMM d')} - ${format(now, 'MMM d, yyyy')}`;
    }
    case '90d': {
      const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return `${format(start, 'MMM d')} - ${format(now, 'MMM d, yyyy')}`;
    }
    case 'all':
      return 'All time';
    default:
      return '';
  }
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Check if a date is within the last N days
 */
export const isWithinDays = (date: Date, days: number): boolean => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
};

/**
 * Get number of days between two dates
 */
export const getDaysBetween = (startDate: Date, endDate: Date): number => {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

/**
 * Generate array of dates between start and end
 */
export const generateDateRange = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

/**
 * Get start of day for a date
 */
export const getStartOfDay = (date: Date): Date => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
};

/**
 * Get end of day for a date
 */
export const getEndOfDay = (date: Date): Date => {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
};

/**
 * Convert date to ISO string (YYYY-MM-DD)
 */
export const toISODateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Parse ISO date string to Date object
 */
export const fromISODateString = (dateStr: string): Date => {
  return new Date(dateStr + 'T00:00:00.000Z');
};
