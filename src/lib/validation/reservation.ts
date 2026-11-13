import type { FieldErrors } from "@/lib/validation/checkout";
import { validateCustomer } from "@/lib/validation/checkout";
import type { CustomerDetails } from "@/types/fulfillment";
import { addDays, fromDateKey, startOfDay } from "@/lib/utils/dates";

export interface ReservationDraft {
  dateKey: string;
  partySize: number;
  startsAt: string | null;
  resourceRef: string | null;
  customer: CustomerDetails;
}

export interface ReservationRules {
  maxGuests: number;
  daysAhead: number;
  now: Date;
}

export function validateReservation(draft: ReservationDraft, rules: ReservationRules): FieldErrors {
  const errors: FieldErrors = { ...validateCustomer(draft.customer) };
  const day = fromDateKey(draft.dateKey);
  const today = startOfDay(rules.now);
  const last = addDays(today, rules.daysAhead);
  if (Number.isNaN(day.getTime()) || day < today || day > last) {
    errors.dateKey = "Choose a date within the next two weeks.";
  }
  if (!Number.isInteger(draft.partySize) || draft.partySize < 1 || draft.partySize > rules.maxGuests) {
    errors.partySize = `Guests must be between 1 and ${rules.maxGuests}.`;
  }
  if (!draft.startsAt || !draft.resourceRef) errors.startsAt = "Pick a time for your table.";
  else if (new Date(draft.startsAt).getTime() <= rules.now.getTime()) {
    errors.startsAt = "That time has already passed. Pick a later slot.";
  }
  return errors;
}
