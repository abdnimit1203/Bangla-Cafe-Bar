import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const base =
  "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-orange";
const idle = "bg-surface text-ink-muted shadow-soft-xs hover:text-ink hover:bg-surface-strong hover:shadow-soft-sm";
const active = "bg-gradient-to-r from-orange to-orange-deep text-white shadow-glow-warm scale-[1.18] font-bold z-10 border border-orange-deep/20";

export function ChipLink({
  href,
  selected,
  children,
  className,
}: {
  href: string;
  selected?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cn(base, selected ? active : idle, className)} aria-current={selected ? "page" : undefined}>
      {children}
    </Link>
  );
}

export function ChipButton({
  selected,
  children,
  className,
  disabled,
  onClick,
}: {
  selected?: boolean;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(base, selected ? active : idle, "disabled:cursor-not-allowed disabled:opacity-40", className)}
    >
      {children}
    </button>
  );
}
