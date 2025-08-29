'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { MetricCard } from '@/components/statistics/metric-card';
import { StatisticsTabsCard } from '@/components/statistics/tabs-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStatistics } from '@/hooks/use-statistics';
import type { TimePeriod } from '@/types/statistics';

export const StatisticsDashboard = () => {
  const {
    selectedPeriod,
    customDays,
    stats,
    loading,
    error,
    changePeriod,
    retry,
    isStale,
  } = useStatistics();
  const [customInput, setCustomInput] = useState<string>(
    customDays?.toString() || ''
  );

  // Generate period-specific titles
  const getPeriodTitle = (metric: string) => metric;

  const handleCustomSubmit = () => {
    const days = parseInt(customInput);
    if (days > 0 && days <= 3650) {
      // Max 10 years
      changePeriod('custom', days);
    }
  };

  const handleCustomInputChange = (value: string) => {
    setCustomInput(value);
    // Auto-submit if valid number is entered
    const days = parseInt(value);
    if (days > 0 && days <= 3650) {
      changePeriod('custom', days);
    }
  };

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Unable to Load Statistics: {error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={retry}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs
        value={selectedPeriod}
        onValueChange={(value) => {
          if (value === 'custom') {
            // Always switch to custom tab with default value if none exists
            const defaultDays = customDays || 30;
            changePeriod(value as TimePeriod, defaultDays);
            if (!customInput) {
              setCustomInput(defaultDays.toString());
            }
          } else {
            changePeriod(value as TimePeriod);
          }
        }}
      >
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full grid-cols-5 max-w-2xl">
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="90d">90 Days</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          {isStale && (
            <Button
              variant="outline"
              size="sm"
              onClick={retry}
              className="text-muted-foreground"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>

        {selectedPeriod === 'custom' && (
          <div className="flex items-center space-x-3 mt-4 p-4 bg-muted dark:bg-panel rounded-lg w-full max-w-2xl">
            <Label htmlFor="custom-days" className="text-sm font-medium">
              Days:
            </Label>
            <Input
              id="custom-days"
              type="number"
              min="1"
              max="3650"
              value={customInput}
              onChange={(e) => handleCustomInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCustomSubmit();
                }
              }}
              placeholder="Enter days (e.g., 68)"
              className="w-40"
            />
            <Button
              onClick={handleCustomSubmit}
              size="sm"
              disabled={
                !customInput ||
                parseInt(customInput) <= 0 ||
                parseInt(customInput) > 3650
              }
            >
              Apply
            </Button>
            <span className="text-sm text-muted-foreground">
              {customDays && `Currently showing past ${customDays} days`}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-2">
          <MetricCard
            title={selectedPeriod === 'all' ? 'Total Pilots' : 'New Pilots'}
            value={stats?.totalPilots ?? 0}
            sparklineData={
              selectedPeriod === 'all'
                ? undefined
                : stats?.sparklines.totalPilots
            }
            format="number"
            loading={loading}
          />

          <MetricCard
            title={getPeriodTitle('Flights')}
            value={stats?.totalFlights ?? 0}
            sparklineData={
              selectedPeriod === 'all'
                ? undefined
                : stats?.sparklines.totalFlights
            }
            format="number"
            loading={loading}
          />

          <MetricCard
            title={getPeriodTitle('Flight Hours')}
            value={stats?.totalFlightHours ?? 0}
            sparklineData={
              selectedPeriod === 'all'
                ? undefined
                : stats?.sparklines.totalFlightHours
            }
            format="hours"
            loading={loading}
          />

          <MetricCard
            title="Active Pilot Rate"
            value={stats?.activePilotRate ?? 0}
            sparklineData={
              selectedPeriod === 'all'
                ? undefined
                : stats?.sparklines.activePilotRate
            }
            format="percentage"
            loading={loading}
          />
        </div>

        <StatisticsTabsCard
          period={selectedPeriod}
          customDays={customDays}
          initialTab="pilots"
        />
      </Tabs>
    </div>
  );
};
