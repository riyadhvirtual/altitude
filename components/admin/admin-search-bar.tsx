'use client';

import { useRouter } from 'next/navigation';
import { parseAsString, useQueryState } from 'nuqs';
import * as React from 'react';

import { SearchBar } from '@/components/ui/search-bar';

interface AdminSearchBarProps {
  placeholder: string;
}

export function AdminSearchBar({ placeholder }: AdminSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useQueryState('q', parseAsString.withDefault(''));
  const lastRefreshedQuery = React.useRef(query);

  const handleSearch = async (searchQuery: string) => {
    const normalizedQuery = searchQuery || null;

    if (normalizedQuery !== query) {
      await setQuery(normalizedQuery);

      const currentUrl = new URL(window.location.href);
      if (searchQuery) {
        currentUrl.searchParams.set('q', searchQuery);
      } else {
        currentUrl.searchParams.delete('q');
      }
      currentUrl.searchParams.delete('page');

      router.push(currentUrl.pathname + currentUrl.search);

      if (searchQuery !== lastRefreshedQuery.current) {
        lastRefreshedQuery.current = searchQuery;
        router.refresh();
      }
    }
  };

  const handleClear = async () => {
    await setQuery(null);
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('q');
    currentUrl.searchParams.delete('page');
    router.push(currentUrl.pathname + currentUrl.search);
    router.refresh();
  };

  return (
    <SearchBar
      value={query}
      placeholder={placeholder}
      onSearch={handleSearch}
      onClear={handleClear}
      className="w-full max-w-xs md:max-w-md lg:max-w-lg"
    />
  );
}
