"use client";

import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, Download, Plus, Copy, Send, Ban, ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ── Types ────────────────────────────────────────────────────────────── */
type MCAStatus = "active" | "expired" | "deactivated";
type MCATab    = "all" | MCAStatus;

type MCALink = {
  id: string;
  mcaLinkId: string;
  amount: number;
  currency: string;
  status: MCAStatus;
  customerCountry: string;
  customerEmail: string;
  invoiceNumber: string;
  reason: string;
  createdAt: string;
  expiresAt: string;
};

/* ── Mock data ────────────────────────────────────────────────────────── */
const MCA_LINKS: MCALink[] = [
  {
    id: "MCA-001",
    mcaLinkId: "ml_e7b86278336cb73db",
    amount: 13.00,
    currency: "USD",
    status: "active",
    customerCountry: "New Zealand",
    customerEmail: "nidhi@gmail.com",
    invoiceNumber: "INV-12345",
    reason: "For testing",
    createdAt: "26 Jun '26 · 10:33 AM",
    expiresAt: "24 Sep '26",
  },
  {
    id: "MCA-002",
    mcaLinkId: "ml_a1b2c3d4e5f6g7h8i",
    amount: 1003.00,
    currency: "GBP",
    status: "active",
    customerCountry: "United Kingdom",
    customerEmail: "james.ob@gmail.com",
    invoiceNumber: "INV-12346",
    reason: "Platform subscription",
    createdAt: "20 Jun '26 · 09:15 AM",
    expiresAt: "20 Sep '26",
  },
  {
    id: "MCA-003",
    mcaLinkId: "ml_z9y8x7w6v5u4t3s2r",
    amount: 450.75,
    currency: "EUR",
    status: "expired",
    customerCountry: "Germany",
    customerEmail: "hans.m@techcorp.de",
    invoiceNumber: "INV-12340",
    reason: "API integration fee",
    createdAt: "01 Mar '26 · 11:00 AM",
    expiresAt: "01 Jun '26",
  },
];

