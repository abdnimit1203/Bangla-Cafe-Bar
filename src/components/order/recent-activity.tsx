"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Price } from "@/components/ui/price";
import { EmptyState } from "@/components/ui/states";
import {
  listOrderAccess,
  listReservationAccess,
  type StoredOrderAccess,
  type StoredReservationAccess,
} from "@/lib/commerce/order-access";
import { formatDateTime } from "@/lib/utils/dates";

interface Snapshot {
  orders: StoredOrderAccess[];
  reservations: StoredReservationAccess[];
}

const EMPTY: Snapshot = { orders: [], reservations: [] };
let cached: Snapshot = EMPTY;
let cachedKey = "";

function getSnapshot(): Snapshot {
  const orders = listOrderAccess();
  const reservations = listReservationAccess();
  const key = JSON.stringify([orders.map((o) => o.orderNumber), reservations.map((r) => r.id)]);
  if (key !== cachedKey) {
    cachedKey = key;
    cached = { orders, reservations };
  }
  return cached;
}

const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

export function RecentActivity() {
  const { orders, reservations } = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);

  if (!orders.length && !reservations.length) {
    return (
      <EmptyState
        icon="receipt"
        title="Nothing here yet"
        description="Orders and reservations you make on this device will be listed here."
        action={<ButtonLink href="/menu">Browse the menu</ButtonLink>}
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
          <Icon name="receipt" size={18} className="text-gold" /> Orders
        </h2>
        {orders.length ? (
          <ul className="mt-4 divide-y divide-line/70">
            {orders.map((order) => (
              <li key={order.orderNumber}>
                <Link href={`/order/${encodeURIComponent(order.orderNumber)}`} className="flex items-center justify-between gap-3 py-3 hover:text-gold">
                  <span>
                    <span className="block font-semibold">Order {order.orderNumber}</span>
                    <span className="text-xs text-ink-muted">{formatDateTime(order.placedAt)}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    {order.grandTotalMinor !== undefined && order.currency ? (
                      <Price amountMinor={order.grandTotalMinor} currency={order.currency} size="sm" />
                    ) : null}
                    <Icon name="arrowRight" size={16} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-ink-muted">No orders yet.</p>
        )}
      </Card>
      <Card className="p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
          <Icon name="calendar" size={18} className="text-gold" /> Reservations
        </h2>
        {reservations.length ? (
          <ul className="mt-4 divide-y divide-line/70">
            {reservations.map((reservation) => (
              <li key={reservation.id}>
                <Link href={`/reservation/${reservation.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-gold">
                  <span>
                    <span className="block font-semibold">Booking {reservation.reservationNumber}</span>
                    <span className="text-xs text-ink-muted">{formatDateTime(reservation.startsAt)}</span>
                  </span>
                  <Icon name="arrowRight" size={16} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-ink-muted">No reservations yet.</p>
        )}
      </Card>
    </div>
  );
}
