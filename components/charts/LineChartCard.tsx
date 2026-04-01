"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { StandardChartTooltip } from "@/components/charts/StandardChartTooltip";
import { cn } from "@/lib/utils";
import { ChartSkeleton } from "@/components/ui/skeleton";

interface LineChartCardProps {
  data: { [key: string]: string | number }[];
  xKey: string;
  lines: { key: string; label: string; color: string }[];
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  formatValue?: (v: number) => string;
  height?: number;
  className?: string;
}

export function LineChartCard({
  data,
  xKey,
  lines,
  title,
  subtitle,
  isLoading,
  formatValue,
  height = 200,
  className,
}: LineChartCardProps) {
  return (
    <div className={cn("bg-card text-card-foreground rounded-2xl border border-border p-5 shadow-sm", className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {lines.map((line) => (
            <div key={line.key} className="flex items-center gap-1.5">
              <div className="w-6 h-0.5 rounded-full" style={{ background: line.color }} />
              <span className="text-xs text-muted-foreground">{line.label}</span>
            </div>
          ))}
        </div>
      </div>
      {isLoading ? (
        <ChartSkeleton height={`h-[${height}px]`} />
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
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
              width={48}
            />
            <Tooltip content={(props) => <StandardChartTooltip {...props} formatValue={formatValue} />} />
            {lines.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.label}
                stroke={line.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
