"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { useHydrated } from "@/hooks/use-hydrated";
import { selectCount, useCart } from "@/stores/cart";

export function CartButton() {
  const count = useCart(selectCount);
  const openDrawer = useCart((state) => state.openDrawer);
  const hydrated = useHydrated();
  const shown = hydrated ? count : 0;
  return (
    <Link
      href="/cart"
      onClick={(e) => {
        // Prevent navigating away on ordinary clicks; open sidebar smoothly
        if (!e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
          e.preventDefault();
          openDrawer();
        }
      }}
      className="press relative inline-flex h-11 items-center gap-2 rounded-full bg-surface px-4 text-sm font-semibold text-ink shadow-soft-sm transition-all hover:bg-surface-strong hover:text-orange"
      aria-label={shown ? `Order tray, ${shown} items` : "Order tray"}
    >
      <Icon name="bag" size={18} className="text-orange" />
      <span className="hidden sm:inline">Order tray</span>
      {shown > 0 ? (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange px-1.5 text-[11px] font-bold text-white shadow-sm">
          {shown}
        </span>
      ) : null}
    </Link>
  );
}
