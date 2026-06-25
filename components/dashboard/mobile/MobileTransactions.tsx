"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search, X, SlidersHorizontal, Wallet, Landmark, CreditCard, ChevronDown, Check, Download, Plus,
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
  { id: "GID-008", txDetailId: "tx8", customerName: "Karan Kapoor",   customerEmail: "karan.kapoor@gmail.com",  date: "04 Jun", time: "07:22 AM", paymentMethod: "card",       cardNetwork: "visa",       cardLast4: "3391", amount:  8750,    currency: "INR", status: "failed"  },
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

/* ── Chip filter types ──────────────────────────────────────────────── */
type ChipId = "status" | "datetime" | "method" | "amount" | "currency";

type ChipFilters = {
  status: Set<string>;
  datetime: { preset: string | null; from: string; to: string };
  method: Set<string>;
  amount: { min: string; max: string };
  currency: string;
};

function emptyChipFilters(): ChipFilters {
  return { status: new Set(), datetime: { preset: null, from: "", to: "" }, method: new Set(), amount: { min: "", max: "" }, currency: "" };
}

function cloneChipFilters(f: ChipFilters): ChipFilters {
  return { ...f, status: new Set(f.status), method: new Set(f.method), datetime: { ...f.datetime }, amount: { ...f.amount } };
}

function isChipActive(f: ChipFilters, id: ChipId): boolean {
  switch (id) {
    case "status":   return f.status.size > 0;
    case "datetime": return f.datetime.preset !== null || (f.datetime.from !== "" && f.datetime.to !== "");
    case "method":   return f.method.size > 0;
    case "amount":   return f.amount.min !== "" || f.amount.max !== "";
    case "currency": return f.currency !== "";
  }
}

const DATE_PRESET_LABELS: Record<string, string> = {
  today: "Today", "7d": "Last 7 days", "30d": "Last 30 days", "3m": "Last 3 months", custom: "Custom",
};

function getChipLabel(f: ChipFilters, id: ChipId): string {
  const SL: Record<string, string> = { success: "Completed", pending: "Pending", failed: "Failed", refunded: "Refunded" };
  const ML: Record<string, string> = { upi: "UPI", card: "Card", netbanking: "Net Banking" };
  switch (id) {
    case "status": {
      if (f.status.size === 0) return "Status";
      const txt = [...f.status].map(s => SL[s] ?? s).join(", ");
      return txt.length > 18 ? txt.slice(0, 17) + "…" : txt;
    }
    case "datetime": {
      const { preset, from, to } = f.datetime;
      if (preset === "custom" && from && to) return `${from} – ${to}`;
      if (preset) return DATE_PRESET_LABELS[preset] ?? "Date & Time";
      return "Date & Time";
    }
    case "method": {
      if (f.method.size === 0) return "Payment Method";
      const txt = [...f.method].map(m => ML[m] ?? m).join(", ");
      return txt.length > 18 ? txt.slice(0, 17) + "…" : txt;
    }
    case "amount": {
      const { min, max } = f.amount;
      if (!min && !max) return "Amount";
      if (min && max) return `₹${min} – ₹${max}`;
      return min ? `≥ ₹${min}` : `≤ ₹${max}`;
    }
    case "currency": return f.currency || "Currency";
  }
}

/* ── Chip constants ─────────────────────────────────────────────────── */
const CHIPS: { id: ChipId; label: string }[] = [
  { id: "status",   label: "Status"         },
  { id: "datetime", label: "Date & Time"    },
  { id: "method",   label: "Payment Method" },
  { id: "amount",   label: "Amount"         },
  { id: "currency", label: "Currency"       },
];

const CHIP_STATUS_OPTS = [
  { id: "success",  label: "Completed", color: "text-emerald-700", bg: "bg-emerald-50" },
  { id: "pending",  label: "Pending",   color: "text-amber-700",   bg: "bg-amber-50"   },
  { id: "failed",   label: "Failed",    color: "text-red-700",     bg: "bg-red-50"     },
  { id: "refunded", label: "Refunded",  color: "text-red-700",     bg: "bg-red-50"     },
];

