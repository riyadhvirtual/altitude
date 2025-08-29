'use client';

import { useCallback, useEffect, useState } from 'react';

import { getStatisticsData } from '@/actions/statistics/statistics';
import type {
  StatisticsData,
  StatisticsTab,
  StatisticsTabsData,
  TimePeriod,
} from '@/types/statistics';

interface DashboardState {
  selectedPeriod: TimePeriod;
  customDays?: number;
  stats: StatisticsData | null;
  loading: boolean;
  error: string | null;
  lastFetch: Date | null;
}

interface UseStatisticsReturn extends DashboardState {
  changePeriod: (period: TimePeriod, customDays?: number) => void;
  retry: () => void;
  isStale: boolean;
}

interface TabsDashboardState {
  selectedPeriod: TimePeriod;
  selectedTab: StatisticsTab;
  customDays?: number;
  stats: StatisticsTabsData | null;
  loading: boolean;
  error: string | null;
  lastFetch: Date | null;
  tabsLoading: Record<StatisticsTab, boolean>;
}

interface UseStatisticsTabsReturn extends TabsDashboardState {
  changePeriod: (period: TimePeriod, customDays?: number) => void;
  changeTab: (tab: StatisticsTab) => void;
  retry: () => void;
  isStale: boolean;
}

export const useStatistics = (
  initialPeriod: TimePeriod = '7d'
): UseStatisticsReturn => {
  const [state, setState] = useState<DashboardState>({
    selectedPeriod: initialPeriod,
    customDays: undefined,
    stats: null,
    loading: true,
    error: null,
    lastFetch: null,
  });

  const fetchStats = useCallback(
    async (period: TimePeriod, customDays?: number) => {
      setState((prev) => ({
        ...prev,
        // Only show loading if we don't have any data yet (initial load) or if there's an error
        loading: prev.stats === null || prev.error !== null,
        error: null,
      }));

      try {
        const data = await getStatisticsData(period, customDays);
        setState((prev) => ({
          ...prev,
          stats: data,
          loading: false,
          lastFetch: new Date(),
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to load statistics',
          loading: false,
        }));
      }
    },
    []
  );

  useEffect(() => {
    fetchStats(state.selectedPeriod, state.customDays);
  }, [state.selectedPeriod, state.customDays, fetchStats]);

  const changePeriod = useCallback(
    (period: TimePeriod, customDays?: number) => {
      setState((prev) => ({ ...prev, selectedPeriod: period, customDays }));
    },
    []
  );

  const retry = useCallback(() => {
    fetchStats(state.selectedPeriod, state.customDays);
  }, [state.selectedPeriod, state.customDays, fetchStats]);

  // Check if data is stale (older than 5 minutes)
  const isStale = state.lastFetch
    ? Date.now() - state.lastFetch.getTime() > 5 * 60 * 1000
    : false;

  return {
    ...state,
    changePeriod,
    retry,
    isStale,
  };
};

export const useStatisticsTabs = (
  currentPeriod: TimePeriod = '7d',
  initialTab: StatisticsTab = 'pilots',
  customDaysParam?: number
): UseStatisticsTabsReturn => {
  const [state, setState] = useState<TabsDashboardState>({
    selectedPeriod: currentPeriod,
    selectedTab: initialTab,
    customDays: customDaysParam,
    stats: null,
    loading: true,
    error: null,
    lastFetch: null,
    tabsLoading: {
      pilots: false,
      flights: false,
      'flight-hours': false,
      'active-pilots': false,
    },
  });

  // Update period when prop changes
  useEffect(() => {
    if (
      currentPeriod !== state.selectedPeriod ||
      customDaysParam !== state.customDays
    ) {
      setState((prev) => ({
        ...prev,
        selectedPeriod: currentPeriod,
        customDays: customDaysParam,
      }));
    }
  }, [currentPeriod, customDaysParam, state.selectedPeriod, state.customDays]);

  const fetchTabsStats = useCallback(
    async (period: TimePeriod, customDays?: number) => {
      setState((prev) => ({
        ...prev,
        loading: prev.stats === null || prev.error !== null,
        error: null,
      }));

      try {
        const data = await getStatisticsData(period, customDays);

        setState((prev) => ({
          ...prev,
          stats: data,
          loading: false,
          lastFetch: new Date(),
          tabsLoading: {
            pilots: false,
            flights: false,
            'flight-hours': false,
            'active-pilots': false,
          },
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to load statistics',
          loading: false,
        }));
      }
    },
    []
  );

  useEffect(() => {
    fetchTabsStats(state.selectedPeriod, state.customDays);
  }, [state.selectedPeriod, state.customDays, fetchTabsStats]);

  const changePeriod = useCallback(
    (period: TimePeriod, customDaysValue?: number) => {
      setState((prev) => ({
        ...prev,
        selectedPeriod: period,
        customDays: customDaysValue,
      }));
    },
    []
  );

  const changeTab = useCallback((tab: StatisticsTab) => {
    setState((prev) => ({
      ...prev,
      selectedTab: tab,
    }));
  }, []);

  const retry = useCallback(() => {
    fetchTabsStats(state.selectedPeriod, state.customDays);
  }, [state.selectedPeriod, state.customDays, fetchTabsStats]);

  // Check if data is stale (older than 5 minutes)
  const isStale = state.lastFetch
    ? Date.now() - state.lastFetch.getTime() > 5 * 60 * 1000
    : false;

  return {
    ...state,
    changePeriod,
    changeTab,
    retry,
    isStale,
  };
};
