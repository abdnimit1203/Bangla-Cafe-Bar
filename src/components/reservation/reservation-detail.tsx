"use client";

import { useCallback, useState } from "react";
import type { StorefrontBooking } from "@classytic/commerce-client/booking-types";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState, InlineNotice } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { useAsyncResource } from "@/hooks/use-async-resource";
import { clearAttemptKey, resolveAttemptKey, sessionKeyStore } from "@/lib/commerce/attempt-key";
import { getStorefrontClient } from "@/lib/commerce/client";
import { describeError } from "@/lib/commerce/errors";
import { getReservationAccess } from "@/lib/commerce/order-access";
import { canCancelReservation, reservationStatusLabel } from "@/lib/commerce/reservations";
import { restaurantConfig } from "@/lib/config/restaurant";
import { formatDate, formatTime } from "@/lib/utils/dates";

class NoAccessError extends Error {}

export function ReservationDetail({ id }: { id: string }) {
  const { toast } = useToast();
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [override, setOverride] = useState<StorefrontBooking | null>(null);

  const load = useCallback(
    async (signal: AbortSignal): Promise<StorefrontBooking> => {
      const access = getReservationAccess(id);
      if (!access) throw new NoAccessError();
      return getStorefrontClient().bookings.read(access, { signal });
    },
    [id],
  );
  const { data, error, loading, reload } = useAsyncResource(load);
  const booking = override ?? data;

  if (loading && !booking) return <Skeleton className="h-72 rounded-card" />;

  if (error instanceof NoAccessError) {
    return (
      <EmptyState
        icon="calendar"
        title="We can't open this reservation on this device"
        description={`For privacy, booking details are only available on the device used to make them. Call ${restaurantConfig.phone} if you need help.`}
        action={<ButtonLink href="/reservation" variant="secondary">Make a reservation</ButtonLink>}
      />
    );
  }

  if (error && !booking) {
    return (
      <ErrorState
        title="Couldn't load your reservation"
        description={describeError(error)}
        action={
          <Button variant="secondary" onClick={reload}>
            <Icon name="refresh" size={16} /> Try again
          </Button>
        }
      />
    );
  }
  if (!booking) return null;

  const cancellable = canCancelReservation(booking.status);
  const tone = booking.status === "confirmed" || booking.status === "checked_in" ? "green" : booking.status === "canceled" || booking.status === "no_show" || booking.status === "expired" ? "red" : "gold";

  async function cancel() {
    if (!window.confirm("Cancel this reservation? The table will be released.")) return;
    const access = getReservationAccess(id);
    if (!access) return;
    setCancelling(true);
    setCancelError(null);
    const store = sessionKeyStore();
    const scope = `bcb-reservation-cancel-${id}`;
    const idempotencyKey = resolveAttemptKey(store, scope, id);
    try {
      const updated = await getStorefrontClient().bookings.cancel(access, { idempotencyKey });
      clearAttemptKey(store, scope);
      setOverride(updated);
      toast({ title: "Reservation cancelled", tone: "info" });
    } catch (failure) {
      setCancelError(describeError(failure, "We couldn't cancel the reservation. Please try again or call us."));
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Table reservation</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-ink">Booking {booking.reservationNumber}</h1>
          <Badge tone={tone}>{reservationStatusLabel(booking.status)}</Badge>
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <Item icon="calendar" label="Date" value={formatDate(booking.startsAt)} />
          <Item icon="clock" label="Time" value={`${formatTime(booking.startsAt)} - ${formatTime(booking.endsAt)}`} />
          <Item icon="users" label="Table" value={booking.serviceName} />
          <Item icon="pin" label="Where" value={`${restaurantConfig.address.line1}, ${restaurantConfig.address.city}`} />
        </dl>
        <p className="mt-6 text-sm text-ink-muted">
          {booking.payment === "pay_at_venue" && booking.price.amount > 0
            ? "Any booking fee is settled at the restaurant."
            : "No payment is needed to hold your table."}{" "}
          Running late? Call {restaurantConfig.phone}.
        </p>
        {cancelError ? (
          <InlineNotice tone="danger" className="mt-4">
            {cancelError}
          </InlineNotice>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          {cancellable ? (
            <Button variant="danger" onClick={cancel} loading={cancelling}>
              Cancel reservation
            </Button>
          ) : null}
          <Button variant="secondary" onClick={reload} loading={loading}>
            <Icon name="refresh" size={16} /> Refresh
          </Button>
          <ButtonLink href="/menu" variant="ghost">
            See the menu
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}

function Item({ icon, label, value }: { icon: "calendar" | "clock" | "users" | "pin"; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-surface p-4 shadow-inset">
      <Icon name={icon} size={18} className="mt-0.5 text-gold" />
      <div>
        <dt className="text-xs uppercase tracking-wide text-ink-faint">{label}</dt>
        <dd className="font-semibold text-ink">{value}</dd>
      </div>
    </div>
  );
}
