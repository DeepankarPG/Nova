"use client";

import { useState } from "react";
import { Landmark } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SettingsFieldRow } from "@/components/settings/SettingsFieldRow";
import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard";
import { cn } from "@/lib/utils";

const accounts = [
  { bank: "HDFC Bank", mask: "****4521", type: "Current", currency: "INR", role: "Primary" as const },
  { bank: "ICICI Bank", mask: "****8820", type: "Savings", currency: "USD", role: "Secondary" as const },
];

export default function BusinessBankingPage() {
  const [schedule, setSchedule] = useState<"manual" | "auto">("auto");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    toast.success("Banking preferences saved");
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-[22px]">Bank accounts & currencies</h2>
        <p className="text-sm text-muted-foreground">
          Settlement accounts in INR and other currencies. Payouts follow RBI reporting where applicable.
        </p>
      </div>

      <SettingsSectionCard title="Linked payout accounts" description="Where we send settled funds by currency.">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Currency</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Payout account</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Role</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground" />
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.mask} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3 font-medium text-foreground">{a.currency}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card">
                          <Landmark className="h-4 w-4 text-muted-foreground" />
                        </span>
                        <div>
                          <p className="font-medium text-foreground">{a.bank}</p>
                          <p className="text-xs text-muted-foreground">
                            {a.type} · {a.mask}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium",
                          a.role === "Primary"
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-border bg-muted/50 text-muted-foreground"
                        )}
                      >
                        {a.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" type="button">
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button variant="outline" size="sm" type="button" onClick={() => toast.success("Bank linking flow (mock)")}>
            Add bank account
          </Button>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Payout schedule"
        description="Automatic payouts follow cutoffs in your timezone (Account)."
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
        <SettingsFieldRow label="When to settle" description="Choose manual requests or automatic settlement.">
          <div className="space-y-3">
            <label className="flex cursor-pointer items-start gap-2">
              <input
                type="radio"
                name="payout"
                className="mt-1"
                checked={schedule === "manual"}
                onChange={() => setSchedule("manual")}
              />
              <span>
                <span className="text-sm font-medium text-foreground">Manual</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">Request each payout from the dashboard.</span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-2">
              <input
                type="radio"
                name="payout"
                className="mt-1"
                checked={schedule === "auto"}
                onChange={() => setSchedule("auto")}
              />
              <span>
                <span className="text-sm font-medium text-foreground">Automatic</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  We initiate payouts on a fixed cadence for INR balances.
                </span>
              </span>
            </label>
          </div>
        </SettingsFieldRow>
        {schedule === "auto" ? (
          <SettingsFieldRow label="Frequency" description="Applies to INR settlement rails in this mock.">
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as "daily" | "weekly")}
              className="h-9 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm"
            >
              <option value="daily">Every business day (T+1 where eligible)</option>
              <option value="weekly">Weekly (Mondays)</option>
            </select>
          </SettingsFieldRow>
        ) : null}
      </SettingsSectionCard>
    </div>
  );
}
