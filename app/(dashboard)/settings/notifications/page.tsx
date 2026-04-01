"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard";
import { SettingsToggleSection } from "@/components/settings/SettingsToggleSection";

export default function SettingsNotificationsPage() {
  const [emailKey, setEmailKey] = useState(0);
  const [inAppKey, setInAppKey] = useState(0);

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-[22px]">Notifications</h2>
        <p className="text-sm text-muted-foreground">Email, in-app, and SMS preferences for your team.</p>
      </div>

      <SettingsSectionCard
        title="Email alerts"
        description="Choose which events trigger email notifications."
        footerActions={
          <>
            <Button variant="ghost" size="sm" type="button" onClick={() => setEmailKey((k) => k + 1)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="button" onClick={() => toast.success("Email preferences saved")}>
              Save
            </Button>
          </>
        }
      >
        <SettingsToggleSection
          key={emailKey}
          items={[
            { label: "Successful payments", description: "Email on every successful capture", on: true },
            { label: "Failed payments", description: "Alert when a payment is declined", on: true },
            { label: "New settlements", description: "Daily digest of settlement activity", on: true },
            { label: "Dispute created", description: "Immediate alert on new disputes", on: true },
            { label: "Low balance alert", description: "Warn when available balance drops below limit", on: false },
            { label: "Weekly summary", description: "Performance digest every Monday", on: false },
          ]}
        />
      </SettingsSectionCard>

      <SettingsSectionCard
        title="In-app & SMS"
        description="Real-time alerts inside the dashboard and via SMS."
        footerActions={
          <>
            <Button variant="ghost" size="sm" type="button" onClick={() => setInAppKey((k) => k + 1)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="button" onClick={() => toast.success("Notification preferences saved")}>
              Save
            </Button>
          </>
        }
      >
        <SettingsToggleSection
          key={inAppKey}
          items={[
            { label: "In-app notifications", description: "Show alerts in the dashboard notification tray", on: true },
            { label: "SMS on failures", description: "SMS alert for payment failures", on: true },
            { label: "SMS on settlement", description: "SMS when funds are settled", on: false },
          ]}
        />
      </SettingsSectionCard>
    </div>
  );
}
