export interface MenuFilters {
  category?: string;
  q?: string;
}

type RawParams = { category?: string | string[]; q?: string | string[] };

function first(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  const trimmed = v?.trim();
  return trimmed ? trimmed : undefined;
}

export function parseMenuFilters(params: RawParams): MenuFilters {
  return { category: first(params.category), q: first(params.q)?.slice(0, 100) };
}

export function menuHref(filters: MenuFilters): string {
  const search = new URLSearchParams();
  if (filters.category) search.set("category", filters.category);
  if (filters.q) search.set("q", filters.q);
  const qs = search.toString();
  return qs ? `/menu?${qs}` : "/menu";
}
