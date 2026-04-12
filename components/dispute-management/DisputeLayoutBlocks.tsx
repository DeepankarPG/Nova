"use client";

import { AlertTriangle, BarChart3, Clock, FileSearch, Plus, Share2, ShieldCheck } from "lucide-react";
import { Shimmer } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DisputeStats = {
  open: number;
  under_review: number;
  won: number;
  total: number;
};

export const DISPUTE_PRIMARY_TABS = [
  { key: "open", label: "Needs response" },
  { key: "under_review", label: "In review" },
  { key: "all", label: "All disputes" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
] as const;

export type DisputePrimaryTabKey = (typeof DISPUTE_PRIMARY_TABS)[number]["key"];

export function DisputeStatsGrid({
  stats,
  isLoading = false,
}: {
  stats: DisputeStats;
  isLoading?: boolean;
}) {
  const blocks = [
    {
      icon: AlertTriangle,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-50",
      label: "Open Disputes",
      value: stats.open,
    },
    {
      icon: FileSearch,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      label: "Under Review",
      value: stats.under_review,
    },
    {
      icon: ShieldCheck,
      iconColor: "text-green-600",
      iconBg: "bg-green-50",
      label: "Won",
      value: stats.won,
    },
    {
      icon: Clock,
      iconColor: "text-slate-500",
      iconBg: "bg-slate-100",
      label: "Total",
      value: stats.total,
    },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {blocks.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-card px-4 py-3.5 text-card-foreground shadow-sm"
          >
            <div className="mb-1.5 flex items-center gap-2">
              <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", s.iconBg)}>
                <Icon className={cn("h-3.5 w-3.5", s.iconColor)} />
              </div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                {s.label}
              </p>
            </div>
            {isLoading ? (
              <Shimmer className="h-6 w-10" />
            ) : (
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function DisputeActionBanner({ stats }: { stats: DisputeStats }) {
  const n = stats.open;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600" />
      <p className="text-xs text-amber-700">
        <span className="font-semibold">Action required:</span> You have {n} open dispute
        {n !== 1 ? "s" : ""} that need{n === 1 ? "s" : ""} a response. Chargebacks not responded to
        within the deadline are automatically lost.
      </p>
    </div>
  );
}

export function DisputePrimaryTabs({
  activeFilter,
  onChange,
  readOnly = false,
}: {
  activeFilter: DisputePrimaryTabKey;
  onChange?: (key: DisputePrimaryTabKey) => void;
  readOnly?: boolean;
}) {
  return (
    <div
      role="tablist"
      aria-label="Dispute filters"
      className={cn("flex flex-wrap gap-2", readOnly && "pointer-events-none opacity-90")}
    >
      {DISPUTE_PRIMARY_TABS.map((tab) => {
        const active = activeFilter === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={readOnly}
            onClick={() => onChange?.(tab.key)}
            className={cn(
              "rounded-xl border px-4 py-2 text-[13px] font-medium transition-colors",
              active
                ? "border-primary bg-primary/[0.07] text-foreground shadow-[inset_0_0_0_1px_var(--color-primary)] dark:bg-primary/15"
                : "border-transparent bg-muted/50 text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

const ADVANCED_FILTER_CHIPS = [
  "Reason",
  "Status",
  "Amount",
  "Disputed date",
  "Evidence due by",
] as const;

export function DisputeAdvancedFiltersRow() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {ADVANCED_FILTER_CHIPS.map((label) => (
          <button
            key={label}
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border bg-card px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:border-muted-foreground/40 hover:bg-muted hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            {label}
          </button>
        ))}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button type="button" variant="outline" size="md" leftIcon={<Share2 className="h-4 w-4" aria-hidden />}>
          Export
        </Button>
        <Button
          type="button"
          variant="outline"
          size="md"
          leftIcon={<BarChart3 className="h-4 w-4" aria-hidden />}
        >
          Analyse
        </Button>
      </div>
    </div>
  );
}
