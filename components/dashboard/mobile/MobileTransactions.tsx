"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft, XCircle, Clock, RotateCcw,
  AlertTriangle, Info, Search, CirclePlus, X,
  ChevronsUpDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useHideAmounts, MaskedNumber } from "@/lib/hide-amounts-context";

/* ─── Types ───────────────────────────────────────────────────────── */
type TxnStatus = "success" | "failed" | "pending" | "refunded";
type TxnTab    = "all" | "success" | "refunded" | "failed";
type Period    = "1D" | "1W" | "1M" | "3M" | "YTD";

/* ─── Period chips ────────────────────────────────────────────────── */
const PERIODS: { id: Period; label: string }[] = [
  { id: "1D",  label: "Today" },
  { id: "1W",  label: "1W"    },
  { id: "1M",  label: "1M"    },
  { id: "3M",  label: "3M"    },
  { id: "YTD", label: "YTD"   },
];

/* ─── Period-based metrics ────────────────────────────────────────── */
const PERIOD_METRICS: Record<Period, {
  collected: string; payments: number;
  refunds: string; refundsCount: number;
  disputes: string; disputesOpen: number;
  failed: number;
}> = {
  "1D":  { collected:"₹9,42,800",       payments:1284,   refunds:"₹18,500",    refundsCount:24,  disputes:"₹14,200",    disputesOpen:4,  failed:78   },
  "1W":  { collected:"₹47,77,000",      payments:6425,   refunds:"₹92,400",    refundsCount:118, disputes:"₹68,500",    disputesOpen:12, failed:312  },
  "1M":  { collected:"₹1,87,40,000",    payments:25340,  refunds:"₹3,62,800",  refundsCount:485, disputes:"₹2,14,600",  disputesOpen:32, failed:1203 },
  "3M":  { collected:"₹5,82,20,000",    payments:76480,  refunds:"₹11,24,500", refundsCount:1480,disputes:"₹6,84,200",  disputesOpen:86, failed:3842 },
  "YTD": { collected:"₹9,42,00,000",    payments:124800, refunds:"₹18,20,600", refundsCount:2410,disputes:"₹11,48,400", disputesOpen:142,failed:6254 },
};

/* ─── Dummy transactions ──────────────────────────────────────────── */
const ALL_TXNS: {
  id: string; name: string; amount: string; method: string;
  status: TxnStatus; time: string;
}[] = [
  { id:"t1",  name:"Priya Mehta",      amount:"₹4,500",   method:"UPI",         status:"success",  time:"2m ago"   },
  { id:"t2",  name:"Rajan Stores",     amount:"₹12,200",  method:"Card",        status:"success",  time:"18m ago"  },
  { id:"t3",  name:"SwiftPay Ltd",     amount:"₹890",     method:"Net Banking", status:"failed",   time:"34m ago"  },
  { id:"t4",  name:"Ananya Kapoor",    amount:"₹2,100",   method:"UPI",         status:"pending",  time:"1h ago"   },
  { id:"t5",  name:"Globaltech Inc",   amount:"₹67,800",  method:"Card",        status:"success",  time:"2h ago"   },
  { id:"t6",  name:"Meera Sharma",     amount:"₹3,250",   method:"UPI",         status:"refunded", time:"3h ago"   },
  { id:"t7",  name:"Techno Ventures",  amount:"₹18,500",  method:"Card",        status:"success",  time:"4h ago"   },
  { id:"t8",  name:"Sunrise Foods",    amount:"₹5,600",   method:"UPI",         status:"failed",   time:"5h ago"   },
  { id:"t9",  name:"Kiran Patel",      amount:"₹9,400",   method:"Net Banking", status:"refunded", time:"6h ago"   },
  { id:"t10", name:"Digital Mart",     amount:"₹22,100",  method:"Card",        status:"success",  time:"7h ago"   },
  { id:"t11", name:"Falcon Exports",   amount:"₹1,45,000",method:"Wire",        status:"success",  time:"8h ago"   },
  { id:"t12", name:"Raj Electronics",  amount:"₹7,800",   method:"UPI",         status:"failed",   time:"10h ago"  },
  { id:"t13", name:"Sunita Nair",      amount:"₹4,200",   method:"UPI",         status:"success",  time:"11h ago"  },
  { id:"t14", name:"Blue Ocean Ltd",   amount:"₹31,500",  method:"Card",        status:"refunded", time:"12h ago"  },
  { id:"t15", name:"Arjun Mehta",      amount:"₹6,700",   method:"Net Banking", status:"success",  time:"14h ago"  },
  { id:"t16", name:"City Hardware",    amount:"₹14,300",  method:"UPI",         status:"failed",   time:"16h ago"  },
  { id:"t17", name:"Pearl Fashions",   amount:"₹8,900",   method:"Card",        status:"success",  time:"18h ago"  },
  { id:"t18", name:"Omega Solutions",  amount:"₹52,000",  method:"Wire",        status:"refunded", time:"20h ago"  },
];

