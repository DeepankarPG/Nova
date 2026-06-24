"use client";

import { useState } from "react";
import {
  Search, X, SlidersHorizontal, Wallet, Landmark, ChevronDown, Check, Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHideAmounts, MaskedNumber } from "@/lib/hide-amounts-context";
import type { RecentTxnItem } from "@/components/dashboard/mobile/MobileTransactionDetail";
import { emptyFilters, hasAnyFilter } from "@/components/dashboard/mobile/MobileFilterDrawer";
import type { FilterState } from "@/components/dashboard/mobile/MobileFilterDrawer";

/* ── Types ──────────────────────────────────────────────────────────── */
type TxnStatus = "success" | "failed" | "pending" | "refunded";
type TxnTab    = "all" | "success" | "refunded" | "failed";
type Period    = "1D" | "1W" | "1M" | "3M" | "YTD";

type TxnRow = {
  id: string;
  txDetailId?: string;
  customerName: string;
  customerEmail: string;
  date: string;
  time: string;
  paymentMethod: "upi" | "card" | "netbanking" | "wire";
  cardNetwork?: "visa" | "mastercard";
  cardLast4?: string;
  amount: number;
  currency: string;
  status: TxnStatus;
};

/* ── Legacy export — keeps page.tsx import intact ───────────────────── */
const _LEGACY = [
  { id: "date" }, { id: "amount" }, { id: "currency" },
  { id: "status" }, { id: "method" }, { id: "more" },
] as const;
export type FilterId = typeof _LEGACY[number]["id"];

/* ── Periods ────────────────────────────────────────────────────────── */
const PERIODS: { id: Period; label: string }[] = [
  { id: "1D",  label: "Today"        },
  { id: "1W",  label: "1 Week"       },
  { id: "1M",  label: "1 Month"      },
  { id: "3M",  label: "3 Months"     },
  { id: "YTD", label: "Year to date" },
];

const PERIOD_LABELS: Record<Period, string> = {
  "1D":  "Today's statistics",
  "1W":  "This week's statistics",
  "1M":  "This month's statistics",
  "3M":  "Last 3 months' statistics",
  "YTD": "This year's statistics",
};

/* ── Metrics per period ─────────────────────────────────────────────── */
type PeriodMetric = {
  totalVolume: string; volumeDelta: string; volumeDeltaPos: boolean;
  successRate: string; successDelta: string; successDeltaPos: boolean;
  avgTicket: string;   ticketDelta: string;  ticketDeltaPos: boolean;
  failedCount: string; failedDelta: string;  failedDeltaPos: boolean;
};

const METRICS: Record<Period, PeriodMetric> = {
  "1D":  { totalVolume: "₹8,47,250.00",   volumeDelta: "+8.4% vs last",  volumeDeltaPos: true,  successRate: "94.20%", successDelta: "+1.2%", successDeltaPos: true,  avgTicket: "₹2,475", ticketDelta: "-3.1%", ticketDeltaPos: false, failedCount: "2",   failedDelta: "-50%", failedDeltaPos: true },
  "1W":  { totalVolume: "₹41,87,000",     volumeDelta: "+12.3% vs last", volumeDeltaPos: true,  successRate: "93.50%", successDelta: "+0.8%", successDeltaPos: true,  avgTicket: "₹2,490", ticketDelta: "-1.5%", ticketDeltaPos: false, failedCount: "14",  failedDelta: "-32%", failedDeltaPos: true },
  "1M":  { totalVolume: "₹1,82,40,000",   volumeDelta: "+5.2% vs last",  volumeDeltaPos: true,  successRate: "92.80%", successDelta: "+0.4%", successDeltaPos: true,  avgTicket: "₹2,530", ticketDelta: "+0.8%", ticketDeltaPos: true,  failedCount: "58",  failedDelta: "-18%", failedDeltaPos: true },
  "3M":  { totalVolume: "₹5,34,20,000",   volumeDelta: "+9.1% vs last",  volumeDeltaPos: true,  successRate: "92.10%", successDelta: "+2.1%", successDeltaPos: true,  avgTicket: "₹2,560", ticketDelta: "+2.2%", ticketDeltaPos: true,  failedCount: "190", failedDelta: "-24%", failedDeltaPos: true },
  "YTD": { totalVolume: "₹8,72,30,000",   volumeDelta: "+21.4% vs last", volumeDeltaPos: true,  successRate: "91.80%", successDelta: "+3.8%", successDeltaPos: true,  avgTicket: "₹2,580", ticketDelta: "+4.2%", ticketDeltaPos: true,  failedCount: "330", failedDelta: "-35%", failedDeltaPos: true },
};

