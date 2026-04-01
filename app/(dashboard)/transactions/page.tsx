"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { Download, Search, CreditCard, Smartphone, Building2, X, CheckCircle2, AlertCircle, BarChart2, Receipt } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { cn, formatDate } from "@/lib/utils";
import { allTransactions } from "@/lib/mock-data";
import { toast } from "sonner";

type Transaction = typeof allTransactions[number];

const statusOptions = ["All", "success", "in_progress", "failed", "refunded"];
const methodOptions = ["All", "card", "upi", "netbanking"];

const methodIcons: Record<string, React.ReactNode> = {
  card:       <CreditCard  className="w-3.5 h-3.5 text-muted-foreground" />,
  upi:        <Smartphone  className="w-3.5 h-3.5 text-muted-foreground" />,
  netbanking: <Building2   className="w-3.5 h-3.5 text-muted-foreground" />,
};

function fmtAmt(amount: number, currency: string) {
  const s = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : `${currency} `;
  return `${s}${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
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

function PaymentMethod({ row }: { row: Transaction }) {
  if (row.method === "card") return (
    <div className="flex items-center gap-1.5">
      <CardBrand brand={row.cardBrand} />
      <span className="text-[13px] text-muted-foreground font-mono">•••• {row.cardLast4 ?? "—"}</span>
    </div>
  );
  if (row.method === "upi") return (
    <span className="inline-flex items-center justify-center w-8 h-5 rounded text-[9px] font-black bg-muted text-[#5f259f] dark:text-violet-300">UPI</span>
  );
  return (
    <div className="flex items-center gap-1.5">
      <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-[13px] text-muted-foreground">Netbanking</span>
    </div>
  );
}

const columns: Column<Transaction>[] = [
  {
    key: "amount",
    header: "Amount",
    minWidth: 125,
    render: (row) => (
      <div className="flex items-baseline gap-1.5 whitespace-nowrap">
        <span className="font-semibold text-foreground tabular-nums text-[13px]">{fmtAmt(row.amount, row.currency)}</span>
        <span className="text-[11px] text-muted-foreground font-medium">{row.currency}</span>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    minWidth: 155,
    render: (row) => <StatusBadge status={row.status} size="sm" />,
  },
  {
    key: "method",
    header: "Payment method",
    minWidth: 140,
    render: (row) => <PaymentMethod row={row} />,
  },
  {
    key: "customer",
    header: "Customer name",
    minWidth: 145,
    render: (row) => (
      <span className="text-[13px] font-medium text-foreground whitespace-nowrap">{row.customerName}</span>
    ),
  },
  {
    key: "email",
    header: "Email",
    minWidth: 185,
    render: (row) => (
      <span className="text-[13px] text-muted-foreground whitespace-nowrap">{row.email}</span>
    ),
  },
  {
    key: "id",
    header: "Transaction ID",
    minWidth: 155,
    render: (row) => (
      <span className="text-[13px] font-mono text-primary/70 hover:text-primary transition-colors cursor-pointer whitespace-nowrap">
        {row.id}
      </span>
    ),
  },
  {
    key: "date",
    header: "Date and time",
    minWidth: 150,
    render: (row) => (
      <span className="text-[13px] text-muted-foreground whitespace-nowrap">{formatDate(row.date)}</span>
    ),
  },
];

export default function TransactionsPage() {
  const [isLoading,   setIsLoading]   = useState(true);
  const [search,      setSearch]      = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

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
    <div className="max-w-[1400px] mx-auto space-y-4">
      <PageHeader
        title="Transactions"
        subtitle={`${allTransactions.length} total transactions`}
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
              {s === "All" ? "All" : s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
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
          Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of {allTransactions.length}
        </p>
      )}

      <DataTable columns={columns} data={filtered} isLoading={isLoading} skeletonRows={8}
        emptyTitle="No transactions found" emptyDescription="Try adjusting your filters"
        rowKey={(row) => row.id} pageSize={10}
        rowCta={{ label: "View details" }}
      />
    </div>
  );
}
