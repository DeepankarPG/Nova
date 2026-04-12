"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  ExternalLink,
  Info,
  Minus,
} from "lucide-react";
import { cn } from "./utils";
import { Button } from "./button";
import { Separator } from "./separator";

const gridStroke = "color-mix(in srgb, var(--border) 65%, transparent)";
const tickFill = "var(--muted-foreground)";

/** ─── KPI + sparkline (dashboard stat tiles) ─────────────────────────── */

export type MetricSparklinePoint = { x: string | number; y: number };

export type MetricSparklineCardProps = {
  title: string;
  icon?: React.ReactNode;
  value: React.ReactNode;
  /** e.g. "+8.4% vs last month" */
  trend?: { direction: "up" | "down" | "flat"; label: string };
  data: MetricSparklinePoint[];
  /** Stroke / gradient accent (CSS color) */
  accentColor?: string;
  className?: string;
  onInfoClick?: () => void;
};

export function MetricSparklineCard({
  title,
  icon,
  value,
  trend,
  data,
  accentColor = "var(--chart-1)",
  className,
  onInfoClick,
}: MetricSparklineCardProps) {
  const gid = React.useId().replace(/:/g, "");
  const chartData = data.map((d) => ({ ...d, y: d.y }));

  const trendCls =
    trend?.direction === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : trend?.direction === "down"
        ? "text-red-600 dark:text-red-400"
        : "text-muted-foreground";

  const TrendIcon =
    trend?.direction === "up" ? ArrowUpRight : trend?.direction === "down" ? ArrowDownRight : Minus;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {icon ? <span className="flex shrink-0 text-muted-foreground [&_svg]:size-4">{icon}</span> : null}
          <span className="truncate text-sm font-semibold text-foreground">{title}</span>
        </div>
        {onInfoClick ? (
          <button
            type="button"
            onClick={onInfoClick}
            className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="More info"
          >
            <Info className="size-3.5" />
          </button>
        ) : null}
      </div>

      <div className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-foreground">{value}</div>

      <div className="pointer-events-none absolute bottom-3 right-3 h-14 w-[46%] max-w-[9rem] opacity-95">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accentColor} stopOpacity={0.35} />
                <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="y"
              stroke={accentColor}
              strokeWidth={2}
              fill={`url(#${gid})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {trend ? (
        <div className={cn("mt-10 flex items-center gap-1 text-xs font-medium", trendCls)}>
          <TrendIcon className="size-3.5 shrink-0" aria-hidden />
          <span>{trend.label}</span>
        </div>
      ) : (
        <div className="mt-10" />
      )}
    </div>
  );
}

/** ─── Hero area + optional compare line + tabs + footer ──────────────── */

export type DashboardAreaChartPoint = Record<string, string | number>;

export type DashboardAreaChartTemplateProps = {
  title: string;
  tabs: { id: string; label: string }[];
  activeTabId: string;
  onTabChange: (id: string) => void;
  headline: React.ReactNode;
  delta?: React.ReactNode;
  data: DashboardAreaChartPoint[];
  xKey: string;
  areaKey: string;
  compareLineKey?: string;
  height?: number;
  formatYAxis?: (v: number) => string;
  footer?: React.ReactNode;
  className?: string;
};

export function DashboardAreaChartTemplate({
  title,
  tabs,
  activeTabId,
  onTabChange,
  headline,
  delta,
  data,
  xKey,
  areaKey,
  compareLineKey,
  height = 220,
  formatYAxis = (v) =>
    v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}L` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : `${v}`,
  footer,
  className,
}: DashboardAreaChartTemplateProps) {
  const areaGid = React.useId().replace(/:/g, "");

  return (
    <div className={cn("rounded-xl border border-border bg-card text-card-foreground shadow-sm", className)}>
      <div className="flex flex-col gap-4 border-b border-border px-5 pt-4 pb-3 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/30 p-0.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                activeTabId === t.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pt-4">
        <div className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">{headline}</div>
        {delta ? <div className="mt-1 text-sm">{delta}</div> : null}
      </div>

      <div className="px-3 pb-2 pt-2" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={areaGid} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
            <XAxis
              dataKey={xKey}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: tickFill }}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: tickFill }}
              tickFormatter={formatYAxis}
              width={44}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: "1px solid var(--border)",
                fontSize: 12,
                background: "var(--popover)",
                color: "var(--popover-foreground)",
              }}
            />
            <Area
              type="monotone"
              dataKey={areaKey}
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill={`url(#${areaGid})`}
            />
            {compareLineKey ? (
              <Line
                type="monotone"
                dataKey={compareLineKey}
                stroke="var(--muted-foreground)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
            ) : null}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {footer ? (
        <>
          <Separator />
          <div className="px-5 py-3">{footer}</div>
        </>
      ) : null}
    </div>
  );
}

/** ─── Grouped vertical bars + legend (e.g. volume vs settled) ───────── */

export type GroupedBarSeries = { key: string; label: string; color: string };

export type GroupedBarChartTemplateProps = {
  title: string;
  subtitle?: string;
  data: DashboardAreaChartPoint[];
  xKey: string;
  series: GroupedBarSeries[];
  height?: number;
  formatYAxis?: (v: number) => string;
  className?: string;
};

