"use client";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils/cn";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  size = "md",
  label = "Quantity",
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number | null;
  size?: "sm" | "md";
  label?: string;
  className?: string;
}) {
  const atMax = max !== undefined && max !== null && value >= max;
  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  return (
    <div
      className={cn("inline-flex items-center rounded-full bg-surface shadow-inset", className)}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        className={cn(dim, "flex items-center justify-center rounded-full text-ink-muted hover:text-ink disabled:opacity-40")}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <Icon name="minus" size={14} />
      </button>
      <span className="min-w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={cn(dim, "flex items-center justify-center rounded-full text-ink-muted hover:text-ink disabled:opacity-40")}
        onClick={() => onChange(value + 1)}
        disabled={atMax}
        aria-label="Increase quantity"
      >
        <Icon name="plus" size={14} />
      </button>
    </div>
  );
}
