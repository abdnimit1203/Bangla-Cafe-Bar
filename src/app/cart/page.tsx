import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { Container, SectionHeading } from "@/components/ui/card";

export const metadata: Metadata = { title: "Your order" };

export default function CartPage() {
  return (
    <Container className="space-y-8 py-6 sm:py-10">
      <SectionHeading eyebrow="Order tray" title="Your order" />
      <CartView />
    </Container>
  );
}
