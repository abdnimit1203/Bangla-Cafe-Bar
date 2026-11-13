"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import type { BookingService, BookingSlots } from "@classytic/commerce-client/booking-types";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChipButton } from "@/components/ui/chip";
import { Input, Select } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState, InlineNotice } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { useAsyncResource } from "@/hooks/use-async-resource";
import { useHydrated } from "@/hooks/use-hydrated";
import { clearAttemptKey, resolveAttemptKey, sessionKeyStore, stableFingerprint } from "@/lib/commerce/attempt-key";
import { getStorefrontClient } from "@/lib/commerce/client";
import { describeError, fieldErrorsOf, isCapabilityDisabled } from "@/lib/commerce/errors";
import { saveReservationAccess } from "@/lib/commerce/order-access";
import {
  dayWindow,
  guestOptions,
  reservationDates,
  serviceForPartySize,
  timeOptions,
  type TimeOption,
} from "@/lib/commerce/reservations";
import { restaurantConfig } from "@/lib/config/restaurant";
import { formatDate, toDateKey, weekdayShort } from "@/lib/utils/dates";
import { normalizePhone } from "@/lib/validation/phone";
import { hasErrors, type FieldErrors } from "@/lib/validation/checkout";
import { validateReservation } from "@/lib/validation/reservation";
import type { CustomerDetails } from "@/types/fulfillment";

const ATTEMPT_SCOPE = "bcb-reservation-attempt";

const loadServices = (signal: AbortSignal) => getStorefrontClient().bookings.services({ limit: 50, signal });

/** Dates depend on the visitor's clock, so the form mounts after hydration. */
export function ReservationFlow() {
  const hydrated = useHydrated();
  if (!hydrated) return <ReservationSkeleton />;
  return <ReservationForm />;
}

function ReservationSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Skeleton className="h-96 rounded-card" />
      <Skeleton className="h-64 rounded-card" />
    </div>
  );
}

function ReservationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const services = useAsyncResource<BookingService[]>(loadServices);

  const dates = useMemo(() => reservationDates(new Date()), []);
  const [dateKey, setDateKey] = useState(() => toDateKey(dates[0] ?? new Date()));
  const [partySize, setPartySize] = useState(2);
  const [slot, setSlot] = useState<TimeOption | null>(null);
  const [customer, setCustomer] = useState<CustomerDetails>({ name: "", phone: "", email: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const service = useMemo(
    () => (services.data ? serviceForPartySize(services.data, partySize) : null),
    [services.data, partySize],
  );
  const serviceId = service?.id ?? null;

  const loadSlots = useCallback(
    async (signal: AbortSignal): Promise<BookingSlots | null> => {
      if (!serviceId) return null;
      const { from, to } = dayWindow(dateKey);
      return getStorefrontClient().bookings.slots({ serviceId, from, to }, { signal });
    },
    [serviceId, dateKey],
  );
  const slots = useAsyncResource<BookingSlots | null>(loadSlots);
  const times = useMemo(() => (slots.data ? timeOptions(slots.data) : []), [slots.data]);

  if (services.loading && !services.data) return <ReservationSkeleton />;

  if (services.error) {
    if (isCapabilityDisabled(services.error)) {
      return (
        <EmptyState
          icon="calendar"
          title="Online reservations aren't open yet"
          description={`Table booking hasn't been switched on for this restaurant's online store. Please call ${restaurantConfig.phone} to reserve.`}
          action={
            <ButtonLink href="/menu" variant="secondary">
              Browse the menu instead
            </ButtonLink>
          }
        />
      );
    }
    return (
      <ErrorState
        title="Reservations couldn't load"
        description={describeError(services.error)}
        action={
          <Button variant="secondary" onClick={services.reload}>
            <Icon name="refresh" size={16} /> Try again
          </Button>
        }
      />
    );
  }

  if (!services.data?.length) {
    return (
      <EmptyState
        icon="calendar"
        title="No tables are set up for online booking yet"
        description={`Please call ${restaurantConfig.phone} to reserve a table.`}
      />
    );
  }

  async function submit() {
    const validation = validateReservation(
      { dateKey, partySize, startsAt: slot?.startsAt ?? null, resourceRef: slot?.resourceRef ?? null, customer },
      { maxGuests: restaurantConfig.reservation.maxGuests, daysAhead: restaurantConfig.reservation.daysAhead, now: new Date() },
    );
    if (!service) validation.partySize = `We can't seat a party of ${partySize} online. Please call us.`;
    setErrors(validation);
    if (hasErrors(validation) || !service || !slot) {
      setSubmitError("Please fix the highlighted fields.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    const email = customer.email?.trim();
    const input = {
      serviceId: service.id,
      resourceRef: slot.resourceRef,
      startsAt: slot.startsAt,
      expectedPriceMinor: service.price.amount,
      customer: { name: customer.name.trim(), phone: normalizePhone(customer.phone), ...(email ? { email } : {}) },
    };
    const store = sessionKeyStore();
    const idempotencyKey = resolveAttemptKey(store, ATTEMPT_SCOPE, stableFingerprint(input));
    try {
      const booking = await getStorefrontClient().bookings.create(input, { idempotencyKey });
      saveReservationAccess({
        id: booking.id,
        accessToken: booking.accessToken,
        reservationNumber: booking.reservationNumber,
        startsAt: booking.startsAt,
        createdAt: new Date().toISOString(),
      });
      clearAttemptKey(store, ATTEMPT_SCOPE);
      toast({ title: "Table reserved", description: `Booking ${booking.reservationNumber} confirmed.`, tone: "success" });
      router.push(`/reservation/${booking.id}`);
    } catch (failure) {
      const serverFields = fieldErrorsOf(failure);
      if (Object.keys(serverFields).length) setErrors(serverFields);
      setSubmitError(describeError(failure, "We couldn't complete the reservation. Please try again."));
      setSubmitting(false);
      slots.reload();
    }
  }

  return (
    <form
      className="grid gap-6 lg:grid-cols-[1.4fr_1fr]"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-ink">1. When?</h2>
          <div className="no-scrollbar -mx-2 mt-4 flex gap-2 overflow-x-auto px-2 pb-1" role="radiogroup" aria-label="Date">
            {dates.map((date) => {
              const key = toDateKey(date);
              return (
                <ChipButton
                  key={key}
                  selected={key === dateKey}
                  onClick={() => {
                    setDateKey(key);
                    setSlot(null);
                  }}
                  className="h-auto flex-col gap-0 px-4 py-2"
                >
                  <span className="text-[11px] uppercase text-ink-faint">{weekdayShort(date)}</span>
                  <span>{formatDate(date)}</span>
                </ChipButton>
              );
            })}
          </div>
          {errors.dateKey ? <p className="mt-2 text-xs text-danger">{errors.dateKey}</p> : null}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Select
              id="partySize"
              label="Guests"
              value={partySize}
              error={errors.partySize}
              onChange={(event) => {
                setPartySize(Number(event.target.value));
                setSlot(null);
              }}
            >
              {guestOptions().map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "guest" : "guests"}
                </option>
              ))}
            </Select>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-ink">Table</span>
              <span className="flex h-11 items-center rounded-xl bg-surface px-4 text-sm text-ink-muted shadow-inset">
                {service ? service.name : "Not available for this party size"}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-ink">2. What time?</h2>
          <div className="mt-4">
            {!service ? (
              <InlineNotice tone="warning">We can&apos;t seat a party of {partySize} online. Call {restaurantConfig.phone} and we&apos;ll arrange it.</InlineNotice>
            ) : slots.loading && !slots.data ? (
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 8 }, (_, i) => (
                  <Skeleton key={i} className="h-10 w-20 rounded-full" />
                ))}
              </div>
            ) : slots.error ? (
              <ErrorState
                compact
                title="Times couldn't load"
                description={describeError(slots.error)}
                action={
                  <Button variant="secondary" size="sm" onClick={slots.reload}>
                    Try again
                  </Button>
                }
              />
            ) : times.length ? (
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Time">
                {times.map((option) => (
                  <ChipButton
                    key={`${option.startsAt}-${option.resourceRef}`}
                    selected={slot?.startsAt === option.startsAt}
                    onClick={() => setSlot(option)}
                  >
                    {option.label}
                  </ChipButton>
                ))}
              </div>
            ) : (
              <InlineNotice tone="info">No tables are free on {formatDate(dateKey)} for {partySize} guests. Try another day.</InlineNotice>
            )}
            {errors.startsAt ? <p className="mt-2 text-xs text-danger">{errors.startsAt}</p> : null}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-ink">3. Your details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input id="name" label="Name" autoComplete="name" value={customer.name} error={errors.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
            <Input
              id="phone"
              label="Mobile number"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="01712345678"
              value={customer.phone}
              error={errors.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
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
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
            />
          </div>
        </Card>
      </div>

      <Card className="h-fit p-6 lg:sticky lg:top-28">
        <h2 className="text-xl font-bold text-ink">Your reservation</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <Row label="Date">{formatDate(dateKey)}</Row>
          <Row label="Time">{slot ? slot.label : "Not chosen"}</Row>
          <Row label="Guests">{partySize}</Row>
          <Row label="Table">{service?.name ?? "-"}</Row>
          {service && service.price.amount > 0 ? (
            <Row label="Booking fee">Pay at the restaurant</Row>
          ) : null}
        </dl>
        <p className="mt-4 text-xs text-ink-faint">
          Your table is held by the restaurant as soon as the booking is confirmed. You can cancel from the confirmation page.
        </p>
        {submitError ? (
          <InlineNotice tone="danger" className="mt-4">
            {submitError}
          </InlineNotice>
        ) : null}
        <Button type="submit" size="lg" className="mt-5 w-full" loading={submitting} disabled={!service || !slot}>
          Request reservation
          <Icon name="arrowRight" size={16} />
        </Button>
      </Card>
    </form>
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
