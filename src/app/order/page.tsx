import type { Metadata } from "next";
import { RecentActivity } from "@/components/order/recent-activity";
import { Container, SectionHeading } from "@/components/ui/card";

export const metadata: Metadata = { title: "My orders" };

export default function OrdersPage() {
  return (
    <Container className="space-y-8 py-6 sm:py-10">
      <SectionHeading
        eyebrow="On this device"
        title="My orders and reservations"
        description="Orders and table bookings made from this browser. Tap one to see its live status."
      />
      <RecentActivity />
    </Container>
  );
}
