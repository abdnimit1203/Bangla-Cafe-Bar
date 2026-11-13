/**
 * Idempotency keys for checkout and booking attempts.
 *
 * One key per "intent": the same payload keeps the same key across retries
 * and page reloads, so a lost response never produces a duplicate order. A
 * changed payload is a new intent and gets a new key.
 */

export interface KeyStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function randomKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for very old runtimes; still satisfies the 16-200 char contract.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}-${Math.random().toString(36).slice(2, 12)}`;
}

/** Deterministic JSON with sorted keys so equal payloads always fingerprint the same. */
export function stableFingerprint(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        const v = (value as Record<string, unknown>)[key];
        if (v !== undefined) acc[key] = sortKeys(v);
        return acc;
      }, {});
  }
  return value;
}

interface StoredAttempt {
  key: string;
  fingerprint: string;
}

export function resolveAttemptKey(
  store: KeyStore,
  scope: string,
  fingerprint: string,
  generate: () => string = randomKey,
): string {
  const raw = store.getItem(scope);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as StoredAttempt;
      if (parsed.fingerprint === fingerprint && parsed.key) return parsed.key;
    } catch {
      // fall through to a fresh key
    }
  }
  const key = generate();
  store.setItem(scope, JSON.stringify({ key, fingerprint } satisfies StoredAttempt));
  return key;
}

export function clearAttemptKey(store: KeyStore, scope: string): void {
  store.removeItem(scope);
}

const memory = new Map<string, string>();
const memoryStore: KeyStore = {
  getItem: (k) => memory.get(k) ?? null,
  setItem: (k, v) => void memory.set(k, v),
  removeItem: (k) => void memory.delete(k),
};

/** sessionStorage when available (survives reloads, not tabs); memory otherwise. */
export function sessionKeyStore(): KeyStore {
  if (typeof window === "undefined") return memoryStore;
  try {
    const storage = window.sessionStorage;
    return {
      getItem: (k) => storage.getItem(k),
      setItem: (k, v) => storage.setItem(k, v),
      removeItem: (k) => storage.removeItem(k),
    };
  } catch {
    return memoryStore;
  }
}
