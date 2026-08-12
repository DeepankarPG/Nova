"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
} from "recharts";
import {
  ChevronDown, Check,
  Link2, Receipt, Globe, FileText, Scale,
  Clock,
  ChevronRight, AlertTriangle, AlertCircle, TrendingUp, ArrowUpRight,
  Wallet, CreditCard, Landmark, Upload,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useHideAmounts, MaskedNumber } from "@/lib/hide-amounts-context";
import type { RecentTxnItem } from "@/components/dashboard/mobile/MobileTransactionDetail";

/* ─── Chart colors ─────────────────────────────────────────────────── */
const C_TODAY     = "#0061e3";
const C_YESTERDAY = "#93c5fd";

/* ─── Data ─────────────────────────────────────────────────────────── */
const HOURLY = [
  { t: "00", today:  12000, yesterday:  18000 },
  { t: "02", today:  25000, yesterday:  32000 },
  { t: "04", today:  45000, yesterday:  55000 },
  { t: "06", today:  80000, yesterday:  95000 },
  { t: "08", today: 148000, yesterday: 172000 },
  { t: "10", today: 290000, yesterday: 315000 },
  { t: "12", today: 425000, yesterday: 462000 },
  { t: "14", today: 582000, yesterday: 618000 },
  { t: "16", today: 725000, yesterday: 750000 },
  { t: "18", today: 848000, yesterday: 872000 },
  { t: "20", today: 912000, yesterday: 934000 },
  { t: "22", today: 942800, yesterday: 960000 },
];

const RECENT_TXN = [
  { id: "tx1", name: "Priya Mehta",    amount: "₹4,500",  method: "UPI",         status: "success" as const, time: "2m ago"  },
  { id: "tx2", name: "Rajan Stores",   amount: "₹12,200", method: "Card",        status: "success" as const, time: "18m ago" },
  { id: "tx3", name: "SwiftPay Ltd",   amount: "₹890",    method: "Net Banking", status: "failed"  as const, time: "34m ago" },
  { id: "tx4", name: "Ananya Kapoor",  amount: "₹2,100",  method: "UPI",         status: "pending" as const, time: "1h ago"  },
  { id: "tx5", name: "Globaltech Inc", amount: "₹67,800", method: "Card",        status: "success" as const, time: "2h ago"  },
];

const MCA_TXN = [
  { id: "mca1", name: "Acme Corp",      amount: "$2,400",  method: "Wire",  status: "success" as const, time: "5m ago"  },
  { id: "mca2", name: "Tech Solutions", amount: "€1,850",  method: "SWIFT", status: "success" as const, time: "22m ago" },
  { id: "mca3", name: "Global Retail",  amount: "£900",    method: "Card",  status: "failed"  as const, time: "48m ago" },
  { id: "mca4", name: "SingTel Pte",    amount: "S$5,200", method: "Wire",  status: "pending" as const, time: "2h ago"  },
  { id: "mca5", name: "Yamada Trading", amount: "¥84,000", method: "SWIFT", status: "success" as const, time: "3h ago"  },
];

type MetricKey = "gross" | "net" | "count";
const METRICS: Record<MetricKey, { label: string; value: string; unit: string; change: string; up: boolean }> = {
  gross: { label: "Gross volume",    value: "₹9,42,800", unit: "INR",  change: "+14.1%", up: true },
  net:   { label: "Net volume",      value: "₹8,98,450", unit: "INR",  change: "+11.8%", up: true },
  count: { label: "No. of payments", value: "1,284",      unit: "txns", change: "+9.3%",  up: true },
};

/* ─── MCA: collections by currency ──────────────────────────────── */
type McaCurrencyKey = "USD" | "AUD" | "GBP" | "EUR";
const MCA_CURRENCIES: Record<McaCurrencyKey, {
  label: string; country: string; flag: string; symbol: string;
  total: string; change: string;
  yDomainMax: number; yTicks: number[];
  hourly: { t: string; today: number; yesterday: number }[];
}> = {
  USD: {
    label: "USD", country: "United States", flag: "🇺🇸", symbol: "$",
    total: "$58,400", change: "+9.6%",
    yDomainMax: 70000, yTicks: [0, 20000, 40000, 60000],
    hourly: [
      { t: "00", today:   700, yesterday:  1100 },
      { t: "02", today:  1500, yesterday:  2000 },
      { t: "04", today:  2800, yesterday:  3400 },
      { t: "06", today:  5000, yesterday:  5900 },
      { t: "08", today:  9200, yesterday: 10700 },
      { t: "10", today: 18000, yesterday: 19500 },
      { t: "12", today: 26400, yesterday: 28700 },
      { t: "14", today: 36100, yesterday: 38300 },
      { t: "16", today: 45000, yesterday: 46500 },
      { t: "18", today: 52600, yesterday: 54100 },
      { t: "20", today: 56600, yesterday: 57900 },
      { t: "22", today: 58400, yesterday: 59500 },
    ],
  },
  AUD: {
    label: "AUD", country: "Australia", flag: "🇦🇺", symbol: "A$",
    total: "A$72,150", change: "+6.2%",
    yDomainMax: 80000, yTicks: [0, 20000, 40000, 60000, 80000],
    hourly: [
      { t: "00", today:   900, yesterday:  1300 },
      { t: "02", today:  1900, yesterday:  2400 },
      { t: "04", today:  3500, yesterday:  4100 },
      { t: "06", today:  6200, yesterday:  7100 },
      { t: "08", today: 11400, yesterday: 12800 },
      { t: "10", today: 22300, yesterday: 23600 },
      { t: "12", today: 32700, yesterday: 34500 },
      { t: "14", today: 44700, yesterday: 46200 },
      { t: "16", today: 55800, yesterday: 56900 },
      { t: "18", today: 65200, yesterday: 66400 },
      { t: "20", today: 70200, yesterday: 71800 },
      { t: "22", today: 72150, yesterday: 73900 },
    ],
  },
  GBP: {
    label: "GBP", country: "United Kingdom", flag: "🇬🇧", symbol: "£",
    total: "£31,900", change: "+11.4%",
    yDomainMax: 35000, yTicks: [0, 10000, 20000, 30000],
    hourly: [
      { t: "00", today:   400, yesterday:   550 },
      { t: "02", today:   850, yesterday:  1050 },
      { t: "04", today:  1550, yesterday:  1800 },
      { t: "06", today:  2750, yesterday:  3050 },
      { t: "08", today:  5050, yesterday:  5500 },
      { t: "10", today:  9850, yesterday: 10400 },
      { t: "12", today: 14450, yesterday: 15200 },
      { t: "14", today: 19750, yesterday: 20500 },
      { t: "16", today: 24650, yesterday: 25300 },
      { t: "18", today: 28850, yesterday: 29500 },
      { t: "20", today: 31050, yesterday: 31700 },
      { t: "22", today: 31900, yesterday: 32600 },
    ],
  },
  EUR: {
    label: "EUR", country: "Eurozone", flag: "🇪🇺", symbol: "€",
    total: "€27,650", change: "+8.1%",
    yDomainMax: 30000, yTicks: [0, 10000, 20000, 30000],
    hourly: [
      { t: "00", today:   350, yesterday:   480 },
      { t: "02", today:   750, yesterday:   920 },
      { t: "04", today:  1350, yesterday:  1580 },
      { t: "06", today:  2400, yesterday:  2700 },
      { t: "08", today:  4400, yesterday:  4850 },
      { t: "10", today:  8550, yesterday:  9100 },
      { t: "12", today: 12550, yesterday: 13200 },
      { t: "14", today: 17150, yesterday: 17850 },
      { t: "16", today: 21400, yesterday: 22000 },
      { t: "18", today: 25050, yesterday: 25650 },
      { t: "20", today: 26950, yesterday: 27550 },
      { t: "22", today: 27650, yesterday: 28300 },
    ],
  },
};

