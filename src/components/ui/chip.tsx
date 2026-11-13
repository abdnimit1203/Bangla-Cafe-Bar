import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const base =
  "inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-gold";
const idle = "bg-surface text-ink-muted shadow-soft-sm hover:text-ink";
const active = "bg-surface text-gold shadow-inset";

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
