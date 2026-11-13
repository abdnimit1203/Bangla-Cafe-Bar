import { describe, expect, it } from "vitest";
import { clearAttemptKey, resolveAttemptKey, stableFingerprint, type KeyStore } from "@/lib/commerce/attempt-key";

function memoryStore(): KeyStore {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

describe("attempt keys", () => {
  it("fingerprints equal payloads identically regardless of key order", () => {
    expect(stableFingerprint({ b: 1, a: [{ d: 2, c: 3 }] })).toBe(stableFingerprint({ a: [{ c: 3, d: 2 }], b: 1 }));
    expect(stableFingerprint({ a: 1 })).not.toBe(stableFingerprint({ a: 2 }));
  });

  it("reuses the key for the same payload and issues a new one when it changes", () => {
    const store = memoryStore();
    let n = 0;
    const generate = () => `key-${++n}`;
    const first = resolveAttemptKey(store, "checkout", "fp-1", generate);
    const retry = resolveAttemptKey(store, "checkout", "fp-1", generate);
    const changed = resolveAttemptKey(store, "checkout", "fp-2", generate);
    expect(first).toBe("key-1");
    expect(retry).toBe("key-1");
    expect(changed).toBe("key-2");
  });

  it("forgets the key after a successful attempt", () => {
    const store = memoryStore();
    let n = 0;
    const generate = () => `key-${++n}`;
    resolveAttemptKey(store, "checkout", "fp-1", generate);
    clearAttemptKey(store, "checkout");
    expect(resolveAttemptKey(store, "checkout", "fp-1", generate)).toBe("key-2");
  });
});
