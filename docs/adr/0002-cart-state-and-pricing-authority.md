# ADR-0002: Cart in zustand + localStorage; server owns pricing

Date: 12/11/2026 · Status: accepted

## Context

The SDK explicitly "stores no cart" and "does no pricing arithmetic". The
master requirements say never to trust frontend totals.

## Decision

- A single zustand store (`src/stores/cart.ts`) persisted to localStorage holds
  cart lines keyed by `productId::variantSku`. Lines carry a display price and
  an optional stock ceiling captured at add time.
- The cart page shows an *estimated* subtotal only. Checkout calls
  `quoteDelivery` (debounced, aborted on change) and renders the server's
  subtotal, discount, delivery charge, tax and total. The placed order's totals
  come from the API response.
- The checkout payload contains only product ids, SKUs, quantities, customer
  and address (unit-tested); prices are never sent.
- Persisted state is rendered only after hydration to avoid SSR mismatches.

## Alternatives

- React Context + `useReducer`: fine, but persistence and selector ergonomics
  are hand-rolled; zustand is ~1 KB and well understood.
- Server-side cart: the API has no cart resource; building one would be a
  duplicate backend, which the requirements forbid.

## Consequences

- Cart survives reloads and tab closes on one device; it is not shared across
  devices (acceptable for a single restaurant).
- A product whose price changed after it was added shows the old price until
  checkout, where the server quote corrects it.