/* ─── Status config ───────────────────────────────────────────────── */
const STATUS_CFG: Record<TxnStatus, {
  Icon: typeof ArrowDownLeft;
  iconColor: string; iconBg: string;
  text: string; border: string;
  prefix: string; amountColor: string;
  label: string;
}> = {
  success:  { Icon:ArrowDownLeft, iconColor:"text-emerald-700", iconBg:"bg-muted/70", text:"text-emerald-700",             border:"border-emerald-500/50", prefix:"+",  amountColor:"text-foreground",           label:"Completed" },
  failed:   { Icon:XCircle,       iconColor:"text-red-700",     iconBg:"bg-muted/70", text:"text-red-700 dark:text-red-500", border:"border-red-600/50",    prefix:"−",  amountColor:"text-red-700 dark:text-red-500", label:"Failed"   },
  pending:  { Icon:Clock,         iconColor:"text-amber-700",   iconBg:"bg-muted/70", text:"text-amber-700",               border:"border-amber-700/60",   prefix:"",   amountColor:"text-amber-700",            label:"Pending"   },
  refunded: { Icon:RotateCcw,     iconColor:"text-primary",     iconBg:"bg-muted/70", text:"text-primary",                 border:"border-primary/40",     prefix:"−",  amountColor:"text-primary",              label:"Refunded"  },
};

const TABS: { id: TxnTab; label: string }[] = [
  { id:"all",      label:"All"      },
  { id:"success",  label:"Success"  },
  { id:"refunded", label:"Refunded" },
  { id:"failed",   label:"Failed"   },
];

const PAGE_SIZE = 5;

const FILTER_CHIPS = [
  { id: "date",     label: "Date & Time"     },
  { id: "amount",   label: "Amount"          },
  { id: "currency", label: "Currency"        },
  { id: "status",   label: "Status"          },
  { id: "method",   label: "Payment method"  },
  { id: "more",     label: "More filters"    },
] as const;
export type FilterId = typeof FILTER_CHIPS[number]["id"];

/* ─── Styled select helper ────────────────────────────────────────── */
function FilterSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-border bg-card px-3.5 py-3 text-[14px] text-foreground pr-10 focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
  );
}

/* ─── Props ───────────────────────────────────────────────────────── */
interface Props {
  appliedFilters?: Partial<Record<FilterId, string>>;
  onOpenFilter?: (id: FilterId) => void;
  onClearFilter?: (id: FilterId) => void;
}

