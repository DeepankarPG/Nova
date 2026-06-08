"use client";

import { useState, useId } from "react";
import Link from "next/link";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip,
  XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  ChevronDown, ArrowUpRight, ArrowDownRight, ArrowDownLeft,
  Link2, Receipt, Globe, FileText, UserPlus,
  Calculator, Settings2, ExternalLink,
  XCircle, Clock, CreditCard, Nfc,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHideAmounts, MaskedNumber } from "@/lib/hide-amounts-context";

/* ─── Chart colors (exact desktop match) ──────────────────────────── */
const C_TODAY     = "#0061e3"; // PayGlocal primary
const C_YESTERDAY = "#93c5fd"; // blue-300 — consistent with analytics "prev" tonal
const C_PSR       = "#0284c7"; // sky-600 — stays in the blue family

/* ─── Data ─────────────────────────────────────────────────────────── */
const HOURLY = [
  { t: "00", today:  12000, yesterday:  18000 },
  { t: "02", today:  25000, yesterday:  32000 },
  { t: "04", today:  45000, yesterday:  55000 },
  { t: "06", today:  80000, yesterday:  95000 },
  { t: "08", today: 148000, yesterday: 172000 },
  { t: "10", today: 290000, yesterday: 315000 },
  { t: "12", today: 425000, yesterday: 462000 },
  { t: "14", today: 582000, yesterday: 618000 },
  { t: "16", today: 725000, yesterday: 750000 },
  { t: "18", today: 848000, yesterday: 872000 },
  { t: "20", today: 912000, yesterday: 934000 },
  { t: "22", today: 942800, yesterday: 960000 },
];

const PSR_DATA = [
  { t: "00", today: 93.1, yesterday: 91.5 },
  { t: "04", today: 95.2, yesterday: 94.0 },
  { t: "08", today: 94.8, yesterday: 93.8 },
  { t: "12", today: 93.9, yesterday: 94.5 },
  { t: "16", today: 94.5, yesterday: 93.2 },
  { t: "20", today: 94.2, yesterday: 94.1 },
  { t: "22", today: 94.2, yesterday: 93.8 },
];

const RECENT_TXN = [
  { id: "tx1", name: "Priya Mehta",    amount: "₹4,500",  method: "UPI",         status: "success" as const, time: "2m ago"  },
  { id: "tx2", name: "Rajan Stores",   amount: "₹12,200", method: "Card",        status: "success" as const, time: "18m ago" },
  { id: "tx3", name: "SwiftPay Ltd",   amount: "₹890",    method: "Net Banking", status: "failed"  as const, time: "34m ago" },
  { id: "tx4", name: "Ananya Kapoor",  amount: "₹2,100",  method: "UPI",         status: "pending" as const, time: "1h ago"  },
  { id: "tx5", name: "Globaltech Inc", amount: "₹67,800", method: "Card",        status: "success" as const, time: "2h ago"  },
];


/* ─── Metric options ─────────────────────────────────────────────── */
type MetricKey = "gross" | "net" | "count";
const METRICS: Record<MetricKey, { label: string; value: string; unit: string; change: string; up: boolean }> = {
  gross: { label: "Gross volume",    value: "₹9,42,800", unit: "INR",  change: "+14.1%", up: true },
  net:   { label: "Net volume",      value: "₹8,98,450", unit: "INR",  change: "+11.8%", up: true },
  count: { label: "No. of payments", value: "1,284",      unit: "txns", change: "+9.3%",  up: true },
};

const KEY_METRICS = [
  { label: "Gross GMV",    value: "₹9,42,800", change: "+14.1%", up: true  },
  { label: "Success Rate", value: "94.2%",      change: "+1.1%",  up: true  },
  { label: "Avg Ticket",   value: "₹6,600",     change: "-3.2%",  up: false },
  { label: "Failed Txns",  value: "78",          change: "-8",     up: true  },
  { label: "Settlements",  value: "₹1,24,890",  change: "12:00AM", up: true },
] as const;

