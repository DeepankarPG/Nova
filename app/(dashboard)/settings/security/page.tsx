"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard";
import { SettingsToggleSection } from "@/components/settings/SettingsToggleSection";
import { useSettingsPageActions } from "@/components/settings/SettingsPageActionsContext";

export default function SettingsSecurityPage() {
  const [accountKey, setAccountKey] = useState(0);
  const [kycKey, setKycKey] = useState(0);
  const [dirty, setDirty] = useState(false);

  const markDirty = () => setDirty(true);

  const save = () => {
    toast.success("Security settings saved");
    setDirty(false);
  };

  const cancel = () => {
    setAccountKey((k) => k + 1);
    setKycKey((k) => k + 1);
    setDirty(false);
  };

  useSettingsPageActions({ isDirty: dirty, onSave: save, onCancel: cancel });

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-[22px]">Security</h2>
        <p className="text-sm text-muted-foreground">Authentication, sessions, and access controls.</p>
      </div>

      <SettingsSectionCard
        title="Account security"
        footerActions={
          <>
            <Button variant="ghost" size="sm" type="button" onClick={() => { setAccountKey((k) => k + 1); setDirty(false); }}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="button" onClick={() => toast.success("Security settings saved")}>
              Save
            </Button>
          </>
        }
      >
        <SettingsToggleSection
          key={accountKey}
          onAnyChange={markDirty}
          items={[
            { label: "Two-factor authentication", description: "Require OTP on every login", on: true },
            { label: "IP allowlisting", description: "Restrict API access to approved IP addresses", on: false },
            { label: "Session timeout", description: "Auto-logout after 30 minutes of inactivity", on: true },
            { label: "Login notifications", description: "Email alert on every new login", on: true },
          ]}
        />
      </SettingsSectionCard>

      <SettingsSectionCard
        title="KYC & compliance"
        description="Verification documents and compliance toggles. eBRC workflows stay under Finance."
        footerActions={
          <>
            <Button variant="ghost" size="sm" type="button" onClick={() => { setKycKey((k) => k + 1); setDirty(false); }}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="button" onClick={() => toast.success("Compliance settings saved")}>
              Save
            </Button>
          </>
        }
      >
        <SettingsToggleSection
          key={kycKey}
          onAnyChange={markDirty}
          items={[
            { label: "eBRC auto-generation", description: "Auto-generate export benefit certificates", on: true },
            { label: "KYC reminders", description: "Notify team when documents are expiring", on: true },
            { label: "PCI-DSS mode", description: "Strict PCI compliance logging and auditing", on: true },
          ]}
        />
      </SettingsSectionCard>
    </div>
  );
}
