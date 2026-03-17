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
      <code className="text-[13px] font-mono text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">
        {row.id}
      </code>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    render: (row) => (
      <span className="text-[13px] font-semibold text-gray-900 tabular-nums">
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
      <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
        <Banknote className="w-3.5 h-3.5 text-gray-400" />
        {row.bankAccount}
      </div>
    ),
  },
  {
    key: "txns",
    header: "Transactions",
    render: (row) => (
      <span className="text-[13px] font-medium text-gray-600">{row.transactionCount} txns</span>
    ),
  },
  {
    key: "utr",
    header: "UTR Number",
    render: (row) => (
      <code className="text-[13px] font-mono text-gray-500">{row.utrNumber}</code>
    ),
  },
  {
    key: "date",
    header: "Date",
    render: (row) => (
      <span className="text-[13px] text-gray-500 whitespace-nowrap">
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

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            icon: CheckCircle2,
            iconColor: "text-green-600",
            iconBg: "bg-green-50",
            label: "Total Settled",
            value: isLoading ? null : `₹${(totalSettled / 100000).toFixed(2)}L`,
          },
          {
            icon: Clock,
            iconColor: "text-blue-600",
            iconBg: "bg-blue-50",
            label: "Processing",
            value: isLoading ? null : `₹${pendingAmount.toLocaleString("en-IN")}`,
          },
          {
            icon: TrendingUp,
            iconColor: "text-[#0047b0]",
            iconBg: "bg-[#eff4ff]",
            label: "Settlement Cycle",
            value: isLoading ? null : "T+1 Daily",
          },
          {
            icon: Banknote,
            iconColor: "text-slate-600",
            iconBg: "bg-slate-100",
            label: "Bank Account",
            value: isLoading ? null : "HDFC ****4521",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3.5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", s.iconBg)}>
                  <Icon className={cn("w-3.5 h-3.5", s.iconColor)} />
                </div>
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{s.label}</p>
              </div>
              {isLoading ? (
                <Shimmer className="h-5 w-24" />
              ) : (
                <p className="text-base font-bold text-slate-900 tabular-nums">{s.value}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Settlement timeline indicator */}
      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-800">Today&apos;s Settlement Cycle</h3>
          <span className="text-xs text-slate-500">Settles at 11:59 PM IST</span>
        </div>
        <div className="flex items-center gap-0">
          {[
            { label: "Transactions Captured", done: true },
            { label: "Processing Started", done: true },
            { label: "Bank Transfer Initiated", done: true },
            { label: "Settlement Complete", done: false },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                    step.done
                      ? "bg-[#eff4ff]0 text-white"
                      : "bg-slate-100 text-slate-400 border-2 border-slate-200"
                  )}
                >
                  {step.done ? "✓" : i + 1}
                </div>
                <p className="text-[10px] text-slate-500 text-center mt-1.5 leading-tight max-w-[80px]">
                  {step.label}
                </p>
              </div>
              {i < arr.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 -mt-5",
                    step.done ? "bg-[#60a5fa]" : "bg-slate-200"
                  )}
                />
              )}
            </div>
          ))}
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
