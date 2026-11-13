import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon, type IconName } from "@/components/ui/icon";
import { restaurantConfig } from "@/lib/config/restaurant";
import { hoursSummary } from "@/lib/restaurant/hours";

interface ServiceCard {
  icon: IconName;
  title: string;
  badge: string;
  description: string;
  actionText: string;
  actionHref: string;
  actionVariant: "primary" | "secondary" | "forest";
}

export function InfoSection() {
  const { delivery, pickup } = restaurantConfig.fulfillment;
  const rows = hoursSummary();
  const address = restaurantConfig.address;

  const services: ServiceCard[] = [
    {
      icon: "chair",
      title: "Cozy Dine-In",
      badge: "Reserved Seating",
      description: "Relax in air-conditioned comfort, sunlit corner tables, and warm booths for memorable dinners and coffee dates.",
      actionText: "Reserve a Table",
      actionHref: "/reservation",
      actionVariant: "forest",
    },
    {
      icon: "pickup",
      title: "Express Takeaway",
      badge: "Zero Queue",
      description: `Order ahead online and collect from the barista counter in about ${pickup.leadMinutes || 15} minutes, packed fresh.`,
      actionText: "Order Takeaway",
      actionHref: "/menu",
      actionVariant: "secondary",
    },
    {
      icon: "bike",
      title: "Doorstep Delivery",
      badge: delivery.estimate || "35-45 mins",
      description: "Carefully sealed thermal packaging delivering artisanal coffee and Bengali kitchen favorites right to your door.",
      actionText: "Order Delivery",
      actionHref: "/menu",
      actionVariant: "primary",
    },
  ];

  return (
    <section className="space-y-10" aria-labelledby="visit-cafe">
      <Reveal>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-forest shadow-soft-xs">
              <Icon name="pin" size={13} className="text-orange" />
              Visit Our Cafe
            </span>
            <h2 id="visit-cafe" className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">
              Opening Hours & Experiences
            </h2>
            <p className="mt-2 max-w-xl text-sm text-ink-muted">
              Whether you are dining in, picking up your morning roast, or ordering home delivery, we are ready to serve you.
            </p>
          </div>
        </div>
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1.5fr] lg:items-start">
        {/* Left Column: Hours & Location Card */}
        <Reveal>
          <Card className="flex flex-col rounded-3xl bg-surface-strong p-6 sm:p-8 shadow-soft border border-line/60">
            <div className="flex items-center justify-between border-b border-line/70 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-forest">Schedule</span>
                <h3 className="font-display text-xl font-bold text-ink">Opening Hours</h3>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                Open Today
              </span>
            </div>

            <dl className="mt-5 space-y-3 text-sm">
              {rows.map((row) => (
                <div key={row.days} className="flex items-center justify-between gap-4 border-b border-line/40 pb-2.5 last:border-0">
                  <dt className="font-medium text-ink-muted">{row.days}</dt>
                  <dd className="font-bold text-ink">{row.label}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 rounded-2xl bg-cream/50 p-4 border border-line/60 space-y-2">
              <p className="flex items-start gap-2.5 text-xs text-ink-muted">
                <Icon name="pin" size={15} className="mt-0.5 shrink-0 text-orange" />
                <span>
                  <strong className="text-ink">Address:</strong> {address.line1}, {address.city}
                </span>
              </p>
              <p className="flex items-center gap-2.5 text-xs text-ink-muted">
                <Icon name="phone" size={15} className="shrink-0 text-orange" />
                <span>
                  <strong className="text-ink">Direct line:</strong>{" "}
                  <a href={restaurantConfig.phoneHref} className="text-orange hover:underline font-semibold">
                    {restaurantConfig.phone}
                  </a>
                </span>
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href={restaurantConfig.phoneHref} variant="secondary" size="md" className="flex-1 justify-center">
                <Icon name="phone" size={14} />
                Call Cafe
              </ButtonLink>
              <ButtonLink
                href={`https://maps.google.com/?q=${encodeURIComponent(`${restaurantConfig.name} ${address.line1} ${address.city}`)}`}
                variant="forest"
                size="md"
                className="flex-1 justify-center"
              >
                <Icon name="pin" size={14} />
                Get Directions
              </ButtonLink>
            </div>
          </Card>
        </Reveal>

        {/* Right Column: 3 Fulfillment Cards with Well-Spaced Buttons */}
        <RevealGroup className="grid gap-5 sm:grid-cols-3">
          {services.map((service) => (
            <RevealItem key={service.title} className="flex">
              <Card className="flex w-full flex-col justify-between rounded-3xl bg-surface-strong p-6 shadow-soft border border-line/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-sm">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-soft text-forest shadow-soft-xs">
                      <Icon name={service.icon} size={20} />
                    </span>
                    <span className="rounded-full bg-cream px-2.5 py-0.5 text-[10px] font-bold text-ink-muted shadow-soft-xs">
                      {service.badge}
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-lg font-bold text-ink">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                    {service.description}
                  </p>
                </div>

                <div className="mt-6 pt-2">
                  <ButtonLink
                    href={service.actionHref}
                    variant={service.actionVariant}
                    size="sm"
                    className="w-full justify-center text-xs font-bold"
                  >
                    {service.actionText}
                    <Icon name="arrowRight" size={14} />
                  </ButtonLink>
                </div>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
