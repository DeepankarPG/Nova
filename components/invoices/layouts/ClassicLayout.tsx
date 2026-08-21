"use client";

import { ImagePlus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { formatAmount, invoicePreviewData } from "@/lib/invoice-preview-data";
import { lineItemQuantityLabel, lineItemTotal, type InvoiceFormState } from "@/lib/invoice-form-types";
import { QrCodePreview } from "../QrCodePreview";

export function ClassicLayout({
  form,
  onLogoClick,
}: {
  form: InvoiceFormState;
  onLogoClick?: () => void;
}) {
  const { primary, subtotal, tax, total, labels, billedToAddress, biller } = invoicePreviewData(form);

  return (
    <div className="bg-card p-10">
      <div className="mb-5">
        {onLogoClick ? (
          <button type="button" onClick={onLogoClick} className="group flex items-stretch gap-4">
            {form.logoUrl ? (
              <img
                src={form.logoUrl}
                alt="Logo"
                className="h-16 w-16 shrink-0 rounded-xl border border-border object-cover"
              />
            ) : (
              <span className="flex flex-col items-center gap-1.5">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 text-primary transition-colors group-hover:border-primary group-hover:bg-primary/10">
                  <ImagePlus className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-medium leading-none text-muted-foreground">Add logo</span>
              </span>
            )}
            <span className="flex items-center text-[22px] font-bold tracking-tight text-foreground">{labels.invoice}</span>
          </button>
        ) : (
          <div className="flex items-center gap-4">
            {form.logoUrl ? (
              <img
                src={form.logoUrl}
                alt="Logo"
                className="h-16 w-16 shrink-0 rounded-xl border border-border object-cover"
              />
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/40 text-muted-foreground">
                <ImagePlus className="h-5 w-5" />
              </span>
            )}
            <span className="text-[22px] font-bold tracking-tight text-foreground">{labels.invoice}</span>
          </div>
        )}
      </div>

      <div className="mb-7 flex items-center gap-8 text-[12px]">
        <div>
          <p className="text-muted-foreground">{labels.invoiceNumber}</p>
          <p className="font-semibold text-foreground">{form.invoiceNumber || "-"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">{labels.issueDate}</p>
          <p className="font-semibold text-foreground">
            {form.issueDate ? formatDate(form.issueDate, { day: "2-digit", month: "long", year: "numeric" }) : "-"}
          </p>
        </div>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-4">
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">{labels.issuedBy}</p>
          <p className="text-[13.5px] font-semibold text-foreground">{biller.name}</p>
          <p className="whitespace-pre-line text-[12px] leading-snug text-muted-foreground/70">{biller.address}</p>
        </div>
        {primary && (
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">{labels.billedTo}</p>
            <p className="text-[13.5px] font-semibold text-foreground">{primary.name}</p>
            <p className="truncate text-[12px] text-muted-foreground/70">{primary.email}</p>
            {billedToAddress && (
              <p className="whitespace-pre-line text-[12px] leading-snug text-muted-foreground/70">{billedToAddress}</p>
            )}
          </div>
        )}
      </div>

      <p className="text-[18px] font-bold tracking-tight text-foreground">
        {formatAmount(form.currency, total)} {form.currency}
        {form.dueDate && ` ${labels.dueBy.toLowerCase()} ${formatDate(form.dueDate, { day: "2-digit", month: "long", year: "numeric" })}`}
      </p>
      {form.memo && <p className="mb-4 mt-1 whitespace-pre-line text-[12px] text-muted-foreground/70">{form.memo}</p>}
      {!form.memo && <div className="mb-4" />}

      <div className="overflow-hidden rounded-none border border-border">
        <div className="grid grid-cols-[1fr_48px_72px_40px_72px] gap-2 border-b border-border bg-muted/30 px-3 py-2 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span>{labels.description}</span>
          <span className="text-center">{labels.qty}</span>
          <span className="text-right">{labels.unitPrice}</span>
          <span className="text-right">{labels.tax}</span>
          <span className="text-right">{labels.total}</span>
        </div>
        <div className="divide-y divide-border">
          {form.lineItems.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_48px_72px_40px_72px] gap-2 px-3 py-2.5 text-[12px]">
              <span className="truncate text-foreground">{item.name || "Untitled item"}</span>
              <span className="text-center tabular-nums text-muted-foreground">{lineItemQuantityLabel(item)}</span>
              <span className="text-right tabular-nums text-muted-foreground">{item.unitPrice}</span>
              <span className="text-right tabular-nums text-muted-foreground">
                {item.taxLabel === "None" ? 0 : item.taxLabel}
              </span>
              <span className="text-right tabular-nums font-medium text-foreground">
                {lineItemTotal(item).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-end justify-between gap-4">
        {form.paymentMethods.qrCodeEnabled ? (
          <div className="flex flex-col items-center gap-2">
            <QrCodePreview value={form.bankDetails.accountNumber || form.invoiceNumber || "invoice"} size={104} />
            <p className="text-[11.5px] text-muted-foreground">{labels.scanToPay}</p>
          </div>
        ) : (
          <span />
        )}

        <div className="w-full max-w-[220px] space-y-1.5 text-[12.5px]">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>{labels.totalExcludingTax}</span>
            <span className="tabular-nums">{formatAmount(form.currency, subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>{labels.totalTax}</span>
            <span className="tabular-nums">{formatAmount(form.currency, tax)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2 text-[16px] font-bold text-foreground">
            <span>{labels.amountDue}</span>
            <span className="tabular-nums">{formatAmount(form.currency, total)}</span>
          </div>
        </div>
      </div>

      {form.paymentMethods.bankTransferEnabled && (
        <div className="mt-6 border-t border-border pt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {labels.bankDetails}
          </p>
          <div className="grid grid-cols-2 gap-2 text-[12px] sm:grid-cols-4">
            <div>
              <p className="text-muted-foreground">{labels.accountHolder}</p>
              <p className="font-medium text-foreground">{form.bankDetails.accountHolder || "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{labels.accountNumber}</p>
              <p className="font-medium text-foreground">{form.bankDetails.accountNumber || "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{labels.bankName}</p>
              <p className="font-medium text-foreground">{form.bankDetails.bankName || "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{labels.ifscOrRouting}</p>
              <p className="font-medium text-foreground">{form.bankDetails.ifscOrRouting || "-"}</p>
            </div>
          </div>
        </div>
      )}

      {form.footer && (
        <>
          <div className="mt-6 border-t border-border" />
          <p className="mt-4 whitespace-pre-line text-left text-[11px] text-muted-foreground/80">{form.footer}</p>
        </>
      )}
    </div>
  );
}
