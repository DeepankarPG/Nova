"use client";

import { useState, useRef } from "react";
import { Search, X, Download, Check, Ban, Circle, Eye, Pencil, RefreshCw, Plus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ────────────────────────────────────────────────────────── */
type InvStatus = "paid" | "active" | "overdue" | "draft";
type InvTab    = "all" | InvStatus;
type Period    = "1D" | "1W" | "1M" | "3M" | "YTD";

type Invoice = {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  status: InvStatus;
  customerName: string;
  customerEmail: string;
  paymentLink: string;
  createdAt: string;
};

/* ── Mock data ────────────────────────────────────────────────────── */
const INVOICES: Invoice[] = [
  {
    id: "INV-001",
    invoiceId: "INV-2026-0090",
    amount: 94400.00,
    currency: "INR",
    status: "paid",
    customerName: "Deepankar Raj",
    customerEmail: "deepankar@payglocal.in",
    paymentLink: "api.payment/48df4...",
    createdAt: "19 Feb '26 · 08:30 AM",
  },
  {
    id: "INV-002",
    invoiceId: "INV-2026-0089",
    amount: 1003.00,
    currency: "USD",
    status: "active",
    customerName: "John Miller Antonio",
    customerEmail: "john.miller@gmail.com",
    paymentLink: "api.payment/29ab2...",
    createdAt: "19 Feb '26 · 08:30 AM",
  },
  {
    id: "INV-003",
    invoiceId: "INV-2026-0088",
    amount: 100003.00,
    currency: "INR",
    status: "overdue",
    customerName: "Deepankar Raj",
    customerEmail: "deepankar@payglocal.in",
    paymentLink: "api.payment/c91f3...",
    createdAt: "19 Feb '26 · 08:30 AM",
  },
  {
    id: "INV-004",
    invoiceId: "INV-2026-0087",
    amount: 103.00,
    currency: "USD",
    status: "draft",
    customerName: "John Miller Antonio",
    customerEmail: "john.miller@gmail.com",
    paymentLink: "api.payment/f72b1...",
    createdAt: "19 Feb '26 · 08:30 AM",
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
type InvMetric = {
  totalInvoiced: string; invDelta: string; invPos: boolean;
  paid:          string; paidDelta: string; paidPos: boolean;
  overdue:       string; overdueDelta: string; overduePos: boolean;
  active:        string; activeDelta: string; activePos: boolean;
};

const INV_METRICS: Record<Period, InvMetric> = {
  "1D":  { totalInvoiced: "₹1,95,506.00",  invDelta: "+18.2% vs last", invPos: true,  paid: "1",  paidDelta: "+1",  paidPos: true,  overdue: "1",  overdueDelta: "+1",  overduePos: false, active: "1",  activeDelta: "+1",  activePos: true  },
  "1W":  { totalInvoiced: "₹8,42,800.00",  invDelta: "+14.6% vs last", invPos: true,  paid: "3",  paidDelta: "+2",  paidPos: true,  overdue: "2",  overdueDelta: "+1",  overduePos: false, active: "4",  activeDelta: "+2",  activePos: true  },
  "1M":  { totalInvoiced: "₹32,10,500.00", invDelta: "+9.3% vs last",  invPos: true,  paid: "11", paidDelta: "+4",  paidPos: true,  overdue: "5",  overdueDelta: "+2",  overduePos: false, active: "14", activeDelta: "+5",  activePos: true  },
  "3M":  { totalInvoiced: "₹94,60,200.00", invDelta: "+21.8% vs last", invPos: true,  paid: "32", paidDelta: "+10", paidPos: true,  overdue: "12", overdueDelta: "+3",  overduePos: false, active: "38", activeDelta: "+12", activePos: true  },
  "YTD": { totalInvoiced: "₹1,54,80,000",  invDelta: "+31.4% vs last", invPos: true,  paid: "52", paidDelta: "+18", paidPos: true,  overdue: "18", overdueDelta: "+5",  overduePos: false, active: "60", activeDelta: "+20", activePos: true  },
};

/* ── Sparkline data ───────────────────────────────────────────────── */
const INV_SPARK = {
  invoiced: [12000, 18000, 24000, 21000, 35000, 48000, 62000, 195506],
  paid:     [0,     0,     0,     0,     0,     0,     0,     1     ],
  overdue:  [0,     0,     0,     0,     0,     0,     0,     1     ],
  active:   [0,     0,     0,     0,     0,     1,     1,     1     ],
};

/* ── Status config ────────────────────────────────────────────────── */
const STATUS_CFG: Record<InvStatus, {
  amountColor: string;
  iconType: "pulse" | "check" | "ban" | "circle";
}> = {
  paid:    { amountColor: "text-emerald-600",      iconType: "check"  },
  active:  { amountColor: "text-primary",           iconType: "pulse"  },
  overdue: { amountColor: "text-red-600",           iconType: "ban"    },
  draft:   { amountColor: "text-muted-foreground",  iconType: "circle" },
};

/* ── Tab definitions ──────────────────────────────────────────────── */
const BASE_TABS: { id: InvTab; label: string }[] = [
  { id: "all",     label: "All"     },
  { id: "active",  label: "Active"  },
  { id: "paid",    label: "Paid"    },
  { id: "overdue", label: "Overdue" },
  { id: "draft",   label: "Draft"   },
];

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

/* ── Swipe-to-reveal card ─────────────────────────────────────────── */
const SWIPE_WIDTH = 225; // 3 actions × 75 px each

function SwipeCard({
  isOpen, onOpen, onClose, onTap, onPreview, onEdit, onStatus, children,
}: {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onTap:  () => void;
  onPreview: () => void;
  onEdit: () => void;
  onStatus: () => void;
  children: React.ReactNode;
}) {
  const [dragX,      setDragX]      = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX     = useRef(0);
  const startY     = useRef(0);
  const gestureDir = useRef<"h" | "v" | null>(null);
  const didMove    = useRef(false);

  const baseX      = isOpen ? -SWIPE_WIDTH : 0;
  const translateX = isDragging
    ? Math.max(-SWIPE_WIDTH, Math.min(0, baseX + dragX))
    : baseX;

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    startX.current     = e.clientX;
    startY.current     = e.clientY;
    gestureDir.current = null;
    didMove.current    = false;
    setDragX(0);
    setIsDragging(true);
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    if (!gestureDir.current) {
      if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
      didMove.current    = true;
      gestureDir.current = Math.abs(dx) >= Math.abs(dy) * 2 ? "h" : "v";
      if (gestureDir.current === "v") { setIsDragging(false); return; }
    }
    if (gestureDir.current === "h") setDragX(dx);
  }

  function onPointerUp() {
    if (!isDragging) return;
    setIsDragging(false);
    if (!didMove.current) {
      setDragX(0);
      if (isOpen) onClose(); else onTap();
      return;
    }
    const finalX = Math.max(-SWIPE_WIDTH, Math.min(0, baseX + dragX));
    setDragX(0);
    if (isOpen) {
      finalX > -(SWIPE_WIDTH * 0.5) ? onClose() : onOpen();
    } else {
      finalX < -(SWIPE_WIDTH * 0.3) ? onOpen() : onClose();
    }
  }

  return (
    <div className="relative overflow-hidden">
      {/* Action buttons — fixed behind the card */}
      <div className="absolute right-0 top-0 bottom-0 flex" style={{ width: SWIPE_WIDTH }}>
        <button type="button" onClick={onPreview}
          className="flex flex-col items-center justify-center flex-1 bg-primary"
        >
          <Eye className="h-[18px] w-[18px] text-white" strokeWidth={2} />
          <span className="text-[11px] font-medium text-white mt-1">Preview</span>
        </button>
        <button type="button" onClick={onEdit}
          className="flex flex-col items-center justify-center flex-1 bg-amber-500"
        >
          <Pencil className="h-[18px] w-[18px] text-white" strokeWidth={2} />
          <span className="text-[11px] font-medium text-white mt-1">Edit</span>
        </button>
        <button type="button" onClick={onStatus}
          className="flex flex-col items-center justify-center flex-1 bg-muted"
        >
          <RefreshCw className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={2} />
          <span className="text-[11px] font-medium text-muted-foreground mt-1">Status</span>
        </button>
      </div>

      {/* Card content — slides left on swipe */}
      <div
        className="relative z-[1] bg-card"
        style={{
          transform:   `translateX(${translateX}px)`,
          transition:  isDragging ? "none" : "transform 0.22s cubic-bezier(0.22,1,0.36,1)",
          touchAction: "pan-y",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {children}
      </div>
    </div>
  );
}

/* ── Component ────────────────────────────────────────────────────── */
export function MobileInvoices({
  onPreview,
  onEdit,
  onCreateInvoice,
  onStatus,
}: {
  onPreview?: (id: string) => void;
  onEdit?: (id: string) => void;
  onCreateInvoice?: () => void;
  onStatus?: (invoiceId: string) => void;
}) {
  const [tab,          setTab]          = useState<InvTab>("all");
  const [search,       setSearch]       = useState("");
  const [period,       setPeriod]       = useState<Period>("1D");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [swipedId,     setSwipedId]     = useState<string | null>(null);

  const q = search.trim().toLowerCase();
  const filtered = INVOICES
    .filter(inv => tab === "all" || inv.status === tab)
    .filter(inv =>
      !q ||
      inv.customerName.toLowerCase().includes(q) ||
      inv.customerEmail.toLowerCase().includes(q) ||
      inv.invoiceId.toLowerCase().includes(q)
    );

  const totalCount = INVOICES.length;
  const m = INV_METRICS[period];

  return (
    <div className="space-y-3 pb-10 bg-background min-h-full relative">

      {/* Click-outside backdrop (period dropdown) */}
      {dropdownOpen && (
        <div
          className="absolute inset-0 z-[19]"
          onClick={() => { setDropdownOpen(false); setSwipedId(null); }}
        />
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

        {/* Total Invoiced */}
        <div className="rounded-2xl border border-border bg-card shadow-sm px-4 py-3.5 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-muted-foreground mb-1">Total Invoiced</p>
            <p className="text-[26px] font-bold text-foreground tabular-nums leading-tight">
              {m.totalInvoiced}
            </p>
            <p className={cn("text-[11.5px] font-medium mt-1.5", m.invPos ? "text-emerald-600" : "text-red-600")}>
              {m.invDelta}
            </p>
          </div>
          <div className="shrink-0">
            <Sparkline data={INV_SPARK.invoiced} color="#3b82f6" w={120} h={48} />
          </div>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-3 gap-2.5">

          {/* Paid */}
          <div className="rounded-2xl border border-border bg-card shadow-sm px-3 py-3 flex flex-col">
            <p className="text-[10px] font-medium text-muted-foreground leading-none mb-1.5">Paid</p>
            <p className="text-[14px] font-bold text-foreground tabular-nums leading-tight">{m.paid}</p>
            <p className={cn("text-[10.5px] font-semibold mt-1", m.paidPos ? "text-emerald-600" : "text-red-600")}>
              {m.paidDelta}
            </p>
            <div className="mt-2">
              <Sparkline data={INV_SPARK.paid} color="#10b981" w={80} h={28} />
            </div>
          </div>

          {/* Overdue */}
          <div className="rounded-2xl border border-border bg-card shadow-sm px-3 py-3 flex flex-col">
            <p className="text-[10px] font-medium text-muted-foreground leading-none mb-1.5">Overdue</p>
            <p className="text-[14px] font-bold text-foreground tabular-nums leading-tight">{m.overdue}</p>
            <p className={cn("text-[10.5px] font-semibold mt-1", m.overduePos ? "text-emerald-600" : "text-red-600")}>
              {m.overdueDelta}
            </p>
            <div className="mt-2">
              <Sparkline data={INV_SPARK.overdue} color="#ef4444" w={80} h={28} />
            </div>
          </div>

          {/* Active */}
          <div className="rounded-2xl border border-border bg-card shadow-sm px-3 py-3 flex flex-col">
            <p className="text-[10px] font-medium text-muted-foreground leading-none mb-1.5">Active</p>
            <p className="text-[14px] font-bold text-foreground tabular-nums leading-tight">{m.active}</p>
            <p className={cn("text-[10.5px] font-semibold mt-1", m.activePos ? "text-emerald-600" : "text-red-600")}>
              {m.activeDelta}
            </p>
            <div className="mt-2">
              <Sparkline data={INV_SPARK.active} color="#10b981" w={80} h={28} />
            </div>
          </div>

        </div>
      </div>

      {/* Zone 3 — All Invoices container */}
      <div className="mx-4 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">

        {/* Section header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 gap-2">
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-foreground leading-tight">All Invoices</p>
            <p className="text-[11.5px] text-muted-foreground mt-0.5">{totalCount} invoices created</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-[11.5px] font-medium text-muted-foreground active:bg-muted/40 transition-colors shrink-0"
            >
              <Download className="h-[12px] w-[12px]" strokeWidth={2} />
              Export
            </button>
            <button
              type="button"
              onClick={onCreateInvoice}
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
              placeholder="Search by customer, invoice ID..."
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
          {BASE_TABS.map(t => {
            const count = t.id === "all" ? INVOICES.length : INVOICES.filter(i => i.status === t.id).length;
            const label = t.id === "all" ? `All (${count})` : t.label;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex-1 py-1.5 text-[11.5px] font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 px-1",
                  tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Card rows */}
        <div className="divide-y divide-border">
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-muted-foreground">No invoices</p>
          ) : filtered.map(inv => {
            const cfg = STATUS_CFG[inv.status];
            return (
              <SwipeCard
                key={inv.id}
                isOpen={swipedId === inv.id}
                onOpen={() => setSwipedId(inv.id)}
                onClose={() => setSwipedId(null)}
                onTap={() => {}}
                onPreview={() => { setSwipedId(null); onPreview?.(inv.id); }}
                onEdit={() => { setSwipedId(null); onEdit?.(inv.id); }}
                onStatus={() => { setSwipedId(null); onStatus?.(inv.invoiceId); }}
              >
                <div className="flex items-start gap-3 px-4 py-3.5 min-w-0 active:bg-muted/30 transition-colors duration-100">
                  {/* Left block */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-bold text-foreground leading-snug truncate">{inv.customerName}</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug truncate">{inv.customerEmail}</p>
                    <p className="text-[12px] text-primary mt-0.5 leading-snug font-medium">{inv.invoiceId}</p>
                  </div>

                  {/* Right block */}
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      {cfg.iconType === "pulse" && (
                        <span className="relative inline-flex h-[6px] w-[6px] shrink-0">
                          <span
                            className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 animate-ping"
                            style={{ animationDuration: "1.5s" }}
                          />
                          <span className="relative inline-flex h-[6px] w-[6px] rounded-full bg-primary" />
                        </span>
                      )}
                      {cfg.iconType === "check" && (
                        <Check className="h-[12px] w-[12px] text-emerald-600 shrink-0" strokeWidth={2.5} />
                      )}
                      {cfg.iconType === "ban" && (
                        <Ban className="h-[12px] w-[12px] text-red-600 shrink-0" strokeWidth={2} />
                      )}
                      {cfg.iconType === "circle" && (
                        <Circle className="h-[12px] w-[12px] text-muted-foreground shrink-0" strokeWidth={2} />
                      )}
                      <span className={cn("text-[13.5px] font-bold tabular-nums", cfg.amountColor)}>
                        {fmtAmount(inv.amount)}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{inv.currency}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">{inv.createdAt}</p>
                  </div>
                </div>
              </SwipeCard>
            );
          })}
        </div>

      </div>

    </div>
  );
}
