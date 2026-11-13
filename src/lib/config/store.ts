/**
 * Store connection settings. Kept separate from restaurant branding so the
 * commerce store can be swapped (test-shoe -> restaurant store) without
 * touching application code.
 */
export interface StoreConnection {
  /** Full API mount, including its version prefix. */
  apiUrl: string;
  /** Store slug on the Brihot platform. */
  store: string;
}

export function getStoreConnection(): StoreConnection {
  const apiUrl = process.env.NEXT_PUBLIC_COMMERCE_API_URL;
  const store = process.env.NEXT_PUBLIC_COMMERCE_STORE;
  if (!apiUrl || !store) {
    throw new Error(
      "Commerce store is not configured. Set NEXT_PUBLIC_COMMERCE_API_URL and NEXT_PUBLIC_COMMERCE_STORE.",
    );
  }
  return { apiUrl, store };
}
