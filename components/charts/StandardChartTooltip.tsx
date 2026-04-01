"use client";

import { cn } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Shared chrome for Recharts tooltips — matches dashboard volume hover card */
export const chartTooltipShellClass =
  "rounded-2xl border border-zinc-200/90 bg-card px-4 py-3.5 text-xs text-card-foreground antialiased shadow-[0_10px_40px_-14px_rgba(15,23,42,0.2)] dark:border-zinc-700/85 dark:bg-zinc-950 dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.55)]";

export function StandardChartTooltip({
  active,
  payload,
  label,
  formatValue,
  className,
}: {
  active?: boolean;
  payload?: readonly any[];
  label?: string | number;
  formatValue?: (v: number) => string;
  className?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className={cn(chartTooltipShellClass, "max-w-[min(100vw-1.5rem,17rem)]", className)}>
      <p className="mb-2.5 text-sm font-semibold leading-none text-foreground">{label}</p>
      <div className="space-y-2">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/[0.06] dark:ring-white/[0.1]"
                style={{ background: entry.color ?? entry.fill ?? "#0061E3" }}
              />
              <span className="truncate text-[13px] text-muted-foreground">{entry.name}:</span>
            </span>
            <span className="shrink-0 text-[13px] font-semibold tabular-nums text-foreground">
              {formatValue && entry.value !== undefined
                ? formatValue(entry.value as number)
                : (entry.value as number)?.toLocaleString("en-IN") ?? String(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
