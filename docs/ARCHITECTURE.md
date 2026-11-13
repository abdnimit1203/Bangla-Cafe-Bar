# Architecture

## Shape

A modular-monolith Next.js 16 frontend (App Router, TypeScript, Tailwind v4)
in front of the Brihot commerce API. There is no custom backend: the storefront
SDK (`@classytic/commerce-client`) is called from Server Components for catalog
reads and from the browser for cart-time operations (quotes, checkout, order
status, bookings). The API allows browser origins (CORS verified) and the
storefront surface carries no merchant credentials, so nothing secret ever
reaches the client bundle.

```
Browser ──(SDK, public)──► store-api.brihot.com   quotes · checkout · order status · bookings
Next server ──(SDK, cached)──► store-api.brihot.com   profile · categories · products · CMS page
```

## Page map → API methods

| Route | Rendering | Data |
| --- | --- | --- |
| `/` | static shell + streamed sections | `loadCollectionProducts('featured')`, `loadCategories()`, `loadSpecialOffers()`, `loadHomeContent()` |
| `/menu?category&q` | partial prerender | `loadCategories()`, `loadMenuPage()`; "Show more" paginates in the browser with the same filters |
| `/menu/[slug]` | partial prerender | `loadProduct(slug)`, `loadCollectionProducts('add-ons')` |
| `/cart` | static + client | cart store only (no API) |
| `/checkout` | static + client | `deliveryDistricts`, `deliveryAreas`, `quoteDelivery` (debounced), `checkout` |
| `/order/[orderNumber]` | static + client | `orderStatus` with the token stored on this device; polls every 30 s until terminal |
| `/order` | static + client | localStorage index of orders/reservations made on this device |
| `/reservation` | static + client | `bookings.services`, `bookings.slots`, `bookings.create` |
| `/reservation/[id]` | static + client | `bookings.read`, `bookings.cancel` |

## Layers

- `lib/config` – store connection (env) and restaurant site config. The site
  config is explicitly *site* data (hours, address, policy), never commerce data.
- `lib/commerce` – everything that talks to or interprets the API: the client
  factory, cached catalog loaders, checkout input mapping, idempotency keys,
  error translation, order-status mapping, reservation helpers, access-token
  storage. Pure functions wherever possible so they are unit-testable.
- `lib/validation`, `lib/restaurant` – pure business rules (forms, hours).
- `stores/cart` – zustand store with localStorage persistence.
- `components/ui` – small design-system primitives (button, field, badge,
  card, chip, skeleton, states, toast, icon).
- `components/<feature>` – feature components; Server Components by default,
  `"use client"` only where there is state or browser APIs.

## Key decisions (see docs/adr)

1. **Cache Components + `use cache` for catalog reads** (ADR-0001). Catalog
   loaders are cached functions with explicit `cacheLife` profiles; pages ship a
   static shell and stream data sections inside `<Suspense>` with skeletons.
   Each section has its own error boundary so one failing call never blanks the
   page.
2. **Cart in zustand + localStorage; server is the pricing authority**
   (ADR-0002). The cart stores display prices only; every total shown at
   checkout comes from the server quote and the order itself.
3. **Fulfillment modes mapped onto the existing guest checkout** (ADR-0003).
   Delivery is native. Pickup and dine-in are carried in the address block with
   a loud label until the API grows a `fulfillment` field.
4. **Reservations on the booking engine with one service per party size**
   (ADR-0004). Capacity and double-booking are enforced server-side per table.

## Safety properties

- No client-computed totals are ever sent; the input contains products, SKUs,
  quantities, customer and address only (tested).
- One idempotency key per *intent*: the key is derived from a fingerprint of the
  payload and persisted in sessionStorage, so a retry after a lost response
  reuses it and a changed payload gets a new one (tested).
- Order/booking access tokens live in localStorage only, are sent in headers,
  never in URLs.
- Server errors are translated to customer-safe copy; correlation ids, stacks
  and internal messages never render (tested).
- Date display is `dd/MM/yyyy` everywhere (tested).

## Scaling notes

- Catalog cache is in-memory per Node process. Behind multiple instances,
  switch the loaders to `'use cache: remote'` with a shared cache handler, or
  shorten `cacheLife`.
- Menu search is name-only on the API; a larger menu may want description
  search server-side.
- The cart's `maxQuantity` is a hint captured at add time; the server is still
  the authority at checkout and the UI handles a 409 by asking the customer to
  review the cart.
- Status polling is simple (30 s). If order volume grows, consider SSE from the
  API (`@classytic/arc-next/sse` exists) instead of polling.
