import type { BookingService, BookingSlots } from "@classytic/commerce-client/booking-types";
import { restaurantConfig, type ReservationServiceRule } from "@/lib/config/restaurant";
import { addDays, formatTime, fromDateKey, startOfDay } from "@/lib/utils/dates";

/**
 * Table reservations are modelled on the Brihot booking engine: each party
 * size is a booking *service* (e.g. "table-for-4") whose *resources* are the
 * physical tables that seat that many guests. Availability, overlap and
 * opening-window checks are then enforced server-side per table.
 */

export function serviceForPartySize(
  services: BookingService[],
  partySize: number,
  rules: ReservationServiceRule[] = restaurantConfig.reservation.services,
): BookingService | null {
  if (!services.length) return null;
  const rule = rules.find((r) => partySize >= r.minGuests && partySize <= r.maxGuests);
  if (rule) {
    const match = services.find((s) => s.slug === rule.slug);
    if (match) return match;
  }
  // Fallback: infer capacity from the service name/slug ("Table for 6" -> 6) and choose the smallest fit.
  const inferred = services
    .map((service) => ({ service, capacity: inferCapacity(service) }))
    .filter((entry): entry is { service: BookingService; capacity: number } => entry.capacity !== null && entry.capacity >= partySize)
    .sort((a, b) => a.capacity - b.capacity);
  if (inferred[0]) return inferred[0].service;
  return services.length === 1 ? (services[0] ?? null) : null;
}

export function inferCapacity(service: BookingService): number | null {
  const match = `${service.slug} ${service.name}`.match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

export interface TimeOption {
  startsAt: string;
  endsAt: string;
  resourceRef: string;
  resourceName?: string;
  remaining?: number;
  label: string;
}

/** Flatten per-table slots into one list of times; for each time prefer a table with remaining capacity. */
export function timeOptions(slots: BookingSlots): TimeOption[] {
  const byStart = new Map<string, TimeOption>();
  for (const resource of slots.resources) {
    for (const slot of resource.slots) {
      if (slot.remaining !== undefined && slot.remaining <= 0) continue;
      const existing = byStart.get(slot.startsAt);
      const candidate: TimeOption = {
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
        resourceRef: resource.resourceRef,
        resourceName: resource.resourceName,
        remaining: slot.remaining,
        label: formatTime(slot.startsAt),
      };
      if (!existing || (candidate.remaining ?? 1) > (existing.remaining ?? 1)) byStart.set(slot.startsAt, candidate);
    }
  }
  return [...byStart.values()].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

/** Local-day window for the slots query. */
export function dayWindow(dateKey: string): { from: string; to: string } {
  const start = startOfDay(fromDateKey(dateKey));
  return { from: start.toISOString(), to: addDays(start, 1).toISOString() };
}

export function reservationDates(now: Date, daysAhead = restaurantConfig.reservation.daysAhead): Date[] {
  const today = startOfDay(now);
  return Array.from({ length: daysAhead + 1 }, (_, i) => addDays(today, i));
}

export function guestOptions(max = restaurantConfig.reservation.maxGuests): number[] {
  return Array.from({ length: max }, (_, i) => i + 1);
}

export function reservationStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Awaiting confirmation";
    case "confirmed":
      return "Confirmed";
    case "checked_in":
      return "Seated";
    case "checked_out":
      return "Completed";
    case "canceled":
      return "Cancelled";
    case "no_show":
      return "No-show";
    case "expired":
      return "Expired";
    default:
      return status;
  }
}

export function canCancelReservation(status: string): boolean {
  return status === "pending" || status === "confirmed";
}
