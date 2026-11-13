"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { StorefrontProduct } from "@classytic/commerce-client/types";
import { QuickAddButton } from "@/components/product/quick-add-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChipButton } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { InlineNotice } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import {
  availableQuantity,
  capitalize,
  coverImage,
  currencyOf,
  dietaryLabel,
  findVariant,
  imageUrl,
  isChefsPick,
  isInStock,
  isSpicy,
  needsVariantSelection,
  variantImage,
  variantLabel,
  variantOptions,
  variantPriceMinor,
} from "@/lib/commerce/catalog-helpers";
import { useCart } from "@/stores/cart";

export function ProductDetail({ product, addOns }: { product: StorefrontProduct; addOns: StorefrontProduct[] }) {
  const add = useCart((state) => state.add);
  const { toast } = useToast();
  const options = useMemo(() => variantOptions(product), [product]);
  const [selection, setSelection] = useState<Record<string, string>>(() =>
    Object.fromEntries(options.map((group) => [group.key, group.values[0] ?? ""])),
  );
  const [quantity, setQuantity] = useState(1);

  const multiVariant = needsVariantSelection(product);
  const variant = multiVariant ? findVariant(product, selection) : (product.variants?.[0] ?? null);
  const price = variantPriceMinor(product, variant);
  const stock = availableQuantity(product, variant?.sku);
  const available = isInStock(product, variant?.sku) && (!multiVariant || variant !== null);
  const image = variantImage(product, variant);
  const src = imageUrl(image);
  const diet = dietaryLabel(product);
  const currency = currencyOf(product);

  function handleAdd() {
    if (price === null || !available) return;
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: imageUrl(coverImage(product), "thumbnail"),
      variantSku: variant?.sku,
      variantLabel: variantLabel(variant),
      unitPriceMinor: price,
      currency,
      maxQuantity: stock,
      quantity,
    });
    toast({
      title: `${product.name} added to your order`,
      description: variantLabel(variant),
      tone: "success",
    });
  }

  return (
    <div className="space-y-12">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-line shadow-soft">
          {src ? (
            <Image src={src} alt={image?.alt ?? product.name} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-ink-faint">
              <Icon name="utensils" size={40} />
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <Link href="/menu" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-ink">
            <Icon name="chevronLeft" size={16} />
            Back to menu
          </Link>
          <div className="mt-4 flex flex-wrap gap-2">
            {diet === "veg" ? (
              <Badge tone="green">
                <Icon name="leaf" size={10} /> Veg
              </Badge>
            ) : null}
            {diet === "non-veg" ? <Badge tone="red">Non-veg</Badge> : null}
            {isSpicy(product) ? (
              <Badge tone="warning">
                <Icon name="flame" size={10} /> Spicy
              </Badge>
            ) : null}
            {isChefsPick(product) ? <Badge tone="gold">Chef&apos;s pick</Badge> : null}
            {product.onSale ? <Badge tone="gold">Offer</Badge> : null}
          </div>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-ink sm:text-4xl">{product.name}</h1>
          {product.description ? <p className="mt-3 text-base text-ink-muted">{product.description}</p> : null}

          <div className="mt-5">
            {price !== null ? (
              <Price amountMinor={price} currency={currency} compareAtMinor={product.monetization?.compareAtPrice?.amount} size="lg" />
            ) : (
              <span className="text-ink-faint">Price available from staff</span>
            )}
          </div>

          {multiVariant
            ? options.map((group) => (
                <fieldset key={group.key} className="mt-6">
                  <legend className="mb-2 text-sm font-semibold text-ink">{capitalize(group.key)}</legend>
                  <div className="flex flex-wrap gap-2">
                    {group.values.map((value) => {
                      const candidate = findVariant(product, { ...selection, [group.key]: value });
                      const candidateAvailable = candidate ? isInStock(product, candidate.sku) : false;
                      return (
                        <ChipButton
                          key={value}
                          selected={selection[group.key] === value}
                          disabled={!candidate}
                          onClick={() => setSelection((current) => ({ ...current, [group.key]: value }))}
                        >
                          {value}
                          {candidate && !candidateAvailable ? <span className="text-xs text-ink-faint">(sold out)</span> : null}
                        </ChipButton>
                      );
                    })}
                  </div>
                </fieldset>
              ))
            : null}

          {stock !== null && stock > 0 && stock <= 5 ? (
            <InlineNotice tone="warning" className="mt-6">
              Only {stock} left today.
            </InlineNotice>
          ) : null}
          {!available ? (
            <InlineNotice tone="danger" className="mt-6">
              This option is sold out right now. Try another choice or check back later.
            </InlineNotice>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <QuantityStepper value={quantity} onChange={setQuantity} max={stock} />
            <Button size="lg" onClick={handleAdd} disabled={!available || price === null} className="flex-1 sm:flex-none">
              <Icon name="plus" size={16} />
              Add to order
              {price !== null ? <span className="font-normal opacity-90">{" · "}</span> : null}
              {price !== null ? <Price amountMinor={price * quantity} currency={currency} className="text-white" size="sm" /> : null}
            </Button>
          </div>
          <p className="mt-3 text-xs text-ink-faint">Prices and availability are confirmed by the restaurant when you place the order.</p>
        </div>
      </div>

      {addOns.length ? (
        <section className="space-y-4" aria-labelledby="add-ons">
          <h2 id="add-ons" className="text-2xl font-bold text-ink">
            Goes well with
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {addOns.map((item) => {
              const thumb = imageUrl(coverImage(item), "thumbnail");
              const itemPrice = variantPriceMinor(item, item.variants?.[0] ?? null);
              return (
                <li key={item.id} className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-soft-sm">
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-line">
                    {thumb ? <Image src={thumb} alt="" fill sizes="56px" className="object-cover" /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <Link href={`/menu/${item.slug}`} className="block truncate font-semibold text-ink hover:text-gold">
                      {item.name}
                    </Link>
                    {itemPrice !== null ? <Price amountMinor={itemPrice} currency={currencyOf(item)} size="sm" /> : null}
                  </span>
                  <QuickAddButton product={item} compact />
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
