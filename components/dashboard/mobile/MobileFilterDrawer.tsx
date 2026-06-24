"use client";

import { useState } from "react";
import { Wallet, Landmark, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Shared types (imported by MobileTransactions and page.tsx) ─────── */
export type FilterCat  = "status" | "datetime" | "details" | "amount" | "country";
export type DatePreset = "today" | "7d" | "30d" | "3m" | "custom";

export type FilterState = {
  statuses: Set<string>;    // TxnStatus values
  datePreset: DatePreset | null;
  dateFrom: string;
  dateTo: string;
  methods: Set<string>;     // paymentMethod values
  minAmount: string;
  maxAmount: string;
  country: string;
};

export function emptyFilters(): FilterState {
  return { statuses: new Set(), datePreset: null, dateFrom: "", dateTo: "", methods: new Set(), minAmount: "", maxAmount: "", country: "" };
}

export function cloneFilters(f: FilterState): FilterState {
  return { ...f, statuses: new Set(f.statuses), methods: new Set(f.methods) };
}

export function hasAnyFilter(f: FilterState): boolean {
  return (
    f.statuses.size > 0 || f.datePreset !== null || f.methods.size > 0 ||
    f.minAmount !== "" || f.maxAmount !== "" || f.country !== ""
  );
}

/* ── Internal constants ─────────────────────────────────────────────── */
const FILTER_CATS: { id: FilterCat; label: string }[] = [
  { id: "status",   label: "Status"              },
  { id: "datetime", label: "Date and time"       },
  { id: "details",  label: "Payment Method" },
  { id: "amount",   label: "Amount"              },
  { id: "country",  label: "Country"              },
];

const STATUS_OPTS = [
  { id: "success",  label: "Completed", color: "text-emerald-700", bg: "bg-emerald-50" },
  { id: "pending",  label: "Pending",   color: "text-amber-700",   bg: "bg-amber-50"   },
  { id: "failed",   label: "Failed",    color: "text-red-700",     bg: "bg-red-50"     },
  { id: "refunded", label: "Refunded",  color: "text-red-700",     bg: "bg-red-50"     },
];

const DATE_PRESETS: { id: DatePreset; label: string }[] = [
  { id: "today",  label: "Today"         },
  { id: "7d",     label: "Last 7 days"   },
  { id: "30d",    label: "Last 30 days"  },
  { id: "3m",     label: "Last 3 months" },
  { id: "custom", label: "Custom range"  },
];

const COUNTRY_OPTS = [
  { id: "IN", label: "India",          flag: "🇮🇳", currency: "INR" },
  { id: "US", label: "United States",  flag: "🇺🇸", currency: "USD" },
  { id: "GB", label: "United Kingdom", flag: "🇬🇧", currency: "GBP" },
  { id: "EU", label: "Europe",         flag: "🇪🇺", currency: "EUR" },
  { id: "SG", label: "Singapore",      flag: "🇸🇬", currency: "SGD" },
  { id: "AE", label: "UAE",            flag: "🇦🇪", currency: "AED" },
  { id: "AU", label: "Australia",      flag: "🇦🇺", currency: "AUD" },
  { id: "CA", label: "Canada",         flag: "🇨🇦", currency: "CAD" },
  { id: "JP", label: "Japan",          flag: "🇯🇵", currency: "JPY" },
  { id: "CN", label: "China",          flag: "🇨🇳", currency: "CNY" },
];

const METHOD_OPTS = [
  { id: "upi",        label: "UPI",         icon: <Wallet     className="h-[15px] w-[15px] shrink-0" strokeWidth={1.75} /> },
  { id: "card",       label: "Card",        icon: <CreditCard className="h-[15px] w-[15px] shrink-0" strokeWidth={1.75} /> },
  { id: "netbanking", label: "Net Banking", icon: <Landmark   className="h-[15px] w-[15px] shrink-0" strokeWidth={1.75} /> },
];

/* ── Sub-components ─────────────────────────────────────────────────── */
function CheckIcon({ checked }: { checked: boolean }) {
  return (
    <span className={cn(
      "h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
      checked ? "bg-primary border-primary" : "border-border"
    )}>
      {checked && (
        <svg viewBox="0 0 10 8" className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1 4 3.5 6.5 9 1" />
        </svg>
      )}
    </span>
  );
}

function RadioIcon({ selected }: { selected: boolean }) {
  return (
    <span className={cn(
      "h-[18px] w-[18px] rounded-full border-2 flex items-center justify-center shrink-0",
      selected ? "border-primary" : "border-border"
    )}>
      {selected && <span className="h-[8px] w-[8px] rounded-full bg-primary block" />}
    </span>
  );
}

/* ── Helper ─────────────────────────────────────────────────────────── */
function catHasFilter(f: FilterState, cat: FilterCat): boolean {
  switch (cat) {
    case "status":   return f.statuses.size > 0;
    case "datetime": return f.datePreset !== null;
    case "details":  return f.methods.size > 0;
    case "amount":   return f.minAmount !== "" || f.maxAmount !== "";
    case "country":  return f.country !== "";
  }
}

/* ── Component ──────────────────────────────────────────────────────── */
export function MobileFilterDrawer({
  initialFilters,
  onApply,
}: {
  initialFilters: FilterState;
  onApply: (filters: FilterState) => void;
}) {
  const [activeCategory, setActiveCategory] = useState<FilterCat>("status");
  const [draft, setDraft] = useState<FilterState>(() => cloneFilters(initialFilters));

  const resetDraft = () => setDraft(emptyFilters());

  const toggleStatus = (s: string) =>
    setDraft(prev => {
      const statuses = new Set(prev.statuses);
      if (statuses.has(s)) statuses.delete(s); else statuses.add(s);
      return { ...prev, statuses };
    });

  const toggleMethod = (m: string) =>
    setDraft(prev => {
      const methods = new Set(prev.methods);
      if (methods.has(m)) methods.delete(m); else methods.add(m);
      return { ...prev, methods };
    });

  /* ── Right-panel content ─────────────────────────────────────────── */
  const renderCategoryOptions = () => {
    switch (activeCategory) {
      case "status":
        return (
          <div className="divide-y divide-border/50">
            {STATUS_OPTS.map(s => {
              const checked = draft.statuses.has(s.id);
              return (
                <button key={s.id} type="button" onClick={() => toggleStatus(s.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-muted/20">
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold", s.bg, s.color)}>
                    {s.label}
                  </span>
                  <span className="flex-1" />
                  <CheckIcon checked={checked} />
                </button>
              );
            })}
          </div>
        );

      case "datetime":
        return (
          <div>
            <div className="divide-y divide-border/50">
              {DATE_PRESETS.map(p => {
                const selected = draft.datePreset === p.id;
                return (
                  <button key={p.id} type="button"
                    onClick={() => setDraft(prev => ({ ...prev, datePreset: p.id }))}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left active:bg-muted/20">
                    <span className={cn("text-[13.5px]", selected ? "font-semibold text-foreground" : "text-muted-foreground")}>
                      {p.label}
                    </span>
                    <RadioIcon selected={selected} />
                  </button>
                );
              })}
            </div>
            {draft.datePreset === "custom" && (
              <div className="px-4 pt-3 pb-4 space-y-3 border-t border-border/50">
                <div>
                  <p className="text-[11.5px] font-medium text-muted-foreground mb-1.5">From</p>
                  <input type="date" value={draft.dateFrom}
                    onChange={e => setDraft(prev => ({ ...prev, dateFrom: e.target.value }))}
                    className="w-full rounded-xl border border-border px-3.5 py-2.5 text-[13px] text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <p className="text-[11.5px] font-medium text-muted-foreground mb-1.5">To</p>
                  <input type="date" value={draft.dateTo}
                    onChange={e => setDraft(prev => ({ ...prev, dateTo: e.target.value }))}
                    className="w-full rounded-xl border border-border px-3.5 py-2.5 text-[13px] text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
            )}
          </div>
        );

      case "details":
        return (
          <div className="divide-y divide-border/50">
            {METHOD_OPTS.map(mo => {
              const checked = draft.methods.has(mo.id);
              return (
                <button key={mo.id} type="button" onClick={() => toggleMethod(mo.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-muted/20">
                  <span className={cn(checked ? "text-primary" : "text-muted-foreground")}>
                    {mo.icon}
                  </span>
                  <span className={cn("flex-1 text-[13.5px]", checked ? "font-semibold text-foreground" : "text-muted-foreground")}>
                    {mo.label}
                  </span>
                  <CheckIcon checked={checked} />
                </button>
              );
            })}
          </div>
        );

      case "amount":
        return (
          <div className="px-4 pt-4 pb-4 space-y-3">
            <p className="text-[12px] font-medium text-muted-foreground">Filter by amount range (INR)</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center rounded-xl border border-border bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                <span className="pl-3 pr-1 text-[13px] text-muted-foreground shrink-0">₹</span>
                <input type="number" placeholder="Min" value={draft.minAmount}
                  onChange={e => setDraft(prev => ({ ...prev, minAmount: e.target.value }))}
                  className="flex-1 py-3 pr-3 text-[13.5px] text-foreground bg-transparent focus:outline-none min-w-0" />
              </div>
              <span className="text-[13px] text-muted-foreground shrink-0 select-none">to</span>
              <div className="flex-1 flex items-center rounded-xl border border-border bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                <span className="pl-3 pr-1 text-[13px] text-muted-foreground shrink-0">₹</span>
                <input type="number" placeholder="Max" value={draft.maxAmount}
                  onChange={e => setDraft(prev => ({ ...prev, maxAmount: e.target.value }))}
                  className="flex-1 py-3 pr-3 text-[13.5px] text-foreground bg-transparent focus:outline-none min-w-0" />
              </div>
            </div>
          </div>
        );

      case "country":
        return (
          <div className="divide-y divide-border/50">
            {COUNTRY_OPTS.map(c => {
              const selected = draft.country === c.currency;
              return (
                <button key={c.id} type="button"
                  onClick={() => setDraft(prev => ({ ...prev, country: selected ? "" : c.currency }))}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left active:bg-muted/20">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className="text-[18px] leading-none shrink-0">{c.flag}</span>
                    <span className={cn("text-[13.5px] truncate", selected ? "font-semibold text-foreground" : "text-muted-foreground")}>
                      {c.label}
                    </span>
                    <span className="text-[12px] text-muted-foreground shrink-0">({c.currency})</span>
                  </div>
                  <RadioIcon selected={selected} />
                </button>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <>
      {/* Drag handle */}
      <div className="flex justify-center pt-3 shrink-0">
        <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/50 shrink-0">
        <h3 className="text-[15px] font-bold text-foreground">Filters</h3>
        <button type="button" onClick={resetDraft}
          className="text-[14px] font-semibold text-primary active:opacity-60 transition-opacity">
          Reset
        </button>
      </div>

      {/* Two-panel body */}
      <div className="flex flex-1 min-h-0">

        {/* Left panel — categories */}
        <div className="w-[35%] shrink-0 bg-muted/40 border-r border-border/40 overflow-y-auto">
          {FILTER_CATS.map(cat => {
            const active = cat.id === activeCategory;
            const hasFilter = catHasFilter(draft, cat.id);
            return (
              <button key={cat.id} type="button" onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "relative w-full flex items-center justify-between px-3.5 py-3.5 text-left",
                  active ? "bg-background" : ""
                )}>
                {active && (
                  <span className="absolute left-0 top-0 bottom-0 w-[2.5px] bg-primary rounded-r-full" />
                )}
                <span className={cn(
                  "text-[12.5px] leading-snug pr-1",
                  active ? "font-semibold text-foreground" : "font-normal text-muted-foreground"
                )}>
                  {cat.label}
                </span>
                {hasFilter && (
                  <span className="h-[5px] w-[5px] rounded-full bg-primary shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right panel — options */}
        <div className="flex-1 overflow-y-auto bg-background">
          {renderCategoryOptions()}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-border/50 px-4 py-3">
        <button type="button" onClick={() => onApply(cloneFilters(draft))}
          className="w-full py-3.5 rounded-2xl bg-primary text-white text-[15px] font-bold active:scale-[0.98] transition-all">
          Apply filters
        </button>
      </div>
    </>
  );
}
