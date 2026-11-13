import type { Metadata } from "next";
import { ReservationFlow } from "@/components/reservation/reservation-flow";
import { Container, SectionHeading } from "@/components/ui/card";

export const metadata: Metadata = { title: "Reserve a table" };

export default function ReservationPage() {
  return (
    <div className="overflow-x-clip py-6 sm:py-10">
      <Container className="max-w-4xl space-y-8">
        <SectionHeading
          eyebrow="Table Booking"
          title="Reserve a Table"
          description="Pick your date, party size, and preferred dining time. Instant reservation confirmation."
        />
        <ReservationFlow />
      </Container>
    </div>
  );
}
