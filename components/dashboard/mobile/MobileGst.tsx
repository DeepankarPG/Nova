"use client";

import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, Search, Download, ChevronLeft, ChevronRight, X, Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ─── Types ───────────────────────────────────────────────────────── */
type GstProductType = "Multi-currency accounts" | "Payment aggregator" | "Fraud screening";
type GstTabId = "mca" | "pg" | "fraud";
type AmountSort = "high-low" | "low-high" | null;

interface GstReceipt {
  id:            string;
  invoiceNumber: string;
  invoiceId:     string;
  amount:        number;
  month:         string;
  monthSort:     string;
  productType:   GstProductType;
}

const PAGE_SIZE = 10;

/* ─── Tabs ────────────────────────────────────────────────────────── */
const GST_TABS: { id: GstTabId; label: string }[] = [
  { id: "mca",   label: "Multi-currency accounts" },
  { id: "pg",    label: "Payment aggregator"       },
  { id: "fraud", label: "Fraud screening"           },
];

/* ─── Mock data ───────────────────────────────────────────────────── */
const GST_RECEIPTS: Record<GstTabId, GstReceipt[]> = {
  mca: [
    { id: "g1",  invoiceNumber: "INV-2026-08-0512", invoiceId: "b7f4c21ae93d", amount: 486250.00, month: "August 2026",    monthSort: "2026-08", productType: "Multi-currency accounts" },
    { id: "g2",  invoiceNumber: "INV-2026-07-0483", invoiceId: "9f2e7d05c8b1", amount: 452180.75, month: "July 2026",      monthSort: "2026-07", productType: "Multi-currency accounts" },
    { id: "g3",  invoiceNumber: "INV-2026-06-0454", invoiceId: "16de8b47c0f9", amount: 471905.00, month: "June 2026",      monthSort: "2026-06", productType: "Multi-currency accounts" },
    { id: "g4",  invoiceNumber: "INV-2026-05-0425", invoiceId: "20b6ad91ce74", amount: 398640.50, month: "May 2026",       monthSort: "2026-05", productType: "Multi-currency accounts" },
    { id: "g5",  invoiceNumber: "INV-2026-04-0396", invoiceId: "4c8e10fb7d25", amount: 415370.00, month: "April 2026",     monthSort: "2026-04", productType: "Multi-currency accounts" },
    { id: "g6",  invoiceNumber: "INV-2026-03-0367", invoiceId: "e91a53d0f6b8", amount: 523815.25, month: "March 2026",     monthSort: "2026-03", productType: "Multi-currency accounts" },
    { id: "g7",  invoiceNumber: "INV-2026-02-0338", invoiceId: "7b04ce8a12df", amount: 361490.00, month: "February 2026",  monthSort: "2026-02", productType: "Multi-currency accounts" },
    { id: "g8",  invoiceNumber: "INV-2026-01-0309", invoiceId: "a5d8720fb31c", amount: 389075.50, month: "January 2026",   monthSort: "2026-01", productType: "Multi-currency accounts" },
    { id: "g9",  invoiceNumber: "INV-2025-12-0280", invoiceId: "3e6c94a08bd7", amount: 604320.00, month: "December 2025",  monthSort: "2025-12", productType: "Multi-currency accounts" },
    { id: "g10", invoiceNumber: "INV-2025-11-0251", invoiceId: "c208f5b71ea4", amount: 512760.25, month: "November 2025",  monthSort: "2025-11", productType: "Multi-currency accounts" },
    { id: "g11", invoiceNumber: "INV-2025-10-0222", invoiceId: "91af3c60d5e7", amount: 447230.00, month: "October 2025",   monthSort: "2025-10", productType: "Multi-currency accounts" },
    { id: "g12", invoiceNumber: "INV-2025-09-0193", invoiceId: "5d0b8e2a94f1", amount: 378910.75, month: "September 2025", monthSort: "2025-09", productType: "Multi-currency accounts" },
  ],
  pg: [
    { id: "p1", invoiceNumber: "INV-2026-08-0098", invoiceId: "6a91cf34b0d2", amount: 214500.00, month: "August 2026", monthSort: "2026-08", productType: "Payment aggregator" },
    { id: "p2", invoiceNumber: "INV-2026-07-0089", invoiceId: "3f0e8a21c9b6", amount: 198750.50, month: "July 2026",   monthSort: "2026-07", productType: "Payment aggregator" },
    { id: "p3", invoiceNumber: "INV-2026-06-0081", invoiceId: "c72d1f6b8a04", amount: 225300.00, month: "June 2026",   monthSort: "2026-06", productType: "Payment aggregator" },
  ],
  fraud: [
    { id: "f1", invoiceNumber: "INV-2026-08-0031", invoiceId: "8e4c72a0f1d9", amount: 42500.00, month: "August 2026", monthSort: "2026-08", productType: "Fraud screening" },
    { id: "f2", invoiceNumber: "INV-2026-07-0028", invoiceId: "1b6f93d4e0a7", amount: 39800.00, month: "July 2026",   monthSort: "2026-07", productType: "Fraud screening" },
  ],
};

