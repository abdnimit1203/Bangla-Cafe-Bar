# Brihot API capability matrix

Verified on 11/11/2026 against `https://store-api.brihot.com/api/v1` with the
`test-shoe` developer store, using `@classytic/commerce-client` 0.5.0. Every
"Supported" row was exercised with a real read-only request (no data was
created or modified; the only POST used was `/orders/quote`, which is a
preview and persists nothing).

Legend: **S** supported · **P** partially supported · **N** not supported · **V** needs verification on the restaurant store

| Requirement | Status | SDK / endpoint | Notes |
| --- | --- | --- | --- |
| Store profile | S | `shop.profile()` → `GET /stores/:slug` | Name, currency (`BDT`), flat `deliveryChargeMinor`. No address, hours or phone: those live in site config. |
| Product listing | S | `shop.products({ limit, after, category, q, tag, collection, onSale, sort })` | Cursor pagination (`next`). Category filter includes descendants. |
| Product details | S | `shop.product(slug)` | Images with `isFeatured`/`order`, variants, stock, tags, collections, compare-at price. |
| Categories | S | `shop.categories()` | Flat list with `parent`, `displayOrder`, optional image/banner. Max 100 entries. |
| Product search | S | `products({ q })` | Literal, case-insensitive match on product **name** only (not description). ≤100 chars. |
| Food images | S | `product.images[]` | CDN on `media.brihot.com`; `variants.thumbnail/medium` renditions may be present. |
| Veg / non-veg | P | `product.tags` | No dedicated field. Convention adopted: tags `veg`, `non-veg`, `spicy`, `chefs-pick`. |
| Availability | S | `product.stock { tracked, quantity, variants[] }` | Per-variant quantities when tracked. Checkout deducts atomically and refuses insufficient stock. |
| Sizes / spice levels (single-choice) | S | `product.variants[].attributes` + `priceModifier` | One SKU per combination; server prices by `variantSku`. UI renders one chip group per attribute. |
| Add-ons / extras (multi-select) | P | collection `add-ons` as separate products | No modifier/add-on groups on a product. Extras are real products added as their own cart lines ("Goes well with"). Smallest backend change: optional `modifiers[]` groups on a product with server-side pricing. |
| Variant-specific pricing | S | `basePrice + priceModifier` | Minor units; verified `priceRange` logic in unit tests. |
| Special offers | S | `products({ onSale: true })`, `compareAtPrice` | `onSale` is server-derived. Home page section renders only when non-empty. |
| Guest checkout | S | `shop.checkout(input, { idempotencyKey })` → `POST /storefront/:store/orders` | Server resolves prices, stock, variants, delivery charge and totals. Requires `Idempotency-Key`. |
| Delivery (address + fee) | S | `deliveryDistricts()`, `deliveryAreas(district)`, `quoteDelivery()` | 64 districts, 834 areas in Dhaka alone. `requiresArea=false` on test-shoe. Quote returns subtotal, delivery charge, discount, tax, grand total. |
| Delivery fee calculation | S | `POST /orders/quote` | Flat or zoned rules configured by the merchant; `freeOverMinor` supported. |
| Promo codes | S | `promoCode` on quote + checkout | Quote reports `appliedCodes` / `rejectedCodes`. |
| Pickup fulfillment | P | — | No fulfillment-mode field on `GuestCheckoutInput`; `shippingAddress` is mandatory. Stopgap: restaurant address + `line1: "PICKUP - collect at dd/MM/yyyy HH:mm"`. The store's delivery charge still applies unless the merchant sets it to 0. See ADR-0003. |
| Dine-in fulfillment | P | — | Same gap as pickup. Stopgap: `line1: "DINE-IN - Table N"`. |
| Order tracking | S | `shop.orderStatus({ orderNumber, accessToken })` | Private token in `x-order-access` header, `no-store`. Returns status, fulfillment status, totals, payment term/state. Status vocabulary not documented; UI maps known values and degrades gracefully. |
| Order items on status read | N | — | Status response has totals but not line items. The site shows the cart snapshot at placement only via totals. Smallest change: include `lines[]` (name, qty, line total) in the storefront status projection. |
| Payments | P | `paymentTerm`, `paymentState` | No online payment API in the storefront SDK. Orders are cash on delivery / pay at counter; captured amounts are reported read-only. |
| Opening hours | N | — | Not part of the store profile. Kept in `restaurant.ts`. Smallest change: `hours` on the store settings/profile. |
| Table availability | S* | `shop.bookings.slots({ serviceId, from, to })` | *Module is deployed (route answers) but **disabled on test-shoe** (`409 store.capability_disabled`). The restaurant store must enable the Bookings capability. |
| Table reservation | S* | `shop.bookings.create(input, { idempotencyKey })` | `expectedPriceMinor` guards against price changes. Returns reservation number, status, private access token. |
| Reservation status / cancellation | S* | `bookings.read()`, `bookings.cancel()` | Idempotent cancel with its own key. Statuses: pending, confirmed, checked_in, checked_out, canceled, no_show, expired. |
| Guest count / table capacity | P | one service per party size | `BookingInput` has no `partySize`. Modelled as services `table-for-2/4/6/8` whose resources are the tables that seat that size, so capacity, overlap and schedule windows are enforced server-side per table. Smallest change: `partySize` on the service/resource contract. |
| Overlap / double-booking prevention | S* | booking engine | Server-authoritative; slots are re-validated on create. |
| QR table ordering | — | — | Not implemented (not approved). |
| Structured content (CMS) | S | `createContentClient().page('home')` | test-shoe publishes a `home` page with hero + text sections. Site uses text sections for the "Our kitchen" block. |

## Gaps that need a backend change (smallest proposals)

1. **Fulfillment mode on guest checkout** (affects `POST /storefront/:store/orders` and `/orders/quote`):
   add `fulfillment: { method: 'delivery' | 'pickup' | 'dine_in', requestedAt?: string, tableRef?: string }`,
   make `shippingAddress` required only for `delivery`, and skip the delivery charge for the other two.
   Merchant order views should display `fulfillment`. Until then the site encodes the mode in address line 1.
2. **Party size on bookings** (`BookingInput`, services/resources): a `partySize` field validated against
   resource capacity, so one "Table" service can cover all sizes. Workaround in place: one service per size band.
3. **Order lines in the storefront status read**: return `lines[]` so the confirmation page can list dishes.
4. **Opening hours on the store profile**: optional `hours` so staff can edit them in the dashboard instead of code.
5. **Product modifiers (optional)**: add-on groups with server pricing, for true "extra cheese"-style extras.

## Things to verify once the restaurant store exists

- Delivery rules (`flat` vs `zones`, `freeOverMinor`) and whether `requiresArea` is on.
- Exact order status strings emitted by the merchant order commands (`confirm`, `start_processing`, `ship`, `deliver`, `cancel`).
- Booking capability enabled, services and table resources with weekly schedules.
- Whether `priceModifier` is interpreted in minor units (assumed; test-shoe only has zero modifiers).
