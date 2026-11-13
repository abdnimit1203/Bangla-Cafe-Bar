import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";
import { CurrentYear } from "@/components/layout/current-year";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { Float } from "@/components/motion/parallax";
import { Container } from "@/components/ui/card";
import { BeanShape, LeafShape, WaveDivider } from "@/components/ui/decor";
import { Icon } from "@/components/ui/icon";
import { restaurantConfig } from "@/lib/config/restaurant";

export function SiteFooter() {
  const address = restaurantConfig.address;

  return (
    <footer className="relative mt-20 overflow-hidden bg-gradient-forest-dark text-cream">
      {/* Wave divider at top transitioning from canvas to deep forest */}
      <WaveDivider className="absolute -top-px left-0 h-10 w-full text-canvas sm:h-16" flip />

      {/* Floating subtle organic leaf & bean accents */}
      <Float className="pointer-events-none absolute left-6 top-20 text-sage/20" duration={8}>
        <LeafShape className="h-24 w-24" />
      </Float>
      <Float className="pointer-events-none absolute right-12 top-28 text-orange/20" duration={7} delay={1}>
        <BeanShape className="h-14 w-14" />
      </Float>

      <Container className="relative z-10 pt-20 pb-12 sm:pt-28">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.3fr]">
          {/* Brand & Story Column */}
          <div className="space-y-4">
            <BrandLogo size="lg" invert />
            <p className="max-w-sm text-sm leading-relaxed text-cream/80">
              {restaurantConfig.hero.description}
            </p>
            <div className="space-y-2 pt-2 text-xs text-cream/70">
              <p className="flex items-center gap-2">
                <Icon name="pin" size={15} className="text-orange shrink-0" />
                {address.line1}, {address.city}
              </p>
              <p className="flex items-center gap-2">
                <Icon name="phone" size={15} className="text-orange shrink-0" />
                <a href={restaurantConfig.phoneHref} className="hover:text-cream transition-colors">
                  {restaurantConfig.phone}
                </a>
              </p>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sage">Explore & Order</p>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/80">
              <li>
                <Link href="/menu" className="transition-colors hover:text-orange">
                  Full Menu & Brews
                </Link>
              </li>
              <li>
                <Link href="/reservation" className="transition-colors hover:text-orange">
                  Reserve a Table
                </Link>
              </li>
              <li>
                <Link href="/order" className="transition-colors hover:text-orange">
                  Track Live Orders
                </Link>
              </li>
              <li>
                <Link href="/cart" className="transition-colors hover:text-orange">
                  View Order Tray
                </Link>
              </li>
            </ul>
          </div>

          {/* Stay Updated / Newsletter Column */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sage">Stay Updated</p>
            <p className="mt-2 text-xs leading-relaxed text-cream/80">
              Subscribe for exclusive seasonal coffee tastings, new menu previews, and weekend chef specials.
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 border-t border-white/10 pt-6">
          <div className="flex flex-col items-center justify-between gap-3 text-xs text-cream/60 sm:flex-row">
            <span>
              {restaurantConfig.name} &copy; <CurrentYear />. All rights reserved.
            </span>
            <span className="flex items-center gap-3">
              <span>House 12, Road 45, Gulshan 2, Dhaka</span>
              <span>•</span>
              <span className="text-sage font-medium">Artisanal Coffee & Bengali Kitchen</span>
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
