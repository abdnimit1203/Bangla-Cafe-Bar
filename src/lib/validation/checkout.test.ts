import { describe, expect, it } from "vitest";
import { validateCheckout, validateCustomer, validateFulfillment } from "@/lib/validation/checkout";
import { isValidBdMobile, normalizePhone } from "@/lib/validation/phone";

describe("phone", () => {
  it("normalises common Bangladeshi formats", () => {
    expect(normalizePhone("+880 1712-345678")).toBe("01712345678");
    expect(normalizePhone("8801712345678")).toBe("01712345678");
    expect(normalizePhone("017 1234 5678")).toBe("01712345678");
  });
  it("rejects landlines and short numbers", () => {
    expect(isValidBdMobile("01712345678")).toBe(true);
    expect(isValidBdMobile("0171234567")).toBe(false);
    expect(isValidBdMobile("029876543")).toBe(false);
  });
});

describe("customer validation", () => {
  it("requires a name and valid phone; email optional but well-formed", () => {
    expect(validateCustomer({ name: "", phone: "" })).toMatchObject({ name: expect.any(String), phone: expect.any(String) });
    expect(validateCustomer({ name: "Ria", phone: "01712345678", email: "nope" })).toMatchObject({ email: expect.any(String) });
    expect(validateCustomer({ name: "Ria", phone: "01712345678", email: "ria@example.com" })).toEqual({});
  });
});

describe("fulfillment validation", () => {
  it("delivery needs district and street; area only when the store requires it", () => {
    const base = { mode: "delivery" as const, delivery: { district: "", districtName: "", line1: "" } };
    expect(validateFulfillment(base, { requiresArea: false, requireTable: false })).toMatchObject({ district: expect.any(String), line1: expect.any(String) });
    const filled = { mode: "delivery" as const, delivery: { district: "dhaka", districtName: "Dhaka", line1: "House 1, Road 2" } };
    expect(validateFulfillment(filled, { requiresArea: false, requireTable: false })).toEqual({});
    expect(validateFulfillment(filled, { requiresArea: true, requireTable: false })).toMatchObject({ areaId: expect.any(String) });
  });

  it("pickup needs a time, dine-in needs a table only when configured", () => {
    expect(validateFulfillment({ mode: "pickup", pickup: { pickupAt: "" } }, { requiresArea: false, requireTable: false })).toMatchObject({ pickupAt: expect.any(String) });
    expect(validateFulfillment({ mode: "dine_in", dineIn: {} }, { requiresArea: false, requireTable: false })).toEqual({});
    expect(validateFulfillment({ mode: "dine_in", dineIn: {} }, { requiresArea: false, requireTable: true })).toMatchObject({ tableRef: expect.any(String) });
  });

  it("rejects an empty cart", () => {
    const errors = validateCheckout([], { name: "Ria", phone: "01712345678" }, { mode: "dine_in", dineIn: {} }, { requiresArea: false, requireTable: false });
    expect(errors).toEqual({ cart: expect.any(String) });
  });
});
