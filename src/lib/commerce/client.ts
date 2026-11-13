import {
  createStorefrontClient,
  type StorefrontClient,
} from "@classytic/commerce-client";
import { getStoreConnection } from "@/lib/config/store";

let browserClient: StorefrontClient | null = null;

/**
 * Isolated guest storefront client.
 *
 * The storefront surface is public (no merchant credentials), so the same
 * factory is safe in Server Components and in the browser. The server creates
 * a client per call (cheap, no shared state); the browser reuses one instance.
 */
export function getStorefrontClient(): StorefrontClient {
  if (typeof window === "undefined") {
    return createStorefrontClient(getStoreConnection());
  }
  browserClient ??= createStorefrontClient(getStoreConnection());
  return browserClient;
}

export type { StorefrontClient };
