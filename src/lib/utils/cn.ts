type ClassValue = string | false | null | undefined | 0;

/** Tiny class joiner; avoids a dependency for the handful of conditional classes we need. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
