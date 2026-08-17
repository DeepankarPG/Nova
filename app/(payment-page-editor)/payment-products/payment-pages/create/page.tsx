"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RefreshCw, Send, X } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { WhatYoureSellingSection } from "@/components/payment-pages/WhatYoureSellingSection";
import { PaymentFieldsSection } from "@/components/payment-pages/PaymentFieldsSection";
import { ContactAndTermsSection } from "@/components/payment-pages/ContactAndTermsSection";
import { PaymentPagePreviewSidebar } from "@/components/payment-pages/PaymentPagePreviewSidebar";
import { PublishSuccessDialog } from "@/components/payment-pages/PublishSuccessDialog";
import { initialPaymentPageForm, paymentPageSlug } from "@/lib/mock-data/payment-page-create";
import { isPaymentPageReadyToPublish, type PaymentPageFormState } from "@/lib/payment-page-form-types";

export default function CreatePaymentPage() {
  const router = useRouter();
  const [form, setForm] = useState<PaymentPageFormState>(initialPaymentPageForm);
  const [publishOpen, setPublishOpen] = useState(false);

  const patch = (p: Partial<PaymentPageFormState>) => setForm((f) => ({ ...f, ...p }));

  const canPublish = isPaymentPageReadyToPublish(form);
  const slug = paymentPageSlug(form.businessName, form.product?.name);
  const pageUrl = `https://pay.payglocal.in/${slug}`;

  const handlePublish = () => {
    if (!canPublish) {
      toast.error("Add a product and amount first");
      return;
    }
    setPublishOpen(true);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center gap-4 border-b border-border px-5 py-3">
        <button
          type="button"
          onClick={() => router.push("/payment-products/payment-pages")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Create a new payment page</h1>
            <StatusBadge status="draft" size="sm" />
            <span className="flex items-center gap-1 text-[13px] text-muted-foreground">
              <RefreshCw className="h-3 w-3" />
              Auto-saved as you type
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="primary" size="sm" leftIcon={<Send className="h-3.5 w-3.5" />} onClick={handlePublish} disabled={!canPublish}>
            Publish page
          </Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_50rem]">
        <div className="min-h-0 overflow-y-auto">
          <div className="mx-auto max-w-[860px] space-y-5 px-[4.5rem] py-6">
            <WhatYoureSellingSection
              product={form.product}
              onChange={(product) => patch({ product })}
              onRemove={() => patch({ product: null })}
            />

            <PaymentFieldsSection
              amountType={form.amountType}
              onAmountTypeChange={(amountType) => patch({ amountType })}
              fixedAmount={form.fixedAmount}
              onFixedAmountChange={(fixedAmount) => patch({ fixedAmount })}
              currency={form.currency}
              onCurrencyChange={(currency) => patch({ currency })}
              emailFieldEnabled={form.emailFieldEnabled}
              onEmailFieldEnabledChange={(emailFieldEnabled) => patch({ emailFieldEnabled })}
              phoneFieldEnabled={form.phoneFieldEnabled}
              onPhoneFieldEnabledChange={(phoneFieldEnabled) => patch({ phoneFieldEnabled })}
              billingAddressEnabled={form.billingAddressEnabled}
              onBillingAddressEnabledChange={(billingAddressEnabled) => patch({ billingAddressEnabled })}
            />

            <ContactAndTermsSection
              supportEmail={form.supportEmail}
              onSupportEmailChange={(supportEmail) => patch({ supportEmail })}
              supportPhone={form.supportPhone}
              onSupportPhoneChange={(supportPhone) => patch({ supportPhone })}
              supportPhoneCountry={form.supportPhoneCountry}
              onSupportPhoneCountryChange={(supportPhoneCountry) => patch({ supportPhoneCountry })}
              supportWebsite={form.supportWebsite}
              onSupportWebsiteChange={(supportWebsite) => patch({ supportWebsite })}
              contactUsEnabled={form.contactUsEnabled}
              onContactUsEnabledChange={(contactUsEnabled) => patch({ contactUsEnabled })}
              customFields={form.customFields}
              onCustomFieldsChange={(customFields) => patch({ customFields })}
            />
          </div>
        </div>

        <div className="min-h-0 overflow-y-auto bg-muted">
          <div className="p-4 md:p-6">
            <PaymentPagePreviewSidebar form={form} />
          </div>
        </div>
      </div>

      <PublishSuccessDialog
        open={publishOpen}
        onOpenChange={(open) => {
          setPublishOpen(open);
          if (!open) router.push("/payment-products/payment-pages");
        }}
        form={form}
        pageUrl={pageUrl}
        onCustomiseUrl={() => toast.message("Customise URL", { description: "Custom domains and slugs are managed from Settings." })}
      />
    </div>
  );
}
