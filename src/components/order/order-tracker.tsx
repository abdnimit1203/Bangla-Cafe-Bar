"use client";

import { useCallback, useEffect } from "react";
import type { StorefrontOrder } from "@classytic/commerce-client/types";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Price } from "@/components/ui/price";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { useAsyncResource } from "@/hooks/use-async-resource";
import { getStorefrontClient } from "@/lib/commerce/client";
import { describeError } from "@/lib/commerce/errors";
import { getOrderAccess } from "@/lib/commerce/order-access";
import {
  isTerminalStage,
  ORDER_STEPS,
  orderStage,
  paymentTermLabel,
  stageIndex,
  statusLabel,
} from "@/lib/commerce/order-status";
import { restaurantConfig } from "@/lib/config/restaurant";
import { formatDateTime } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";
import { QRCodeSvg } from "@/components/ui/qr-code";
import { PassActions } from "@/components/ui/pass-actions";

class NoAccessError extends Error {}

const POLL_MS = 30_000;

export function OrderTracker({ orderNumber }: { orderNumber: string }) {
  const load = useCallback(
    async (signal: AbortSignal): Promise<StorefrontOrder> => {
      const access = getOrderAccess(orderNumber);
      if (!access) throw new NoAccessError();
      return getStorefrontClient().orderStatus(access, { signal });
    },
    [orderNumber],
  );
  const { data: order, error, loading, reload } = useAsyncResource(load);
  const stage = orderStage(order?.status);

  useEffect(() => {
    if (!order || isTerminalStage(stage)) return;
    const timer = window.setInterval(reload, POLL_MS);
    return () => window.clearInterval(timer);
  }, [order, stage, reload]);

  if (loading && !order) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Skeleton className="h-80 rounded-card" />
        <Skeleton className="h-56 rounded-card" />
      </div>
    );
  }

  if (error instanceof NoAccessError) {
    return (
      <EmptyState
        icon="receipt"
        title="We can't open this order on this device"
        description={`Order ${orderNumber} was placed from another device or browser. For privacy, order details are only available where the order was placed. Call us on ${restaurantConfig.phone} and we'll help.`}
        action={
          <ButtonLink href="/menu" variant="secondary">
            Back to the menu
          </ButtonLink>
        }
      />
    );
  }

  if (error && !order) {
    return (
      <ErrorState
        title="Couldn't load your order"
        description={describeError(error)}
        action={
          <Button variant="secondary" onClick={reload}>
            <Icon name="refresh" size={16} /> Try again
          </Button>
        }
      />
    );
  }

  if (!order) return null;
  const currentIndex = stageIndex(stage);
  const cancelled = stage === "cancelled" || stage === "refunded";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Card className="p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Order confirmed</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-ink">Order {order.orderNumber}</h1>
          <Badge tone={cancelled ? "red" : stage === "completed" ? "green" : "gold"}>{statusLabel(order.status)}</Badge>
        </div>
        <p className="mt-2 text-sm text-ink-muted">Placed {formatDateTime(order.createdAt)}. Keep this page open to follow your order.</p>

        {cancelled ? (
          <div className="mt-6 rounded-2xl bg-danger-soft p-4 text-sm text-danger">
            This order was {statusLabel(order.status).toLowerCase()}. If you weren&apos;t expecting that, call us on {restaurantConfig.phone}.
          </div>
        ) : (
          <ol className="mt-8 space-y-0">
            {ORDER_STEPS.map((step, index) => {
              const done = index <= currentIndex;
              const current = index === currentIndex;
              return (
                <li key={step.stage} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                        done ? "bg-gold text-white" : "bg-surface text-ink-faint shadow-inset",
                      )}
                      aria-hidden="true"
                    >
                      {done && !current ? <Icon name="check" size={14} /> : index + 1}
                    </span>
                    {index < ORDER_STEPS.length - 1 ? (
                      <span className={cn("my-1 w-0.5 flex-1", done && index < currentIndex ? "bg-gold" : "bg-line")} />
                    ) : null}
                  </div>
                  <div className="pb-6">
                    <p className={cn("font-semibold", done ? "text-ink" : "text-ink-faint")}>
                      {step.label}
                      {current ? <span className="sr-only"> (current)</span> : null}
                    </p>
                    <p className="text-sm text-ink-muted">{step.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {stage === "unknown" ? (
          <p className="mt-4 text-sm text-ink-muted">Current status: {statusLabel(order.status)}.</p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={reload} loading={loading}>
            <Icon name="refresh" size={16} /> Refresh status
          </Button>
          <ButtonLink href="/menu" variant="ghost">
            Order something else
          </ButtonLink>
        </div>
      </Card>

      <Card className="h-fit p-6">
        <h2 className="text-lg font-bold text-ink">Order details</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <Row label="Subtotal">
            <Price amountMinor={order.totals.subtotal.amount} currency={order.currency} size="sm" />
          </Row>
          {order.totals.discount.amount > 0 ? (
            <Row label="Discount">
              <Price amountMinor={order.totals.discount.amount} currency={order.currency} size="sm" />
            </Row>
          ) : null}
          <Row label="Delivery / service">
            {order.totals.shipping.amount === 0 ? (
              <span className="text-success">Free</span>
            ) : (
              <Price amountMinor={order.totals.shipping.amount} currency={order.currency} size="sm" />
            )}
          </Row>
          {order.totals.tax.amount > 0 ? (
            <Row label="Tax">
              <Price amountMinor={order.totals.tax.amount} currency={order.currency} size="sm" />
            </Row>
          ) : null}
          <div className="flex items-center justify-between border-t border-line/70 pt-3">
            <dt className="text-base font-bold text-ink">Total</dt>
            <dd>
              <Price amountMinor={order.totals.grandTotal.amount} currency={order.currency} />
            </dd>
          </div>
        </dl>

        <div className="mt-5 space-y-2 text-sm text-ink-muted">
          <p className="flex items-center gap-2">
            <Icon name="receipt" size={16} className="text-gold" />
            {paymentTermLabel(order.paymentTerm)}
          </p>
          {order.paymentState && order.paymentState.chargeStatus !== "none" ? (
            <p>
              Paid so far: <Price amountMinor={order.paymentState.totalCharged.amount} currency={order.currency} size="sm" />
            </p>
          ) : null}
          {order.fulfillmentStatus ? <p>Fulfillment: {statusLabel(order.fulfillmentStatus)}</p> : null}
          <p className="flex items-center gap-2">
            <Icon name="phone" size={16} className="text-gold" />
            {restaurantConfig.phone}
          </p>
        </div>

        {/* Official QR Code & Receipt Actions */}
        <div className="mt-6 border-t border-line/70 pt-5">
          <div className="flex items-center gap-4 rounded-2xl bg-surface p-3.5 shadow-inset">
            <QRCodeSvg value={`BCB-ORDER:${order.orderNumber}`} size={84} />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-forest">Order QR Proof</p>
              <p className="mt-1 text-xs text-ink-muted">Scan to verify pickup, delivery, or counter payment.</p>
            </div>
          </div>

          <div className="mt-4">
            <PassActions
              details={{
                type: "order",
                referenceNumber: `Order ${order.orderNumber}`,
                title: "Official Order Receipt",
                status: statusLabel(order.status),
                fields: [
                  { label: "Date", value: formatDateTime(order.createdAt) },
                  { label: "Payment", value: paymentTermLabel(order.paymentTerm) },
                  { label: "Grand Total", value: `৳${(order.totals.grandTotal.amount / 100).toFixed(2)}` },
                  { label: "Phone", value: restaurantConfig.phone },
                ],
                qrValue: `BCB-ORDER:${order.orderNumber}`,
              }}
            />
          </div>
        </div>
      </Card>
    </div>
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
