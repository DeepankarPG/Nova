"use client";

import { formatDate } from "@/lib/utils";
import { formatAmount, invoicePreviewData } from "@/lib/invoice-preview-data";
import type { InvoiceFormState } from "@/lib/invoice-form-types";
import { QrCodePreview } from "../QrCodePreview";
import { LogoBadge } from "./LogoBadge";

export function MinimalMonoLayout({
  form,
  onLogoClick,
}: {
  form: InvoiceFormState;
  onLogoClick?: () => void;
}) {
  const { primary, subtotal, tax, total, labels, biller, billedToAddress } = invoicePreviewData(form);
  const primaryColor = form.primaryColor;

  return (
    <div className="bg-card px-10 pt-10">
      <div className="mb-9 flex items-start justify-between">
        <LogoBadge form={form} onLogoClick={onLogoClick} color={primaryColor} nameLine1={biller.name} />
        <span className="text-[30px] font-extrabold uppercase tracking-tight text-foreground">{labels.invoice}</span>
      </div>

      <div className="mb-7 rounded-xl bg-muted/50 p-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-foreground">{labels.billedTo}:</p>
            {primary ? (
              <>
                <p className="text-[13px] font-medium text-foreground">{primary.name}</p>
                {billedToAddress && (
                  <p className="whitespace-pre-line text-[13px] leading-snug text-muted-foreground">{billedToAddress}</p>
                )}
              </>
            ) : (
              <p className="text-[13px] text-muted-foreground">-</p>
            )}

            <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-wide text-foreground">Payment info:</p>
            <p className="text-[13px] leading-snug text-muted-foreground">
              {form.bankDetails.bankName || "-"}
              <br />
              Account name: {form.bankDetails.accountHolder || "-"}
              <br />
              Account no.: {form.bankDetails.accountNumber || "-"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-wide text-foreground">
              {labels.invoiceNumber}: <span className="font-extrabold">{form.invoiceNumber || "-"}</span>
            </p>
            <p className="mt-1.5 text-[13px] text-muted-foreground">
              {labels.issueDate}:{" "}
              <span className="font-medium text-foreground">
                {form.issueDate ? formatDate(form.issueDate, { day: "2-digit", month: "2-digit", year: "numeric" }) : "-"}
              </span>
            </p>
            <p className="text-[13px] text-muted-foreground">
              {labels.dueDate}:{" "}
              <span className="font-medium text-foreground">
                {form.dueDate ? formatDate(form.dueDate, { day: "2-digit", month: "2-digit", year: "numeric" }) : "-"}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-[1fr_72px_48px_72px] gap-2 border-b-2 border-foreground pb-2 text-[11px] font-bold uppercase tracking-wide text-foreground">
        <span>{labels.description}</span>
        <span className="text-right">{labels.unitPrice}</span>
        <span className="text-center">{labels.qty}</span>
        <span className="text-right">{labels.total}</span>
      </div>
      <div className="divide-y divide-border">
        {form.lineItems.map((item) => (
          <div key={item.id} className="grid grid-cols-[1fr_72px_48px_72px] gap-2 py-3 text-[13px]">
            <span className="truncate text-foreground">{item.name || "Untitled item"}</span>
            <span className="text-right tabular-nums text-muted-foreground">{item.unitPrice}</span>
            <span className="text-center tabular-nums text-muted-foreground">
              {item.itemType === "amount" ? 1 : item.quantity}
            </span>
            <span className="text-right tabular-nums font-medium text-foreground">
              {formatAmount(form.currency, item.unitPrice * (item.itemType === "amount" ? 1 : item.quantity))}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 border-t border-foreground pt-3">
        <div className="flex items-center justify-between text-[13px] font-bold uppercase tracking-wide text-foreground">
          <span>{labels.subtotal}</span>
          <span className="tabular-nums">{formatAmount(form.currency, subtotal)}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-end gap-6 text-[13px] text-muted-foreground">
          <span>{labels.tax}</span>
          <span className="tabular-nums">{formatAmount(form.currency, tax)}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-end gap-6 text-[16px] font-extrabold uppercase text-foreground">
          <span>{labels.total}</span>
          <span className="tabular-nums">{formatAmount(form.currency, total)}</span>
        </div>
      </div>

      {form.paymentMethods.qrCodeEnabled && (
        <div className="mt-6 flex justify-end">
          <QrCodePreview value={form.bankDetails.accountNumber || form.invoiceNumber || "invoice"} size={84} />
        </div>
      )}

      <div className="mt-10 flex items-end justify-between pb-10">
        {form.footer ? (
          <p className="max-w-[60%] whitespace-pre-line text-[11px] text-muted-foreground">{form.footer}</p>
        ) : (
          <span />
        )}
        <div className="text-right">
          <p className="text-[12px] font-bold uppercase tracking-wide text-foreground">{labels.thankYou}</p>
          {form.showSignature && (
            form.signatureUrl ? (
              <img src={form.signatureUrl} alt="Signature" className="mt-1 ml-auto h-10 object-contain" />
            ) : (
              <p className="mt-1 font-serif text-[22px] italic text-foreground">{biller.name.split(" ")[0]}</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}
