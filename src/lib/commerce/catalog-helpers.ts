import type { StorefrontProduct } from "@classytic/commerce-client/types";
import { restaurantConfig } from "@/lib/config/restaurant";

export type ProductImage = NonNullable<StorefrontProduct["images"]>[number];
export type ProductVariant = NonNullable<StorefrontProduct["variants"]>[number];

export type DietaryLabel = "veg" | "non-veg" | null;

export function coverImage(product: StorefrontProduct): ProductImage | null {
  const images = product.images ?? [];
  if (!images.length) return null;
  const featured = images.find((image) => image.isFeatured);
  if (featured) return featured;
  return [...images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0] ?? null;
}

export function imageUrl(image: ProductImage | null | undefined, size: "thumbnail" | "medium" = "medium") {
  if (!image) return null;
  return image.variants?.[size] ?? image.url;
}

export function variantImage(product: StorefrontProduct, variant: ProductVariant | null): ProductImage | null {
  if (variant?.imageId) {
    const match = (product.images ?? []).find((image) => image.id === variant.imageId);
    if (match) return match;
  }
  return coverImage(product);
}

export function dietaryLabel(product: StorefrontProduct): DietaryLabel {
  const tags = product.tags ?? [];
  if (tags.includes(restaurantConfig.catalog.tags.veg)) return "veg";
  if (tags.includes(restaurantConfig.catalog.tags.nonVeg)) return "non-veg";
  return null;
}

export function isSpicy(product: StorefrontProduct): boolean {
  return (product.tags ?? []).includes(restaurantConfig.catalog.tags.spicy);
}

export function isChefsPick(product: StorefrontProduct): boolean {
  return (product.tags ?? []).includes(restaurantConfig.catalog.tags.chefsPick);
}

export function basePriceMinor(product: StorefrontProduct): number | null {
  return product.monetization?.basePrice.amount ?? null;
}

export function currencyOf(product: StorefrontProduct, fallback = "BDT"): string {
  return product.monetization?.basePrice.currency ?? fallback;
}

/** Variant price = base price + modifier (both integer minor units). */
export function variantPriceMinor(product: StorefrontProduct, variant: ProductVariant | null): number | null {
  const base = basePriceMinor(product);
  if (base === null) return null;
  return base + (variant?.priceModifier ?? 0);
}

export function priceRangeMinor(product: StorefrontProduct): { min: number; max: number } | null {
  const base = basePriceMinor(product);
  if (base === null) return null;
  const variants = product.variants ?? [];
  if (!variants.length) return { min: base, max: base };
  const prices = variants.map((v) => base + (v.priceModifier ?? 0));
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

/** Attribute key -> ordered distinct values, e.g. { size: ["Regular", "Large"], spice: ["Mild", "Hot"] }. */
export function variantOptions(product: StorefrontProduct): Array<{ key: string; values: string[] }> {
  const order: string[] = [];
  const values = new Map<string, string[]>();
  for (const variant of product.variants ?? []) {
    for (const [key, value] of Object.entries(variant.attributes ?? {})) {
      if (!values.has(key)) {
        values.set(key, []);
        order.push(key);
      }
      const list = values.get(key)!;
      if (!list.includes(value)) list.push(value);
    }
  }
  return order.map((key) => ({ key, values: values.get(key) ?? [] }));
}

export function findVariant(
  product: StorefrontProduct,
  selection: Record<string, string>,
): ProductVariant | null {
  const variants = product.variants ?? [];
  if (!variants.length) return null;
  return (
    variants.find((variant) =>
      Object.entries(variant.attributes ?? {}).every(([key, value]) => selection[key] === value),
    ) ?? null
  );
}

/** Multiple active variants require an explicit SKU at checkout. */
export function needsVariantSelection(product: StorefrontProduct): boolean {
  return (product.variants?.length ?? 0) > 1;
}

export function defaultVariant(product: StorefrontProduct): ProductVariant | null {
  const variants = product.variants ?? [];
  return variants.length === 1 ? (variants[0] ?? null) : null;
}

/** Remaining quantity for a product or variant, or null when stock is not tracked. */
export function availableQuantity(product: StorefrontProduct, sku?: string | null): number | null {
  const stock = product.stock;
  if (!stock || !stock.tracked) return null;
  if (sku) {
    const entry = stock.variants?.find((v) => v.sku === sku);
    if (entry) return entry.quantity;
  }
  return stock.quantity ?? null;
}

export function isInStock(product: StorefrontProduct, sku?: string | null): boolean {
  const quantity = availableQuantity(product, sku);
  return quantity === null || quantity > 0;
}

export function variantLabel(variant: ProductVariant | null): string | undefined {
  if (!variant) return undefined;
  const parts = Object.entries(variant.attributes ?? {}).map(
    ([key, value]) => `${capitalize(key)}: ${value}`,
  );
  return parts.length ? parts.join(" / ") : undefined;
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function humanize(value: string): string {
  return capitalize(value.replace(/[_-]+/g, " "));
}
