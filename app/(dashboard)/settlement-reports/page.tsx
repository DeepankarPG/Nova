"use client";

import { useEffect, useState } from "react";
import { Download, TrendingUp, CheckCircle2, Clock, Banknote } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/shared/Button";
import { Shimmer } from "@/components/shared/ShimmerSkeleton";
import { cn, formatDate } from "@/lib/utils";
import { allSettlements } from "@/lib/mock-data";
import { toast } from "sonner";

type Settlement = typeof allSettlements[number];

const columns: Column<Settlement>[] = [
  {
    key: "id",
    header: "Settlement ID",
    render: (row) => (
      <code className="text-[13px] font-mono text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-md">
        {row.id}
      </code>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    render: (row) => (
      <span className="text-[13px] font-semibold text-foreground tabular-nums">
        ₹{row.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (row) => <StatusBadge status={row.status} size="sm" />,
  },
  {
    key: "bank",
    header: "Bank Account",
    render: (row) => (
      <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
        <Banknote className="w-3.5 h-3.5 text-muted-foreground" />
        {row.bankAccount}
      </div>
    ),
  },
  {
    key: "txns",
    header: "Transactions",
    render: (row) => (
      <span className="text-[13px] font-medium text-muted-foreground">{row.transactionCount} txns</span>
    ),
  },
  {
    key: "utr",
    header: "UTR Number",
    render: (row) => (
      <code className="text-[13px] font-mono text-muted-foreground">{row.utrNumber}</code>
    ),
  },
  {
    key: "date",
    header: "Date",
    render: (row) => (
      <span className="text-[13px] text-muted-foreground whitespace-nowrap">
        {formatDate(row.date, { year: "2-digit", month: "short", day: "2-digit" })}
      </span>
    ),
  },
];

export default function SettlementReportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsExporting(false);
    toast.success("Export ready", { description: "settlements.csv downloaded" });
  };

  const totalSettled = allSettlements
    .filter((s) => s.status === "settled")
    .reduce((sum, s) => sum + s.amount, 0);

  const pendingAmount = allSettlements
    .filter((s) => s.status === "processing")
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">
      <PageHeader
        title="Settlement Reports"
        subtitle="Daily settlement activity and bank transfers"
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            isLoading={isExporting}
            onClick={handleExport}
          >
            Export
          </Button>
        }
      />

      {/* Summary — same card style as dashboard StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { icon: CheckCircle2, iconColor: "text-emerald-500", iconBg: "bg-emerald-50", label: "Total Settled",      value: isLoading ? null : `₹${(totalSettled / 100000).toFixed(2)}L` },
          { icon: Clock,        iconColor: "text-blue-500",    iconBg: "bg-blue-50",    label: "Processing",         value: isLoading ? null : `₹${pendingAmount.toLocaleString("en-IN")}` },
          { icon: TrendingUp,   iconColor: "text-[#0061E3]",   iconBg: "bg-[#eff4ff]",  label: "Settlement Cycle",   value: isLoading ? null : "T+1 Daily" },
          { icon: Banknote,     iconColor: "text-gray-500",    iconBg: "bg-gray-100",   label: "Bank Account",       value: isLoading ? null : "HDFC ****4521" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-card text-card-foreground rounded-xl p-5 flex flex-col gap-3 border border-border shadow-sm">
              <div className="flex items-center gap-2">
                <Icon className={s.iconColor} style={{ width: 16, height: 16, opacity: 0.7 }} />
                <span className="text-[13px] font-normal text-muted-foreground">{s.label}</span>
              </div>
              {isLoading ? (
                <Shimmer className="h-8 w-32 rounded-md" />
              ) : (
                <p className="text-[1.75rem] font-bold text-foreground leading-none tracking-tight tabular-nums">
                  {s.value}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Settlement timeline indicator */}
      <div className="bg-card text-card-foreground rounded-xl px-6 py-5 border border-border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[15px] font-semibold text-foreground">Today&apos;s Settlement Cycle</h3>
          <span className="text-[12px] text-muted-foreground font-medium">Settles at 11:59 PM IST</span>
        </div>

        <div className="flex items-start">
          {[
            { label: "Transactions\nCaptured",      done: true  },
            { label: "Processing\nStarted",         done: true  },
            { label: "Bank Transfer\nInitiated",    done: true  },
            { label: "Settlement\nComplete",        done: false, step: 4 },
          ].map((s, i, arr) => {
            const isLast = i === arr.length - 1;
            return (
              <div key={s.label} className="flex items-start flex-1 min-w-0">
                {/* Step + connector */}
                <div className="flex flex-col items-center flex-1 min-w-0">
                  {/* Dot row */}
                  <div className="flex items-center w-full">
                    {/* Left connector */}
                    <div className={cn(
                      "flex-1 h-[2px] rounded-full",
                      i === 0 ? "invisible" : s.done ? "bg-primary" : "bg-border"
                    )} />

                    {/* Circle */}
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0 transition-all",
                      s.done
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-card text-muted-foreground border-2 border-border"
                    )}
                      style={s.done ? { boxShadow: "0 0 0 4px rgba(0,97,227,0.08)" } : {}}>
                      {s.done ? (
                        <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                          <path d="M1.5 5L5 8.5L11.5 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : s.step ?? i + 1}
                    </div>

                    {/* Right connector */}
                    <div className={cn(
                      "flex-1 h-[2px] rounded-full",
                      isLast ? "invisible" : s.done && arr[i + 1]?.done ? "bg-primary" : s.done ? "bg-primary" : "bg-border"
                    )} />
                  </div>

                  {/* Label */}
                  <p className="text-[11px] font-medium text-muted-foreground text-center mt-2.5 leading-snug whitespace-pre-line px-1">
                    {s.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={allSettlements}
        isLoading={isLoading}
        skeletonRows={6}
        emptyTitle="No settlements found"
        emptyDescription="Settlement reports will appear here once transactions are processed"
        rowKey={(row) => row.id}
        pageSize={10}
        rowCta={{ label: "View report" }}
      />
    </div>
  );
}
