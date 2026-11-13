import { describe, expect, it } from "vitest";
import type { BookingService, BookingSlots } from "@classytic/commerce-client/booking-types";
import { dayWindow, serviceForPartySize, timeOptions } from "@/lib/commerce/reservations";

const service = (slug: string, name: string): BookingService => ({
  id: slug,
  slug,
  name,
  description: "",
  durationMinutes: 90,
  price: { amount: 0, currency: "BDT" },
  payment: { mode: "none" },
});

describe("serviceForPartySize", () => {
  const services = [service("table-for-2", "Table for 2"), service("table-for-4", "Table for 4"), service("table-for-6", "Table for 6")];

  it("uses the configured party-size mapping first", () => {
    expect(serviceForPartySize(services, 1)?.slug).toBe("table-for-2");
    expect(serviceForPartySize(services, 3)?.slug).toBe("table-for-4");
  });

  it("falls back to the smallest inferred capacity that fits", () => {
    const custom = [service("booth-8", "Window booth (8 seats)"), service("round-5", "Round table 5")];
    expect(serviceForPartySize(custom, 5)?.slug).toBe("round-5");
    expect(serviceForPartySize(custom, 7)?.slug).toBe("booth-8");
    expect(serviceForPartySize(custom, 9)).toBeNull();
  });

  it("returns the only service when nothing else matches", () => {
    expect(serviceForPartySize([service("dinner", "Dinner booking")], 3)?.slug).toBe("dinner");
    expect(serviceForPartySize([], 2)).toBeNull();
  });
});

describe("timeOptions", () => {
  it("merges per-table slots into one list, skipping exhausted ones", () => {
    const slots: BookingSlots = {
      service: service("table-for-2", "Table for 2"),
      resources: [
        { resourceRef: "t1", resourceName: "Table 1", timezone: "Asia/Dhaka", slots: [{ startsAt: "2026-11-12T13:00:00.000Z", endsAt: "2026-11-12T14:30:00.000Z", remaining: 0 }, { startsAt: "2026-11-12T15:00:00.000Z", endsAt: "2026-11-12T16:30:00.000Z", remaining: 1 }] },
        { resourceRef: "t2", resourceName: "Table 2", timezone: "Asia/Dhaka", slots: [{ startsAt: "2026-11-12T13:00:00.000Z", endsAt: "2026-11-12T14:30:00.000Z", remaining: 1 }] },
      ],
    };
    const options = timeOptions(slots);
    expect(options.map((o) => [o.startsAt, o.resourceRef])).toEqual([
      ["2026-11-12T13:00:00.000Z", "t2"],
      ["2026-11-12T15:00:00.000Z", "t1"],
    ]);
  });
});

describe("dayWindow", () => {
  it("spans exactly one local day", () => {
    const { from, to } = dayWindow("2026-11-12");
    expect(new Date(to).getTime() - new Date(from).getTime()).toBe(24 * 60 * 60 * 1000);
  });
});
