"use client";

import { SettingsToggleSection } from "@/components/settings/SettingsToggleSection";

export default function SettingsSecurityPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-[22px]">Security</h2>
        <p className="text-sm text-muted-foreground">Authentication, sessions, and access controls.</p>
      </div>

      <section className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">Account security</h3>
        <div className="mt-4">
          <SettingsToggleSection
            items={[
              { label: "Two-factor authentication", description: "Require OTP on every login", on: true },
              { label: "IP allowlisting", description: "Restrict API access to approved IP addresses", on: false },
              { label: "Session timeout", description: "Auto-logout after 30 minutes of inactivity", on: true },
              { label: "Login notifications", description: "Email alert on every new login", on: true },
            ]}
          />
        </div>
      </section>

      <section className="space-y-1 border-t border-border pt-8">
        <h3 className="text-base font-semibold text-foreground">KYC & compliance</h3>
        <p className="text-sm text-muted-foreground">Verification documents and compliance toggles. eBRC workflows stay under Finance.</p>
        <div className="mt-4">
          <SettingsToggleSection
            items={[
              { label: "eBRC auto-generation", description: "Auto-generate export benefit certificates", on: true },
              { label: "KYC reminders", description: "Notify team when documents are expiring", on: true },
              { label: "PCI-DSS mode", description: "Strict PCI compliance logging and auditing", on: true },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
