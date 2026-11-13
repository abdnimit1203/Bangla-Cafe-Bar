# ADR-0003: Delivery, pickup and dine-in on the existing guest checkout

Date: 12/11/2026 · Status: accepted (stopgap, revisit when the API adds `fulfillment`)

## Context

`GuestCheckoutInput` has `lines`, `customer`, `shippingAddress` (required),
optional `promoCode` and `quoteToken`. There is no fulfillment-mode field. The
restaurant needs delivery, pickup and dine-in ordering today, and inventing an
endpoint or faking the mode client-side is not acceptable.

## Decision

`src/lib/commerce/checkout.ts` maps the three modes onto the real contract:

| Mode | `shippingAddress` | Notes |
| --- | --- | --- |
| Delivery | customer's district/area/street, `areaId` | native; quote uses `areaId` + country |
| Pickup | restaurant's own address; `line1 = "PICKUP - collect at dd/MM/yyyy HH:mm"` | collection time chosen from slots derived from opening hours |
| Dine-in | restaurant's own address; `line1 = "DINE-IN - Table N"` | table number optional unless configured |

The label is deliberately in `line1` so it is the first thing staff read on the
order. The form collects only what each mode needs. Everything else (prices,
stock, totals, promo validation) remains server-side.

## Known limitation

The store's configured delivery charge still applies to pickup/dine-in orders
because the server cannot tell the modes apart. On `test-shoe` the charge is 0.
For the restaurant store either set the flat charge to 0 and price delivery via
zones, or land the backend change below before enabling pickup/dine-in.

## Smallest backend change

Add `fulfillment: { method: 'delivery' | 'pickup' | 'dine_in', requestedAt?, tableRef? }`
to `/orders/quote` and `/orders`; make `shippingAddress` required only for
`delivery`; apply no delivery charge otherwise; surface `fulfillment` in merchant
order views. The frontend change is then confined to `checkout.ts`.

## Alternatives rejected

- Separate "pickup" product or a negative delivery line: fake pricing.
- Notes field: not present on the contract (unknown fields fail validation).