/* ─── Shared: time-period chip options ──────────────────────────── */
type PeriodKey = "1D" | "1W" | "1M" | "3M" | "YTD";
const PERIOD_OPTIONS: { id: PeriodKey; label: string }[] = [
  { id: "1D",  label: "Today"        },
  { id: "1W",  label: "This week"    },
  { id: "1M",  label: "This month"   },
  { id: "3M",  label: "3 months"     },
  { id: "YTD", label: "Year to date" },
];


const NEEDS_ATTENTION = [
  {
    label: "Funds on hold",
    amount: "₹52,340",
    sub: "12 transactions",
    href: "/settlement-reports",
    amountColor: "text-amber-600 dark:text-amber-400",
    accentColor: "#f59e0b",
    borderColor: "rgba(245,158,11,0.3)",
  },
  {
    label: "Open disputes",
    amount: "₹14,200",
    sub: "4 open cases",
    href: "/dispute-management",
    amountColor: "text-red-600 dark:text-red-400",
    accentColor: "#ef4444",
    borderColor: "rgba(239,68,68,0.3)",
  },
] as const;

/** MCA's "Needs attention" is a single card: transactions awaiting an invoice upload. */
const MCA_INVOICE_PENDING = {
  label: "Invoice pending",
  amount: "₹86,400",
  sub: "6 transactions",
  amountColor: "text-amber-600 dark:text-amber-400",
} as const;

