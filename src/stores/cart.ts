import { createStore, useStore, type StateCreator } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { restaurantConfig } from "@/lib/config/restaurant";
import { cartLineKey, type CartLine, type CartLineInput } from "@/types/cart";

export interface CartState {
  lines: CartLine[];
  isDrawerOpen: boolean;
  add: (input: CartLineInput) => void;
  remove: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

function clamp(quantity: number, max: number | null): number {
  const whole = Math.max(0, Math.floor(quantity));
  return max === null ? whole : Math.min(whole, max);
}

export const cartInitializer: StateCreator<CartState> = (set) => ({
  lines: [],
  isDrawerOpen: false,
  add: (input) =>
    set((state) => {
      const key = cartLineKey(input.productId, input.variantSku);
      const increment = input.quantity ?? 1;
      const existing = state.lines.find((line) => line.key === key);
      if (existing) {
        const quantity = clamp(existing.quantity + increment, input.maxQuantity ?? existing.maxQuantity);
        return {
          lines: state.lines.map((line) =>
            line.key === key
              ? { ...line, ...input, key, quantity, maxQuantity: input.maxQuantity ?? existing.maxQuantity }
              : line,
          ),
          isDrawerOpen: true,
        };
      }
      const quantity = clamp(increment, input.maxQuantity);
      if (quantity < 1) return state;
      return { lines: [...state.lines, { ...input, key, quantity }], isDrawerOpen: true };
    }),
  remove: (key) => set((state) => ({ lines: state.lines.filter((line) => line.key !== key) })),
  setQuantity: (key, quantity) =>
    set((state) => ({
      lines: state.lines
        .map((line) => (line.key === key ? { ...line, quantity: clamp(quantity, line.maxQuantity) } : line))
        .filter((line) => line.quantity > 0),
    })),
  clear: () => set({ lines: [] }),
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
});

/** Plain in-memory store, used by tests and available for isolated flows. */
export function createCartStore() {
  return createStore<CartState>()(cartInitializer);
}

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

function browserStorage(): StateStorage {
  if (typeof window === "undefined") return noopStorage;
  try {
    return window.localStorage;
  } catch {
    return noopStorage;
  }
}

export const cartStore = createStore<CartState>()(
  persist(cartInitializer, {
    name: `${restaurantConfig.storagePrefix}-cart-v1`,
    storage: createJSONStorage(browserStorage),
    partialize: (state) => ({ lines: state.lines }) as CartState,
  }),
);

export function useCart<T>(selector: (state: CartState) => T): T {
  return useStore(cartStore, selector);
}

export const selectLines = (state: CartState) => state.lines;
export const selectCount = (state: CartState) => state.lines.reduce((sum, line) => sum + line.quantity, 0);
export const selectSubtotalMinor = (state: CartState) =>
  state.lines.reduce((sum, line) => sum + line.unitPriceMinor * line.quantity, 0);
export const selectCurrency = (state: CartState) => state.lines[0]?.currency ?? null;
export const selectIsDrawerOpen = (state: CartState) => state.isDrawerOpen;
