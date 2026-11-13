import type { Metadata } from "next";
import { Suspense } from "react";
import { CategoryChips } from "@/components/menu/category-chips";
import { MenuResults } from "@/components/menu/menu-results";
import { Container, SectionHeading } from "@/components/ui/card";
import { SectionErrorBoundary } from "@/components/ui/section-error-boundary";
import { ChipRowSkeleton, ProductGridSkeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Menu" };

export type MenuSearchParams = Promise<{ category?: string | string[]; q?: string | string[] }>;

export default function MenuPage({ searchParams }: { searchParams: MenuSearchParams }) {
  return (
    <Container className="space-y-8 py-6 sm:py-10">
      <SectionHeading eyebrow="Our menu" title="Full menu" description="Browse by category or search for a dish." />
      <SectionErrorBoundary compact title="Categories couldn't load">
        <Suspense fallback={<ChipRowSkeleton />}>
          <CategoryChips searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>
      <SectionErrorBoundary title="The menu couldn't load">
        <Suspense fallback={<ProductGridSkeleton />}>
          <MenuResults searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>
    </Container>
  );
}
