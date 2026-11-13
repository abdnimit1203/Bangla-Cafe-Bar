import type { Metadata } from "next";
import { ReservationFlow } from "@/components/reservation/reservation-flow";
import { Container, SectionHeading } from "@/components/ui/card";

export const metadata: Metadata = { title: "Reserve a table" };

export default function ReservationPage() {
  return (
    <Container className="space-y-8 py-6 sm:py-10">
      <SectionHeading
        eyebrow="Reservations"
        title="Reserve a table"
        description="Pick a date, your party size and a time. Availability is checked live with the restaurant."
      />
      <ReservationFlow />
    </Container>
  );
}
