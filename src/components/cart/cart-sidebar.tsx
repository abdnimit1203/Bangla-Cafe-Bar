"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { useHydrated } from "@/hooks/use-hydrated";
import {
  selectCount,
  selectCurrency,
  selectIsDrawerOpen,
  selectLines,
  selectSubtotalMinor,
  useCart,
} from "@/stores/cart";

export function CartSidebar() {
  const hydrated = useHydrated();
  const isOpen = useCart(selectIsDrawerOpen);
  const closeDrawer = useCart((state) => state.closeDrawer);
  const lines = useCart(selectLines);
  const count = useCart(selectCount);
  const subtotal = useCart(selectSubtotalMinor);
  const currency = useCart(selectCurrency);
  const setQuantity = useCart((state) => state.setQuantity);
  const remove = useCart((state) => state.remove);

  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeDrawer();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeDrawer]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!hydrated) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Order tray sidebar">
          {/* Backdrop overlay */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Slide-over panel */}
          <m.aside
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative z-10 flex h-full w-full max-w-md flex-col bg-surface shadow-2xl sm:max-w-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line/70 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-soft text-orange">
                  <Icon name="bag" size={20} />
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-ink">Your Order Tray</h2>
                  <p className="text-xs text-ink-muted">
                    {count === 0 ? "Empty tray" : `${count} ${count === 1 ? "item" : "items"} selected`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="press flex h-9 w-9 items-center justify-center rounded-full bg-cream text-ink-muted transition-colors hover:bg-orange-soft hover:text-orange"
                aria-label="Close order tray sidebar"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            {/* Scrollable list of items */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sage-soft text-forest">
                    <Icon name="coffee" size={36} />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-ink">Your tray is empty</h3>
                  <p className="mt-2 max-w-xs text-sm text-ink-muted">
                    Explore our artisan brews, bakery treats, and specialty dishes to begin your order.
                  </p>
                  <ButtonLink href="/menu" onClick={closeDrawer} className="mt-6">
                    Browse menu
                    <Icon name="arrowRight" size={16} />
                  </ButtonLink>
                </div>
              ) : (
                <ul className="space-y-3.5">
                  {lines.map((line) => (
                    <li
                      key={line.key}
                      className="flex gap-3.5 rounded-2xl bg-surface-strong p-3.5 shadow-soft-xs transition-shadow hover:shadow-soft-sm"
                    >
                      <Link
                        href={`/menu/${line.slug}`}
                        onClick={closeDrawer}
                        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-line"
                      >
                        {line.imageUrl ? (
                          <Image src={line.imageUrl} alt={line.name} fill sizes="80px" className="object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-ink-faint">
                            <Icon name="utensils" size={20} />
                          </span>
                        )}
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/menu/${line.slug}`}
                              onClick={closeDrawer}
                              className="font-display text-sm font-bold leading-snug text-ink transition-colors hover:text-orange"
                            >
                              {line.name}
                            </Link>
                            <button
                              type="button"
                              onClick={() => remove(line.key)}
                              className="rounded-lg p-1 text-ink-faint transition-colors hover:bg-danger-soft hover:text-danger"
                              aria-label={`Remove ${line.name}`}
                            >
                              <Icon name="trash" size={15} />
                            </button>
                          </div>
                          {line.variantLabel && (
                            <p className="mt-0.5 text-xs text-ink-muted">{line.variantLabel}</p>
                          )}
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-2">
                          <QuantityStepper
                            value={line.quantity}
                            onChange={(next) => setQuantity(line.key, next)}
                            max={line.maxQuantity}
                            size="sm"
                            label={`Quantity for ${line.name}`}
                          />
                          <Price
                            amountMinor={line.unitPriceMinor * line.quantity}
                            currency={line.currency}
                            size="sm"
                            className="font-bold text-ink"
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Sticky Footer */}
            {lines.length > 0 && (
              <div className="border-t border-line/70 bg-surface-strong p-5 shadow-lg">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-muted">Estimated subtotal</span>
                    <span className="font-display text-lg font-bold text-ink">
                      {currency ? <Price amountMinor={subtotal} currency={currency} /> : null}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-faint">
                    Taxes and delivery fee calculated during checkout.
                  </p>
                </div>

                <div className="mt-4 flex flex-col gap-2.5">
                  <ButtonLink
                    href="/checkout"
                    onClick={closeDrawer}
                    size="lg"
                    className="w-full justify-center bg-orange text-white hover:bg-orange-deep"
                  >
                    Proceed to checkout
                    <Icon name="arrowRight" size={16} />
                  </ButtonLink>
                  <ButtonLink
                    href="/cart"
                    onClick={closeDrawer}
                    variant="cream"
                    size="md"
                    className="w-full justify-center text-xs font-semibold"
                  >
                    View full order tray page
                  </ButtonLink>
                </div>
              </div>
            )}
          </m.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

