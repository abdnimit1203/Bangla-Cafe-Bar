"use client";

import { useState } from "react";
import type { StorefrontProduct } from "@classytic/commerce-client/types";
import type { MenuFilters } from "@/components/menu/menu-filters";
import { ProductGrid } from "@/components/menu/product-grid";
import { Button } from "@/components/ui/button";
import { InlineNotice } from "@/components/ui/states";
import { getStorefrontClient } from "@/lib/commerce/client";
import { describeError } from "@/lib/commerce/errors";
import { restaurantConfig } from "@/lib/config/restaurant";

/** Cursor pagination continues in the browser with the same filters the server used. */
export function LoadMore({ cursor, filters }: { cursor: string; filters: MenuFilters }) {
  const [extra, setExtra] = useState<StorefrontProduct[]>([]);
  const [next, setNext] = useState<string | null>(cursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMore() {
    if (!next || loading) return;
    setLoading(true);
    setError(null);
    try {
      const page = await getStorefrontClient().products({
        limit: restaurantConfig.catalog.menuPageSize,
        after: next,
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.q ? { q: filters.q } : {}),
      });
      setExtra((current) => [...current, ...page.data]);
      setNext(page.next);
    } catch (failure) {
      setError(describeError(failure, "Couldn't load more dishes. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {extra.length ? <ProductGrid products={extra} /> : null}
      {error ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
      {next ? (
        <div className="flex justify-center">
          <Button variant="secondary" onClick={loadMore} loading={loading}>
            Show more dishes
          </Button>
        </div>
      ) : null}
    </div>
  );
}
