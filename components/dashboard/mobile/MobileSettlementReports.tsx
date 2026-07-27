"use client";

import { useState } from "react";
import {
  ArrowLeft, ArrowUpRight, Banknote,
  Download, Copy, Check, X, Info,
  Landmark, RefreshCw,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { allSettlements } from "@/lib/mock-data";

type Settlement = typeof allSettlements[number];

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

/* ─── Root ────────────────────────────────────────────────────────────── */
export interface MobileSettlementReportsProps {
  open: boolean;
  onClose: () => void;
  contained?: boolean;
  onTxnLinkTap?: (settlementId: string) => void;
}


export function MobileSettlementReports({ open, onClose, contained = false, onTxnLinkTap }: MobileSettlementReportsProps) {
  const [selectedId,          setSelectedId]          = useState<string | null>(null);
  const [settleTab,           setSettleTab]           = useState<SettleTab>("all");
  const [cycleDetailsOpen,    setCycleDetailsOpen]    = useState(false);

  const pos        = contained ? "absolute" : "fixed";
  const filtered = settleTab === "all" ? allSettlements : allSettlements.filter(s => s.status === settleTab);
  const selected = selectedId ? (allSettlements.find(s => s.id === selectedId) ?? null) : null;
  const previousSettlement = allSettlements.find(s => s.status === "settled") ?? null;
  const upcomingSettlement = allSettlements.find(s => s.status === "processing") ?? null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="settlement-reports-overlay"
          className={`${pos} inset-0 z-[80] flex flex-col bg-[#f6f8fa] overflow-hidden`}
          initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 bg-background border-b border-border/40 shrink-0"
            style={{ paddingTop: "max(20px, env(safe-area-inset-top))", paddingBottom: 14 }}
          >
            <button type="button" onClick={onClose}
              className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-foreground active:scale-95 transition-transform shrink-0"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            </button>
            <p className="flex-1 text-[17px] font-bold text-foreground tracking-tight">Settlement Reports</p>
            <button
              type="button"
              onClick={() => setCycleDetailsOpen(true)}
              aria-label="Settlement details"
              className="h-9 w-9 rounded-xl border border-border bg-muted flex items-center justify-center text-muted-foreground active:bg-muted/60 transition-colors shrink-0"
            >
              <Info className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>

          {/* Scrollable body */}
          <div
            className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none" }}
          >
            {/* ── Settlement overview metrics ── */}
            <div className="px-4 pt-4 space-y-2.5">

              {/* Header row */}
              <p className="text-[14px] font-bold text-foreground leading-none">
                Settlement overview
              </p>

              {/* Total Settled — full-width primary metric */}
              <div className="rounded-xl border border-border bg-card px-3.5 py-3 flex flex-col">
                <p className="text-[11px] font-medium text-muted-foreground leading-none mb-1.5">Total settled</p>
                <p className="text-[20px] font-medium text-foreground tabular-nums leading-tight">{TOTAL_SETTLED.amount}</p>
                <p className={cn("text-[11px] font-medium mt-1", TOTAL_SETTLED.deltaPositive ? "text-emerald-600" : "text-red-600")}>
                  {TOTAL_SETTLED.delta}
                </p>
                <div className="mt-2">
                  <Sparkline data={TOTAL_SETTLED.spark} color="#10b981" w={280} h={36} />
                </div>
              </div>

              {/* Previous settled + Upcoming settlement — side by side */}
              {(previousSettlement || upcomingSettlement) && (
                <div className="grid grid-cols-2 gap-2.5 items-stretch">
                  {previousSettlement && (
                    <div className="rounded-xl border border-border bg-card px-3 py-3 flex flex-col h-full">
                      <p className="text-[10.5px] font-medium text-muted-foreground leading-none mb-2">Previous settled</p>
                      <p
                        className="font-bold text-foreground tabular-nums leading-none tracking-tight"
                        style={{ fontSize: "clamp(15px, 4.8vw, 18px)" }}
                      >
                        {fmtAmount(previousSettlement.amount)}
                      </p>
                      <p className="text-[10.5px] font-medium text-muted-foreground mt-2">
                        {fmtDate(previousSettlement.date)}
                      </p>
                    </div>
                  )}

                  {upcomingSettlement && (
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
                        {fmtAmount(upcomingSettlement.amount)}
                      </p>
                      <p className="text-[10.5px] font-medium text-muted-foreground mt-2 leading-snug">
                        Tonight · 12:00 AM IST
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Your Settlement Cycle */}
            <div className="mx-4 mt-6 bg-card border border-border rounded-xl px-4 pt-4 pb-5">
              <div className="mb-4">
                <p className="text-[14px] font-medium text-foreground">Your settlement cycle</p>
                <span className="text-[11px] text-muted-foreground font-medium">Settles at 11:59 PM IST</span>
              </div>
              <SettlementStepper />
            </div>

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

            </div>

            <div style={{ height: 32 }} />
          </div>

          {/* Settlement detail slide-up */}
          <AnimatePresence>
            {selected && (
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
            )}
          </AnimatePresence>

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
