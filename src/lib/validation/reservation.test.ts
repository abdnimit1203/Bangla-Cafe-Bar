import { describe, expect, it } from "vitest";
import { validateReservation } from "@/lib/validation/reservation";
import { addDays, toDateKey } from "@/lib/utils/dates";

const now = new Date(2026, 10, 12, 10, 0, 0);
const rules = { maxGuests: 8, daysAhead: 14, now };
const customer = { name: "Ria", phone: "01712345678" };

describe("reservation validation", () => {
  it("accepts a complete, future booking", () => {
    const errors = validateReservation(
      { dateKey: toDateKey(now), partySize: 4, startsAt: new Date(2026, 10, 12, 19, 0).toISOString(), resourceRef: "t1", customer },
      rules,
    );
    expect(errors).toEqual({});
  });

  it("rejects dates outside the booking window", () => {
    expect(validateReservation({ dateKey: toDateKey(addDays(now, -1)), partySize: 2, startsAt: "x", resourceRef: "t", customer }, rules)).toMatchObject({ dateKey: expect.any(String) });
    expect(validateReservation({ dateKey: toDateKey(addDays(now, 15)), partySize: 2, startsAt: "x", resourceRef: "t", customer }, rules)).toMatchObject({ dateKey: expect.any(String) });
  });

  it("rejects bad party sizes and missing or past slots", () => {
    expect(validateReservation({ dateKey: toDateKey(now), partySize: 0, startsAt: null, resourceRef: null, customer }, rules)).toMatchObject({
      partySize: expect.any(String),
      startsAt: expect.any(String),
    });
    expect(validateReservation({ dateKey: toDateKey(now), partySize: 9, startsAt: new Date(2026, 10, 12, 9, 0).toISOString(), resourceRef: "t", customer }, rules)).toMatchObject({
      partySize: expect.any(String),
      startsAt: expect.stringContaining("passed"),
    });
  });
});
