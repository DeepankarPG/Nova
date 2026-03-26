"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Info, X, type LucideIcon } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { useCounterAnimation } from "@/hooks/useCounterAnimation";

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-5 flex flex-col gap-3"
      style={{ border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center justify-between">
        <div className="shimmer h-3 w-28 rounded" />
        <div className="shimmer h-9 w-9 rounded-full" />
      </div>
      <div className="shimmer h-8 w-40 rounded-md mt-1" />
      <div className="shimmer h-3 w-28 rounded" />
      <div className="shimmer h-10 w-full rounded mt-1" />
    </div>
  );
}

function formatDisplayValue(value: number, currency?: string, suffix?: string): string {
  const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "";
  const isWhole = Number.isInteger(value) && !currency;
  const fmt = (n: number) => isWhole
    ? new Intl.NumberFormat("en-IN").format(n)
    : new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  if (suffix) return `${symbol}${fmt(value)}${suffix}`;
  if (!currency && value >= 10_00_000) return `${(value / 10_00_000).toFixed(2)}L`;
  if (currency && value >= 10_00_000) return `${symbol}${(value / 10_00_000).toFixed(2)}L`;
  return `${symbol}${fmt(value)}`;
}

const presets: Record<string, { circleBg: string; iconColor: string; lineColor: string }> = {
  green:  { circleBg: "bg-emerald-50",  iconColor: "text-emerald-500", lineColor: "#10b981" },
  blue:   { circleBg: "bg-blue-50",     iconColor: "text-blue-500",    lineColor: "#3b82f6" },
  amber:  { circleBg: "bg-amber-50",    iconColor: "text-amber-500",   lineColor: "#f59e0b" },
  red:    { circleBg: "bg-red-50",      iconColor: "text-red-500",     lineColor: "#ef4444" },
  purple: { circleBg: "bg-purple-50",   iconColor: "text-purple-500",  lineColor: "#a855f7" },
  brand:  { circleBg: "bg-[#eff4ff]",   iconColor: "text-[#0061E3]",   lineColor: "#0061E3" },
};

/* ─── Drill-down data types ──────────────────────────────────────────────── */
export interface DrillDownItem {
  label:        string;
  value:        string;
  pct?:         number;        // 0-100 — shows a mini progress bar
  color?:       string;        // bar / dot color
  badge?:       string;        // small pill label
  badgeVariant?: "red" | "amber" | "blue" | "green" | "gray";
}

export interface DrillDownData {
  heading:  string;
  period?:  string;
  items:    DrillDownItem[];
  stats?:   { label: string; value: string }[];
  note?:    string;
  cta?:     string;
}

const BADGE_STYLES: Record<string, { bg: string; color: string }> = {
  red:   { bg: "#fff1f2", color: "#e11d48" },
  amber: { bg: "#fffbeb", color: "#d97706" },
  blue:  { bg: "#eff6ff", color: "#2563eb" },
  green: { bg: "#f0fdf4", color: "#16a34a" },
  gray:  { bg: "#f3f4f6", color: "#6b7280" },
};

