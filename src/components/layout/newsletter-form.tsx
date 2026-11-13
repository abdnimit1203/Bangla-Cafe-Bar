"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast({ title: "Please enter a valid email", tone: "info" });
      return;
    }
    toast({ title: "Thank you for subscribing!", description: "We'll keep you posted on seasonal roasts and tastings.", tone: "success" });
    setEmail("");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        required
        className="rounded-xl border border-line bg-surface-strong px-3.5 py-2 text-xs text-ink shadow-soft-xs placeholder:text-ink-faint focus:border-forest focus:outline-none"
      />
      <button
        type="submit"
        className="press rounded-xl bg-forest px-4 py-2 text-xs font-bold uppercase tracking-wider text-cream shadow-soft-xs transition-colors hover:bg-forest-deep"
      >
        Subscribe
      </button>
    </form>
  );
}
