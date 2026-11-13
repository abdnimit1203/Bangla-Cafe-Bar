import { describe, expect, it } from "vitest";
import { createCartStore, selectCount, selectSubtotalMinor } from "@/stores/cart";
import type { CartLineInput } from "@/types/cart";

const biryani: CartLineInput = {
  productId: "p1",
  slug: "biryani",
  name: "Kacchi biryani",
  unitPriceMinor: 45000,
  currency: "BDT",
  maxQuantity: null,
};

const kebabLarge: CartLineInput = {
  productId: "p2",
  slug: "kebab",
  name: "Seekh kebab",
  variantSku: "KEBAB-L",
  variantLabel: "Size: Large",
  unitPriceMinor: 32000,
  currency: "BDT",
  maxQuantity: 3,
};

describe("cart store", () => {
  it("adds lines and merges repeats by product + variant", () => {
    const store = createCartStore();
    store.getState().add(biryani);
    store.getState().add(biryani);
    store.getState().add(kebabLarge);
    store.getState().add({ ...kebabLarge, variantSku: "KEBAB-S", variantLabel: "Size: Small" });
    const lines = store.getState().lines;
    expect(lines).toHaveLength(3);
    expect(lines.find((l) => l.productId === "p1")?.quantity).toBe(2);
  });

  it("computes count and estimated subtotal", () => {
    const store = createCartStore();
    store.getState().add({ ...biryani, quantity: 2 });
    store.getState().add(kebabLarge);
    expect(selectCount(store.getState())).toBe(3);
    expect(selectSubtotalMinor(store.getState())).toBe(45000 * 2 + 32000);
  });

  it("caps quantity at the known stock ceiling", () => {
    const store = createCartStore();
    store.getState().add({ ...kebabLarge, quantity: 5 });
    expect(store.getState().lines[0]?.quantity).toBe(3);
    store.getState().setQuantity("p2::KEBAB-L", 10);
    expect(store.getState().lines[0]?.quantity).toBe(3);
  });

  it("removes a line when quantity drops to zero and supports explicit removal", () => {
    const store = createCartStore();
    store.getState().add(biryani);
    store.getState().add(kebabLarge);
    store.getState().setQuantity("p1::", 0);
    expect(store.getState().lines.map((l) => l.key)).toEqual(["p2::KEBAB-L"]);
    store.getState().remove("p2::KEBAB-L");
    expect(store.getState().lines).toHaveLength(0);
  });

  it("clears everything", () => {
    const store = createCartStore();
    store.getState().add(biryani);
    store.getState().clear();
    expect(store.getState().lines).toEqual([]);
  });
});
