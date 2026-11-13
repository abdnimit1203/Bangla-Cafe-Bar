import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime, fromDateKey, toDateKey } from "@/lib/utils/dates";

describe("dates", () => {
  it("displays dd/MM/yyyy, never US order", () => {
    expect(formatDate(new Date(2026, 0, 9))).toBe("09/01/2026");
    expect(formatDateTime(new Date(2026, 10, 12, 19, 5))).toBe("12/11/2026 19:05");
  });

  it("round-trips local date keys", () => {
    const d = new Date(2026, 10, 12);
    expect(toDateKey(d)).toBe("2026-11-12");
    expect(fromDateKey("2026-11-12").getTime()).toBe(d.getTime());
  });

  it("returns an empty string for invalid input", () => {
    expect(formatDate("not a date")).toBe("");
  });
});
