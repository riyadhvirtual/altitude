'use client';

import { useAction } from 'next-safe-action/hooks';
import { useEffect, useState } from 'react';

import { getLiveriesAction } from '@/actions/infiniteflight/get-liveries';
import {
  type ActionErrorResponse,
  extractActionErrorMessage,
} from '@/lib/error-handler';
import type { AircraftLivery } from '@/types/shared';

type UseAircraftDataReturn = {
  aircraft: AircraftLivery[];
  loading: boolean;
  error: string | null;
};

export function useAircraftData(): UseAircraftDataReturn {
  const [aircraft, setAircraft] = useState<AircraftLivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { execute } = useAction(getLiveriesAction, {
    onSuccess: ({ data }) => {
      const result = data as { aircraft?: AircraftLivery[] } | undefined;
      setAircraft(result?.aircraft ?? []);
      setError(null);
      setLoading(false);
    },
    onError: (err) => {
      const message = extractActionErrorMessage(
        err as ActionErrorResponse,
        'Failed to fetch aircraft data'
      );
      setError(message);
      setLoading(false);
    },
  });

  useEffect(() => {
    setLoading(true);
    setError(null);
    void execute();
  }, [execute]);

  return { aircraft, loading, error };
}
