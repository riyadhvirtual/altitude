import type { Metadata } from 'next';
import { Suspense } from 'react';

import { PageLayout } from '@/components/page-layout';
import { StatisticsDashboard } from '@/components/statistics/statistics-dashboard';
import { StatisticsSkeleton } from '@/components/statistics/statistics-skeleton';
import { requireRole } from '@/lib/auth-check';

export function generateMetadata(): Metadata {
  return {
    title: 'Statistics',
    description: 'Airline statistics with charts and trends',
  };
}

export default async function StatisticsPage() {
  await requireRole(['users']);

  return (
    <PageLayout
      title="Statistics"
      description="View detailed analytics and performance metrics for your airline"
    >
      <Suspense fallback={<StatisticsSkeleton />}>
        <StatisticsDashboard />
      </Suspense>
    </PageLayout>
  );
}
