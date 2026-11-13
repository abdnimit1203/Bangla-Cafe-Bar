import type { StorefrontProduct } from "@classytic/commerce-client/types";
import { ProductCard } from "@/components/menu/product-card";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils/cn";

export function ProductGrid({
  products,
  columns = 4,
  cardVariant = "default",
}: {
  products: StorefrontProduct[];
  columns?: 2 | 3 | 4;
  cardVariant?: "default" | "drink" | "treat";
}) {
  return (
    <RevealGroup
      className={cn(
        "grid grid-cols-1 gap-5 sm:grid-cols-2",
        columns === 4 && "lg:grid-cols-4",
        columns === 3 && "lg:grid-cols-3",
        columns === 2 && "lg:grid-cols-2",
      )}
    >
      {products.map((product) => (
        <RevealItem key={product.id} className="flex">
          <ProductCard product={product} variant={cardVariant} />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
