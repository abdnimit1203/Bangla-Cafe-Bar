import type { CustomerDetails, FulfillmentSelection } from "@/types/fulfillment";
import { isValidBdMobile } from "@/lib/validation/phone";

export type FieldErrors = Record<string, string>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCustomer(customer: CustomerDetails): FieldErrors {
  const errors: FieldErrors = {};
  if (customer.name.trim().length < 2) errors.name = "Please enter your name.";
  if (!customer.phone.trim()) errors.phone = "Please enter your mobile number.";
  else if (!isValidBdMobile(customer.phone)) errors.phone = "Enter a valid Bangladeshi mobile number, e.g. 01712345678.";
  const email = customer.email?.trim();
  if (email && !EMAIL.test(email)) errors.email = "That email address doesn't look right.";
  return errors;
}

export interface FulfillmentRules {
  requiresArea: boolean;
  requireTable: boolean;
}

export function validateFulfillment(selection: FulfillmentSelection, rules: FulfillmentRules): FieldErrors {
  const errors: FieldErrors = {};
  switch (selection.mode) {
    case "delivery": {
      const d = selection.delivery;
      if (!d.district) errors.district = "Choose your district.";
      if (rules.requiresArea && d.areaId === undefined) errors.areaId = "Choose your delivery area.";
      if (d.line1.trim().length < 5) errors.line1 = "Enter your street address (house, road, block).";
      break;
    }
    case "pickup":
      if (!selection.pickup.pickupAt) errors.pickupAt = "Choose a collection time.";
      break;
    case "dine_in":
      if (rules.requireTable && !selection.dineIn.tableRef?.trim()) errors.tableRef = "Enter your table number.";
      break;
  }
  return errors;
}

export function validateCheckout(
  lines: { quantity: number }[],
  customer: CustomerDetails,
  selection: FulfillmentSelection,
  rules: FulfillmentRules,
): FieldErrors {
  const errors: FieldErrors = { ...validateCustomer(customer), ...validateFulfillment(selection, rules) };
  if (!lines.length || lines.some((line) => line.quantity < 1)) errors.cart = "Your cart is empty.";
  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
