import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-card bg-surface shadow-soft", className)} {...rest} />;
}

export function Container({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-[1340px] px-4 sm:px-6 lg:px-8", className)} {...rest} />;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="max-w-2xl">
        {eyebrow ? <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold">{eyebrow}</p> : null}
        <h2 className="text-2xl font-bold text-ink sm:text-3xl">{title}</h2>
        {description ? <p className="mt-2 text-sm text-ink-muted sm:text-base">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
