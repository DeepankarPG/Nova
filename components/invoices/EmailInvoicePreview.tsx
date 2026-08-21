"use client";

import Image from "next/image";
import { invoiceLineTaxTotal, invoiceTotal } from "@/lib/invoice-form-types";
import type { InvoiceFormState } from "@/lib/invoice-form-types";
import { formatDate } from "@/lib/utils";
import { currencySymbol, formatAmount } from "./InvoiceDocumentPreview";

export function EmailInvoicePreview({ form }: { form: InvoiceFormState }) {
  const primary = form.recipients.find((r) => r.role === "primary") ?? form.recipients[0];
  const total = invoiceTotal(form.lineItems, form.discountValue, form.discountType);
  const tax = invoiceLineTaxTotal(form.lineItems);
  const firstItem = form.lineItems[0];

  return (
    <div
      className="flex flex-col items-center rounded-2xl px-6 py-10 shadow-md"
      style={{ backgroundColor: form.primaryColor }}
    >
      <p className="mb-2 text-center text-[15px] font-semibold text-white">
        {primary ? `${primary.name} sent you an invoice` : "Business sent you an invoice"}
      </p>
      <p className="mb-5 text-center text-[26px] font-bold text-white">
        {formatAmount(form.currency, total)} {form.currency}
      </p>

      <button
        type="button"
        className="mb-2 h-11 w-full max-w-xs rounded-lg bg-white text-[14px] font-semibold shadow-sm"
        style={{ color: form.primaryColor }}
      >
        Pay now
      </button>
      <p className="mb-6 text-[12px] text-white/80">
        {form.dueDate ? `Due by ${formatDate(form.dueDate, { day: "2-digit", month: "long", year: "numeric" })}` : "No due date set"}
      </p>

      <div className="w-full max-w-sm rounded-xl bg-card p-5 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-foreground">
            Invoice {form.invoiceNumber || "-"}
            {primary && ` for ${primary.name}`}
          </p>
          <span className="shrink-0 text-[12px] font-medium text-primary underline underline-offset-2">
            Download PDF
          </span>
        </div>

        {firstItem && (
          <div className="mb-3 flex items-start justify-between border-b border-border pb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-[12px] text-muted-foreground">
                {firstItem.quantity}
                {firstItem.itemType === "hours" ? "hrs" : ""}
                <span className="px-1">&times;</span>
              </span>
              <div>
                <p className="text-[13px] font-medium text-foreground">{firstItem.name || "Item"}</p>
                {firstItem.description && (
                  <p className="max-w-[180px] text-[11px] text-muted-foreground">{firstItem.description}</p>
                )}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[13px] tabular-nums text-foreground">
                {formatAmount(form.currency, firstItem.unitPrice * firstItem.quantity)}
              </p>
              {firstItem.discountValue && (
                <p className="text-[11px] text-muted-foreground">
                  ({firstItem.discountValue}
                  {firstItem.discountType === "percent" ? "%" : ""} discount)
                </p>
              )}
            </div>
          </div>
        )}

        <div className="space-y-1.5 text-[12.5px]">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Total excluding taxes</span>
            <span className="tabular-nums">
              {currencySymbol(form.currency)}
              {form.lineItems
                .reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
                .toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Tax</span>
            <span className="tabular-nums">{formatAmount(form.currency, tax)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2 text-[13.5px] font-semibold text-foreground">
            <span>Amount due</span>
            <span className="tabular-nums">
              {formatAmount(form.currency, total)} {form.currency}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-1.5 opacity-60">
        <span className="text-[12px] text-white">Powered by</span>
        <Image src="/payglocal-logo.png" alt="PayGlocal" width={16} height={16} className="size-4 object-contain" />
        <span className="text-[12px] font-semibold text-white">PayGlocal</span>
      </div>
    </div>
  );
}
