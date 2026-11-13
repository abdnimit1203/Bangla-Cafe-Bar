import Image from "next/image";
import Link from "next/link";
import type { StorefrontProduct } from "@classytic/commerce-client/types";
import { QuickAddButton } from "@/components/product/quick-add-button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Price } from "@/components/ui/price";
import {
  coverImage,
  currencyOf,
  dietaryLabel,
  imageUrl,
  isChefsPick,
  isInStock,
  isSpicy,
  priceRangeMinor,
} from "@/lib/commerce/catalog-helpers";

export function ProductCard({
  product,
  variant = "default",
}: {
  product: StorefrontProduct;
  variant?: "default" | "drink" | "treat";
}) {
  const image = coverImage(product);
  const src = imageUrl(image);
  const range = priceRangeMinor(product);
  const diet = dietaryLabel(product);
  const available = isInStock(product);
  const href = `/menu/${product.slug}`;

  // Image 2 style: Recommended treat card with circular '+' button
  if (variant === "treat") {
    return (
      <article className="press group flex w-full flex-col rounded-3xl bg-surface-strong p-3.5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-sm">
        <Link href={href} className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-cream/60" aria-label={product.name}>
          {src ? (
            <Image
              src={src}
              alt={image?.alt ?? product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-forest/40">
              <Icon name="coffee" size={28} />
            </span>
          )}
          {product.onSale && (
            <span className="absolute left-2.5 top-2.5">
              <Badge tone="gold">Special</Badge>
            </span>
          )}
        </Link>
        <div className="flex flex-1 flex-col pt-3">
          <h3 className="font-display text-base font-bold text-ink">
            <Link href={href} className="transition-colors hover:text-orange">
              {product.name}
            </Link>
          </h3>
          {product.description && (
            <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{product.description}</p>
          )}
          <div className="mt-auto flex items-center justify-between pt-3">
            {range ? (
              <Price
                amountMinor={range.min}
                currency={currencyOf(product)}
                size="sm"
                className="font-bold text-ink"
              />
            ) : (
              <span className="text-xs text-ink-faint">Seasonal</span>
            )}
            <QuickAddButton product={product} circle />
          </div>
        </div>
      </article>
    );
  }

  // Image 1 style: Signature Drink card with circular backdrop emblem
  if (variant === "drink") {
    return (
      <article className="press group flex w-full flex-col rounded-3xl bg-surface-strong p-5 text-center shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft-sm">
        <Link href={href} className="relative mx-auto flex aspect-square w-36 items-center justify-center sm:w-44" aria-label={product.name}>
          {/* Organic circular badge behind drink (Image 1 style) */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-sage-soft/80 to-cream transition-transform duration-500 group-hover:scale-110" />
          {src ? (
            <div className="relative h-28 w-28 sm:h-36 sm:w-36">
              <Image
                src={src}
                alt={image?.alt ?? product.name}
                fill
                sizes="(min-width: 1024px) 20vw, 40vw"
                className="object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ) : (
            <Icon name="coffee" size={40} className="relative z-10 text-forest/50" />
          )}
        </Link>

        <div className="mt-4 flex flex-1 flex-col">
          <h3 className="font-display text-lg font-bold text-ink">
            <Link href={href} className="transition-colors hover:text-orange">
              {product.name}
            </Link>
          </h3>
          {product.description && (
            <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{product.description}</p>
          )}
          <div className="mt-3">
            {range && (
              <Price
                amountMinor={range.min}
                currency={currencyOf(product)}
                size="md"
                className="font-bold text-ink"
              />
            )}
          </div>
          <div className="mt-4 flex justify-center">
            <QuickAddButton product={product} />
          </div>
        </div>
      </article>
    );
  }

  // Default versatile card
  return (
    <article className="press group flex w-full flex-col rounded-card bg-surface-strong p-3.5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-sm">
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-sage-soft/60" aria-label={product.name}>
        <span className="blob absolute inset-[8%] bg-sand/60 transition-transform duration-500 group-hover:scale-105" aria-hidden="true" />
        {src ? (
          <Image
            src={src}
            alt={image?.alt ?? product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-forest/50">
            <Icon name="utensils" size={28} />
          </span>
        )}
        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1">
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
          {isChefsPick(product) ? <Badge tone="dark">Chef&apos;s pick</Badge> : null}
          {product.onSale ? <Badge tone="gold">Special Offer</Badge> : null}
        </div>
        {!available && (
          <span className="absolute bottom-2.5 right-2.5">
            <Badge tone="dark">Sold out</Badge>
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-1.5 pt-3.5">
        <h3 className="font-display text-lg font-bold leading-snug text-ink">
          <Link href={href} className="transition-colors hover:text-orange">
            {product.name}
          </Link>
        </h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{product.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line/60 pt-3.5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Price</p>
            {range ? (
              <Price
                amountMinor={range.min}
                currency={currencyOf(product)}
                compareAtMinor={product.monetization?.compareAtPrice?.amount}
                prefix={range.min !== range.max ? "from" : undefined}
                size="sm"
                className="font-bold text-ink"
              />
            ) : (
              <span className="text-xs text-ink-faint">Ask staff</span>
            )}
          </div>
          <QuickAddButton product={product} />
        </div>
      </div>
    </article>
  );
}
