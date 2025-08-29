interface SearchParams {
  page?: string;
  q?: string;
}

interface PaginationParams {
  page: number;
  search: string | undefined;
  limit: number;
}

export async function parsePaginationParams(
  searchParams?: SearchParams | Promise<SearchParams>,
  defaultLimit: number = 10
): Promise<PaginationParams> {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const page = resolvedSearchParams?.page
    ? parseInt(resolvedSearchParams.page, 10)
    : 1;
  const search = resolvedSearchParams?.q || undefined;
  const limit = defaultLimit;

  return { page, search, limit };
}
