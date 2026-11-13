import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductDetail } from "@/components/product/product-detail";
import { ProductDetailSkeleton } from "@/components/product/product-detail-skeleton";
import { Container } from "@/components/ui/card";
import { loadCollectionProducts, loadProduct } from "@/lib/commerce/catalog";
import { restaurantConfig } from "@/lib/config/restaurant";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug).catch(() => null);
  return {
    title: product?.name ?? "Dish",
    description: product?.description,
  };
}

export default function ProductPage({ params }: { params: Params }) {
  return (
    <Container className="py-6 sm:py-10">
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductLoader params={params} />
      </Suspense>
    </Container>
  );
}

async function ProductLoader({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) notFound();
  const addOns = (await loadCollectionProducts(restaurantConfig.catalog.addOnsCollection, 6)).filter(
    (item) => item.id !== product.id,
  );
  return <ProductDetail product={product} addOns={addOns} />;
}
