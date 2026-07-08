"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import {
  Download,
  Search,
  CreditCard,
  Smartphone,
  Building2,
  X,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Receipt,
  Copy,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { cn, formatTableDateTime } from "@/lib/utils";
import { allTransactions } from "@/lib/mock-data";
import { toast } from "sonner";
import { useWorkspace } from "@/lib/workspace-context";
import { ALL_BUSINESSES_ID } from "@/lib/workspace-types";

type Transaction = typeof allTransactions[number];

const statusOptions = [
  "All",
  "sent_for_capture",
  "in_progress",
  "failed",
  "refunded",
] as const;

function statusFilterLabel(s: string) {
  if (s === "All") return "All";
  if (s === "sent_for_capture") return "Sent for capture";
  if (s === "in_progress") return "In progress";
  if (s === "refunded") return "Refunded";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
const methodOptions = ["All", "card", "upi", "netbanking"];

const methodIcons: Record<string, React.ReactNode> = {
  card:       <CreditCard  className="w-3.5 h-3.5 text-muted-foreground" />,
  upi:        <Smartphone  className="w-3.5 h-3.5 text-muted-foreground" />,
  netbanking: <Building2   className="w-3.5 h-3.5 text-muted-foreground" />,
};

const CURRENCY_GLYPH: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  SGD: "S$",
};

