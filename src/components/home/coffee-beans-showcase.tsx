import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

export function CoffeeBeansShowcase() {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <Reveal as="div" className="overflow-hidden rounded-card bg-gradient-to-br from-cream via-surface to-sage-soft p-6 shadow-soft sm:p-10 lg:p-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-forest">
                <Icon name="coffee" size={14} className="text-orange" />
                Artisan Roastery
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
                Coffee Beans We&apos;re Proud Of
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">
                We partner with ethical growers to bring specialty micro-lot Arabica beans straight to Dhaka. Roasted weekly in small batches to preserve bright florals, deep chocolate notes, and silky crema.
              </p>

              {/* Three feature pills from Image 2 */}
              <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-ink">
                <div className="flex items-center gap-2 rounded-xl bg-surface-strong/80 px-3 py-2 shadow-soft-xs">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sage-soft text-forest">
                    <Icon name="leaf" size={12} />
                  </span>
                  <span>Direct Trade</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-surface-strong/80 px-3 py-2 shadow-soft-xs">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-soft text-orange">
                    <Icon name="flame" size={12} />
                  </span>
                  <span>Freshly Roasted</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-surface-strong/80 px-3 py-2 shadow-soft-xs">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gold-soft text-gold-deep">
                    <Icon name="coffee" size={12} />
                  </span>
                  <span>Packed Fresh</span>
                </div>
              </div>

              <div className="mt-8">
                <ButtonLink href="/menu" variant="forest" size="md">
                  Explore beans & drinks
                  <Icon name="arrowRight" size={16} />
                </ButtonLink>
              </div>
            </div>

            <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl shadow-soft">
              <Image
                src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1000&q=80"
                alt="Artisan roasted coffee beans in a burlap sack and wooden bowl"
                fill
                sizes="(min-width: 1024px) 30rem, 100vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

