import { ProductGrid } from "@/components/menu/product-grid";
import { Float } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/card";
import { LeafShape, PlateShape } from "@/components/ui/decor";
import { Icon } from "@/components/ui/icon";
import { loadCollectionProducts, loadMenuPage } from "@/lib/commerce/catalog";

export async function RecommendedTreats() {
  let treats = await loadCollectionProducts("treats", 4);
  if (!treats.length) {
    const page = await loadMenuPage({ category: "treats-and-bakery", limit: 4 });
    treats = page.data;
  }
  if (!treats.length) return null;

  return (
    <section className="relative overflow-hidden py-12 sm:py-16">
      {/* Floating interactive treat accents */}
      <Float className="pointer-events-none absolute right-8 top-12 text-forest/20" duration={8} distance={12}>
        <PlateShape className="h-20 w-20" />
      </Float>
      <Float className="pointer-events-none absolute left-6 bottom-8 text-sage/25" duration={7} delay={1} distance={10}>
        <LeafShape className="h-16 w-16" />
      </Float>

      <Container className="relative z-10">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-forest">
                <Icon name="sparkles" size={14} className="text-orange" />
                Fresh from our bakery
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
                Recommended Treats
              </h2>
              <p className="mt-2 max-w-xl text-sm text-ink-muted">
                Handcrafted pastries, creamy cheesecakes, and warm cookies baked every morning to pair with your specialty cup.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mt-8">
          <ProductGrid products={treats.slice(0, 4)} columns={4} cardVariant="treat" />
        </div>
      </Container>
    </section>
  );
}