const QUICK_ACCESS = [
  { label: "Create payment link",    icon: Link2,      href: "/payment-products/payment-links?create=1"  },
  { label: "Create invoice",         icon: Receipt,    href: "/payment-products/invoice-links?create=1"  },
  { label: "Invite teammate",        icon: UserPlus,   href: "/settings/personal"                        },
  { label: "FX calculator",          icon: Calculator, href: "/payment-products/international-accounts"  },
  { label: "International accounts", icon: Globe,      href: "/payment-products/international-accounts"  },
  { label: "Settlement reports",     icon: FileText,   href: "/settlement-reports"                       },
  { label: "Disputes",               icon: XCircle,    href: "/dispute-management"                       },
  { label: "Customise",              icon: Settings2,  href: "/"                                         },
] as const;

/* ─── Helpers ─────────────────────────────────────────────────────── */
function fmtY(v: number) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(0)}L`;
  if (v >= 1000)   return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v}`;
}

const TOOLTIP_STYLE = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 11,
  color: "var(--foreground)",
  boxShadow: "0 8px 24px -4px rgba(0,0,0,0.12)",
};

/* ─── Metric Dropdown ────────────────────────────────────────────── */
function MetricDropdown({ value, onChange }: { value: MetricKey; onChange: (k: MetricKey) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative z-10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[13px] font-semibold text-foreground shadow-sm"
      >
        {METRICS[value].label}
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1.5 min-w-[200px] overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          {(Object.keys(METRICS) as MetricKey[]).map((key) => (
            <button key={key} type="button"
              onClick={() => { onChange(key); setOpen(false); }}
              className={cn(
                "flex w-full items-center justify-between px-3.5 py-2.5 text-left text-[13px] transition-colors hover:bg-muted",
                value === key ? "text-primary font-semibold" : "text-foreground font-medium"
              )}
            >
              {METRICS[key].label}
              {value === key && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Gross volume chart card ────────────────────────────────────── */
function GrossVolumeCard() {
  const [metric, setMetric] = useState<MetricKey>("gross");
  const m = METRICS[metric];
  const gradId = useId();
  const { hidden } = useHideAmounts();

  return (
    <div className="flex flex-col h-full rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="p-4 pb-3 flex-1">
        {/* Top: label + dropdown */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <p className="text-[12px] font-semibold text-foreground truncate">{m.label}</p>
          <MetricDropdown value={metric} onChange={setMetric} />
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-[24px] font-bold text-foreground leading-none tabular-nums tracking-tight">
            <MaskedNumber value={m.value} hidden={hidden} />
          </span>
          <span className="text-[12px] text-muted-foreground">{m.unit}</span>
        </div>
        <div className={cn("flex items-center gap-0.5 text-[12px] font-semibold mb-3", m.up ? "text-emerald-700" : "text-red-700 dark:text-red-500")}>
          {m.up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          <MaskedNumber value={m.change} hidden={hidden} /> vs yesterday
        </div>

        {/* Chart */}
        <div className="h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={HOURLY} margin={{ top: 2, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`fill-${gradId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={C_TODAY} stopOpacity={0.35} />
                  <stop offset="70%"  stopColor={C_TODAY} stopOpacity={0.08} />
                  <stop offset="100%" stopColor={C_TODAY} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 6" stroke="var(--border)" strokeOpacity={0.25} vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 8, fill: "var(--chart-tick)" }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tickFormatter={fmtY} tick={{ fontSize: 8, fill: "var(--chart-tick)" }} tickLine={false} axisLine={false} width={24} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: unknown) => [`₹${Number(v).toLocaleString("en-IN")}`]} />
              <Area type="monotone" dataKey="yesterday" stroke={C_YESTERDAY} strokeWidth={1.5} strokeDasharray="5 4" fill="transparent" dot={false} animationDuration={600} animationEasing="ease-out" />
              <Area type="monotone" dataKey="today" stroke={C_TODAY} strokeWidth={2.5} fill={`url(#fill-${gradId})`} dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: C_TODAY }} animationDuration={650} animationEasing="ease-out" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Settlement strip — single flex row so button is always centred */}
      <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-4 py-3">
        <div>
          <p className="text-[12px] font-semibold text-foreground">Upcoming settlement</p>
          <p className="text-[15px] font-bold text-foreground tabular-nums leading-tight mt-0.5"><MaskedNumber value="₹1,24,890" hidden={hidden} /></p>
          <p className="text-[10px] text-muted-foreground leading-tight">Settles 12:00AM IST</p>
        </div>
        <Link href="/settlement-reports" className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-[12px] font-semibold text-foreground shadow-sm">
          View details <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

/* ─── Payment success rate card ──────────────────────────────────── */
function PaymentSuccessCard() {
  const { hidden } = useHideAmounts();
  return (
    <div className="flex flex-col h-full rounded-2xl border border-border bg-card shadow-sm p-4">
      {/* Title + value + inline change */}
      <p className="text-[12px] font-semibold text-foreground mb-1">Payment success rate</p>
      <div className="flex items-baseline gap-2 mb-3">
        <p className="text-[24px] font-bold leading-none tabular-nums" style={{ color: C_PSR }}>
          <MaskedNumber value="94.2%" hidden={hidden} />
        </p>
        <div className="flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600">
          <ArrowUpRight className="h-3 w-3" />
          <span>+0.4%</span>
        </div>
      </div>

      {/* Area chart */}
      <div className="h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={PSR_DATA} margin={{ top: 2, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="psr-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={C_PSR} stopOpacity={0.4}  />
                <stop offset="55%"  stopColor={C_PSR} stopOpacity={0.1}  />
                <stop offset="100%" stopColor={C_PSR} stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke="var(--border)" strokeOpacity={0.25} vertical={false} />
            <XAxis dataKey="t" tick={{ fontSize: 8, fill: "var(--chart-tick)" }} tickLine={false} axisLine={false} interval={1} />
            <YAxis hide domain={[89, 98]} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: unknown) => [`${v}%`]} />
            <Area type="natural" dataKey="yesterday" stroke={C_YESTERDAY} strokeWidth={1.5} strokeDasharray="5 4" fill="transparent" dot={false} animationDuration={600} />
            <Area type="natural" dataKey="today" stroke={C_PSR} strokeWidth={2.5} fill="url(#psr-fill)" dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: C_PSR }} animationDuration={650} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats — semantic colors on values */}
      <div className="mt-auto pt-2.5 border-t border-border grid grid-cols-3 gap-1">
        <div>
          <p className="text-[9.5px] text-muted-foreground mb-1">Successful</p>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-600 shrink-0" />
            <span className="text-[12px] font-bold text-emerald-700 tabular-nums">
              <MaskedNumber value="1,284" hidden={hidden} />
            </span>
          </div>
        </div>
        <div>
          <p className="text-[9.5px] text-muted-foreground mb-1">Failed</p>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
            <span className="text-[12px] font-bold text-red-600 tabular-nums">
              <MaskedNumber value="78" hidden={hidden} />
            </span>
          </div>
        </div>
        <div>
          <p className="text-[9.5px] text-muted-foreground mb-1">Avg value</p>
          <span className="text-[12px] font-bold text-foreground tabular-nums">
            <MaskedNumber value="₹6,600" hidden={hidden} />
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Needs attention ────────────────────────────────────────────── */
function NeedsAttentionCard() {
  const { hidden } = useHideAmounts();
  const ITEMS = [
    {
      label: "Funds on hold",
      amount: "₹52,340",
      sub: "12 Transactions",
      href: "/settlement-reports",
      amountColor: "text-amber-700 dark:text-amber-500",
    },
    {
      label: "Open disputes",
      amount: "₹14,200",
      sub: "4 open cases",
      href: "/dispute-management",
      amountColor: "text-red-700 dark:text-red-500",
    },
  ] as const;

  return (
    <div className="mx-4">
      <p className="text-[13px] font-semibold text-muted-foreground mb-2.5">Needs attention</p>
      <div className="space-y-2.5">
        {ITEMS.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-border bg-card shadow-sm px-4 py-3.5 flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-foreground">{item.label}</p>
              <p className={cn("text-[20px] font-bold tabular-nums leading-tight mt-0.5", item.amountColor)}>
                <MaskedNumber value={item.amount} hidden={hidden} />
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{item.sub}</p>
            </div>
            <Link
              href={item.href}
              className="shrink-0 flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-[12px] font-semibold text-foreground shadow-sm hover:bg-muted transition-colors"
            >
              Take action
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Quick access 2-row grid ────────────────────────────────────── */
function QuickAccessSection({ onCreatePaymentLink }: { onCreatePaymentLink?: () => void }) {
  return (
    <div className="px-4">
      <p className="text-[13px] font-semibold text-foreground mb-3">Quick access</p>
      <div className="grid grid-cols-4 gap-x-3 gap-y-4">
        {QUICK_ACCESS.map((item) => {
          const Icon = item.icon;
          const isPaymentLink = item.label === "Create payment link";
          const inner = (
            <>
              <div className="h-14 w-14 rounded-2xl border border-border bg-card shadow-sm flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground text-center leading-tight line-clamp-2">
                {item.label}
              </span>
            </>
          );
          if (isPaymentLink && onCreatePaymentLink) {
            return (
              <button key={item.label} type="button" onClick={onCreatePaymentLink} className="flex flex-col items-center gap-2">
                {inner}
              </button>
            );
          }
          return (
            <Link key={item.label} href={item.href} className="flex flex-col items-center gap-2">
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Request payment ───────────────────────────────────────────── */
function RequestPaymentSection({
  onCreatePaymentLink,
  onTapToPay,
}: {
  onCreatePaymentLink?: () => void;
  onTapToPay?: () => void;
}) {
  const ITEMS = [
    {
      label: "Tap to pay",
      icon: Nfc,
      iconClass: "text-sky-500",
      bgClass: "bg-sky-50 dark:bg-sky-950/40",
      href: undefined,
      action: onTapToPay,
    },
    {
      label: "Card",
      icon: CreditCard,
      iconClass: "text-indigo-600 dark:text-indigo-400",
      bgClass: "bg-indigo-50 dark:bg-indigo-950/40",
      href: "/payment-products" as string | undefined,
      action: undefined as (() => void) | undefined,
    },
    {
      label: "Payment link",
      icon: Link2,
      iconClass: "text-[#0061e3]",
      bgClass: "bg-blue-50 dark:bg-blue-950/40",
      href: undefined,
      action: onCreatePaymentLink,
    },
  ];

  return (
    <div className="mx-4 rounded-2xl border border-border bg-card shadow-sm p-4">
      <p className="text-[15px] font-bold text-foreground mb-4">Request payment</p>
      <div className="grid grid-cols-3 gap-3">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const inner = (
            <>
              <div className={cn("h-16 w-16 rounded-full flex items-center justify-center", item.bgClass)}>
                <Icon className={cn("h-7 w-7", item.iconClass)} strokeWidth={1.75} />
              </div>
              <span className="text-[12px] font-medium text-foreground text-center leading-tight">{item.label}</span>
            </>
          );
          if (item.action) {
            return (
              <button key={item.label} type="button" onClick={item.action} className="flex flex-col items-center gap-2.5">
                {inner}
              </button>
            );
          }
          return (
            <Link key={item.label} href={item.href!} className="flex flex-col items-center gap-2.5">
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Key metrics strip (compact, no graphs, horizontal scroll) ──── */
function KeyMetricsStrip() {
  const { hidden } = useHideAmounts();
  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-semibold text-foreground">Key Metrics</p>
        <Link href="/transactions" className="text-[12px] text-primary font-medium">See all</Link>
      </div>
      <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
        {KEY_METRICS.map((m) => (
          <div key={m.label} className="shrink-0 w-[112px] rounded-xl border border-border bg-card shadow-sm p-3">
            <p className="text-[10px] text-muted-foreground font-medium leading-tight">{m.label}</p>
            <p className="text-[15px] font-bold text-foreground tabular-nums mt-1.5 leading-none"><MaskedNumber value={m.value} hidden={hidden} /></p>
            <div className={cn("flex items-center gap-0.5 text-[10px] font-semibold mt-1.5", m.up ? "text-emerald-700" : "text-red-700 dark:text-red-500")}>
              {m.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              <MaskedNumber value={m.change} hidden={hidden} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Recent transactions ────────────────────────────────────────── */
const TABS = ["all", "success", "failed"] as const;
type TxnTab = typeof TABS[number];

const STATUS_BADGE = {
  success: { label: "Completed", text: "text-emerald-700 dark:text-emerald-500", border: "border-emerald-500/50 dark:border-emerald-600/50" },
  failed:  { label: "Failed",    text: "text-red-700 dark:text-red-500",                        border: "border-red-600/50"                            },
  pending: { label: "Pending",   text: "text-amber-700 dark:text-amber-500",      border: "border-amber-700/60 dark:border-amber-500/60"     },
} as const;

const TXN_ICON = {
  success: ArrowDownLeft,
  failed:  XCircle,
  pending: Clock,
} as const;

function RecentTransactions() {
  const [tab, setTab] = useState<TxnTab>("all");
  const { hidden } = useHideAmounts();

  const filtered = tab === "all"
    ? RECENT_TXN
    : RECENT_TXN.filter((t) => (tab === "success" ? t.status === "success" : t.status === "failed"));

  return (
    <div className="mx-4 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <p className="text-[15px] font-bold text-foreground">Recent transactions</p>
        <Link
          href="/transactions"
          className="text-[12px] text-primary font-medium"
        >
          See all
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mx-4 mb-3 bg-muted/60 p-1 rounded-xl">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-1.5 text-[12px] font-medium rounded-lg capitalize transition-colors",
              tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            {t === "all" ? "All" : t === "success" ? "Success" : "Failed"}
          </button>
        ))}
      </div>

      {/* Rows — fixed min-height = 5 rows so card height is constant across tabs */}
      <div className="divide-y divide-border border-t border-border min-h-[340px]">
        {filtered.length === 0 ? (
          <p className="px-4 py-6 text-center text-[13px] text-muted-foreground">No transactions</p>
        ) : filtered.map((txn) => {
          const Icon    = TXN_ICON[txn.status];
          const badge   = STATUS_BADGE[txn.status];
          const isSuccess = txn.status === "success";
          const isFailed  = txn.status === "failed";
          return (
            <div key={txn.id} className="flex items-center gap-3.5 px-4 py-3.5">
              <div className="h-11 w-11 rounded-full bg-muted/70 flex items-center justify-center shrink-0">
                <Icon
                  className={cn(
                    "h-[19px] w-[19px]",
                    txn.status === "success" ? "text-emerald-700"
                      : txn.status === "failed" ? "text-red-700 dark:text-red-500"
                      : "text-amber-700"
                  )}
                  strokeWidth={2.25}
                />
              </div>

              {/* Name + method */}
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-bold text-foreground truncate">{txn.name}</p>
                <p className="text-[11.5px] text-muted-foreground mt-0.5">{txn.method} · {txn.time}</p>
              </div>

              {/* Amount + outlined badge */}
              <div className="text-right shrink-0">
                <p className={cn(
                  "text-[14px] font-bold tabular-nums leading-tight",
                  isSuccess ? "text-foreground"
                    : isFailed ? "text-red-700 dark:text-red-500"
                    : "text-amber-700 dark:text-amber-500"
                )}>
                  <MaskedNumber value={`${isSuccess ? "+" : isFailed ? "−" : ""}${txn.amount}`} hidden={hidden} />
                </p>
                <span className={cn(
                  "mt-1 inline-block text-[11px] font-medium px-2 py-0.5 rounded-md border bg-transparent",
                  badge.text, badge.border
                )}>
                  {badge.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Root ───────────────────────────────────────────────────────── */
export function MobileDashboardHome({
  onCreatePaymentLink,
  onTapToPay,
}: { onCreatePaymentLink?: () => void; onTapToPay?: () => void } = {}) {
  return (
    <div className="space-y-3 pb-2">

      {/* ① Chart cards — snapping horizontal carousel */}
      <div
        className="overflow-x-auto snap-x snap-mandatory"
        style={{
          scrollbarWidth: "none",
          scrollPaddingLeft: "16px",
          WebkitOverflowScrolling: "touch",
        } as React.CSSProperties}
      >
        <div className="flex gap-3 px-4">
          <div className="shrink-0 snap-start w-[330px]">
            <GrossVolumeCard />
          </div>
          <div className="shrink-0 snap-start w-[330px]">
            <PaymentSuccessCard />
          </div>
          <div className="shrink-0 w-2" aria-hidden />
        </div>
      </div>

      {/* ② Key metrics strip — now below charts */}
      <KeyMetricsStrip />

      {/* ③ Request payment */}
      <RequestPaymentSection onCreatePaymentLink={onCreatePaymentLink} onTapToPay={onTapToPay} />

      {/* ④ Needs attention */}
      <NeedsAttentionCard />

      {/* ③ Quick access */}
      <QuickAccessSection onCreatePaymentLink={onCreatePaymentLink} />

      {/* ⑤ Recent transactions — self-contained card with mx-4 */}
      <RecentTransactions />

    </div>
  );
}
