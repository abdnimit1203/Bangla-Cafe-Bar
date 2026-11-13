import { restaurantConfig, type DayHours } from "@/lib/config/restaurant";
import { parseClock, startOfDay, weekdayLong } from "@/lib/utils/dates";

export function hoursForDate(date: Date, hours = restaurantConfig.hours): DayHours | null {
  return hours[date.getDay()] ?? null;
}

export function isOpenAt(date: Date, hours = restaurantConfig.hours): boolean {
  const day = hoursForDate(date, hours);
  if (!day) return false;
  const minutes = date.getHours() * 60 + date.getMinutes();
  return minutes >= parseClock(day.open) && minutes < parseClock(day.close);
}

export interface PickupSlot {
  /** ISO timestamp */
  value: string;
  /** HH:mm */
  label: string;
}

/**
 * Pickup collection times for "today" starting from now + lead time, rounded
 * up to the next interval, until closing time.
 */
export function pickupSlots(
  now: Date,
  options: { leadMinutes: number; intervalMinutes: number; maxSlots: number } = restaurantConfig.fulfillment.pickup,
  hours = restaurantConfig.hours,
): PickupSlot[] {
  const day = hoursForDate(now, hours);
  if (!day) return [];
  const open = parseClock(day.open);
  const close = parseClock(day.close);
  const earliest = now.getHours() * 60 + now.getMinutes() + options.leadMinutes;
  let cursor = Math.max(earliest, open);
  cursor = Math.ceil(cursor / options.intervalMinutes) * options.intervalMinutes;
  const slots: PickupSlot[] = [];
  const base = startOfDay(now);
  while (cursor <= close && slots.length < options.maxSlots) {
    const at = new Date(base);
    at.setMinutes(cursor);
    const label = `${String(Math.floor(cursor / 60)).padStart(2, "0")}:${String(cursor % 60).padStart(2, "0")}`;
    slots.push({ value: at.toISOString(), label });
    cursor += options.intervalMinutes;
  }
  return slots;
}

export interface HoursRow {
  days: string;
  label: string;
}

/** Group consecutive weekdays that share the same hours: "Mon - Thu  11:00 - 23:00". */
export function hoursSummary(hours = restaurantConfig.hours): HoursRow[] {
  const rows: HoursRow[] = [];
  const order = [1, 2, 3, 4, 5, 6, 0];
  let start = 0;
  while (start < order.length) {
    const day = order[start]!;
    const label = describeDay(hours[day] ?? null);
    let end = start;
    while (end + 1 < order.length && describeDay(hours[order[end + 1]!] ?? null) === label) end += 1;
    const first = weekdayLong(day).slice(0, 3);
    const last = weekdayLong(order[end]!).slice(0, 3);
    rows.push({ days: start === end ? first : `${first} - ${last}`, label });
    start = end + 1;
  }
  return rows;
}

function describeDay(day: DayHours | null): string {
  return day ? `${day.open} - ${day.close}` : "Closed";
}
