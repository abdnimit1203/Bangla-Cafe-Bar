export interface CartLine {
  /** Stable identity: productId + variant SKU. */
  key: string;
  productId: string;
  slug: string;
  name: string;
  imageUrl?: string | null;
  variantSku?: string;
  variantLabel?: string;
  /** Display-only unit price captured when the line was added; the server re-prices at checkout. */
  unitPriceMinor: number;
  currency: string;
  quantity: number;
  /** Known stock ceiling when the product tracks inventory; null when untracked. */
  maxQuantity: number | null;
}

export type CartLineInput = Omit<CartLine, "key" | "quantity"> & { quantity?: number };

export function cartLineKey(productId: string, variantSku?: string | null): string {
  return `${productId}::${variantSku ?? ""}`;
}
