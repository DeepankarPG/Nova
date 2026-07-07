"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SettingsFieldRow } from "@/components/settings/SettingsFieldRow";
import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard";
import { SettingsTextInput } from "@/components/settings/SettingsTextInput";
import { useSettingsPageActions } from "@/components/settings/SettingsPageActionsContext";

export default function BusinessTaxPage() {
  const [gstStatus, setGstStatus] = useState("registered");
  const [pan, setPan] = useState("AAAAA0000A");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setDirty(false);
    toast.success("Tax details saved");
  };

  const cancel = () => {
    toast.message("Changes discarded (mock)");
    setDirty(false);
  };

  useSettingsPageActions({ isDirty: dirty, isSaving: saving, onSave: save, onCancel: cancel });

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-[22px]">Tax details</h2>
        <p className="text-sm text-muted-foreground">
          GST and PAN are used for invoicing and regulatory filings. For complex structures, consult your CA — this screen is a
          lightweight mock.
        </p>
      </div>

      <SettingsSectionCard
        title="Tax registrations"
        description="Identifiers used on invoices and regulatory submissions."
        footerActions={
          <>
            <Button variant="ghost" size="sm" type="button" onClick={cancel}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="button" isLoading={saving} onClick={save}>
              Save changes
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
            PayGlocal surfaces GST on settlements and exports where required. Customer-facing pages follow RBI and branding
            guidelines; your legal team remains responsible for filings.
          </div>
          <div>
            <SettingsFieldRow label="GST registration status" description="Matches your current compliance posture.">
              <select
                value={gstStatus}
                onChange={(e) => { setGstStatus(e.target.value); setDirty(true); }}
                className="h-9 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm"
              >
                <option value="registered">Registered — regular taxpayer</option>
                <option value="composition">Composition / special scheme</option>
                <option value="exempt">Exempt / not applicable</option>
              </select>
            </SettingsFieldRow>
            <SettingsFieldRow label="PAN (legal entity)" description="10-character PAN of the business.">
              <SettingsTextInput value={pan} onChange={(e) => { setPan(e.target.value.toUpperCase()); setDirty(true); }} maxLength={10} />
            </SettingsFieldRow>
            <SettingsFieldRow label="Additional tax IDs" description="Placeholder for SEZ, LUT, or state registrations.">
              <SettingsTextInput placeholder="e.g. LUT ARN, SEZ unit ID" onChange={() => setDirty(true)} />
            </SettingsFieldRow>
          </div>
        </div>
      </SettingsSectionCard>
    </div>
  );
}