/* ─── Root ────────────────────────────────────────────────────────── */
export function MobileTransactions({ appliedFilters: appliedProp, onOpenFilter, onClearFilter }: Props = {}) {
  const [period,      setPeriod]    = useState<Period>("1D");
  const [tab,         setTab]       = useState<TxnTab>("all");
  const [visible,     setVisible]   = useState(PAGE_SIZE);
  const [searchQuery, setSearchQuery] = useState("");
  const { hidden } = useHideAmounts();

  /* ── Filter sheet state ─────────────────────────────────────────── */
  const [openFilter, setOpenFilter] = useState<FilterId | null>(null);

  const [dateMode, setDateMode] = useState("is in the last");
  const [dateN,    setDateN]    = useState("7");
  const [dateUnit, setDateUnit] = useState("days");
  const [dateTz,   setDateTz]   = useState<"kolkata" | "utc">("kolkata");

  const [amtMode, setAmtMode] = useState("is equal to");
  const [amtVal,  setAmtVal]  = useState("");

  const [currFilt,  setCurrFilt]  = useState("INR");
  const [selStatus, setSelStatus] = useState<Set<string>>(new Set());
  const [methodFilt, setMethodFilt] = useState("Card");

  const [applied, setApplied] = useState<Partial<Record<FilterId, string>>>({});

  /* ── Helpers ────────────────────────────────────────────────────── */
  const clearFilter = (id: FilterId) => {
    setApplied(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    // Reset draft for that filter
    if (id === "date")     { setDateMode("is in the last"); setDateN("7"); setDateUnit("days"); setDateTz("kolkata"); }
    if (id === "amount")   { setAmtMode("is equal to"); setAmtVal(""); }
    if (id === "currency") { setCurrFilt("INR"); }
    if (id === "status")   { setSelStatus(new Set()); }
    if (id === "method")   { setMethodFilt("Card"); }
  };

  const handleApply = () => {
    if (!openFilter) return;

    if (openFilter === "date") {
      setApplied(prev => ({ ...prev, date: `Last ${dateN} ${dateUnit}` }));
    } else if (openFilter === "amount") {
      const sym = amtMode === "is equal to" ? "=" : amtMode === "is greater than" ? ">" : "<";
      setApplied(prev => ({ ...prev, amount: `${sym} ₹${amtVal || "0"}` }));
    } else if (openFilter === "currency") {
      setApplied(prev => ({ ...prev, currency: currFilt }));
    } else if (openFilter === "status") {
      if (selStatus.size > 0) {
        setApplied(prev => ({ ...prev, status: `${selStatus.size} status${selStatus.size > 1 ? "es" : ""}` }));
      } else {
        setApplied(prev => { const next = { ...prev }; delete next.status; return next; });
      }
    } else if (openFilter === "method") {
      setApplied(prev => ({ ...prev, method: methodFilt }));
    }

    setOpenFilter(null);
  };

  const toggleSelStatus = (s: string) => {
    setSelStatus(prev => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
  };

  /* ── Effective applied (external prop takes priority) ──────────── */
  const effectiveApplied = appliedProp ?? applied;

  const m = PERIOD_METRICS[period];

  const filtered = ALL_TXNS
    .filter(t => tab === "all" || t.status === tab)
    .filter(t => !searchQuery.trim() || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.method.toLowerCase().includes(searchQuery.toLowerCase()));

  const shown   = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  const handleTab = (t: TxnTab) => { setTab(t); setVisible(PAGE_SIZE); };

  /* ── Sheet label ────────────────────────────────────────────────── */
  const filterLabel = FILTER_CHIPS.find(c => c.id === openFilter)?.label ?? "";

  /* ── Sheet header ───────────────────────────────────────────────── */
  const SheetHeader = () => (
    <>
      <div className="flex justify-center pt-3 pb-0 shrink-0">
        <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
      </div>
      <div className="flex items-center justify-between px-5 pt-3 pb-4 border-b border-border/50 shrink-0">
        <h3 className="text-[16px] font-bold text-foreground">Filter by: {filterLabel}</h3>
        <button
          type="button"
          onClick={() => setOpenFilter(null)}
          className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </>
  );

  /* ── Apply button ───────────────────────────────────────────────── */
  const ApplyButton = () => (
    <div className="px-5 pb-6 pt-3 shrink-0">
      <button
        type="button"
        onClick={handleApply}
        className="w-full py-4 rounded-2xl bg-primary text-white text-[15px] font-bold active:scale-[0.98] transition-all"
      >
        Apply
      </button>
    </div>
  );

  /* ── Filter content ─────────────────────────────────────────────── */
  const renderFilterContent = () => {
    switch (openFilter) {
      case "date":
        return (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <FilterSelect value={dateMode} onChange={setDateMode} options={["is in the last", "is after", "is before", "is in range"]} />
            <div className="flex gap-3">
              <input
                type="text"
                value={dateN}
                onChange={e => setDateN(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-card px-3.5 py-3 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex-1">
                <FilterSelect value={dateUnit} onChange={setDateUnit} options={["days", "weeks", "months"]} />
              </div>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-foreground mb-2.5">Timezone</p>
              <div className="flex gap-3">
                {(["kolkata", "utc"] as const).map(tz => (
                  <button
                    key={tz}
                    type="button"
                    onClick={() => setDateTz(tz)}
                    className="flex items-center gap-2 text-[13.5px] text-foreground"
                  >
                    <span className={cn(
                      "h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center shrink-0",
                      dateTz === tz ? "border-primary" : "border-border"
                    )}>
                      {dateTz === tz && <span className="h-2 w-2 rounded-full bg-primary block" />}
                    </span>
                    {tz === "kolkata" ? "Kolkata Time" : "UTC"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case "amount":
        return (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <FilterSelect value={amtMode} onChange={setAmtMode} options={["is equal to", "is greater than", "is less than"]} />
            <div className="flex items-center gap-0 rounded-xl border border-border bg-card overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
              <span className="px-3.5 text-[14px] text-muted-foreground font-medium shrink-0">₹</span>
              <input
                type="number"
                value={amtVal}
                onChange={e => setAmtVal(e.target.value)}
                placeholder="0"
                className="flex-1 bg-transparent py-3 pr-3.5 text-[14px] text-foreground focus:outline-none"
              />
            </div>
          </div>
        );

      case "currency":
        return (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <FilterSelect value={currFilt} onChange={setCurrFilt} options={["INR", "USD", "EUR", "GBP", "AED", "SGD"]} />
          </div>
        );

      case "status":
        return (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
            {["Success", "Failed", "Pending", "Refunded"].map(s => {
              const checked = selStatus.has(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSelStatus(s)}
                  className="w-full flex items-center gap-3 py-3 text-left"
                >
                  <span className={cn(
                    "h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                    checked ? "bg-primary border-primary" : "border-border"
                  )}>
                    {checked && (
                      <svg viewBox="0 0 10 8" className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1 4 3.5 6.5 9 1" />
                      </svg>
                    )}
                  </span>
                  <span className="text-[14px] text-foreground">{s}</span>
                </button>
              );
            })}
          </div>
        );

      case "method":
        return (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <FilterSelect value={methodFilt} onChange={setMethodFilt} options={["Card", "UPI", "Net Banking", "Wire"]} />
          </div>
        );

      case "more":
        return (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <p className="text-[14px] text-muted-foreground">Additional filters coming soon</p>
          </div>
        );

      default:
        return null;
    }
  };

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div className={cn("space-y-3 pb-10 bg-background", !onOpenFilter && "relative min-h-full")}>

        {/* ── Period chips ──────────────────────────────────────────── */}
        <div className="sticky top-0 z-20 bg-background px-4 pt-1 pb-2.5 border-b border-border/30">
          <div className="flex items-center gap-1.5">
            {PERIODS.map((p) => (
              <button key={p.id} type="button" onClick={() => setPeriod(p.id)}
                className={cn(
                  "px-3.5 py-1.5 text-[12px] font-semibold transition-colors rounded-lg",
                  period === p.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Metrics ───────────────────────────────────────────────── */}
        <div className="px-4 space-y-2.5">

          {/* Collected Amount */}
          <div className="rounded-2xl border border-border bg-card shadow-sm px-4 py-3.5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <p className="text-[12.5px] font-semibold text-foreground">Collected Amount</p>
              <Info className="h-3.5 w-3.5 text-muted-foreground/60" strokeWidth={1.75} />
            </div>
            <p className="text-[28px] font-bold text-foreground tabular-nums leading-tight">
              <MaskedNumber value={m.collected} hidden={hidden} rollKey={period} />
            </p>
            <p className="text-[11.5px] text-muted-foreground mt-1">
              from {m.payments.toLocaleString("en-IN")} captured payments
            </p>
          </div>

          {/* Three mini cards */}
          <div className="grid grid-cols-3 gap-2.5">
            <Link href="/settlement-reports"
              className="rounded-2xl border border-border bg-card shadow-sm px-3 py-3 flex flex-col gap-1.5"
            >
              <div className="flex items-center gap-1">
                <RotateCcw className="h-3.5 w-3.5 text-primary shrink-0" strokeWidth={2} />
                <p className="text-[11px] font-semibold text-foreground truncate">Refunds</p>
              </div>
              <p className="text-[15px] font-bold text-foreground tabular-nums leading-tight">
                <MaskedNumber value={m.refunds} hidden={hidden} rollKey={period} />
              </p>
              <p className="text-[10px] text-muted-foreground leading-snug">{m.refundsCount} processed</p>
            </Link>

            <Link href="/dispute-management"
              className="rounded-2xl border border-border bg-card shadow-sm px-3 py-3 flex flex-col gap-1.5"
            >
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-700 shrink-0" strokeWidth={2} />
                <p className="text-[11px] font-semibold text-foreground truncate">Disputes</p>
              </div>
              <p className="text-[15px] font-bold text-amber-700 tabular-nums leading-tight">
                <MaskedNumber value={m.disputes} hidden={hidden} rollKey={period} />
              </p>
              <p className="text-[10px] text-muted-foreground leading-snug">{m.disputesOpen} open</p>
            </Link>

            <div className="rounded-2xl border border-border bg-card shadow-sm px-3 py-3 flex flex-col gap-1.5">
              <div className="flex items-center gap-1">
                <XCircle className="h-3.5 w-3.5 text-red-700 shrink-0" strokeWidth={2} />
                <p className="text-[11px] font-semibold text-foreground truncate">Failed</p>
              </div>
              <p className="text-[15px] font-bold text-red-700 tabular-nums leading-tight">
                <MaskedNumber value={String(m.failed)} hidden={hidden} rollKey={period} />
              </p>
              <p className="text-[10px] text-muted-foreground leading-snug">payments</p>
            </div>
          </div>
        </div>

        {/* ── Transaction list ──────────────────────────────────────── */}
        <div className="mx-4 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <p className="text-[15px] font-bold text-foreground">All Transactions</p>
            {Object.keys(effectiveApplied).length > 0 && (
              <button type="button"
                onClick={() => setApplied({})}
                className="text-[11.5px] text-primary font-semibold"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Search bar */}
          <div className="px-4 pb-2.5">
            <div className="flex items-center gap-2.5 bg-muted/50 rounded-xl px-3.5 py-2.5">
              <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={2} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setVisible(PAGE_SIZE); }}
                placeholder="Search transactions..."
                className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")}>
                  <X className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
                </button>
              )}
            </div>
          </div>

          {/* Filter chips — single row, horizontal scroll, no scrollbar */}
          <div
            className="flex gap-2 px-4 pb-3 overflow-x-auto"
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
          >
            {FILTER_CHIPS.map(chip => {
              const isActive = chip.id in effectiveApplied;
              const appliedLabel = effectiveApplied[chip.id];
              return (
                <div key={chip.id} className="shrink-0 flex items-center">
                  {isActive ? (
                    <div className={cn(
                      "flex items-center rounded-lg border text-[11.5px] font-medium",
                      "bg-primary/[0.08] border-primary/60 text-primary"
                    )}>
                      <button
                        type="button"
                        onClick={() => { if (onOpenFilter) onOpenFilter(chip.id); else setOpenFilter(chip.id); }}
                        className="pl-2.5 pr-1.5 py-1.5"
                      >
                        {appliedLabel}
                      </button>
                      <button
                        type="button"
                        onClick={() => { if (onClearFilter) onClearFilter(chip.id); else clearFilter(chip.id); }}
                        className="pr-2 py-1.5 pl-0.5"
                        aria-label={`Clear ${chip.label} filter`}
                      >
                        <X className="h-3 w-3" strokeWidth={2.5} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { if (onOpenFilter) onOpenFilter(chip.id); else setOpenFilter(chip.id); }}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11.5px] font-medium transition-all",
                        "border-border/60 bg-card text-muted-foreground hover:border-border hover:text-foreground"
                      )}
                    >
                      <CirclePlus className="h-3 w-3" strokeWidth={2} />
                      {chip.label}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mx-4 mb-3 bg-muted/60 p-1 rounded-xl">
            {TABS.map((t) => (
              <button key={t.id} type="button" onClick={() => handleTab(t.id)}
                className={cn(
                  "flex-1 py-1.5 text-[11.5px] font-medium rounded-lg transition-colors",
                  tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-border border-t border-border">
            {shown.length === 0 ? (
              <p className="px-4 py-8 text-center text-[13px] text-muted-foreground">No transactions</p>
            ) : shown.map((txn) => {
              const cfg  = STATUS_CFG[txn.status];
              const Icon = cfg.Icon;
              return (
                <div key={txn.id} className="flex items-center gap-3.5 px-4 py-3.5">
                  {/* Icon */}
                  <div className={cn("h-11 w-11 rounded-full flex items-center justify-center shrink-0", cfg.iconBg)}>
                    <Icon className={cn("h-[19px] w-[19px]", cfg.iconColor)} strokeWidth={2.25} />
                  </div>

                  {/* Name + method */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-bold text-foreground truncate">{txn.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{txn.method} · {txn.time}</p>
                  </div>

                  {/* Amount + badge */}
                  <div className="text-right shrink-0">
                    <p className={cn("text-[14px] font-bold tabular-nums leading-tight", cfg.amountColor)}>
                      {hidden ? "*****" : `${cfg.prefix}${txn.amount}`}
                    </p>
                    <span className={cn(
                      "mt-1 inline-block text-[11px] font-medium px-2 py-0.5 rounded-md border bg-transparent",
                      cfg.text, cfg.border
                    )}>
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load more */}
          {hasMore ? (
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="w-full py-3.5 text-[13px] font-medium text-primary border-t border-border hover:bg-muted/40 transition-colors"
            >
              Load more
            </button>
          ) : shown.length > 0 ? (
            <p className="py-3.5 text-center text-[12px] text-muted-foreground border-t border-border">
              All transactions loaded
            </p>
          ) : null}
        </div>

      {/* ── Filter overlay (only when handling locally, no external handler) ── */}
      {!onOpenFilter && (
        <AnimatePresence>
          {openFilter && (
            <>
              {/* Backdrop */}
              <motion.div
                className="absolute inset-0 z-40 bg-black/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                onClick={() => setOpenFilter(null)}
              />
              {/* Sheet */}
              <motion.div
                className="absolute inset-x-0 bottom-0 z-50 bg-background rounded-t-[24px] flex flex-col"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <SheetHeader />
                {renderFilterContent()}
                <ApplyButton />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
