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
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
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

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  return `${user.slice(0, 2)}****@${domain}`;
}
