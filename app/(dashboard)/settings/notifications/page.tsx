"use client";

import { SettingsToggleSection } from "@/components/settings/SettingsToggleSection";

export default function SettingsNotificationsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-[22px]">Notifications</h2>
        <p className="text-sm text-muted-foreground">Email, in-app, and SMS preferences for your team.</p>
      </div>

      <section className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">Email alerts</h3>
        <p className="text-sm text-muted-foreground">Choose which events trigger email notifications.</p>
        <div className="mt-4">
          <SettingsToggleSection
            items={[
              { label: "Successful payments", description: "Email on every successful capture", on: true },
              { label: "Failed payments", description: "Alert when a payment is declined", on: true },
              { label: "New settlements", description: "Daily digest of settlement activity", on: true },
              { label: "Dispute created", description: "Immediate alert on new disputes", on: true },
              { label: "Low balance alert", description: "Warn when available balance drops below limit", on: false },
              { label: "Weekly summary", description: "Performance digest every Monday", on: false },
            ]}
          />
        </div>
      </section>

      <section className="space-y-1 border-t border-border pt-8">
        <h3 className="text-base font-semibold text-foreground">In-app & SMS</h3>
        <p className="text-sm text-muted-foreground">Real-time alerts inside the dashboard and via SMS.</p>
        <div className="mt-4">
          <SettingsToggleSection
            items={[
              { label: "In-app notifications", description: "Show alerts in the dashboard notification tray", on: true },
              { label: "SMS on failures", description: "SMS alert for payment failures", on: true },
              { label: "SMS on settlement", description: "SMS when funds are settled", on: false },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
