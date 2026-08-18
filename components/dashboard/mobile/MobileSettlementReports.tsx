"use client";

import { useState } from "react";
import {
  ArrowLeft, ArrowUpRight, Banknote,
  Download, Copy, Check, X, Info,
  Landmark, RefreshCw, Plus,
  AlertTriangle, ChevronLeft, ChevronRight, Calendar as CalendarIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { allSettlements } from "@/lib/mock-data";

type Settlement = typeof allSettlements[number];
type ProductTab = "payment-gateway" | "multi-currency";

/* ── Settlement overview metric (Total settled card) ─────────────────────── */
const TOTAL_SETTLED = {
  amount:         "₹5.07L",
  delta:          "+12.3% vs last",
  deltaPositive:  true,
  spark:          [280, 320, 380, 360, 430, 480, 530, 507],
};

/* ── Settlement list tab filter ───────────────────────────────────────────── */
type SettleTab = "all" | "settled" | "processing";

const SETTLE_TABS: { id: SettleTab; label: string }[] = [
  { id: "all",        label: "All"        },
  { id: "settled",    label: "Settled"    },
  { id: "processing", label: "Processing" },
];

/* ── MCA settlement data — this screen's PG behavior/data is unaffected ── */
type McaSettlementStatus = "sent-for-settlement" | "settled" | "firc";

type McaSettlement = {
  id: string;
  remitterName: string;
  currency: string;
  grossAmount: number;
  gstDeduction: number;
  platformFee: number;
  bankAccount: string;
  utrNumber: string | null;
  transactionCount: number;
  initiatedDate: string;
  expectedDate: string;
  status: McaSettlementStatus;
};

const MCA_SETTLEMENT_STATUS_CFG: Record<McaSettlementStatus, { label: string; text: string; bg: string; amountColor: string }> = {
  "sent-for-settlement": { label: "Sent for Settlement", text: "text-amber-700",   bg: "bg-amber-50",   amountColor: "text-amber-700"   },
  settled:               { label: "Settled",             text: "text-emerald-700", bg: "bg-emerald-50", amountColor: "text-emerald-700" },
  firc:                  { label: "FIRC",                text: "text-blue-700",    bg: "bg-blue-50",    amountColor: "text-blue-700"    },
};

const MCA_SETTLE_TABS: { id: "all" | McaSettlementStatus; label: string }[] = [
  { id: "all",                 label: "All"                 },
  { id: "sent-for-settlement", label: "Sent for Settlement" },
  { id: "settled",             label: "Settled"             },
  { id: "firc",                label: "FIRC"                },
];

const MCA_SETTLEMENTS: McaSettlement[] = [
  { id: "mca_t5u6v7w8", remitterName: "Test Debtor Name", currency: "INR", grossAmount: 15850.44, gstDeduction: 60.23, platformFee: 190.21, bankAccount: "Citibank N.A. ****9081",        utrNumber: null,                transactionCount: 21, initiatedDate: "2026-03-11", expectedDate: "2026-03-12", status: "settled"             },
  { id: "mca_a1b2c3d4", remitterName: "AMAZON",           currency: "GBP", grossAmount: 45000.00, gstDeduction: 320.00, platformFee: 480.00, bankAccount: "HSBC UK ****2210",              utrNumber: "UTR2603GB004521",   transactionCount: 14, initiatedDate: "2026-03-09", expectedDate: "2026-03-10", status: "firc"                 },
  { id: "mca_e5f6g7h8", remitterName: "GlobalTech Ltd",   currency: "USD", grossAmount: 8300.00,  gstDeduction: 62.00,  platformFee: 117.50, bankAccount: "Community Federal ****3345",    utrNumber: null,                transactionCount: 9,  initiatedDate: "2026-03-13", expectedDate: "2026-03-14", status: "sent-for-settlement" },
  { id: "mca_i9j0k1l2", remitterName: "Nordic Solutions", currency: "EUR", grossAmount: 4050.00,  gstDeduction: 32.00,  platformFee: 58.00,  bankAccount: "Deutsche Bank ****7712",         utrNumber: "UTR2603DE009812",   transactionCount: 5,  initiatedDate: "2026-03-07", expectedDate: "2026-03-08", status: "firc"                 },
  { id: "mca_m3n4o5p6", remitterName: "Pacific Trade Co", currency: "USD", grossAmount: 5620.00,  gstDeduction: 44.00,  platformFee: 66.00,  bankAccount: "Community Federal ****3345",    utrNumber: null,                transactionCount: 7,  initiatedDate: "2026-03-14", expectedDate: "2026-03-15", status: "sent-for-settlement" },
];

const MCA_TOTAL_SETTLED = {
  amount:        "$24,300",
  delta:         "+9.4% vs last",
  deltaPositive: true,
  spark:         [180, 200, 190, 220, 240, 235, 260, 243],
};

function getMcaStatusCfg(status: McaSettlementStatus) {
  return MCA_SETTLEMENT_STATUS_CFG[status];
}
function mcaNet(s: McaSettlement) {
  return s.grossAmount - s.gstDeduction - s.platformFee;
}
function fmtMcaAmount(n: number, currency: string) {
  const sym: Record<string, string> = { INR: "₹", USD: "$", GBP: "£", EUR: "€" };
  return (sym[currency] ?? "") + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ── Duration chip — reuses the Date & Time chip idiom from MobileTransactions ── */
const DURATION_PRESETS = [
  { id: "today", label: "Today"         },
  { id: "7d",    label: "Last 7 days"   },
  { id: "30d",   label: "Last 30 days"  },
  { id: "3m",    label: "Last 3 months" },
];

function DurationChip({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const [open, setOpen] = useState(false);
  const label = value ? (DURATION_PRESETS.find(p => p.id === value)?.label ?? "Duration") : "Duration";
  return (
    <div className="relative inline-block">
      <button type="button" onClick={() => setOpen(v => !v)}
        className={cn(
          "flex items-center gap-1 h-8 text-[12px] font-medium transition-colors whitespace-nowrap rounded-xl px-3",
          value ? "bg-primary text-white" : "border border-dashed border-border bg-white text-muted-foreground"
        )}
      >
        {!value && <Plus className="h-[11px] w-[11px] text-muted-foreground/60 shrink-0" strokeWidth={2} />}
        {label}
        {value && (
          <span role="button"
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
            className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white/20 shrink-0 ml-0.5"
          >
            <X className="h-[10px] w-[10px] text-white" strokeWidth={2.5} />
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1.5 z-20 rounded-2xl border border-border bg-white overflow-hidden shadow-lg" style={{ minWidth: 180 }}>
            {DURATION_PRESETS.map(p => (
              <button key={p.id} type="button" onClick={() => { onChange(p.id); setOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-3 text-left active:bg-muted/20"
              >
                <span className={cn("text-[13px]", value === p.id ? "font-semibold text-foreground" : "text-muted-foreground")}>{p.label}</span>
                {value === p.id && <Check className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Settlement calendar (MCA only) ──────────────────────────────────────
 * Static March-2026 mock month: green = settled, amber = bank holiday
 * (settlement skipped), blue = next scheduled settlement. */
type CalendarDayStatus = "settled" | "holiday" | "next-settlement" | null;

const CALENDAR_DAY_STATUS: Record<number, CalendarDayStatus> = {
  9: "settled", 10: "settled", 11: "settled",
  13: "holiday",
  16: "next-settlement",
};
const CALENDAR_TODAY          = 12;
const CALENDAR_MONTH_LABEL    = "March 2026";
const CALENDAR_FIRST_WEEKDAY  = 0; // Mar 1 2026 falls on a Sunday
const CALENDAR_DAYS_IN_MONTH  = 31;
const WEEKDAY_LABELS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

function calendarDayInfo(d: number): string {
  const status = CALENDAR_DAY_STATUS[d] ?? null;
  if (status === "settled")          return "Settlement completed";
  if (status === "holiday")          return "Bank holiday · settlement skipped";
  if (status === "next-settlement")  return "Next scheduled settlement";
  return "No settlement activity";
}

function SettlementCalendarSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [selectedDay, setSelectedDay] = useState<number>(CALENDAR_TODAY);
  const leadingBlanks = Array.from({ length: CALENDAR_FIRST_WEEKDAY });
  const days = Array.from({ length: CALENDAR_DAYS_IN_MONTH }, (_, i) => i + 1);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="cal-backdrop"
            className="absolute inset-0 z-10"
            style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", background: "rgba(0,0,0,0.2)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />
          <motion.div
            key="cal-sheet"
            className="absolute inset-x-0 bottom-0 z-11 flex flex-col bg-[#f6f8fa] overflow-hidden"
            style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "88%" }}
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="flex justify-center pt-2.5 pb-0.5 shrink-0">
              <div className="h-1 w-9 rounded-full bg-muted-foreground/25" />
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-background shrink-0">
              <p className="text-[16px] font-bold text-foreground">Settlement calendar</p>
              <button type="button" onClick={onClose}
                className="h-9 w-9 flex items-center justify-center rounded-full bg-muted text-foreground shrink-0"
                aria-label="Close">
                <X className="h-[17px] w-[17px]" strokeWidth={2.25} />
              </button>
            </div>

            <div className="overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
              <div className="px-4 pt-4 pb-8 space-y-4">

                {/* Upcoming holiday banner */}
                <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-3">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" strokeWidth={2} />
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-bold text-amber-800 leading-snug">Scheduled for the next working day</p>
                    <p className="text-[11.5px] text-amber-700 mt-0.5 leading-snug">Bank Holiday · Next settlement: Mar 16 · in 4 days</p>
                  </div>
                </div>

                {/* Month grid */}
                <div className="bg-card border border-border rounded-2xl px-4 pt-4 pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <button type="button" aria-label="Previous month"
                      className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted-foreground active:bg-muted/40"
                    >
                      <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                    </button>
                    <p className="text-[15px] font-bold text-foreground">{CALENDAR_MONTH_LABEL}</p>
                    <button type="button" aria-label="Next month"
                      className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted-foreground active:bg-muted/40"
                    >
                      <ChevronRight className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 mb-1">
                    {WEEKDAY_LABELS.map(d => (
                      <p key={d} className="text-[10px] font-semibold text-muted-foreground text-center">{d}</p>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-y-1">
                    {leadingBlanks.map((_, i) => <div key={`b${i}`} />)}
                    {days.map(d => {
                      const status = CALENDAR_DAY_STATUS[d] ?? null;
                      const isSelected = d === selectedDay;
                      return (
                        <button key={d} type="button" onClick={() => setSelectedDay(d)}
                          className="flex flex-col items-center justify-center gap-0.5 py-1"
                        >
                          <span className={cn(
                            "h-7 w-7 rounded-lg flex items-center justify-center text-[12.5px] font-semibold transition-colors",
                            isSelected ? "bg-muted text-foreground" : "text-foreground",
                            status === "next-settlement" && "border border-primary text-primary",
                          )}>
                            {d}
                          </span>
                          <span className={cn(
                            "h-[5px] w-[5px] rounded-full",
                            status === "settled"         ? "bg-emerald-500" :
                            status === "holiday"         ? "bg-amber-500"   :
                            status === "next-settlement" ? "bg-primary"     : "bg-transparent"
                          )} />
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border/40">
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" /> Settled
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                      <span className="h-2 w-2 rounded-full bg-amber-500" /> Holiday
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                      <span className="h-2 w-2 rounded-full bg-primary" /> Next settlement
                    </span>
                  </div>
                </div>

                {/* Selected day info panel */}
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5">
                  <div className="h-9 w-9 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-bold text-foreground leading-snug">Mar {selectedDay}</p>
                    <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-snug">{calendarDayInfo(selectedDay)}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Sparkline({ data, color, w, h }: { data: number[]; color: string; w: number; h: number }) {
  if (data.length < 2) return null;
  const min   = Math.min(...data);
  const max   = Math.max(...data);
  const range = max - min || 1;
  const pad   = 2;
  const step  = w / (data.length - 1);
  const pts   = data.map((v, i) => `${i * step},${h - pad - ((v - min) / range) * (h - pad * 2)}`).join(" ");
  const lastX = (data.length - 1) * step;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ overflow: "visible", display: "block" }}>
      <polygon points={`0,${h} ${pts} ${lastX},${h}`} fill={color} fillOpacity={0.12} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */
function fmtAmount(n: number) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" });
}
function idShort(id: string) {
  return id.length > 14 ? `${id.slice(0, 8)}........${id.slice(-4)}` : id;
}

/* ─── Status config ───────────────────────────────────────────────────── */
const SETTLEMENT_STATUS: Record<string, {
  label: string; dot: string; text: string; bg: string; amountColor: string;
}> = {
  settled:    { label: "Settled",    dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", amountColor: "text-emerald-700"              },
  processing: { label: "Processing", dot: "bg-amber-500",   text: "text-amber-700",   bg: "bg-amber-50",   amountColor: "text-amber-700"                },
  failed:     { label: "Failed",     dot: "bg-red-500",     text: "text-red-700",     bg: "bg-red-50",     amountColor: "text-red-700 dark:text-red-500" },
};
function getStatusCfg(status: string) {
  return SETTLEMENT_STATUS[status] ?? SETTLEMENT_STATUS.processing;
}

/* ─── CopyBtn — identical to MobileTransactionDetail CopyBtn ─────────── */
function CopyBtn({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value).catch(() => {});
    setDone(true);
    setTimeout(() => setDone(false), 1800);
  }
  return (
    <button type="button" onClick={copy}
      className="h-7 w-7 shrink-0 flex items-center justify-center rounded-lg text-muted-foreground"
      aria-label="Copy">
      {done
        ? <Check className="h-[13px] w-[13px] text-emerald-600" strokeWidth={2.5} />
        : <Copy  className="h-[13px] w-[13px]" strokeWidth={2} />}
    </button>
  );
}

/* ─── SectionLabel — identical to MobileTransactionDetail SectionLabel ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.09em] px-4 mb-2">
      {children}
    </p>
  );
}

/* ─── PairedRow — identical to MobileTransactionDetail PairedRow ─────── */
function PairedRow({
  left,
  right,
  last,
}: {
  left: { label: string; value: React.ReactNode };
  right: { label: string; value: React.ReactNode };
  last?: boolean;
}) {
  return (
    <div className={cn("flex", !last && "border-b border-border/50")}>
      <div className="flex-1 min-w-0 px-4 py-3.5 border-r border-border/50">
        <p className="text-[11px] font-medium text-muted-foreground mb-1.5 leading-none">{left.label}</p>
        <div className="min-w-0">
          {typeof left.value === "string"
            ? <p className="text-[13px] font-medium text-foreground leading-snug">{left.value}</p>
            : left.value}
        </div>
      </div>
      <div className="flex-1 min-w-0 px-4 py-3.5">
        <p className="text-[11px] font-medium text-muted-foreground mb-1.5 leading-none">{right.label}</p>
        <div className="min-w-0">
          {typeof right.value === "string"
            ? <p className="text-[13px] font-medium text-foreground leading-snug">{right.value}</p>
            : right.value}
        </div>
      </div>
    </div>
  );
}

/* ─── StatusPill — dot + label, matches Transaction Detail inline pills ── */
function StatusPill({ status }: { status: string }) {
  const cfg = getStatusCfg(status);
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold",
      cfg.text, cfg.bg,
    )}>
      <span className={cn("h-[4px] w-[4px] rounded-full shrink-0", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

/* ─── Stepper ─────────────────────────────────────────────────────────── */
const STEPS = [
  { label: "Transactions\nCaptured",   done: true  },
  { label: "Processing\nStarted",      done: true  },
  { label: "Bank Transfer\nInitiated", done: true  },
  { label: "Settlement\nComplete",     done: false },
] as const;

function SettlementStepper() {
  return (
    <div
      className="[&::-webkit-scrollbar]:hidden"
      style={{ overflowX: "auto", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
    >
      <div className="flex items-start" style={{ width: "max-content", minWidth: "100%", padding: "0 2px" }}>
        {STEPS.map((s, i) => {
          const isLast = i === STEPS.length - 1;
          return (
            <div key={i} className="flex items-start flex-1" style={{ minWidth: 80 }}>
              <div className="flex flex-col items-center w-full">
                <div className="flex items-center w-full">
                  <div className={cn(
                    "flex-1 h-0.5 rounded-full",
                    i === 0 ? "invisible" : s.done ? "bg-primary" : "bg-border",
                  )} />
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all",
                      s.done ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border-2 border-border",
                    )}
                    style={s.done ? { boxShadow: "0 0 0 3px rgba(0,97,227,0.08)" } : {}}
                  >
                    {s.done ? (
                      <svg width="11" height="9" viewBox="0 0 13 10" fill="none">
                        <path d="M1.5 5L5 8.5L11.5 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : i + 1}
                  </div>
                  <div className={cn(
                    "flex-1 h-0.5 rounded-full",
                    isLast ? "invisible" : s.done ? "bg-primary" : "bg-border",
                  )} />
                </div>
                <p className="text-[10px] font-medium text-muted-foreground text-center mt-2 leading-snug whitespace-pre-line px-1">
                  {s.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── VDivider — inline vertical separator (matches Transaction Detail) ── */
function VDivider() {
  return (
    <span
      className="inline-block w-px bg-border/50 shrink-0 self-center"
      style={{ height: 11 }}
      aria-hidden
    />
  );
}

/* ─── Settlement Detail overlay ───────────────────────────────────────── */
function SettlementDetail({ s, onClose, onTxnDeepLink }: {
  s: Settlement;
  onClose: () => void;
  onTxnDeepLink?: () => void;
}) {
  const cfg = getStatusCfg(s.status);

  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 z-11 flex flex-col bg-[#f6f8fa] overflow-hidden"
      style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "90%" }}
      initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
      transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-2.5 pb-0.5 shrink-0">
        <div className="h-1 w-9 rounded-full bg-muted-foreground/25" />
      </div>

      {/* Header — matches Transaction Detail header exactly */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/60 bg-background shrink-0">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground mb-1.5 leading-none">
            Settlement ID
          </p>
          <div className="inline-flex items-center gap-0.5 bg-muted-foreground/[0.12] rounded-full px-3 h-8 shrink-0">
            <span className="text-[12px] font-mono font-medium text-foreground leading-none">
              {idShort(s.id)}
            </span>
            <CopyBtn value={s.id} />
          </div>
        </div>
        <button type="button" onClick={onClose}
          className="h-9 w-9 flex items-center justify-center rounded-full bg-muted text-foreground shrink-0"
          aria-label="Close">
          <X className="h-[17px] w-[17px]" strokeWidth={2.25} />
        </button>
      </div>

      {/* Scrollable body */}
      <div
        className="overflow-y-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="flex flex-col gap-5 pt-4 pb-10">

          {/* §1 Summary card — matches Transaction Detail summary card */}
          <div className="mx-4 rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-baseline gap-2 min-w-0">
                  <span className={cn(amtFontSize(fmtAmount(s.amount)), "font-bold tracking-tight text-foreground leading-none")}>
                    {fmtAmount(s.amount)}
                  </span>
                  <span className="text-[13px] font-medium text-muted-foreground leading-none">
                    INR
                  </span>
                </div>
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold shrink-0",
                  cfg.text, cfg.bg,
                )}>
                  <span className={cn("h-[5px] w-[5px] rounded-full shrink-0", cfg.dot)} />
                  {cfg.label}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-wrap mt-3">
                <span className="text-[12px] text-muted-foreground leading-snug whitespace-nowrap">
                  {fmtDate(s.date)}
                </span>
                <VDivider />
                <span className="text-[12px] text-muted-foreground leading-snug whitespace-nowrap">12:00 AM</span>
                <VDivider />
                <Banknote className="h-[13px] w-[13px] text-muted-foreground shrink-0" strokeWidth={1.75} />
                <span className="text-[12px] text-muted-foreground leading-snug">{s.bankAccount}</span>
              </div>
            </div>
          </div>

          {/* §2 Settlement Details */}
          <div>
            <SectionLabel>Settlement Details</SectionLabel>
            <div className="mx-4 rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
              <PairedRow
                left={{ label: "Bank Account", value: s.bankAccount }}
                right={{
                  label: "Transactions",
                  value: (
                    <button type="button" onClick={onTxnDeepLink}
                      className="text-[13px] font-medium text-primary leading-snug truncate">
                      {s.transactionCount} txns
                    </button>
                  ),
                }}
              />
              <PairedRow
                last
                left={{
                  label: "UTR Number",
                  value: (
                    <div className="flex items-center gap-0.5 min-w-0">
                      <button type="button"
                        className="text-[13px] font-medium text-primary leading-snug truncate">
                        {s.utrNumber.length > 10
                          ? `${s.utrNumber.slice(0, 4)}......${s.utrNumber.slice(-4)}`
                          : s.utrNumber}
                      </button>
                      <CopyBtn value={s.utrNumber} />
                    </div>
                  ),
                }}
                right={{ label: "Settlement Cycle", value: "T+1 Daily" }}
              />
            </div>
          </div>

          {/* §3 Settlement Progress */}
          <div>
            <SectionLabel>Settlement Progress</SectionLabel>
            <div className="mx-4 rounded-2xl bg-card border border-border shadow-sm px-4 pt-4 pb-5">
              <SettlementStepper />
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

function amtFontSize(formatted: string): string {
  return formatted.replace(/\D/g, "").length > 7 ? "text-[22px]" : "text-[32px]";
}

/* ─── Download confirmation — tapping "Previous settled" asks first ───── */
function DownloadConfirmModal({ open, onClose, onConfirm }: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="dl-confirm-backdrop"
          className="absolute inset-0 z-15 flex items-center justify-center px-6"
          style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", background: "rgba(0,0,0,0.35)" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[300px] rounded-2xl bg-card border border-border shadow-xl overflow-hidden"
            initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="px-5 pt-5 pb-4 text-center">
              <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Download className="h-5 w-5 text-primary" strokeWidth={2} />
              </div>
              <p className="text-[15px] font-bold text-foreground leading-snug">Download settlement report?</p>
              <p className="text-[12.5px] text-muted-foreground mt-1.5 leading-snug">
                We&apos;ll generate a report for your previous settlement and download it to your device.
              </p>
            </div>
            <div className="flex border-t border-border/60">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 text-[14px] font-semibold text-muted-foreground border-r border-border/60 active:bg-muted/40 transition-colors"
              >
                Cancel
              </button>
              <button type="button" onClick={onConfirm}
                className="flex-1 py-3 text-[14px] font-bold text-primary active:bg-muted/40 transition-colors"
              >
                Download
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── MCA Settlement Detail — Details + Amount Breakdown, no stepper ───── */
const MCA_BANNER_TEXT: Record<McaSettlementStatus, string> = {
  "sent-for-settlement": "Your payments are being reviewed and prepared for settlement. This may take up to 24 hours.",
  settled: "Settlement is being processed. Your payments have been received and are being processed for settlement. The settlement amount is available in the report below. The UTR will be generated once the bank transfer is processed.",
  firc: "Settlement is complete and the FIRC has been issued for this settlement. You can download the certificate below.",
};

function McaSettlementDetail({ s, onClose, onTxnDeepLink }: {
  s: McaSettlement;
  onClose: () => void;
  onTxnDeepLink?: () => void;
}) {
  const cfg = getMcaStatusCfg(s.status);
  const net = mcaNet(s);
  const totalDeductions = s.gstDeduction + s.platformFee;

  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 z-11 flex flex-col bg-[#f6f8fa] overflow-hidden"
      style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "92%" }}
      initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
      transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-2.5 pb-0.5 shrink-0">
        <div className="h-1 w-9 rounded-full bg-muted-foreground/25" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/60 bg-background shrink-0">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground mb-1.5 leading-none">
            Settlement ID
          </p>
          <div className="inline-flex items-center gap-0.5 bg-muted-foreground/[0.12] rounded-full px-3 h-8 shrink-0">
            <span className="text-[12px] font-mono font-medium text-foreground leading-none">
              {idShort(s.id)}
            </span>
            <CopyBtn value={s.id} />
          </div>
        </div>
        <button type="button" onClick={onClose}
          className="h-9 w-9 flex items-center justify-center rounded-full bg-muted text-foreground shrink-0"
          aria-label="Close">
          <X className="h-[17px] w-[17px]" strokeWidth={2.25} />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
        <div className="flex flex-col gap-5 pt-4 pb-10">

          {/* Amount + status + dates + Download Report */}
          <div className="px-4">
            <p className="text-[11px] font-medium text-muted-foreground mb-1">Expected settlement amount</p>
            <div className="flex items-center justify-between gap-3">
              <span className={cn(amtFontSize(fmtMcaAmount(net, s.currency)), "font-bold tracking-tight text-foreground leading-none")}>
                {fmtMcaAmount(net, s.currency)}
              </span>
              <span className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] font-semibold shrink-0",
                cfg.text, cfg.bg,
              )}>
                {cfg.label}
                <ArrowUpRight className="h-3 w-3" strokeWidth={2.5} />
              </span>
            </div>
            <p className="text-[11.5px] text-muted-foreground mt-1.5">
              Initiated on {fmtDate(s.initiatedDate)} <span className="mx-1">·</span> Expected settlement: {fmtDate(s.expectedDate)}
            </p>

            <button type="button" onClick={() => toast.success("Downloading report...")}
              className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-[12.5px] font-semibold text-foreground active:bg-muted/40 transition-colors"
            >
              <Download className="h-3.5 w-3.5" strokeWidth={2} />
              Download Report
            </button>
          </div>

          {/* Status banner */}
          <div className="mx-4 flex items-start gap-2.5 rounded-2xl border border-primary/20 bg-primary/[0.04] px-3.5 py-3">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-[12px] text-foreground/80 leading-snug">{MCA_BANNER_TEXT[s.status]}</p>
          </div>

          {/* Details */}
          <div>
            <SectionLabel>Details</SectionLabel>
            <div className="mx-4 rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
              <div className="px-4 py-3.5 border-b border-border/50">
                <p className="text-[11px] font-medium text-muted-foreground mb-1.5 leading-none">Settlement ID</p>
                <div className="flex items-center gap-0.5 min-w-0">
                  <p className="text-[13px] font-mono font-semibold text-foreground leading-snug truncate">{s.id}</p>
                  <CopyBtn value={s.id} />
                </div>
              </div>
              <div className="px-4 py-3.5 border-b border-border/50">
                <p className="text-[11px] font-medium text-muted-foreground mb-1.5 leading-none">UTR Number</p>
                {s.utrNumber ? (
                  <div className="flex items-center gap-0.5 min-w-0">
                    <p className="text-[13px] font-mono font-semibold text-foreground leading-snug truncate">{s.utrNumber}</p>
                    <CopyBtn value={s.utrNumber} />
                  </div>
                ) : (
                  <p className="text-[13px] font-mono font-medium text-muted-foreground leading-snug">Not generated yet</p>
                )}
              </div>
              <div className="px-4 py-3.5 border-b border-border/50">
                <p className="text-[11px] font-medium text-muted-foreground mb-1.5 leading-none">Bank Account</p>
                <p className="text-[13px] font-semibold text-foreground leading-snug">{s.bankAccount}</p>
              </div>
              <div className="px-4 py-3.5">
                <p className="text-[11px] font-medium text-muted-foreground mb-1.5 leading-none">Transactions</p>
                <button type="button" onClick={onTxnDeepLink} className="text-[13px] font-semibold text-primary leading-snug">
                  {s.transactionCount} Transactions
                </button>
              </div>
            </div>
          </div>

          {/* Amount Breakdown */}
          <div>
            <SectionLabel>Amount Breakdown</SectionLabel>
            <div className="mx-4 rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/50">
                <p className="text-[13px] font-bold text-foreground">Gross Settlements</p>
                <p className="text-[13px] font-bold text-foreground tabular-nums">{fmtMcaAmount(s.grossAmount, s.currency)}</p>
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <p className="text-[12.5px] text-muted-foreground">Payment</p>
                <p className="text-[12.5px] text-muted-foreground tabular-nums">{fmtMcaAmount(s.grossAmount, s.currency)}</p>
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <p className="text-[13px] font-bold text-foreground">Deductions</p>
                <p className="text-[13px] font-bold text-red-600 tabular-nums">−{fmtMcaAmount(totalDeductions, s.currency)}</p>
              </div>
              <div className="flex items-center justify-between pl-6 pr-4 py-2.5 border-b border-border/50">
                <p className="text-[12px] text-muted-foreground">Goods and services tax (GST)</p>
                <p className="text-[12px] text-muted-foreground tabular-nums">−{fmtMcaAmount(s.gstDeduction, s.currency)}</p>
              </div>
              <div className="flex items-center justify-between pl-6 pr-4 py-2.5 border-b border-border/50">
                <p className="text-[12px] text-muted-foreground">Platform fee charged on payments</p>
                <p className="text-[12px] text-muted-foreground tabular-nums">−{fmtMcaAmount(s.platformFee, s.currency)}</p>
              </div>
              <div className="flex items-center justify-between px-4 py-3.5">
                <p className="text-[13.5px] font-bold text-foreground">Expected Net Settlement</p>
                <p className="text-[13.5px] font-bold text-foreground tabular-nums">{fmtMcaAmount(net, s.currency)}</p>
              </div>
            </div>
            <p className="px-4 mt-2 text-[11px] text-muted-foreground leading-snug">
              Net settlement is the amount scheduled to be transferred to your registered bank account.
            </p>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

/* ─── Root ────────────────────────────────────────────────────────────── */
export interface MobileSettlementReportsProps {
  open: boolean;
  onClose: () => void;
  contained?: boolean;
  onTxnLinkTap?: (settlementId: string) => void;
  productTab?: ProductTab;
  onProductTabChange?: (tab: ProductTab) => void;
}


export function MobileSettlementReports({ open, onClose, contained = false, onTxnLinkTap, productTab = "payment-gateway", onProductTabChange }: MobileSettlementReportsProps) {
  const isMca = productTab === "multi-currency";
  const [selectedId,          setSelectedId]          = useState<string | null>(null);
  const [settleTab,           setSettleTab]           = useState<SettleTab>("all");
  const [mcaSettleTab,        setMcaSettleTab]        = useState<"all" | McaSettlementStatus>("all");
  const [mcaDuration,         setMcaDuration]         = useState<string | null>(null);
  const [cycleDetailsOpen,    setCycleDetailsOpen]    = useState(false);
  const [calendarOpen,        setCalendarOpen]        = useState(false);
  const [downloadConfirmOpen, setDownloadConfirmOpen] = useState(false);

  const pos        = contained ? "absolute" : "fixed";
  const filtered = settleTab === "all" ? allSettlements : allSettlements.filter(s => s.status === settleTab);
  const selected = selectedId ? (allSettlements.find(s => s.id === selectedId) ?? null) : null;
  const previousSettlement = allSettlements.find(s => s.status === "settled") ?? null;
  const upcomingSettlement = allSettlements.find(s => s.status === "processing") ?? null;

  const mcaFiltered = mcaSettleTab === "all" ? MCA_SETTLEMENTS : MCA_SETTLEMENTS.filter(s => s.status === mcaSettleTab);
  const mcaSelected = selectedId ? (MCA_SETTLEMENTS.find(s => s.id === selectedId) ?? null) : null;
  const mcaPreviousSettlement = MCA_SETTLEMENTS.find(s => s.status === "firc" || s.status === "settled") ?? null;
  const mcaUpcomingSettlement = MCA_SETTLEMENTS.find(s => s.status === "sent-for-settlement") ?? null;

  const overviewCfg = isMca ? MCA_TOTAL_SETTLED : TOTAL_SETTLED;
  const prevAmountDisplay = isMca
    ? (mcaPreviousSettlement ? fmtMcaAmount(mcaNet(mcaPreviousSettlement), mcaPreviousSettlement.currency) : null)
    : (previousSettlement ? fmtAmount(previousSettlement.amount) : null);
  const prevDateDisplay = isMca
    ? (mcaPreviousSettlement ? fmtDate(mcaPreviousSettlement.expectedDate) : null)
    : (previousSettlement ? fmtDate(previousSettlement.date) : null);
  const upcomingAmountDisplay = isMca
    ? (mcaUpcomingSettlement ? fmtMcaAmount(mcaNet(mcaUpcomingSettlement), mcaUpcomingSettlement.currency) : null)
    : (upcomingSettlement ? fmtAmount(upcomingSettlement.amount) : null);
  const showOverviewSplit = isMca ? !!(mcaPreviousSettlement || mcaUpcomingSettlement) : !!(previousSettlement || upcomingSettlement);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="settlement-reports-overlay"
          className={`${pos} inset-x-0 bottom-0 z-[80] flex flex-col bg-[#f6f8fa] overflow-hidden`}
          style={{ top: 44 }}
          initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 bg-background border-b border-border/40 shrink-0"
            style={{ paddingTop: 14, paddingBottom: 14 }}
          >
            <button type="button" onClick={onClose}
              className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-foreground active:scale-95 transition-transform shrink-0"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            </button>
            <p className="flex-1 text-[17px] font-bold text-foreground tracking-tight">Settlement Reports</p>
            {onProductTabChange && (
              <div className="flex items-center bg-muted/60 rounded-lg p-0.5 shrink-0">
                {(["payment-gateway", "multi-currency"] as const).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onProductTabChange(id)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors",
                      productTab === id ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
                    )}
                  >
                    {id === "payment-gateway" ? "PG" : "MCA"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Scrollable body */}
          <div
            className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none" }}
          >
            {/* ── Settlement overview metrics ── */}
            <div className="px-4 pt-4 space-y-2.5">

              {/* Header row */}
              <div className="flex items-center justify-between">
                <p className="text-[14px] font-bold text-foreground leading-none">
                  Settlement overview
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCycleDetailsOpen(true)}
                    aria-label="Settlement details"
                    className="h-8 w-8 rounded-xl border border-border bg-muted flex items-center justify-center text-muted-foreground active:bg-muted/60 transition-colors shrink-0"
                  >
                    <Info className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarOpen(true)}
                    aria-label="Settlement calendar"
                    className="h-8 w-8 rounded-xl border border-border bg-muted flex items-center justify-center text-muted-foreground active:bg-muted/60 transition-colors shrink-0"
                  >
                    <CalendarIcon className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Total Settled — full-width primary metric */}
              <div className="rounded-xl border border-border bg-card px-3.5 py-3 flex flex-col">
                <p className="text-[11px] font-medium text-muted-foreground leading-none mb-1.5">Total settled</p>
                <p className="text-[20px] font-medium text-foreground tabular-nums leading-tight">{overviewCfg.amount}</p>
                <p className={cn("text-[11px] font-medium mt-1", overviewCfg.deltaPositive ? "text-emerald-600" : "text-red-600")}>
                  {overviewCfg.delta}
                </p>
                <div className="mt-2">
                  <Sparkline data={overviewCfg.spark} color="#10b981" w={280} h={36} />
                </div>
              </div>

              {/* Previous settled + Upcoming settlement — side by side */}
              {showOverviewSplit && (
                <div className="grid grid-cols-2 gap-2.5 items-stretch">
                  {prevAmountDisplay && (
                    <button type="button" onClick={() => setDownloadConfirmOpen(true)}
                      className="rounded-xl border border-border bg-card px-3 py-3 flex flex-col h-full text-left active:bg-muted/30 transition-colors"
                    >
                      <p className="text-[10.5px] font-medium text-muted-foreground leading-none mb-2">Previous settled</p>
                      <p
                        className="font-bold text-foreground tabular-nums leading-none tracking-tight"
                        style={{ fontSize: "clamp(15px, 4.8vw, 18px)" }}
                      >
                        {prevAmountDisplay}
                      </p>
                      <p className="text-[10.5px] font-medium text-muted-foreground mt-2">
                        {prevDateDisplay}
                      </p>
                    </button>
                  )}

                  {upcomingAmountDisplay && (
                    <div className="rounded-xl border border-primary/25 bg-primary/[0.04] px-3 py-3 flex flex-col h-full">
                      <div className="flex items-center gap-1 mb-2">
                        <div className="h-4 w-4 rounded-full bg-primary/12 flex items-center justify-center shrink-0">
                          <ArrowUpRight className="h-2.5 w-2.5 text-primary" strokeWidth={2.5} />
                        </div>
                        <p className="text-[10.5px] font-medium text-primary leading-none truncate">
                          Upcoming settlement
                        </p>
                      </div>
                      <p
                        className="font-bold text-foreground tabular-nums leading-none tracking-tight"
                        style={{ fontSize: "clamp(15px, 4.8vw, 18px)" }}
                      >
                        {upcomingAmountDisplay}
                      </p>
                      <p className="text-[10.5px] font-medium text-muted-foreground mt-2 leading-snug">
                        Tonight · 12:00 AM IST
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Your Settlement Cycle — PG only; removed for MCA per the new design */}
            {!isMca && (
            <div className="mx-4 mt-6 bg-card border border-border rounded-xl px-4 pt-4 pb-5">
              <div className="mb-4">
                <p className="text-[14px] font-medium text-foreground">Your settlement cycle</p>
                <span className="text-[11px] text-muted-foreground font-medium">Settles at 11:59 PM IST</span>
              </div>
              <SettlementStepper />
            </div>
            )}

            {/* Settlement list — matches Transactions list card structure */}
            <div className="mx-4 mt-4 bg-card border border-border rounded-xl overflow-hidden">
              {/* List header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border/40">
                <p className="text-[14px] font-medium text-foreground">All Settlements</p>
                <button type="button" onClick={() => toast.success("Exporting...")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[12px] font-medium text-muted-foreground active:bg-muted/40 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" strokeWidth={2} />
                  Export
                </button>
              </div>

              {isMca ? (
                <>
                  {/* Tab filter */}
                  <div className="px-4 pt-3 pb-2 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
                    <div className="flex gap-1 bg-muted/60 p-1 rounded-xl w-max min-w-full">
                      {MCA_SETTLE_TABS.map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setMcaSettleTab(t.id)}
                          className={cn(
                            "flex-1 shrink-0 py-1.5 px-2.5 text-[11px] font-medium rounded-lg transition-colors whitespace-nowrap",
                            mcaSettleTab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                          )}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration chip filter */}
                  <div className="px-4 pt-2 pb-3">
                    <DurationChip value={mcaDuration} onChange={setMcaDuration} />
                  </div>

                  {/* Settlement rows — MCA */}
                  <div className="divide-y divide-border/50">
                    {mcaFiltered.map(row => {
                      const cfg = getMcaStatusCfg(row.status);
                      const net = mcaNet(row);
                      return (
                        <div
                          key={row.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedId(row.id)}
                          onKeyDown={(e) => e.key === "Enter" && setSelectedId(row.id)}
                          className="w-full px-4 py-3.5 cursor-pointer active:bg-muted/30 transition-colors duration-100"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-[12.5px] font-bold leading-snug text-foreground">
                                {`${row.id.slice(0, 4)}....${row.id.slice(-4)}`}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                <Banknote className="h-[13px] w-[13px] text-muted-foreground shrink-0" strokeWidth={1.75} />
                                <p className="text-[12px] text-muted-foreground leading-snug">{row.bankAccount}</p>
                              </div>
                              <p className="text-[11px] font-mono text-muted-foreground/70 mt-0.5 leading-snug">
                                UTR: {row.utrNumber ?? "Not generated yet"}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p
                                className={cn("font-bold tabular-nums leading-snug whitespace-nowrap", cfg.amountColor)}
                                style={{ fontSize: "clamp(12px, 3.6vw, 13.5px)" }}
                              >
                                {fmtMcaAmount(net, row.currency)}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{fmtDate(row.expectedDate)}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  {/* Tab filter */}
                  <div className="px-4 pt-3 pb-2">
                    <div className="flex gap-1 bg-muted/60 p-1 rounded-xl">
                      {SETTLE_TABS.map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSettleTab(t.id)}
                          className={cn(
                            "flex-1 py-1.5 text-[11.5px] font-medium rounded-lg transition-colors whitespace-nowrap",
                            settleTab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                          )}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Settlement rows — layout matches Transactions rows */}
                  <div className="divide-y divide-border/50">
                    {filtered.map(row => {
                      const cfg = getStatusCfg(row.status);
                      return (
                        <div
                          key={row.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedId(row.id)}
                          onKeyDown={(e) => e.key === "Enter" && setSelectedId(row.id)}
                          className="w-full px-4 py-3.5 cursor-pointer active:bg-muted/30 transition-colors duration-100"
                        >
                          {/* Two-column layout */}
                          <div className="flex items-start justify-between gap-3">

                            {/* Left block */}
                            <div className="flex-1 min-w-0">
                              {/* Line 1: Settlement ID */}
                              <p className="text-[12.5px] font-bold leading-snug text-foreground">
                                {`${row.id.slice(0, 4)}....${row.id.slice(-4)}`}
                              </p>
                              {/* Line 2: Bank icon + account */}
                              <div className="flex items-center gap-1 mt-1">
                                <Banknote className="h-[13px] w-[13px] text-muted-foreground shrink-0" strokeWidth={1.75} />
                                <p className="text-[12px] text-muted-foreground leading-snug">{row.bankAccount}</p>
                              </div>
                              {/* Line 3: UTR number */}
                              <p className="text-[11px] font-mono text-muted-foreground/70 mt-0.5 leading-snug">UTR: {row.utrNumber}</p>
                            </div>

                            {/* Right block — right-aligned */}
                            <div className="shrink-0 text-right">
                              {/* Line 1: Amount colour-coded by status — clamp scales down on narrow screens */}
                              <p
                                className={cn("font-bold tabular-nums leading-snug whitespace-nowrap", cfg.amountColor)}
                                style={{ fontSize: "clamp(12px, 3.6vw, 13.5px)" }}
                              >
                                {fmtAmount(row.amount)}
                              </p>
                              {/* Line 2: Date */}
                              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{fmtDate(row.date)}</p>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

            </div>

            <div style={{ height: 32 }} />
          </div>

          {/* Settlement detail slide-up */}
          <AnimatePresence>
            {isMca ? (
              mcaSelected && (
                <>
                  <motion.div
                    key="settle-backdrop"
                    className="absolute inset-0 z-10"
                    style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", background: "rgba(0,0,0,0.2)" }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    onClick={() => setSelectedId(null)}
                  />
                  <McaSettlementDetail
                    key={mcaSelected.id}
                    s={mcaSelected}
                    onClose={() => setSelectedId(null)}
                    onTxnDeepLink={onTxnLinkTap ? () => {
                      setSelectedId(null);
                      onClose();
                      onTxnLinkTap(mcaSelected.id);
                    } : undefined}
                  />
                </>
              )
            ) : (
              selected && (
                <>
                  <motion.div
                    key="settle-backdrop"
                    className="absolute inset-0 z-10"
                    style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", background: "rgba(0,0,0,0.2)" }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    onClick={() => setSelectedId(null)}
                  />
                  <SettlementDetail
                    key={selected.id}
                    s={selected}
                    onClose={() => setSelectedId(null)}
                    onTxnDeepLink={onTxnLinkTap ? () => {
                      setSelectedId(null);
                      onClose();
                      onTxnLinkTap(selected.id);
                    } : undefined}
                  />
                </>
              )
            )}
          </AnimatePresence>

          {/* Settlement calendar — MCA only */}
          <SettlementCalendarSheet open={calendarOpen} onClose={() => setCalendarOpen(false)} />

          {/* Download previous settlement report — confirm before downloading */}
          <DownloadConfirmModal
            open={downloadConfirmOpen}
            onClose={() => setDownloadConfirmOpen(false)}
            onConfirm={() => {
              setDownloadConfirmOpen(false);
              toast.success("Downloading previous settlement report...");
            }}
          />

          {/* Cycle & bank account details overlay */}
          <AnimatePresence>
            {cycleDetailsOpen && (
              <>
                <motion.div
                  key="cycle-backdrop"
                  className="absolute inset-0 z-10"
                  style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", background: "rgba(0,0,0,0.2)" }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  onClick={() => setCycleDetailsOpen(false)}
                />
                <motion.div
                  key="cycle-sheet"
                  className="absolute inset-x-0 bottom-0 z-11 flex flex-col bg-[#f6f8fa] overflow-hidden"
                  style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "90%" }}
                  initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                  transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                >
                  {/* Drag handle */}
                  <div className="flex justify-center pt-2.5 pb-0.5 shrink-0">
                    <div className="h-1 w-9 rounded-full bg-muted-foreground/25" />
                  </div>

                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-background shrink-0">
                    <p className="text-[16px] font-bold text-foreground">Settlement details</p>
                    <button type="button" onClick={() => setCycleDetailsOpen(false)}
                      className="h-9 w-9 flex items-center justify-center rounded-full bg-muted text-foreground shrink-0"
                      aria-label="Close">
                      <X className="h-[17px] w-[17px]" strokeWidth={2.25} />
                    </button>
                  </div>

                  {/* Detail rows */}
                  <div className="px-4 pt-4 pb-8">
                    <div className="bg-card border border-border rounded-2xl overflow-hidden">

                      {/* Cycle */}
                      <div className="flex items-center gap-3 px-4 py-4 border-b border-border/50">
                        <div className="h-9 w-9 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
                          <RefreshCw className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-muted-foreground leading-none mb-1">Cycle</p>
                          <p className="text-[14px] font-semibold text-foreground leading-snug">T+1</p>
                          <p className="text-[11px] font-medium text-emerald-600 mt-0.5">Daily</p>
                        </div>
                      </div>

                      {/* Bank account */}
                      <div className="flex items-center gap-3 px-4 py-4">
                        <div className="h-9 w-9 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
                          <Landmark className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-muted-foreground leading-none mb-1">Bank account</p>
                          <p className="text-[14px] font-semibold text-foreground leading-snug">HDFC ****4521</p>
                          <p className="text-[11px] font-medium text-emerald-600 mt-0.5">Active</p>
                        </div>
                      </div>

                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
