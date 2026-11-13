import Image from "next/image";
import { Parallax } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/card";
import { BeanShape, LeafShape } from "@/components/ui/decor";
import { Icon } from "@/components/ui/icon";
import { loadHomeContent } from "@/lib/commerce/catalog";
import { restaurantConfig } from "@/lib/config/restaurant";

/**
 * "Our story" band on warm sand. Copy comes from the store's published CMS
 * home page text sections when present, otherwise from site config.
 */
export async function AboutSection() {
  const page = await loadHomeContent();
  const textSections = (page?.content.sections ?? []).filter((s) => s.type === "text" && !s.hidden);
  const [lead, ...rest] = textSections;
  const heading = lead?.type === "text" ? lead.data.heading : restaurantConfig.about.heading;
  const body = lead?.type === "text" ? lead.data.body : restaurantConfig.about.description;
  const highlights = rest.length
    ? rest.flatMap((s) => (s.type === "text" ? [{ title: s.data.heading, description: s.data.body }] : []))
    : restaurantConfig.about.highlights;
  const image = restaurantConfig.about.image;

  return (
    <Container className="pb-14">
      <Reveal as="section" className="relative overflow-hidden rounded-card bg-gradient-caramel shadow-soft" aria-labelledby="story">
        <LeafShape className="pointer-events-none absolute -left-6 -top-6 h-32 w-32 text-sage/40" />
        <BeanShape className="pointer-events-none absolute bottom-6 left-[38%] h-12 w-12 text-orange/30" />
        {/* Decorative curved SVG line (Image 1 style) */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-35"
          viewBox="0 0 1000 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-50 250 C 200 450, 450 150, 700 350 C 850 480, 1000 200, 1100 250"
            stroke="#c88243"
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />
        </svg>
        <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-forest">{restaurantConfig.about.eyebrow}</p>
            <h2 id="story" className="mt-3 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
              {heading}
            </h2>
            <p className="mt-4 max-w-xl text-sm text-ink-muted sm:text-base leading-relaxed">{body}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {highlights.slice(0, 4).map((item) => (
                <div key={item.title} className="rounded-2xl bg-surface-strong/90 p-4 shadow-soft-xs backdrop-blur-sm">
                  <Icon name="coffee" size={16} className="text-orange" />
                  <h3 className="mt-2 font-display text-base font-bold text-ink">{item.title}</h3>
                  <p className="mt-1 text-xs text-ink-muted">{item.description}</p>
                </div>
              ))}
            </div>
            <ButtonLink href="/menu" className="mt-7">
              Explore the menu
              <Icon name="arrowRight" size={16} />
            </ButtonLink>
          </div>
          <Parallax amount={20} className="relative mx-auto w-full max-w-sm">
            <div className="blob absolute inset-[4%] bg-orange-deep/10" aria-hidden="true" />
            <div className="blob relative aspect-[4/5] overflow-hidden bg-sand shadow-soft">
              {image ? (
                <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 24rem, 100vw" className="object-cover" />
              ) : (
                <span className="flex h-full w-full flex-col items-center justify-center gap-2 text-forest/60">
                  <Icon name="coffee" size={48} />
                  <span className="text-xs font-semibold uppercase tracking-[0.18em]">Photo slot</span>
                </span>
              )}
            </div>
          </Parallax>
        </div>
      </Reveal>
    </Container>
  );
}
