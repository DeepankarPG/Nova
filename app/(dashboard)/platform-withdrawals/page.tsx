"use client";

import { useEffect, useState } from "react";
import { ArrowDownToLine, Building2, CheckCircle2, Clock, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/shared/Button";
import { Shimmer } from "@/components/shared/ShimmerSkeleton";
import { cn, formatDate } from "@/lib/utils";
import { withdrawals } from "@/lib/mock-data";
import { toast } from "sonner";

type Withdrawal = typeof withdrawals[number];

const columns: Column<Withdrawal>[] = [
  {
    key: "id",
    header: "Withdrawal ID",
    render: (row) => (
      <code className="text-[11px] font-mono text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
        {row.id}
      </code>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    render: (row) => (
      <span className="font-semibold text-slate-900 tabular-nums">
        ₹{row.amount.toLocaleString("en-IN")}
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
      <div className="flex items-center gap-1.5 text-slate-600 text-xs">
        <Building2 className="w-3.5 h-3.5 text-slate-400" />
        {row.bankAccount}
      </div>
    ),
  },
  {
    key: "initiatedBy",
    header: "Initiated By",
    render: (row) => <span className="text-xs font-medium text-slate-700">{row.initiatedBy}</span>,
  },
  {
    key: "date",
    header: "Initiated At",
    render: (row) => (
      <span className="text-xs text-slate-500 whitespace-nowrap">{formatDate(row.date)}</span>
    ),
  },
  {
    key: "completedAt",
    header: "Completed At",
    render: (row) => (
      row.completedAt ? (
        <span className="text-xs text-slate-500 whitespace-nowrap">{formatDate(row.completedAt)}</span>
      ) : (
        <span className="text-xs text-slate-400 italic">Pending</span>
      )
    ),
  },
];

export default function PlatformWithdrawalsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1100);
    return () => clearTimeout(t);
  }, []);

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsWithdrawing(false);
    toast.success("Withdrawal initiated", {
      description: "₹1,00,000 transfer to HDFC ****4521 is in progress",
    });
  };

  const totalWithdrawn = withdrawals
    .filter((w) => w.status === "completed")
    .reduce((sum, w) => sum + w.amount, 0);

  const pendingWithdrawal = withdrawals
    .filter((w) => w.status === "processing")
    .reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">
      <PageHeader
        title="Platform Withdrawals"
        subtitle="Transfer your settled funds to your bank account"
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<ArrowDownToLine className="w-3.5 h-3.5" />}
            isLoading={isWithdrawing}
            onClick={handleWithdraw}
          >
            Withdraw Funds
          </Button>
        }
      />

      {/* Balance card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Available Balance</p>
            <p className="text-3xl font-bold tabular-nums">₹3,74,890.50</p>
            <p className="text-slate-400 text-xs mt-2">Ready to withdraw to your linked bank</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-xs mb-1">Bank Account</p>
            <p className="text-sm font-semibold">HDFC ****4521</p>
            <p className="text-slate-400 text-xs mt-0.5">Primary</p>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-5 pt-4 border-t border-white/10">
          <div>
            <p className="text-slate-400 text-[11px] uppercase tracking-wider">Total Withdrawn</p>
            <p className="text-white font-semibold tabular-nums">₹{(totalWithdrawn / 100000).toFixed(1)}L</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <p className="text-slate-400 text-[11px] uppercase tracking-wider">In Processing</p>
            <p className="text-white font-semibold tabular-nums">₹{pendingWithdrawal.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: CheckCircle2, iconColor: "text-green-600", iconBg: "bg-green-50", label: "Completed", value: isLoading ? null : withdrawals.filter((w) => w.status === "completed").length.toString() },
          { icon: Clock, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Processing", value: isLoading ? null : withdrawals.filter((w) => w.status === "processing").length.toString() },
          { icon: ArrowDownToLine, iconColor: "text-slate-600", iconBg: "bg-slate-100", label: "Total", value: isLoading ? null : withdrawals.length.toString() },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3.5 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", s.iconBg)}>
                  <Icon className={cn("w-3.5 h-3.5", s.iconColor)} />
                </div>
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{s.label}</p>
              </div>
              {isLoading ? (
                <Shimmer className="h-7 w-8" />
              ) : (
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              )}
            </div>
          );
        })}
      </div>

      <DataTable
        columns={columns}
        data={withdrawals}
        isLoading={isLoading}
        skeletonRows={5}
        emptyTitle="No withdrawals yet"
        emptyDescription="Your withdrawal history will appear here"
        rowKey={(row) => row.id}
        pageSize={10}
        rowCta={{ label: "View withdrawal" }}
      />
    </div>
  );
}
