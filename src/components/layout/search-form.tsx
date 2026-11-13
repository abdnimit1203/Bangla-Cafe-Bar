import { Icon } from "@/components/ui/icon";
import { restaurantConfig } from "@/lib/config/restaurant";
import { cn } from "@/lib/utils/cn";

/** Plain GET form: works without JavaScript and lands on /menu?q=... */
export function SearchForm({ className, defaultValue }: { className?: string; defaultValue?: string }) {
  return (
    <form action="/menu" method="get" role="search" className={cn("items-center", className)}>
      <label htmlFor="site-search" className="sr-only">
        Search the menu
      </label>
      <div className="relative w-full">
        <Icon name="search" size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          id="site-search"
          name="q"
          type="search"
          defaultValue={defaultValue}
          placeholder={restaurantConfig.search.placeholder}
          maxLength={100}
          className="h-11 w-full rounded-full bg-surface pl-11 pr-4 text-sm text-ink shadow-inset placeholder:text-ink-faint focus:outline-2 focus:outline-orange/60"
        />
      </div>
    </form>
  );
}
