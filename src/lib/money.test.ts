import { describe, expect, it } from "vitest";
import { formatMoney, formatMoneyValue } from "@/lib/money";

describe("formatMoney", () => {
  it("renders BDT minor units as major units with grouping", () => {
    expect(formatMoney(129000, "BDT")).toContain("1,290");
    expect(formatMoney(129000, "BDT")).not.toContain("129,000");
  });

  it("respects zero-decimal currencies", () => {
    expect(formatMoney(1000, "JPY")).toContain("1,000");
  });

  it("falls back gracefully for unknown currency codes", () => {
    expect(formatMoney(1234, "ZZZ")).toContain("12.34");
  });

  it("formats Money objects", () => {
    expect(formatMoneyValue({ amount: 5000, currency: "BDT" })).toContain("50");
  });
});
