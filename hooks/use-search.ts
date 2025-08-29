'use client';

import { parseAsString, useQueryState } from 'nuqs';
import { useCallback, useMemo } from 'react';

interface UseSearchOptions<T> {
  data: T[];
  searchFields: (keyof T)[];
  queryParam?: string;
}

interface UseSearchReturn<T> {
  query: string;
  setQuery: (query: string | null) => void;
  filteredData: T[];
  clearSearch: () => void;
}

export function useSearch<T extends Record<string, unknown>>({
  data,
  searchFields,
  queryParam = 'search',
}: UseSearchOptions<T>): UseSearchReturn<T> {
  const [query, setQuery] = useQueryState(
    queryParam,
    parseAsString.withDefault('')
  );

  const filteredData = useMemo(() => {
    if (!query || query.trim() === '') {
      return data;
    }

    const searchTerm = query.toLowerCase().trim();

    return data.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        if (value === null || value === undefined) {
          return false;
        }

        if (Array.isArray(value)) {
          return value.some((v: unknown) =>
            String(v).toLowerCase().includes(searchTerm)
          );
        }

        return String(value).toLowerCase().includes(searchTerm);
      })
    );
  }, [data, query, searchFields]);

  const clearSearch = useCallback(() => {
    setQuery(null);
  }, [setQuery]);

  const handleSetQuery = useCallback(
    (newQuery: string | null) => {
      setQuery(newQuery || null);
    },
    [setQuery]
  );

  return {
    query: query || '',
    setQuery: handleSetQuery,
    filteredData,
    clearSearch,
  };
}
