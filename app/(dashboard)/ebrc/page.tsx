"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Plus, FileText, Calendar, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Shimmer } from "@/components/ui/skeleton";
import { cn, formatDate } from "@/lib/utils";
import { ebrcEntries } from "@/lib/mock-data";
import { toast } from "sonner";

type EbrcEntry = typeof ebrcEntries[number];

const columns: Column<EbrcEntry>[] = [
  {
    key: "sbNumber",
    header: "SB Number",
    render: (row) => (
      <code className="text-xs font-mono font-semibold text-slate-700">{row.sbNumber}</code>
    ),
  },
  {
    key: "bankRef",
    header: "Bank Ref #",
    render: (row) => (
      <code className="text-[11px] font-mono text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
        {row.bankRefNumber}
      </code>
    ),
  },
  {
    key: "exporter",
    header: "Exporter",
    render: (row) => <span className="text-xs font-medium text-slate-700">{row.exporterName}</span>,
  },
  {
    key: "amount",
    header: "Amount",
    render: (row) => {
      const symbol = row.currency === "USD" ? "$" : row.currency === "EUR" ? "€" : row.currency === "GBP" ? "£" : "";
      return (
        <div>
          <span className="font-semibold text-slate-900 tabular-nums">
            {symbol}{row.amount.toLocaleString("en-IN")}
          </span>
          <span className="ml-1 text-[11px] text-slate-400">{row.currency}</span>
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
    key: "issueDate",
    header: "Issue Date",
    render: (row) => (
      row.issueDate ? (
        <span className="text-xs text-slate-500">
          {formatDate(row.issueDate, { day: "2-digit", month: "short", year: "2-digit" })}
        </span>
      ) : (
        <span className="text-xs text-slate-400 italic">—</span>
      )
    ),
  },
  {
    key: "expiryDate",
    header: "Expiry",
    render: (row) => (
      row.expiryDate ? (
        <span className="text-xs text-slate-500">
          {formatDate(row.expiryDate, { day: "2-digit", month: "short", year: "2-digit" })}
        </span>
      ) : (
        <span className="text-xs text-slate-400 italic">—</span>
      )
    ),
  },
];

export default function EbrcPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1100);
    return () => clearTimeout(t);
  }, []);

  const issued = ebrcEntries.filter((e) => e.status === "issued").length;
  const pending = ebrcEntries.filter((e) => e.status === "pending").length;

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">
      <PageHeader
        title="eBRC"
        subtitle="Electronic Bank Realisation Certificate management"
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => toast.success("New eBRC application opened")}
          >
            New eBRC
          </Button>
        }
      />

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <BadgeCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-blue-800">What is eBRC?</p>
          <p className="text-xs text-blue-700 mt-0.5">
            Electronic Bank Realisation Certificate (eBRC) is issued by banks to exporters as proof of foreign exchange realisation against export shipments. Required for DGFT benefits and export incentives.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: CheckCircle2, iconColor: "text-[#0047b0]", iconBg: "bg-[#eff4ff]", label: "Issued", value: isLoading ? null : issued.toString() },
          { icon: FileText, iconColor: "text-amber-600", iconBg: "bg-amber-50", label: "Pending", value: isLoading ? null : pending.toString() },
          { icon: Calendar, iconColor: "text-slate-600", iconBg: "bg-slate-100", label: "Total", value: isLoading ? null : ebrcEntries.length.toString() },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-card text-card-foreground rounded-xl border border-border px-4 py-3.5 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", s.iconBg)}>
                  <Icon className={cn("w-3.5 h-3.5", s.iconColor)} />
                </div>
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{s.label}</p>
              </div>
              {isLoading ? <Shimmer className="h-7 w-10 mt-0.5" /> : (
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              )}
            </div>
          );
        })}
      </div>

      <DataTable
        columns={columns}
        data={ebrcEntries}
        isLoading={isLoading}
        skeletonRows={4}
        emptyTitle="No eBRC entries"
        emptyDescription="Submit a new eBRC application to get started"
        rowKey={(row) => row.id}
        pageSize={10}
        rowCta={{ label: "View eBRC" }}
      />
    </div>
  );
}
