"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Landmark, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SettingsFieldRow } from "@/components/settings/SettingsFieldRow";
import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard";
import { cn } from "@/lib/utils";
import { useSettingsPageActions } from "@/components/settings/SettingsPageActionsContext";

type AccountRole = "Primary" | "Secondary";
interface LinkedAccount {
  id: string;
  bank: string;
  mask: string;
  type: string;
  currency: string;
  role: AccountRole;
}

const INITIAL_ACCOUNTS: LinkedAccount[] = [
  { id: "acc1", bank: "HDFC Bank",  mask: "****4521", type: "Current", currency: "INR", role: "Primary" },
  { id: "acc2", bank: "ICICI Bank", mask: "****8820", type: "Savings", currency: "USD", role: "Secondary" },
];

export default function BusinessBankingPage() {
  const [schedule, setSchedule] = useState<"manual" | "auto">("auto");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>(INITIAL_ACCOUNTS);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeCardId) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest(`[data-card-id="${activeCardId}"]`)) {
        setActiveCardId(null);
        setConfirmRemoveId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [activeCardId]);

  const setPrimaryAccount = (id: string) => {
    setLinkedAccounts((prev) =>
      prev.map((a) => ({
        ...a,
        role: a.id === id ? "Primary" : a.role === "Primary" ? "Secondary" : a.role,
      })),
    );
    setActiveCardId(null);
  };

  const removeAccount = (id: string) => {
    setLinkedAccounts((prev) => prev.filter((a) => a.id !== id));
    setActiveCardId(null);
    setConfirmRemoveId(null);
  };

  const dismissOverlay = () => {
    setActiveCardId(null);
    setConfirmRemoveId(null);
  };

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    setDirty(false);
    toast.success("Banking preferences saved");
  };

  const cancel = () => {
    toast.message("Changes discarded (mock)");
    setDirty(false);
  };

  useSettingsPageActions({ isDirty: dirty, isSaving: saving, onSave: save, onCancel: cancel });

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-[22px]">Bank accounts & currencies</h2>
        <p className="text-sm text-muted-foreground">
          Settlement accounts in INR and other currencies. Payouts follow RBI reporting where applicable.
        </p>
      </div>

      {/* Linked payout accounts */}
      <div>
        <div className="mb-4">
          <p className="text-[18px] font-bold text-foreground leading-tight">
            Linked payout accounts
          </p>
          <p className="text-[14px] mt-1" style={{ color: "#8A97AB" }}>
            Where we send settled funds by currency.
          </p>
        </div>

        <div className="space-y-3">
          {linkedAccounts.map((account) => (
            <div key={account.id} data-card-id={account.id} className="relative">
              {/* Card */}
              <button
                type="button"
                onClick={() => setActiveCardId(account.id)}
                className="w-full text-left bg-white rounded-2xl p-4 border border-[#E2E8F2] flex items-center gap-3 active:opacity-80 transition-opacity"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                {/* Bank icon container */}
                <div className="h-11 w-11 rounded-xl bg-[#F5F7FA] border border-[#E2E8F2] flex items-center justify-center shrink-0">
                  <Landmark
                    style={{ height: 22, width: 22, color: "#8A97AB" }}
                    strokeWidth={1.5}
                  />
                </div>

                {/* Account info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-foreground leading-tight">
                    {account.bank}
                  </p>
                  <p className="text-[13px] mt-0.5" style={{ color: "#8A97AB" }}>
                    {account.type} · {account.mask}
                  </p>
                </div>

                {/* Role pill + currency */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <span
                    className={cn(
                      "text-[12px] font-semibold px-2.5 py-1 rounded-full border",
                      account.role === "Primary"
                        ? "bg-[#EEF4FF] text-[#0272EE] border-[#C3D8FF]"
                        : "bg-[#F5F7FA] text-[#8A97AB] border-[#E2E8F2]",
                    )}
                  >
                    {account.role}
                  </span>
                  <span className="text-[11px] font-medium" style={{ color: "#8A97AB" }}>
                    {account.currency}
                  </span>
                </div>
              </button>

              {/* Tap-to-edit overlay */}
              <AnimatePresence>
                {activeCardId === account.id && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: "#0272EE" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {/* Dismiss X */}
                    <button
                      type="button"
                      onClick={dismissOverlay}
                      className="absolute top-2.5 right-2.5 h-6 w-6 rounded-full flex items-center justify-center active:opacity-70 transition-opacity"
                      style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                      aria-label="Dismiss"
                    >
                      <X className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                    </button>

                    {confirmRemoveId === account.id ? (
                      /* Delete confirmation */
                      <div className="flex flex-col items-center gap-3 px-5">
                        <p className="text-white text-[14px] font-semibold">
                          Remove account?
                        </p>
                        <p
                          className="text-[12px] text-center leading-snug"
                          style={{ color: "rgba(255,255,255,0.75)" }}
                        >
                          This account will no longer receive settlements.
                        </p>
                        <div className="flex gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => setConfirmRemoveId(null)}
                            className="px-4 py-2 rounded-xl text-white text-[13px] font-semibold active:opacity-70 transition-opacity"
                            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => removeAccount(account.id)}
                            className="px-4 py-2 rounded-xl bg-white text-[13px] font-semibold text-[#E53E3E] active:opacity-80 transition-opacity"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Action buttons */
                      <div className="flex gap-2">
                        {account.role === "Secondary" && (
                          <button
                            type="button"
                            onClick={() => setPrimaryAccount(account.id)}
                            className="flex flex-col items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white active:opacity-80 transition-opacity"
                          >
                            <Star
                              style={{ height: 18, width: 18 }}
                              className="text-[#0272EE]"
                              strokeWidth={1.75}
                            />
                            <span className="text-[13px] font-semibold text-[#0272EE]">
                              Set primary
                            </span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setConfirmRemoveId(account.id)}
                          className="flex flex-col items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white active:opacity-80 transition-opacity"
                        >
                          <Trash2
                            style={{ height: 18, width: 18 }}
                            className="text-[#E53E3E]"
                            strokeWidth={1.75}
                          />
                          <span className="text-[13px] font-semibold text-[#E53E3E]">
                            Remove
                          </span>
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => toast.success("Bank linking flow (mock)")}
          className="w-full mt-4 h-12 rounded-xl border border-primary text-[14px] font-semibold text-primary active:bg-primary/5 transition-colors flex items-center justify-center"
        >
          + Add payout account
        </button>
      </div>

      <SettingsSectionCard
        title="Payout schedule"
        description="Automatic payouts follow cutoffs in your timezone (Account)."
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
        <SettingsFieldRow label="When to settle" description="Choose manual requests or automatic settlement.">
          <div className="space-y-3">
            <label className="flex cursor-pointer items-start gap-2">
              <input
                type="radio"
                name="payout"
                className="mt-1"
                checked={schedule === "manual"}
                onChange={() => { setSchedule("manual"); setDirty(true); }}
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
                onChange={() => { setSchedule("auto"); setDirty(true); }}
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
              onChange={(e) => { setFrequency(e.target.value as "daily" | "weekly"); setDirty(true); }}
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
