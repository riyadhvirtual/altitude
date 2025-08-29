import * as React from 'react';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

interface DataPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  itemLabelPlural: string;
  onPageChange: (page: number) => void;
  className?: string;
}

export function DataPagination({
  page,
  totalPages,
  onPageChange,
  className,
}: DataPaginationProps) {
  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPages;

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasPrevPage) {
      onPageChange(page - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasNextPage) {
      onPageChange(page + 1);
    }
  };

  // Build array of page numbers/ellipsis
  const renderPages = () => {
    const items: React.ReactNode[] = [];
    const maxVisible = 5; // number of numeric buttons to keep visible (including current)

    const createNumberItem = (n: number) => (
      <PaginationItem key={n}>
        <PaginationLink
          isActive={n === page}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (n !== page) {
              onPageChange(n);
            }
          }}
        >
          {n}
        </PaginationLink>
      </PaginationItem>
    );

    if (totalPages <= maxVisible + 2) {
      // Render all pages directly
      for (let i = 1; i <= totalPages; i++) {
        items.push(createNumberItem(i));
      }
    } else {
      const middleRange = maxVisible - 2; // pages around current
      let left = Math.max(page - Math.floor(middleRange / 2), 2);
      let right = left + middleRange - 1;
      if (right >= totalPages) {
        right = totalPages - 1;
        left = right - middleRange + 1;
      }
      // Add first page
      items.push(createNumberItem(1));
      if (left > 2) {
        items.push(<PaginationEllipsis key="start-ellipsis" />);
      }

      // Middle pages
      for (let i = left; i <= right; i++) {
        items.push(createNumberItem(i));
      }
      // End
      if (right < totalPages - 1) {
        items.push(<PaginationEllipsis key="end-ellipsis" />);
      }
      items.push(createNumberItem(totalPages));
    }
    return items;
  };

  return (
    <Pagination className={cn('w-full justify-center', className)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={handlePrev}
            className={cn(!hasPrevPage && 'pointer-events-none opacity-50')}
          />
        </PaginationItem>
        {renderPages()}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={handleNext}
            className={cn(!hasNextPage && 'pointer-events-none opacity-50')}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
