"use client";

import { useEffect, useState } from "react";
import type { DeliveryQuote } from "@classytic/commerce-client/delivery-types";
import { isAbortError } from "@classytic/arc-next/client";
import { buildQuoteInput } from "@/lib/commerce/checkout";
import { getStorefrontClient } from "@/lib/commerce/client";
import { stableFingerprint } from "@/lib/commerce/attempt-key";
import type { CartLine } from "@/types/cart";
import type { FulfillmentSelection } from "@/types/fulfillment";

export interface QuoteState {
  quote: DeliveryQuote | null;
  loading: boolean;
  error: unknown;
}

/**
 * Server-priced quote for the current cart + fulfillment choice.
 * Debounced, aborts stale requests, and never computes totals locally.
 */
export function useQuote(lines: CartLine[], selection: FulfillmentSelection, promoCode: string): QuoteState {
  const [state, setState] = useState<QuoteState>({ quote: null, loading: false, error: null });
  const input = lines.length ? buildQuoteInput(lines, selection, promoCode) : null;
  const fingerprint = input ? stableFingerprint(input) : "";

  useEffect(() => {
    if (!fingerprint) return;
    const payload = JSON.parse(fingerprint) as ReturnType<typeof buildQuoteInput>;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setState((current) => ({ ...current, loading: true, error: null }));
      getStorefrontClient()
        .quoteDelivery(payload, { signal: controller.signal })
        .then((quote) => setState({ quote, loading: false, error: null }))
        .catch((error: unknown) => {
          if (isAbortError(error)) return;
          setState((current) => ({ quote: current.quote, loading: false, error }));
        });
    }, 400);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [fingerprint]);

  return state;
}
