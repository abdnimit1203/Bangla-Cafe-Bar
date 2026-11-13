import Link from "next/link";
import type { MenuSearchParams } from "@/app/menu/page";
import { LoadMore } from "@/components/menu/load-more";
import { menuHref, parseMenuFilters } from "@/components/menu/menu-filters";
import { ProductGrid } from "@/components/menu/product-grid";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { loadCategories, loadMenuPage, loadStoreProfile } from "@/lib/commerce/catalog";

export async function MenuResults({ searchParams }: { searchParams: MenuSearchParams }) {
  const filters = parseMenuFilters(await searchParams);
  const [page, categories, profile] = await Promise.all([
    loadMenuPage({ category: filters.category, q: filters.q }),
    loadCategories(),
    loadStoreProfile().catch(() => null),
  ]);
  const category = categories.find((c) => c.slug === filters.category);
  const title = category?.name ?? (filters.q ? `Results for "${filters.q}"` : "All dishes");

  if (!page.data.length) {
    return (
      <EmptyState
        icon="search"
        title={filters.q ? `Nothing found for "${filters.q}"` : "No dishes here yet"}
        description={
          filters.q
            ? "Try a different word, or browse the full menu."
            : "This category is empty right now. Please check back soon."
        }
        action={
          <ButtonLink href="/menu" variant="secondary">
            Browse the full menu
          </ButtonLink>
        }
      />
    );
  }

  return (
    <section className="space-y-6" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-3 text-2xl font-bold text-ink">
          {title}
          <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-ink-muted shadow-inset">
            {page.next ? `${page.data.length}+ items` : `${page.data.length} items`}
          </span>
        </h2>
        <div className="flex items-center gap-3 text-xs text-ink-faint">
          {profile ? <span>Prices in {profile.currency}</span> : null}
          {filters.q || filters.category ? (
            <Link href={menuHref({})} className="font-semibold text-gold hover:underline">
              Clear filters
            </Link>
          ) : null}
        </div>
      </div>
      {category?.description ? <p className="max-w-2xl text-sm text-ink-muted">{category.description}</p> : null}
      <ProductGrid products={page.data} />
      {page.next ? <LoadMore cursor={page.next} filters={filters} /> : null}
    </section>
  );
}
