"use client";

import type { DeliveryQuote } from "@classytic/commerce-client/delivery-types";
import { Card } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import { Spinner } from "@/components/ui/spinner";
import { InlineNotice } from "@/components/ui/states";
import { describeError } from "@/lib/commerce/errors";
import type { CartLine } from "@/types/cart";
import type { FulfillmentMode } from "@/types/fulfillment";

export function OrderSummary({
  lines,
  subtotalMinor,
  currency,
  quote,
  quoteLoading,
  quoteError,
  mode,
  children,
}: {
  lines: CartLine[];
  subtotalMinor: number;
  currency: string;
  quote: DeliveryQuote | null;
  quoteLoading: boolean;
  quoteError: unknown;
  mode: FulfillmentMode;
  children?: React.ReactNode;
}) {
  const displayCurrency = quote?.currency ?? currency;
  const subtotal = quote?.subtotalMinor ?? subtotalMinor;
  const discount = quote?.discountMinor ?? 0;
  const delivery = quote?.deliveryChargeMinor ?? null;
  const total = quote?.grandTotalMinor ?? (delivery !== null ? subtotal - discount + delivery : null);

  return (
    <Card className="h-fit p-6 lg:sticky lg:top-28">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink">Order summary</h2>
        {quoteLoading ? <Spinner size={16} className="text-gold" /> : null}
      </div>
      <ul className="mt-4 divide-y divide-line/70 text-sm">
        {lines.map((line) => (
          <li key={line.key} className="flex justify-between gap-3 py-2">
            <span className="min-w-0">
              <span className="block truncate font-medium text-ink">
                {line.quantity} x {line.name}
              </span>
              {line.variantLabel ? <span className="text-xs text-ink-muted">{line.variantLabel}</span> : null}
            </span>
            <Price amountMinor={line.unitPriceMinor * line.quantity} currency={line.currency} size="sm" />
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-2 border-t border-line/70 pt-4 text-sm">
        <Row label="Subtotal">
          <Price amountMinor={subtotal} currency={displayCurrency} size="sm" />
        </Row>
        {discount > 0 ? (
          <Row label="Discount">
            <span className="font-semibold text-success">- <Price amountMinor={discount} currency={displayCurrency} size="sm" className="text-success" /></span>
          </Row>
        ) : null}
        <Row label={mode === "delivery" ? "Delivery charge" : "Service charge"}>
          {delivery === null ? (
            <span className="text-ink-faint">{quoteLoading ? "Calculating..." : "Pending"}</span>
          ) : delivery === 0 ? (
            <span className="font-semibold text-success">Free</span>
          ) : (
            <Price amountMinor={delivery} currency={displayCurrency} size="sm" />
          )}
        </Row>
        {quote?.taxMinor ? (
          <Row label="Tax">
            <Price amountMinor={quote.taxMinor} currency={displayCurrency} size="sm" />
          </Row>
        ) : null}
        <div className="flex items-center justify-between border-t border-line/70 pt-3">
          <dt className="text-base font-bold text-ink">Total</dt>
          <dd>{total !== null ? <Price amountMinor={total} currency={displayCurrency} /> : <span className="text-ink-faint">Pending</span>}</dd>
        </div>
      </dl>
      {quote?.promotion?.rejectedCodes.length ? (
        <InlineNotice tone="warning" className="mt-3">
          Promo code {quote.promotion.rejectedCodes.map((c) => c.code).join(", ")} couldn&apos;t be applied.
        </InlineNotice>
      ) : null}
      {quote?.promotion?.appliedCodes.length ? (
        <InlineNotice tone="success" className="mt-3">
          Promo code {quote.promotion.appliedCodes.join(", ")} applied.
        </InlineNotice>
      ) : null}
      {quoteError ? (
        <InlineNotice tone="warning" className="mt-3">
          {describeError(quoteError, "We couldn't confirm the total yet. You can still place the order; the restaurant confirms the final amount.")}
        </InlineNotice>
      ) : null}
      <p className="mt-4 text-xs text-ink-faint">
        Totals are calculated by the restaurant. Payment is collected on delivery or at the counter.
      </p>
      {children}
    </Card>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-semibold text-ink">{children}</dd>
    </div>
  );
}
