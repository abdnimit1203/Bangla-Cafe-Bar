"use client";

import type { StorefrontProduct } from "@classytic/commerce-client/types";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import {
  availableQuantity,
  coverImage,
  currencyOf,
  defaultVariant,
  imageUrl,
  isInStock,
  needsVariantSelection,
  variantLabel,
  variantPriceMinor,
} from "@/lib/commerce/catalog-helpers";
import { useCart } from "@/stores/cart";

/**
 * One-tap add for simple dishes. Dishes with several variants (size, spice)
 * route to the detail page so the customer picks a SKU the API can price.
 */
export function QuickAddButton({
  product,
  compact = false,
  circle = false,
}: {
  product: StorefrontProduct;
  compact?: boolean;
  circle?: boolean;
}) {
  const add = useCart((state) => state.add);
  const { toast } = useToast();
  const variant = defaultVariant(product);
  const price = variantPriceMinor(product, variant);
  const href = `/menu/${product.slug}`;

  if (!isInStock(product, variant?.sku)) {
    return (
      <Button size="sm" variant="secondary" disabled>
        Sold out
      </Button>
    );
  }
  if (needsVariantSelection(product) || price === null) {
    return (
      <ButtonLink href={href} size="sm" variant={circle ? "secondary" : "secondary"}>
        {circle ? <Icon name="plus" size={16} /> : compact ? "Options" : "Choose options"}
      </ButtonLink>
    );
  }

  if (circle) {
    return (
      <button
        type="button"
        onClick={() => {
          add({
            productId: product.id,
            slug: product.slug,
            name: product.name,
            imageUrl: imageUrl(coverImage(product), "thumbnail"),
            variantSku: variant?.sku,
            variantLabel: variantLabel(variant),
            unitPriceMinor: price,
            currency: currencyOf(product),
            maxQuantity: availableQuantity(product, variant?.sku),
          });
          toast({ title: `${product.name} added to your tray`, tone: "success" });
        }}
        className="press flex h-9 w-9 items-center justify-center rounded-full bg-forest text-cream shadow-soft-xs transition-transform hover:scale-105 hover:bg-forest-deep"
        aria-label={`Add ${product.name} to order tray`}
      >
        <Icon name="plus" size={16} />
      </button>
    );
  }

  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={() => {
        add({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          imageUrl: imageUrl(coverImage(product), "thumbnail"),
          variantSku: variant?.sku,
          variantLabel: variantLabel(variant),
          unitPriceMinor: price,
          currency: currencyOf(product),
          maxQuantity: availableQuantity(product, variant?.sku),
        });
        toast({ title: `${product.name} added to your order`, tone: "success" });
      }}
      aria-label={`Add ${product.name} to order`}
    >
      <Icon name="plus" size={14} />
      {compact ? "Add" : "Add to order"}
    </Button>
  );
}