export function GroupedBarChartTemplate({
  title,
  subtitle,
  data,
  xKey,
  series,
  height = 200,
  formatYAxis = (v) =>
    v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : `${v}`,
  className,
}: GroupedBarChartTemplateProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card px-5 pt-4 pb-3 text-card-foreground shadow-sm", className)}>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {series.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-sm" style={{ background: s.color }} />
              <span className="text-[11px] font-medium text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="22%" barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
            <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: tickFill }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: tickFill }}
              tickFormatter={formatYAxis}
              width={40}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: "1px solid var(--border)",
                fontSize: 12,
                background: "var(--popover)",
              }}
            />
            {series.map((s) => (
              <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[5, 5, 0, 0]} maxBarSize={36} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** ─── Ranked rows with horizontal bar (country / state insights) ────── */

export type RankedBarItem = {
  id: string;
  leading?: React.ReactNode;
  label: string;
  value: string;
  /** 0–100 width of the filled bar */
  percent: number;
};

export type RankedBarListTemplateProps = {
  title: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  items: RankedBarItem[];
  /** CSS colors for bar gradient */
  barFrom?: string;
  barTo?: string;
  className?: string;
};

export function RankedBarListTemplate({
  title,
  subtitle,
  headerRight,
  items,
  barFrom = "var(--chart-1)",
  barTo = "var(--chart-3)",
  className,
}: RankedBarListTemplateProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm", className)}>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        {headerRight ? <div className="shrink-0">{headerRight}</div> : null}
      </div>
      <ul className="space-y-3">
        {items.map((row) => (
          <li key={row.id} className="flex items-center gap-3 text-sm">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {row.leading ? <span className="shrink-0 text-muted-foreground">{row.leading}</span> : null}
              <span className="truncate font-medium text-foreground">{row.label}</span>
            </div>
            <div className="relative hidden h-2 w-[min(40%,9rem)] overflow-hidden rounded-full bg-muted sm:block">
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${Math.min(100, Math.max(0, row.percent))}%`,
                  background: `linear-gradient(90deg, ${barFrom}, ${barTo})`,
                }}
              />
            </div>
            <span className="w-14 shrink-0 text-right text-xs font-semibold tabular-nums text-foreground">
              {row.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** ─── Vertical category bars (e.g. T+N settlement mix) ──────────────── */

export type CategoryBarPoint = { category: string; value: number };

export type CategoryBarChartTemplateProps = {
  title: string;
  subtitle?: string;
  data: CategoryBarPoint[];
  valueLabel?: string;
  barColor?: string;
  height?: number;
  className?: string;
};

export function CategoryBarChartTemplate({
  title,
  subtitle,
  data,
  valueLabel = "Share",
  barColor = "var(--chart-1)",
  height = 200,
  className,
}: CategoryBarChartTemplateProps) {
  const chartData = data.map((d) => ({ name: d.category, v: d.value }));

  return (
    <div className={cn("rounded-xl border border-border bg-card px-5 pt-4 pb-3 text-card-foreground shadow-sm", className)}>
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="28%">
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: tickFill }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: tickFill }}
              tickFormatter={(v) => `${v}%`}
              domain={[0, "dataMax + 5"]}
              width={36}
            />
            <Tooltip
              formatter={(value) => [`${value ?? 0}%`, valueLabel]}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid var(--border)",
                fontSize: 12,
                background: "var(--popover)",
              }}
            />
            <Bar dataKey="v" fill={barColor} radius={[6, 6, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** ─── Mini sparkline + stat row (success / failed / avg) ────────────── */

export type MiniSparklinePoint = { x: string | number; y: number; compare?: number };

export type MiniSparklineStat = { label: string; value: string; dotClassName?: string };

export type MiniSparklineChartCardProps = {
  title: string;
  value: React.ReactNode;
  data: MiniSparklinePoint[];
  accentColor?: string;
  stats: MiniSparklineStat[];
  height?: number;
  className?: string;
};

export function MiniSparklineChartCard({
  title,
  value,
  data,
  accentColor = "var(--chart-4)",
  height = 100,
  stats,
  className,
}: MiniSparklineChartCardProps) {
  const gid = React.useId().replace(/:/g, "");
  const hasCompare = data.some((d) => d.compare != null);

  return (
    <div className={cn("rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm", className)}>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
      <div className="mt-2" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accentColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="x" hide />
            <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
            <Area type="monotone" dataKey="y" stroke={accentColor} strokeWidth={2} fill={`url(#${gid})`} />
            {hasCompare ? (
              <Line
                type="monotone"
                dataKey="compare"
                stroke="var(--muted-foreground)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                connectNulls
              />
            ) : null}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-3 text-[11px]">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            {s.dotClassName ? <span className={cn("size-1.5 rounded-full", s.dotClassName)} /> : null}
            <span className="text-muted-foreground">{s.label}</span>
            <span className="font-semibold tabular-nums text-foreground">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** ─── “Needs attention” list with actions ───────────────────────────── */

export type AttentionListItem = {
  id: string;
  title: string;
  value: string;
  valueTone?: "default" | "warning" | "danger";
  meta?: string;
  actionLabel: string;
  onAction?: () => void;
};

export type AttentionListTemplateProps = {
  title: string;
  items: AttentionListItem[];
  className?: string;
};

const toneCls = {
  default: "text-foreground",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-red-600 dark:text-red-400",
} as const;

export function AttentionListTemplate({ title, items, className }: AttentionListTemplateProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm", className)}>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ul className="mt-4 space-y-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-3 border-b border-border/60 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className={cn("text-lg font-semibold tabular-nums", toneCls[item.valueTone ?? "default"])}>
                {item.value}
              </p>
              {item.meta ? <p className="text-xs text-muted-foreground">{item.meta}</p> : null}
            </div>
            <Button
              type="button"
              variant="outline"
              size="md"
              className="shrink-0 gap-1.5"
              onClick={item.onAction}
            >
              {item.actionLabel}
              <ExternalLink className="size-3.5 opacity-70" aria-hidden />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
