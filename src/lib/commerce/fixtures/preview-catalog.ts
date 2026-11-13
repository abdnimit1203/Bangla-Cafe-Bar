import type {
  StorefrontCategory,
  StorefrontProduct,
  StorefrontProductPage,
} from "@classytic/commerce-client/types";
import sample from "@/lib/commerce/fixtures/sample-menu.json";
import type { MenuQuery } from "@/lib/commerce/catalog";

/**
 * PREVIEW-ONLY catalog built from the sample fixture.
 *
 * It exists so the restaurant UI can be reviewed before the real store has
 * products. Ids are prefixed `preview-` and never exist on the server, which is
 * why ordering is disabled while fixture mode is on.
 */

export interface FixtureOptionValue {
  code: string;
  label: string;
  priceDeltaBdt?: number;
}
export interface FixtureOption {
  code: string;
  name: string;
  values: FixtureOptionValue[];
}
export interface FixtureProduct {
  slug: string;
  name: string;
  description?: string;
  category: string;
  priceBdt: number;
  compareAtBdt?: number | null;
  tags?: string[];
  collections?: string[];
  images?: Array<{ src: string; alt?: string }>;
  options?: FixtureOption[];
  status?: "draft" | "active";
}
export interface FixtureCategory {
  slug: string;
  name: string;
  description?: string;
  displayOrder?: number;
  image?: { src: string; alt?: string } | null;
}
export interface FixtureCollection {
  slug: string;
  name: string;
  featured?: boolean;
  displayOrder?: number;
}
export interface MenuFixture {
  meta: { sample: boolean; store: string; currency: string; note?: string };
  categories: FixtureCategory[];
  collections: FixtureCollection[];
  products: FixtureProduct[];
}

export const PREVIEW_FIXTURE = sample as MenuFixture;

export function toMinor(majorBdt: number): number {
  return Math.round(majorBdt * 100);
}

/** Cartesian product of option values -> one variant per combination. */
export function expandVariants(product: FixtureProduct): NonNullable<StorefrontProduct["variants"]> {
  const options = product.options ?? [];
  if (!options.length) return [];
  const base = product.slug.toUpperCase().replace(/[^A-Z0-9]+/g, "-");
  let combos: Array<{ attributes: Record<string, string>; codes: string[]; delta: number }> = [
    { attributes: {}, codes: [], delta: 0 },
  ];
  for (const option of options) {
    combos = combos.flatMap((combo) =>
      option.values.map((value) => ({
        attributes: { ...combo.attributes, [option.code]: value.label },
        codes: [...combo.codes, value.code.toUpperCase()],
        delta: combo.delta + (value.priceDeltaBdt ?? 0),
      })),
    );
  }
  return combos.map((combo) => ({
    sku: [base, ...combo.codes].join("-"),
    attributes: combo.attributes,
    priceModifier: toMinor(combo.delta),
    customSizing: false,
  }));
}

export function toStorefrontProduct(product: FixtureProduct, currency = PREVIEW_FIXTURE.meta.currency): StorefrontProduct {
  const compare = product.compareAtBdt ?? null;
  return {
    id: `preview-${product.slug}`,
    name: product.name,
    slug: product.slug,
    description: product.description,
    categorySlug: product.category,
    tags: product.tags ?? [],
    collections: product.collections ?? [],
    onSale: compare !== null && compare > product.priceBdt,
    images: (product.images ?? []).map((image, index) => ({
      id: `preview-${product.slug}-${index}`,
      url: image.src,
      alt: image.alt,
      order: index,
      isFeatured: index === 0,
    })),
    monetization: {
      type: "one_time",
      basePrice: { amount: toMinor(product.priceBdt), currency } as StorefrontProduct["monetization"] extends infer M
        ? M extends { basePrice: infer P }
          ? P
          : never
        : never,
      ...(compare !== null
        ? { compareAtPrice: { amount: toMinor(compare), currency } as NonNullable<StorefrontProduct["monetization"]>["compareAtPrice"] }
        : {}),
    },
    variants: expandVariants(product),
  };
}

const PRODUCTS: StorefrontProduct[] = PREVIEW_FIXTURE.products.map((p) => toStorefrontProduct(p));

const CATEGORIES: StorefrontCategory[] = PREVIEW_FIXTURE.categories.map((c) => ({
  id: `preview-${c.slug}`,
  name: c.name,
  slug: c.slug,
  parent: null,
  description: c.description,
  image: c.image ? { url: c.image.src, alt: c.image.alt } : null,
  displayOrder: c.displayOrder ?? 0,
}));

export const previewCatalog = {
  categories(): StorefrontCategory[] {
    return [...CATEGORIES].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  },
  products(query: MenuQuery = {}): StorefrontProductPage {
    const q = query.q?.trim().toLowerCase();
    const data = PRODUCTS.filter(
      (p) => (!query.category || p.categorySlug === query.category) && (!q || p.name.toLowerCase().includes(q)),
    );
    return { data: data.slice(0, query.limit ?? data.length), next: null };
  },
  product(slug: string): StorefrontProduct | null {
    return PRODUCTS.find((p) => p.slug === slug) ?? null;
  },
  collection(slug: string, limit = 8): StorefrontProduct[] {
    return PRODUCTS.filter((p) => p.collections?.includes(slug)).slice(0, limit);
  },
  onSale(limit = 8): StorefrontProduct[] {
    return PRODUCTS.filter((p) => p.onSale).slice(0, limit);
  },
  newest(limit = 8): StorefrontProduct[] {
    return PRODUCTS.slice(0, limit);
  },
};
