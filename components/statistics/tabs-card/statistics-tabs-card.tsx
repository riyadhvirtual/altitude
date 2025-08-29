'use client';

import { Clock, Plane, UserCheck, Users } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStatisticsTabs } from '@/hooks/use-statistics';
import type { StatisticsTab, TimePeriod } from '@/types/statistics';

import { ActivePilotsTabPanel } from './active-pilots-tab-panel';
import { FlightHoursTabPanel } from './flight-hours-tab-panel';
import { FlightsTabPanel } from './flights-tab-panel';
import { PilotsTabPanel } from './pilots-tab-panel';

interface StatisticsTabsCardProps {
  period: TimePeriod;
  customDays?: number;
  initialTab?: StatisticsTab;
}

const TabIcon = ({ tab }: { tab: StatisticsTab }) => {
  const iconProps = { className: 'w-4 h-4' };

  switch (tab) {
    case 'pilots':
      return <Users {...iconProps} />;
    case 'flights':
      return <Plane {...iconProps} />;
    case 'flight-hours':
      return <Clock {...iconProps} />;
    case 'active-pilots':
      return <UserCheck {...iconProps} />;
    default:
      return null;
  }
};

const TabLabel = ({ tab }: { tab: StatisticsTab }) => {
  switch (tab) {
    case 'pilots':
      return 'Pilots';
    case 'flights':
      return 'Flights';
    case 'flight-hours':
      return 'Flight Hours';
    case 'active-pilots':
      return 'Active Pilots';
    default:
      return tab;
  }
};

const TabsSkeleton = () => (
  <div className="space-y-8">
    <div className="py-4">
      <div className="flex space-x-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-md" />
        ))}
      </div>
    </div>

    <div className="rounded-md bg-panel shadow-sm border-0 p-6">
      <Skeleton className="h-80 w-full rounded-md" />
    </div>
  </div>
);

const ErrorState = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) => (
  <div className="rounded-md bg-panel shadow-sm border-0 p-6">
    <div className="flex flex-col items-center text-center space-y-4">
      <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
        <svg
          className="w-6 h-6 text-red-600 dark:text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
          Failed to Load Statistics
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
      </div>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
      >
        Try Again
      </button>
    </div>
  </div>
);

export const StatisticsTabsCard = ({
  period,
  customDays,
  initialTab = 'pilots',
}: StatisticsTabsCardProps) => {
  const { selectedTab, stats, loading, error, tabsLoading, changeTab, retry } =
    useStatisticsTabs(period, initialTab, customDays);

  if (error) {
    return <ErrorState error={error} onRetry={retry} />;
  }

  if (loading || !stats) {
    return <TabsSkeleton />;
  }

  const tabs: StatisticsTab[] = [
    'pilots',
    'flights',
    'flight-hours',
    'active-pilots',
  ];

  return (
    <div className="space-y-2">
      <div className="pt-1 pb-2">
        <Tabs
          value={selectedTab}
          onValueChange={(value) => changeTab(value as StatisticsTab)}
        >
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="flex items-center gap-2"
              >
                <TabIcon tab={tab} />
                <span className="hidden sm:inline">
                  <TabLabel tab={tab} />
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <Tabs value={selectedTab} className="w-full">
        <TabsContent value="pilots" className="mt-0">
          <PilotsTabPanel
            data={stats.tabs.pilots}
            period={period}
            loading={tabsLoading.pilots}
            customDays={customDays}
          />
        </TabsContent>
        <TabsContent value="flights" className="mt-0">
          <FlightsTabPanel
            data={stats.tabs.flights}
            period={period}
            loading={tabsLoading.flights}
            customDays={customDays}
          />
        </TabsContent>
        <TabsContent value="flight-hours" className="mt-0">
          <FlightHoursTabPanel
            data={stats.tabs.flightHours}
            period={period}
            loading={tabsLoading['flight-hours']}
            customDays={customDays}
          />
        </TabsContent>
        <TabsContent value="active-pilots" className="mt-0">
          <ActivePilotsTabPanel
            data={stats.tabs.activePilots}
            period={period}
            loading={tabsLoading['active-pilots']}
            customDays={customDays}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
