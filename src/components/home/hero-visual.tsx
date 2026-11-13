"use client";

import Image from "next/image";
import Link from "next/link";
import { Float, Parallax } from "@/components/motion/parallax";
import { Tilt } from "@/components/motion/tilt";
import { BeanShape, LeafShape } from "@/components/ui/decor";
import { Icon } from "@/components/ui/icon";
import { Price } from "@/components/ui/price";

export interface HeroDishSummary {
  name: string;
  slug: string;
  description?: string;
  priceMinor: number | null;
  currency: string;
  fromPrice: boolean;
}

export function HeroVisual({
  image,
  dish,
}: {
  image: { src: string; alt: string } | null;
  dish: HeroDishSummary | null;
}) {
  return (
    <div className="relative mx-auto w-full max-w-md pb-8 sm:max-w-lg lg:pb-10">
      <Parallax amount={14}>
        <Tilt className="relative aspect-square" maxDegrees={4}>
          {/* Layered soft organic backdrop */}
          <div className="blob absolute inset-[4%] bg-gradient-to-tr from-sage/70 to-sage-soft/90 shadow-soft" style={{ transform: "translateZ(0px)" }} />
          <div
            className="blob absolute inset-[10%] overflow-hidden bg-sand shadow-soft ring-4 ring-white/60"
            style={{ transform: "translateZ(20px)" }}
          >
            {image ? (
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority
                sizes="(min-width: 1024px) 32rem, 100vw"
                className="object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-forest/60">
                <Icon name="coffee" size={64} />
              </span>
            )}
          </div>

          {/* Floating Organic Accents */}
          <Float className="absolute -left-2 top-[12%] text-forest" duration={7}>
            <LeafShape className="h-12 w-12 drop-shadow-md" style={{ transform: "translateZ(40px) rotate(-20deg)" }} />
          </Float>
          <Float className="absolute right-[2%] top-[6%] text-green" duration={8} delay={1}>
            <LeafShape className="h-10 w-10 drop-shadow-md" style={{ transform: "translateZ(35px) rotate(35deg)" }} />
          </Float>
          <Float className="absolute bottom-[22%] right-0 text-orange-deep" duration={6} delay={0.5} distance={8}>
            <BeanShape className="h-7 w-7 drop-shadow" style={{ transform: "translateZ(30px)" }} />
          </Float>
          <Float className="absolute bottom-[14%] left-[6%] text-orange" duration={9} delay={2} distance={6}>
            <BeanShape className="h-6 w-6 drop-shadow" style={{ transform: "translateZ(25px) rotate(60deg)" }} />
          </Float>

          {/* Featured Dish Card - anchored neatly with no collision */}
          {dish ? (
            <Link
              href={`/menu/${dish.slug}`}
              className="press absolute -bottom-5 left-1/2 flex w-[88%] -translate-x-1/2 items-center gap-3 rounded-2xl bg-surface-strong/95 p-3.5 shadow-soft border border-line/60 backdrop-blur-sm transition-all hover:border-orange/60 sm:w-[78%]"
              style={{ transform: "translateZ(50px) translateX(-50%)" }}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-soft text-orange shadow-soft-xs">
                <Icon name="star" size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-forest">Chef&apos;s pick</span>
                <span className="block truncate font-display text-sm sm:text-base font-bold text-ink">{dish.name}</span>
              </span>
              {dish.priceMinor !== null ? (
                <Price
                  amountMinor={dish.priceMinor}
                  currency={dish.currency}
                  prefix={dish.fromPrice ? "from" : undefined}
                  size="sm"
                  className="font-bold text-ink"
                />
              ) : null}
            </Link>
          ) : null}
        </Tilt>
      </Parallax>
    </div>
  );
}
