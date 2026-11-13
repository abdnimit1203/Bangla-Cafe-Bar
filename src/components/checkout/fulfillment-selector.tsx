"use client";

import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils/cn";
import { FULFILLMENT_LABELS, type FulfillmentMode } from "@/types/fulfillment";

const ICONS: Record<FulfillmentMode, IconName> = { delivery: "bike", pickup: "pickup", dine_in: "chair" };
const HINTS: Record<FulfillmentMode, string> = {
  delivery: "To your door",
  pickup: "Collect at the counter",
  dine_in: "You're at the restaurant",
};

export function FulfillmentSelector({
  modes,
  value,
  onChange,
}: {
  modes: FulfillmentMode[];
  value: FulfillmentMode;
  onChange: (mode: FulfillmentMode) => void;
}) {
  return (
    <div role="radiogroup" aria-label="How would you like your food?" className="grid gap-3 sm:grid-cols-3">
      {modes.map((mode) => {
        const selected = mode === value;
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(mode)}
            className={cn(
              "flex items-center gap-3 rounded-2xl p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-gold",
              selected ? "bg-surface text-gold shadow-inset" : "bg-surface text-ink shadow-soft-sm hover:text-gold",
            )}
          >
            <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", selected ? "bg-gold text-white" : "bg-gold-soft text-gold")}>
              <Icon name={ICONS[mode]} size={18} />
            </span>
            <span>
              <span className="block font-semibold">{FULFILLMENT_LABELS[mode]}</span>
              <span className="block text-xs text-ink-muted">{HINTS[mode]}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
