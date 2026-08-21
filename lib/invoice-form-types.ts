import type { DueTermId, NotifyChannel, RecurringFrequency } from "@/lib/mock-data/invoice-create";

export type ItemType = "amount" | "quantity" | "hours";

export type InvoiceLineItemDraft = {
  id: string;
  name: string;
  description: string;
  itemType: ItemType;
  quantity: number;
  unitPrice: number;
  hsn: string;
  taxLabel: string; // "None" | "5% GST" | ... (see taxOptions)
  discountValue: string; // "" when no discount
  discountType: "percent" | "flat";
};

export type BillingAddress = {
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export function isBillingAddressEmpty(address: BillingAddress): boolean {
  return !address.line1 && !address.city && !address.state && !address.postalCode && !address.country;
}

export function formatBillingAddress(address: BillingAddress): string {
  const cityLine = [address.city, address.state, address.postalCode].filter(Boolean).join(", ");
  return [address.line1, cityLine, address.country].filter(Boolean).join("\n");
}

export type BillToRecipientDraft = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "primary" | "cc";
  notify: NotifyChannel[];
  address: BillingAddress;
};

export type BankDetailsDraft = {
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  ifscOrRouting: string;
};

export type PaymentMethodsDraft = {
  bankTransferEnabled: boolean;
  paymentLinkEnabled: boolean;
  paymentLinkUrl: string;
  qrCodeEnabled: boolean;
  externalPaymentLinkEnabled: boolean;
  externalPaymentLinkUrl: string;
};

export type InvoiceFormState = {
  templateId: string;
  invoiceNumber: string;
  issueDate: string; // YYYY-MM-DD
  dueTermId: DueTermId | null; // null until the user picks a due date
  dueDate: string; // YYYY-MM-DD, derived from issueDate + dueTermId; "" when unset
  isRecurring: boolean;
  recurringFrequency: RecurringFrequency;
  recurringStartDate: string; // YYYY-MM-DD
  recipients: BillToRecipientDraft[];
  currency: string;
  lineItems: InvoiceLineItemDraft[];
  discountValue: string;
  discountType: "percent" | "flat";
  bankDetails: BankDetailsDraft;
  paymentMethods: PaymentMethodsDraft;
  memo: string;
  footer: string;
  logoUrl: string | null;
  showSignature: boolean;
  signatureUrl: string | null;
  brandingStyleId: string;
  primaryColor: string;
  accentColor: string;
  language: string;
};

function taxPercentOf(taxLabel: string): number {
  const match = /(\d+)%/.exec(taxLabel);
  return match ? Number(match[1]) : 0;
}

export function lineItemQuantityLabel(item: InvoiceLineItemDraft): number {
  return item.itemType === "amount" ? 1 : item.quantity;
}

export function lineItemGross(item: InvoiceLineItemDraft): number {
  return lineItemQuantityLabel(item) * item.unitPrice;
}

export function lineItemDiscountAmount(item: InvoiceLineItemDraft): number {
  const value = Number(item.discountValue) || 0;
  if (value <= 0) return 0;
  const gross = lineItemGross(item);
  return item.discountType === "percent" ? gross * (value / 100) : Math.min(value, gross);
}

export function lineItemTax(item: InvoiceLineItemDraft): number {
  const taxable = lineItemGross(item) - lineItemDiscountAmount(item);
  return taxable * (taxPercentOf(item.taxLabel) / 100);
}

export function lineItemTotal(item: InvoiceLineItemDraft): number {
  return lineItemGross(item) - lineItemDiscountAmount(item) + lineItemTax(item);
}

export function invoiceSubtotal(items: InvoiceLineItemDraft[]): number {
  return items.reduce((sum, item) => sum + lineItemGross(item), 0);
}

export function invoiceLineDiscountTotal(items: InvoiceLineItemDraft[]): number {
  return items.reduce((sum, item) => sum + lineItemDiscountAmount(item), 0);
}

export function invoiceLineTaxTotal(items: InvoiceLineItemDraft[]): number {
  return items.reduce((sum, item) => sum + lineItemTax(item), 0);
}

export function invoiceOverallDiscount(
  items: InvoiceLineItemDraft[],
  discountValue: string,
  discountType: "percent" | "flat"
): number {
  const value = Number(discountValue) || 0;
  if (value <= 0) return 0;
  const base = invoiceSubtotal(items) - invoiceLineDiscountTotal(items);
  return discountType === "percent" ? base * (value / 100) : Math.min(value, base);
}

export function invoiceTotal(
  items: InvoiceLineItemDraft[],
  discountValue: string,
  discountType: "percent" | "flat"
): number {
  return (
    invoiceSubtotal(items) -
    invoiceLineDiscountTotal(items) -
    invoiceOverallDiscount(items, discountValue, discountType) +
    invoiceLineTaxTotal(items)
  );
}
