import { Suspense } from "react";
import { AboutSection } from "@/components/home/about-section";
import { CategoryStrip } from "@/components/home/category-strip";
import { CoffeeBeansShowcase } from "@/components/home/coffee-beans-showcase";
import { FeaturedDishes } from "@/components/home/featured-dishes";
import { Hero } from "@/components/home/hero";
import { HeroFeatures } from "@/components/home/hero-features";
import { InfoSection } from "@/components/home/info-section";
import { MobileOrderBanner } from "@/components/home/mobile-order-banner";
import { RecommendedTreats } from "@/components/home/recommended-treats";
import { ReservationTeaser } from "@/components/home/reservation-teaser";
import { SpecialOffers } from "@/components/home/special-offers";
import { Float } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/card";
import { BeanShape, LeafShape } from "@/components/ui/decor";
import { Icon } from "@/components/ui/icon";
import { SectionErrorBoundary } from "@/components/ui/section-error-boundary";
import { ChipRowSkeleton, ProductGridSkeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  return (
    <>
      {/* 1. Hero Section with Latte Art, 3D Tilt & Floating Leaves */}
      <Hero />

      {/* 2. Distinct Gradient-Based Feature Boxes */}
      <HeroFeatures />

      {/* 3. Interactive Category Strip */}
      <Container className="py-6 sm:py-8">
        <SectionErrorBoundary compact title="Categories couldn't load">
          <Suspense fallback={<ChipRowSkeleton />}>
            <CategoryStrip />
          </Suspense>
        </SectionErrorBoundary>
      </Container>

      {/* 3. Popular Drinks & Signature Choices (Image 2 Matcha Container + Image 1 Drink Cards) */}
      <Container className="pb-12 sm:pb-16">
        <Reveal as="section" className="relative overflow-hidden rounded-3xl bg-gradient-matcha p-6 shadow-glow-matcha sm:p-10 lg:p-12" aria-labelledby="popular-drinks">
          {/* Floating interactive leaf and coffee bean */}
          <Float className="pointer-events-none absolute right-8 top-6 text-white/10" duration={8}>
            <LeafShape className="h-28 w-28" />
          </Float>
          <Float className="pointer-events-none absolute left-1/3 bottom-4 text-orange/20" duration={6} delay={1}>
            <BeanShape className="h-12 w-12" />
          </Float>

          <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,18rem)_1fr] lg:items-center">
            <div className="flex flex-col justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-deep/60 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-cream">
                  <Icon name="coffee" size={13} className="text-orange" />
                  Popular Choices
                </span>
                <h2 id="popular-drinks" className="mt-3 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
                  Our Signature Drinks
                </h2>
                <p className="mt-3 text-sm text-cream/80 leading-relaxed">
                  Discover our best-selling handcrafted beverages, made from single-origin beans and freshly steamed milk.
                </p>
              </div>
              <ButtonLink href="/menu" variant="cream" className="w-fit font-bold shadow-soft-sm">
                View full menu
                <Icon name="arrowRight" size={16} />
              </ButtonLink>
            </div>

            <SectionErrorBoundary title="Popular drinks couldn't load">
              <Suspense fallback={<ProductGridSkeleton count={3} columns={3} />}>
                <FeaturedDishes />
              </Suspense>
            </SectionErrorBoundary>
          </div>
        </Reveal>
      </Container>

      {/* 4. Recommended Treats (Fresh Pastries, Cheesecakes & Cookies - Image 2) */}
      <SectionErrorBoundary compact title="Treats section couldn't load">
        <Suspense fallback={null}>
          <RecommendedTreats />
        </Suspense>
      </SectionErrorBoundary>

      {/* 5. Our Story & Lifestyle Banner (Image 1 Style) */}
      <SectionErrorBoundary compact title="Story section couldn't load">
        <Suspense fallback={null}>
          <AboutSection />
        </Suspense>
      </SectionErrorBoundary>

      {/* 6. Coffee Beans We're Proud Of (Image 2 Roastery Showcase) */}
      <CoffeeBeansShowcase />

      {/* 7. Special Offers */}
      <SectionErrorBoundary compact title="Offers couldn't load">
        <Suspense fallback={null}>
          <SpecialOffers />
        </Suspense>
      </SectionErrorBoundary>

      {/* 8. Mobile & Pickup Ordering Banner (Image 1 Phone Mockup) */}
      <MobileOrderBanner />

      {/* 9. Restaurant Information & Hours */}
      <Container className="py-12 sm:py-16">
        <InfoSection />
      </Container>

      {/* 10. Book Your Cozy Spot Reservation Teaser (Image 1 Wave & Video Embed) */}
      <ReservationTeaser />
    </>
  );
}
