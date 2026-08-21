import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = "INR",
  locale: string = "en-IN"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/**
 * Formats dates for UI. Uses fixed English strings (not Intl) so server and client
 * render identical markup and avoid hydration mismatches from engine/locale differences.
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const o: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    ...(options?.hour !== undefined || options?.minute !== undefined
      ? { hour: "2-digit", minute: "2-digit", hour12: true }
      : {}),
    ...options,
  };

  const includeTime = o.hour !== undefined && o.minute !== undefined;

  let datePart: string;
  if (o.month === "long" && o.day === "numeric") {
    const y =
      o.year === "numeric"
        ? String(d.getFullYear())
        : String(d.getFullYear() % 100).padStart(2, "0");
    datePart = `${MONTHS_LONG[d.getMonth()]} ${d.getDate()}, ${y}`;
  } else {
    const day = String(d.getDate()).padStart(2, "0");
    const mon = o.month === "long" ? MONTHS_LONG[d.getMonth()] : MONTHS_SHORT[d.getMonth()];
    const yr =
      o.year === "numeric"
        ? String(d.getFullYear())
        : String(d.getFullYear() % 100).padStart(2, "0");
    datePart = `${day} ${mon} ${yr}`;
  }

  if (!includeTime) return datePart;

  const use12 = o.hour12 !== false;
  let h = d.getHours();
  const min = String(d.getMinutes()).padStart(2, "0");
  let timePart: string;
  if (use12) {
    const ap = h >= 12 ? "PM" : "AM";
    let h12 = h % 12;
    if (h12 === 0) h12 = 12;
    timePart = `${String(h12).padStart(2, "0")}:${min} ${ap}`;
  } else {
    timePart = `${String(h).padStart(2, "0")}:${min}`;
  }

  return `${datePart}, ${timePart}`;
}

/** e.g. `23 Jan` — no year (dispute tables). */
export function formatShortCalendarDay(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

/** e.g. `31 Jan, 05:29` — 24h time (dispute “respond by”). */
export function formatRespondByDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = d.getDate();
  const mon = MONTHS_SHORT[d.getMonth()];
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${mon}, ${h}:${m}`;
}

/** Regional-indicator pair for a two-letter ISO country code. */
export function flagEmojiFromCountryCode(code: string): string {
  if (code.length !== 2) return "";
  const u = code.toUpperCase();
  const A = 0x41;
  const cp = (c: string) => 127397 + c.charCodeAt(0) - A;
  try {
    return String.fromCodePoint(cp(u[0]!), cp(u[1]!));
  } catch {
    return "";
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

/** Truncates with an ellipsis in the middle (e.g. long IDs or names in fixed-width cells). */
export function truncateMiddle(str: string, maxChars: number): string {
  if (str.length <= maxChars) return str;
  const ellipsis = "…";
  if (maxChars <= ellipsis.length) return ellipsis.slice(0, maxChars);
  const avail = maxChars - ellipsis.length;
  const front = Math.ceil(avail / 2);
  const back = Math.floor(avail / 2);
  return `${str.slice(0, front)}${ellipsis}${str.slice(-back)}`;
}

/**
 * `01 Apr '26, 12:49 PM` — fixed English tokens for hydration-safe SSR/client match.
 */
export function formatTableDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, "0");
  const mon = MONTHS_SHORT[d.getMonth()];
  const yr = `'${String(d.getFullYear() % 100).padStart(2, "0")}`;
  const datePart = `${day} ${mon} ${yr}`;

  let h = d.getHours();
  const min = String(d.getMinutes()).padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  const timePart = `${String(h12).padStart(2, "0")}:${min} ${ap}`;

  return `${datePart}, ${timePart}`;
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  return `${user.slice(0, 2)}****@${domain}`;
}
