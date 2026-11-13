import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderTracker } from "@/components/order/order-tracker";
import { Container } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Order status" };

type Params = Promise<{ orderNumber: string }>;

export default function OrderPage({ params }: { params: Params }) {
  return (
    <Container className="py-6 sm:py-10">
      <Suspense fallback={<Skeleton className="h-80 rounded-card" />}>
        <OrderLoader params={params} />
      </Suspense>
    </Container>
  );
}

async function OrderLoader({ params }: { params: Params }) {
  const { orderNumber } = await params;
  return <OrderTracker orderNumber={decodeURIComponent(orderNumber)} />;
}
