const pad = (n: number) => String(n).padStart(2, "0");

function toDate(value: Date | string): Date {
  return typeof value === "string" ? new Date(value) : value;
}

/** dd/MM/yyyy, the project-wide date display format. */
export function formatDate(value: Date | string): string {
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** HH:mm, 24-hour local time. */
export function formatTime(value: Date | string): string {
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatDateTime(value: Date | string): string {
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${formatDate(d)} ${formatTime(d)}`;
}

/** Local calendar key, yyyy-MM-dd. A stable id for a day, never shown to users. */
export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0);
}

export function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

export function startOfDay(d: Date): Date {
  const next = new Date(d);
  next.setHours(0, 0, 0, 0);
  return next;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export function weekdayShort(d: Date): string {
  return WEEKDAYS[d.getDay()] ?? "";
}

const WEEKDAYS_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
export function weekdayLong(index: number): string {
  return WEEKDAYS_LONG[index] ?? "";
}

/** Parse "HH:mm" into minutes since midnight. */
export function parseClock(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}
