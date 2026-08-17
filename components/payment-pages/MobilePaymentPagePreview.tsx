"use client";

import type { PaymentPageFormState } from "@/lib/payment-page-form-types";

function currencySymbol(currency: string) {
  return currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹";
}

export function MobilePaymentPagePreview({ form }: { form: PaymentPageFormState }) {
  const sym = currencySymbol(form.currency);
  const payAmount = form.amountType === "fixed" ? Number(form.fixedAmount) || 0 : 0;

  return (
    <div className="bg-card">
      <div className="flex flex-col items-center gap-2 px-6 py-8 text-center text-white" style={{ backgroundColor: form.brandColor }}>
        <span className="rounded-md bg-black/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">Sandbox</span>
        <p className="mt-2 text-[13px] text-white/85">{form.product?.name || "Payment page"}</p>
        <p className="text-[26px] font-bold">
          {form.amountType === "fixed" ? `${sym}${payAmount ? payAmount.toLocaleString("en-IN") : "0.00"}` : `${sym}0.00`}
        </p>
      </div>

      <div className="space-y-4 px-5 py-5">
        {form.emailFieldEnabled && (
          <div>
            <p className="mb-1.5 text-[12px] font-medium text-foreground">
              Email {form.emailFieldRequired && <span className="text-destructive">*</span>}
            </p>
            <div className="flex h-10 items-center rounded-lg border border-border bg-background px-3 text-[12.5px] text-muted-foreground">
              email@example.com
            </div>
          </div>
        )}

        {form.customFields.slice(0, 1).map((field) => (
          <div key={field.id}>
            <p className="mb-1.5 text-[12px] font-medium text-foreground">
              {field.label} {!field.optional && <span className="text-destructive">*</span>}
            </p>
            <div className="flex h-10 items-center rounded-lg border border-border bg-background px-3 text-[12.5px] text-muted-foreground">
              {field.hasDefaultValue && field.defaultValue ? field.defaultValue : "—"}
            </div>
          </div>
        ))}

        <div>
          <p className="mb-2 text-[13px] font-semibold text-foreground">Payment method</p>
          <div className="rounded-lg border border-border p-3">
            <p className="mb-2 flex items-center gap-1.5 text-[12.5px] font-medium text-foreground">Card</p>
            <div className="space-y-2">
              <div className="flex h-9 items-center rounded-md border border-border bg-background px-3 text-[11.5px] text-muted-foreground">
                1234 1234 1234 1234
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex h-9 items-center rounded-md border border-border bg-background px-3 text-[11.5px] text-muted-foreground">
                  MM / YY
                </div>
                <div className="flex h-9 items-center rounded-md border border-border bg-background px-3 text-[11.5px] text-muted-foreground">
                  CVC
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="flex h-11 w-full items-center justify-center rounded-lg text-[13.5px] font-semibold text-white"
          style={{ backgroundColor: form.brandColor }}
        >
          Pay {sym}
          {form.amountType === "fixed" && payAmount ? payAmount.toLocaleString("en-IN") : "0.00"}
        </button>
      </div>
    </div>
  );
}
