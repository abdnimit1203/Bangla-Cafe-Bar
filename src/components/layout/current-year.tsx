"use client";

import { useHydrated } from "@/hooks/use-hydrated";

/** Rendered on the client so the static shell never bakes in a build-time clock. */
export function CurrentYear({ fallback = "2026" }: { fallback?: string }) {
  const hydrated = useHydrated();
  return <>{hydrated ? new Date().getFullYear() : fallback}</>;
}
