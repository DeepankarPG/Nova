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
import { cn } from "@/lib/utils";
import { ChartSkeleton } from "@/components/shared/ShimmerSkeleton";

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

function CustomTooltip({ active, payload, label, formatValue }: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: readonly any[];
  label?: string | number;
  formatValue?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2.5 text-xs">
      <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-slate-500">{entry.name}:</span>
          <span className="font-medium text-slate-800">
            {formatValue && entry.value !== undefined ? formatValue(entry.value as number) : (entry.value as number)?.toLocaleString("en-IN")}
          </span>
        </div>
      ))}
    </div>
  );
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
    <div className={cn("bg-white rounded-2xl border border-slate-200 p-5 shadow-sm", className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {lines.map((line) => (
            <div key={line.key} className="flex items-center gap-1.5">
              <div className="w-6 h-0.5 rounded-full" style={{ background: line.color }} />
              <span className="text-xs text-slate-500">{line.label}</span>
            </div>
          ))}
        </div>
      </div>
      {isLoading ? (
        <ChartSkeleton height={`h-[${height}px]`} />
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey={xKey}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              width={48}
            />
            <Tooltip content={(props) => <CustomTooltip {...props} formatValue={formatValue} />} />
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
