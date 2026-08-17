"use client";

import { Asterisk, ImagePlus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { formatAmount, invoicePreviewData } from "@/lib/invoice-preview-data";
import type { InvoiceFormState } from "@/lib/invoice-form-types";

export function GeometricModernLayout({
  form,
  onLogoClick,
}: {
  form: InvoiceFormState;
  onLogoClick?: () => void;
}) {
  const { primary, total, labels, biller } = invoicePreviewData(form);
  const primaryColor = form.primaryColor;
  const accentColor = form.accentColor;

  return (
    <div className="bg-card px-10 pt-9">
      <div className="mb-7 flex items-start justify-between">
        <div>
          <span
            className="inline-block rounded-full border px-3 py-1 text-[10.5px] font-medium text-foreground"
            style={{ borderColor: `${primaryColor}55` }}
          >
            Your special present
          </span>
          <div className="mt-3 flex items-center gap-2">
            {primary && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold text-foreground"
                style={{ backgroundColor: `${accentColor}55` }}
              >
                {primary.name}
              </span>
            )}
          </div>
          {onLogoClick ? (
            <button type="button" onClick={onLogoClick} className="mt-2 flex items-center gap-2 hover:opacity-80">
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="Logo" className="h-8 w-8 rounded-lg object-cover" />
              ) : (
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground"
                  style={{ borderColor: `${primaryColor}55` }}
                >
                  <ImagePlus className="h-3.5 w-3.5" />
                </span>
              )}
              <span className="text-[11px] text-muted-foreground">{biller.name}</span>
            </button>
          ) : (
            <p className="mt-2 text-[11px] text-muted-foreground">{biller.name}</p>
          )}
        </div>

        <span className="text-[38px] font-black uppercase tracking-tight" style={{ color: primaryColor }}>
          {labels.invoice}
        </span>
      </div>

      <div className="mb-6 text-[26px] font-extrabold" style={{ color: primaryColor }}>
        {labels.invoiceTo} {formatAmount(form.currency, total)}
      </div>

      <div className="mb-6 flex items-start justify-between gap-6 text-[11.5px]">
        <div>
          <p className="font-semibold text-foreground">Detail Date</p>
          <p className="text-muted-foreground">
            Date: {form.issueDate ? formatDate(form.issueDate, { day: "2-digit", month: "short", year: "numeric" }) : "-"}
          </p>
          <p className="text-muted-foreground">
            Due date: {form.dueDate ? formatDate(form.dueDate, { day: "2-digit", month: "short", year: "numeric" }) : "-"}
          </p>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-[1fr_36px_56px_64px] gap-2 border-b pb-2 text-[11px] font-semibold" style={{ borderColor: `${primaryColor}33`, color: primaryColor }}>
        <span>Service</span>
        <span className="text-center">{labels.qty}</span>
        <span className="text-right">Price</span>
        <span className="text-right">{labels.total}</span>
      </div>
      <div className="divide-y" style={{ borderColor: `${primaryColor}22` }}>
        {form.lineItems.map((item) => (
          <div key={item.id} className="grid grid-cols-[1fr_36px_56px_64px] gap-2 py-2.5 text-[12px]">
            <span className="min-w-0">
              <span className="block truncate font-medium text-foreground">{item.name || "Untitled item"}</span>
              {item.description && <span className="block truncate text-[10.5px] text-muted-foreground">{item.description}</span>}
            </span>
            <span className="text-center tabular-nums text-muted-foreground">{item.itemType === "amount" ? 1 : item.quantity}</span>
            <span className="text-right tabular-nums text-muted-foreground">{formatAmount(form.currency, item.unitPrice)}</span>
            <span className="text-right tabular-nums font-medium text-foreground">
              {formatAmount(form.currency, item.unitPrice * (item.itemType === "amount" ? 1 : item.quantity))}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Asterisk className="h-5 w-5 shrink-0" style={{ color: accentColor }} />
        <span className="text-[12px] font-semibold text-foreground">{labels.total}</span>
        <span
          className="ml-auto rounded-full px-4 py-1.5 text-[13px] font-bold text-foreground"
          style={{ backgroundColor: `${accentColor}66` }}
        >
          {formatAmount(form.currency, total)}
        </span>
      </div>

      <div className="mt-8 flex items-start justify-between gap-6 border-t pt-4 pb-8 text-[10.5px]" style={{ borderColor: `${primaryColor}33` }}>
        <div>
          <p className="flex items-center gap-1 font-semibold text-foreground">
            <Asterisk className="h-3 w-3" style={{ color: accentColor }} />
            {labels.termsAndConditions}
          </p>
          <p className="mt-1 leading-snug text-muted-foreground">{form.footer || "Payment due within the agreed terms."}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-foreground">{labels.paymentMethod}</p>
          <p className="mt-1 leading-snug text-muted-foreground">
            {form.bankDetails.bankName || "-"}
            <br />
            {form.bankDetails.accountNumber || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
