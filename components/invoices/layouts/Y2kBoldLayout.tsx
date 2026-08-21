"use client";

import { ImagePlus, Sparkle } from "lucide-react";
import { formatAmount, invoicePreviewData } from "@/lib/invoice-preview-data";
import type { InvoiceFormState } from "@/lib/invoice-form-types";
import { QrCodePreview } from "../QrCodePreview";

export function Y2kBoldLayout({
  form,
  onLogoClick,
}: {
  form: InvoiceFormState;
  onLogoClick?: () => void;
}) {
  const { primary, subtotal, tax, total, labels, biller } = invoicePreviewData(form);
  const primaryColor = form.primaryColor;
  const accentColor = form.accentColor;

  return (
    <div className="bg-card px-10 pt-10 text-center">
      {onLogoClick ? (
        <button type="button" onClick={onLogoClick} className="mx-auto mb-2 flex items-center gap-2 hover:opacity-80">
          {form.logoUrl ? (
            <img src={form.logoUrl} alt="Logo" className="h-6 w-6 rounded object-cover" />
          ) : (
            <ImagePlus className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-[13px] font-extrabold uppercase tracking-widest text-foreground">{biller.name}</span>
        </button>
      ) : (
        <p className="mb-2 text-[13px] font-extrabold uppercase tracking-widest text-foreground">{biller.name}</p>
      )}

      <div className="mb-8 flex items-center justify-center gap-3">
        <Sparkle className="h-6 w-6" style={{ color: primaryColor }} fill={primaryColor} />
        <span className="text-[40px] font-black uppercase italic tracking-tight text-foreground">{labels.invoice}</span>
        <Sparkle className="h-6 w-6" style={{ color: primaryColor }} fill={primaryColor} />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-6 text-left">
        <div>
          <p className="border-b-2 pb-1 text-[12px] font-extrabold uppercase tracking-wide text-foreground" style={{ borderColor: accentColor }}>
            {labels.invoiceFrom}:
          </p>
          <p className="mt-2 text-[12.5px] font-semibold text-foreground">{biller.name}</p>
          <p className="whitespace-pre-line text-[11.5px] leading-snug text-muted-foreground">{biller.address}</p>
        </div>
        <div>
          <p className="border-b-2 pb-1 text-[12px] font-extrabold uppercase tracking-wide text-foreground" style={{ borderColor: accentColor }}>
            {labels.invoiceTo}:
          </p>
          {primary ? (
            <>
              <p className="mt-2 text-[12.5px] font-semibold text-foreground">{primary.name}</p>
              <p className="text-[11.5px] text-muted-foreground">{primary.email}</p>
            </>
          ) : (
            <p className="mt-2 text-[12.5px] text-muted-foreground">-</p>
          )}
        </div>
      </div>

      <div className="mb-2 grid grid-cols-[1fr_44px_64px_64px] gap-2 border-b-2 pb-2 text-left text-[12px] font-extrabold uppercase tracking-wide text-foreground" style={{ borderColor: primaryColor }}>
        <span>{labels.description}</span>
        <span className="text-center">{labels.qty}</span>
        <span className="text-right">{labels.unitPrice}</span>
        <span className="text-right">{labels.total}</span>
      </div>
      {form.lineItems.map((item) => (
        <div
          key={item.id}
          className="grid grid-cols-[1fr_44px_64px_64px] gap-2 border-b py-2.5 text-left text-[12px] text-foreground"
          style={{ borderColor: `${accentColor}55` }}
        >
          <span className="flex items-center gap-1.5 truncate uppercase">
            <Sparkle className="h-3 w-3 shrink-0" style={{ color: accentColor }} fill={accentColor} />
            {item.name || "Untitled item"}
          </span>
          <span className="text-center tabular-nums">{item.itemType === "amount" ? 1 : item.quantity}</span>
          <span className="text-right tabular-nums">{formatAmount(form.currency, item.unitPrice)}</span>
          <span className="text-right tabular-nums font-bold">
            {formatAmount(form.currency, item.unitPrice * (item.itemType === "amount" ? 1 : item.quantity))}
          </span>
        </div>
      ))}

      <div className="mt-4 flex justify-end">
        <div className="w-full max-w-[200px] space-y-1.5 text-right text-[12px] font-semibold uppercase text-foreground">
          <div className="flex items-center justify-between">
            <span>{labels.subtotal}:</span>
            <span className="tabular-nums">{formatAmount(form.currency, subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{labels.tax}:</span>
            <span className="tabular-nums">{formatAmount(form.currency, tax)}</span>
          </div>
          <div className="flex items-center justify-between text-[15px] font-black" style={{ color: primaryColor }}>
            <span>{labels.total}:</span>
            <span className="tabular-nums">{formatAmount(form.currency, total)}</span>
          </div>
        </div>
      </div>

      {form.paymentMethods.qrCodeEnabled && (
        <div className="mt-4 flex justify-end" style={{ color: primaryColor }}>
          <QrCodePreview value={form.bankDetails.accountNumber || form.invoiceNumber || "invoice"} size={72} />
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-6 pb-10 text-left">
        <div>
          <p className="border-b-2 pb-1 text-[11px] font-extrabold uppercase tracking-wide text-foreground" style={{ borderColor: accentColor }}>
            {labels.termsAndConditions}
          </p>
          <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
            {form.footer || "Please pay within the agreed terms of this invoice."}
          </p>
        </div>
        <div>
          <p className="border-b-2 pb-1 text-[11px] font-extrabold uppercase tracking-wide text-foreground" style={{ borderColor: accentColor }}>
            {labels.paymentMethod}
          </p>
          <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
            {form.bankDetails.bankName || "-"}
            <br />
            {form.bankDetails.accountNumber || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
