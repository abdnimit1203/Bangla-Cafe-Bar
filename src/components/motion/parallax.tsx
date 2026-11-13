"use client";

import * as m from "motion/react-m";
import { useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { useDesktopPointer } from "@/components/motion/use-desktop-pointer";

/**
 * Gentle vertical parallax tied to scroll position. Static on small screens,
 * touch devices and when reduced motion is preferred.
 */
export function Parallax({
  children,
  amount = 24,
  className,
}: {
  children: ReactNode;
  amount?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const desktop = useDesktopPointer();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [amount, -amount]);
  const active = desktop && !reduced;
  return (
    <m.div ref={ref} className={className} style={active ? { y } : undefined}>
      {children}
    </m.div>
  );
}

/** Slow, looping float for decorative shapes. Disabled under reduced motion. */
export function Float({
  children,
  className,
  duration = 6,
  distance = 10,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
  distance?: number;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <m.div
      className={className}
      animate={reduced ? undefined : { y: [0, -distance, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </m.div>
  );
}
