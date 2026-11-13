"use client";

import { Icon } from "@/components/ui/icon";
import { useHydrated } from "@/hooks/use-hydrated";
import { hoursForDate } from "@/lib/restaurant/hours";

/** Today's kitchen hours depend on the visitor's clock, so they render after hydration. */
export function TodayHours() {
  const hydrated = useHydrated();
  const today = hydrated ? hoursForDate(new Date()) : null;
  return (
    <span className="inline-flex h-12 items-center gap-2 rounded-full bg-surface px-4 text-sm text-ink-muted shadow-inset">
      <Icon name="clock" size={14} className="text-gold" />
      {!hydrated ? "Kitchen hours" : today ? `Kitchen open today ${today.open} - ${today.close}` : "Kitchen closed today"}
    </span>
  );
}