/* ─── Drill-down floating panel ─────────────────────────────────────────── */
function DrillDownPanel({
  data, lineColor, onClose,
  anchorRect,
}: {
  data: DrillDownData;
  lineColor: string;
  onClose: () => void;
  anchorRect: DOMRect;
}) {
  const panelW = 272;
  const gap    = 10;
  const vp     = typeof window !== "undefined" ? window.innerWidth : 1200;

  /* Prefer right-side of card; fall back to left */
  let left: number | undefined;
  let right: number | undefined;
  const spaceRight = vp - anchorRect.right;
  const spaceLeft  = anchorRect.left;

  if (spaceRight >= panelW + gap) {
    left = anchorRect.right + gap;
  } else if (spaceLeft >= panelW + gap) {
    right = vp - anchorRect.left + gap;
  } else {
    /* Not enough room on either side — anchor below, centred on card */
    left = Math.max(8, anchorRect.left + anchorRect.width / 2 - panelW / 2);
  }

  /* Vertical: align top of panel with top of card; clamp to viewport */
  const vph    = typeof window !== "undefined" ? window.innerHeight : 800;
  const rawTop = anchorRect.top;
  const top    = Math.min(rawTop, vph - 420);

  /* Close on outside click */
  useEffect(() => {
    function handle(e: MouseEvent) {
      const el = document.getElementById("stat-drilldown-panel");
      if (el && !el.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  const panel = (
    <AnimatePresence>
      <motion.div
        id="stat-drilldown-panel"
        initial={{ opacity: 0, scale: 0.96, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 6 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-2xl z-[200]"
        style={{
          position: "fixed",
          top,
          left,
          right: left === undefined ? right : undefined,
          width: panelW,
          boxShadow: "0 16px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.07)",
          border: "1px solid #e5e7eb",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3"
          style={{ borderBottom: "1px solid #f0f0f0" }}>
          <div>
            <p className="text-[13.5px] font-semibold text-gray-900">{data.heading}</p>
            {data.period && (
              <p className="text-[11px] text-gray-400 mt-0.5">{data.period}</p>
            )}
          </div>
          <button onClick={onClose}
            className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Items */}
        <div className="px-4 py-3 space-y-3">
          {data.items.map((item, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  {item.color && !item.pct && (
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  )}
                  <span className="text-[12.5px] text-gray-600 truncate">{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  {item.badge && (
                    <span className="text-[10.5px] font-semibold px-1.5 py-0.5 rounded-md"
                      style={BADGE_STYLES[item.badgeVariant ?? "gray"]}>
                      {item.badge}
                    </span>
                  )}
                  <span className="text-[12.5px] font-semibold text-gray-900 tabular-nums">{item.value}</span>
                </div>
              </div>
              {item.pct !== undefined && (
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: item.color ?? lineColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.pct}%` }}
                    transition={{ duration: 0.5, delay: i * 0.07, ease: "easeOut" }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Stats row */}
        {data.stats && data.stats.length > 0 && (
          <div className="mx-4 mb-3 grid gap-px rounded-xl overflow-hidden"
            style={{ gridTemplateColumns: `repeat(${data.stats.length}, 1fr)`, background: "#f0f0f0" }}>
            {data.stats.map((s, i) => (
              <div key={i} className="bg-white px-3 py-2.5 text-center">
                <p className="text-[13px] font-bold text-gray-900">{s.value}</p>
                <p className="text-[10.5px] text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {(data.note || data.cta) && (
          <div className="px-4 pb-4 space-y-2.5">
            {data.note && (
              <p className="text-[11px] text-gray-400 leading-relaxed">{data.note}</p>
            )}
            {data.cta && (
              <button
                className="text-[12px] font-semibold transition-colors"
                style={{ color: lineColor }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                {data.cta} →
              </button>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );

  if (typeof document === "undefined") return null;
  return createPortal(panel, document.body);
}

/* ─── StatCard ───────────────────────────────────────────────────────────── */
interface StatCardProps {
  title:        string;
  value:        number;
  currency?:    string;
  subtitle?:    string;
  change?:      number;
  changeLabel?: string;
  icon:         LucideIcon;
  iconPreset?:  keyof typeof presets;
  isLoading?:   boolean;
  action?:      { label: string; onClick: () => void };
  index?:       number;
  sparkline?:   number[];
  suffix?:      string;
  tooltip?:     string;
  drillDown?:   DrillDownData;
}

export function StatCard({
  title, value, currency, subtitle, change, changeLabel = "vs last month",
  icon: Icon, iconPreset = "brand", isLoading = false, action, index = 0,
  sparkline, suffix, tooltip, drillDown,
}: StatCardProps) {
  const animated = useCounterAnimation(value, 1000, !isLoading);
  const [tipVisible,    setTipVisible]    = useState(false);
  const [popupOpen,     setPopupOpen]     = useState(false);
  const [anchorRect,    setAnchorRect]    = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  if (isLoading) return <StatCardSkeleton />;

  const { iconColor, lineColor } = presets[iconPreset] ?? presets.brand;
  const isPositive = change !== undefined && change >= 0;
  const sparkData  = sparkline?.map((v, i) => ({ i, v }));

  function handleChartClick() {
    if (!drillDown || !cardRef.current) return;
    if (popupOpen) { setPopupOpen(false); return; }
    setAnchorRect(cardRef.current.getBoundingClientRect());
    setPopupOpen(true);
  }

  return (
    <>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -1, transition: { duration: 0.12 } }}
        className="bg-white rounded-xl p-5 flex flex-col gap-2 cursor-default"
        style={{ border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
      >
        {/* ── Row 1: icon + title + info ── */}
        <div className="flex items-center gap-2">
          <Icon className={iconColor} style={{ width: 16, height: 16, opacity: 0.7 }} />
          <span className="text-[13px] font-normal text-gray-500">{title}</span>
          {tooltip && (
            <div className="relative flex items-center ml-0.5"
              onMouseEnter={() => setTipVisible(true)}
              onMouseLeave={() => setTipVisible(false)}
            >
              <Info style={{ width: 13, height: 13 }} className="text-gray-300 hover:text-gray-400 transition-colors cursor-default flex-shrink-0" />
              <AnimatePresence>
                {tipVisible && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 max-w-[calc(100vw-2rem)] pointer-events-none"
                  >
                    <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 rounded-sm"
                      style={{ background: "#1a1f2e" }} />
                    <div className="relative rounded-xl px-3.5 py-3 text-left"
                      style={{ background: "#1a1f2e", boxShadow: "0 8px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.12)" }}>
                      <p className="text-[11px] font-semibold text-white mb-1 tracking-wide">{title}</p>
                      <p className="text-[11px] leading-relaxed" style={{ color: "#a8b3c8" }}>{tooltip}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ── Row 2: full-width number ── */}
        <div className="text-[1.5rem] sm:text-[1.9rem] font-bold text-gray-900 leading-none tracking-tight tabular-nums mt-3">
          {formatDisplayValue(animated, currency, suffix)}
        </div>

        {/* ── Row 3: change% left + sparkline right ── */}
        <div className="flex items-end gap-2 mt-1">

          {/* Change info */}
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            {change !== undefined ? (
              <div className={cn("flex items-center gap-1 text-[12px] font-semibold whitespace-nowrap",
                isPositive ? "text-emerald-600" : "text-red-500")}>
                {isPositive
                  ? <TrendingUp  style={{ width: 13, height: 13 }} />
                  : <TrendingDown style={{ width: 13, height: 13 }} />}
                <span>{isPositive ? "+" : ""}{change}%</span>
                <span className="text-gray-400 font-normal text-[11px]">{changeLabel}</span>
              </div>
            ) : (
              <span className="text-[11px] text-gray-400">{subtitle}</span>
            )}
            {action && (
              <button onClick={action.onClick}
                className="text-[11px] font-medium text-left transition-colors"
                style={{ color: "#0061E3" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#0049ad"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#0061E3"}>
                {action.label} →
              </button>
            )}
          </div>

          {/* Sparkline — clickable if drillDown data is provided */}
          {sparkData && (
            <div
              className={cn(
                "flex-shrink-0 rounded-lg transition-all",
                drillDown ? "cursor-pointer" : ""
              )}
              style={{ width: "44%", height: 52 }}
              onClick={handleChartClick}
              title={drillDown ? "Click for breakdown" : undefined}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkData} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`grad-${iconPreset}-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={lineColor} stopOpacity={popupOpen ? 0.35 : 0.22} />
                      <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ display: "none" }}
                    cursor={{ stroke: lineColor, strokeWidth: 1, strokeDasharray: "3 3", opacity: 0.3 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={lineColor}
                    strokeWidth={2}
                    fill={`url(#grad-${iconPreset}-${index})`}
                    dot={false}
                    activeDot={{ r: 3, fill: lineColor, strokeWidth: 0 }}
                    animationDuration={650}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </motion.div>

      {/* Drill-down panel — rendered into document.body via portal */}
      {popupOpen && anchorRect && drillDown && (
        <DrillDownPanel
          data={drillDown}
          lineColor={lineColor}
          anchorRect={anchorRect}
          onClose={() => setPopupOpen(false)}
        />
      )}
    </>
  );
}
