"use client";

import { CreditCard, Mail, MapPin, Phone } from "lucide-react";
import { AmountFieldsRow } from "./AmountAndFieldsSection";
import { FieldCheckboxRow } from "./CustomFieldsBuilder";
import type { AmountType } from "@/lib/payment-page-form-types";

export function PaymentFieldsSection({
  amountType,
  onAmountTypeChange,
  fixedAmount,
  onFixedAmountChange,
  currency,
  onCurrencyChange,
  emailFieldEnabled,
  onEmailFieldEnabledChange,
  phoneFieldEnabled,
  onPhoneFieldEnabledChange,
  billingAddressEnabled,
  onBillingAddressEnabledChange,
}: {
  amountType: AmountType;
  onAmountTypeChange: (v: AmountType) => void;
  fixedAmount: string;
  onFixedAmountChange: (v: string) => void;
  currency: string;
  onCurrencyChange: (v: string) => void;
  emailFieldEnabled: boolean;
  onEmailFieldEnabledChange: (v: boolean) => void;
  phoneFieldEnabled: boolean;
  onPhoneFieldEnabledChange: (v: boolean) => void;
  billingAddressEnabled: boolean;
  onBillingAddressEnabledChange: (v: boolean) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <CreditCard className="h-4 w-4" />
        </div>
        <h2 className="text-[15px] font-semibold text-foreground">What you&apos;ll be collecting</h2>
      </div>

      <AmountFieldsRow
        amountType={amountType}
        onAmountTypeChange={onAmountTypeChange}
        fixedAmount={fixedAmount}
        onFixedAmountChange={onFixedAmountChange}
        currency={currency}
        onCurrencyChange={onCurrencyChange}
      />

      <div className="space-y-0.5">
        <FieldCheckboxRow
          label="Email"
          icon={<Mail className="h-4 w-4 text-muted-foreground" />}
          checked={emailFieldEnabled}
          onCheckedChange={onEmailFieldEnabledChange}
        />
        <FieldCheckboxRow
          label="Phone"
          icon={<Phone className="h-4 w-4 text-muted-foreground" />}
          checked={phoneFieldEnabled}
          onCheckedChange={onPhoneFieldEnabledChange}
        />
        <FieldCheckboxRow
          label="Billing address"
          icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
          checked={billingAddressEnabled}
          onCheckedChange={onBillingAddressEnabledChange}
        />
      </div>
    </div>
  );
}
