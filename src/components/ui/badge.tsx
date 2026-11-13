import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Tone = "gold" | "green" | "red" | "neutral" | "warning" | "dark";

const tones: Record<Tone, string> = {
  gold: "bg-gold-soft text-gold-deep",
  green: "bg-success-soft text-success",
  red: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
  neutral: "bg-surface text-ink-muted shadow-soft-xs",
  dark: "bg-ink/80 text-white backdrop-blur",
};

export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
