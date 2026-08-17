"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Clock, Columns, Download, GripVertical, Plus, Search, Upload, X } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn, formatDate } from "@/lib/utils";

export type PaymentPageTransactionStatus = "sent_for_review" | "invoice_pending" | "settled";

export type PaymentPageTransaction = {
  id: string;
  amount: number;
  currency: string;
  countryName: string;
  countryFlagIso2: string;
  remitterName: string;
  createdAt: string; // ISO datetime
  status: PaymentPageTransactionStatus;
};

const STATUS_TABS: { id: "all" | PaymentPageTransactionStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "sent_for_review", label: "Sent for Review" },
  { id: "invoice_pending", label: "Invoice Pending" },
  { id: "settled", label: "Settled" },
];

const STATUS_OPTIONS: { id: PaymentPageTransactionStatus; label: string }[] = [
  { id: "sent_for_review", label: "Sent for Review" },
  { id: "invoice_pending", label: "Invoice Pending" },
  { id: "settled", label: "Settled" },
];

function currencySymbol(currency: string) {
  if (currency === "USD") return "$";
  if (currency === "CAD") return "C$";
  if (currency === "EUR") return "€";
  if (currency === "GBP") return "£";
  return "₹";
}

/** "Sent for Review" and "Invoice Pending" aren't in the shared StatusBadge config with the
 * exact amber/clock look this table needs, so they render as local pills; "Settled" gets its
 * own matching green pill too, so all three share one visual language. */
function SettlementStatusBadge({ status }: { status: PaymentPageTransactionStatus }) {
  if (status === "settled") {
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-emerald-600/10 bg-emerald-500/10 px-2.5 py-[3px] text-[11.5px] font-medium text-emerald-800 dark:border-emerald-400/70 dark:bg-emerald-500/35 dark:text-emerald-50">
        Settled
        <Check width={11} height={11} strokeWidth={2.5} style={{ flexShrink: 0 }} />
      </span>
    );
  }
  const label = status === "sent_for_review" ? "Sent for Review" : "Invoice Pending";
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-amber-600/10 bg-amber-500/10 px-2.5 py-[3px] text-[11.5px] font-medium text-amber-900 dark:border-amber-400/70 dark:bg-amber-500/35 dark:text-amber-50">
      {label}
      <Clock width={11} height={11} strokeWidth={2} style={{ flexShrink: 0 }} />
    </span>
  );
}

type ColumnKey = "amount" | "status" | "createdAt" | "country" | "remitterName" | "actions";
const DEFAULT_COLUMN_ORDER: ColumnKey[] = ["amount", "status", "createdAt", "country", "remitterName", "actions"];
const COLUMN_LABELS: Record<ColumnKey, string> = {
  amount: "Amount",
  status: "Settlement Status",
  createdAt: "Date & Time",
  country: "Country",
  remitterName: "Remitter Name",
  actions: "Actions",
};

type AmountRange = { min: string; max: string };
type DateRange = { from: string; to: string };

/** Dashed "+ Label" chip that becomes a filled chip with a clear (x) button once a value is set. */
function FilterChip({
  label,
  active,
  onClear,
  children,
}: {
  label: string;
  active: boolean;
  onClear: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-medium transition-colors",
            active
              ? "border-primary/30 bg-primary/5 text-primary"
              : "border-dashed border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
          )}
        >
          {!active && <Plus className="h-3 w-3" />}
          {label}
          {active && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="ml-0.5 rounded-full p-0.5 hover:bg-primary/10"
              aria-label={`Clear ${label} filter`}
            >
              <X className="h-3 w-3" />
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-3">
        {children}
      </PopoverContent>
    </Popover>
  );
}

