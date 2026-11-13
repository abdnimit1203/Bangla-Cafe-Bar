import { ProductGrid } from "@/components/menu/product-grid";
import { EmptyState } from "@/components/ui/states";
import { loadCollectionProducts, loadNewest } from "@/lib/commerce/catalog";
import { restaurantConfig } from "@/lib/config/restaurant";

export async function FeaturedDishes() {
  let products = await loadCollectionProducts(restaurantConfig.catalog.featuredCollection, 3);
  if (!products.length) products = await loadNewest(3);
  if (!products.length) {
    return (
      <EmptyState
        compact
        className="bg-surface-strong"
        title="The menu is being prepared"
        description="Dishes will appear here as soon as the kitchen publishes them."
      />
    );
  }
  return <ProductGrid products={products.slice(0, 3)} columns={3} cardVariant="drink" />;
}
