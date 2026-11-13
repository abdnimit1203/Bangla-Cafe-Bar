"use client";

import { useCallback, useEffect, useState } from "react";
import { isAbortError } from "@classytic/arc-next/client";

interface ResourceState<T> {
  data: T | null;
  error: unknown;
  loading: boolean;
}

/**
 * Minimal async loader for client-side reads (order status, booking slots).
 * `load` must be memoized by the caller; it re-runs when its identity changes
 * or when `reload()` is called. In-flight requests are aborted on change.
 */
export function useAsyncResource<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [state, setState] = useState<ResourceState<T>>({ data: null, error: null, loading: true });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    load(controller.signal)
      .then((data) => {
        if (active) setState({ data, error: null, loading: false });
      })
      .catch((error: unknown) => {
        if (!active || isAbortError(error)) return;
        setState((current) => ({ data: current.data, error, loading: false }));
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [load, version]);

  const reload = useCallback(() => {
    setState((current) => ({ ...current, loading: true, error: null }));
    setVersion((v) => v + 1);
  }, []);

  return { ...state, reload };
}
