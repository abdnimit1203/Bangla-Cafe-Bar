import Link from "next/link";
import { restaurantConfig } from "@/lib/config/restaurant";

export function BrandLogo({
  size = "md",
  showTagline = true,
  invert = false,
}: {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  invert?: boolean;
}) {
  const iconSizes = {
    sm: "h-9 w-9",
    md: "h-11 w-11",
    lg: "h-14 w-14",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };

  return (
    <Link href="/" className="group flex items-center gap-3" aria-label={`${restaurantConfig.name} home`}>
      <span
        className={`relative flex ${iconSizes[size]} shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-forest to-forest-deep p-1.5 shadow-soft-sm transition-transform duration-300 group-hover:scale-105 border ${
          invert ? "border-white/20" : "border-forest/20"
        }`}
      >
        <svg viewBox="0 0 48 48" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Steam */}
          <path d="M19 12 C18 10, 21 8, 19 6" stroke="#f5cf7a" strokeWidth="2" strokeLinecap="round" />
          <path d="M24 11 C23 9, 26 7, 24 5" stroke="#e07a2a" strokeWidth="2" strokeLinecap="round" />
          <path d="M29 12 C28 10, 31 8, 29 6" stroke="#f5cf7a" strokeWidth="2" strokeLinecap="round" />
          {/* Cup */}
          <path
            d="M14 16 H34 V25 C34 30.5 29.5 35 24 35 C18.5 35 14 30.5 14 25 Z"
            fill="#fff8ee"
            stroke="#dfb76c"
            strokeWidth="1.5"
          />
          {/* Handle */}
          <path
            d="M34 19 H37 C39 19 40.5 20.5 40.5 22.5 C40.5 24.5 39 26 37 26 H34"
            stroke="#f5cf7a"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Heart / Leaf on cup */}
          <path
            d="M24 23 C26 20.5 28.5 22 28.5 24 C28.5 26 24 28.5 24 28.5 C24 28.5 19.5 26 19.5 24 C19.5 22 22 20.5 24 23 Z"
            fill="#e07a2a"
          />
          {/* Saucer */}
          <path d="M11 38 C18 40.5 30 40.5 37 38" stroke="#f5cf7a" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </span>

      <span className="flex flex-col leading-tight">
        <span className="flex items-center gap-2">
          <span
            className={`font-display ${textSizes[size]} font-bold tracking-wide transition-colors ${
              invert ? "text-cream group-hover:text-orange" : "text-ink group-hover:text-forest"
            }`}
          >
            {restaurantConfig.shortName.toUpperCase()}
          </span>
          <span className="rounded-md bg-sage-soft px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-forest">
            {restaurantConfig.descriptor}
          </span>
        </span>
        {showTagline && (
          <span className={`hidden text-xs sm:inline ${invert ? "text-cream/70" : "text-ink-faint"}`}>
            {restaurantConfig.tagline}
          </span>
        )}
      </span>
    </Link>
  );
}

