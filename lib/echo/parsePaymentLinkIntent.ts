import type { PaymentLinkIntent } from "./types";

/**
 * Very small NL parser for demo: "payment link … $500", "500 usd", "₹1200", etc.
 */
export function parsePaymentLinkIntent(text: string): PaymentLinkIntent | null {
  const t = text.toLowerCase();
  if (!/(payment\s*link|pay\s*link|plink)/i.test(t)) return null;

  const inr = t.match(/(?:₹|rs\.?\s*|inr\s*)([\d,]+(?:\.\d+)?)/i);
  if (inr) {
    const amount = parseFloat(inr[1]!.replace(/,/g, ""));
    if (!Number.isFinite(amount) || amount <= 0) return null;
    return { amount, currency: "INR" };
  }

  const usd = t.match(/\$\s*([\d,]+(?:\.\d+)?)|([\d,]+(?:\.\d+)?)\s*(usd|dollars?)/i);
  if (usd) {
    const raw = (usd[1] ?? usd[2])?.replace(/,/g, "") ?? "";
    const amount = parseFloat(raw);
    if (!Number.isFinite(amount) || amount <= 0) return null;
    return { amount, currency: "USD" };
  }

  const num = t.match(/(?:for|of)\s*([\d,]+(?:\.\d+)?)/i) ?? t.match(/\b([\d,]+(?:\.\d+)?)\s*$/);
  if (num) {
    const amount = parseFloat(num[1]!.replace(/,/g, ""));
    if (!Number.isFinite(amount) || amount <= 0) return null;
    return { amount, currency: "USD" };
  }

  return null;
}
