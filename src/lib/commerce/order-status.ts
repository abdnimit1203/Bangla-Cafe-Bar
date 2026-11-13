import { humanize } from "@/lib/commerce/catalog-helpers";

export type OrderStage =
  | "placed"
  | "confirmed"
  | "preparing"
  | "on_the_way"
  | "completed"
  | "cancelled"
  | "refunded"
  | "unknown";

const STAGE_BY_STATUS: Record<string, OrderStage> = {
  pending: "placed",
  placed: "placed",
  created: "placed",
  new: "placed",
  confirmed: "confirmed",
  accepted: "confirmed",
  processing: "preparing",
  preparing: "preparing",
  in_progress: "preparing",
  shipped: "on_the_way",
  dispatched: "on_the_way",
  out_for_delivery: "on_the_way",
  ready: "on_the_way",
  delivered: "completed",
  fulfilled: "completed",
  completed: "completed",
  complete: "completed",
  cancelled: "cancelled",
  canceled: "cancelled",
  refunded: "refunded",
};

export function orderStage(status: string | undefined | null): OrderStage {
  if (!status) return "unknown";
  return STAGE_BY_STATUS[status.toLowerCase()] ?? "unknown";
}

export const ORDER_STEPS: Array<{ stage: OrderStage; label: string; description: string }> = [
  { stage: "placed", label: "Order placed", description: "We've received your order." },
  { stage: "confirmed", label: "Confirmed", description: "The kitchen has accepted it." },
  { stage: "preparing", label: "Preparing", description: "Your food is being cooked." },
  { stage: "on_the_way", label: "On its way / ready", description: "Out for delivery or ready to collect." },
  { stage: "completed", label: "Completed", description: "Enjoy your meal." },
];

export function stageIndex(stage: OrderStage): number {
  return ORDER_STEPS.findIndex((step) => step.stage === stage);
}

export function isTerminalStage(stage: OrderStage): boolean {
  return stage === "completed" || stage === "cancelled" || stage === "refunded";
}

export function statusLabel(status: string | undefined | null): string {
  const stage = orderStage(status);
  const step = ORDER_STEPS.find((s) => s.stage === stage);
  if (step) return step.label;
  if (stage === "cancelled") return "Cancelled";
  if (stage === "refunded") return "Refunded";
  return status ? humanize(status) : "Unknown";
}

export function paymentTermLabel(term: string | undefined): string {
  switch (term) {
    case "collect_on_delivery":
      return "Pay on delivery / at the counter";
    case "prepaid":
      return "Paid online";
    default:
      return "Payment at the restaurant";
  }
}
