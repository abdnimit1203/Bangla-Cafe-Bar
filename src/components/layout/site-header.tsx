import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";
import { CartButton } from "@/components/layout/cart-button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchForm } from "@/components/layout/search-form";
import { Container } from "@/components/ui/card";

const links = [
  { href: "/menu", label: "Menu" },
  { href: "/reservation", label: "Reserve" },
  { href: "/order", label: "My orders" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/95 shadow-sm backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-3 sm:h-20 sm:gap-6">
        {/* Left Side: Hamburger (on mobile/tablet) + Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          <MobileNav />
          <BrandLogo />
        </div>

        {/* Center: Search Form (Desktop / Tablet) */}
        <SearchForm className="hidden flex-1 md:flex md:max-w-xs lg:max-w-sm" />

        {/* Right Side: Desktop Nav links + Order Tray */}
        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="press rounded-full px-3.5 py-2 text-sm font-semibold text-ink-muted transition-colors hover:bg-cream hover:text-forest"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <CartButton />
        </div>
      </Container>
    </header>
  );
}
