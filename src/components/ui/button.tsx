import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Spinner } from "@/components/ui/spinner";

type Variant = "primary" | "secondary" | "forest" | "cream" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "press inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-orange text-white shadow-soft-sm hover:bg-orange-deep",
  secondary: "bg-surface text-ink shadow-soft-sm hover:text-orange",
  forest: "bg-forest text-cream shadow-soft-sm hover:bg-forest-deep",
  cream: "bg-surface text-forest shadow-soft-dark-sm hover:bg-surface-strong",
  ghost: "text-ink-muted hover:text-ink hover:bg-surface",
  danger: "bg-danger-soft text-danger hover:bg-danger hover:text-white",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner size={16} /> : null}
      {children}
    </button>
  );
}

export interface ButtonLinkProps {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  prefetch?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function ButtonLink({ href, variant = "primary", size = "md", className, children, prefetch, onClick }: ButtonLinkProps) {
  const external = href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("http");
  const classes = cn(base, variants[variant], sizes[size], className);
  if (external) {
    return (
      <a href={href} onClick={onClick} className={classes}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} prefetch={prefetch} onClick={onClick} className={classes}>
      {children}
    </Link>
  );
}
