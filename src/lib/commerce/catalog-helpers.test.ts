import { describe, expect, it } from "vitest";
import type { StorefrontProduct } from "@classytic/commerce-client/types";
import {
  availableQuantity,
  coverImage,
  dietaryLabel,
  findVariant,
  isInStock,
  needsVariantSelection,
  priceRangeMinor,
  variantLabel,
  variantOptions,
  variantPriceMinor,
} from "@/lib/commerce/catalog-helpers";

const money = (amount: number) => ({ amount, currency: "BDT" }) as StorefrontProduct["monetization"] extends infer M ? (M extends { basePrice: infer P } ? P : never) : never;

const curry: StorefrontProduct = {
  id: "p1",
  name: "Chicken bhuna",
  slug: "chicken-bhuna",
  tags: ["non-veg", "spicy"],
  images: [
    { id: "i2", url: "https://cdn/second.webp", order: 1 },
    { id: "i1", url: "https://cdn/first.webp", order: 0, isFeatured: true, variants: { medium: "https://cdn/first-medium.webp" } },
  ],
  monetization: { type: "one_time", basePrice: money(30000) },
  variants: [
    { sku: "BHUNA-R-MILD", attributes: { size: "Regular", spice: "Mild" }, priceModifier: 0 },
    { sku: "BHUNA-R-HOT", attributes: { size: "Regular", spice: "Hot" }, priceModifier: 0 },
    { sku: "BHUNA-L-MILD", attributes: { size: "Large", spice: "Mild" }, priceModifier: 12000 },
  ],
  stock: { tracked: true, quantity: 7, variants: [{ sku: "BHUNA-R-MILD", quantity: 0 }, { sku: "BHUNA-L-MILD", quantity: 7 }] },
};

describe("catalog helpers", () => {
  it("picks the featured image and its medium rendition", () => {
    expect(coverImage(curry)?.id).toBe("i1");
  });

  it("classifies dietary tags", () => {
    expect(dietaryLabel(curry)).toBe("non-veg");
    expect(dietaryLabel({ ...curry, tags: ["veg"] })).toBe("veg");
    expect(dietaryLabel({ ...curry, tags: [] })).toBeNull();
  });

  it("groups variant attributes in first-seen order", () => {
    expect(variantOptions(curry)).toEqual([
      { key: "size", values: ["Regular", "Large"] },
      { key: "spice", values: ["Mild", "Hot"] },
    ]);
  });

  it("resolves a variant from a selection and prices it with the modifier", () => {
    const large = findVariant(curry, { size: "Large", spice: "Mild" });
    expect(large?.sku).toBe("BHUNA-L-MILD");
    expect(variantPriceMinor(curry, large)).toBe(42000);
    expect(findVariant(curry, { size: "Large", spice: "Hot" })).toBeNull();
    expect(variantLabel(large)).toBe("Size: Large / Spice: Mild");
  });

  it("reports a price range across variants", () => {
    expect(priceRangeMinor(curry)).toEqual({ min: 30000, max: 42000 });
    expect(needsVariantSelection(curry)).toBe(true);
    expect(needsVariantSelection({ ...curry, variants: [] })).toBe(false);
  });

  it("uses per-variant stock when tracked and treats untracked as available", () => {
    expect(availableQuantity(curry, "BHUNA-R-MILD")).toBe(0);
    expect(isInStock(curry, "BHUNA-R-MILD")).toBe(false);
    expect(isInStock(curry, "BHUNA-L-MILD")).toBe(true);
    expect(availableQuantity({ ...curry, stock: { tracked: false } })).toBeNull();
    expect(isInStock({ ...curry, stock: { tracked: false } })).toBe(true);
  });
});
