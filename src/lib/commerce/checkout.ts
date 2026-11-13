import type { GuestCheckoutInput } from "@classytic/commerce-client/types";
import type { DeliveryQuoteInput } from "@classytic/commerce-client/delivery-types";
import { restaurantConfig } from "@/lib/config/restaurant";
import { formatDateTime } from "@/lib/utils/dates";
import { normalizePhone } from "@/lib/validation/phone";
import type { CartLine } from "@/types/cart";
import type { CustomerDetails, FulfillmentSelection } from "@/types/fulfillment";

/**
 * Maps the cart + fulfillment choice onto the Brihot guest checkout contract.
 *
 * The API has no fulfillment-mode field yet (see docs/API-CAPABILITY-MATRIX.md
 * and ADR-0003). Delivery maps 1:1. Pickup and dine-in reuse the required
 * `shippingAddress` to carry the restaurant's own address plus a clearly
 * labelled fulfillment note in line 1, so kitchen staff see it on the order.
 */

export function buildCheckoutLines(lines: CartLine[]): GuestCheckoutInput["lines"] {
  return lines.map((line) => ({
    productId: line.productId,
    quantity: line.quantity,
    ...(line.variantSku ? { variantSku: line.variantSku } : {}),
  }));
}

export function fulfillmentNote(selection: FulfillmentSelection): string | null {
  switch (selection.mode) {
    case "pickup":
      return `PICKUP - collect at ${formatDateTime(selection.pickup.pickupAt)}`;
    case "dine_in": {
      const table = selection.dineIn.tableRef?.trim();
      return table ? `DINE-IN - Table ${table}` : "DINE-IN - table not specified";
    }
    default:
      return null;
  }
}

export function buildShippingAddress(selection: FulfillmentSelection): GuestCheckoutInput["shippingAddress"] {
  if (selection.mode === "delivery") {
    const d = selection.delivery;
    return {
      line1: d.line1.trim(),
      ...(d.line2?.trim() ? { line2: d.line2.trim() } : {}),
      city: d.districtName,
      ...(d.postalCode?.trim() ? { postalCode: d.postalCode.trim() } : {}),
      country: restaurantConfig.fulfillment.delivery.country,
      ...(d.areaId !== undefined ? { areaId: d.areaId } : {}),
    };
  }
  const address = restaurantConfig.address;
  return {
    line1: fulfillmentNote(selection) ?? "",
    line2: `${restaurantConfig.name}, ${address.line1}`,
    city: address.city,
    ...(address.state ? { state: address.state } : {}),
    ...(address.postalCode ? { postalCode: address.postalCode } : {}),
    country: address.country,
  };
}

export function buildQuoteInput(
  lines: CartLine[],
  selection: FulfillmentSelection,
  promoCode?: string,
): DeliveryQuoteInput {
  const code = promoCode?.trim();
  return {
    lines: buildCheckoutLines(lines),
    country:
      selection.mode === "delivery"
        ? restaurantConfig.fulfillment.delivery.country
        : restaurantConfig.address.country,
    ...(selection.mode === "delivery" && selection.delivery.areaId !== undefined
      ? { areaId: selection.delivery.areaId }
      : {}),
    ...(code ? { promoCode: code } : {}),
  };
}

export function buildCheckoutInput(
  lines: CartLine[],
  customer: CustomerDetails,
  selection: FulfillmentSelection,
  options: { promoCode?: string; quoteToken?: string } = {},
): GuestCheckoutInput {
  const email = customer.email?.trim();
  const code = options.promoCode?.trim();
  return {
    lines: buildCheckoutLines(lines),
    customer: {
      name: customer.name.trim(),
      phone: normalizePhone(customer.phone),
      ...(email ? { email } : {}),
    },
    shippingAddress: buildShippingAddress(selection),
    ...(code ? { promoCode: code } : {}),
    ...(options.quoteToken ? { quoteToken: options.quoteToken } : {}),
  };
}
