"use client";

import { useState, useRef } from "react";
import { Search, X, Download, Check, MoreHorizontal, Copy, Send, Trash2, Plus, ChevronDown } from "lucide-react";
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
  label: string;
  color: string;
  amountColor: string;
  showCheck: boolean;
}> = {
  paid:    { label: "Paid",    color: "text-emerald-600",      amountColor: "text-emerald-600",      showCheck: true  },
  active:  { label: "Active",  color: "text-emerald-600",      amountColor: "text-emerald-600",      showCheck: false },
  overdue: { label: "Overdue", color: "text-red-600",          amountColor: "text-red-600",          showCheck: false },
  draft:   { label: "Draft",   color: "text-muted-foreground", amountColor: "text-muted-foreground", showCheck: false },
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

/* ── Component ────────────────────────────────────────────────────── */
export function MobileInvoices() {
  const [tab,          setTab]          = useState<InvTab>("all");
  const [search,       setSearch]       = useState("");
  const [period,       setPeriod]       = useState<Period>("1D");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openMenuId,   setOpenMenuId]   = useState<string | null>(null);
  const [menuPos,      setMenuPos]      = useState({ top: 0, right: 0 });

  const rootRef     = useRef<HTMLDivElement>(null);
  const menuBtnRefs = useRef<Partial<Record<string, HTMLButtonElement | null>>>({});

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

  function openMenu(id: string) {
    if (openMenuId === id) { setOpenMenuId(null); return; }
    const btn  = menuBtnRefs.current[id];
    const root = rootRef.current;
    if (btn && root) {
      const btnRect  = btn.getBoundingClientRect();
      const rootRect = root.getBoundingClientRect();
      setMenuPos({
        top:   btnRect.bottom - rootRect.top + 4,
        right: rootRect.right - btnRect.right,
      });
    }
    setOpenMenuId(id);
  }

  function closeMenu() { setOpenMenuId(null); }

  const openInv = INVOICES.find(i => i.id === openMenuId);

  return (
    <div ref={rootRef} className="space-y-3 pb-10 bg-background min-h-full relative">

      {/* Click-outside backdrops */}
      {(dropdownOpen || openMenuId !== null) && (
        <div
          className="absolute inset-0 z-[19]"
          onClick={() => { setDropdownOpen(false); closeMenu(); }}
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
              <div key={inv.id} className="flex items-stretch">

                {/* Card body */}
                <button
                  type="button"
                  className="flex-1 flex items-center gap-3 pl-4 pr-2 py-3.5 text-left active:bg-muted/30 transition-colors duration-100 min-w-0"
                >
                  {/* Left block */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-foreground leading-snug truncate">{inv.customerName}</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug truncate">{inv.customerEmail}</p>
                    <p className="text-[12px] text-primary mt-0.5 leading-snug font-medium">{inv.invoiceId}</p>
                  </div>

                  {/* Right block */}
                  <div className="shrink-0 text-right flex flex-col items-end gap-0.5">
                    <p className="leading-snug">
                      <span className={cn("text-[13.5px] font-bold tabular-nums", cfg.amountColor)}>
                        {fmtAmount(inv.amount)}
                      </span>
                      <span className="text-[11px] text-muted-foreground ml-1">{inv.currency}</span>
                    </p>
                    <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium leading-snug", cfg.color)}>
                      <span className="h-[5px] w-[5px] rounded-full bg-current shrink-0" />
                      {cfg.label}
                      {cfg.showCheck && <Check className="h-[9px] w-[9px] shrink-0" strokeWidth={2.5} />}
                    </span>
                    <p className="text-[11px] text-muted-foreground leading-snug">{inv.createdAt}</p>
                  </div>
                </button>

                {/* ··· button */}
                <button
                  type="button"
                  ref={el => { menuBtnRefs.current[inv.id] = el; }}
                  onClick={() => openMenu(inv.id)}
                  className="flex items-center justify-center w-[44px] shrink-0 text-muted-foreground active:bg-muted/30 transition-colors duration-100"
                  aria-label="More options"
                >
                  <MoreHorizontal className="h-[20px] w-[20px]" strokeWidth={1.75} />
                </button>

              </div>
            );
          })}
        </div>

      </div>

      {/* Context menu */}
      {openMenuId !== null && (
        <div
          className="absolute z-[30] bg-white rounded-2xl border border-border overflow-hidden"
          style={{
            top: menuPos.top,
            right: menuPos.right,
            minWidth: 180,
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (openInv) navigator.clipboard.writeText(openInv.paymentLink).catch(() => {});
              closeMenu();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-muted/30 transition-colors border-b border-border/50"
          >
            <Copy className="h-[15px] w-[15px] text-muted-foreground shrink-0" strokeWidth={1.75} />
            <span className="text-[13px] font-medium text-foreground">Copy link</span>
          </button>

          <button
            type="button"
            onClick={closeMenu}
            className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-muted/30 transition-colors border-b border-border/50"
          >
            <Send className="h-[15px] w-[15px] text-muted-foreground shrink-0" strokeWidth={1.75} />
            <span className="text-[13px] font-medium text-foreground">Send</span>
          </button>

          <button
            type="button"
            onClick={closeMenu}
            className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-muted/30 transition-colors border-b border-border/50"
          >
            <Download className="h-[15px] w-[15px] text-muted-foreground shrink-0" strokeWidth={1.75} />
            <span className="text-[13px] font-medium text-foreground">Download PDF</span>
          </button>

          <button
            type="button"
            onClick={closeMenu}
            className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-red-50/60 transition-colors"
          >
            <Trash2 className="h-[15px] w-[15px] text-red-600 shrink-0" strokeWidth={1.75} />
            <span className="text-[13px] font-medium text-red-600">Deactivate</span>
          </button>
        </div>
      )}

    </div>
  );
}
