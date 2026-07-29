"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle, ArrowLeft, Check, Copy, Download, Monitor, Plus,
  Search, SlidersHorizontal, X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { disputes } from "@/lib/mock-data";
import type { DisputeMockRow } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";

/* ── Helpers ──────────────────────────────────────────────────────────────── */

const CURRENCY_SYM: Record<string, string> = { USD: "$", GBP: "£", INR: "₹", EUR: "€" };

function fmtDisputedOn(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${d.toLocaleString("en-GB", { month: "short" })}`;
}

function fmtRespondBy(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.toLocaleString("en-GB", { month: "short" });
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${month}, ${hh}:${mm}`;
}

function fmtAmount(amount: number, currency: string): string {
  const sym = CURRENCY_SYM[currency] ?? "";
  return `${sym}${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function truncateId(id: string): string {
  if (id.length <= 10) return id;
  return `${id.slice(0, 4)}....${id.slice(-4)}`;
}

function cardSource(d: DisputeMockRow): string {
  const brand = d.cardBrand === "mastercard" ? "MC" : d.cardBrand?.toUpperCase() ?? "";
  return d.cardLast4 ? `${brand} •••• ${d.cardLast4}` : brand;
}

const FILTER_CHIPS = [
  "Reason",
  "Status",
  "Amount",
  "Disputed date",
  "Evidence due by",
] as const;

/* ── Overview metrics sparkline trend (illustrative) ─────────────────────── */
const DISPUTE_SPARK = {
  needsAction: [5, 4.6, 4, 3.4, 3, 2.6, 2.2, 2],
  won:         [0, 0.1, 0.3, 0.4, 0.6, 0.7, 0.9, 1],
  lost:        [2, 1.8, 1.6, 1.4, 1.2, 1.1, 1, 1],
  inReview:    [0, 0.3, 0.6, 0.8, 0.9, 1, 1, 1],
};

/* ── Sparkline — matches Transactions/Settlement overview cards ──────────── */
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

/* ── CopyBtn ──────────────────────────────────────────────────────────────── */

function CopyBtn({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value).catch(() => {});
    setDone(true);
    setTimeout(() => setDone(false), 1800);
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="h-7 w-7 shrink-0 flex items-center justify-center rounded-lg text-muted-foreground"
      aria-label="Copy"
    >
      {done
        ? <Check className="h-[13px] w-[13px] text-emerald-600" strokeWidth={2.5} />
        : <Copy  className="h-[13px] w-[13px]" strokeWidth={2} />}
    </button>
  );
}

/* ── PairedRow ────────────────────────────────────────────────────────────── */

function PairedRow({
  left,
  right,
  last,
}: {
  left:  { label: string; value: React.ReactNode };
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

/* ── DisputeDetail ────────────────────────────────────────────────────────── */

function DisputeDetail({ dispute: d, onClose }: { dispute: DisputeMockRow; onClose: () => void }) {
  const badge       = d.badgeStatus ?? d.status;
  const isDeadline  = badge === "deadline_missed";
  const isResolved  = badge === "won" || badge === "lost";
  const respondBy   = fmtRespondBy(d.dueDate);
  const urgent      = badge === "deadline_missed";

  return (
    <div className="flex flex-col h-full bg-[#f6f8fa] overflow-hidden">
      {/* Drag handle */}
      <div className="flex justify-center pt-2.5 pb-1 shrink-0">
        <div className="h-1 w-9 rounded-full bg-muted-foreground/25" />
      </div>

      {/* Header row */}
      <div className="flex items-start justify-between px-4 pb-3 shrink-0">
        <div>
          <p className="text-[11px] text-muted-foreground font-medium mb-0.5">Dispute ID</p>
          <div className="flex items-center gap-1">
            <p className="text-[14px] font-semibold text-foreground font-mono">{truncateId(d.id)}</p>
            <CopyBtn value={d.id} />
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-8 w-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {/* Scrollable body */}
      <div
        className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-4 pb-6 space-y-3"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Summary card */}
        <div className="rounded-2xl border border-border bg-card px-4 py-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <p className="text-[24px] font-bold text-foreground tabular-nums leading-tight">
                {fmtAmount(d.amount, d.currency)}
              </p>
              <p className="text-[12px] text-muted-foreground mt-0.5">{d.currency}</p>
            </div>
            <StatusBadge status={badge} size="sm" />
          </div>
          <p className="text-[12px] text-muted-foreground">
            Disputed on: {fmtDisputedOn(d.createdAt)}
          </p>
        </div>

        {/* Details 2x2 grid */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <PairedRow
            left={{ label: "Reason",   value: d.reason }}
            right={{ label: "Customer", value: d.customerName }}
          />
          <PairedRow
            last
            left={{ label: "Source", value: cardSource(d) }}
            right={{
              label: "Respond by",
              value: (
                <p className={cn(
                  "text-[13px] font-medium leading-snug",
                  urgent ? "text-red-500 font-semibold" : "text-foreground"
                )}>
                  {respondBy}
                </p>
              ),
            }}
          />
        </div>

        {/* Evidence section */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.09em] mb-2">
            Evidence
          </p>
          <div className="rounded-2xl border border-border bg-card px-4 py-4">
            {isDeadline ? (
              <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 px-3 py-3">
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-[13px] font-medium text-red-700 leading-snug">
                  Deadline passed - no further action possible.
                </p>
              </div>
            ) : isResolved ? (
              <p className="text-[13px] text-muted-foreground text-center py-2">
                This dispute has been resolved.
              </p>
            ) : (
              <button
                type="button"
                onClick={() => toast.success("Opening evidence form...")}
                className="w-full py-3 rounded-xl bg-primary text-white text-[14px] font-semibold active:opacity-80 transition-opacity"
              >
                Submit evidence
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── MobileDisputes ───────────────────────────────────────────────────────── */

export function MobileDisputes({
  open,
  onClose,
  contained = false,
}: {
  open: boolean;
  onClose: () => void;
  contained?: boolean;
}) {
  const pos = contained ? "absolute" : "fixed";

  const [selectedDispute, setSelectedDispute] = useState<DisputeMockRow | null>(null);
  const [searchQuery,     setSearchQuery]     = useState("");

  const chipsRef = useHorizontalScroll<HTMLDivElement>();

  const needsActionCount = disputes.filter(d => d.status === "open" || d.status === "under_review").length;
  const wonCount          = disputes.filter(d => d.status === "won").length;
  const lostCount         = disputes.filter(d => d.status === "lost").length;
  const inReviewCount     = disputes.filter(d => d.status === "under_review").length;

  const q = searchQuery.trim().toLowerCase();
  const filtered = disputes
    .filter(d =>
      !q ||
      d.customerName.toLowerCase().includes(q) ||
      d.reason.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q)
    );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="disputes-screen"
          className={`${pos} inset-x-0 bottom-0 z-[80] flex flex-col bg-[#f6f8fa] overflow-hidden`}
          style={{ top: 44 }}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        >
          {/* ── Screen header ── */}
          <div className="flex items-center gap-3 px-4 py-3 bg-[#f6f8fa] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-full text-foreground active:bg-muted/60 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={2} />
            </button>
            <h1 className="text-[18px] font-bold text-foreground">Disputes</h1>
          </div>

          {/* ── Scrollable content ── */}
          <div
            className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden pb-6"
            style={{ scrollbarWidth: "none" }}
          >
            {/* Desktop version banner */}
            <div className="mx-4 mt-3 mb-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
              <Monitor className="h-[18px] w-[18px] text-amber-600 shrink-0 mt-0.5" strokeWidth={1.75} />
              <p className="text-[13px] font-medium text-foreground leading-snug flex-1 min-w-0">
                This page is optimised for desktop. For the full experience, open PayGlocal on a larger screen.
              </p>
            </div>

            {/* Dispute overview metrics */}
            <div className="px-4 mb-3 space-y-2.5">
              <p className="text-[14px] font-bold text-foreground leading-none">Dispute overview</p>

              {/* Card A — Needs action */}
              <div className="rounded-2xl border border-border bg-card shadow-sm px-4 py-3.5 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-muted-foreground mb-1">Needs action</p>
                  <p className="text-[26px] font-bold text-foreground tabular-nums leading-tight">
                    {needsActionCount}
                  </p>
                </div>
                <div className="shrink-0">
                  <Sparkline data={DISPUTE_SPARK.needsAction} color="#f59e0b" w={120} h={48} />
                </div>
              </div>

              {/* Cards B / C / D */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-2xl border border-border bg-card shadow-sm px-3 py-3 flex flex-col">
                  <p className="text-[10px] font-medium text-muted-foreground leading-none mb-1.5">Disputes won</p>
                  <p className="text-[14px] font-bold text-foreground tabular-nums leading-tight">
                    {wonCount}
                  </p>
                  <div className="mt-2">
                    <Sparkline data={DISPUTE_SPARK.won} color="#10b981" w={80} h={28} />
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card shadow-sm px-3 py-3 flex flex-col">
                  <p className="text-[10px] font-medium text-muted-foreground leading-none mb-1.5">Disputes lost</p>
                  <p className="text-[14px] font-bold text-foreground tabular-nums leading-tight">
                    {lostCount}
                  </p>
                  <div className="mt-2">
                    <Sparkline data={DISPUTE_SPARK.lost} color="#ef4444" w={80} h={28} />
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card shadow-sm px-3 py-3 flex flex-col">
                  <p className="text-[10px] font-medium text-muted-foreground leading-none mb-1.5">Disputes in review</p>
                  <p className="text-[14px] font-bold text-foreground tabular-nums leading-tight">
                    {inReviewCount}
                  </p>
                  <div className="mt-2">
                    <Sparkline data={DISPUTE_SPARK.inReview} color="#3b82f6" w={80} h={28} />
                  </div>
                </div>
              </div>
            </div>

            {/* All Disputes card */}
            <div className="mx-4 rounded-2xl border border-border bg-card shadow-sm">

              {/* Card header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <p className="text-[15px] font-bold text-foreground">All Disputes</p>
                <button
                  type="button"
                  onClick={() => toast.success("Exporting...")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Download className="h-[14px] w-[14px]" strokeWidth={2} />
                  Export
                </button>
              </div>

              {/* Search + filter icon */}
              <div className="flex items-center gap-2.5 px-4 pb-3">
                <div className="flex-1 flex items-center gap-2.5 bg-muted/50 rounded-xl px-3.5 py-2.5">
                  <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={2} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by customer, reason, ID..."
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
                  onClick={() => toast.success("Opening filters...")}
                  className="h-[38px] w-[38px] flex items-center justify-center rounded-xl bg-muted/50 text-muted-foreground shrink-0"
                >
                  <SlidersHorizontal className="h-[15px] w-[15px]" strokeWidth={2} />
                </button>
              </div>

              {/* Filter chips */}
              <div
                ref={chipsRef}
                className="[&::-webkit-scrollbar]:hidden"
                style={{ overflowX: "scroll", scrollbarWidth: "none", WebkitOverflowScrolling: "touch", cursor: "grab" } as React.CSSProperties}
              >
                <div className="flex gap-2 px-4 pb-3 w-max">
                  {FILTER_CHIPS.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toast.success(`Filtering by ${label}...`)}
                      className="flex items-center gap-1 h-8 text-[12px] font-medium border border-dashed border-border bg-white text-muted-foreground rounded-xl px-3 whitespace-nowrap shrink-0 active:bg-muted/40 transition-colors"
                    >
                      <Plus className="h-[11px] w-[11px] text-muted-foreground/60 shrink-0" strokeWidth={2} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dispute rows */}
              <div className="divide-y divide-border/30">
                {filtered.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <p className="text-[14px] font-medium text-muted-foreground">No disputes</p>
                    <p className="text-[12px] text-muted-foreground mt-1">No disputes matching the selected filter</p>
                  </div>
                ) : filtered.map((d) => {
                  const badge      = d.badgeStatus ?? d.status;
                  const urgent     = badge === "deadline_missed";
                  const respondBy  = fmtRespondBy(d.dueDate);
                  return (
                    <div
                      key={d.id}
                      onClick={() => setSelectedDispute(d)}
                      className="px-4 py-3.5 cursor-pointer active:bg-muted/5 transition-colors select-none"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-bold text-foreground tabular-nums">
                            {fmtAmount(d.amount, d.currency)}
                          </p>
                          <p className="text-[12px] text-muted-foreground mt-0.5">{d.currency}</p>
                          <p className="text-[13px] text-muted-foreground mt-1.5 leading-snug">{d.reason}</p>
                          <p className="text-[12px] text-muted-foreground mt-0.5">{d.customerName}</p>
                        </div>
                        <div className="shrink-0 text-right flex flex-col items-end gap-1.5">
                          <StatusBadge status={badge} size="sm" />
                          <p className="text-[12px] text-muted-foreground">{cardSource(d)}</p>
                          <p className="text-[11px] text-muted-foreground">{fmtDisputedOn(d.createdAt)}</p>
                        </div>
                      </div>
                      <p className={cn(
                        "text-[11px] mt-2.5",
                        urgent ? "text-red-500 font-bold" : "text-muted-foreground"
                      )}>
                        Respond by: {respondBy}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Item count */}
              <p className="px-4 py-3 border-t border-border/40 text-[12px] text-muted-foreground">
                {filtered.length} item{filtered.length !== 1 ? "s" : ""}
              </p>

            </div>
          </div>

          {/* ── Dispute Detail overlay ── */}
          <AnimatePresence>
            {selectedDispute && (
              <>
                <motion.div
                  key="detail-backdrop"
                  className="absolute inset-0 z-[5]"
                  style={{
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    background: "rgba(0,0,0,0.2)",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  onClick={() => setSelectedDispute(null)}
                />
                <motion.div
                  key={selectedDispute.id}
                  className="absolute inset-x-0 bottom-0 z-[6] flex flex-col overflow-hidden bg-[#f6f8fa]"
                  style={{ height: "90%", borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                >
                  <DisputeDetail
                    dispute={selectedDispute}
                    onClose={() => setSelectedDispute(null)}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
