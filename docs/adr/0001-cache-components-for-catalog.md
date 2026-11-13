# ADR-0001: Next.js Cache Components with cached catalog loaders

Date: 12/11/2026 · Status: accepted

## Context

Next 16 ships Cache Components by default. The catalog (categories, products,
collections, CMS page) changes a few times a day; cart-time data (quotes, stock
at checkout, order status, booking slots) must always be fresh.

## Decision

- Catalog reads live in `src/lib/commerce/catalog.ts` as `'use cache'`
  functions with explicit `cacheLife('minutes')` (`'hours'` for the store
  profile). Pages render a static shell and stream each data section inside
  `<Suspense>` with a skeleton, wrapped in a client `SectionErrorBoundary`.
- Request-time values (`searchParams`, `params`) are read inside the Suspense
  boundary and passed to the cached function as arguments, so they become part
  of the cache key.
- Fresh data (quote, checkout, order status, bookings) is fetched in the browser
  via the SDK, which already forces `no-store` for those calls.
- Anything that depends on the visitor's clock (today's hours, pickup slots,
  reservation dates) renders after hydration (`useHydrated`) so the prerendered
  shell never bakes in a build-time timestamp.

## Alternatives

- Classic `revalidate` exports without Cache Components: simpler mental model,
  but the SDK's typed read methods don't expose `next.revalidate`, so we would
  need casts, and we'd lose partial prerendering.
- Route handlers proxying the API: hides the API URL and adds a place for rate
  limiting, but duplicates the SDK surface and adds latency; unnecessary while
  the API is public and CORS-enabled.

## Consequences

- Fast first paint for the menu and home page; stale-while-revalidate catalog
  with at most ~1 minute of staleness.
- The in-memory cache is per process; multi-instance deployments should move
  the loaders to `'use cache: remote'`.
