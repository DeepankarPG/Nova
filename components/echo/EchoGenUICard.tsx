"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  GenUIBarCard,
  GenUICard,
  GenUIDonutCard,
  GenUILineCard,
  GenUIMetricCard,
  GenUISplitCard,
  GenUITableCard,
} from "@/lib/echo/genUITypes";

/* ── helpers ─────────────────────────────────────────────────────────────── */

const CARD_CLASS =
  "bg-card text-card-foreground rounded-xl border border-border shadow-sm overflow-hidden flex flex-col";

const CHART_VARS = [
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
] as const;

function cssVar(v?: string, fallback?: string): string {
  return `var(${v ?? fallback ?? "--chart-1"})`;
}

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 11,
  color: "var(--foreground)",
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
};

/* ── Metric card ─────────────────────────────────────────────────────────── */

function MetricCard({ card }: { card: GenUIMetricCard }) {
  const uid = useId().replace(/:/g, "");
  const gradId = `echo-spark-${uid}`;
  const up = card.change !== undefined && card.change >= 0;
  const sparkData = card.sparkline?.map((v, i) => ({ i, v })) ?? [];

  return (
    /*
     * No overflow-hidden: sparkline stroke/fill must not clip at card edges.
     * Layout: title → row (value + sparkline only) → trend badge on its own row
     * so the pill never overlaps the chart.
     */
    <div
      className={cn(
        "bg-card text-card-foreground rounded-xl border border-border shadow-sm",
        "flex flex-col gap-2.5 p-3.5"
      )}
    >
      <p className="text-[11px] font-medium leading-snug text-muted-foreground">
        {card.title}
      </p>

      <div className="flex min-h-[2.75rem] items-end gap-2.5">
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="text-[1.25rem] font-bold leading-tight tracking-tight text-foreground sm:text-[1.4rem]">
            {card.value}
          </p>
          {card.subValue ? (
            <p className="text-[11px] leading-snug text-muted-foreground">{card.subValue}</p>
          ) : null}
        </div>
        {sparkData.length > 0 ? (
          <div
            className={cn(
              "shrink-0",
              "h-[2.75rem] w-[5rem] sm:h-14 sm:w-24",
              "max-w-[32%] min-[400px]:max-w-none"
            )}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={sparkData}
                margin={{ top: 4, right: 2, left: 0, bottom: 2 }}
              >
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={cssVar("--chart-1")} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={cssVar("--chart-1")} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={cssVar("--chart-1")}
                  strokeWidth={2}
                  fill={`url(#${gradId})`}
                  dot={false}
                  animationDuration={600}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : null}
      </div>

      {card.change !== undefined ? (
        <span
          className={cn(
            "inline-flex w-fit max-w-full flex-wrap items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
            up
              ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400"
              : "bg-red-500/12 text-red-600 dark:text-red-400"
          )}
        >
          {up ? (
            <TrendingUp className="h-3 w-3 shrink-0" strokeWidth={2.5} />
          ) : (
            <TrendingDown className="h-3 w-3 shrink-0" strokeWidth={2.5} />
          )}
          <span className="tabular-nums">
            {up ? "+" : ""}
            {card.change}%
          </span>
          {card.changeLabel ? (
            <span className="pl-0.5 font-normal opacity-70">{card.changeLabel}</span>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}

/* ── Line / area chart card ───────────────────────────────────────────────── */

function LineCard({ card }: { card: GenUILineCard }) {
  const uid = useId().replace(/:/g, "");
  const gradId = `echo-line-${uid}`;
  const color1 = cssVar(card.colorVar, "--chart-1");
  const color2 = cssVar("--chart-2");

  return (
    <div className={cn(CARD_CLASS, "p-3.5 gap-2.5")}>
      <div>
        <p className="text-[12px] font-semibold text-foreground">{card.title}</p>
        {card.subtitle && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">{card.subtitle}</p>
        )}
      </div>
      {card.compareKey && (
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-full inline-block" style={{ background: color1 }} />
            <span className="text-muted-foreground">
              {card.dataKey.charAt(0).toUpperCase() + card.dataKey.slice(1)}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="h-2 w-4 rounded-full inline-block opacity-60"
              style={{ background: color2 }}
            />
            <span className="text-muted-foreground">{card.compareLabel}</span>
          </span>
        </div>
      )}
      <div style={{ height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={card.data} margin={{ top: 4, right: 2, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color1} stopOpacity={0.18} />
                <stop offset="100%" stopColor={color1} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="color-mix(in srgb, var(--border) 65%, transparent)"
              vertical={false}
            />
            <XAxis
              dataKey={card.xKey}
              tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip contentStyle={tooltipStyle} />
            {card.compareKey && (
              <Area
                type="monotone"
                dataKey={card.compareKey}
                stroke={color2}
                strokeWidth={1.5}
                strokeOpacity={0.55}
                fill="none"
                dot={false}
                animationDuration={700}
              />
            )}
            <Area
              type="monotone"
              dataKey={card.dataKey}
              stroke={color1}
              strokeWidth={2}
              fill={`url(#${gradId})`}
              dot={false}
              activeDot={{ r: 3, fill: color1, strokeWidth: 0 }}
              animationDuration={700}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ── Bar chart card ───────────────────────────────────────────────────────── */

function BarCard({ card }: { card: GenUIBarCard }) {
  return (
    <div className={cn(CARD_CLASS, "p-3.5 gap-2.5")}>
      <div>
        <p className="text-[12px] font-semibold text-foreground">{card.title}</p>
        {card.subtitle && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">{card.subtitle}</p>
        )}
      </div>
      {card.bars.length > 1 && (
        <div className="flex flex-wrap items-center gap-3 text-[10px]">
          {card.bars.map((b, i) => (
            <span key={b.dataKey} className="flex items-center gap-1.5">
              <span
                className="h-2 w-3 rounded-sm inline-block"
                style={{ background: cssVar(b.colorVar, CHART_VARS[i % CHART_VARS.length]) }}
              />
              <span className="text-muted-foreground">{b.label}</span>
            </span>
          ))}
        </div>
      )}
      <div style={{ height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={card.data} margin={{ top: 4, right: 2, left: -24, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="color-mix(in srgb, var(--border) 65%, transparent)"
              vertical={false}
            />
            <XAxis
              dataKey={card.xKey}
              tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip contentStyle={tooltipStyle} />
            {card.bars.map((b, i) => (
              <Bar
                key={b.dataKey}
                dataKey={b.dataKey}
                name={b.label}
                fill={cssVar(b.colorVar, CHART_VARS[i % CHART_VARS.length])}
                stackId={card.stacked ? "s" : undefined}
                radius={card.stacked ? [0, 0, 0, 0] : [3, 3, 0, 0]}
                maxBarSize={28}
                animationDuration={700}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ── Donut card ─────────────────────────────────────────────────────────────
 * Chart centered above a 2-column legend grid — no text truncation.
 */

function DonutCard({ card }: { card: GenUIDonutCard }) {
  return (
    <div className={cn(CARD_CLASS, "p-3.5 gap-3")}>
      <div>
        <p className="text-[12px] font-semibold text-foreground">{card.title}</p>
        {card.subtitle && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">{card.subtitle}</p>
        )}
      </div>

      {/* Donut chart — centred */}
      <div className="flex justify-center">
        <div className="relative" style={{ width: 120, height: 120 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={card.segments}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={32}
                outerRadius={54}
                paddingAngle={2}
                animationDuration={700}
                animationBegin={0}
              >
                {card.segments.map((seg, i) => (
                  <Cell
                    key={seg.key}
                    fill={cssVar(seg.colorVar, CHART_VARS[i % CHART_VARS.length])}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                formatter={(v: any) => [`${v ?? ""}%`]}
              />
            </PieChart>
          </ResponsiveContainer>
          {card.centerLabel && (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] font-medium text-muted-foreground">
              {card.centerLabel}
            </span>
          )}
        </div>
      </div>

      {/* Legend — 2-column grid, full label text, no truncation */}
      <ul className="grid grid-cols-2 gap-x-2.5 gap-y-2">
        {card.segments.map((seg, i) => (
          <li key={seg.key} className="flex items-start gap-1.5 text-[10px]">
            <span
              className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
              style={{ background: cssVar(seg.colorVar, CHART_VARS[i % CHART_VARS.length]) }}
            />
            <span className="flex-1 leading-tight text-muted-foreground">{seg.label}</span>
            <span className="shrink-0 font-semibold text-foreground tabular-nums">
              {seg.value}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Table card ──────────────────────────────────────────────────────────── */

function TableCard({ card }: { card: GenUITableCard }) {
  return (
    /*
     * col-span-full sm:col-span-2 — table gets 2/3 width on wider screens,
     * which is enough for typical 2-4 column tables without wasting space.
     * whitespace-nowrap on every cell stops flag+name strings from wrapping.
     */
    <div className={cn(CARD_CLASS)}>
      <div className="px-3.5 pt-3.5 pb-2.5">
        <p className="text-[12px] font-semibold text-foreground">{card.title}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-t border-border bg-muted/40">
              {card.columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-3.5 py-1.5 text-[10px] font-semibold text-muted-foreground whitespace-nowrap",
                    col.align === "right" ? "text-right" : "text-left"
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {card.rows.map((row, ri) => (
              <tr
                key={ri}
                className="border-t border-border/60 hover:bg-muted/30 transition-colors"
              >
                {card.columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-3.5 py-1.5 text-[12px] text-foreground whitespace-nowrap",
                      col.align === "right" ? "text-right font-medium tabular-nums" : "text-left"
                    )}
                  >
                    {String(row[col.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Split bar card ───────────────────────────────────────────────────────── */

function SplitCard({ card }: { card: GenUISplitCard }) {
  const total = card.segments.reduce((s, seg) => s + seg.value, 0);

  return (
    <div className={cn(CARD_CLASS, "p-3.5 gap-3")}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[12px] font-semibold text-foreground">{card.title}</p>
        {card.total && (
          <span className="shrink-0 text-[10px] text-muted-foreground">{card.total}</span>
        )}
      </div>

      {/* Stacked bar */}
      <div className="flex h-2 w-full overflow-hidden rounded-full">
        {card.segments.map((seg, i) => (
          <div
            key={seg.label}
            className="h-full transition-all duration-500"
            style={{
              width: `${(seg.value / total) * 100}%`,
              background: cssVar(seg.colorVar, CHART_VARS[i % CHART_VARS.length]),
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <ul className="grid grid-cols-2 gap-x-2.5 gap-y-1.5">
        {card.segments.map((seg, i) => (
          <li key={seg.label} className="flex items-start gap-1.5 text-[10px]">
            <span
              className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
              style={{ background: cssVar(seg.colorVar, CHART_VARS[i % CHART_VARS.length]) }}
            />
            <span className="flex-1 leading-tight text-muted-foreground">{seg.label}</span>
            <span className="shrink-0 font-semibold text-foreground tabular-nums">
              {seg.value}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Public switch ────────────────────────────────────────────────────────── */

export function EchoGenUICard({ card }: { card: GenUICard }) {
  switch (card.type) {
    case "metric":
      return <MetricCard card={card} />;
    case "line":
      return <LineCard card={card} />;
    case "bar":
      return <BarCard card={card} />;
    case "donut":
      return <DonutCard card={card} />;
    case "table":
      return <TableCard card={card} />;
    case "split":
      return <SplitCard card={card} />;
    default:
      return null;
  }
}
