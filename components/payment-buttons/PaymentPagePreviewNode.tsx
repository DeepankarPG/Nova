"use client";

import { Lock } from "lucide-react";
import { PaymentPagePreview } from "@/components/payment-pages/PaymentPagePreview";
import type { PaymentPageSummary } from "@/lib/mock-data/payment-page-create";
import type { PaymentPageFormState } from "@/lib/payment-page-form-types";
import { cn } from "@/lib/utils";

function toPreviewForm(page: PaymentPageSummary): PaymentPageFormState {
  return {
    businessName: page.businessName,
    product: page.product,
    amountType: page.amountType,
    fixedAmount: page.fixedAmount,
    minAmount: "",
    emailFieldEnabled: true,
    emailFieldRequired: true,
    phoneFieldEnabled: true,
    phoneFieldRequired: true,
    billingAddressEnabled: false,
    customFields: [],
    contactUsEnabled: false,
    supportEmail: "",
    supportPhone: "",
    supportPhoneCountry: "+91 (IN)",
    supportWebsite: "",
    currency: page.currency,
    brandColor: page.brandColor,
  };
}

export function PaymentPagePreviewNode({
  page,
  className,
  style,
}: {
  page: PaymentPageSummary;
  className?: string;
  style?: React.CSSProperties;
}) {
  const form = toPreviewForm(page);

  return (
    <div className={cn("pointer-events-none w-[280px] overflow-hidden rounded-xl border border-border bg-card shadow-lg", className)} style={style}>
      <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-3 py-2">
        <Lock className="h-2.5 w-2.5 text-muted-foreground" />
        <span className="truncate text-[10px] text-muted-foreground">pay.payglocal.in/{page.slug}</span>
      </div>
      <div style={{ width: 640, height: 480, transform: "scale(0.4375)", transformOrigin: "top left" }}>
        <PaymentPagePreview form={form} className="h-[480px] w-[640px] bg-card" />
      </div>
    </div>
  );
}
