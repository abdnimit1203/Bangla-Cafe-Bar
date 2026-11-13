"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DeliveryFields, type DistrictData } from "@/components/checkout/delivery-fields";
import { FulfillmentSelector } from "@/components/checkout/fulfillment-selector";
import { OrderSummary } from "@/components/checkout/order-summary";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, InlineNotice } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { useAsyncResource } from "@/hooks/use-async-resource";
import { useHydrated } from "@/hooks/use-hydrated";
import { useQuote } from "@/hooks/use-quote";
import { clearAttemptKey, resolveAttemptKey, sessionKeyStore, stableFingerprint } from "@/lib/commerce/attempt-key";
import { buildCheckoutInput } from "@/lib/commerce/checkout";
import { getStorefrontClient } from "@/lib/commerce/client";
import { describeError, fieldErrorsOf } from "@/lib/commerce/errors";
import { saveOrderAccess } from "@/lib/commerce/order-access";
import { restaurantConfig } from "@/lib/config/restaurant";
import { hoursForDate, pickupSlots } from "@/lib/restaurant/hours";
import { hasErrors, validateCheckout, type FieldErrors } from "@/lib/validation/checkout";
import { selectCurrency, selectLines, selectSubtotalMinor, useCart } from "@/stores/cart";
import type { CustomerDetails, DeliveryDetails, FulfillmentMode, FulfillmentSelection } from "@/types/fulfillment";

const ATTEMPT_SCOPE = "bcb-checkout-attempt";

function enabledModes(): FulfillmentMode[] {
  const f = restaurantConfig.fulfillment;
  const modes: FulfillmentMode[] = [];
  if (f.delivery.enabled) modes.push("delivery");
  if (f.pickup.enabled) modes.push("pickup");
  if (f.dineIn.enabled) modes.push("dine_in");
  return modes;
}

const EMPTY_DELIVERY: DeliveryDetails = { district: "", districtName: "", line1: "", line2: "", postalCode: "" };

const loadDistricts = async (signal: AbortSignal): Promise<DistrictData> => {
  if (!restaurantConfig.fulfillment.delivery.enabled) return { requiresArea: false, data: [] };
  return getStorefrontClient().deliveryDistricts({ signal });
};

/** Browser-only state (cart, clock) is read after hydration so the static shell stays stable. */
export function CheckoutFlow() {
  const hydrated = useHydrated();
  if (!hydrated) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Skeleton className="h-96 rounded-card" />
        <Skeleton className="h-72 rounded-card" />
      </div>
    );
  }
  return <CheckoutForm />;
}

