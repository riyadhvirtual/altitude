'use client';

import { ComponentType } from 'react';

interface AdminTableProps<T> {
  data: T[];
  total: number;
  limit?: number;
  onEdit?: (id: string) => void;
  TableComponent: ComponentType<{ [key: string]: unknown }>;
  dataKey: string;
}

export function AdminTable<T>({
  data,
  total,
  limit = 10,
  onEdit,
  TableComponent,
  dataKey,
}: AdminTableProps<T>) {
  const props = {
    [dataKey]: data,
    total,
    limit,
    onEdit,
  };

  return <TableComponent {...props} />;
}
