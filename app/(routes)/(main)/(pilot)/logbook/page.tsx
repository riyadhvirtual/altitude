import type { Metadata } from 'next';

import { LogbookView } from '@/components/logbook/logbook-view';
import {
  getUserPireps,
  getUserPirepsFiltered,
  type PirepFilterCondition,
} from '@/db/queries';
import { getAircraft } from '@/db/queries';
import { authCheck } from '@/lib/auth-check';

export function generateMetadata(): Metadata {
  return {
    title: 'Logbook',
  };
}

interface LogbookPageProps {
  searchParams: Promise<{
    page?: string;
    filters?: string;
  }>;
}

export default async function LogbookPage({ searchParams }: LogbookPageProps) {
  const session = await authCheck();

  const params = await searchParams;
  const page = Number.parseInt(params.page ?? '1', 10);
  const limit = 10;

  let filters: PirepFilterCondition[] = [];
  if (params.filters) {
    try {
      filters = JSON.parse(params.filters);
    } catch {
      filters = [];
    }
  }

  const hasAnyFilter = filters.length > 0;

  const [{ pireps, total }, aircraft] = await Promise.all([
    hasAnyFilter
      ? getUserPirepsFiltered(session.user.id, filters, page, limit)
      : getUserPireps(session.user.id, page, limit),
    getAircraft(),
  ]);

  return (
    <LogbookView
      flights={pireps}
      limit={limit}
      total={total}
      aircraft={aircraft}
      filters={filters}
    />
  );
}
