'use client';

import { MultipliersTable } from './multipliers-table';

interface Multiplier {
  id: string;
  name: string;
  value: number;
  createdAt: string | Date;
  pirepCount?: number;
}

interface SearchableMultipliersTableProps {
  multipliers: Multiplier[];
  total: number;
  limit?: number;
  onEdit?: (id: string) => void;
}

export function SearchableMultipliersTable({
  multipliers,
  total,
  limit = 10,
  onEdit,
}: SearchableMultipliersTableProps) {
  return (
    <MultipliersTable
      multipliers={multipliers}
      total={total}
      limit={limit}
      onEdit={onEdit}
    />
  );
}
