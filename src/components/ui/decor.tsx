import type { SVGProps } from "react";

/** Decorative leaf, used as floating accents (see reference designs). */
export function LeafShape({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className} {...rest}>
      <path
        d="M54 8C32 9 14 22 10 46c-1 5 1 8 5 8 24-2 40-18 41-44 0-2-1-2-2-2Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path d="M14 52c8-14 20-26 36-38" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Decorative spice seed / bean. */
export function BeanShape({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className} {...rest}>
      <ellipse cx="24" cy="24" rx="12" ry="18" transform="rotate(-28 24 24)" fill="currentColor" />
      <path d="M18 10c6 8 6 20 0 28" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/** Decorative coffee cup with rising aroma. */
export function CoffeeCupShape({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className} {...rest}>
      <path d="M18 10c0-3 3-4 1-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
      <path d="M24 9c0-3 3-4 1-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
      <path d="M30 10c0-3 3-4 1-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
      <path d="M10 14h24v12a8 8 0 0 1-8 8h-8a8 8 0 0 1-8-8V14z" fill="currentColor" opacity="0.85" />
      <path d="M34 18h3a4 4 0 0 1 0 8h-3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M8 38c6 2 22 2 28 0" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Decorative artisan plate/dish. */
export function PlateShape({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className} {...rest}>
      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="3" opacity="0.8" />
      <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
      <circle cx="32" cy="32" r="14" fill="currentColor" opacity="0.25" />
    </svg>
  );
}

/** Decorative sparkle accent. */
export function SparkleShape({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...rest}>
      <path
        d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Soft wave divider between sections. `flip` turns it upside down. */
export function WaveDivider({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={className}
      style={flip ? { transform: "scaleY(-1)" } : undefined}
    >
      <path
        d="M0 40C180 70 360 80 540 62S900 10 1080 18s270 40 360 48V80H0Z"
        fill="currentColor"
      />
    </svg>
  );
}
