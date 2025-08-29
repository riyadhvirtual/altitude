'use client';

import { AircraftList } from './aircraft-table';

interface Aircraft {
  id: string;
  name: string;
  livery: string;
  createdAt: string | Date;
  pirepCount?: number;
}

interface SearchableAircraftTableProps {
  aircraft: Aircraft[];
  total: number;
  limit?: number;
  onEdit?: (id: string) => void;
}

export function SearchableAircraftTable({
  aircraft,
  total,
  limit = 10,
  onEdit,
}: SearchableAircraftTableProps) {
  return (
    <AircraftList
      aircraft={aircraft}
      total={total}
      limit={limit}
      onEdit={onEdit}
    />
  );
}
