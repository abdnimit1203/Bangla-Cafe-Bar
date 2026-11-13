import { ProductGrid } from "@/components/menu/product-grid";
import { Reveal } from "@/components/motion/reveal";
import { Container, SectionHeading } from "@/components/ui/card";
import { loadSpecialOffers } from "@/lib/commerce/catalog";

/** Rendered only when the catalog has products on sale (server-derived `onSale`). */
export async function SpecialOffers() {
  const products = await loadSpecialOffers(4);
  if (!products.length) return null;
  return (
    <Container className="pb-14">
      <Reveal as="section" aria-labelledby="offers" className="space-y-6">
        <SectionHeading eyebrow="Limited time" title="Special offers" />
        <ProductGrid products={products} />
      </Reveal>
    </Container>
  );
}
