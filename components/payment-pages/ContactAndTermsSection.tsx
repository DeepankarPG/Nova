"use client";

import { useState } from "react";
import { ChevronDown, Globe, Mail, Phone, Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supportPhoneCountryOptions } from "@/lib/mock-data/payment-page-create";
import { CustomFieldsSection, NestedCheckboxSection } from "./CustomFieldsBuilder";
import type { PaymentPageCustomField } from "@/lib/payment-page-form-types";

export function ContactAndTermsSection({
  supportEmail,
  onSupportEmailChange,
  supportPhone,
  onSupportPhoneChange,
  supportPhoneCountry,
  onSupportPhoneCountryChange,
  supportWebsite,
  onSupportWebsiteChange,
  contactUsEnabled,
  onContactUsEnabledChange,
  customFields,
  onCustomFieldsChange,
}: {
  supportEmail: string;
  onSupportEmailChange: (v: string) => void;
  supportPhone: string;
  onSupportPhoneChange: (v: string) => void;
  supportPhoneCountry: string;
  onSupportPhoneCountryChange: (v: string) => void;
  supportWebsite: string;
  onSupportWebsiteChange: (v: string) => void;
  contactUsEnabled: boolean;
  onContactUsEnabledChange: (v: boolean) => void;
  customFields: PaymentPageCustomField[];
  onCustomFieldsChange: (fields: PaymentPageCustomField[]) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 px-5 py-4 text-left hover:bg-muted/30"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Settings2 className="h-4 w-4" />
        </div>
        <h2 className="flex-1 text-[15px] font-semibold text-foreground">Advanced options</h2>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="space-y-5 border-t border-border px-5 py-4">
          <CustomFieldsSection customFields={customFields} onCustomFieldsChange={onCustomFieldsChange} />

          <div className="border-t border-border pt-4">
            <NestedCheckboxSection checked={contactUsEnabled} onCheckedChange={onContactUsEnabledChange} label="Contact us">
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Input
                  value={supportEmail}
                  onChange={(e) => onSupportEmailChange(e.target.value)}
                  placeholder="Enter support email"
                  type="email"
                  className="h-10 bg-card text-[13.5px]"
                />
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                <select
                  value={supportPhoneCountry}
                  onChange={(e) => onSupportPhoneCountryChange(e.target.value)}
                  className="h-10 shrink-0 rounded-lg border border-border bg-card px-2.5 text-[13px] text-foreground"
                >
                  {supportPhoneCountryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <Input
                  value={supportPhone}
                  onChange={(e) => onSupportPhoneChange(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="Enter support phone"
                  className="h-10 bg-card text-[13.5px]"
                />
              </div>
              <div className="flex items-center gap-2.5">
                <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Input
                  value={supportWebsite}
                  onChange={(e) => onSupportWebsiteChange(e.target.value)}
                  placeholder="Enter website (optional)"
                  className="h-10 bg-card text-[13.5px]"
                />
              </div>
            </NestedCheckboxSection>
          </div>
        </div>
      )}
    </div>
  );
}
