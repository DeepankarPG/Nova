"use client";

import { useState } from "react";
import {
  ArrowLeft, FileText, Calendar, CheckCircle2,
  Check, Copy, Monitor, X, Plus, Info,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ebrcEntries } from "@/lib/mock-data";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";

type EbrcEntry = typeof ebrcEntries[number];

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const CURRENCY_SYM: Record<string, string> = { USD: "$", EUR: "€", GBP: "£" };

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "2-digit",
  });
}

/* ─── CopyBtn ─────────────────────────────────────────────────────────────── */
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
      aria-label="Copy"
    >
      {done
        ? <Check className="h-[13px] w-[13px] text-emerald-600" strokeWidth={2.5} />
        : <Copy  className="h-[13px] w-[13px]" strokeWidth={2} />}
    </button>
  );
}

/* ─── SectionLabel ────────────────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.09em] px-4 mb-2">
      {children}
    </p>
  );
}

/* ─── PairedRow ───────────────────────────────────────────────────────────── */
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

/* ─── StatusPill (detail overlay only) ───────────────────────────────────── */
function StatusPill({ status }: { status: string }) {
  if (status === "issued") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-emerald-700 bg-emerald-50">
        <Check className="h-[9px] w-[9px]" strokeWidth={3} />
        Issued
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-amber-700 bg-amber-50">
      <span className="h-[4px] w-[4px] rounded-full bg-amber-500 shrink-0" />
      Pending
    </span>
  );
}

