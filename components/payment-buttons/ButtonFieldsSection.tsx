"use client";

import { CreditCard, Mail, MapPin, Phone, User } from "lucide-react";
import { FieldCheckboxRow } from "@/components/payment-pages/CustomFieldsBuilder";

export function ButtonFieldsSection({
  nameFieldEnabled,
  onNameFieldEnabledChange,
  addressFieldEnabled,
  onAddressFieldEnabledChange,
  emailFieldEnabled,
  onEmailFieldEnabledChange,
  phoneFieldEnabled,
  onPhoneFieldEnabledChange,
}: {
  nameFieldEnabled: boolean;
  onNameFieldEnabledChange: (v: boolean) => void;
  addressFieldEnabled: boolean;
  onAddressFieldEnabledChange: (v: boolean) => void;
  emailFieldEnabled: boolean;
  onEmailFieldEnabledChange: (v: boolean) => void;
  phoneFieldEnabled: boolean;
  onPhoneFieldEnabledChange: (v: boolean) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <CreditCard className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">What you&apos;ll be collecting</h2>
          <p className="text-[12.5px] text-muted-foreground">
            Collected from the customer on the payment page after they click the button
          </p>
        </div>
      </div>

      <div className="space-y-0.5">
        <FieldCheckboxRow
          label="Customer Name"
          icon={<User className="h-4 w-4 text-muted-foreground" />}
          checked={nameFieldEnabled}
          onCheckedChange={onNameFieldEnabledChange}
        />
        <FieldCheckboxRow
          label="Customer Address"
          icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
          checked={addressFieldEnabled}
          onCheckedChange={onAddressFieldEnabledChange}
        />
        <FieldCheckboxRow
          label="Customer Email"
          icon={<Mail className="h-4 w-4 text-muted-foreground" />}
          checked={emailFieldEnabled}
          onCheckedChange={onEmailFieldEnabledChange}
        />
        <FieldCheckboxRow
          label="Customer Phone"
          icon={<Phone className="h-4 w-4 text-muted-foreground" />}
          checked={phoneFieldEnabled}
          onCheckedChange={onPhoneFieldEnabledChange}
        />
      </div>
    </div>
  );
}
