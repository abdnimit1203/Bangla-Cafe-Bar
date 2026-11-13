import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";

export default function NotFound() {
  return (
    <Container className="py-16">
      <EmptyState
        title="We couldn't find that page"
        description="The dish or page you're looking for may have moved or is no longer on the menu."
        action={<ButtonLink href="/menu">Browse the menu</ButtonLink>}
      />
    </Container>
  );
}
