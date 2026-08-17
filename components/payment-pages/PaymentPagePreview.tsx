"use client";

import { ChevronDown, Globe, ImagePlus, Mail, Phone } from "lucide-react";
import { renderPageDescription } from "@/lib/payment-page-description-renderer";
import type { PaymentPageFormState } from "@/lib/payment-page-form-types";

function currencySymbol(currency: string) {
  return currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹";
}

export function PaymentPagePreview({
  form,
  className,
}: {
  form: PaymentPageFormState;
  className?: string;
}) {
  const sym = currencySymbol(form.currency);
  const payAmount = form.amountType === "fixed" ? Number(form.fixedAmount) || 0 : 0;
  const hasContact = form.contactUsEnabled && (form.supportEmail || form.supportPhone || form.supportWebsite);

  return (
    <div className={className ?? "overflow-hidden rounded-2xl border border-border bg-card shadow-md"}>
      <div className="grid min-h-[32rem] sm:grid-cols-[minmax(0,1fr)_23rem]">
        {/* Left rail: brand-colour panel with business name, cover image, title, description, contact */}
        <div className="flex flex-col p-8 text-white" style={{ backgroundColor: form.brandColor }}>
          <div className="mb-6 flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/95 text-[15px] font-bold" style={{ color: form.brandColor }}>
              {(form.businessName || "Acme Inc.").charAt(0).toUpperCase()}
            </span>
            <span>
              <span className="block text-[11px] font-medium text-white/70">Pay to</span>
              <span className="block text-[15px] font-bold">{form.businessName || "Acme Inc."}</span>
            </span>
          </div>

          {form.amountType === "fixed" && (
            <div className="mb-5">
              <span className="block text-[11px] font-medium uppercase tracking-widest text-white/70">Paying</span>
              <span className="block text-[26px] font-bold">
                {sym}
                {payAmount ? payAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}
              </span>
            </div>
          )}

          {form.product?.imageUrl && (
            <img src={form.product.imageUrl} alt="Cover" className="mb-5 h-36 w-full rounded-lg object-cover" />
          )}

          {form.product?.name && <p className="mb-2 text-[19px] font-bold leading-snug">{form.product.name}</p>}

          {form.product?.description && (
            <div className="space-y-1 text-[13px] leading-relaxed text-white/85">
              {renderPageDescription(form.product.description)}
            </div>
          )}

          <div className="mt-auto pt-8">
            {hasContact && (
              <div className="space-y-1.5 border-t border-white/20 pt-4">
                <p className="text-[10.5px] font-semibold uppercase tracking-widest text-white/60">Contact Us</p>
                {form.supportEmail && (
                  <p className="flex items-center gap-1.5 text-[12.5px]">
                    <Mail className="h-3.5 w-3.5 text-white/60" />
                    {form.supportEmail}
                  </p>
                )}
                {form.supportPhone && (
                  <p className="flex items-center gap-1.5 text-[12.5px]">
                    <Phone className="h-3.5 w-3.5 text-white/60" />
                    {form.supportPhoneCountry} {form.supportPhone}
                  </p>
                )}
                {form.supportWebsite && (
                  <p className="flex items-center gap-1.5 text-[12.5px]">
                    <Globe className="h-3.5 w-3.5 text-white/60" />
                    {form.supportWebsite}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right panel: "Your details" form */}
        <div className="flex flex-col bg-card p-8">
          <p className="text-[20px] font-bold text-foreground">Your details</p>
          <p className="mt-1 text-[12.5px] text-muted-foreground">Enter information to continue to payment.</p>

          <div className="mt-5 space-y-4">
            {form.amountType === "customer_decides" && (
              <div>
                <p className="mb-1.5 text-[11.5px] font-medium text-foreground">
                  Amount <span className="text-destructive">*</span>
                </p>
                <input
                  readOnly
                  placeholder="Customer enters amount"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-[12.5px] text-muted-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            )}

            {form.emailFieldEnabled && (
              <div>
                <p className="mb-1.5 text-[11.5px] font-medium text-foreground">
                  Email {form.emailFieldRequired && <span className="text-destructive">*</span>}
                </p>
                <input
                  readOnly
                  placeholder="you@example.com"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-[12.5px] text-muted-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            )}

            {form.phoneFieldEnabled && (
              <div>
                <p className="mb-1.5 text-[11.5px] font-medium text-foreground">
                  Phone number {form.phoneFieldRequired && <span className="text-destructive">*</span>}
                </p>
                <div className="flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-[12.5px] text-muted-foreground">
                  <span className="shrink-0 font-medium text-foreground">{form.supportPhoneCountry.split(" ")[0]}</span>
                  <span className="h-4 w-px bg-border" />
                  <input readOnly placeholder="7011458408" className="w-full bg-transparent focus:outline-none" />
                </div>
              </div>
            )}

            {form.customFields.map((field) => (
              <div key={field.id}>
                <p className="mb-1.5 text-[11.5px] font-medium text-foreground">
                  {field.label} {!field.optional && <span className="text-destructive">*</span>}
                </p>
                <input
                  readOnly
                  placeholder={field.hasDefaultValue && field.defaultValue ? field.defaultValue : "—"}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-[12.5px] text-muted-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            ))}

            {form.billingAddressEnabled && (
              <div>
                <p className="mb-1.5 text-[12.5px] font-semibold text-foreground">Billing address</p>
                <div className="overflow-hidden rounded-lg border border-border">
                  <div className="flex h-9 items-center gap-1.5 px-3 text-[12px] text-foreground">
                    India
                    <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
                  </div>
                  <div className="grid grid-cols-2 border-t border-border">
                    <div className="flex h-9 items-center border-r border-border px-3 text-[11.5px] text-muted-foreground">
                      PIN code
                    </div>
                    <div className="flex h-9 items-center px-3 text-[11.5px] text-muted-foreground">City</div>
                  </div>
                  <div className="flex h-9 items-center gap-1.5 border-t border-border px-3 text-[11.5px] text-muted-foreground">
                    State / province / region
                    <ChevronDown className="h-3 w-3 shrink-0" />
                  </div>
                  <div className="flex h-9 items-center border-t border-border px-3 text-[11.5px] text-muted-foreground">
                    Address line 1
                  </div>
                  <div className="flex h-9 items-center border-t border-border px-3 text-[11.5px] text-muted-foreground">
                    Address line 2 (optional)
                  </div>
                </div>
              </div>
            )}

            {form.customFields.length === 0 && !form.emailFieldEnabled && !form.phoneFieldEnabled && !form.billingAddressEnabled && (
              <p className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground/60">
                <ImagePlus className="h-3.5 w-3.5" />
                Add fields to collect from your customer
              </p>
            )}
          </div>

          <button
            type="button"
            className="mt-4 flex h-12 w-full items-center justify-center gap-1.5 rounded-lg text-[14px] font-semibold text-white"
            style={{ backgroundColor: form.brandColor }}
          >
            Continue to payment
          </button>
        </div>
      </div>
    </div>
  );
}
