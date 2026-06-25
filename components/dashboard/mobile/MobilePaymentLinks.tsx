"use client";

import { useState } from "react";
import { Search, X, Check, Download, Plus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ────────────────────────────────────────────────────────── */
type PLStatus = "active" | "paid" | "expired" | "deactivated";
type PLTab    = "all" | PLStatus;
type Period   = "1D" | "1W" | "1M" | "3M" | "YTD";

type PaymentLink = {
  id: string;
  amount: number;
  currency: string;
  status: PLStatus;
  customerName: string;
  customerEmail: string;
  paymentFor: string;
  createdAt: string;
};

/* ── Mock data ────────────────────────────────────────────────────── */
const PAYMENT_LINKS: PaymentLink[] = [
  {
    id: "PL-001",
    amount: 13.00,
    currency: "USD",
    status: "active",
    customerName: "Deepankar Raj",
    customerEmail: "deepankar@payglocal.in",
    paymentFor: "Professional website design",
    createdAt: "19 Feb '26 · 02:00 PM",
  },
  {
    id: "PL-002",
    amount: 1003.00,
    currency: "USD",
    status: "paid",
    customerName: "John Miller Antonio",
    customerEmail: "john.miller@example.com",
    paymentFor: "Video design freelance",
    createdAt: "19 Feb '26 · 02:00 PM",
  },
  {
    id: "PL-003",
    amount: 100003.00,
    currency: "USD",
    status: "active",
    customerName: "Deepankar Raj",
    customerEmail: "deepankar@payglocal.in",
    paymentFor: "Test description",
    createdAt: "19 Feb '26 · 02:00 PM",
  },
  {
    id: "PL-004",
    amount: 103.00,
    currency: "USD",
    status: "deactivated",
    customerName: "John Miller Antonio",
    customerEmail: "john.miller@example.com",
    paymentFor: "Website design services",
    createdAt: "19 Feb '26 · 02:00 PM",
  },
];

/* ── Period selector ──────────────────────────────────────────────── */
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

/* ── Metrics per period ───────────────────────────────────────────── */
type PLMetric = {
  totalCollected: string; collectDelta: string; collectPos: boolean;
  totalLinks:     string; linkDelta:    string; linkPos:    boolean;
  paid:           string; paidDelta:    string; paidPos:    boolean;
  activeLinks:    string; activeDelta:  string; activePos:  boolean;
};

const PL_METRICS: Record<Period, PLMetric> = {
  "1D":  { totalCollected: "$1,16,119.00", collectDelta: "+12.3% vs last", collectPos: true, totalLinks: "4",   linkDelta: "+4",  linkPos: true, paid: "1",  paidDelta: "+1",  paidPos: true, activeLinks: "2",  activeDelta: "+2",  activePos: true },
  "1W":  { totalCollected: "$4,82,440.00", collectDelta: "+9.8% vs last",  collectPos: true, totalLinks: "14",  linkDelta: "+6",  linkPos: true, paid: "4",  paidDelta: "+2",  paidPos: true, activeLinks: "6",  activeDelta: "+3",  activePos: true },
  "1M":  { totalCollected: "$19,48,220.00",collectDelta: "+6.1% vs last",  collectPos: true, totalLinks: "52",  linkDelta: "+18", linkPos: true, paid: "16", paidDelta: "+5",  paidPos: true, activeLinks: "20", activeDelta: "+4",  activePos: true },
  "3M":  { totalCollected: "$57,24,100.00",collectDelta: "+14.4% vs last", collectPos: true, totalLinks: "148", linkDelta: "+44", linkPos: true, paid: "42", paidDelta: "+12", paidPos: true, activeLinks: "54", activeDelta: "+10", activePos: true },
  "YTD": { totalCollected: "$93,10,500.00",collectDelta: "+22.7% vs last", collectPos: true, totalLinks: "230", linkDelta: "+72", linkPos: true, paid: "68", paidDelta: "+20", paidPos: true, activeLinks: "82", activeDelta: "+18", activePos: true },
};

/* ── Sparkline data ───────────────────────────────────────────────── */
const PL_SPARK = {
  collected: [8200, 9400, 11000, 10500, 13200, 15800, 18400, 116119],
  links:     [0,    0,    1,     1,     2,     3,     3,     4     ],
  paid:      [0,    0,    0,     0,     0,     0,     0,     1     ],
  active:    [0,    0,    1,     1,     1,     2,     2,     2     ],
};

/* ── Tab definitions ──────────────────────────────────────────────── */
const PL_TABS: { id: PLTab; label: string; showCheck?: boolean }[] = [
  { id: "all",         label: "All"         },
  { id: "active",      label: "Active"      },
  { id: "paid",        label: "Paid", showCheck: true },
  { id: "expired",     label: "Expired"     },
  { id: "deactivated", label: "Deactivated" },
];

/* ── Status display config ────────────────────────────────────────── */
const STATUS_CFG: Record<PLStatus, {
  label: string;
  color: string;
  amountColor: string;
  showCheck: boolean;
}> = {
  active:      { label: "Active",      color: "text-emerald-600",      amountColor: "text-emerald-600",      showCheck: false },
  paid:        { label: "Paid",        color: "text-emerald-600",      amountColor: "text-emerald-600",      showCheck: true  },
  expired:     { label: "Expired",     color: "text-muted-foreground", amountColor: "text-muted-foreground", showCheck: false },
  deactivated: { label: "Deactivated", color: "text-muted-foreground", amountColor: "text-muted-foreground", showCheck: false },
};

/* ── Helpers ──────────────────────────────────────────────────────── */
function fmtAmount(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

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

/* ── Component ────────────────────────────────────────────────────── */
export function MobilePaymentLinks({ onCardTap }: { onCardTap?: (id: string) => void }) {
  const [tab,          setTab]          = useState<PLTab>("all");
  const [search,       setSearch]       = useState("");
  const [period,       setPeriod]       = useState<Period>("1D");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const q = search.trim().toLowerCase();
  const filtered = PAYMENT_LINKS
    .filter(pl => tab === "all" || pl.status === tab)
    .filter(pl =>
      !q ||
      pl.customerName.toLowerCase().includes(q) ||
      pl.customerEmail.toLowerCase().includes(q) ||
      pl.id.toLowerCase().includes(q)
    );

  const m = PL_METRICS[period];

  return (
    <div className="space-y-3 pb-10 bg-background min-h-full">

      {/* Click-outside overlay */}
      {dropdownOpen && (
        <div className="fixed inset-0 z-[19]" onClick={() => setDropdownOpen(false)} />
      )}

      {/* Zone 1 — Period selector */}
      <div className="bg-background px-4 pt-3.5 pb-2.5">
        <div className="flex items-center justify-between gap-3">

          <p className="text-[14px] font-bold text-foreground leading-none">
            {PERIOD_LABELS[period]}
          </p>

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

            {dropdownOpen && (
              <div
                className="absolute right-0 top-full mt-1.5 bg-white rounded-2xl border border-border overflow-hidden min-w-[130px]"
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

        {/* Total Collected */}
        <div className="rounded-2xl border border-border bg-card shadow-sm px-4 py-3.5 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-muted-foreground mb-1">Total Collected</p>
            <p className="text-[26px] font-bold text-foreground tabular-nums leading-tight">
              {m.totalCollected}
            </p>
            <p className={cn("text-[11.5px] font-medium mt-1.5", m.collectPos ? "text-emerald-600" : "text-red-600")}>
              {m.collectDelta}
            </p>
          </div>
          <div className="shrink-0">
            <Sparkline data={PL_SPARK.collected} color="#3b82f6" w={120} h={48} />
          </div>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-3 gap-2.5">

          {/* Total Links */}
          <div className="rounded-2xl border border-border bg-card shadow-sm px-3 py-3 flex flex-col">
            <p className="text-[10px] font-medium text-muted-foreground leading-none mb-1.5">Total Links</p>
            <p className="text-[14px] font-bold text-foreground tabular-nums leading-tight">{m.totalLinks}</p>
            <p className={cn("text-[10.5px] font-semibold mt-1", m.linkPos ? "text-emerald-600" : "text-red-600")}>
              {m.linkDelta}
            </p>
            <div className="mt-2">
              <Sparkline data={PL_SPARK.links} color="#10b981" w={80} h={28} />
            </div>
          </div>

          {/* Paid */}
          <div className="rounded-2xl border border-border bg-card shadow-sm px-3 py-3 flex flex-col">
            <p className="text-[10px] font-medium text-muted-foreground leading-none mb-1.5">Paid</p>
            <p className="text-[14px] font-bold text-foreground tabular-nums leading-tight">{m.paid}</p>
            <p className={cn("text-[10.5px] font-semibold mt-1", m.paidPos ? "text-emerald-600" : "text-red-600")}>
              {m.paidDelta}
            </p>
            <div className="mt-2">
              <Sparkline data={PL_SPARK.paid} color="#10b981" w={80} h={28} />
            </div>
          </div>

          {/* Active */}
          <div className="rounded-2xl border border-border bg-card shadow-sm px-3 py-3 flex flex-col">
            <p className="text-[10px] font-medium text-muted-foreground leading-none mb-1.5">Active</p>
            <p className="text-[14px] font-bold text-foreground tabular-nums leading-tight">{m.activeLinks}</p>
            <p className={cn("text-[10.5px] font-semibold mt-1", m.activePos ? "text-emerald-600" : "text-red-600")}>
              {m.activeDelta}
            </p>
            <div className="mt-2">
              <Sparkline data={PL_SPARK.active} color="#10b981" w={80} h={28} />
            </div>
          </div>

        </div>
      </div>

      {/* Zone 3 — All Payment Links container */}
      <div className="mx-4 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">

        {/* Section header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 gap-2">
          <p className="text-[15px] font-bold text-foreground shrink-0">All Payment Links</p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-[11.5px] font-medium text-muted-foreground active:bg-muted/40 transition-colors"
            >
              <Download className="h-[12px] w-[12px]" strokeWidth={2} />
              Report
            </button>
            <button
              type="button"
              className="h-[30px] w-[30px] flex items-center justify-center rounded-lg bg-primary text-white active:scale-[0.97] transition-all shrink-0"
            >
              <Plus className="h-[14px] w-[14px]" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2.5 bg-muted/50 rounded-xl px-3.5 py-2.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={2} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by customer, email, ID..."
              className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none min-w-0"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")}>
                <X className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        {/* Tab strip */}
        <div
          className="flex gap-1 mx-4 mb-3 bg-muted/60 p-1 rounded-xl overflow-x-auto [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {PL_TABS.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-0.5 py-1.5 text-[11.5px] font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 px-1",
                tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              {t.label}
              {t.showCheck && <Check className="h-[10px] w-[10px]" strokeWidth={2.5} />}
            </button>
          ))}
        </div>

        {/* Card rows */}
        <div className="divide-y divide-border">
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-muted-foreground">No payment links</p>
          ) : filtered.map(pl => {
            const cfg = STATUS_CFG[pl.status];
            return (
              <button
                key={pl.id}
                type="button"
                onClick={() => onCardTap?.(pl.id)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left active:bg-muted/30 transition-colors duration-100"
              >
                {/* Left block */}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-foreground leading-snug truncate">{pl.customerName}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug truncate">{pl.customerEmail}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug truncate">
                    {pl.paymentFor.length > 28 ? `${pl.paymentFor.slice(0, 28)}...` : pl.paymentFor}
                  </p>
                </div>

                {/* Right block */}
                <div className="shrink-0 text-right flex flex-col items-end gap-1">
                  <p className="leading-snug">
                    <span className={cn("text-[13.5px] font-bold tabular-nums", cfg.amountColor)}>
                      {fmtAmount(pl.amount)}
                    </span>
                    <span className="text-[11px] text-muted-foreground ml-1">{pl.currency}</span>
                  </p>
                  <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium leading-snug", cfg.color)}>
                    <span className="h-[5px] w-[5px] rounded-full bg-current shrink-0" />
                    {cfg.label}
                    {cfg.showCheck && <Check className="h-[9px] w-[9px] shrink-0" strokeWidth={2.5} />}
                  </span>
                  <p className="text-[11px] text-muted-foreground leading-snug">{pl.createdAt}</p>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