export function PaymentPageTransactionsSection({
  transactions,
}: {
  transactions: PaymentPageTransaction[];
}) {
  const [activeTab, setActiveTab] = useState<"all" | PaymentPageTransactionStatus>("all");
  const [search, setSearch] = useState("");

  const [dateRange, setDateRange] = useState<DateRange>({ from: "", to: "" });
  const [amountRange, setAmountRange] = useState<AmountRange>({ min: "", max: "" });
  const [statusMulti, setStatusMulti] = useState<Set<PaymentPageTransactionStatus>>(new Set());
  const [currencyMulti, setCurrencyMulti] = useState<Set<string>>(new Set());

  const [columnOrder, setColumnOrder] = useState<ColumnKey[]>(DEFAULT_COLUMN_ORDER);
  const [reorderOpen, setReorderOpen] = useState(false);
  const dragCol = useRef<ColumnKey | null>(null);

  const availableCurrencies = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.currency))).sort(),
    [transactions]
  );

  const totalPayments = transactions.length;
  const totalRevenue = transactions
    .filter((t) => t.status === "settled")
    .reduce((sum, t) => sum + t.amount, 0);
  const revenueCurrency = transactions[0]?.currency ?? "INR";

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (activeTab !== "all" && t.status !== activeTab) return false;
      if (search && !t.id.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusMulti.size > 0 && !statusMulti.has(t.status)) return false;
      if (currencyMulti.size > 0 && !currencyMulti.has(t.currency)) return false;
      if (dateRange.from && t.createdAt.slice(0, 10) < dateRange.from) return false;
      if (dateRange.to && t.createdAt.slice(0, 10) > dateRange.to) return false;
      if (amountRange.min && t.amount < Number(amountRange.min)) return false;
      if (amountRange.max && t.amount > Number(amountRange.max)) return false;
      return true;
    });
  }, [transactions, activeTab, search, statusMulti, currencyMulti, dateRange, amountRange]);

  const toggleSetValue = <T,>(set: Set<T>, value: T, setter: (next: Set<T>) => void) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  };

  const columnDefs: Record<ColumnKey, Column<PaymentPageTransaction>> = {
    amount: {
      key: "amount",
      header: "Amount",
      render: (row) => (
        <span className="tabular-nums">
          <span className="text-[14px] font-bold text-foreground">
            {currencySymbol(row.currency)}
            {row.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>{" "}
          <span className="text-[11px] text-muted-foreground">{row.currency}</span>
        </span>
      ),
    },
    status: {
      key: "status",
      header: "Settlement Status",
      render: (row) => <SettlementStatusBadge status={row.status} />,
    },
    createdAt: {
      key: "createdAt",
      header: "Date & Time",
      render: (row) => formatDate(row.createdAt, { hour: "2-digit", minute: "2-digit" }),
    },
    country: {
      key: "country",
      header: "Country",
      render: (row) => (
        <span className="flex items-center gap-2">
          <img
            src={`https://flagcdn.com/w40/${row.countryFlagIso2}.png`}
            alt=""
            className="h-3.5 w-5 shrink-0 rounded-sm object-cover"
          />
          {row.countryName}
        </span>
      ),
    },
    remitterName: { key: "remitterName", header: "Remitter Name", render: (row) => row.remitterName || "-" },
    actions: {
      key: "actions",
      header: "Actions",
      render: (row) =>
        row.status === "invoice_pending" ? (
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-medium text-foreground hover:bg-muted/50"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload Invoice
          </button>
        ) : null,
    },
  };

  const columns: Column<PaymentPageTransaction>[] = columnOrder.map((key) => columnDefs[key]);

  const moveColumn = (from: ColumnKey, to: ColumnKey) => {
    if (from === to) return;
    setColumnOrder((prev) => {
      const next = [...prev];
      const fromIdx = next.indexOf(from);
      const toIdx = next.indexOf(to);
      next.splice(fromIdx, 1);
      next.splice(toIdx, 0, from);
      return next;
    });
  };

  const dateActive = !!dateRange.from || !!dateRange.to;
  const amountActive = !!amountRange.min || !!amountRange.max;
  const statusActive = statusMulti.size > 0;
  const currencyActive = currencyMulti.size > 0;

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4">
        <div className="flex items-center gap-4">
          <h2 className="text-[16px] font-bold text-foreground">Transactions</h2>
          <span className="h-4 w-px bg-border" />
          <span className="text-[13px] text-muted-foreground">
            Total Payments <span className="font-semibold text-foreground">{totalPayments}</span>
          </span>
          <span className="text-[13px] text-muted-foreground">
            Total revenue{" "}
            <span className="font-semibold text-foreground">
              {currencySymbol(revenueCurrency)}
              {totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-5 border-b border-border px-5">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative pb-2.5 text-[13.5px] font-medium transition-colors",
              activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {activeTab === tab.id && <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-8 items-center gap-1.5 rounded-full border border-border px-3">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Payment ID"
              className="w-36 bg-transparent text-[12.5px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          <FilterChip
            label={dateActive ? `${dateRange.from || "…"} → ${dateRange.to || "…"}` : "Date"}
            active={dateActive}
            onClear={() => setDateRange({ from: "", to: "" })}
          >
            <p className="mb-2 text-[12px] font-semibold text-foreground">Date range</p>
            <div className="space-y-2">
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange((r) => ({ ...r, from: e.target.value }))}
                className="h-9 text-[13px]"
              />
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange((r) => ({ ...r, to: e.target.value }))}
                className="h-9 text-[13px]"
              />
            </div>
          </FilterChip>

          <FilterChip
            label={amountActive ? `${amountRange.min || "0"} - ${amountRange.max || "∞"}` : "Amount"}
            active={amountActive}
            onClear={() => setAmountRange({ min: "", max: "" })}
          >
            <p className="mb-2 text-[12px] font-semibold text-foreground">Amount range</p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={amountRange.min}
                onChange={(e) => setAmountRange((r) => ({ ...r, min: e.target.value }))}
                className="h-9 text-[13px]"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={amountRange.max}
                onChange={(e) => setAmountRange((r) => ({ ...r, max: e.target.value }))}
                className="h-9 text-[13px]"
              />
            </div>
          </FilterChip>

          <FilterChip
            label={statusActive ? `Status (${statusMulti.size})` : "Status"}
            active={statusActive}
            onClear={() => setStatusMulti(new Set())}
          >
            <p className="mb-2 text-[12px] font-semibold text-foreground">Settlement status</p>
            <div className="space-y-1.5">
              {STATUS_OPTIONS.map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 text-[13px] text-foreground">
                  <input
                    type="checkbox"
                    checked={statusMulti.has(opt.id)}
                    onChange={() => toggleSetValue(statusMulti, opt.id, setStatusMulti)}
                    className="rounded border-border"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </FilterChip>

          <FilterChip
            label={currencyActive ? `Currency (${currencyMulti.size})` : "Currency"}
            active={currencyActive}
            onClear={() => setCurrencyMulti(new Set())}
          >
            <p className="mb-2 text-[12px] font-semibold text-foreground">Currency</p>
            <div className="space-y-1.5">
              {availableCurrencies.length === 0 ? (
                <p className="text-[12px] text-muted-foreground">No transactions yet</p>
              ) : (
                availableCurrencies.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-[13px] text-foreground">
                    <input
                      type="checkbox"
                      checked={currencyMulti.has(c)}
                      onChange={() => toggleSetValue(currencyMulti, c, setCurrencyMulti)}
                      className="rounded border-border"
                    />
                    {c}
                  </label>
                ))
              )}
            </div>
          </FilterChip>
        </div>

        <div className="flex items-center gap-2">
          <Popover open={reorderOpen} onOpenChange={setReorderOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-[12.5px] font-medium text-foreground hover:bg-muted/50"
              >
                <Columns className="h-3.5 w-3.5" />
                Reorder Columns
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-1.5">
              <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Drag to reorder
              </p>
              {columnOrder.map((key) => (
                <div
                  key={key}
                  draggable
                  onDragStart={() => {
                    dragCol.current = key;
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragCol.current) moveColumn(dragCol.current, key);
                    dragCol.current = null;
                  }}
                  className="flex cursor-grab items-center gap-2 rounded-md px-2.5 py-2 text-[13px] text-foreground hover:bg-muted/50 active:cursor-grabbing"
                >
                  <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                  {COLUMN_LABELS[key]}
                </div>
              ))}
            </PopoverContent>
          </Popover>

          <button
            type="button"
            className="flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-[12.5px] font-medium text-foreground hover:bg-muted/50"
          >
            <Download className="h-3.5 w-3.5" />
            Report
          </button>
        </div>
      </div>

      <div className="px-5 pb-5">
        <DataTable
          columns={columns}
          data={filtered}
          rowKey={(row) => row.id}
          density="compact"
          headerStyle="minimal"
          emptyTitle="No Payments Found!"
          emptyDescription="Once a customer pays through this page, transactions will show up here."
        />
      </div>
    </div>
  );
}
