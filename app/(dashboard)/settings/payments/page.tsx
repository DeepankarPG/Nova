"use client";

import { SettingsToggleSection } from "@/components/settings/SettingsToggleSection";

export default function SettingsPaymentsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-[22px]">Payments</h2>
        <p className="text-sm text-muted-foreground">Payment methods, currencies, and refund behaviour for your customers.</p>
      </div>

      <section className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">Payment methods</h3>
        <p className="text-sm text-muted-foreground">Enable or disable rails for Indian and international buyers.</p>
        <div className="mt-4">
          <SettingsToggleSection
            items={[
              { label: "Cards (Visa / Mastercard / Amex)", description: "Domestic and international card payments", on: true },
              { label: "UPI", description: "Real-time bank transfers via UPI", on: true },
              { label: "Net banking", description: "Direct bank transfers for Indian customers", on: true },
              { label: "International cards", description: "Cross-border card payments in 135+ currencies", on: true },
              { label: "Global fund transfers", description: "Wire transfers and SWIFT-based payments", on: false },
            ]}
          />
        </div>
      </section>

      <section className="space-y-1 border-t border-border pt-8">
        <h3 className="text-base font-semibold text-foreground">Currencies</h3>
        <p className="text-sm text-muted-foreground">Settlement currencies and FX behaviour (mock).</p>
        <div className="mt-4">
          <SettingsToggleSection
            items={[
              { label: "INR settlement", description: "Receive payouts in Indian rupees", on: true },
              { label: "USD settlement", description: "Receive payouts in US dollars", on: true },
              { label: "Mid-market rates", description: "Use live mid-market FX for conversions", on: true },
              { label: "Lock-in rates", description: "Fix exchange rate at transaction time", on: false },
            ]}
          />
        </div>
      </section>

      <section className="space-y-1 border-t border-border pt-8">
        <h3 className="text-base font-semibold text-foreground">Refund policy</h3>
        <p className="text-sm text-muted-foreground">How and when refunds are processed.</p>
        <div className="mt-4">
          <SettingsToggleSection
            items={[
              { label: "Instant refunds", description: "Refund to source within minutes for UPI", on: false },
              { label: "Auto-refund on failure", description: "Automatically refund failed captures", on: true },
              { label: "Partial refunds", description: "Allow refunding less than the full amount", on: true },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
