"use client";

import * as m from "motion/react-m";
import { useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import type { PointerEvent, ReactNode } from "react";
import { useDesktopPointer } from "@/components/motion/use-desktop-pointer";

/**
 * Pointer-driven 3D tilt with layered depth. Children can use
 * `style={{ transform: "translateZ(40px)" }}` to float above the card.
 * Static on touch devices and under reduced motion.
 */
export function Tilt({
  children,
  className,
  maxDegrees = 6,
}: {
  children: ReactNode;
  className?: string;
  maxDegrees?: number;
}) {
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateY = useSpring(useTransform(px, [0, 1], [-maxDegrees, maxDegrees]), { stiffness: 140, damping: 18 });
  const rotateX = useSpring(useTransform(py, [0, 1], [maxDegrees, -maxDegrees]), { stiffness: 140, damping: 18 });
  const reduced = useReducedMotion();
  const desktop = useDesktopPointer();
  const active = desktop && !reduced;

  function onMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
  }
  function onLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <m.div
      className={className}
      style={active ? { rotateX, rotateY, transformStyle: "preserve-3d", transformPerspective: 1000 } : undefined}
      onPointerMove={active ? onMove : undefined}
      onPointerLeave={active ? onLeave : undefined}
    >
      {children}
    </m.div>
  );
}
