"use client";

import { ImagePlus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { formatAmount, invoicePreviewData } from "@/lib/invoice-preview-data";
import type { InvoiceFormState } from "@/lib/invoice-form-types";
import { QrCodePreview } from "../QrCodePreview";

export function BoldSidebarLayout({
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
    <div className="relative grid grid-cols-[64px_1fr] bg-card">
      <div className="relative border-r" style={{ borderColor: primaryColor }}>
        <p
          className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[15px] font-semibold tracking-wide"
          style={{ writingMode: "vertical-rl", color: primaryColor }}
        >
          {biller.name}
        </p>
        <p
          className="absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[34px] font-black italic tracking-tight"
          style={{ writingMode: "vertical-rl", color: primaryColor }}
        >
          invoice
        </p>
      </div>

      <div className="px-9 pt-9">
        <div className="mb-6 flex items-start justify-between border-b pb-6" style={{ borderColor: primaryColor }}>
          {onLogoClick ? (
            <button type="button" onClick={onLogoClick} className="text-left hover:opacity-80">
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="Logo" className="h-10 w-10 rounded-lg object-cover" />
              ) : (
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground"
                  style={{ borderColor: `${primaryColor}55` }}
                >
                  <ImagePlus className="h-4 w-4" />
                </span>
              )}
            </button>
          ) : (
            <span />
          )}

          <div className="text-right text-[12px]" style={{ color: primaryColor }}>
            <p>
              {labels.invoiceNumber} {form.invoiceNumber || "-"}
            </p>
            <p>{form.issueDate ? formatDate(form.issueDate, { day: "numeric", month: "long", year: "numeric" }) : "-"}</p>

            <p className="mt-3 font-bold underline underline-offset-2">{labels.billedTo}</p>
            {primary ? (
              <>
                <p>{primary.name}</p>
                <p className="text-muted-foreground">{primary.email}</p>
              </>
            ) : (
              <p className="text-muted-foreground">-</p>
            )}
          </div>
        </div>

        <div className="mb-6 border-b pb-4" style={{ borderColor: primaryColor }}>
          <div className="mb-2.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wide" style={{ color: primaryColor }}>
            <span>{labels.description}</span>
            <span>{labels.subtotal}</span>
          </div>
          <div className="space-y-2.5">
            {form.lineItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-[13px]">
                <span className="text-foreground">{item.name || "Untitled item"}</span>
                <span className="tabular-nums font-medium text-foreground">
                  {formatAmount(form.currency, item.unitPrice * (item.itemType === "amount" ? 1 : item.quantity))}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t pt-3 text-[14px] font-bold" style={{ borderColor: primaryColor, color: primaryColor }}>
            <span className="uppercase tracking-wide">{labels.total}</span>
            <span className="tabular-nums">{formatAmount(form.currency, total)}</span>
          </div>
        </div>

        <div className="flex items-end justify-between pb-9">
          <div className="text-[12px]" style={{ color: accentColor }}>
            <p className="font-bold underline underline-offset-2">{labels.payments}</p>
            <p className="mt-1 text-foreground">{biller.name}</p>
            <p className="text-foreground">{form.bankDetails.accountNumber || "-"}</p>
            {form.paymentMethods.qrCodeEnabled && <p className="mt-2">{labels.scanToPay}.</p>}

            {form.footer && (
              <>
                <p className="mt-4 font-bold underline underline-offset-2">{labels.questions}</p>
                <p className="text-foreground">{form.footer}</p>
              </>
            )}
          </div>

          {form.paymentMethods.qrCodeEnabled && (
            <div style={{ color: primaryColor }}>
              <QrCodePreview value={form.bankDetails.accountNumber || form.invoiceNumber || "invoice"} size={80} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
