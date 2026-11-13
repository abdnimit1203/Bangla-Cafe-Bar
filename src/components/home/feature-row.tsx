import { Icon } from "@/components/ui/icon";
import { restaurantConfig } from "@/lib/config/restaurant";
import { cn } from "@/lib/utils/cn";

/** Small icon row under the hero copy (fresh daily, charcoal grill, ...). Content from config. */
export function FeatureRow({ className }: { className?: string }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-4 sm:grid-cols-4", className)}>
      {restaurantConfig.features.map((feature) => (
        <li key={feature.title} className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-forest shadow-soft-xs">
            <Icon name={feature.icon} size={18} />
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink">{feature.title}</span>
            <span className="block text-xs text-ink-muted">{feature.description}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
