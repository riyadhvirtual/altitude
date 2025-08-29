'use client';

import { useMemo } from 'react';

export interface LocalTimeProps {
  date: Date | string;
  options?: Intl.DateTimeFormatOptions;
  className?: string;
}

export function LocalTime({ date, options, className }: LocalTimeProps) {
  const value = useMemo(() => {
    const dt = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      ...(options ?? {}),
    }).format(dt);
  }, [date, options]);

  return <span className={className}>{value}</span>;
}
