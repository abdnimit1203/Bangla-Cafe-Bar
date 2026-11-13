import { describe, expect, it } from "vitest";
import { hoursSummary, isOpenAt, pickupSlots } from "@/lib/restaurant/hours";

const hours = {
  0: { open: "11:00", close: "23:00" },
  1: { open: "11:00", close: "23:00" },
  2: { open: "11:00", close: "23:00" },
  3: { open: "11:00", close: "23:00" },
  4: { open: "11:00", close: "23:30" },
  5: null,
  6: { open: "11:00", close: "23:30" },
};

describe("opening hours", () => {
  it("knows when the kitchen is open", () => {
    expect(isOpenAt(new Date(2026, 10, 9, 12, 0), hours)).toBe(true); // Monday noon
    expect(isOpenAt(new Date(2026, 10, 9, 23, 0), hours)).toBe(false); // at close
    expect(isOpenAt(new Date(2026, 10, 13, 12, 0), hours)).toBe(false); // Friday closed
  });

  it("builds pickup slots from now + lead time, rounded to the interval, until close", () => {
    const slots = pickupSlots(new Date(2026, 10, 9, 22, 7), { leadMinutes: 20, intervalMinutes: 15, maxSlots: 24 }, hours);
    expect(slots.map((s) => s.label)).toEqual(["22:30", "22:45", "23:00"]);
  });

  it("starts at opening time when ordering before the kitchen opens", () => {
    const slots = pickupSlots(new Date(2026, 10, 9, 9, 0), { leadMinutes: 20, intervalMinutes: 30, maxSlots: 3 }, hours);
    expect(slots.map((s) => s.label)).toEqual(["11:00", "11:30", "12:00"]);
  });

  it("returns no slots on a closed day", () => {
    expect(pickupSlots(new Date(2026, 10, 13, 12, 0), { leadMinutes: 20, intervalMinutes: 15, maxSlots: 24 }, hours)).toEqual([]);
  });

  it("groups consecutive days with the same hours", () => {
    expect(hoursSummary(hours)).toEqual([
      { days: "Mon - Wed", label: "11:00 - 23:00" },
      { days: "Thu", label: "11:00 - 23:30" },
      { days: "Fri", label: "Closed" },
      { days: "Sat", label: "11:00 - 23:30" },
      { days: "Sun", label: "11:00 - 23:00" },
    ]);
  });
});
