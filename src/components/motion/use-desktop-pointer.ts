"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(min-width: 768px) and (hover: hover) and (pointer: fine)";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const list = window.matchMedia(QUERY);
  list.addEventListener("change", callback);
  return () => list.removeEventListener("change", callback);
}

/** True on desktop-class devices with a precise pointer; false during SSR and on touch/mobile. */
export function useDesktopPointer(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
