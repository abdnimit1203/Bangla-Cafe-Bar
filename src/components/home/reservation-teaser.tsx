import Image from "next/image";
import { Float } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/card";
import { BeanShape, CoffeeCupShape, LeafShape, SparkleShape } from "@/components/ui/decor";
import { Icon } from "@/components/ui/icon";
import { restaurantConfig } from "@/lib/config/restaurant";

/**
 * Reservation band with a warm, clean gradient and interactive floating elements.
 */
export function ReservationTeaser() {
  const { reservation } = restaurantConfig;

  return (
    <section className="relative overflow-hidden border-y border-line/60 bg-gradient-to-br from-[#faf7f2] via-[#edf5ec] to-[#f7eee2] py-16 sm:py-20 lg:py-24" aria-labelledby="reserve">
      {/* Interactive floating cafe elements */}
      <Float className="pointer-events-none absolute left-8 top-12 text-forest/25" duration={7} distance={12}>
        <LeafShape className="h-20 w-20" />
      </Float>
      <Float className="pointer-events-none absolute right-12 top-16 text-orange/30" duration={8} delay={0.5} distance={14}>
        <CoffeeCupShape className="h-16 w-16" />
      </Float>
      <Float className="pointer-events-none absolute bottom-12 left-1/4 text-orange-deep/20" duration={6} delay={1} distance={8}>
        <BeanShape className="h-10 w-10" />
      </Float>
      <Float className="pointer-events-none absolute bottom-16 right-1/4 text-gold/35" duration={9} delay={1.5} distance={10}>
        <SparkleShape className="h-8 w-8" />
      </Float>

      <Container className="relative z-10 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-center">
        {/* Left Side: Booking Teaser & Contact */}
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-surface-strong px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-forest shadow-soft-xs">
            <Icon name="calendar" size={13} className="text-orange" />
            Reserve a Table
          </span>

          <h2 id="reserve" className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-5xl">
            Book Your <span className="font-serif italic text-orange">Cozy Spot</span>
          </h2>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
            Good food, exceptional artisanal coffee, and even better company. Reserve a sunlit corner for casual meetings, intimate dinners, or family celebrations in Gulshan.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {reservation.enabled ? (
              <ButtonLink href="/reservation" size="lg" className="bg-orange hover:bg-orange-deep text-white shadow-glow-warm">
                <Icon name="calendar" size={16} />
                Reserve a Table
              </ButtonLink>
            ) : (
              <ButtonLink href={restaurantConfig.phoneHref} size="lg" className="bg-orange hover:bg-orange-deep text-white shadow-glow-warm">
                <Icon name="phone" size={16} />
                Call {restaurantConfig.phone}
              </ButtonLink>
            )}
            <ButtonLink href="/menu" size="lg" variant="forest">
              Explore Menu
              <Icon name="arrowRight" size={16} />
            </ButtonLink>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-xs font-medium text-ink-muted">
            <span className="flex items-center gap-1.5">
              <Icon name="check" size={14} className="text-success" />
              Instant confirmation
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="check" size={14} className="text-success" />
              No deposit required
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="check" size={14} className="text-success" />
              Private booths available
            </span>
          </div>
        </Reveal>

        {/* Right Side: Media Card / Coffee Maker Video Teaser */}
        <Reveal delay={0.15}>
          <div className="relative overflow-hidden rounded-3xl border border-line bg-surface-strong p-3.5 shadow-soft">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-sand shadow-inner">
              <Image
                src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
                alt="Barista brewing specialty espresso in portafilter"
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange text-white shadow-xl transition-transform hover:scale-110">
                  <Icon name="play" size={24} className="ml-1" />
                </div>
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl bg-black/60 px-3 py-2 text-xs text-white backdrop-blur-md">
                <span className="font-medium">The Art of the Perfect Brew</span>
                <span className="rounded bg-orange px-2 py-0.5 text-[10px] font-bold">Watch</span>
              </div>
            </div>

            <div className="mt-4 px-3 pb-2">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-forest">Visit Us In Person</p>
              <div className="mt-2 flex flex-col gap-1.5 text-xs text-ink-muted">
                <p className="flex items-center gap-2">
                  <Icon name="pin" size={14} className="text-orange shrink-0" />
                  {restaurantConfig.address.line1}, {restaurantConfig.address.city}
                </p>
                <p className="flex items-center gap-2">
                  <Icon name="clock" size={14} className="text-orange shrink-0" />
                  Open Daily: 11:00 AM – 11:00 PM
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