/** Formatted number only (grouping + decimals), for right-aligned amount column. */
function fmtAmountNumber(amount: number) {
  return amount.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

/** Matches ISO code column in body rows so the header lines up with numeric amounts. */
const AMOUNT_CODE_COL = "w-10 shrink-0";

function AmountColumnHeader() {
  return (
    <div className="flex w-full min-w-0 items-baseline gap-2">
      <div className="min-w-0 flex-1 text-right">
        <span className="inline-block whitespace-nowrap text-[11px] font-semibold tabular-nums text-muted-foreground">
          Amount
        </span>
      </div>
      <span className={cn(AMOUNT_CODE_COL)} aria-hidden />
    </div>
  );
}

function AmountCell({ amount, currency }: { amount: number; currency: string }) {
  const glyph = CURRENCY_GLYPH[currency] ?? "";
  const num = fmtAmountNumber(amount);
  return (
    <div className="flex w-full min-w-0 items-baseline gap-2">
      <div className="min-w-0 flex-1 text-right">
        <span className="inline-block whitespace-nowrap text-[13px] font-semibold tabular-nums text-foreground">
          {glyph}
          {num}
        </span>
      </div>
      <span
        className={cn(
          AMOUNT_CODE_COL,
          "text-left text-[11px] font-normal tabular-nums text-muted-foreground"
        )}
      >
        {currency}
      </span>
    </div>
  );
}

function CardBrand({ brand }: { brand: string | null | undefined }) {
  if (brand === "visa") return (
    <span className="inline-flex items-center justify-center w-8 h-5 rounded overflow-hidden bg-card border border-border">
      <Image src="/visa.png" alt="Visa" width={26} height={12} style={{ objectFit: "contain" }} />
    </span>
  );
  if (brand === "mastercard") return (
    <span className="inline-flex items-center justify-center w-8 h-5 rounded overflow-hidden bg-card border border-border">
      <Image src="/mastercard.png" alt="Mastercard" width={28} height={18} style={{ objectFit: "contain" }} />
    </span>
  );
  if (brand === "jcb") return (
    <span className="inline-flex items-center justify-center w-8 h-5 rounded overflow-hidden bg-card border border-border">
      <Image src="/jcb.png" alt="JCB" width={28} height={18} style={{ objectFit: "contain" }} />
    </span>
  );
  return <span className="inline-flex items-center justify-center w-8 h-5 rounded text-[9px] font-bold text-muted-foreground bg-muted">CARD</span>;
}

function TransactionIdCell({ id }: { id: string }) {
  return (
    <div className="group/id flex min-w-0 max-w-full items-center gap-1.5">
      <span
        className="min-w-0 flex-1 truncate text-[13px] font-mono text-muted-foreground"
        title={id}
      >
        {id}
      </span>
      <button
        type="button"
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
          "text-muted-foreground opacity-0 transition-opacity",
          "hover:bg-muted hover:text-foreground",
          "group-hover/id:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
        aria-label="Copy transaction ID"
        title="Copy"
        onClick={() => {
          void navigator.clipboard.writeText(id).then(
            () => toast.success("Copied"),
            () => toast.error("Could not copy")
          );
        }}
      >
        <Copy className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}

function PaymentMethod({ row }: { row: Transaction }) {
  if (row.method === "card") return (
    <div className="flex items-center gap-1">
      <CardBrand brand={row.cardBrand} />
      <span className="text-[13px] text-muted-foreground font-mono">
        … {row.cardLast4 ?? "—"}
      </span>
    </div>
  );
  if (row.method === "upi") return (
    <span className="inline-flex items-center justify-center w-8 h-5 rounded text-[9px] font-black bg-muted text-[#5f259f] dark:text-violet-300">UPI</span>
  );
  return (
    <div className="flex items-center gap-1">
      <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-[13px] text-muted-foreground">Netbanking</span>
    </div>
  );
}

const columns: Column<Transaction>[] = [
  {
    key: "amount",
    header: <AmountColumnHeader />,
    align: "right",
    width: "200px",
    minWidth: 184,
    render: (row) => (
      <AmountCell amount={row.amount} currency={row.currency} />
    ),
  },
  {
    key: "status",
    header: "Status",
    width: "176px",
    render: (row) => <StatusBadge status={row.status} size="sm" />,
  },
  {
    key: "method",
    header: "Payment method",
    width: "138px",
    render: (row) => <PaymentMethod row={row} />,
  },
  {
    key: "customer",
    header: "Customer name",
    width: "148px",
    maxWidth: 180,
    cellClassName: "max-w-0",
    render: (row) => (
      <span
        className="block min-w-0 max-w-full truncate text-[13px] font-medium text-foreground"
        title={row.customerName}
      >
        {row.customerName}
      </span>
    ),
  },
  {
    key: "email",
    header: "Email",
    width: "196px",
    maxWidth: 240,
    cellClassName: "max-w-0",
    render: (row) => (
      <span
        className="block min-w-0 max-w-full truncate text-[13px] font-normal text-muted-foreground"
        title={row.email}
      >
        {row.email}
      </span>
    ),
  },
  {
    key: "id",
    header: "Transaction ID",
    width: "192px",
    maxWidth: 220,
    cellClassName: "max-w-0",
    render: (row) => <TransactionIdCell id={row.id} />,
  },
  {
    key: "date",
    header: "Date and time",
    width: "152px",
    render: (row) => (
      <span className="whitespace-nowrap text-[13px] font-normal text-muted-foreground">
        {formatTableDateTime(row.date)}
      </span>
    ),
  },
];

export default function TransactionsPage() {
  const [isLoading,   setIsLoading]   = useState(true);
  const [search,      setSearch]      = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");
  const [isExporting, setIsExporting] = useState(false);
  const { activeBusinessId, activeBusiness, group } = useWorkspace();

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const scopeSubtitle = activeBusiness
    ? `${activeBusiness.name} · ${activeBusiness.primaryAccount.mid}`
    : `${group.name} · All Businesses`;

  const filtered = useMemo(() => allTransactions.filter((tx) => {
    const matchSearch  = !search || tx.customerName.toLowerCase().includes(search.toLowerCase()) || tx.email.toLowerCase().includes(search.toLowerCase()) || tx.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus  = statusFilter === "All" || tx.status === statusFilter;
    const matchMethod  = methodFilter === "All" || tx.method === methodFilter;
    return matchSearch && matchStatus && matchMethod;
  }), [search, statusFilter, methodFilter]);

  const handleExport = async () => {
    setIsExporting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsExporting(false);
    toast.success("Export complete", { description: "transactions.csv has been downloaded" });
  };

  const hasActive = statusFilter !== "All" || methodFilter !== "All" || search;

  return (
    <div className="w-full max-w-[1400px] space-y-4">
      <PageHeader
        title="Transactions"
        subtitle={scopeSubtitle}
        actions={
          <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}
            isLoading={isExporting} onClick={handleExport}>
            Export CSV
          </Button>
        }
      />

      {/* Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard
          title="Total Volume"
          value={847250}
          currency="INR"
          change={8.4}
          changeLabel="vs last month"
          icon={BarChart2}
          iconPreset="brand"
          index={0}
          sparkline={[62,71,59,80,74,88,76,91,85,95,89,100]}
          tooltip="Gross value of all payment transactions processed in the current period, before refunds and fees."
        />
        <StatCard
          title="Success Rate"
          value={94.2}
          suffix="%"
          subtitle="last 30 days"
          change={1.2}
          changeLabel="vs last month"
          icon={CheckCircle2}
          iconPreset="green"
          index={1}
          sparkline={[78,82,80,85,83,88,86,90,89,92,91,94]}
          tooltip="Percentage of initiated transactions that were successfully captured. Higher is better; industry average is ~91%."
        />
        <StatCard
          title="Avg. Ticket Size"
          value={2475}
          currency="INR"
          change={-3.1}
          changeLabel="vs last month"
          icon={Receipt}
          iconPreset="amber"
          index={2}
          sparkline={[88,82,85,79,83,76,80,74,77,72,75,70]}
          tooltip="Mean transaction value calculated as total volume divided by number of successful payments in the period."
        />
        <StatCard
          title="Failed"
          value={2}
          subtitle="needs attention"
          change={-50}
          changeLabel="vs last month"
          icon={AlertCircle}
          iconPreset="red"
          index={3}
          sparkline={[8,6,9,5,7,4,6,3,5,3,4,2]}
          tooltip="Transactions declined or errored during processing. Review failed payments to identify drop-off patterns."
        />
      </div>

      {/* Filter bar */}
      <div className="bg-card text-card-foreground rounded-xl px-4 py-2.5 flex items-center gap-2.5 flex-wrap border border-border">

        {/* Search */}
        <div className="relative min-w-[160px] max-w-xs flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input type="text" placeholder="Search customer, email, ID…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-muted-foreground/50 focus:ring-2 focus:ring-ring/20 transition-all"
          />
        </div>

        <div className="hidden sm:block h-4 w-px bg-border" />

        {/* Status pills */}
        <div className="flex items-center gap-1 flex-wrap">
          {statusOptions.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                statusFilter === s
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              )}>
              {statusFilterLabel(s)}
            </button>
          ))}
        </div>

        <div className="hidden sm:block h-4 w-px bg-border" />

        {/* Method pills */}
        <div className="flex items-center gap-1 flex-wrap">
          {methodOptions.map((m) => (
            <button key={m} onClick={() => setMethodFilter(m)}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                methodFilter === m
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              )}>
              {m !== "All" && methodIcons[m]}
              {m === "All" ? "All Methods" : m === "netbanking" ? "Net Banking" : m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        {hasActive && (
          <button onClick={() => { setSearch(""); setStatusFilter("All"); setMethodFilter("All"); }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground ml-auto transition-colors">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {hasActive && !isLoading && (
        <p className="text-xs text-gray-400">
          Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of {allTransactions.length} transactions
        </p>
      )}

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        skeletonRows={8}
        emptyTitle="No transactions found"
        emptyDescription="Try adjusting your filters"
        rowKey={(row) => row.id}
        pageSize={10}
        density="compact"
        snug
        footerSummary="count"
        footerCountLabels={{ singular: "result", plural: "results" }}
        rowCta={{ label: "View details" }}
      />
    </div>
  );
}
