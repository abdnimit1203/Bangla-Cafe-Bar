import { cn } from "@/lib/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-line/70", className)} aria-hidden="true" />;
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-card bg-surface p-3 shadow-soft">
      <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
      <div className="space-y-2 p-2 pt-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center justify-between pt-3">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8, columns = 4 }: { count?: number; columns?: 3 | 4 }) {
  return (
    <div className={cn("grid grid-cols-1 gap-5 sm:grid-cols-2", columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ChipRowSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-3">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-10 w-32 rounded-full" />
      ))}
    </div>
  );
}
