import { describe, expect, it } from "vitest";
import { ArcApiError } from "@classytic/arc-next/client";
import { describeError, isCapabilityDisabled, isNotFound } from "@/lib/commerce/errors";

function apiError(status: number, json: Record<string, unknown>) {
  return new ArcApiError("boom", { status, statusText: "x", json, endpoint: "/x", method: "GET" });
}

describe("describeError", () => {
  it("never leaks server internals", () => {
    const error = apiError(500, { code: "internal", message: "TypeError at /app/node_modules/x.js", meta: { stack: "secret" } });
    const text = describeError(error);
    expect(text).not.toContain("node_modules");
    expect(text).not.toContain("secret");
  });

  it("names invalid fields for validation failures", () => {
    const error = apiError(400, { code: "arc.validation_error", details: [{ path: "customer.phone", message: "bad" }] });
    expect(describeError(error)).toMatch(/customer\.phone|details look invalid/);
  });

  it("explains disabled capabilities and conflicts", () => {
    const disabled = apiError(409, { code: "store.capability_disabled" });
    expect(isCapabilityDisabled(disabled)).toBe(true);
    expect(describeError(disabled)).toContain("isn't switched on");
    expect(describeError(apiError(409, { code: "stock.insufficient" }))).toContain("no longer available");
    expect(isNotFound(apiError(404, { code: "order.not_found" }))).toBe(true);
  });

  it("handles network failures and unknown errors with a safe fallback", () => {
    expect(describeError(new TypeError("fetch failed"))).toContain("connection");
    expect(describeError(new Error("whatever"), "Custom fallback")).toBe("Custom fallback");
  });
});
