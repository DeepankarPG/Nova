"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Info, type LucideIcon } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";
import { cn } from "@/lib/utils";import { useCounterAnimation } from "@/hooks/useCounterAnimation";

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
  /** 10–14 data points representing the trend (e.g. daily values) */
  sparkline?:   number[];
  /** Optional suffix appended after the value, e.g. "%" */
  suffix?:      string;
  /** Hover tooltip definition shown next to the title */
  tooltip?:     string;
}

export function StatCard({
  title, value, currency, subtitle, change, changeLabel = "vs last month",
  icon: Icon, iconPreset = "brand", isLoading = false, action, index = 0,
  sparkline, suffix, tooltip,
}: StatCardProps) {
  const animated = useCounterAnimation(value, 1000, !isLoading);
  const [tipVisible, setTipVisible] = useState(false);
  if (isLoading) return <StatCardSkeleton />;

  const { iconColor, lineColor } = presets[iconPreset] ?? presets.brand;
  const isPositive = change !== undefined && change >= 0;

  const sparkData = sparkline?.map((v, i) => ({ i, v }));

  return (
    <motion.div
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
                  className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 pointer-events-none"
                >
                  {/* Arrow */}
                  <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 rounded-sm"
                    style={{ background: "#1a1f2e" }} />
                  {/* Body */}
                  <div className="relative rounded-xl px-3.5 py-3 text-left"
                    style={{
                      background: "#1a1f2e",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.12)",
                    }}
                  >
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
      <div className="text-[1.9rem] font-bold text-gray-900 leading-none tracking-tight tabular-nums mt-3">
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

        {/* Sparkline — fixed width & height, always stays in its lane */}
        {sparkData && (
          <div className="flex-shrink-0" style={{ width: "44%", height: 52 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-${iconPreset}-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={lineColor} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={lineColor} stopOpacity={0}    />
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
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
}
