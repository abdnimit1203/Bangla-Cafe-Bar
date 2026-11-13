import type { MenuSearchParams } from "@/app/menu/page";
import { menuHref, parseMenuFilters } from "@/components/menu/menu-filters";
import { ChipLink } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { loadCategories } from "@/lib/commerce/catalog";

export async function CategoryChips({ searchParams }: { searchParams: MenuSearchParams }) {
  const [filters, categories] = await Promise.all([searchParams.then(parseMenuFilters), loadCategories()]);
  if (!categories.length) return null;
  const roots = categories.filter((c) => !c.parent);
  const children = categories.filter((c) => c.parent);
  const ordered = [...roots, ...children];
  return (
    <nav aria-label="Menu categories" className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      <ChipLink href={menuHref({ q: filters.q })} selected={!filters.category}>
        <Icon name="menu" size={14} className="text-gold" />
        All
      </ChipLink>
      {ordered.map((category) => (
        <ChipLink
          key={category.slug}
          href={menuHref({ category: category.slug, q: filters.q })}
          selected={filters.category === category.slug}
        >
          {category.parent ? <span className="text-ink-faint">{"›"}</span> : null}
          {category.name}
        </ChipLink>
      ))}
    </nav>
  );
}
