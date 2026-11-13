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
import { getReservationAccess, saveReservationAccess } from "@/lib/commerce/order-access";
import { canCancelReservation, reservationStatusLabel } from "@/lib/commerce/reservations";
import { restaurantConfig } from "@/lib/config/restaurant";
import { formatDate, formatTime } from "@/lib/utils/dates";
import { QRCodeSvg } from "@/components/ui/qr-code";
import { PassActions } from "@/components/ui/pass-actions";

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
      try {
        return await getStorefrontClient().bookings.read(access, { signal });
      } catch (err) {
        if (access.snapshot) {
          return access.snapshot as StorefrontBooking;
        }
        throw err;
      }
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
      if (access.snapshot) {
        const cancelled = { ...(access.snapshot as StorefrontBooking), status: "canceled" as const };
        access.snapshot = cancelled;
        saveReservationAccess(access);
        setOverride(cancelled);
        clearAttemptKey(store, scope);
        toast({ title: "Reservation cancelled", tone: "info" });
      } else {
        setCancelError(describeError(failure, "We couldn't cancel the reservation. Please try again or call us."));
      }
    } finally {
      setCancelling(false);
    }
  }

  const passDetails = {
    type: "reservation" as const,
    referenceNumber: booking.reservationNumber,
    title: "Table Reservation Pass",
    status: reservationStatusLabel(booking.status),
    fields: [
      { label: "Date", value: formatDate(booking.startsAt) },
      { label: "Time", value: `${formatTime(booking.startsAt)} - ${formatTime(booking.endsAt)}` },
      { label: "Party / Table", value: booking.serviceName },
      { label: "Location", value: `${restaurantConfig.address.line1}, ${restaurantConfig.address.city}` },
    ],
    qrValue: `BCB-RES:${booking.reservationNumber}:${booking.startsAt}`,
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col-reverse justify-between gap-6 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Official Reservation Pass</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-ink sm:text-3xl">Booking {booking.reservationNumber}</h1>
              <Badge tone={tone}>{reservationStatusLabel(booking.status)}</Badge>
            </div>
            <p className="mt-2 text-xs text-ink-muted">
              Show this pass or QR code at the reception when arriving at the restaurant.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <QRCodeSvg value={passDetails.qrValue} size={110} />
            <span className="mt-1.5 text-[10px] font-bold text-ink-faint uppercase tracking-wider">Scan at Door</span>
          </div>
        </div>

        <div className="mt-5 border-t border-line/60 pt-4">
          <p className="text-xs font-bold text-ink uppercase tracking-wider mb-2">Save Proof / Offline Access</p>
          <PassActions details={passDetails} />
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
