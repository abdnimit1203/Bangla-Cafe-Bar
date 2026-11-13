/**
 * Guest access tokens for orders and reservations.
 *
 * The API returns a private access token with each order/booking. It is the
 * buyer's credential for reading status, so it lives only in this browser's
 * localStorage, is never placed in URLs, and is sent only in the
 * `x-order-access` header by the SDK.
 */

export interface StoredOrderAccess {
  orderNumber: string;
  accessToken: string;
  placedAt: string;
  grandTotalMinor?: number;
  currency?: string;
}

export interface StoredReservationAccess {
  id: string;
  accessToken: string;
  reservationNumber: string;
  startsAt: string;
  createdAt: string;
}

import { restaurantConfig } from "@/lib/config/restaurant";

const ORDERS_KEY = `${restaurantConfig.storagePrefix}-orders-v1`;
const RESERVATIONS_KEY = `${restaurantConfig.storagePrefix}-reservations-v1`;

function read<T>(key: string): Record<string, T> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, T>) : {};
  } catch {
    return {};
  }
}

function write<T>(key: string, value: Record<string, T>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be unavailable (private mode); the confirmation page still shows the API result once.
  }
}

export function saveOrderAccess(access: StoredOrderAccess): void {
  const all = read<StoredOrderAccess>(ORDERS_KEY);
  all[access.orderNumber] = access;
  write(ORDERS_KEY, all);
}

export function getOrderAccess(orderNumber: string): StoredOrderAccess | null {
  return read<StoredOrderAccess>(ORDERS_KEY)[orderNumber] ?? null;
}

export function listOrderAccess(): StoredOrderAccess[] {
  return Object.values(read<StoredOrderAccess>(ORDERS_KEY)).sort((a, b) =>
    b.placedAt.localeCompare(a.placedAt),
  );
}

export function saveReservationAccess(access: StoredReservationAccess): void {
  const all = read<StoredReservationAccess>(RESERVATIONS_KEY);
  all[access.id] = access;
  write(RESERVATIONS_KEY, all);
}

export function getReservationAccess(id: string): StoredReservationAccess | null {
  return read<StoredReservationAccess>(RESERVATIONS_KEY)[id] ?? null;
}

export function listReservationAccess(): StoredReservationAccess[] {
  return Object.values(read<StoredReservationAccess>(RESERVATIONS_KEY)).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}