/* ── Sparkline data ─────────────────────────────────────────────────── */
const SPARK = {
  volume:  [420, 480, 510, 490, 560, 620, 720, 847],
  success: [88, 90, 91, 92, 91, 93, 94, 94.2],
  ticket:  [2600, 2580, 2540, 2510, 2490, 2480, 2476, 2475],
  failed:  [12, 10, 8, 7, 6, 5, 3, 2],
};

/* ── Table mock data ────────────────────────────────────────────────── */
const TABLE_TXNS: TxnRow[] = [
  { id: "GID-001", txDetailId: "tx1", customerName: "Priya Mehta",    customerEmail: "priya.mehta@gmail.com",   date: "04 Jun", time: "10:50 AM", paymentMethod: "upi",        amount:  4500,    currency: "INR", status: "success" },
  { id: "GID-003", txDetailId: "tx2", customerName: "Rajan Stores",   customerEmail: "accounts@rajanstores.in", date: "04 Jun", time: "10:32 AM", paymentMethod: "card",       cardNetwork: "mastercard", cardLast4: "8821", amount: 12200,    currency: "INR", status: "success" },
  { id: "GID-002", txDetailId: "tx3", customerName: "SwiftPay Ltd",   customerEmail: "ops@swiftpay.io",         date: "04 Jun", time: "10:16 AM", paymentMethod: "netbanking", amount:   890,    currency: "INR", status: "failed"  },
  { id: "GID-004", txDetailId: "tx4", customerName: "Ananya Kapoor",  customerEmail: "ananya.k@gmail.com",      date: "04 Jun", time: "09:50 AM", paymentMethod: "upi",        amount:  2100,    currency: "INR", status: "pending" },
  { id: "GID-005", txDetailId: "tx5", customerName: "Globaltech Inc", customerEmail: "finance@globaltech.com",  date: "04 Jun", time: "08:41 AM", paymentMethod: "card",       cardNetwork: "visa",       cardLast4: "4242", amount: 67800,    currency: "INR", status: "success" },
  { id: "GID-006", txDetailId: "tx6", customerName: "Yajat Gupta",    customerEmail: "yajat.gupta@payglo.in",   date: "12 Mar", time: "03:22 PM", paymentMethod: "card",       cardNetwork: "visa",       cardLast4: "990",  amount:   325.58, currency: "INR", status: "pending" },
  { id: "GID-007",                    customerName: "Sarah Mitchell", customerEmail: "sarah.m@example.com",     date: "12 Mar", time: "02:10 PM", paymentMethod: "card",       cardNetwork: "mastercard", cardLast4: "5100", amount:  1250,    currency: "USD", status: "success" },
];

/* ── Amount color + sign prefix per status ──────────────────────────── */
const AMOUNT_CFG: Record<TxnStatus, { color: string; prefix: string }> = {
  success:  { color: "text-emerald-700",               prefix: "+"  },
  failed:   { color: "text-red-700 dark:text-red-500", prefix: "-"  },
  pending:  { color: "text-amber-700",                 prefix: ""   },
  refunded: { color: "text-red-700 dark:text-red-500", prefix: "-"  },
};

/* ── Tabs ───────────────────────────────────────────────────────────── */
const TABS: { id: TxnTab; label: string }[] = [
  { id: "all",      label: "All"      },
  { id: "success",  label: "Success"  },
  { id: "refunded", label: "Refunded" },
  { id: "failed",   label: "Failed"   },
];

/* ── Helpers ────────────────────────────────────────────────────────── */
function fmtAmount(amount: number, currency: string): string {
  const sym: Record<string, string> = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
  const prefix = sym[currency] ?? "";
  const abs = Math.abs(amount);
  const hasDec = abs % 1 !== 0;
  const locale = currency === "INR" ? "en-IN" : "en-US";
  return prefix + abs.toLocaleString(locale, {
    minimumFractionDigits: hasDec ? 2 : 0,
    maximumFractionDigits: hasDec ? 2 : 0,
  });
}

function toRecentItem(row: TxnRow): RecentTxnItem {
  const methodLabel =
    row.paymentMethod === "upi" ? "UPI" :
    row.paymentMethod === "card" ? "Card" :
    row.paymentMethod === "netbanking" ? "Net Banking" : "Wire";
  const status: "success" | "failed" | "pending" =
    row.status === "refunded" ? "success" : row.status;
  return {
    id: row.txDetailId ?? row.id,
    name: row.customerName,
    amount: fmtAmount(row.amount, row.currency),
    method: methodLabel,
    status,
    time: row.time,
    date: row.date,
  };
}

