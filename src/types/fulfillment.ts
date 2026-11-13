export type FulfillmentMode = "delivery" | "pickup" | "dine_in";

export interface CustomerDetails {
  name: string;
  phone: string;
  email?: string;
}

export interface DeliveryDetails {
  /** District id from the delivery taxonomy. */
  district: string;
  districtName: string;
  areaId?: number;
  areaName?: string;
  line1: string;
  line2?: string;
  postalCode?: string;
}

export interface PickupDetails {
  /** ISO timestamp chosen from the pickup slots. */
  pickupAt: string;
}

export interface DineInDetails {
  tableRef?: string;
}

export type FulfillmentSelection =
  | { mode: "delivery"; delivery: DeliveryDetails }
  | { mode: "pickup"; pickup: PickupDetails }
  | { mode: "dine_in"; dineIn: DineInDetails };

export const FULFILLMENT_LABELS: Record<FulfillmentMode, string> = {
  delivery: "Delivery",
  pickup: "Pickup",
  dine_in: "Dine-in",
};