/* ─── Helpers ─────────────────────────────────────────────────────── */
function fmtInr(amount: number) {
  return "₹" + amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ─── Swipe-to-reveal row action (Download) ─────────────────────────── */
const SWIPE_WIDTH = 84;

function SwipeCard({ isOpen, onOpen, onClose, onDownload, children }: {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onDownload: () => void;
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
      if (isOpen) onClose();
      return;
    }
    const finalX = Math.max(-SWIPE_WIDTH, Math.min(0, baseX + dragX));
    setDragX(0);
    if (isOpen) {
      if (finalX > -(SWIPE_WIDTH * 0.5)) onClose(); else onOpen();
    } else {
      if (finalX < -(SWIPE_WIDTH * 0.3)) onOpen(); else onClose();
    }
  }

  return (
    <div className="relative overflow-hidden">
      {/* Action button — fixed behind the row */}
      <div className="absolute right-0 top-0 bottom-0 flex" style={{ width: SWIPE_WIDTH }}>
        <button type="button" onClick={onDownload}
          className="flex flex-col items-center justify-center flex-1 bg-primary"
        >
          <Download className="h-[18px] w-[18px] text-white" strokeWidth={2} />
          <span className="text-[11px] font-medium text-white mt-1">Download</span>
        </button>
      </div>

      {/* Row content — slides left on swipe */}
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

/* ─── Root — GST landing screen ─────────────────────────────────────── */
export interface MobileGstProps {
  open: boolean;
  onClose: () => void;
  contained?: boolean;
}

export function MobileGst({ open, onClose, contained = false }: MobileGstProps) {
  const pos = contained ? "absolute" : "fixed";
  const [tab,          setTab]          = useState<GstTabId>("mca");
  const [search,       setSearch]       = useState("");
  const [amountSort,   setAmountSort]   = useState<AmountSort>(null);
  const [monthFilter,  setMonthFilter]  = useState<string | null>(null);
  const [openChip,     setOpenChip]     = useState<"amount" | "month" | null>(null);
  const [page,         setPage]         = useState(1);
  const [swipedId,     setSwipedId]     = useState<string | null>(null);

  const setTabAndReset = (t: GstTabId) => {
    setTab(t);
    setMonthFilter(null);
    setAmountSort(null);
    setSearch("");
    setPage(1);
  };

  const all = GST_RECEIPTS[tab];
  const monthOptions = Array.from(new Set(all.map((r) => r.month)));

  const q = search.trim().toLowerCase();
  let filtered = all
    .filter((r) => !q || r.invoiceId.toLowerCase().includes(q) || r.invoiceNumber.toLowerCase().includes(q))
    .filter((r) => !monthFilter || r.month === monthFilter);
  if (amountSort) {
    filtered = [...filtered].sort((a, b) => amountSort === "high-low" ? b.amount - a.amount : a.amount - b.amount);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const paged = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const handleDownload = (r: GstReceipt) => {
    toast.success(`Downloading receipt for ${r.month}...`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="gst-screen"
          className={`${pos} inset-x-0 bottom-0 z-[80] flex flex-col bg-background overflow-hidden`}
          style={{ top: 44 }}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 bg-background border-b border-border/40 shrink-0"
            style={{ paddingTop: 14, paddingBottom: 14 }}
          >
            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-foreground active:scale-95 transition-transform shrink-0"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[17px] font-bold text-foreground tracking-tight leading-tight">GST</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">{all.length} Receipts</p>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>

            {/* Page intro */}
            <div className="mx-4 mt-4">
              <p className="text-[19px] font-bold text-foreground tracking-tight leading-tight">Receipts</p>
              <p className="text-[12.5px] text-muted-foreground mt-1 leading-snug">
                View monthly payment receipts that you can use to redeem your GST.
              </p>
            </div>

            <div className="mx-4 mt-3 mb-6 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">

              {/* Tabs — matches Team Management: single flex row, centered labels */}
              <div className="flex gap-1 mx-4 mt-4 mb-3 bg-muted/60 p-1 rounded-xl overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
                {GST_TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTabAndReset(t.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center py-1.5 text-[11.5px] font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 px-1.5",
                      tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Search — matches Payment Links / Team Management: single-level wrapper */}
              <div className="px-4 pb-3">
                <div className="flex items-center gap-2.5 bg-muted/50 rounded-xl px-3.5 py-2.5">
                  <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={2} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search by invoice ID"
                    className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none min-w-0"
                  />
                  {search && (
                    <button type="button" onClick={() => setSearch("")}>
                      <X className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter chips */}
              <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
                {/* Amount sort chip */}
                <div className="relative shrink-0">
                  <button type="button" onClick={() => setOpenChip(openChip === "amount" ? null : "amount")}
                    className={cn(
                      "flex items-center gap-1 h-8 px-3 rounded-xl text-[12px] font-medium whitespace-nowrap transition-colors",
                      amountSort ? "bg-primary text-white" : "border border-dashed border-border bg-white text-muted-foreground"
                    )}
                  >
                    {amountSort === "high-low" ? "Amount: High to low" : amountSort === "low-high" ? "Amount: Low to high" : "+ Amount"}
                    {amountSort && (
                      <span role="button"
                        onClick={(e) => { e.stopPropagation(); setAmountSort(null); }}
                        className="flex h-[16px] w-[16px] items-center justify-center rounded-full bg-white/20 ml-0.5"
                      >
                        <X className="h-[9px] w-[9px] text-white" strokeWidth={2.5} />
                      </span>
                    )}
                  </button>
                  {openChip === "amount" && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenChip(null)} />
                      <div className="absolute left-0 top-full mt-1.5 z-20 rounded-2xl border border-border bg-white overflow-hidden shadow-lg" style={{ minWidth: 190 }}>
                        {([["high-low", "High to low"], ["low-high", "Low to high"]] as const).map(([id, label]) => (
                          <button key={id} type="button" onClick={() => { setAmountSort(id); setOpenChip(null); setPage(1); }}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-left active:bg-muted/20"
                          >
                            <span className={cn("text-[13px]", amountSort === id ? "font-semibold text-foreground" : "text-muted-foreground")}>{label}</span>
                            {amountSort === id && <Check className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Month filter chip */}
                <div className="relative shrink-0">
                  <button type="button" onClick={() => setOpenChip(openChip === "month" ? null : "month")}
                    className={cn(
                      "flex items-center gap-1 h-8 px-3 rounded-xl text-[12px] font-medium whitespace-nowrap transition-colors",
                      monthFilter ? "bg-primary text-white" : "border border-dashed border-border bg-white text-muted-foreground"
                    )}
                  >
                    {monthFilter ?? "+ Month"}
                    {monthFilter && (
                      <span role="button"
                        onClick={(e) => { e.stopPropagation(); setMonthFilter(null); }}
                        className="flex h-[16px] w-[16px] items-center justify-center rounded-full bg-white/20 ml-0.5"
                      >
                        <X className="h-[9px] w-[9px] text-white" strokeWidth={2.5} />
                      </span>
                    )}
                  </button>
                  {openChip === "month" && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenChip(null)} />
                      <div className="absolute left-0 top-full mt-1.5 z-20 rounded-2xl border border-border bg-white overflow-hidden overflow-y-auto shadow-lg" style={{ minWidth: 190, maxHeight: 220 }}>
                        {monthOptions.map((m) => (
                          <button key={m} type="button" onClick={() => { setMonthFilter(m); setOpenChip(null); setPage(1); }}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-left active:bg-muted/20"
                          >
                            <span className={cn("text-[13px]", monthFilter === m ? "font-semibold text-foreground" : "text-muted-foreground")}>{m}</span>
                            {monthFilter === m && <Check className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Rows — swipe left to reveal Download */}
              <div className="divide-y divide-border">
                {paged.length === 0 ? (
                  <p className="px-4 py-8 text-center text-[13px] text-muted-foreground">No receipts found</p>
                ) : paged.map((r) => (
                  <SwipeCard key={r.id}
                    isOpen={swipedId === r.id}
                    onOpen={() => setSwipedId(r.id)}
                    onClose={() => setSwipedId(null)}
                    onDownload={() => { setSwipedId(null); handleDownload(r); }}
                  >
                    <div className="px-4 py-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-[12.5px] font-bold text-foreground leading-snug truncate">{r.invoiceNumber}</p>
                          <p className="text-[12px] text-muted-foreground mt-0.5 font-mono truncate">{r.invoiceId}</p>
                          <div className="mt-1.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-muted text-muted-foreground">
                              {r.productType}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right flex flex-col items-end gap-1.5">
                          <p className="text-[13px] font-bold text-foreground tabular-nums leading-snug whitespace-nowrap">{fmtInr(r.amount)}</p>
                          <p className="text-[11px] text-muted-foreground leading-snug">{r.month}</p>
                        </div>
                      </div>
                    </div>
                  </SwipeCard>
                ))}
              </div>

              {/* Pagination */}
              {filtered.length > 0 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
                  <p className="text-[11.5px] text-muted-foreground">
                    Showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, filtered.length)} of {filtered.length} results
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button type="button" disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="h-7 w-7 flex items-center justify-center rounded-lg border border-border text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                    <span className="text-[12px] font-semibold text-foreground px-1.5">{currentPage} / {totalPages}</span>
                    <button type="button" disabled={currentPage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="h-7 w-7 flex items-center justify-center rounded-lg border border-border text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
