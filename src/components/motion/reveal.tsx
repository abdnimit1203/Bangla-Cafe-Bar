"use client";

import * as m from "motion/react-m";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Scroll-reveal wrapper: fades and lifts children in once, when they enter
 * the viewport. Only opacity and transform animate, so there is no layout
 * shift. With a reduced-motion preference only the fade runs.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  const Tag = m[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.65, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}

/** Staggers direct children: wrap each child in <Reveal delay={i * 0.06}> instead when order matters. */
export function RevealGroup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <m.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
    >
      {children}
    </m.div>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <m.div
      className={className}
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } }}
    >
      {children}
    </m.div>
  );
}
