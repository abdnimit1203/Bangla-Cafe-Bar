import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

export function MobileOrderBanner() {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <Reveal as="div" className="relative overflow-hidden rounded-card bg-gradient-to-r from-surface via-cream to-sand/60 p-6 shadow-soft sm:p-10 lg:p-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.1fr]">
            {/* Phone Mockup (Image 1 style) */}
            <div className="relative mx-auto flex w-full max-w-xs items-center justify-center">
              <div className="relative aspect-[9/18] w-56 overflow-hidden rounded-[2.5rem] border-[6px] border-ink bg-canvas shadow-2xl sm:w-64">
                {/* Speaker pill notch */}
                <div className="absolute left-1/2 top-2 z-20 h-3.5 w-20 -translate-x-1/2 rounded-full bg-ink" />

                {/* Screen content mockup */}
                <div className="flex h-full flex-col p-4 pt-8">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xs font-bold text-ink">Bangla Cafe</span>
                    <span className="h-2 w-2 rounded-full bg-success animate-ping" />
                  </div>
                  <div className="mt-3 relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-sm">
                    <Image
                      src="https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=400&q=80"
                      alt="Caramel Latte"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="mt-3 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange">Specialty Brew</span>
                    <h4 className="font-display text-xs font-bold text-ink">Artisan Caramel Latte</h4>
                    <p className="text-[9px] text-ink-muted">Handcrafted with silky milk & caramel.</p>
                  </div>
                  <div className="mt-auto rounded-xl bg-orange p-2 text-center text-[10px] font-bold text-white shadow-sm">
                    Order for Pickup
                  </div>
                </div>
              </div>
            </div>

            {/* Content side */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-forest">Digital Ordering</p>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
                Order Your Favorite Brews <span className="font-serif italic text-orange">Anytime</span>
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-ink-muted sm:text-base">
                Whether you&apos;re running between Gulshan meetings or lounging on a weekend morning, order your favorite roasts, fresh croissants, and Bengali kitchen dishes with just a few taps.
              </p>

              {/* Store & Web Buttons */}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <ButtonLink href="/menu" size="lg">
                  Order online now
                  <Icon name="arrowRight" size={16} />
                </ButtonLink>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 rounded-xl bg-ink px-3.5 py-2 text-xs font-semibold text-white shadow-sm">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87-.96.04-2.13.65-2.77 1.39-.55.62-.97 1.63-.91 2.64 1.05.08 2.06-.41 2.67-1.16z" />
                    </svg>
                    <span className="leading-tight text-[11px]">
                      <span className="block text-[8px] text-gray-400">Download on</span>
                      App Store
                    </span>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl bg-ink px-3.5 py-2 text-xs font-semibold text-white shadow-sm">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.67.4.67 1.4 0 1.8l-14 8.5c-.66.5-1.6.03-1.6-.8z" />
                    </svg>
                    <span className="leading-tight text-[11px]">
                      <span className="block text-[8px] text-gray-400">Get it on</span>
                      Google Play
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

