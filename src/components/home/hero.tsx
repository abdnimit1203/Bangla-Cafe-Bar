import { Suspense } from "react";
import { HeroVisual } from "@/components/home/hero-visual";
import { TodayHours } from "@/components/home/today-hours";
import { Float } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/card";
import { BeanShape, LeafShape, SparkleShape } from "@/components/ui/decor";
import { Icon } from "@/components/ui/icon";
import { SectionErrorBoundary } from "@/components/ui/section-error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { coverImage, currencyOf, imageUrl, priceRangeMinor } from "@/lib/commerce/catalog-helpers";
import { loadCollectionProducts, loadNewest } from "@/lib/commerce/catalog";
import { restaurantConfig } from "@/lib/config/restaurant";

export function Hero() {
  const { hero, reservation } = restaurantConfig;
  const [before, after] = splitAccent(hero.heading, hero.accent);

  return (
    <section className="relative overflow-hidden border-b border-line/60 bg-gradient-to-br from-[#fbf8f2] via-[#eef4ec] to-[#f7ece0]">
      {/* Soft ambient lighting gradient in background */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(107,136,113,0.18),transparent_70%)]"
        aria-hidden="true"
      />

      {/* Floating interactive cafe elements in hero */}
      <Float className="pointer-events-none absolute left-6 top-16 text-forest/20" duration={8} distance={14}>
        <LeafShape className="h-16 w-16" />
      </Float>
      <Float className="pointer-events-none absolute left-[35%] bottom-10 text-orange/25" duration={7} delay={1} distance={10}>
        <BeanShape className="h-9 w-9" />
      </Float>
      <Float className="pointer-events-none absolute right-[10%] top-12 text-gold/30" duration={9} delay={0.5} distance={12}>
        <SparkleShape className="h-7 w-7" />
      </Float>

      <Container className="relative z-10 grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.15fr_1fr] lg:gap-14 lg:py-20">
        <div className="relative z-10">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-surface-strong/90 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-forest shadow-soft-xs backdrop-blur-sm">
              <Icon name="coffee" size={13} className="text-orange" />
              {hero.eyebrow}
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-5 max-w-xl font-display text-4xl font-bold leading-[1.12] text-ink sm:text-5xl lg:text-6xl">
              {before}
              {after !== null ? (
                <>
                  <span className="relative inline-block font-display font-medium italic text-orange">
                    {hero.accent}
                    <span className="absolute -bottom-1 left-0 right-0 h-1.5 rounded-full bg-orange/35" />
                  </span>
                  {after}
                </>
              ) : null}
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-5 max-w-lg text-base text-ink-muted sm:text-lg leading-relaxed">{hero.description}</p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <ButtonLink href="/menu" size="lg" className="shadow-glow-warm">
                Explore Menu
                <Icon name="arrowRight" size={16} />
              </ButtonLink>
              {reservation.enabled ? (
                <ButtonLink href="/reservation" size="lg" variant="forest">
                  <Icon name="calendar" size={16} />
                  Book a Table
                </ButtonLink>
              ) : (
                <ButtonLink href={restaurantConfig.phoneHref} size="lg" variant="forest">
                  <Icon name="phone" size={16} />
                  Call to reserve
                </ButtonLink>
              )}
            </div>

            <div className="mt-5 flex items-center">
              <TodayHours />
            </div>
          </Reveal>
        </div>

        {/* Right side: Hero Latte Art Visual */}
        <div className="relative">
          <SectionErrorBoundary compact title="Featured specialty couldn't load">
            <Suspense fallback={<HeroVisualSkeleton />}>
              <HeroDish />
            </Suspense>
          </SectionErrorBoundary>
        </div>
      </Container>
    </section>
  );
}

function splitAccent(heading: string, accent: string): [string, string | null] {
  const index = accent ? heading.indexOf(accent) : -1;
  if (index < 0) return [heading, null];
  return [heading.slice(0, index), heading.slice(index + accent.length)];
}

async function HeroDish() {
  const featured = await loadCollectionProducts(restaurantConfig.catalog.featuredCollection, 1);
  const product = featured[0] ?? (await loadNewest(1))[0] ?? null;
  const brandHero = restaurantConfig.hero.image;
  const productCover = product ? coverImage(product) : null;
  const image = brandHero
    ? { src: brandHero.src, alt: brandHero.alt }
    : productCover
      ? { src: imageUrl(productCover) ?? productCover.url, alt: productCover.alt ?? product!.name }
      : null;
  const range = product ? priceRangeMinor(product) : null;
  return (
    <HeroVisual
      image={image}
      dish={
        product
          ? {
              name: product.name,
              slug: product.slug,
              description: product.description,
              priceMinor: range?.min ?? null,
              currency: currencyOf(product),
              fromPrice: range ? range.min !== range.max : false,
            }
          : null
      }
    />
  );
}

function HeroVisualSkeleton() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <Skeleton className="blob h-full w-full rounded-full" />
    </div>
  );
}