const CHIP_DATE_PRESETS = [
  { id: "today",  label: "Today"         },
  { id: "7d",     label: "Last 7 days"   },
  { id: "30d",    label: "Last 30 days"  },
  { id: "3m",     label: "Last 3 months" },
  { id: "custom", label: "Custom range"  },
];

const CHIP_METHOD_OPTS = [
  { id: "upi",        label: "UPI"         },
  { id: "card",       label: "Card"        },
  { id: "netbanking", label: "Net Banking" },
];

const CHIP_CURRENCY_OPTS = ["INR", "USD", "EUR", "GBP"];

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
  const [searchQuery,  setSearchQuery]  = useState("");
  const [openChip,     setOpenChip]     = useState<ChipId | null>(null);
  const [chipFilters,  setChipFilters]  = useState<ChipFilters>(emptyChipFilters());
  const [chipDraft,    setChipDraft]    = useState<ChipFilters>(emptyChipFilters());
  const [dropdownPos,  setDropdownPos]  = useState<{ left: number; top: number }>({ left: 16, top: 0 });

  const rootRef     = useRef<HTMLDivElement>(null);
  const chipBtnRefs = useRef<Partial<Record<ChipId, HTMLButtonElement | null>>>({});

  useEffect(() => { setDropdownOpen(false); }, [period]);

  const { hidden } = useHideAmounts();

  const openChipPanel = (id: ChipId) => {
    setChipDraft(cloneChipFilters(chipFilters));
    const btn  = chipBtnRefs.current[id];
    const root = rootRef.current;
    if (btn && root) {
      const br = btn.getBoundingClientRect();
      const rr = root.getBoundingClientRect();
      const left = Math.max(0, Math.min(br.left - rr.left, rr.width - 244));
      setDropdownPos({ left, top: br.bottom - rr.top + 4 });
    }
    setOpenChip(id);
  };

  const applyChipFilter = () => { setChipFilters(cloneChipFilters(chipDraft)); setOpenChip(null); };

  const clearChip = (id: ChipId) => {
    setChipFilters(prev => {
      const next = cloneChipFilters(prev);
      if (id === "status")   next.status   = new Set();
      if (id === "datetime") next.datetime = { preset: null, from: "", to: "" };
      if (id === "method")   next.method   = new Set();
      if (id === "amount")   next.amount   = { min: "", max: "" };
      if (id === "currency") next.currency = "";
      return next;
    });
    setOpenChip(null);
  };

  const renderChipPanel = () => {
    if (!openChip) return null;
    switch (openChip) {
      case "status":
        return (
          <div className="divide-y divide-border/50">
            {CHIP_STATUS_OPTS.map(s => {
              const checked = chipDraft.status.has(s.id);
              return (
                <button key={s.id} type="button"
                  onClick={() => setChipDraft(prev => {
                    const status = new Set(prev.status);
                    if (status.has(s.id)) status.delete(s.id); else status.add(s.id);
                    return { ...prev, status };
                  })}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-muted/20">
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold", s.bg, s.color)}>{s.label}</span>
                  <span className="flex-1" />
                  <span className={cn("h-[18px] w-[18px] rounded-md border-2 flex items-center justify-center shrink-0 transition-colors", checked ? "bg-primary border-primary" : "border-border")}>
                    {checked && <svg viewBox="0 0 10 8" className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 3.5 6.5 9 1" /></svg>}
                  </span>
                </button>
              );
            })}
          </div>
        );
      case "datetime":
        return (
          <div>
            <div className="divide-y divide-border/50">
              {CHIP_DATE_PRESETS.map(p => {
                const sel = chipDraft.datetime.preset === p.id;
                return (
                  <button key={p.id} type="button"
                    onClick={() => setChipDraft(prev => ({ ...prev, datetime: { ...prev.datetime, preset: p.id } }))}
                    className="w-full flex items-center justify-between px-4 py-3 text-left active:bg-muted/20">
                    <span className={cn("text-[13px]", sel ? "font-semibold text-foreground" : "text-muted-foreground")}>{p.label}</span>
                    <span className={cn("h-[18px] w-[18px] rounded-full border-2 flex items-center justify-center shrink-0", sel ? "border-primary" : "border-border")}>
                      {sel && <span className="h-2 w-2 rounded-full bg-primary block" />}
                    </span>
                  </button>
                );
              })}
            </div>
            {chipDraft.datetime.preset === "custom" && (
              <div className="px-4 pt-2 pb-1 space-y-2 border-t border-border/50">
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground mb-1">From</p>
                  <input type="date" value={chipDraft.datetime.from}
                    onChange={e => setChipDraft(prev => ({ ...prev, datetime: { ...prev.datetime, from: e.target.value } }))}
                    className="w-full rounded-xl border border-border px-3 py-2 text-[12px] bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground mb-1">To</p>
                  <input type="date" value={chipDraft.datetime.to}
                    onChange={e => setChipDraft(prev => ({ ...prev, datetime: { ...prev.datetime, to: e.target.value } }))}
                    className="w-full rounded-xl border border-border px-3 py-2 text-[12px] bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
            )}
          </div>
        );
      case "method":
        return (
          <div className="divide-y divide-border/50">
            {CHIP_METHOD_OPTS.map(mo => {
              const checked = chipDraft.method.has(mo.id);
              const Icon = mo.id === "upi" ? Wallet : mo.id === "card" ? CreditCard : Landmark;
              return (
                <button key={mo.id} type="button"
                  onClick={() => setChipDraft(prev => {
                    const method = new Set(prev.method);
                    if (method.has(mo.id)) method.delete(mo.id); else method.add(mo.id);
                    return { ...prev, method };
                  })}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-muted/20">
                  <Icon className={cn("h-[15px] w-[15px] shrink-0", checked ? "text-primary" : "text-muted-foreground")} strokeWidth={1.75} />
                  <span className={cn("flex-1 text-[13px]", checked ? "font-semibold text-foreground" : "text-muted-foreground")}>{mo.label}</span>
                  <span className={cn("h-[18px] w-[18px] rounded-md border-2 flex items-center justify-center shrink-0 transition-colors", checked ? "bg-primary border-primary" : "border-border")}>
                    {checked && <svg viewBox="0 0 10 8" className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 3.5 6.5 9 1" /></svg>}
                  </span>
                </button>
              );
            })}
          </div>
        );
      case "amount":
        return (
          <div className="px-4 pt-3 pb-1">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <p className="text-[11px] font-medium text-muted-foreground mb-1">Min</p>
                <input type="number" placeholder="0" value={chipDraft.amount.min}
                  onChange={e => setChipDraft(prev => ({ ...prev, amount: { ...prev.amount, min: e.target.value } }))}
                  className="w-full rounded-xl border border-border px-3 py-2 text-[13px] bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <p className="text-[10px] text-muted-foreground mt-0.5">INR</p>
              </div>
              <span className="text-[13px] text-muted-foreground mb-[22px]">–</span>
              <div className="flex-1">
                <p className="text-[11px] font-medium text-muted-foreground mb-1">Max</p>
                <input type="number" placeholder="∞" value={chipDraft.amount.max}
                  onChange={e => setChipDraft(prev => ({ ...prev, amount: { ...prev.amount, max: e.target.value } }))}
                  className="w-full rounded-xl border border-border px-3 py-2 text-[13px] bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <p className="text-[10px] text-muted-foreground mt-0.5">INR</p>
              </div>
            </div>
          </div>
        );
      case "currency":
        return (
          <div className="divide-y divide-border/50">
            {CHIP_CURRENCY_OPTS.map(c => {
              const sel = chipDraft.currency === c;
              return (
                <button key={c} type="button"
                  onClick={() => setChipDraft(prev => ({ ...prev, currency: prev.currency === c ? "" : c }))}
                  className="w-full flex items-center justify-between px-4 py-3 text-left active:bg-muted/20">
                  <span className={cn("text-[13px]", sel ? "font-semibold text-foreground" : "text-muted-foreground")}>{c}</span>
                  <span className={cn("h-[18px] w-[18px] rounded-full border-2 flex items-center justify-center shrink-0", sel ? "border-primary" : "border-border")}>
                    {sel && <span className="h-2 w-2 rounded-full bg-primary block" />}
                  </span>
                </button>
              );
            })}
          </div>
        );
      default: return null;
    }
  };

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
    .filter(t => !f.country || t.currency === f.country)
    .filter(t => chipFilters.status.size === 0 || chipFilters.status.has(t.status))
    .filter(t => chipFilters.method.size === 0 || chipFilters.method.has(t.paymentMethod))
    .filter(t => {
      const { min, max } = chipFilters.amount;
      if (min !== "" && t.amount < parseFloat(min)) return false;
      if (max !== "" && t.amount > parseFloat(max)) return false;
      return true;
    })
    .filter(t => chipFilters.currency === "" || t.currency === chipFilters.currency);

  const m = METRICS[period];

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div ref={rootRef} className="space-y-3 pb-10 bg-background relative min-h-full">

      {/* Click-outside overlay — closes period dropdown and chip panels */}
      {(dropdownOpen || openChip !== null) && (
        <div className="absolute inset-0 z-[19]" onClick={() => { setDropdownOpen(false); setOpenChip(null); }} />
      )}

      {/* Zone 1 — Period selector (sticky) */}
      <div className="bg-background px-4 pt-3.5 pb-2.5 overflow-visible">
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

        {/* Filter chips — active chips float to the left */}
        <div className="flex gap-2 px-4 pb-2.5 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
          {[...CHIPS].sort((a, b) => {
            const aActive = isChipActive(chipFilters, a.id) ? 0 : 1;
            const bActive = isChipActive(chipFilters, b.id) ? 0 : 1;
            return aActive - bActive;
          }).map(chip => {
            const active = isChipActive(chipFilters, chip.id);
            return (
              <button
                key={chip.id}
                ref={el => { chipBtnRefs.current[chip.id] = el; }}
                type="button"
                onClick={() => openChipPanel(chip.id)}
                className={cn(
                  "flex items-center gap-1 h-8 text-[12px] font-medium transition-colors whitespace-nowrap shrink-0",
                  active
                    ? "bg-primary text-white rounded-xl pl-3 pr-1.5"
                    : "border border-dashed border-border bg-white text-muted-foreground rounded-xl px-3"
                )}
              >
                {!active && (
                  <Plus className="h-[11px] w-[11px] text-muted-foreground/60 shrink-0" strokeWidth={2} />
                )}
                <span>{getChipLabel(chipFilters, chip.id)}</span>
                {active && (
                  <span
                    role="button"
                    className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white/20 shrink-0 ml-0.5"
                    onClick={e => { e.stopPropagation(); clearChip(chip.id); }}
                  >
                    <X className="h-[10px] w-[10px] text-white" strokeWidth={2.5} />
                  </span>
                )}
              </button>
            );
          })}
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

      {/* Chip dropdown panel — rendered at root level to escape overflow-hidden container */}
      {openChip !== null && (
        <div
          className="absolute z-[30] bg-white rounded-2xl border border-border overflow-hidden"
          style={{
            left: dropdownPos.left,
            top: dropdownPos.top,
            minWidth: 228,
            maxWidth: 260,
            boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
          }}
        >
          <div className="overflow-y-auto" style={{ maxHeight: 260 }}>
            {renderChipPanel()}
          </div>
          <div className="px-3 py-3 border-t border-border/50">
            <button type="button" onClick={applyChipFilter}
              className="w-full py-2.5 rounded-xl bg-primary text-white text-[13px] font-bold active:scale-[0.98] transition-all">
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
