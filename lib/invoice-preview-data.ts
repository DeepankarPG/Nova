import { billerProfile } from "@/lib/mock-data/invoice-create";
import {
  formatBillingAddress,
  invoiceLineTaxTotal,
  invoiceSubtotal,
  invoiceTotal,
  isBillingAddressEmpty,
  lineItemQuantityLabel,
  lineItemTotal,
  type InvoiceFormState,
} from "@/lib/invoice-form-types";
import { invoiceLabelsFor } from "@/lib/invoice-i18n";

export function currencySymbol(currency: string) {
  return currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹";
}

export function formatAmount(currency: string, amount: number) {
  const sym = currencySymbol(currency);
  return `${sym}${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function invoicePreviewData(form: InvoiceFormState) {
  const primary = form.recipients.find((r) => r.role === "primary") ?? form.recipients[0];
  const subtotal = invoiceSubtotal(form.lineItems);
  const tax = invoiceLineTaxTotal(form.lineItems);
  const total = invoiceTotal(form.lineItems, form.discountValue, form.discountType);
  const labels = invoiceLabelsFor(form.language);

  return {
    primary,
    subtotal,
    tax,
    total,
    labels,
    biller: billerProfile,
    billedToAddress: primary && !isBillingAddressEmpty(primary.address) ? formatBillingAddress(primary.address) : "",
    lineItemQuantityLabel,
    lineItemTotal,
  };
}
