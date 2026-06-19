"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
} from "recharts";
import {
  ChevronDown, ArrowDownLeft,
  Link2, Receipt, Globe, FileText, Scale,
  XCircle, Clock,
  ChevronRight, AlertTriangle, AlertCircle, TrendingUp, ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHideAmounts, MaskedNumber } from "@/lib/hide-amounts-context";

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

type MetricKey = "gross" | "net" | "count";
const METRICS: Record<MetricKey, { label: string; value: string; unit: string; change: string; up: boolean }> = {
  gross: { label: "Gross volume",    value: "₹9,42,800", unit: "INR",  change: "+14.1%", up: true },
  net:   { label: "Net volume",      value: "₹8,98,450", unit: "INR",  change: "+11.8%", up: true },
  count: { label: "No. of payments", value: "1,284",      unit: "txns", change: "+9.3%",  up: true },
};


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

const STATUS_BADGE = {
  success: { label: "Completed", text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  failed:  { label: "Failed",    text: "text-red-700 dark:text-red-400",         bg: "bg-red-50 dark:bg-red-950/40"         },
  pending: { label: "Pending",   text: "text-amber-700 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-950/40"     },
} as const;

const TXN_ICON = {
  success: ArrowDownLeft,
  failed:  XCircle,
  pending: Clock,
} as const;

/* ─── Banner carousel ────────────────────────────────────────────── */
type BannerSeverity = "info" | "warning" | "alert";

const BANNER_SLIDES: Array<{
  severity: BannerSeverity;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  headline: string;
  body: string;
  cta: string;
  href: string;
}> = [
  { severity: "info",    icon: Globe,         headline: "International Payments Now Live",  body: "Accept USD, EUR & GBP with automatic FX settlement.",   cta: "Learn More",   href: "/payment-products/international-accounts" },
  { severity: "info",    icon: Link2,         headline: "Generate Links with Echo",          body: "Create and share payment links directly through chat.", cta: "Try Now",      href: "/echo" },
  { severity: "warning", icon: TrendingUp,    headline: "Settlement Optimization",           body: "Switch to faster settlements for improved cash flow.",  cta: "View Options", href: "/settlement-reports" },
  { severity: "warning", icon: AlertTriangle, headline: "High Failure Rate Detected",        body: "UPI success rate dropped 3% today.",                   cta: "Investigate",  href: "/transactions" },
  { severity: "alert",   icon: AlertCircle,   headline: "Dispute Action Required",           body: "Document upload pending for 4 disputes.",              cta: "Review Now",   href: "/dispute-management" },
  { severity: "alert",   icon: Clock,         headline: "Funds on Hold",                     body: "₹52,340 requires action before release.",              cta: "Take Action",  href: "/settlement-reports" },
];

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
  const total = BANNER_SLIDES.length;

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
          {BANNER_SLIDES.map((slide, i) => {
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
                  {BANNER_SLIDES.map((_, di) => (
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

/* ─── Chart tooltip (line chart) ─────────────────────────────────── */
function PulseTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
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
          ₹{todayVal.toLocaleString("en-IN")}
        </p>
      )}
      {ystVal != null && (
        <p className="text-[10.5px] text-muted-foreground tabular-nums mt-0.5">
          ₹{ystVal.toLocaleString("en-IN")} yday
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


/* ─── Hero Carousel ──────────────────────────────────────────────── */
function HeroCarousel({ metric, setMetric }: { metric: MetricKey; setMetric: (m: MetricKey) => void }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const pausedRef = useRef(false);
  const SLIDES = 2;

  useEffect(() => {
    const t = setInterval(() => {
      if (!pausedRef.current) setActiveIdx(i => (i + 1) % SLIDES);
    }, 5000);
    return () => clearInterval(t);
  }, []);

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
            <MerchantPulseCard metric={metric} setMetric={setMetric} />
          </div>
          <div style={{ width: `${100 / SLIDES}%` }}>
            <ReferralBannerSlide />
          </div>
        </div>
      </div>

      {/* Pagination dots */}
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
    </div>
  );
}

/* ─── Merchant Pulse Card (primary hero) ─────────────────────────── */
function MerchantPulseCard({ metric, setMetric }: { metric: MetricKey; setMetric: (m: MetricKey) => void }) {
  const m = METRICS[metric];
  const { hidden } = useHideAmounts();

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
function UpcomingSettlementCard({ isLoading = false }: { isLoading?: boolean }) {
  const { hidden } = useHideAmounts();

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
          <Link
            href="/settlement-reports"
            className="shrink-0 flex items-center gap-0.5 rounded-lg border border-border bg-background px-3 py-1.5 text-[11px] font-semibold text-foreground hover:bg-muted transition-colors"
          >
            View more
            <ChevronRight className="h-3 w-3" strokeWidth={2.5} />
          </Link>

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

function QuickActionsSection({ onCreatePaymentLink }: { onCreatePaymentLink?: () => void }) {
  return (
    <div className="mx-4">
      {/* Section header */}
      <p className="text-[15px] font-semibold text-foreground mb-3">Quick Actions</p>

      {/* Actions row — equal distribution, no overflow */}
      <div className="flex justify-between gap-1">
        {QUICK_ACTIONS.map((item) => {
          const Icon = item.icon;
          const isPaymentLink = item.key === "payment-link" && onCreatePaymentLink;

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

          if (isPaymentLink) {
            return (
              <button
                key={item.key}
                type="button"
                onClick={onCreatePaymentLink}
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
function NeedsAttentionSection() {
  const { hidden } = useHideAmounts();
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

function RecentTransactionsCard() {
  const [tab, setTab] = useState<TxnTab>("all");
  const { hidden } = useHideAmounts();

  const filtered = tab === "all"
    ? RECENT_TXN
    : RECENT_TXN.filter((t) => (tab === "success" ? t.status === "success" : t.status === "failed"));

  return (
    <div className="mx-4">
      <div className="rounded-xl bg-card overflow-hidden border border-border shadow-sm">
        {/* Header — reduced from 15px to 13px */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2.5">
          <p className="text-[15px] font-semibold text-foreground">Recent transactions</p>
          <Link href="/transactions" className="text-[11.5px] font-semibold text-primary">
            See all
          </Link>
        </div>

        {/* Tab pills */}
        <div className="mx-4 mb-3 bg-muted/50 rounded-lg p-1 flex gap-1">
          {TXN_TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 py-1 rounded-md text-[11px] font-medium capitalize transition-all duration-150",
                tab === t
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              {t === "all" ? "All" : t === "success" ? "Success" : "Failed"}
            </button>
          ))}
        </div>

        {/* Transaction rows */}
        <div className="divide-y divide-border border-t border-border min-h-[260px]">
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-[12px] text-muted-foreground">No transactions</p>
          ) : filtered.map((txn) => {
            const Icon      = TXN_ICON[txn.status];
            const badge     = STATUS_BADGE[txn.status];
            const isSuccess = txn.status === "success";
            const isFailed  = txn.status === "failed";

            return (
              <div key={txn.id} className="flex items-center gap-3 px-4 py-3">
                {/* Avatar — reduced from h-10 to h-9 */}
                <div className={cn(
                  "h-9 w-9 rounded-full flex items-center justify-center shrink-0",
                  isSuccess  ? "bg-emerald-50 dark:bg-emerald-950/40"
                  : isFailed ? "bg-red-50 dark:bg-red-950/40"
                  :            "bg-amber-50 dark:bg-amber-950/40"
                )}>
                  <Icon
                    className={cn(
                      "h-[15px] w-[15px]",
                      isSuccess  ? "text-emerald-600 dark:text-emerald-400"
                      : isFailed ? "text-red-600 dark:text-red-400"
                      :            "text-amber-600 dark:text-amber-400"
                    )}
                    strokeWidth={2}
                  />
                </div>

                {/* Name + method — reduced from 13.5/11.5px */}
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-semibold text-foreground truncate leading-tight">
                    {txn.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {txn.method} · {txn.time}
                  </p>
                </div>

                {/* Amount + badge — reduced from 14/10.5px */}
                <div className="text-right shrink-0">
                  <p className={cn(
                    "text-[13px] font-bold tabular-nums leading-tight",
                    isSuccess  ? "text-foreground"
                    : isFailed ? "text-red-600 dark:text-red-400"
                    :            "text-amber-600 dark:text-amber-400"
                  )}>
                    <MaskedNumber
                      value={`${isSuccess ? "+" : isFailed ? "−" : ""}${txn.amount}`}
                      hidden={hidden}
                    />
                  </p>
                  <span className={cn(
                    "mt-0.5 inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-md",
                    badge.text, badge.bg
                  )}>
                    {badge.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Root export — prop signature unchanged ─────────────────────── */
export function MobileDashboardHome({
  onCreatePaymentLink,
  onTapToPay,
}: { onCreatePaymentLink?: () => void; onTapToPay?: () => void } = {}) {
  const [metric, setMetric] = useState<MetricKey>("gross");

  return (
    <div className="flex flex-col gap-4 pb-4 pt-1.5">

      {/* ① Hero carousel — Gross Volume · Referral (2 slides) */}
      <HeroCarousel metric={metric} setMetric={setMetric} />

      {/* ④ Quick actions — icon + label only, no containers */}
      <QuickActionsSection onCreatePaymentLink={onCreatePaymentLink} />

      {/* ④ Needs attention */}
      <NeedsAttentionSection />

      {/* ⑤ Recent transactions */}
      <RecentTransactionsCard />

    </div>
  );
}
