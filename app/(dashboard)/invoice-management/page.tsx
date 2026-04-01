"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, Receipt, DollarSign, Clock, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Shimmer } from "@/components/ui/skeleton";
import { cn, formatDate } from "@/lib/utils";
import { invoices } from "@/lib/mock-data";
import { toast } from "sonner";

type Invoice = typeof invoices[number];

const columns: Column<Invoice>[] = [
  {
    key: "number",
    header: "Invoice #",
    render: (row) => (
      <code className="text-xs font-mono font-semibold text-slate-700">{row.invoiceNumber}</code>
    ),
  },
  {
    key: "customer",
    header: "Customer",
    render: (row) => (
      <div>
        <p className="text-xs font-medium text-slate-800">{row.customerName}</p>
        <p className="text-[11px] text-slate-400">{row.email}</p>
      </div>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    render: (row) => {
      const symbol = row.currency === "USD" ? "$" : "₹";
      return (
        <div>
          <span className="font-semibold text-slate-900 tabular-nums">
            {symbol}{row.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
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
    key: "dueDate",
    header: "Due Date",
    render: (row) => {
      const isOverdue = row.status === "overdue";
      return (
        <span className={cn("text-xs", isOverdue ? "text-red-600 font-semibold" : "text-slate-500")}>
          {formatDate(row.dueDate, { day: "2-digit", month: "short", year: "2-digit" })}
        </span>
      );
    },
  },
  {
    key: "createdAt",
    header: "Created",
    render: (row) => (
      <span className="text-xs text-slate-500">
        {formatDate(row.createdAt, { day: "2-digit", month: "short", year: "2-digit" })}
      </span>
    ),
  },
  {
    key: "actions",
    header: "",
    render: (row) =>
      row.status === "draft" ? (
        <Button variant="primary" size="sm" onClick={() => toast.success("Invoice sent!")}>
          Send
        </Button>
      ) : row.status === "pending" || row.status === "overdue" ? (
        <Button variant="outline" size="sm" onClick={() => toast.success("Reminder sent!")}>
          Remind
        </Button>
      ) : null,
  },
];

export default function InvoiceManagementPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const handleCreate = async () => {
    setIsCreating(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsCreating(false);
    toast.success("Invoice created", { description: "INV-2026-005 has been saved as draft" });
  };

  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter((i) => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const overdue = invoices.filter((i) => i.status === "overdue").length;

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">
      <PageHeader
        title="Invoice Management"
        subtitle="Create, track and manage your invoices"
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            isLoading={isCreating}
            onClick={handleCreate}
          >
            New Invoice
          </Button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: DollarSign, iconColor: "text-green-600", iconBg: "bg-green-50", label: "Total Paid", value: isLoading ? null : `₹${totalPaid.toLocaleString("en-IN")}` },
          { icon: Clock, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Pending", value: isLoading ? null : `₹${totalPending.toLocaleString("en-IN")}` },
          { icon: AlertCircle, iconColor: "text-red-600", iconBg: "bg-red-50", label: "Overdue", value: isLoading ? null : overdue.toString() },
          { icon: Receipt, iconColor: "text-slate-600", iconBg: "bg-slate-100", label: "Total Invoices", value: isLoading ? null : invoices.length.toString() },
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
              {isLoading ? <Shimmer className="h-6 w-20 mt-0.5" /> : (
                <p className="text-lg font-bold text-slate-900">{s.value}</p>
              )}
            </div>
          );
        })}
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        isLoading={isLoading}
        skeletonRows={5}
        emptyTitle="No invoices yet"
        emptyDescription="Create your first invoice to start tracking payments"
        rowKey={(row) => row.id}
        pageSize={10}
        rowCta={{ label: "View invoice" }}
      />
    </div>
  );
}
