import { Icon } from "@/components/ui/icon";
import { isFixtureMode } from "@/lib/commerce/catalog-source";

/** Visible whenever the site is rendering local fixtures instead of the live store. */
export function PreviewBanner() {
  if (!isFixtureMode()) return null;
  return (
    <div className="bg-warning-soft text-warning" role="status">
      <p className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 text-xs font-semibold sm:px-6">
        <Icon name="alert" size={14} />
        Preview data: dishes, prices and images are local placeholders, not live store products. Ordering is disabled.
      </p>
    </div>
  );
}
