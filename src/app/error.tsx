"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/states";

export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") console.error(error);
  }, [error]);

  return (
    <Container className="py-16">
      <ErrorState
        title="Something went wrong"
        description="We couldn't load this page. Please try again in a moment."
        action={
          <Button onClick={() => reset()} variant="secondary">
            Try again
          </Button>
        }
      />
    </Container>
  );
}