/* ─── EbrcDetail overlay ──────────────────────────────────────────────────── */
function EbrcDetail({ entry, onClose }: { entry: EbrcEntry; onClose: () => void }) {
  const sym = CURRENCY_SYM[entry.currency] ?? "";

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

      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/60 bg-background shrink-0">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground mb-1.5 leading-none">SB Number</p>
          <p className="text-[14px] font-bold text-foreground leading-tight">{entry.sbNumber}</p>
        </div>
        <button type="button" onClick={onClose}
          className="h-9 w-9 flex items-center justify-center rounded-full bg-muted text-foreground shrink-0"
          aria-label="Close"
        >
          <X className="h-[17px] w-[17px]" strokeWidth={2.25} />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
        <div className="flex flex-col gap-5 pt-4 pb-10">

          {/* Summary card */}
          <div className="mx-4 rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-end gap-2 flex-wrap">
                <span className="text-[32px] font-bold tracking-tight text-foreground leading-none">
                  {sym}{entry.amount.toLocaleString("en-IN")}
                </span>
                <span className="text-[13px] font-medium text-muted-foreground leading-none mb-0.5">
                  {entry.currency}
                </span>
                <span className="ml-auto shrink-0">
                  <StatusPill status={entry.status} />
                </span>
              </div>
              <div className="mt-3">
                <span className="text-[12px] text-muted-foreground leading-snug">
                  {entry.issueDate ? fmtDate(entry.issueDate) : "Not yet issued"}
                </span>
              </div>
            </div>
          </div>

          {/* Details 2x2 grid */}
          <div>
            <SectionLabel>eBRC Details</SectionLabel>
            <div className="mx-4 rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
              <PairedRow
                left={{
                  label: "Bank Ref #",
                  value: (
                    <div className="flex items-center gap-0.5 min-w-0">
                      <button type="button"
                        className="text-[13px] font-medium text-primary leading-snug truncate">
                        {entry.bankRefNumber}
                      </button>
                      <CopyBtn value={entry.bankRefNumber} />
                    </div>
                  ),
                }}
                right={{ label: "Exporter", value: entry.exporterName }}
              />
              <PairedRow
                last
                left={{ label: "Issue Date", value: fmtDate(entry.issueDate) }}
                right={{ label: "Expiry", value: fmtDate(entry.expiryDate) }}
              />
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

/* ─── Tab filter ──────────────────────────────────────────────────────────── */
type EbrcTab = "all" | "issued" | "pending";

const EBRC_TABS: { id: EbrcTab; label: string }[] = [
  { id: "all",     label: "All"     },
  { id: "issued",  label: "Issued"  },
  { id: "pending", label: "Pending" },
];

/* ─── Root ────────────────────────────────────────────────────────────────── */
export interface MobileEbrcProps {
  open: boolean;
  onClose: () => void;
  contained?: boolean;
}

export function MobileEbrc({ open, onClose, contained = false }: MobileEbrcProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [infoOpen,   setInfoOpen]   = useState(false);
  const [ebrcTab,    setEbrcTab]    = useState<EbrcTab>("all");
  const statCardsRef                = useHorizontalScroll();

  const pos      = contained ? "absolute" : "fixed";
  const selected = selectedId ? (ebrcEntries.find(e => e.id === selectedId) ?? null) : null;

  const issued  = ebrcEntries.filter(e => e.status === "issued").length;
  const pending = ebrcEntries.filter(e => e.status === "pending").length;
  const total   = ebrcEntries.length;

  const filtered = ebrcTab === "all" ? ebrcEntries : ebrcEntries.filter(e => e.status === ebrcTab);

  const STAT_CARDS = [
    { icon: CheckCircle2, iconColor: "text-[#0047b0]", iconBg: "bg-[#eff4ff]", label: "ISSUED",  value: issued.toString()  },
    { icon: FileText,     iconColor: "text-amber-600", iconBg: "bg-amber-50",   label: "PENDING", value: pending.toString() },
    { icon: Calendar,     iconColor: "text-slate-600", iconBg: "bg-slate-100",  label: "TOTAL",   value: total.toString()   },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="ebrc-overlay"
          className={`${pos} inset-0 z-[80] flex flex-col bg-[#f6f8fa] overflow-hidden`}
          initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        >
          {/* Screen header */}
          <div
            className="flex items-center gap-3 px-4 bg-background border-b border-border/40 shrink-0"
            style={{ paddingTop: "max(20px, env(safe-area-inset-top))", paddingBottom: 14 }}
          >
            <button type="button" onClick={onClose}
              className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-foreground active:scale-95 transition-transform shrink-0"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            </button>
            <p className="text-[17px] font-bold text-foreground tracking-tight flex-1">eBRC</p>
            <button type="button" onClick={() => setInfoOpen(true)}
              className="h-9 w-9 flex items-center justify-center rounded-full text-muted-foreground active:bg-muted/60 transition-colors shrink-0"
              aria-label="What is eBRC?"
            >
              <Info className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>

            {/* Desktop version banner */}
            <div className="mx-4 mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <Monitor className="h-[18px] w-[18px] text-amber-600 shrink-0" strokeWidth={1.75} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground leading-snug">Switch to desktop for the best experience</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">Some features are limited on mobile.</p>
              </div>
              <button
                type="button"
                onClick={() => window.open("/", "_blank")}
                className="text-[13px] font-medium text-primary shrink-0 whitespace-nowrap active:opacity-70 transition-opacity"
              >
                Open desktop ↗
              </button>
            </div>

            {/* Stat cards — horizontal scroll */}
            <div
              ref={statCardsRef}
              className="[&::-webkit-scrollbar]:hidden pt-4"
              style={{ overflowX: "auto", scrollbarWidth: "none", WebkitOverflowScrolling: "touch", cursor: "grab" } as React.CSSProperties}
            >
              <div className="flex gap-3 px-4" style={{ width: "max-content" }}>
                {STAT_CARDS.map(card => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.label}
                      className="bg-card border border-border rounded-xl p-3.5 flex flex-col gap-2.5 shrink-0"
                      style={{ width: "42vw", minWidth: 130, maxWidth: 165 }}
                    >
                      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", card.iconBg)}>
                        <Icon className={cn("h-[17px] w-[17px]", card.iconColor)} strokeWidth={1.75} />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider leading-none mb-1.5">{card.label}</p>
                        <p className="text-[24px] font-bold text-foreground leading-none tabular-nums">{card.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* eBRC list card */}
            <div className="mx-4 mt-4 bg-card border border-border rounded-xl overflow-hidden">

              {/* List header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border/40">
                <p className="text-[14px] font-bold text-foreground">All eBRC Entries</p>
                <button
                  type="button"
                  onClick={() => toast.success("Coming soon")}
                  className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shrink-0 active:opacity-80 transition-opacity"
                >
                  <Plus className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                </button>
              </div>

              {/* Segmented tab bar */}
              <div className="px-4 pt-3 pb-2">
                <div className="flex gap-1 bg-muted/60 p-1 rounded-xl">
                  {EBRC_TABS.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setEbrcTab(t.id)}
                      className={cn(
                        "flex-1 py-1.5 text-[11.5px] font-medium rounded-lg transition-colors whitespace-nowrap",
                        ebrcTab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-border/50">
                {filtered.map(entry => {
                  const sym         = CURRENCY_SYM[entry.currency] ?? "";
                  const amountColor = entry.status === "issued" ? "text-emerald-600" : "text-amber-600";
                  return (
                    <div
                      key={entry.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedId(entry.id)}
                      onKeyDown={(e) => e.key === "Enter" && setSelectedId(entry.id)}
                      className="w-full px-4 py-3.5 cursor-pointer active:bg-muted/30 transition-colors duration-100"
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Left */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-foreground leading-snug truncate">{entry.sbNumber}</p>
                          <p className="text-[12px] text-primary font-medium mt-0.5 leading-snug">{entry.bankRefNumber}</p>
                          <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug truncate">{entry.exporterName}</p>
                        </div>
                        {/* Right */}
                        <div className="shrink-0 text-right">
                          <p className={cn("text-[14px] font-bold leading-snug tabular-nums whitespace-nowrap", amountColor)}>
                            {sym}{entry.amount.toLocaleString("en-IN")}
                            <span className="text-[11px] font-normal text-muted-foreground ml-1">{entry.currency}</span>
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                            {fmtDate(entry.issueDate)}
                          </p>
                        </div>
                      </div>
                      {/* Expiry full-width */}
                      <p className="text-[11px] text-muted-foreground/70 mt-1.5">
                        Expiry: {fmtDate(entry.expiryDate)}
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

            <div style={{ height: 32 }} />
          </div>

          {/* EbrcDetail slide-up */}
          <AnimatePresence>
            {selected && (
              <>
                <motion.div
                  key="ebrc-detail-backdrop"
                  className="absolute inset-0 z-10"
                  style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", background: "rgba(0,0,0,0.2)" }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  onClick={() => setSelectedId(null)}
                />
                <EbrcDetail key={selected.id} entry={selected} onClose={() => setSelectedId(null)} />
              </>
            )}
          </AnimatePresence>

          {/* Info overlay */}
          <AnimatePresence>
            {infoOpen && (
              <>
                <motion.div
                  key="info-backdrop"
                  className="absolute inset-0 z-20"
                  style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", background: "rgba(0,0,0,0.2)" }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  onClick={() => setInfoOpen(false)}
                />
                <motion.div
                  key="info-sheet"
                  className="absolute inset-x-0 bottom-0 z-[21] flex flex-col bg-[#f6f8fa] overflow-hidden"
                  style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
                  initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                  transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                >
                  <div className="flex justify-center pt-2.5 pb-0.5 shrink-0">
                    <div className="h-1 w-9 rounded-full bg-muted-foreground/25" />
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-background shrink-0">
                    <p className="text-[16px] font-medium text-foreground">What is eBRC?</p>
                    <button type="button" onClick={() => setInfoOpen(false)}
                      className="h-9 w-9 flex items-center justify-center rounded-full bg-muted text-foreground shrink-0"
                      aria-label="Close"
                    >
                      <X className="h-[17px] w-[17px]" strokeWidth={2.25} />
                    </button>
                  </div>
                  <div className="px-4 py-5">
                    <p className="text-[14px] text-muted-foreground leading-relaxed">
                      Electronic Bank Realisation Certificate (eBRC) is issued by banks to exporters as proof of foreign exchange realisation against export shipments. Required for DGFT benefits and export incentives.
                    </p>
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
