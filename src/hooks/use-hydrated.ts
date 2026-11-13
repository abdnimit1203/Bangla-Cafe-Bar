"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** True only after hydration; use to render browser-persisted state (cart) without SSR mismatches. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
