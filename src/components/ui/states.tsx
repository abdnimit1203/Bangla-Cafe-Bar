import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Icon, type IconName } from "@/components/ui/icon";

interface StateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: IconName;
  className?: string;
  compact?: boolean;
}

export function EmptyState({ title, description, action, icon = "utensils", className, compact }: StateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-card bg-surface text-center shadow-inset",
        compact ? "px-5 py-8" : "px-6 py-14",
        className,
      )}
    >
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold-soft text-gold">
        <Icon name={icon} size={22} />
      </span>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      {description ? <p className="mt-1 max-w-md text-sm text-ink-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ title, description, action, icon = "alert", className, compact }: StateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-card bg-surface text-center shadow-inset",
        compact ? "px-5 py-8" : "px-6 py-14",
        className,
      )}
    >
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
        <Icon name={icon} size={22} />
      </span>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      {description ? <p className="mt-1 max-w-md text-sm text-ink-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function InlineNotice({
  tone = "info",
  children,
  className,
}: {
  tone?: "info" | "warning" | "danger" | "success";
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    info: "bg-surface text-ink-muted shadow-inset",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
    success: "bg-success-soft text-success",
  } as const;
  const icon: IconName = tone === "success" ? "check" : tone === "info" ? "info" : "alert";
  return (
    <div className={cn("flex items-start gap-3 rounded-xl px-4 py-3 text-sm", tones[tone], className)}>
      <Icon name={icon} size={16} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
