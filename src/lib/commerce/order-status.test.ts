import { describe, expect, it } from "vitest";
import { isTerminalStage, orderStage, stageIndex, statusLabel } from "@/lib/commerce/order-status";

describe("order status mapping", () => {
  it("maps known backend statuses onto customer stages", () => {
    expect(orderStage("pending")).toBe("placed");
    expect(orderStage("Confirmed")).toBe("confirmed");
    expect(orderStage("processing")).toBe("preparing");
    expect(orderStage("shipped")).toBe("on_the_way");
    expect(orderStage("delivered")).toBe("completed");
    expect(orderStage("canceled")).toBe("cancelled");
    expect(orderStage("cancelled")).toBe("cancelled");
  });

  it("degrades gracefully for unknown statuses", () => {
    expect(orderStage("on_hold")).toBe("unknown");
    expect(statusLabel("on_hold")).toBe("On hold");
    expect(stageIndex("unknown")).toBe(-1);
  });

  it("identifies terminal stages", () => {
    expect(isTerminalStage("completed")).toBe(true);
    expect(isTerminalStage("refunded")).toBe(true);
    expect(isTerminalStage("preparing")).toBe(false);
  });
});