const STATUS_BADGE = {
  success: { label: "Completed", text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  failed:  { label: "Failed",    text: "text-red-700 dark:text-red-400",         bg: "bg-red-50 dark:bg-red-950/40"         },
  pending: { label: "Pending",   text: "text-amber-700 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-950/40"     },
} as const;


const METHOD_ICON: Record<string, React.ElementType> = {
  "UPI":         Wallet,
  "Card":        CreditCard,
  "Net Banking": Landmark,
  "Wire":        Globe,
  "SWIFT":       Globe,
};

const AMOUNT_COLOR: Record<string, string> = {
  success: "text-foreground",
  failed:  "text-red-600",
  pending: "text-amber-600",
};

/* ─── Banner carousel ────────────────────────────────────────────── */
type BannerSeverity = "info" | "warning" | "alert";

const BANNER_SLIDES: Array<{
  severity: BannerSeverity;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  headline: string;
  body: string;
  cta: string;
  href: string;
  enabled?: boolean;
}> = [
  { severity: "info",    icon: Globe,         headline: "International Payments Now Live",  body: "Accept USD, EUR & GBP with automatic FX settlement.",   cta: "Learn More",   href: "/payment-products/international-accounts" },
  { severity: "info",    icon: Link2,         headline: "Generate Links with Echo",          body: "Create and share payment links directly through chat.", cta: "Try Now",      href: "/echo" },
  { severity: "warning", icon: TrendingUp,    headline: "Settlement Optimization",           body: "Switch to faster settlements for improved cash flow.",  cta: "View Options", href: "/settlement-reports" },
  { severity: "warning", icon: AlertTriangle, headline: "High Failure Rate Detected",        body: "UPI success rate dropped 3% today.",                   cta: "Investigate",  href: "/transactions" },
  { severity: "alert",   icon: AlertCircle,   headline: "Dispute Action Required",           body: "Document upload pending for 4 disputes.",              cta: "Review Now",   href: "/dispute-management" },
  { severity: "alert",   icon: Clock,         headline: "Funds on Hold",                     body: "₹52,340 requires action before release.",              cta: "Take Action",  href: "/settlement-reports" },
];

const ACTIVE_BANNER_SLIDES = BANNER_SLIDES.filter(s => s.enabled !== false);

/* Master switch for the whole running-notifications banner carousel. */
const BANNER_CAROUSEL_ENABLED = false;

const BANNER_THEME: Record<BannerSeverity, {
  surface:       string;
  border:        string;
  iconBg:        string;
  iconColor:     string;
  titleColor:    string;
  subtitleColor: string;
  ctaColor:      string;
  dotActive:     string;
}> = {
  info: {
    surface:       "#E6F1FB",
    border:        "#85B7EB",
    iconBg:        "#378ADD18",
    iconColor:     "#185FA5",
    titleColor:    "#0C447C",
    subtitleColor: "#185FA5",
    ctaColor:      "#185FA5",
    dotActive:     "#378ADD",
  },
  warning: {
    surface:       "#FAEEDA",
    border:        "#EF9F27",
    iconBg:        "#EF9F2722",
    iconColor:     "#854F0B",
    titleColor:    "#633806",
    subtitleColor: "#854F0B",
    ctaColor:      "#854F0B",
    dotActive:     "#EF9F27",
  },
  alert: {
    surface:       "#FCEBEB",
    border:        "#F09595",
    iconBg:        "#E24B4A18",
    iconColor:     "#A32D2D",
    titleColor:    "#791F1F",
    subtitleColor: "#A32D2D",
    ctaColor:      "#A32D2D",
    dotActive:     "#E24B4A",
  },
};

export function BannerCarousel({ onOpen }: { onOpen?: () => void } = {}) {
  const [idx, setIdx] = useState(0);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const total = ACTIVE_BANNER_SLIDES.length;

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % total), 5000);
    return () => clearInterval(t);
  }, [total]);

  function onTouchStart(e: React.TouchEvent) { setDragStart(e.touches[0].clientX); }
  function onTouchEnd(e: React.TouchEvent) {
    if (dragStart === null) return;
    const dx = e.changedTouches[0].clientX - dragStart;
    if (Math.abs(dx) > 40) setIdx(i => (i + (dx < 0 ? 1 : -1) + total) % total);
    setDragStart(null);
  }

  if (!BANNER_CAROUSEL_ENABLED) return null;

  return (
    /* Outer container — bg-background so content behind is covered.
       Top shadow casts upward only (negative y offset). No overflow-hidden
       here so the shadow isn't clipped. */
    <div
      style={{
        boxShadow: "0 -4px 12px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)",
      }}
    >
      <div
        className="overflow-hidden select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex will-change-transform"
          style={{
            width:     `${total * 100}%`,
            transform: `translateX(-${(idx / total) * 100}%)`,
            transition:"transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)",
          }}
        >
          {ACTIVE_BANNER_SLIDES.map((slide, i) => {
            const Icon  = slide.icon;
            const theme = BANNER_THEME[slide.severity] ?? BANNER_THEME.info;
            return (
              <div key={i} style={{ width: `${100 / total}%`, background: theme.surface }}>

                {/* Edge-to-edge content row */}
                <div className="flex items-center gap-3 px-[14px] py-[13px] cursor-pointer" onClick={onOpen}>

                  {/* Icon container 38×38, radius 10 */}
                  <div
                    className="h-[38px] w-[38px] rounded-[10px] flex items-center justify-center shrink-0"
                    style={{ background: theme.iconBg }}
                  >
                    <Icon
                      className="h-[17px] w-[17px]"
                      style={{ color: theme.iconColor }}
                      strokeWidth={1.75}
                    />
                  </div>

                  {/* Text block */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className="text-[13px] font-semibold leading-tight truncate"
                        style={{ color: theme.titleColor }}
                      >
                        {slide.headline}
                      </p>
                      <Link
                        href={slide.href}
                        className="shrink-0 flex items-center gap-0.5 text-[12px] font-semibold whitespace-nowrap"
                        style={{ color: theme.ctaColor }}
                      >
                        {slide.cta}
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                    <p
                      className="text-[11.5px] mt-0.5 leading-snug line-clamp-1"
                      style={{ color: theme.subtitleColor }}
                    >
                      {slide.body}
                    </p>
                  </div>
                </div>

                {/* Dot indicators — active dot uses severity accent color */}
                <div className="flex justify-center items-center gap-1.5 py-2">
                  {ACTIVE_BANNER_SLIDES.map((_, di) => (
                    <button
                      key={di}
                      type="button"
                      aria-label={`Go to slide ${di + 1}`}
                      onClick={() => setIdx(di)}
                      className={cn(
                        "h-[5px] transition-all duration-200 focus:outline-none",
                        di === idx ? "w-4 rounded-[3px]" : "w-[5px] rounded-full bg-foreground/20"
                      )}
                      style={di === idx ? { background: theme.dotActive } : undefined}
                    />
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Critical slides (warning + alert only, excludes blue/info) ─── */
const CRITICAL_SLIDES = ACTIVE_BANNER_SLIDES.filter(s => s.severity !== "info");

/* ─── Single notification card — identical markup to BannerCarousel ─ */
function BannerNotificationCard({ slide }: { slide: typeof BANNER_SLIDES[number] }) {
  const Icon  = slide.icon;
  const theme = BANNER_THEME[slide.severity];
  return (
    <div style={{ background: theme.surface }}>
      <div className="flex items-center gap-3 px-[14px] py-[13px]">
        <div
          className="h-[38px] w-[38px] rounded-[10px] flex items-center justify-center shrink-0"
          style={{ background: theme.iconBg }}
        >
          <Icon className="h-[17px] w-[17px]" style={{ color: theme.iconColor }} strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[13px] font-semibold leading-tight truncate" style={{ color: theme.titleColor }}>
              {slide.headline}
            </p>
            <Link
              href={slide.href}
              className="shrink-0 flex items-center gap-0.5 text-[12px] font-semibold whitespace-nowrap"
              style={{ color: theme.ctaColor }}
            >
              {slide.cta}
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-[11.5px] mt-0.5 leading-snug line-clamp-1" style={{ color: theme.subtitleColor }}>
            {slide.body}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Critical Notifications Bottom Sheet ────────────────────────── */
export function CriticalNotificationsSheet({
  open,
  onClose,
  contained = false,
}: {
  open: boolean;
  onClose: () => void;
  contained?: boolean;
}) {
  if (CRITICAL_SLIDES.length === 0) return null;

  const pos = contained ? "absolute" : "fixed";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="critical-backdrop"
            className={`${pos} inset-0 z-50 bg-black/40`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="critical-sheet"
            className={`${pos} inset-x-0 bottom-0 z-[51] flex flex-col rounded-t-[24px] bg-background`}
            style={{ maxHeight: "68%" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="h-1 w-10 rounded-full bg-foreground/20" />
            </div>

            {/* Header */}
            <div className="px-5 pt-3 pb-4 shrink-0">
              <p className="text-[17px] font-bold text-foreground">Critical Notifications</p>
              <p className="text-[13px] text-muted-foreground mt-1 leading-snug">
                Please review the following items that require your attention.
              </p>
            </div>

            {/* Notification list — scrollable */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 px-4 pb-2">
              {CRITICAL_SLIDES.map((slide, i) => (
                <div key={i} className="rounded-xl overflow-hidden">
                  <BannerNotificationCard slide={slide} />
                </div>
              ))}
            </div>

            {/* Sticky CTA footer */}
            <div className="px-4 py-4 shrink-0 border-t border-border/60">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-[14px] py-[15px] text-[16px] font-semibold text-white"
                style={{ background: "#007AFF" }}
              >
                Got it
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Metric dropdown ────────────────────────────────────────────── */
function MetricDropdown({ value, onChange }: { value: MetricKey; onChange: (k: MetricKey) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative z-10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-[10px] border border-border bg-card px-2.5 py-1.5 text-[11px] font-semibold text-foreground shadow-sm"
      >
        {METRICS[value].label}
        <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 min-w-[176px] overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          {(Object.keys(METRICS) as MetricKey[]).map((key) => (
            <button key={key} type="button"
              onClick={() => { onChange(key); setOpen(false); }}
              className={cn(
                "flex w-full items-center justify-between px-4 py-2.5 text-left text-[12px] transition-colors hover:bg-muted",
                value === key ? "text-primary font-semibold" : "text-foreground font-medium"
              )}
            >
              {METRICS[key].label}
              {value === key && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Time-period dropdown chip ──────────────────────────────────── */
function PeriodDropdown({ value, onChange }: { value: PeriodKey; onChange: (k: PeriodKey) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative z-10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-[10px] border border-border bg-card px-2.5 py-1.5 text-[11px] font-semibold text-foreground shadow-sm"
      >
        {PERIOD_OPTIONS.find((p) => p.id === value)?.label}
        <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[19]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 min-w-[160px] overflow-hidden rounded-xl border border-border bg-card shadow-lg z-20">
            {PERIOD_OPTIONS.map((p) => {
              const active = p.id === value;
              return (
                <button key={p.id} type="button"
                  onClick={() => { onChange(p.id); setOpen(false); }}
                  className={cn(
                    "flex w-full items-center justify-between px-4 py-2.5 text-left text-[12px] transition-colors hover:bg-muted",
                    active ? "text-primary font-semibold" : "text-foreground font-medium"
                  )}
                >
                  {p.label}
                  {active && <Check className="h-3.5 w-3.5 text-primary shrink-0" strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── MCA: collected-by-currency dropdown chip ───────────────────── */
function McaCurrencyDropdown({ value, onChange }: { value: McaCurrencyKey; onChange: (k: McaCurrencyKey) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative z-10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-[10px] border border-border bg-card px-2.5 py-1.5 text-[11px] font-semibold text-foreground shadow-sm"
      >
        <span className="text-[13px] leading-none">{MCA_CURRENCIES[value].flag}</span>
        {MCA_CURRENCIES[value].label}
        <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[19]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 min-w-[190px] overflow-hidden rounded-xl border border-border bg-card shadow-lg z-20">
            {(Object.keys(MCA_CURRENCIES) as McaCurrencyKey[]).map((key) => {
              const active = key === value;
              const c = MCA_CURRENCIES[key];
              return (
                <button key={key} type="button"
                  onClick={() => { onChange(key); setOpen(false); }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-colors hover:bg-muted",
                    active ? "text-primary" : "text-foreground"
                  )}
                >
                  <span className="text-[16px] leading-none">{c.flag}</span>
                  <span className="flex-1 min-w-0">
                    <span className={cn("block text-[12px]", active ? "font-semibold" : "font-medium")}>{c.label}</span>
                    <span className="block text-[10.5px] text-muted-foreground">{c.country}</span>
                  </span>
                  {active && <Check className="h-3.5 w-3.5 text-primary shrink-0" strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Chart tooltip (line chart) ─────────────────────────────────── */
function PulseTooltip({
  active,
  payload,
  label,
  symbol = "₹",
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
  symbol?: string;
}) {
  if (!active || !payload?.length) return null;
  const h = parseInt(label ?? "0", 10);
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const time = `${h12}:00 ${h >= 12 ? "PM" : "AM"}`;
  const todayVal = payload.find((p) => p.name === "today")?.value;
  const ystVal   = payload.find((p) => p.name === "yesterday")?.value;
  return (
    <div
      className="rounded-xl border border-border bg-card px-3 py-2 min-w-[108px]"
      style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
    >
      {todayVal != null && (
        <p className="text-[13px] font-bold text-foreground tabular-nums leading-tight">
          {symbol}{todayVal.toLocaleString("en-IN")}
        </p>
      )}
      {ystVal != null && (
        <p className="text-[10.5px] text-muted-foreground tabular-nums mt-0.5">
          {symbol}{ystVal.toLocaleString("en-IN")} yday
        </p>
      )}
      <p className="text-[9.5px] font-medium text-muted-foreground/70 mt-1.5 border-t border-border/60 pt-1">
        {time}
      </p>
    </div>
  );
}

/* ─── Referral Banner Slide ──────────────────────────────────────── */
function ReferralBannerSlide() {
  return (
    <div className="px-4 pt-1 pb-3">
      <div className="rounded-xl overflow-hidden" style={{ height: 272 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/R&E.png"
          alt="Refer and earn with PayGlocal Referral Program"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
    </div>
  );
}


/* ─── Product Tab Switcher ───────────────────────────────────────── */
function ProductTabSwitcher({
  productTab,
  onProductTabChange,
}: {
  productTab: ProductTab;
  onProductTabChange: (tab: ProductTab) => void;
}) {
  return (
    <div className="mx-4">
      <div className="bg-muted/40 rounded-xl p-0.75 flex">
        {(["payment-gateway", "multi-currency"] as const).map((id) => {
          const active = productTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onProductTabChange(id)}
              className={cn(
                "flex flex-1 items-center justify-center h-9 rounded-xl text-[12.5px] transition-all duration-150",
                active
                  ? "bg-card text-primary font-semibold shadow-sm"
                  : "font-normal text-muted-foreground"
              )}
            >
              {id === "payment-gateway" ? "Payment Gateway" : "Multi-Currency Accounts"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Hero Carousel ──────────────────────────────────────────────── */
function HeroCarousel({
  metric,
  setMetric,
  productTab,
}: {
  metric: MetricKey;
  setMetric: (m: MetricKey) => void;
  productTab: ProductTab;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const pausedRef = useRef(false);
  const SLIDES = productTab === "multi-currency" ? 1 : 2;

  useEffect(() => {
    setActiveIdx(0);
  }, [productTab]);

  useEffect(() => {
    if (SLIDES < 2) return;
    const t = setInterval(() => {
      if (!pausedRef.current) setActiveIdx(i => (i + 1) % SLIDES);
    }, 5000);
    return () => clearInterval(t);
  }, [SLIDES]);

  function onTouchStart(e: React.TouchEvent) {
    setDragStart(e.touches[0].clientX);
    pausedRef.current = true;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (dragStart === null) return;
    const dx = e.changedTouches[0].clientX - dragStart;
    if (Math.abs(dx) > 40) setActiveIdx(i => (i + (dx < 0 ? 1 : -1) + SLIDES) % SLIDES);
    setDragStart(null);
    setTimeout(() => { pausedRef.current = false; }, 3000);
  }

  return (
    <div>
      <div
        className="overflow-hidden select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex will-change-transform"
          style={{
            width: `${SLIDES * 100}%`,
            transform: `translateX(-${(activeIdx / SLIDES) * 100}%)`,
            transition: "transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)",
          }}
        >
          <div style={{ width: `${100 / SLIDES}%` }}>
            <MerchantPulseCard metric={metric} setMetric={setMetric} productTab={productTab} />
          </div>
          {SLIDES > 1 && (
            <div style={{ width: `${100 / SLIDES}%` }}>
              <ReferralBannerSlide />
            </div>
          )}
        </div>
      </div>

      {/* Pagination dots */}
      {SLIDES > 1 && (
      <div className="flex justify-center items-center gap-1.5 mt-1.5">
        {Array.from({ length: SLIDES }).map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => {
              setActiveIdx(i);
              pausedRef.current = true;
              setTimeout(() => { pausedRef.current = false; }, 3000);
            }}
            className={cn(
              "h-[5px] rounded-full transition-all duration-200 focus:outline-none",
              i === activeIdx ? "w-5 bg-primary" : "w-[5px] bg-border"
            )}
          />
        ))}
      </div>
      )}
    </div>
  );
}

/* ─── Merchant Pulse Card (primary hero) ─────────────────────────── */
type ProductTab = "payment-gateway" | "multi-currency";

function MerchantPulseCard({
  metric,
  setMetric,
  productTab,
}: {
  metric: MetricKey;
  setMetric: (m: MetricKey) => void;
  productTab: ProductTab;
}) {
  const m = METRICS[metric];
  const { hidden } = useHideAmounts();
  const [mcaCurrency, setMcaCurrency] = useState<McaCurrencyKey>("USD");
  const [mcaPeriod,   setMcaPeriod]   = useState<PeriodKey>("1D");

  if (productTab === "multi-currency") {
    const c = MCA_CURRENCIES[mcaCurrency];
    return (
      <div>
        <div className="px-4 pt-1 pb-3">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-[0.1em]">
              Total collected ({c.label})
            </p>
            <PeriodDropdown value={mcaPeriod} onChange={setMcaPeriod} />
          </div>
          <p className="text-[34px] font-bold tracking-tight text-foreground tabular-nums leading-none mb-2">
            <MaskedNumber value={c.total} hidden={hidden} />
          </p>
          <p className="text-[11.5px] font-medium mb-3">
            <span className="text-emerald-600 dark:text-emerald-400">
              <MaskedNumber value={c.change} hidden={hidden} />
            </span>
            <span className="font-normal text-muted-foreground"> vs yesterday</span>
          </p>

          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wide">
              Collected by currency
            </p>
            <McaCurrencyDropdown value={mcaCurrency} onChange={setMcaCurrency} />
          </div>

          <div className="relative">
            <div className="h-[130px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart key={mcaCurrency} data={c.hourly} margin={{ top: 6, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mcaTodayFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={C_TODAY} stopOpacity={0.14} />
                      <stop offset="100%" stopColor={C_TODAY} stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    stroke="#E2E8F0"
                    strokeOpacity={0.7}
                    strokeWidth={1}
                  />
                  <XAxis
                    dataKey="t"
                    axisLine={false}
                    tickLine={false}
                    ticks={["00", "06", "12", "18", "22"]}
                    tickFormatter={(t: string) => {
                      const h = parseInt(t, 10);
                      if (h === 0)   return "12AM";
                      if (h < 12)   return `${h}AM`;
                      if (h === 12) return "12PM";
                      return `${h - 12}PM`;
                    }}
                    tick={{ fontSize: 8.5, fill: "#94A3B8" }}
                    interval={0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={32}
                    domain={[0, c.yDomainMax]}
                    ticks={c.yTicks}
                    tickFormatter={(v: number) => v === 0 ? `${c.symbol}0` : `${c.symbol}${v / 1000}K`}
                    tick={{ fontSize: 8.5, fill: "#94A3B8" }}
                  />
                  <Tooltip
                    cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                    content={<PulseTooltip symbol={c.symbol} />}
                  />
                  <Area
                    type="monotone"
                    dataKey="yesterday"
                    stroke={C_YESTERDAY}
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    fill="none"
                    dot={false}
                    activeDot={{ r: 3.5, fill: C_YESTERDAY, strokeWidth: 2, stroke: "#ffffff" }}
                    animationDuration={600}
                    animationEasing="ease-out"
                  />
                  <Area
                    type="monotone"
                    dataKey="today"
                    stroke={C_TODAY}
                    strokeWidth={2.5}
                    fill="url(#mcaTodayFill)"
                    dot={false}
                    activeDot={{ r: 4.5, fill: C_TODAY, strokeWidth: 2.5, stroke: "#ffffff" }}
                    animationDuration={650}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <UpcomingSettlementCard isMca invoiceUploaded />
      </div>
    );
  }

  return (
    <div>
      {/* Hero content — no card wrapper, blends with page background */}
      <div className="px-4 pt-1 pb-3">

        {/* Metric label + dropdown */}
        <div className="flex items-center justify-between mb-0.5">
          <p className="text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-[0.1em]">
            {m.label}
          </p>
          <MetricDropdown value={metric} onChange={setMetric} />
        </div>

        {/* Primary KPI */}
        <p className="text-[34px] font-bold tracking-tight text-foreground tabular-nums leading-none mb-2">
          <MaskedNumber value={m.value} hidden={hidden} />
        </p>

        {/* Trend — color-coded by direction */}
        <p className="text-[11.5px] font-medium mb-3">
          <span className={m.up ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}>
            <MaskedNumber value={m.change} hidden={hidden} />
          </span>
          <span className="font-normal text-muted-foreground"> vs yesterday</span>
        </p>

        {/* Chart — smooth area with Y-axis, grid, X-axis labels */}
        <div className="relative">
          <div className="h-[130px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HOURLY} margin={{ top: 6, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="mpTodayFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={C_TODAY} stopOpacity={0.14} />
                    <stop offset="100%" stopColor={C_TODAY} stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="#E2E8F0"
                  strokeOpacity={0.7}
                  strokeWidth={1}
                />
                <XAxis
                  dataKey="t"
                  axisLine={false}
                  tickLine={false}
                  ticks={["00", "06", "12", "18", "22"]}
                  tickFormatter={(t: string) => {
                    const h = parseInt(t, 10);
                    if (h === 0)   return "12AM";
                    if (h < 12)   return `${h}AM`;
                    if (h === 12) return "12PM";
                    return `${h - 12}PM`;
                  }}
                  tick={{ fontSize: 8.5, fill: "#94A3B8" }}
                  interval={0}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={32}
                  domain={[0, 1200000]}
                  ticks={[0, 300000, 600000, 900000, 1200000]}
                  tickFormatter={(v: number) => v === 0 ? "₹0" : `₹${v / 100000}L`}
                  tick={{ fontSize: 8.5, fill: "#94A3B8" }}
                />
                <Tooltip
                  cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                  content={<PulseTooltip />}
                />
                <Area
                  type="monotone"
                  dataKey="yesterday"
                  stroke={C_YESTERDAY}
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  fill="none"
                  dot={false}
                  activeDot={{ r: 3.5, fill: C_YESTERDAY, strokeWidth: 2, stroke: "#ffffff" }}
                  animationDuration={600}
                  animationEasing="ease-out"
                />
                <Area
                  type="monotone"
                  dataKey="today"
                  stroke={C_TODAY}
                  strokeWidth={2.5}
                  fill="url(#mpTodayFill)"
                  dot={false}
                  activeDot={{ r: 4.5, fill: C_TODAY, strokeWidth: 2.5, stroke: "#ffffff" }}
                  animationDuration={650}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {metric === "gross" ? <UpcomingSettlementCard /> : <SuccessMetricsCard />}
    </div>
  );
}

/* ─── Success Metrics Card ──────────────────────────────────────── */
function SuccessMetricsCard() {
  const { hidden } = useHideAmounts();
  return (
    <div className="mx-4">
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="grid grid-cols-3">
          {[
            { label: "Success rate", value: "94.2%",  color: "text-emerald-600 dark:text-emerald-400" },
            { label: "Transactions", value: "1,284",  color: "text-foreground" },
            { label: "Avg ticket",   value: "₹6,600", color: "text-foreground" },
          ].map((stat, i) => (
            <div key={stat.label} className={cn("px-3 py-3", i > 0 && "border-l border-border")}>
              <p className="text-[10px] font-medium text-muted-foreground/70 mb-1.5 leading-none">
                {stat.label}
              </p>
              <p className={cn("text-[13.5px] font-bold tabular-nums leading-none", stat.color)}>
                <MaskedNumber value={stat.value} hidden={hidden} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Upcoming Settlement Card ──────────────────────────────────── */
/*
 * Left: icon + "UPCOMING SETTLEMENT" label + amount + "Tonight · 12:00AM IST" subtext
 * Right: outlined pill "Details >" navigating to /settlement-reports
 * py-3 content rows match SuccessMetricsCard height exactly (~54px total)
 */
function UpcomingSettlementCard({
  isLoading = false,
  isMca = false,
  invoiceUploaded = false,
}: {
  isLoading?:       boolean;
  /** MCA settlements require an invoice before they can be viewed — PG does not. */
  isMca?:           boolean;
  invoiceUploaded?: boolean;
}) {
  const { hidden } = useHideAmounts();
  const needsInvoice = isMca && !invoiceUploaded;

  // "Tonight" when settlement date is today, otherwise "D Mon" (e.g. "20 Jun")
  const settlementDate = new Date(); // mock: today — replace with API value
  const today = new Date();
  const isToday =
    settlementDate.getDate()     === today.getDate()     &&
    settlementDate.getMonth()    === today.getMonth()    &&
    settlementDate.getFullYear() === today.getFullYear();
  const dateLabel = isToday
    ? "Tonight"
    : settlementDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  if (isLoading) {
    return (
      <div className="mx-4">
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-2.5 w-32 rounded bg-muted animate-pulse" />
              <div className="h-3.5 w-24 rounded bg-muted animate-pulse" />
            </div>
            <div className="h-7 w-20 rounded-full bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4">
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="px-4 py-3 flex items-center gap-3">

          {/* Left: icon + label stack, then amount + subtext inline */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1.5">
              <TrendingUp
                className="h-[10px] w-[10px] text-emerald-600 dark:text-emerald-400 shrink-0"
                strokeWidth={2.5}
              />
              <p className="text-[10px] font-medium text-muted-foreground/70 leading-none uppercase tracking-[0.05em]">
                Upcoming settlement
              </p>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[13.5px] font-bold tabular-nums leading-none text-foreground">
                <MaskedNumber value="₹1,24,890" hidden={hidden} />
              </span>
              <span className="text-[10px] text-muted-foreground/70 leading-none truncate">
                {dateLabel} · 12:00AM IST
              </span>
            </div>
          </div>

          {/* Right: outlined pill CTA */}
          {needsInvoice ? (
            <button
              type="button"
              onClick={() => toast("Invoice upload is coming soon")}
              className="shrink-0 flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-[11px] font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <Upload className="h-3 w-3" strokeWidth={2.5} />
              Upload invoice
            </button>
          ) : (
            <Link
              href="/settlement-reports"
              className="shrink-0 flex items-center gap-0.5 rounded-lg border border-border bg-background px-3 py-1.5 text-[11px] font-semibold text-foreground hover:bg-muted transition-colors"
            >
              View more
              <ChevronRight className="h-3 w-3" strokeWidth={2.5} />
            </Link>
          )}

        </div>
      </div>
    </div>
  );
}

/* ─── Quick Actions ──────────────────────────────────────────────── */
const QUICK_ACTIONS = [
  {
    label: "Payment Link",
    icon:  Link2,
    key:   "payment-link",
    href:  "/payment-products/payment-links?create=1",
    color: "text-blue-600 dark:text-blue-400",
    bg:    "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    label: "Invoice",
    icon:  Receipt,
    key:   "invoice",
    href:  "/payment-products/invoice-links?create=1",
    color: "text-violet-600 dark:text-violet-400",
    bg:    "bg-violet-50 dark:bg-violet-950/40",
  },
  {
    label: "Settlements",
    icon:  FileText,
    key:   "settlements",
    href:  "/settlement-reports",
    color: "text-emerald-600 dark:text-emerald-400",
    bg:    "bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    label: "Disputes",
    icon:  Scale,
    key:   "disputes",
    href:  "/disputes",
    color: "text-teal-600 dark:text-teal-400",
    bg:    "bg-teal-50 dark:bg-teal-950/40",
  },
] as const;

const MCA_QUICK_ACTIONS = [
  {
    label: "Invoice",
    icon:  Receipt,
    key:   "invoice",
    href:  "/payment-products/invoice-links?create=1",
    color: "text-violet-600 dark:text-violet-400",
    bg:    "bg-violet-50 dark:bg-violet-950/40",
  },
  {
    label: "Virtual Accounts",
    icon:  Landmark,
    key:   "virtual-accounts",
    href:  "/payment-products/international-accounts/mca",
    color: "text-blue-600 dark:text-blue-400",
    bg:    "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    label: "Withdrawals",
    icon:  Wallet,
    key:   "withdrawals",
    href:  "/payment-products/international-accounts/platform-withdrawals",
    color: "text-amber-600 dark:text-amber-400",
    bg:    "bg-amber-50 dark:bg-amber-950/40",
  },
  {
    label: "Settlements",
    icon:  FileText,
    key:   "settlements",
    href:  "/settlement-reports",
    color: "text-emerald-600 dark:text-emerald-400",
    bg:    "bg-emerald-50 dark:bg-emerald-950/40",
  },
] as const;

function QuickActionsSection({
  productTab,
  onCreatePaymentLink,
  onSettlementsOpen,
  onDisputesOpen,
}: {
  productTab: ProductTab;
  onCreatePaymentLink?: () => void;
  onSettlementsOpen?: () => void;
  onDisputesOpen?: () => void;
}) {
  const actions = productTab === "multi-currency" ? MCA_QUICK_ACTIONS : QUICK_ACTIONS;
  return (
    <div className="mx-4">
      {/* Section header */}
      <p className="text-[15px] font-semibold text-foreground mb-3">Quick Actions</p>

      {/* Actions row — equal distribution, no overflow */}
      <div className="flex justify-between gap-1">
        {actions.map((item) => {
          const Icon = item.icon;
          const isPaymentLink  = item.key === "payment-link"  && onCreatePaymentLink;
          const isSettlements = item.key === "settlements"    && onSettlementsOpen;
          const isDisputes    = item.key === "disputes"       && onDisputesOpen;

          const inner = (
            <div className="flex flex-col items-center gap-2">
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center border border-border bg-card"
                style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)" }}
              >
                <Icon className="h-[20px] w-[20px] text-foreground" strokeWidth={1.75} />
              </div>
              {/* Single-line label — never wraps */}
              <span className="text-[11.5px] font-normal text-muted-foreground whitespace-nowrap">
                {item.label}
              </span>
            </div>
          );

          const onTap = isPaymentLink  ? onCreatePaymentLink
                      : isSettlements ? onSettlementsOpen
                      : isDisputes    ? onDisputesOpen
                      : null;

          if (onTap) {
            return (
              <button
                key={item.key}
                type="button"
                onClick={onTap}
                className="flex flex-col items-center transition-transform duration-100 active:scale-[0.94]"
              >
                {inner}
              </button>
            );
          }
          return (
            <Link
              key={item.key}
              href={item.href!}
              className="flex flex-col items-center transition-transform duration-100 active:scale-[0.94]"
            >
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Upcoming Settlement ────────────────────────────────────────── */

/* ─── Needs Attention ────────────────────────────────────────────── */
function NeedsAttentionSection({
  productTab,
  onNavigateToPayments,
}: {
  productTab:            ProductTab;
  onNavigateToPayments?: () => void;
}) {
  const { hidden } = useHideAmounts();

  if (productTab === "multi-currency") {
    const item = MCA_INVOICE_PENDING;
    return (
      <div className="mx-4 mt-3">
        <p className="text-[15px] font-semibold text-foreground mb-3">Needs attention</p>
        <div className="rounded-xl bg-card overflow-hidden border border-border shadow-sm">
          <div className="flex items-center justify-between gap-3 px-4 py-3.5">
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-foreground">{item.label}</p>
              <p className={cn("text-[22px] font-bold tabular-nums leading-tight mt-0.5", item.amountColor)}>
                <MaskedNumber value={item.amount} hidden={hidden} />
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{item.sub}</p>
            </div>
            <button
              type="button"
              onClick={onNavigateToPayments}
              className="shrink-0 flex items-center gap-1 rounded-[10px] border border-border bg-background px-3 py-1.5 text-[11px] font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Take action
              <ArrowUpRight className="h-3 w-3" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4 mt-3">
      <p className="text-[15px] font-semibold text-foreground mb-3">Needs attention</p>

      <div className="space-y-2">
        {NEEDS_ATTENTION.map((item) => (
          <div
            key={item.label}
            className="rounded-xl bg-card overflow-hidden border border-border shadow-sm"
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3.5">
              <div className="min-w-0">
                <p className="text-[14px] font-bold text-foreground">{item.label}</p>
                <p className={cn("text-[22px] font-bold tabular-nums leading-tight mt-0.5", item.amountColor)}>
                  <MaskedNumber value={item.amount} hidden={hidden} />
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.sub}</p>
              </div>
              <Link
                href={item.href}
                className="shrink-0 flex items-center gap-1 rounded-[10px] border border-border bg-background px-3 py-1.5 text-[11px] font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Take action
                <ArrowUpRight className="h-3 w-3" strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Recent Transactions ────────────────────────────────────────── */
const TXN_TABS = ["all", "success", "failed"] as const;
type TxnTab = typeof TXN_TABS[number];

function RecentTransactionsCard({
  onTxnTap,
  onSeeAll,
  productTab,
}: {
  onTxnTap?: (txn: RecentTxnItem) => void;
  onSeeAll?: () => void;
  productTab: ProductTab;
}) {
  const [txnTab, setTxnTab] = useState<TxnTab>("all");
  const { hidden } = useHideAmounts();

  const txnData = productTab === "payment-gateway" ? RECENT_TXN : MCA_TXN;
  const filtered = txnTab === "all"
    ? txnData
    : txnData.filter(t => t.status === txnTab);

  return (
    <div className="mx-4">
      <div className="rounded-xl border border-border shadow-sm bg-card overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-0">
          <p className="text-[15px] font-semibold text-foreground">Recent transactions</p>
          <button
            type="button"
            onClick={onSeeAll}
            className="text-[11.5px] font-semibold text-primary active:opacity-60 transition-opacity"
          >
            See all
          </button>
        </div>

        {/* Status segmented control — compact filter */}
        <div className="px-4 pt-3">
          <div className="bg-muted/50 rounded-lg p-1 flex gap-1">
            {TXN_TABS.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTxnTab(t)}
                className={cn(
                  "flex-1 py-1.5 rounded-md text-[11px] font-medium capitalize transition-all duration-150",
                  txnTab === t
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                )}
              >
                {t === "all" ? "All" : t === "success" ? "Success" : "Failed"}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction list */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${productTab}-${txnTab}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="divide-y divide-border border-t border-border mt-4 min-h-60"
          >
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-1.5">
                <p className="text-[13px] font-semibold text-foreground">No transactions found</p>
                <p className="text-[12px] text-muted-foreground text-center px-8 leading-relaxed">
                  No {txnTab !== "all" ? txnTab : ""} transactions for this account yet.
                </p>
              </div>
            ) : filtered.map(txn => {
              const badge     = STATUS_BADGE[txn.status];
              const isSuccess = txn.status === "success";
              const isFailed  = txn.status === "failed";
              const MethodIcon = METHOD_ICON[txn.method] ?? Wallet;
              return (
                <button
                  type="button"
                  key={txn.id}
                  onClick={() => onTxnTap?.(txn)}
                  className="flex items-start justify-between gap-3 px-4 py-3.5 w-full text-left active:bg-muted/30 transition-colors duration-100"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-foreground leading-snug truncate">{txn.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MethodIcon className="h-3 w-3 text-muted-foreground shrink-0" strokeWidth={1.75} />
                      <p className="text-[12px] text-muted-foreground leading-snug">{txn.method}</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{txn.time}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={cn("text-[13.5px] font-bold tabular-nums leading-snug", AMOUNT_COLOR[txn.status])}>
                      <MaskedNumber
                        value={`${isSuccess ? "+" : isFailed ? "−" : ""}${txn.amount}`}
                        hidden={hidden}
                      />
                    </p>
                    <span className={cn(
                      "mt-0.5 inline-block text-[10.5px] font-semibold px-1.5 py-0.5 rounded-full",
                      badge.text, badge.bg
                    )}>
                      {badge.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Root export ────────────────────────────────────────────────── */
export function MobileDashboardHome({
  onCreatePaymentLink,
  onMcaPaymentLinkBlocked,
  onTapToPay,
  onTxnTap,
  onSeeAllTransactions,
  onSettlementsOpen,
  onDisputesOpen,
}: {
  onCreatePaymentLink?: () => void;
  onMcaPaymentLinkBlocked?: () => void;
  onTapToPay?: () => void;
  onTxnTap?: (txn: RecentTxnItem) => void;
  onSeeAllTransactions?: () => void;
  onSettlementsOpen?: () => void;
  onDisputesOpen?: () => void;
} = {}) {
  const [metric, setMetric] = useState<MetricKey>("gross");
  const [productTab, setProductTab] = useState<ProductTab>("payment-gateway");

  return (
    <div className="flex flex-col gap-8 pt-1.5">

      {/* ① Product tab switcher */}
      <ProductTabSwitcher productTab={productTab} onProductTabChange={setProductTab} />

      <HeroCarousel metric={metric} setMetric={setMetric} productTab={productTab} />

      {/* ④ Quick actions — icon + label only, no containers */}
      <QuickActionsSection
        productTab={productTab}
        onCreatePaymentLink={() => {
          if (productTab === "multi-currency") {
            onMcaPaymentLinkBlocked?.();
          } else {
            onCreatePaymentLink?.();
          }
        }}
        onSettlementsOpen={onSettlementsOpen}
        onDisputesOpen={onDisputesOpen}
      />

      {/* ④ Needs attention */}
      <NeedsAttentionSection productTab={productTab} onNavigateToPayments={onSeeAllTransactions} />

      {/* ⑤ Recent transactions */}
      <RecentTransactionsCard
        onTxnTap={onTxnTap}
        onSeeAll={onSeeAllTransactions}
        productTab={productTab}
      />

      {/* Footer */}
      <Image
        src="/Footer.svg"
        alt=""
        width={2087}
        height={1301}
        className="w-full h-auto block -mb-5"
      />

    </div>
  );
}
