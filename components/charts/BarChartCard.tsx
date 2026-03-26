"use client";

import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { ChartSkeleton } from "@/components/shared/ShimmerSkeleton";

interface BarChartCardProps {
  data: { [key: string]: string | number }[];
  xKey: string;
  bars: { key: string; label: string; color: string }[];
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  formatValue?: (v: number) => string;
  height?: number;
  className?: string;
}

function CustomTooltip({ active, payload, label, formatValue }: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: readonly any[];
  label?: string | number;
  formatValue?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 rounded-xl px-3 py-2.5 text-xs shadow-xl">
      <p className="font-semibold text-gray-300 mb-1.5 text-[11px]">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-sm" style={{ background: entry.color }} />
          <span className="text-gray-400">{entry.name}:</span>
          <span className="font-semibold text-white">
            {formatValue && entry.value !== undefined ? formatValue(entry.value as number) : (entry.value as number)?.toLocaleString("en-IN")}
          </span>
        </div>
      ))}
    </div>
  );
}

export function BarChartCard({
  data, xKey, bars, title, subtitle, isLoading,
  formatValue, height = 200, className,
}: BarChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      className={cn("bg-white rounded-xl px-5 pt-4 pb-3", className)}
      style={{ border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          {bars.map((bar) => (
            <div key={bar.key} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: bar.color }} />
              <span className="text-[11px] text-gray-400 font-medium">{bar.label}</span>
            </div>
          ))}
        </div>
      </div>
      {isLoading ? (
        <ChartSkeleton />
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} barCategoryGap="22%" barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <YAxis
              axisLine={false} tickLine={false}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickFormatter={(v) => v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v/1_000).toFixed(0)}K` : v}
              width={40}
            />
            <Tooltip
              content={(props) => <CustomTooltip {...props} formatValue={formatValue} />}
              cursor={{ fill: "#f9fafb", radius: 4 }}
            />
            {bars.map((bar) => (
              <Bar
                key={bar.key}
                dataKey={bar.key}
                name={bar.label}
                fill={bar.color}
                radius={[5, 5, 0, 0]}
                animationDuration={720}
                animationEasing="ease-out"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
