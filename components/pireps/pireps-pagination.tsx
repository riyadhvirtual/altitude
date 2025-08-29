'use client';

import { useRouter } from 'next/navigation';
import { parseAsInteger, useQueryState } from 'nuqs';

import { DataPagination } from '@/components/ui/data-pagination';

interface PirepsPaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  status: 'pending' | 'approved' | 'denied';
}

export function PirepsPagination({
  totalPages,
  total,
  limit,
  status: _status,
}: PirepsPaginationProps) {
  const router = useRouter();
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  const handlePageChange = async (newPage: number) => {
    await setPage(newPage);
    router.refresh();
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <DataPagination
      page={page}
      totalPages={totalPages}
      totalItems={total}
      itemsPerPage={limit}
      itemLabelPlural="PIREPs"
      onPageChange={handlePageChange}
      className="mt-6"
    />
  );
}
