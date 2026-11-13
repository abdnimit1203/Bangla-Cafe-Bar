import { Float } from "@/components/motion/parallax";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Container } from "@/components/ui/card";
import { BeanShape, LeafShape } from "@/components/ui/decor";
import { Icon, type IconName } from "@/components/ui/icon";

interface FeatureCard {
  title: string;
  tag: string;
  description: string;
  icon: IconName;
  gradientClass: string;
  borderClass: string;
  iconBgClass: string;
  iconColorClass: string;
}

const features: FeatureCard[] = [
  {
    title: "Premium Coffee",
    tag: "Direct Trade",
    description: "Sourced directly from trusted high-altitude estates to ensure exceptional aroma and sweet, balanced flavor.",
    icon: "coffee",
    gradientClass: "from-[#eff7f0] via-[#f5faf6] to-[#e2efe3]",
    borderClass: "border-[#cce3cf]",
    iconBgClass: "bg-forest",
    iconColorClass: "text-cream",
  },
  {
    title: "Fresh Roasting",
    tag: "Small Batch",
    description: "Every batch is roasted weekly in small quantities in Gulshan to preserve aromatic oils and golden crema.",
    icon: "flame",
    gradientClass: "from-[#fef6ed] via-[#fff9f4] to-[#fce6d2]",
    borderClass: "border-[#f6d7bc]",
    iconBgClass: "bg-orange",
    iconColorClass: "text-white",
  },
  {
    title: "Expert Baristas",
    tag: "Handcrafted",
    description: "Our experienced baristas craft every extraction, latte pour, and slow drip with passion and precision.",
    icon: "utensils",
    gradientClass: "from-[#faf4ea] via-[#fcf8f1] to-[#f4e4ce]",
    borderClass: "border-[#ecd4b7]",
    iconBgClass: "bg-gold",
    iconColorClass: "text-white",
  },
  {
    title: "Cozy Atmosphere",
    tag: "Welcoming Vibe",
    description: "Relax in a warm, welcoming space with soothing greenery, quiet corners, and friendly conversation.",
    icon: "heart",
    gradientClass: "from-[#f2f7f3] via-[#f7fbf8] to-[#dceade]",
    borderClass: "border-[#cbdfce]",
    iconBgClass: "bg-sage",
    iconColorClass: "text-white",
  },
];

export function HeroFeatures() {
  return (
    <section className="relative overflow-hidden py-10 sm:py-16 bg-gradient-to-b from-[#fbf8f2]/60 to-canvas">
      {/* Floating interactive decor */}
      <Float className="pointer-events-none absolute right-4 top-8 text-forest/20" duration={7} distance={10}>
        <LeafShape className="h-16 w-16" />
      </Float>
      <Float className="pointer-events-none absolute left-6 bottom-6 text-orange/25" duration={8} delay={1} distance={12}>
        <BeanShape className="h-10 w-10" />
      </Float>

      <Container className="relative z-10">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-forest shadow-soft-xs">
              <Icon name="sparkles" size={13} className="text-orange" />
              The Bangla Cafe Difference
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold text-ink sm:text-3xl">
              Crafted With Care, From Bean to Cup
            </h2>
          </div>
        </Reveal>

        <RevealGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((item) => (
            <RevealItem key={item.title} className="flex">
              <div
                className={`press group relative flex w-full flex-col justify-between rounded-3xl bg-gradient-to-br ${item.gradientClass} p-6 shadow-soft-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft border ${item.borderClass}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconBgClass} ${item.iconColorClass} shadow-md transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon name={item.icon} size={22} />
                    </span>
                    <span className="rounded-full bg-white/70 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-muted backdrop-blur-xs">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-lg font-bold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                    {item.description}
                  </p>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

