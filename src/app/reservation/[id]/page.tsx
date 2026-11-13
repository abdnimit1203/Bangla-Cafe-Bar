import type { Metadata } from "next";
import { Suspense } from "react";
import { ReservationDetail } from "@/components/reservation/reservation-detail";
import { Container } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Reservation" };

type Params = Promise<{ id: string }>;

export default function ReservationDetailPage({ params }: { params: Params }) {
  return (
    <Container className="py-6 sm:py-10">
      <Suspense fallback={<Skeleton className="h-72 rounded-card" />}>
        <Loader params={params} />
      </Suspense>
    </Container>
  );
}

async function Loader({ params }: { params: Params }) {
  const { id } = await params;
  return <ReservationDetail id={id} />;
}
