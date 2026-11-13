import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils/cn";

export function Price({
  amountMinor,
  currency,
  compareAtMinor,
  prefix,
  className,
  size = "md",
}: {
  amountMinor: number;
  currency: string;
  compareAtMinor?: number | null;
  prefix?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "text-sm", md: "text-lg", lg: "text-2xl" } as const;
  const onSale = compareAtMinor !== undefined && compareAtMinor !== null && compareAtMinor > amountMinor;
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className={cn("font-bold text-gold", sizes[size])}>
        {prefix ? <span className="mr-1 text-xs font-medium text-ink-faint">{prefix}</span> : null}
        {formatMoney(amountMinor, currency)}
      </span>
      {onSale ? <s className="text-xs text-ink-faint">{formatMoney(compareAtMinor, currency)}</s> : null}
    </span>
  );
}