function CheckoutForm() {
  const lines = useCart(selectLines);
  const subtotal = useCart(selectSubtotalMinor);
  const currency = useCart(selectCurrency) ?? "BDT";
  const clearCart = useCart((state) => state.clear);
  const router = useRouter();
  const { toast } = useToast();

  const modes = useMemo(() => enabledModes(), []);
  const [mode, setMode] = useState<FulfillmentMode>(modes[0] ?? "delivery");
  const [customer, setCustomer] = useState<CustomerDetails>({ name: "", phone: "", email: "" });
  const [delivery, setDelivery] = useState<DeliveryDetails>(EMPTY_DELIVERY);
  const [pickupAt, setPickupAt] = useState("");
  const [tableRef, setTableRef] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const districts = useAsyncResource<DistrictData>(loadDistricts);
  const requiresArea = districts.data?.requiresArea ?? false;
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [slots] = useState(() => pickupSlots(new Date()));
  const todayHours = hoursForDate(new Date());

  const selection: FulfillmentSelection =
    mode === "delivery"
      ? { mode, delivery }
      : mode === "pickup"
        ? { mode, pickup: { pickupAt } }
        : { mode, dineIn: { tableRef } };

  const quoteState = useQuote(lines, selection, promoCode);

  if (!lines.length) {
    return (
      <EmptyState
        icon="bag"
        title="Nothing to check out yet"
        description="Your order tray is empty. Add some dishes first."
        action={<ButtonLink href="/menu">Browse the menu</ButtonLink>}
      />
    );
  }

  async function placeOrder() {
    const rules = { requiresArea, requireTable: restaurantConfig.fulfillment.dineIn.requireTable };
    const validation = validateCheckout(lines, customer, selection, rules);
    setErrors(validation);
    if (hasErrors(validation)) {
      setSubmitError("Please fix the highlighted fields.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    const input = buildCheckoutInput(lines, customer, selection, {
      promoCode,
      quoteToken: quoteState.quote?.quoteToken,
    });
    // Same payload => same key, so a retry after a lost response cannot duplicate the order.
    const store = sessionKeyStore();
    const idempotencyKey = resolveAttemptKey(store, ATTEMPT_SCOPE, stableFingerprint(input));
    try {
      const placed = await getStorefrontClient().checkout(input, { idempotencyKey });
      saveOrderAccess({
        orderNumber: placed.orderNumber,
        accessToken: placed.accessToken,
        placedAt: placed.createdAt ?? new Date().toISOString(),
        grandTotalMinor: placed.totals?.grandTotal?.amount,
        currency: placed.currency,
      });
      clearAttemptKey(store, ATTEMPT_SCOPE);
      clearCart();
      toast({ title: "Order placed", description: `Order ${placed.orderNumber} is with the kitchen.`, tone: "success" });
      router.push(`/order/${encodeURIComponent(placed.orderNumber)}`);
    } catch (failure) {
      const serverFields = fieldErrorsOf(failure);
      if (Object.keys(serverFields).length) setErrors(serverFields);
      setSubmitError(describeError(failure, "We couldn't place your order. Please try again."));
      setSubmitting(false);
    }
  }

  return (
    <form
      className="grid gap-6 lg:grid-cols-[1.6fr_1fr]"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void placeOrder();
      }}
    >
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-ink">1. How would you like your food?</h2>
          <div className="mt-4">
            <FulfillmentSelector modes={modes} value={mode} onChange={setMode} />
          </div>
          <div className="mt-6">
            {mode === "delivery" ? (
              <DeliveryFields
                value={delivery}
                onChange={setDelivery}
                errors={errors}
                districts={districts.data}
                districtsLoading={districts.loading}
                districtsError={districts.error}
              />
            ) : null}
            {mode === "pickup" ? (
              slots.length ? (
                <Select
                  id="pickupAt"
                  label="Collection time"
                  hint={`Orders are ready about ${restaurantConfig.fulfillment.pickup.leadMinutes} minutes after you place them.`}
                  value={pickupAt}
                  error={errors.pickupAt}
                  onChange={(event) => setPickupAt(event.target.value)}
                >
                  <option value="">Choose a time</option>
                  {slots.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      Today {slot.label}
                    </option>
                  ))}
                </Select>
              ) : (
                <InlineNotice tone="warning">
                  Pickup isn&apos;t available right now.{" "}
                  {todayHours ? `Today's kitchen hours are ${todayHours.open} - ${todayHours.close}.` : "The kitchen is closed today."}
                </InlineNotice>
              )
            ) : null}
            {mode === "dine_in" ? (
              <Input
                id="tableRef"
                label="Table number"
                optional={!restaurantConfig.fulfillment.dineIn.requireTable}
                placeholder="e.g. 8"
                hint="You'll find it on the card at your table."
                value={tableRef}
                error={errors.tableRef}
                onChange={(event) => setTableRef(event.target.value)}
              />
            ) : null}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-ink">2. Your details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input
              id="name"
              label="Name"
              autoComplete="name"
              value={customer.name}
              error={errors.name}
              onChange={(event) => setCustomer({ ...customer, name: event.target.value })}
            />
            <Input
              id="phone"
              label="Mobile number"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="01712345678"
              value={customer.phone}
              error={errors.phone}
              onChange={(event) => setCustomer({ ...customer, phone: event.target.value })}
            />
            <Input
              id="email"
              label="Email"
              optional
              type="email"
              autoComplete="email"
              value={customer.email ?? ""}
              error={errors.email}
              wrapperClassName="sm:col-span-2"
              onChange={(event) => setCustomer({ ...customer, email: event.target.value })}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-ink">3. Promo code</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <Input
              id="promo"
              label="Code"
              optional
              value={promoInput}
              wrapperClassName="flex-1"
              onChange={(event) => setPromoInput(event.target.value.toUpperCase())}
            />
            <Button type="button" variant="secondary" onClick={() => setPromoCode(promoInput.trim())} disabled={!promoInput.trim()}>
              Apply
            </Button>
            {promoCode ? (
              <Button type="button" variant="ghost" onClick={() => { setPromoCode(""); setPromoInput(""); }}>
                Remove
              </Button>
            ) : null}
          </div>
        </Card>
      </div>

      <OrderSummary
        lines={lines}
        subtotalMinor={subtotal}
        currency={currency}
        quote={quoteState.quote}
        quoteLoading={quoteState.loading}
        quoteError={quoteState.error}
        mode={mode}
      >
        {submitError ? (
          <InlineNotice tone="danger" className="mt-4">
            {submitError}
          </InlineNotice>
        ) : null}
        <Button type="submit" size="lg" className="mt-5 w-full" loading={submitting} disabled={mode === "pickup" && !slots.length}>
          Place order
          <Icon name="arrowRight" size={16} />
        </Button>
      </OrderSummary>
    </form>
  );
}
