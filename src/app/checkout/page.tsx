import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/checkout/checkout-flow";
import { Container, SectionHeading } from "@/components/ui/card";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <Container className="space-y-8 py-6 sm:py-10">
      <SectionHeading eyebrow="Almost there" title="Checkout" description="Choose how you'd like your food and tell us how to reach you." />
      <CheckoutFlow />
    </Container>
  );
}
