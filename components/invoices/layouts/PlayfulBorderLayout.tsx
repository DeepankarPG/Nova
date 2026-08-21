"use client";

import { ImagePlus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { formatAmount, invoicePreviewData } from "@/lib/invoice-preview-data";
import type { InvoiceFormState } from "@/lib/invoice-form-types";
import { QrCodePreview } from "../QrCodePreview";

export function PlayfulBorderLayout({
  form,
  onLogoClick,
}: {
  form: InvoiceFormState;
  onLogoClick?: () => void;
}) {
  const { primary, subtotal, total, labels, biller } = invoicePreviewData(form);
  const primaryColor = form.primaryColor;
  const accentColor = form.accentColor;

  return (
    <div className="bg-card p-3">
      <div className="rounded-[28px] border-[10px] px-8 py-8" style={{ borderColor: primaryColor, backgroundColor: `${accentColor}14` }}>
        <div className="mb-6 flex items-center justify-between">
          {onLogoClick ? (
            <button type="button" onClick={onLogoClick} className="flex items-center gap-3 text-left hover:opacity-80">
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="Logo" className="h-12 w-12 rounded-full border-2 object-cover" style={{ borderColor: primaryColor }} />
              ) : (
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-full border-2 text-muted-foreground"
                  style={{ borderColor: primaryColor }}
                >
                  <ImagePlus className="h-4 w-4" />
                </span>
              )}
              <span className="text-[12px] font-bold uppercase leading-tight" style={{ color: primaryColor }}>
                {biller.name}
              </span>
            </button>
          ) : (
            <span className="text-[12px] font-bold uppercase" style={{ color: primaryColor }}>
              {biller.name}
            </span>
          )}
          <span className="text-[30px] font-black italic tracking-tight text-foreground">{labels.invoice}</span>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-2 text-[11px] font-semibold" style={{ color: primaryColor }}>
          <p>
            {labels.invoiceNumber} <span className="font-normal text-foreground">{form.invoiceNumber || "-"}</span>
          </p>
          <p>
            {labels.issueDate}{" "}
            <span className="font-normal text-foreground">
              {form.issueDate ? formatDate(form.issueDate, { day: "2-digit", month: "short", year: "numeric" }) : "-"}
            </span>
          </p>
          <p>
            {labels.billedTo}: <span className="font-normal text-foreground">{primary?.name ?? "-"}</span>
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl">
          <div
            className="grid grid-cols-[1fr_48px_64px_72px] gap-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <span>{labels.description}</span>
            <span className="text-center">{labels.qty}</span>
            <span className="text-right">{labels.unitPrice}</span>
            <span className="text-right">{labels.total}</span>
          </div>
          {form.lineItems.map((item, i) => (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_48px_64px_72px] gap-2 px-4 py-2.5 text-[12.5px] text-foreground"
              style={{ backgroundColor: i % 2 === 0 ? `${accentColor}33` : "transparent" }}
            >
              <span className="truncate">{item.name || "Untitled item"}</span>
              <span className="text-center tabular-nums">{item.itemType === "amount" ? 1 : item.quantity}</span>
              <span className="text-right tabular-nums">{formatAmount(form.currency, item.unitPrice)}</span>
              <span className="text-right tabular-nums font-semibold">
                {formatAmount(form.currency, item.unitPrice * (item.itemType === "amount" ? 1 : item.quantity))}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-start justify-between gap-6">
          <div className="text-[11.5px] text-foreground">
            <p className="font-bold" style={{ color: primaryColor }}>
              {labels.billedTo}
            </p>
            <p>{primary?.name ?? "-"}</p>
            <p className="mt-2 font-bold" style={{ color: primaryColor }}>
              {labels.paymentMethod}
            </p>
            <p>{form.bankDetails.bankName || "-"}</p>
            <p>{form.bankDetails.accountNumber || "-"}</p>
          </div>

          <div className="w-full max-w-[180px] shrink-0 overflow-hidden rounded-xl">
            <div className="flex items-center justify-between px-3 py-2 text-[12px]" style={{ backgroundColor: `${accentColor}55` }}>
              <span className="font-semibold text-foreground">{labels.subtotal}</span>
              <span className="tabular-nums text-foreground">{formatAmount(form.currency, subtotal)}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2.5 text-[13px] font-bold text-white" style={{ backgroundColor: primaryColor }}>
              <span className="uppercase">{labels.total}</span>
              <span className="tabular-nums">{formatAmount(form.currency, total)}</span>
            </div>
          </div>
        </div>

        {form.paymentMethods.qrCodeEnabled && (
          <div className="mt-5 flex items-center justify-end gap-2" style={{ color: primaryColor }}>
            <span className="text-[11px] text-foreground">{labels.scanToPay}</span>
            <QrCodePreview value={form.bankDetails.accountNumber || form.invoiceNumber || "invoice"} size={64} />
          </div>
        )}
      </div>
    </div>
  );
}
