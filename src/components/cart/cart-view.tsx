"use client";

import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/states";
import { useHydrated } from "@/hooks/use-hydrated";
import { selectCurrency, selectLines, selectSubtotalMinor, useCart } from "@/stores/cart";

export function CartView() {
  const hydrated = useHydrated();
  const lines = useCart(selectLines);
  const subtotal = useCart(selectSubtotalMinor);
  const currency = useCart(selectCurrency);
  const setQuantity = useCart((state) => state.setQuantity);
  const remove = useCart((state) => state.remove);

  if (!hydrated) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Skeleton className="h-48 rounded-card" />
        <Skeleton className="h-48 rounded-card" />
      </div>
    );
  }

  if (!lines.length) {
    return (
      <EmptyState
        icon="bag"
        title="Your order tray is empty"
        description="Add a few dishes from the menu and they'll show up here."
        action={<ButtonLink href="/menu">Browse the menu</ButtonLink>}
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <ul className="space-y-3">
        {lines.map((line) => (
          <li key={line.key} className="flex gap-4 rounded-card bg-surface p-4 shadow-soft">
            <Link href={`/menu/${line.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-line">
              {line.imageUrl ? (
                <Image src={line.imageUrl} alt="" fill sizes="80px" className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-ink-faint">
                  <Icon name="utensils" />
                </span>
              )}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/menu/${line.slug}`} className="block truncate font-display text-base font-bold text-ink hover:text-gold">
                    {line.name}
                  </Link>
                  {line.variantLabel ? <p className="text-xs text-ink-muted">{line.variantLabel}</p> : null}
                  <Price amountMinor={line.unitPriceMinor} currency={line.currency} size="sm" className="mt-1" />
                </div>
                <button
                  type="button"
                  onClick={() => remove(line.key)}
                  className="rounded-full p-2 text-ink-faint hover:bg-danger-soft hover:text-danger"
                  aria-label={`Remove ${line.name}`}
                >
                  <Icon name="trash" size={16} />
                </button>
              </div>
              <div className="flex items-center justify-between gap-3">
                <QuantityStepper
                  value={line.quantity}
                  onChange={(next) => setQuantity(line.key, next)}
                  max={line.maxQuantity}
                  size="sm"
                  label={`Quantity for ${line.name}`}
                />
                <Price amountMinor={line.unitPriceMinor * line.quantity} currency={line.currency} />
              </div>
              {line.maxQuantity !== null && line.quantity >= line.maxQuantity ? (
                <p className="text-xs text-warning">Maximum available quantity reached.</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <Card className="h-fit p-6 lg:sticky lg:top-28">
        <h2 className="text-xl font-bold text-ink">Summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-muted">Subtotal (estimated)</dt>
            <dd className="font-semibold text-ink">{currency ? <Price amountMinor={subtotal} currency={currency} size="sm" /> : null}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Delivery charge</dt>
            <dd className="text-ink-faint">Calculated at checkout</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-ink-faint">
          Final prices, availability and delivery charges are confirmed by the restaurant at checkout.
        </p>
        <ButtonLink href="/checkout" size="lg" className="mt-5 w-full">
          Go to checkout
          <Icon name="arrowRight" size={16} />
        </ButtonLink>
        <ButtonLink href="/menu" variant="ghost" className="mt-2 w-full">
          Add more dishes
        </ButtonLink>
      </Card>
    </div>
  );
}