/* ── Helpers ──────────────────────────────────────────────────────────── */
function fmtAmount(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ── Period / metrics ─────────────────────────────────────────────────── */
type Period = "1D" | "1W" | "1M" | "3M" | "YTD";

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

type McaMetric = {
  totalVolume: string; volDelta: string; volPos: boolean;
  active:   string; activeDelta:   string;
  expired:  string; expiredDelta:  string;
  inactive: string; inactiveDelta: string;
};

const MCA_METRICS: Record<Period, McaMetric> = {
  "1D":  { totalVolume: "$1,41,300.00",  volDelta: "+9.4% vs last",  volPos: true,  active: "2",  activeDelta: "+2",  expired: "1",  expiredDelta: "+1",  inactive: "0",  inactiveDelta: "0"  },
  "1W":  { totalVolume: "$5,80,200.00",  volDelta: "+12.1% vs last", volPos: true,  active: "5",  activeDelta: "+3",  expired: "2",  expiredDelta: "+1",  inactive: "1",  inactiveDelta: "0"  },
  "1M":  { totalVolume: "$18,40,500.00", volDelta: "+7.6% vs last",  volPos: true,  active: "12", activeDelta: "+4",  expired: "7",  expiredDelta: "+2",  inactive: "3",  inactiveDelta: "0"  },
  "3M":  { totalVolume: "$52,30,800.00", volDelta: "+15.3% vs last", volPos: true,  active: "28", activeDelta: "+8",  expired: "18", expiredDelta: "+5",  inactive: "9",  inactiveDelta: "+1" },
  "YTD": { totalVolume: "$93,14,200.00", volDelta: "+22.7% vs last", volPos: true,  active: "46", activeDelta: "+14", expired: "31", expiredDelta: "+9",  inactive: "16", inactiveDelta: "+3" },
};

const MCA_SPARK = {
  volume:   [8000, 12000, 15000, 18000, 25000, 32000, 38000, 141300],
  active:   [0,    0,     0,     1,     1,     2,     2,     2     ],
  expired:  [0,    0,     0,     0,     0,     0,     1,     1     ],
  inactive: [0,    0,     0,     0,     0,     0,     0,     0     ],
};

function Sparkline({ data, color, w, h }: { data: number[]; color: string; w: number; h: number }) {
  if (data.length < 2) return null;
  const min  = Math.min(...data);
  const max  = Math.max(...data);
  const range = max - min || 1;
  const pad  = 2;
  const step = w / (data.length - 1);
  const pts  = data.map((v, i) =>
    `${i * step},${h - pad - ((v - min) / range) * (h - pad * 2)}`
  ).join(" ");
  const lastX = (data.length - 1) * step;
  const area  = `0,${h} ${pts} ${lastX},${h}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <polygon points={area} fill={color} fillOpacity={0.12} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Tab definitions ──────────────────────────────────────────────────── */
const MCA_TABS: { id: MCATab; label: string }[] = [
  { id: "all",          label: "All"          },
  { id: "active",       label: "Active"       },
  { id: "expired",      label: "Expired"      },
  { id: "deactivated",  label: "Inactive"     },
];

/* ── Swipe geometry ───────────────────────────────────────────────────── */
const SWIPE_WIDTH = 225; // 3 actions × 75 px each

/* ── Swipe card ───────────────────────────────────────────────────────── */
function SwipeCard({
  isOpen, onOpen, onClose, onCopy, onSend, onDisable, isCopied, children,
}: {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onCopy: () => void;
  onSend: () => void;
  onDisable: () => void;
  isCopied: boolean;
  children: React.ReactNode;
}) {
  const [dragX,      setDragX]      = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX      = useRef(0);
  const startY      = useRef(0);
  const gestureDir  = useRef<"h" | "v" | null>(null);
  const didMove     = useRef(false);

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
      finalX > -(SWIPE_WIDTH * 0.5) ? onClose() : onOpen();
    } else {
      finalX < -(SWIPE_WIDTH * 0.3) ? onOpen() : onClose();
    }
  }

  return (
    <div className="relative overflow-hidden">
      {/* Action buttons */}
      <div className="absolute right-0 top-0 bottom-0 flex" style={{ width: SWIPE_WIDTH }}>
        <button type="button" onClick={onCopy}
          className="flex flex-col items-center justify-center flex-1 bg-primary transition-opacity"
        >
          {isCopied
            ? <Check className="h-[18px] w-[18px] text-white" strokeWidth={2.5} />
            : <Copy  className="h-[18px] w-[18px] text-white" strokeWidth={2} />
          }
          <span className="text-[11px] font-medium text-white mt-1">
            {isCopied ? "Copied" : "Copy"}
          </span>
        </button>
        <button type="button" onClick={onSend}
          className="flex flex-col items-center justify-center flex-1 bg-amber-500"
        >
          <Send className="h-[18px] w-[18px] text-white" strokeWidth={2} />
          <span className="text-[11px] font-medium text-white mt-1">Resend</span>
        </button>
        <button type="button" onClick={onDisable}
          className="flex flex-col items-center justify-center flex-1 bg-red-500"
        >
          <Ban className="h-[18px] w-[18px] text-white" strokeWidth={2} />
          <span className="text-[11px] font-medium text-white mt-1">Disable</span>
        </button>
      </div>

      {/* Card content */}
      <div
        className="relative z-[1] bg-card"
        style={{
          transform:  `translateX(${translateX}px)`,
          transition: isDragging ? "none" : "transform 0.22s cubic-bezier(0.22,1,0.36,1)",
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

/* ── Component ────────────────────────────────────────────────────────── */
export function MobileMcaLinks({
  onCreateMcaLink,
  onDisableRequest,
  onToast,
}: {
  onCreateMcaLink?: () => void;
  onDisableRequest?: (id: string, onConfirm: () => void) => void;
  onToast?: (message: string, type: "success" | "error") => void;
} = {}) {
  const [tab,          setTab]          = useState<MCATab>("all");
  const [search,       setSearch]       = useState("");
  const [swipedId,     setSwipedId]     = useState<string | null>(null);
  const [disableId,    setDisableId]    = useState<string | null>(null);
  const [copiedId,     setCopiedId]     = useState<string | null>(null);
  const copiedTimer                     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [statuses,     setStatuses]     = useState<Record<string, MCAStatus>>(
    Object.fromEntries(MCA_LINKS.map(m => [m.id, m.status]))
  );
  const [period,       setPeriod]       = useState<Period>("1M");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const q = search.trim().toLowerCase();
  const filtered = MCA_LINKS
    .filter(m => tab === "all" || (statuses[m.id] ?? m.status) === tab)
    .filter(m =>
      !q ||
      m.mcaLinkId.toLowerCase().includes(q) ||
      m.customerEmail.toLowerCase().includes(q) ||
      m.invoiceNumber.toLowerCase().includes(q)
    );

  function confirmDisable() {
    if (!disableId) return;
    setStatuses(prev => ({ ...prev, [disableId]: "deactivated" }));
    setDisableId(null);
    setSwipedId(null);
    if (onToast) onToast("Link has been disabled", "error");
    else toast.error("Link has been disabled");
  }

  return (
    <div className="space-y-0 pb-10 bg-background min-h-full">

      {/* ── Disable confirmation sheet ── */}
      <AnimatePresence>
        {disableId && (
          <>
            <motion.div
              key="disable-backdrop"
              className="fixed inset-0 z-[30] bg-black/30"
              style={{ backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDisableId(null)}
            />
            <motion.div
              key="disable-sheet"
              className="fixed inset-x-0 bottom-0 z-[31] bg-background rounded-t-3xl px-4 pt-5 pb-8"
              style={{ boxShadow: "0 -4px 24px rgba(0,0,0,0.12)" }}
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-5" />

              <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-red-50 mx-auto mb-4">
                <Ban className="h-6 w-6 text-red-500" strokeWidth={2} />
              </div>

              <p className="text-[16px] font-bold text-foreground text-center mb-2">
                Disable this link?
              </p>
              <p className="text-[13px] text-muted-foreground text-center leading-relaxed mb-6 px-2">
                The customer will no longer be able to use this link to make a payment.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDisableId(null)}
                  className="flex-1 py-3.5 rounded-2xl border border-border text-[14.5px] font-semibold text-foreground active:bg-muted/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDisable}
                  className="flex-1 py-3.5 rounded-2xl bg-red-500 text-[14.5px] font-semibold text-white active:bg-red-600 transition-colors"
                >
                  Disable link
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Zone 1: Period selector ── */}
      <div className="bg-background px-4 pt-3.5 pb-2.5 relative">
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-muted-foreground font-medium">{PERIOD_LABELS[period]}</p>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(p => !p)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-border bg-card text-[12px] font-medium text-foreground active:bg-muted/40 transition-colors"
            >
              {PERIODS.find(p => p.id === period)?.label ?? "1 Month"}
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-[20]" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 w-40 bg-white rounded-2xl border border-border shadow-lg z-[21] overflow-hidden">
                  {PERIODS.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { setPeriod(p.id); setDropdownOpen(false); }}
                      className="flex items-center justify-between w-full px-3.5 py-2.5 text-[13px] text-foreground active:bg-muted/30 transition-colors"
                    >
                      {p.label}
                      {period === p.id && <Check className="h-3.5 w-3.5 text-primary" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Zone 2: Metrics cards ── */}
      {(() => {
        const m = MCA_METRICS[period];
        const miniCards = [
          { label: "Active",   value: m.active,   delta: m.activeDelta,   color: "text-emerald-600",      spark: MCA_SPARK.active,   sparkColor: "#10b981" },
          { label: "Expired",  value: m.expired,  delta: m.expiredDelta,  color: "text-red-500",          spark: MCA_SPARK.expired,  sparkColor: "#ef4444" },
          { label: "Inactive", value: m.inactive, delta: m.inactiveDelta, color: "text-muted-foreground", spark: MCA_SPARK.inactive, sparkColor: "#94a3b8" },
        ];
        return (
          <div className="px-4 space-y-2.5 pb-3">
            {/* Total MCA Volume */}
            <div className="rounded-2xl border border-border bg-card shadow-sm px-4 py-3.5 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[11.5px] text-muted-foreground font-medium mb-1">Total MCA Volume</p>
                <p className="text-[22px] font-bold text-foreground tabular-nums leading-tight">{m.totalVolume}</p>
                <p className={cn("text-[11.5px] font-medium mt-1", m.volPos ? "text-emerald-600" : "text-red-500")}>{m.volDelta}</p>
              </div>
              <div className="shrink-0">
                <Sparkline data={MCA_SPARK.volume} color="#6366f1" w={80} h={40} />
              </div>
            </div>
            {/* Mini stat cards */}
            <div className="grid grid-cols-3 gap-2.5">
              {miniCards.map(card => (
                <div key={card.label} className="rounded-2xl border border-border bg-card shadow-sm px-3 py-3 flex flex-col">
                  <p className="text-[10.5px] text-muted-foreground font-medium mb-1.5">{card.label}</p>
                  <p className="text-[18px] font-bold text-foreground tabular-nums leading-tight">{card.value}</p>
                  <p className={cn("text-[11px] font-medium mt-0.5", card.color)}>{card.delta}</p>
                  <div className="mt-2">
                    <Sparkline data={card.spark} color={card.sparkColor} w={80} h={28} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── All MCA Links container ── */}
      <div className="mx-4 mt-3 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">

        {/* Section header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 gap-2">
          <p className="text-[15px] font-bold text-foreground shrink-0">All MCA Links</p>
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
              onClick={onCreateMcaLink}
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
              placeholder="Search by customer, MCA link ID..."
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
          {MCA_TABS.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 py-1.5 text-[11.5px] font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 px-1",
                tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Card rows */}
        <div className="divide-y divide-border">
          {filtered.length === 0 ? (
            <p className="px-4 py-[60px] text-center text-[13px] text-muted-foreground">No MCA links</p>
          ) : filtered.map(mca => {
            const status = statuses[mca.id] ?? mca.status;
            const isActive = status === "active";
            const isExpired = status === "expired" || status === "deactivated";
            const truncatedId = mca.mcaLinkId.length > 8
              ? `${mca.mcaLinkId.slice(0, 4)}....${mca.mcaLinkId.slice(-4)}`
              : mca.mcaLinkId;

            return (
              <SwipeCard
                key={mca.id}
                isOpen={swipedId === mca.id}
                isCopied={copiedId === mca.id}
                onOpen={() => setSwipedId(mca.id)}
                onClose={() => setSwipedId(null)}
                onCopy={() => {
                  void navigator.clipboard?.writeText(`https://pay.payglocal.in/mca/${mca.mcaLinkId}`).catch(() => {});
                  setCopiedId(mca.id);
                  if (copiedTimer.current) clearTimeout(copiedTimer.current);
                  copiedTimer.current = setTimeout(() => setCopiedId(null), 2000);
                }}
                onSend={() => {
                  setSwipedId(null);
                  if (onToast) onToast("Sent to customer", "success");
                  else toast.success("Sent to customer");
                }}
                onDisable={() => {
                  setSwipedId(null);
                  if (onDisableRequest) {
                    onDisableRequest(mca.id, () => {
                      setStatuses(prev => ({ ...prev, [mca.id]: "deactivated" }));
                      if (onToast) onToast("Link has been disabled", "error");
                      else toast.error("Link has been disabled");
                    });
                  } else {
                    setDisableId(mca.id);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-3 px-4 py-3.5 active:bg-muted/30 transition-colors duration-100">

                  {/* Left block */}
                  <div className="flex-1 min-w-0 flex flex-col items-start">
                    <p className={cn(
                      "text-[12.5px] font-bold leading-snug",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}>
                      {truncatedId}
                    </p>
                    <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug truncate max-w-full">
                      {mca.customerEmail}
                    </p>
                    <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">
                      {mca.invoiceNumber}
                    </p>
                  </div>

                  {/* Right block */}
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    {/* Status icon + amount + currency */}
                    <div className="flex items-center gap-1">
                      {isActive ? (
                        <span className="relative inline-flex h-[6px] w-[6px] shrink-0">
                          <span
                            className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 animate-ping"
                            style={{ animationDuration: "1.5s" }}
                          />
                          <span className="relative inline-flex h-[6px] w-[6px] rounded-full bg-primary" />
                        </span>
                      ) : (
                        <Ban className="h-[12px] w-[12px] text-muted-foreground shrink-0" strokeWidth={2} />
                      )}
                      <span className={cn(
                        "text-[13.5px] font-bold tabular-nums",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}>
                        {fmtAmount(mca.amount)}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{mca.currency}</span>
                    </div>

                    {/* Created date */}
                    <p className="text-[11px] text-muted-foreground leading-snug">{mca.createdAt}</p>
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
