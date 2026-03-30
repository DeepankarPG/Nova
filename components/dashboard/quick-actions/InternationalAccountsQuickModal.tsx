"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/shared/Dialog";
import { Button } from "@/components/shared/Button";
import { BankDetailRow } from "@/components/international-accounts/BankDetailRow";
import { clientReceivingLocations } from "@/lib/mock-data";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";

type AccountMode = "local" | "others";

function copyAllDetails(rows: { label: string; value: string }[]) {
  const text = rows.map((r) => `${r.label}: ${r.value}`).join("\n");
  void navigator.clipboard.writeText(text);
  toast.success("All banking details copied");
}

export function InternationalAccountsQuickModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [locationId, setLocationId] = useState(clientReceivingLocations[0]?.id ?? "usa");
  const [mode, setMode] = useState<AccountMode>("local");

  const location = useMemo(
    () => clientReceivingLocations.find((l) => l.id === locationId) ?? null,
    [locationId]
  );

  useEffect(() => {
    if (open) setMode("local");
  }, [open, locationId]);

  const showToggle = location && location.id !== "rest-of-world";

  const activeRows = useMemo(() => {
    if (!location) return [];
    if (!showToggle || mode === "local") return location.localRows;
    return location.swiftRows;
  }, [location, mode, showToggle]);

  const activeTitle = useMemo(() => {
    if (!location) return "";
    if (!showToggle || mode === "local") return location.localAccountTitle;
    return location.swiftAccountTitle;
  }, [location, mode, showToggle]);

  const activeSubtitle = useMemo(() => {
    if (!location) return "";
    if (!showToggle || mode === "local") return location.localAccountSubtitle;
    return `Currencies: ${location.swiftCurrenciesNote}.`;
  }, [location, mode, showToggle]);

  const rowsForCopy = useMemo(() => {
    if (!location) return [];
    if (!showToggle || mode === "local") {
      return [{ label: "Payment method", value: location.paymentMethodLocal }, ...location.localRows];
    }
    return location.swiftRows;
  }, [location, mode, showToggle]);

  if (!location) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose
        className="flex max-h-[min(90vh,720px)] w-[calc(100%-1.5rem)] max-w-[920px] flex-col gap-0 overflow-hidden p-0 sm:w-full"
      >
        <div className="border-b border-border px-5 pb-4 pt-5 pr-14 sm:px-6 sm:pt-6">
          <DialogTitle>International accounts</DialogTitle>
          <DialogDescription className="mt-1.5">
            Receiving details by client location — copy everything to share with your payer.
          </DialogDescription>
        </div>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <aside className="flex max-h-[min(36vh,280px)] shrink-0 flex-col border-b border-border md:max-h-none md:w-56 md:border-b-0 md:border-r">
            <p className="shrink-0 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Your client location
            </p>
            <nav
              className="min-h-0 flex-1 overflow-y-auto"
              aria-label="Client locations"
            >
              {clientReceivingLocations.map((loc) => {
                const active = loc.id === location.id;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setLocationId(loc.id)}
                    className={cn(
                      "flex w-full items-center gap-3 border-b border-border px-4 py-2.5 text-left text-[14px] transition-colors",
                      active
                        ? "bg-primary-light font-semibold text-foreground"
                        : "font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span className="text-lg leading-none" aria-hidden>
                      {loc.flag}
                    </span>
                    <span className="min-w-0 flex-1 leading-snug">{loc.label}</span>
                    {active ? (
                      <ChevronRight className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
              <div className="mb-3 flex flex-wrap items-baseline gap-2">
                <h3 className="text-[15px] font-semibold text-foreground">
                  Receive from {location.receiveTitle}
                </h3>
                <span className="text-xl leading-none" aria-hidden>
                  {location.flag}
                </span>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Available
                  </p>
                  <p className="text-sm font-semibold tabular-nums text-foreground">
                    {location.available.toLocaleString("en-IN", { minimumFractionDigits: 2 })}{" "}
                    {location.localCurrency}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Pending
                  </p>
                  <p className="text-sm font-semibold tabular-nums text-foreground">
                    {location.pending.toLocaleString("en-IN", { minimumFractionDigits: 2 })}{" "}
                    {location.localCurrency}
                  </p>
                </div>
                <div className="col-span-2 rounded-lg border border-border bg-muted/30 px-3 py-2 sm:col-span-1">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Typical settlement
                  </p>
                  <p className="text-sm font-medium text-foreground">{location.estimatedSettlementDays}</p>
                </div>
              </div>

              <div className="mb-3 flex flex-wrap items-center gap-2">
                {showToggle ? (
                  <div className="inline-flex rounded-lg border border-border/70 bg-muted p-0.5">
                    <button
                      type="button"
                      onClick={() => setMode("local")}
                      className={cn(
                        "rounded-md px-3 py-1.5 text-[13px] font-semibold transition-all",
                        mode === "local"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {location.localCurrency}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("others")}
                      className={cn(
                        "rounded-md px-3 py-1.5 text-[13px] font-semibold transition-all",
                        mode === "others"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Other
                    </button>
                  </div>
                ) : (
                  <span className="text-[13px] font-medium text-muted-foreground">Other account</span>
                )}
              </div>

              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                {location.preferredRibbon && mode === "local" && (
                  <div
                    className="mb-3 inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold text-white"
                    style={{ background: "#059669" }}
                  >
                    {location.preferredRibbon}
                  </div>
                )}
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {activeTitle}
                </p>
                <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{activeSubtitle}</p>

                {mode === "others" && location.swiftWarning && (
                  <div
                    className="mt-3 flex gap-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-2 text-[12px] leading-snug dark:border-amber-900/40 dark:bg-amber-950/30"
                  >
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700 dark:text-amber-400" />
                    <p className="text-amber-950 dark:text-amber-100">{location.swiftWarning}</p>
                  </div>
                )}
                {mode === "local" && location.payerNote && (
                  <div className="mt-3 flex gap-2 rounded-md border border-border bg-muted/50 px-2.5 py-2 text-[12px] leading-snug">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <p className="text-foreground">{location.payerNote}</p>
                  </div>
                )}

                <dl className="mt-3 border-t border-border pt-1">
                  {mode === "local" && (
                    <BankDetailRow
                      label="Payment method"
                      value={location.paymentMethodLocal}
                      onCopy={() => {
                        void navigator.clipboard.writeText(location.paymentMethodLocal);
                        toast.success("Copied");
                      }}
                    />
                  )}
                  {activeRows.map((row) => (
                    <BankDetailRow
                      key={`${location.id}-${row.label}`}
                      label={row.label}
                      value={row.value}
                      onCopy={() => {
                        void navigator.clipboard.writeText(row.value);
                        toast.success(`${row.label} copied`);
                      }}
                    />
                  ))}
                </dl>
                <p className="mt-3 text-[11px] leading-snug text-muted-foreground">
                  Typical settlement: {location.estimatedSettlementDays}. FX ref{" "}
                  {formatDate(location.fxUpdatedAt)}.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-2 border-t border-border bg-muted/20 px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => copyAllDetails(rowsForCopy)}
              >
                Copy all details
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
