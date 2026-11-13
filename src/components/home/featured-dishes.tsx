import { ProductGrid } from "@/components/menu/product-grid";
import { EmptyState } from "@/components/ui/states";
import { loadCollectionProducts, loadMenuPage } from "@/lib/commerce/catalog";
import { restaurantConfig } from "@/lib/config/restaurant";

export async function FeaturedDishes() {
  // Query signature coffee and drinks (Caramel Latte, Classic Cappuccino, Ceremonial Matcha Latte, etc.)
  const drinksPage = await loadMenuPage({ category: "coffee-and-drinks", limit: 12 });
  let products = (drinksPage.data || []).filter(
    (p) =>
      p.categorySlug === "coffee-and-drinks" ||
      p.slug.includes("latte") ||
      p.slug.includes("cappuccino") ||
      p.slug.includes("brew") ||
      p.slug.includes("soda"),
  );

  // If specific category filter didn't match, load general catalog and filter strictly for drinks
  if (!products.length) {
    const allProducts = await loadCollectionProducts(restaurantConfig.catalog.featuredCollection, 12);
    products = allProducts.filter(
      (p) =>
        p.categorySlug === "coffee-and-drinks" ||
        p.slug.includes("latte") ||
        p.slug.includes("cappuccino") ||
        p.slug.includes("brew") ||
        p.slug.includes("soda"),
    );
  }

  if (!products.length) {
    return (
      <EmptyState
        compact
        className="bg-surface-strong"
        title="The drinks menu is being prepared"
        description="Handcrafted drinks will appear here as soon as published."
      />
    );
  }

  // Display top 3 handcrafted drinks
  return <ProductGrid products={products.slice(0, 3)} columns={3} cardVariant="drink" />;
}
