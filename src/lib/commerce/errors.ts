import { isAbortError, isArcApiError } from "@classytic/arc-next/client";

const GENERIC = "Something went wrong. Please try again.";

export function isCapabilityDisabled(error: unknown): boolean {
  return isArcApiError(error) && error.code === "store.capability_disabled";
}

export function isNotFound(error: unknown): boolean {
  return isArcApiError(error) && error.status === 404;
}

export function isValidationFailure(error: unknown): boolean {
  return isArcApiError(error) && error.status === 400;
}

/** Field-level messages from a validation error, keyed by field path. */
export function fieldErrorsOf(error: unknown): Record<string, string> {
  if (!isArcApiError(error)) return {};
  return error.fieldErrors ?? {};
}

/**
 * Convert any failure into a customer-safe sentence.
 * Internal messages, stack traces and correlation ids are never surfaced.
 */
export function describeError(error: unknown, fallback: string = GENERIC): string {
  if (isAbortError(error)) return "The request was cancelled.";
  if (isArcApiError(error)) {
    if (error.status === 400) {
      const fields = Object.keys(error.fieldErrors ?? {});
      return fields.length
        ? `Please check these details: ${fields.join(", ")}.`
        : "Some of the details look invalid. Please check the form and try again.";
    }
    if (error.status === 404) return "We couldn't find what you were looking for.";
    if (error.code === "store.capability_disabled") {
      return "This feature isn't switched on for the restaurant yet.";
    }
    if (error.status === 409) {
      return "An item in your order is no longer available in that quantity. Please review your cart.";
    }
    if (error.status === 412) return "This record changed in the meantime. Please refresh and try again.";
    if (error.status === 429) return "Too many requests. Please wait a moment and try again.";
    if (error.status >= 500) return "The restaurant's systems are busy right now. Please try again shortly.";
    return fallback;
  }
  if (error instanceof TypeError) {
    return "We can't reach the restaurant right now. Check your connection and try again.";
  }
  return fallback;
}
