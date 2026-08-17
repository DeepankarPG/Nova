"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RefreshCw, Send, X } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { ButtonDetailsSection } from "@/components/payment-buttons/ButtonDetailsSection";
import { ButtonFieldsSection } from "@/components/payment-buttons/ButtonFieldsSection";
import { ButtonAdvancedOptionsSection } from "@/components/payment-buttons/ButtonAdvancedOptionsSection";
import { ButtonStorefrontPreview } from "@/components/payment-buttons/ButtonStorefrontPreview";
import { ButtonCustomisationSection } from "@/components/payment-buttons/ButtonCustomisationSection";
import { PublishButtonSuccessDialog } from "@/components/payment-buttons/PublishButtonSuccessDialog";
import { initialPaymentButtonForm } from "@/lib/mock-data/payment-button-create";
import { isPaymentButtonReadyToPublish, type PaymentButtonFormState } from "@/lib/payment-button-form-types";

const DRAFT_BUTTON_ID = "pl_TOIAYILUARsiPl";

export default function CreatePaymentButtonPage() {
  const router = useRouter();
  const [form, setForm] = useState<PaymentButtonFormState>(initialPaymentButtonForm);
  const [publishOpen, setPublishOpen] = useState(false);

  const patch = (p: Partial<PaymentButtonFormState>) => setForm((f) => ({ ...f, ...p }));

  const canPublish = isPaymentButtonReadyToPublish(form);

  const handlePublish = () => {
    if (!canPublish) {
      toast.error("Add a button label first");
      return;
    }
    setPublishOpen(true);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center gap-4 border-b border-border px-5 py-3">
        <button
          type="button"
          onClick={() => router.push("/payment-products/payment-button")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Create a new payment button</h1>
            <StatusBadge status="draft" size="sm" />
            <span className="flex items-center gap-1 text-[13px] text-muted-foreground">
              <RefreshCw className="h-3 w-3" />
              Auto-saved as you type
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="primary" size="sm" leftIcon={<Send className="h-3.5 w-3.5" />} onClick={handlePublish} disabled={!canPublish}>
            Create button
          </Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_44rem]">
        <div className="min-h-0 overflow-y-auto">
          <div className="mx-auto max-w-[860px] space-y-5 px-[4.5rem] py-6">
            <ButtonDetailsSection
              title={form.title}
              onTitleChange={(title) => patch({ title })}
              buttonType={form.buttonType}
              onButtonTypeChange={(buttonType) => patch({ buttonType })}
              buttonLabel={form.buttonLabel}
              onButtonLabelChange={(buttonLabel) => patch({ buttonLabel })}
              fixedAmount={form.fixedAmount}
              onFixedAmountChange={(fixedAmount) => patch({ fixedAmount })}
              currency={form.currency}
              onCurrencyChange={(currency) => patch({ currency })}
            />

            <ButtonFieldsSection
              nameFieldEnabled={form.nameFieldEnabled}
              onNameFieldEnabledChange={(nameFieldEnabled) => patch({ nameFieldEnabled })}
              addressFieldEnabled={form.addressFieldEnabled}
              onAddressFieldEnabledChange={(addressFieldEnabled) => patch({ addressFieldEnabled })}
              emailFieldEnabled={form.emailFieldEnabled}
              onEmailFieldEnabledChange={(emailFieldEnabled) => patch({ emailFieldEnabled })}
              phoneFieldEnabled={form.phoneFieldEnabled}
              onPhoneFieldEnabledChange={(phoneFieldEnabled) => patch({ phoneFieldEnabled })}
            />

            <ButtonAdvancedOptionsSection
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
          <div className="space-y-5 p-4 md:p-6">
            <ButtonStorefrontPreview form={form} buttonId={DRAFT_BUTTON_ID} />

            <ButtonCustomisationSection
              theme={form.theme}
              onThemeChange={(theme) => patch({ theme })}
              brandColor={form.brandColor}
              onBrandColorChange={(brandColor) => patch({ brandColor })}
              cornerRadius={form.cornerRadius}
              onCornerRadiusChange={(cornerRadius) => patch({ cornerRadius })}
              size={form.size}
              onSizeChange={(size) => patch({ size })}
            />
          </div>
        </div>
      </div>

      <PublishButtonSuccessDialog
        open={publishOpen}
        onOpenChange={(open) => {
          setPublishOpen(open);
          if (!open) router.push("/payment-products/payment-button");
        }}
        form={form}
        buttonId={DRAFT_BUTTON_ID}
      />
    </div>
  );
}