/* ── Sparkline SVG ──────────────────────────────────────────────────── */
function Sparkline({ data, color, w, h }: { data: number[]; color: string; w: number; h: number }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 2;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) =>
    `${i * step},${h - pad - ((v - min) / range) * (h - pad * 2)}`
  ).join(" ");
  const lastX = (data.length - 1) * step;
  const area = `0,${h} ${pts} ${lastX},${h}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <polygon points={area} fill={color} fillOpacity={0.12} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Props ──────────────────────────────────────────────────────────── */
interface Props {
  /* Legacy props kept for backward compat with page.tsx */
  appliedFilters?: Partial<Record<FilterId, string>>;
  onOpenFilter?: (id: FilterId) => void;
  onClearFilter?: (id: FilterId) => void;
  /* New props */
  externalFilterState?: FilterState;
  onFilterButtonTap?: () => void;
  onTxnTap?: (txn: RecentTxnItem) => void;
}

/* ── Root ───────────────────────────────────────────────────────────── */
export function MobileTransactions({ externalFilterState, onFilterButtonTap, onTxnTap }: Props = {}) {
  const [period,       setPeriod]       = useState<Period>("1D");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tab,          setTab]          = useState<TxnTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { hidden } = useHideAmounts();

  /* ── Filtered list ───────────────────────────────────────────────── */
  const f = externalFilterState ?? emptyFilters();
  const q = searchQuery.trim().toLowerCase();

  const filtered = TABLE_TXNS
    .filter(t => tab === "all" || t.status === tab)
    .filter(t => !q || t.customerName.toLowerCase().includes(q) || t.customerEmail.toLowerCase().includes(q) || t.id.toLowerCase().includes(q))
    .filter(t => f.statuses.size === 0 || f.statuses.has(t.status))
    .filter(t => f.methods.size === 0 || f.methods.has(t.paymentMethod))
    .filter(t => {
      const min = f.minAmount ? parseFloat(f.minAmount) : null;
      const max = f.maxAmount ? parseFloat(f.maxAmount) : null;
      if (min !== null && t.amount < min) return false;
      if (max !== null && t.amount > max) return false;
      return true;
    })
    .filter(t => !f.country || t.currency === f.country);

  const m = METRICS[period];

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div className="space-y-3 pb-10 bg-background relative min-h-full">

      {/* Click-outside overlay — closes dropdown when tapping outside */}
      {dropdownOpen && (
        <div className="absolute inset-0 z-[19]" onClick={() => setDropdownOpen(false)} />
      )}

      {/* Zone 1 — Period selector (sticky) */}
      <div className="sticky top-0 z-20 bg-background px-4 pt-3.5 pb-2.5 border-b border-border/30 overflow-visible">
        <div className="flex items-center justify-between gap-3">

          {/* Dynamic label */}
          <p className="text-[14px] font-bold text-foreground leading-none">
            {PERIOD_LABELS[period]}
          </p>

          {/* Dropdown selector */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setDropdownOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-3 h-[34px] rounded-xl border border-border bg-white text-[12.5px] font-medium text-foreground active:bg-muted/40 transition-colors"
            >
              {PERIODS.find(p => p.id === period)?.label}
              <ChevronDown
                className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform duration-150", dropdownOpen && "rotate-180")}
                strokeWidth={2}
              />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div
                className="absolute right-0 top-full mt-1.5 bg-background rounded-2xl border border-border overflow-hidden min-w-[130px]"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.10)", zIndex: 21 }}
              >
                {PERIODS.map(p => {
                  const active = p.id === period;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { setPeriod(p.id); setDropdownOpen(false); }}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors",
                        active ? "bg-muted/40" : "active:bg-muted/30"
                      )}
                    >
                      <span className={cn("text-[13px]", active ? "font-semibold text-foreground" : "text-muted-foreground")}>
                        {p.label}
                      </span>
                      {active && (
                        <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-3" strokeWidth={2.5} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Zone 2 — Metrics */}
      <div className="px-4 space-y-2.5">

        {/* Card A — Total Volume */}
        <div className="rounded-2xl border border-border bg-card shadow-sm px-4 py-3.5 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-muted-foreground mb-1">Total Volume</p>
            <p className="text-[26px] font-bold text-foreground tabular-nums leading-tight">
              <MaskedNumber value={m.totalVolume} hidden={hidden} rollKey={period} />
            </p>
            <p className={cn("text-[11.5px] font-medium mt-1.5", m.volumeDeltaPos ? "text-emerald-600" : "text-red-600")}>
              {m.volumeDelta}
            </p>
          </div>
          <div className="shrink-0">
            <Sparkline data={SPARK.volume} color="#3b82f6" w={120} h={48} />
          </div>
        </div>

        {/* Cards B / C / D */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-2xl border border-border bg-card shadow-sm px-3 py-3 flex flex-col">
            <p className="text-[10px] font-medium text-muted-foreground leading-none mb-1.5">Success Rate</p>
            <p className="text-[14px] font-bold text-foreground tabular-nums leading-tight">
              {hidden ? "••••" : m.successRate}
            </p>
            <p className={cn("text-[10.5px] font-semibold mt-1", m.successDeltaPos ? "text-emerald-600" : "text-red-600")}>
              {m.successDelta}
            </p>
            <div className="mt-2">
              <Sparkline data={SPARK.success} color="#10b981" w={80} h={28} />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-sm px-3 py-3 flex flex-col">
            <p className="text-[10px] font-medium text-muted-foreground leading-none mb-1.5">Avg. Ticket</p>
            <p className="text-[14px] font-bold text-foreground tabular-nums leading-tight">
              {hidden ? "••••" : m.avgTicket}
            </p>
            <p className={cn("text-[10.5px] font-semibold mt-1", m.ticketDeltaPos ? "text-emerald-600" : "text-amber-600")}>
              {m.ticketDelta}
            </p>
            <div className="mt-2">
              <Sparkline data={SPARK.ticket} color="#f59e0b" w={80} h={28} />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-sm px-3 py-3 flex flex-col">
            <p className="text-[10px] font-medium text-muted-foreground leading-none mb-1.5">Failed</p>
            <p className="text-[14px] font-bold text-foreground tabular-nums leading-tight">
              {hidden ? "••" : m.failedCount}
            </p>
            <p className={cn("text-[10.5px] font-semibold mt-1", m.failedDeltaPos ? "text-emerald-600" : "text-red-600")}>
              {m.failedDelta}
            </p>
            <div className="mt-2">
              <Sparkline data={SPARK.failed} color="#ef4444" w={80} h={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Zone 3 — All Transactions container */}
      <div className="mx-4 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <p className="text-[15px] font-bold text-foreground">All Transactions</p>
          <button type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors">
            <Download className="h-[14px] w-[14px]" strokeWidth={2} />
            Export CSV
          </button>
        </div>

        {/* Search + Filter */}
        <div className="flex items-center gap-2.5 px-4 pb-3">
          <div className="flex-1 flex items-center gap-2.5 bg-muted/50 rounded-xl px-3.5 py-2.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={2} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search customer, email, ID..."
              className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")}>
                <X className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => onFilterButtonTap?.()}
            className="relative h-[38px] w-[38px] flex items-center justify-center rounded-xl bg-muted/50 text-muted-foreground shrink-0"
          >
            <SlidersHorizontal className="h-[15px] w-[15px]" strokeWidth={2} />
            {hasAnyFilter(f) && (
              <span className="absolute top-1.5 right-1.5 h-[5px] w-[5px] rounded-full bg-primary" />
            )}
          </button>
        </div>

        {/* Tab strip */}
        <div className="flex gap-1 mx-4 mb-3 bg-muted/60 p-1 rounded-xl">
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 py-1.5 text-[11.5px] font-medium rounded-lg transition-colors",
                tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Transaction rows */}
        <div className="divide-y divide-border">
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-muted-foreground">No transactions</p>
          ) : filtered.map((row) => {
            const amt = AMOUNT_CFG[row.status];
            return (
              <button
                key={row.id}
                type="button"
                onClick={() => onTxnTap?.(toRecentItem(row))}
                className="w-full flex items-start justify-between gap-3 px-4 py-3.5 text-left active:bg-muted/30 transition-colors duration-100"
              >
                {/* Left block */}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-foreground leading-snug truncate">{row.customerName}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug truncate">{row.customerEmail}</p>
                  <div className="mt-1">
                    {row.paymentMethod === "card" && row.cardNetwork ? (
                      <div className="flex items-center gap-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={row.cardNetwork === "visa" ? "/visa.png" : "/mastercard.png"} alt={row.cardNetwork} className="h-[10px] w-auto object-contain" />
                        {row.cardLast4 && <p className="text-[12px] text-muted-foreground leading-snug">···{row.cardLast4}</p>}
                      </div>
                    ) : row.paymentMethod === "netbanking" ? (
                      <div className="flex items-center gap-1">
                        <Landmark className="h-[13px] w-[13px] text-muted-foreground shrink-0" strokeWidth={1.75} />
                        <p className="text-[12px] text-muted-foreground leading-snug">Net Banking</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Wallet className="h-[13px] w-[13px] text-muted-foreground shrink-0" strokeWidth={1.75} />
                        <p className="text-[12px] text-muted-foreground leading-snug">{row.paymentMethod === "upi" ? "UPI" : "Wire"}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right block */}
                <div className="shrink-0 text-right">
                  <p className="leading-snug">
                    <span className={cn("text-[13.5px] font-bold tabular-nums", amt.color)}>
                      {hidden ? "•••" : `${amt.prefix}${fmtAmount(row.amount, row.currency)}`}
                    </span>
                    {!hidden && (
                      <span className="text-[11px] text-muted-foreground ml-1">{row.currency}</span>
                    )}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{row.date} · {row.time}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
