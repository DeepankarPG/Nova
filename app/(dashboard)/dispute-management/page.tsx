"use client";

import { useEffect, useState, useMemo } from "react";
import { AlertTriangle, Clock, ShieldCheck, ShieldX, FileSearch } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/shared/Button";
import { Shimmer } from "@/components/shared/ShimmerSkeleton";
import { cn, formatDate, truncate } from "@/lib/utils";
import { disputes } from "@/lib/mock-data";

type Dispute = typeof disputes[number];

const statusFilters = ["All", "open", "under_review", "won", "lost"];

const columns: Column<Dispute>[] = [
  {
    key: "id",
    header: "Dispute ID",
    render: (row) => (
      <code className="text-[13px] font-mono text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">
        {row.id}
      </code>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    render: (row) => {
      const symbol = row.currency === "EUR" ? "€" : row.currency === "GBP" ? "£" : "₹";
      return (
        <div>
          <span className="text-[13px] font-semibold text-gray-900 tabular-nums">
            {symbol}{row.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
          <span className="ml-1 text-[11px] text-gray-400">{row.currency}</span>
        </div>
      );
    },
  },
  {
    key: "status",
    header: "Status",
    render: (row) => <StatusBadge status={row.status} size="sm" />,
  },
  {
    key: "reason",
    header: "Reason",
    render: (row) => (
      <span className="text-[13px] text-gray-600">{row.reason}</span>
    ),
  },
  {
    key: "customer",
    header: "Customer",
    render: (row) => (
      <div>
        <p className="text-[13px] font-medium text-gray-800">{row.customerName}</p>
        <p className="text-[12px] text-gray-400">{truncate(row.email, 22)}</p>
      </div>
    ),
  },
  {
    key: "dueDate",
    header: "Response Due",
    render: (row) => {
      const due = new Date(row.dueDate);
      const now = new Date();
      const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isUrgent = daysLeft <= 3 && row.status === "open";
      return (
        <div className={cn("text-[13px]", isUrgent ? "text-red-600 font-semibold" : "text-gray-500")}>
          {formatDate(row.dueDate, { day: "2-digit", month: "short", year: "2-digit" })}
          {isUrgent && <span className="ml-1 text-[11px] bg-red-50 text-red-600 border border-red-200 px-1 py-0.5 rounded">{daysLeft}d left</span>}
        </div>
      );
    },
  },
  {
    key: "createdAt",
    header: "Opened",
    render: (row) => (
      <span className="text-[13px] text-gray-500 whitespace-nowrap">{formatDate(row.createdAt)}</span>
    ),
  },
  {
    key: "actions",
    header: "",
    render: (row) => (
      row.status === "open" || row.status === "under_review" ? (
        <Button variant="outline" size="sm">
          Respond
        </Button>
      ) : null
    ),
  },
];

export default function DisputeManagementPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1100);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    if (activeFilter === "All") return disputes;
    return disputes.filter((d) => d.status === activeFilter);
  }, [activeFilter]);

  const stats = {
    open: disputes.filter((d) => d.status === "open").length,
    under_review: disputes.filter((d) => d.status === "under_review").length,
    won: disputes.filter((d) => d.status === "won").length,
    total: disputes.length,
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">
      <PageHeader
        title="Dispute Management"
        subtitle="Manage chargebacks and payment disputes"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: AlertTriangle, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Open Disputes", value: stats.open },
          { icon: FileSearch, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Under Review", value: stats.under_review },
          { icon: ShieldCheck, iconColor: "text-green-600", iconBg: "bg-green-50", label: "Won", value: stats.won },
          { icon: Clock, iconColor: "text-slate-500", iconBg: "bg-slate-100", label: "Total", value: stats.total },
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
                <Shimmer className="h-6 w-10" />
              ) : (
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="text-xs text-amber-700">
          <span className="font-semibold">Action required:</span> You have {stats.open} open dispute{stats.open !== 1 ? "s" : ""} that need{stats.open === 1 ? "s" : ""} a response. Chargebacks not responded to within the deadline are automatically lost.
        </p>
      </div>

      {/* Status filters */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {statusFilters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
              activeFilter === f
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            )}
          >
            {f === "All" ? "All Disputes" : f === "under_review" ? "Under Review" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        skeletonRows={4}
        emptyTitle="No disputes"
        emptyDescription="You have no disputes matching the selected filter"
        rowKey={(row) => row.id}
        pageSize={10}
        rowCta={{ label: "View dispute" }}
      />
    </div>
  );
}
