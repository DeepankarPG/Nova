"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard";
import { SettingsToggleSection } from "@/components/settings/SettingsToggleSection";

export default function SettingsPaymentsPage() {
  const [methodsKey, setMethodsKey] = useState(0);
  const [currenciesKey, setCurrenciesKey] = useState(0);
  const [refundsKey, setRefundsKey] = useState(0);

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-[22px]">Payments</h2>
        <p className="text-sm text-muted-foreground">Payment methods, currencies, and refund behaviour for your customers.</p>
      </div>

      <SettingsSectionCard
        title="Payment methods"
        description="Enable or disable rails for Indian and international buyers."
        footerActions={
          <>
            <Button variant="ghost" size="sm" type="button" onClick={() => setMethodsKey((k) => k + 1)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="button" onClick={() => toast.success("Payment methods saved")}>
              Save
            </Button>
          </>
        }
      >
        <SettingsToggleSection
          key={methodsKey}
          items={[
            { label: "Cards (Visa / Mastercard / Amex)", description: "Domestic and international card payments", on: true },
            { label: "UPI", description: "Real-time bank transfers via UPI", on: true },
            { label: "Net banking", description: "Direct bank transfers for Indian customers", on: true },
            { label: "International cards", description: "Cross-border card payments in 135+ currencies", on: true },
            { label: "Global fund transfers", description: "Wire transfers and SWIFT-based payments", on: false },
          ]}
        />
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Currencies"
        description="Settlement currencies and FX behaviour (mock)."
        footerActions={
          <>
            <Button variant="ghost" size="sm" type="button" onClick={() => setCurrenciesKey((k) => k + 1)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="button" onClick={() => toast.success("Currency settings saved")}>
              Save
            </Button>
          </>
        }
      >
        <SettingsToggleSection
          key={currenciesKey}
          items={[
            { label: "INR settlement", description: "Receive payouts in Indian rupees", on: true },
            { label: "USD settlement", description: "Receive payouts in US dollars", on: true },
            { label: "Mid-market rates", description: "Use live mid-market FX for conversions", on: true },
            { label: "Lock-in rates", description: "Fix exchange rate at transaction time", on: false },
          ]}
        />
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Refund policy"
        description="How and when refunds are processed."
        footerActions={
          <>
            <Button variant="ghost" size="sm" type="button" onClick={() => setRefundsKey((k) => k + 1)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="button" onClick={() => toast.success("Refund policy saved")}>
              Save
            </Button>
          </>
        }
      >
        <SettingsToggleSection
          key={refundsKey}
          items={[
            { label: "Instant refunds", description: "Refund to source within minutes for UPI", on: false },
            { label: "Auto-refund on failure", description: "Automatically refund failed captures", on: true },
            { label: "Partial refunds", description: "Allow refunding less than the full amount", on: true },
          ]}
        />
      </SettingsSectionCard>
    </div>
  );
}
