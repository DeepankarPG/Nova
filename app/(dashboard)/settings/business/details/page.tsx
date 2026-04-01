"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SettingsFieldRow } from "@/components/settings/SettingsFieldRow";
import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard";
import { SettingsTextInput } from "@/components/settings/SettingsTextInput";

export default function BusinessDetailsPage() {
  const [legalName, setLegalName] = useState("MCATEST123 PRIVATE LIMITED");
  const [gstin, setGstin] = useState("27AAAAA0000A1Z5");
  const [address, setAddress] = useState("Tower B, 9th Floor, Business District, Mumbai 400001");
  const [category, setCategory] = useState("Software & SaaS exports");
  const [website, setWebsite] = useState("https://mcatest123.com");
  const [supportEmail, setSupportEmail] = useState("support@mcatest123.com");
  const [supportPhone, setSupportPhone] = useState("+91 98765 43210");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    toast.success("Business details saved");
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-[22px]">Business details</h2>
        <p className="text-sm text-muted-foreground">Legal and public-facing information for your entity.</p>
      </div>

      <SettingsSectionCard
        title="Legal & public profile"
        description="Details shown where required for compliance and customer support."
        footerActions={
          <>
            <Button variant="ghost" size="sm" type="button" onClick={() => toast.message("Changes discarded (mock)")}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="button" isLoading={saving} onClick={save}>
              Save changes
            </Button>
          </>
        }
      >
        <div>
          <SettingsFieldRow label="Legal business name" description="As on your incorporation / GST records.">
            <SettingsTextInput value={legalName} onChange={(e) => setLegalName(e.target.value)} />
          </SettingsFieldRow>
          <SettingsFieldRow label="GSTIN" description="15-character GST identification number.">
            <SettingsTextInput value={gstin} onChange={(e) => setGstin(e.target.value)} />
          </SettingsFieldRow>
          <SettingsFieldRow label="Registered address" description="Principal place of business in India.">
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="Business category" description="Helps us tune risk and reporting templates.">
            <SettingsTextInput value={category} onChange={(e) => setCategory(e.target.value)} />
          </SettingsFieldRow>
          <SettingsFieldRow label="Website" description="Your public-facing business website.">
            <SettingsTextInput value={website} onChange={(e) => setWebsite(e.target.value)} />
          </SettingsFieldRow>
          <SettingsFieldRow label="Support email" description="Where customer queries are directed.">
            <SettingsTextInput type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
          </SettingsFieldRow>
          <SettingsFieldRow label="Support phone" description="Shown on receipts and payment pages where applicable.">
            <SettingsTextInput value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} />
          </SettingsFieldRow>
        </div>
      </SettingsSectionCard>
    </div>
  );
}
