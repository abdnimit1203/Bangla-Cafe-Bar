import { describe, expect, it, vi } from "vitest";
import { createStorefrontClient } from "@classytic/commerce-client";
import { buildCheckoutInput, buildQuoteInput, buildShippingAddress } from "@/lib/commerce/checkout";
import { restaurantConfig } from "@/lib/config/restaurant";
import type { CartLine } from "@/types/cart";

const lines: CartLine[] = [
  { key: "p1::", productId: "507f1f77bcf86cd799439011", slug: "a", name: "A", unitPriceMinor: 100, currency: "BDT", quantity: 2, maxQuantity: null },
  { key: "p2::L", productId: "507f1f77bcf86cd799439012", slug: "b", name: "B", variantSku: "L", unitPriceMinor: 200, currency: "BDT", quantity: 1, maxQuantity: 5 },
];
const customer = { name: " Rahim ", phone: "+880 1712-345678", email: "" };

describe("checkout input mapping", () => {
  it("sends only product, sku and quantity per line, never prices", () => {
    const input = buildCheckoutInput(lines, customer, { mode: "pickup", pickup: { pickupAt: "2026-11-12T13:30:00.000Z" } });
    expect(input.lines).toEqual([
      { productId: "507f1f77bcf86cd799439011", quantity: 2 },
      { productId: "507f1f77bcf86cd799439012", quantity: 1, variantSku: "L" },
    ]);
    expect(JSON.stringify(input)).not.toContain("unitPriceMinor");
  });

  it("normalises the customer and omits empty email", () => {
    const input = buildCheckoutInput(lines, customer, { mode: "dine_in", dineIn: { tableRef: "8" } });
    expect(input.customer).toEqual({ name: "Rahim", phone: "01712345678" });
  });

  it("maps delivery details to the shipping address with areaId", () => {
    const address = buildShippingAddress({
      mode: "delivery",
      delivery: { district: "dhaka", districtName: "Dhaka", areaId: 1206, line1: "House 5, Road 2", line2: "", postalCode: "1212" },
    });
    expect(address).toEqual({ line1: "House 5, Road 2", city: "Dhaka", postalCode: "1212", country: "BD", areaId: 1206 });
  });

  it("labels pickup and dine-in orders in the address line for kitchen staff", () => {
    const pickup = buildShippingAddress({ mode: "pickup", pickup: { pickupAt: "2026-11-12T13:30:00.000Z" } });
    expect(pickup.line1).toMatch(/^PICKUP - collect at \d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
    expect(pickup.city).toBe(restaurantConfig.address.city);
    const dineIn = buildShippingAddress({ mode: "dine_in", dineIn: { tableRef: "8" } });
    expect(dineIn.line1).toBe("DINE-IN - Table 8");
    expect(dineIn.country).toBe(restaurantConfig.address.country);
  });

  it("includes promo code and quote token only when present", () => {
    const quote = buildQuoteInput(lines, { mode: "delivery", delivery: { district: "dhaka", districtName: "Dhaka", line1: "x" } }, "SAVE10");
    expect(quote).toEqual({ lines: expect.any(Array), country: "BD", promoCode: "SAVE10" });
    const bare = buildCheckoutInput(lines, customer, { mode: "pickup", pickup: { pickupAt: "2026-11-12T13:30:00.000Z" } }, { promoCode: "  " });
    expect(bare).not.toHaveProperty("promoCode");
    expect(bare).not.toHaveProperty("quoteToken");
  });
});

describe("checkout through the SDK", () => {
  it("preserves the idempotency key and body across a retry", async () => {
    const fetch = vi.fn(async () => Response.json({ orderNumber: "ORD-1", accessToken: "secret", currency: "BDT" }));
    const shop = createStorefrontClient({ apiUrl: "https://api.test/api/v1", store: "demo", fetch });
    const input = buildCheckoutInput(lines, customer, { mode: "dine_in", dineIn: {} });
    await shop.checkout(input, { idempotencyKey: "attempt-0123456789abcdef" });
    await shop.checkout(input, { idempotencyKey: "attempt-0123456789abcdef" });
    expect(fetch).toHaveBeenCalledTimes(2);
    for (const call of fetch.mock.calls as unknown as Array<[string, RequestInit]>) {
      const [url, init] = call;
      expect(url).toBe("https://api.test/api/v1/storefront/demo/orders");
      expect(new Headers(init.headers).get("idempotency-key")).toBe("attempt-0123456789abcdef");
      expect(JSON.parse(String(init.body))).toEqual(input);
    }
  });
});
