"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { StandardChartTooltip } from "@/components/charts/StandardChartTooltip";
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

export function BarChartCard({
  data,
  xKey,
  bars,
  title,
  subtitle,
  isLoading,
  formatValue,
  height = 200,
  className,
}: BarChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "bg-card text-card-foreground rounded-xl border border-border px-5 pt-4 pb-3 shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          {bars.map((bar) => (
            <div key={bar.key} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: bar.color }} />
              <span className="text-[11px] text-muted-foreground font-medium">{bar.label}</span>
            </div>
          ))}
        </div>
      </div>
      {isLoading ? (
        <ChartSkeleton />
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} barCategoryGap="22%" barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey={xKey}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--chart-tick)" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--chart-tick)" }}
              tickFormatter={(v) =>
                v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : v
              }
              width={40}
            />
            <Tooltip
              content={(props) => <StandardChartTooltip {...props} formatValue={formatValue} />}
              cursor={{ fill: "var(--chart-cursor)", radius: 4 }}
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
