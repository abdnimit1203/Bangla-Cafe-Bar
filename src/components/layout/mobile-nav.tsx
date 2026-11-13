"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { SearchForm } from "@/components/layout/search-form";
import { ButtonLink } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { restaurantConfig } from "@/lib/config/restaurant";
import { selectCount, useCart } from "@/stores/cart";
import { useHydrated } from "@/hooks/use-hydrated";

interface NavItem {
  href: string;
  label: string;
  description: string;
  icon: IconName;
}

const navItems: NavItem[] = [
  { href: "/", label: "Home", description: "Welcome to our cafe & kitchen", icon: "coffee" },
  { href: "/menu", label: "Menu & Drinks", description: "Artisanal coffees & handcrafted dishes", icon: "utensils" },
  { href: "/reservation", label: "Book a Table", description: "Reserve your cozy corner in Gulshan", icon: "calendar" },
  { href: "/order", label: "Track Orders", description: "Check status of your delivery or pickup", icon: "receipt" },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const hydrated = useHydrated();
  const cartCount = useCart(selectCount);
  const openDrawer = useCart((state) => state.openDrawer);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const drawerContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex justify-start"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          {/* Fullscreen Backdrop overlay */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Left-Aligned Full-Height Sidebar Drawer */}
          <m.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative z-10 flex h-full w-[85vw] max-w-sm flex-col bg-[#faf7f0] shadow-2xl border-r border-line"
          >
            {/* Header inside drawer */}
            <div className="flex items-center justify-between border-b border-line/80 bg-surface px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-forest text-cream shadow-soft-xs">
                  <Icon name="coffee" size={20} className="text-orange" />
                </span>
                <div>
                  <span className="font-display text-base font-bold tracking-wide text-ink">
                    {restaurantConfig.shortName.toUpperCase()}
                  </span>
                  <span className="ml-1.5 rounded bg-sage-soft px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-forest">
                    {restaurantConfig.descriptor}
                  </span>
                  <p className="text-[11px] text-ink-muted">{restaurantConfig.tagline}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="press flex h-9 w-9 items-center justify-center rounded-full bg-cream text-ink-muted transition-colors hover:bg-orange-soft hover:text-orange"
                aria-label="Close menu"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            {/* Quick Search inside Drawer */}
            <div className="border-b border-line/60 bg-cream/30 p-4">
              <SearchForm />
            </div>

            {/* Prominent "Book a Table" Highlight Tab (as requested) */}
            <div className="px-4 pt-4">
              <div className="rounded-2xl bg-gradient-to-br from-forest to-forest-deep p-4 text-cream shadow-soft-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage">Table Reservations</span>
                    <h3 className="font-display text-base font-bold text-cream">Reserve Your Spot</h3>
                    <p className="mt-1 text-xs text-cream/80">Cozy corners & family tables in Gulshan 2</p>
                  </div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-orange">
                    <Icon name="calendar" size={16} />
                  </span>
                </div>
                <div className="mt-3">
                  <ButtonLink
                    href="/reservation"
                    onClick={() => setIsOpen(false)}
                    variant="primary"
                    size="sm"
                    className="w-full justify-center bg-orange text-white hover:bg-orange-deep shadow-sm"
                  >
                    <Icon name="calendar" size={14} />
                    Book Table Now
                  </ButtonLink>
                </div>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 overflow-y-auto px-4 py-4" aria-label="Mobile menu">
              <p className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint">Menu & Services</p>
              <div className="mt-2 space-y-1.5">
                {navItems.map((item, index) => (
                  <m.div
                    key={item.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 + 0.05, duration: 0.25 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3.5 rounded-2xl p-3 text-ink transition-all hover:bg-cream/80 hover:text-orange"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-forest shadow-soft-xs">
                        <Icon name={item.icon} size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold leading-tight">{item.label}</span>
                        <span className="block truncate text-xs text-ink-muted">{item.description}</span>
                      </div>
                      <Icon name="chevronRight" size={16} className="text-ink-faint" />
                    </Link>
                  </m.div>
                ))}
              </div>

              {/* Order Tray Quick Access */}
              <div className="mt-4 border-t border-line/60 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    openDrawer();
                  }}
                  className="press flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-orange-soft/70 to-cream p-3 text-left shadow-soft-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange text-white shadow-sm">
                      <Icon name="bag" size={18} />
                    </span>
                    <div>
                      <span className="block text-sm font-bold text-ink">View Order Tray</span>
                      <span className="text-xs text-ink-muted">Open cart sidebar</span>
                    </div>
                  </div>
                  {hydrated && cartCount > 0 ? (
                    <span className="rounded-full bg-orange px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
                      {cartCount} items
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-ink-faint">0 items</span>
                  )}
                </button>
              </div>
            </nav>

            {/* Bottom Info Bar in Drawer */}
            <div className="border-t border-line/80 bg-surface p-4">
              <div className="flex items-center justify-between text-xs text-ink-muted">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  Open Today 11:00 - 23:00
                </span>
                <a
                  href={restaurantConfig.phoneHref}
                  className="flex items-center gap-1 font-bold text-orange hover:underline"
                >
                  <Icon name="phone" size={12} />
                  Call us
                </a>
              </div>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Animated Hamburger Button positioned on the left */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="press relative flex h-10 w-10 items-center justify-center rounded-2xl bg-surface text-ink shadow-soft-xs transition-colors hover:bg-surface-strong hover:text-orange lg:hidden"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        <span className="relative flex h-5 w-5 flex-col items-center justify-center gap-1.5">
          <span
            className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
              isOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-200 ${
              isOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
              isOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      {/* Portal to document.body so CSS transforms/filters on header never clip the modal */}
      {hydrated && typeof document !== "undefined" ? createPortal(drawerContent, document.body) : null}
    </>
  );
}
