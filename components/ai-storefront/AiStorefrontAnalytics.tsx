"use client";

import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { StorefrontAnalytics } from "@/lib/ai-storefront/types";
import { LineChartCard } from "@/components/charts/LineChartCard";
import { cn } from "@/lib/utils";

const STROKE_PRIMARY = "var(--chart-1)";
const STROKE_COMPARE = "color-mix(in srgb, var(--muted-foreground) 55%, transparent)";

function formatInt(n: number): string {
  return new Intl.NumberFormat("en-IN").format(Math.round(n));
}

function DeltaBadge({ pct, invertGood }: { pct: number; invertGood?: boolean }) {
  const good = invertGood ? pct <= 0 : pct >= 0;
  const Icon = pct > 0 ? ArrowUpRight : pct < 0 ? ArrowDownRight : Minus;
  const cls = good
    ? "text-emerald-600 dark:text-emerald-400"
    : pct === 0
      ? "text-muted-foreground"
      : "text-red-600 dark:text-red-400";
  const label = pct === 0 ? "Flat" : `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums", cls)}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
      <span className="sr-only"> versus comparison period</span>
    </span>
  );
}

function CardShell({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm",
        className
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}

const channelDot: Record<string, string> = {
  chatgpt: "#0d9488",
  claude: "#c2410c",
  other: "var(--muted-foreground)",
};

export function AiStorefrontAnalytics({ analytics }: { analytics: StorefrontAnalytics }) {
  const { assistantSessions, promptVolume, mcpUptime, toolLatency, funnel, toolUsage, rangeLabel } = analytics;

  const promptData = promptVolume.map((p) => ({
    label: p.label,
    current: p.current,
    previous: p.previous ?? 0,
  }));

  const latencyData = toolLatency.series.map((p) => ({
    label: p.label,
    current: p.current,
    previous: p.previous ?? p.current,
  }));

  const uptimeData = mcpUptime.series.map((p) => ({
    label: p.label,
    pct: p.pct,
  }));

  const maxFunnel = funnel.stages[0]?.count ?? 1;

  return (
    <section className="space-y-3" aria-labelledby="ai-storefront-analytics-heading">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="ai-storefront-analytics-heading" className="text-base font-semibold tracking-tight text-foreground">
            Assistant analytics
          </h2>
          <p className="text-sm text-muted-foreground">
            How shoppers discover and buy through ChatGPT, Claude, and other AI surfaces connected to your catalogue
            via MCP.
          </p>
        </div>
        <p className="text-xs font-medium text-muted-foreground">{rangeLabel}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <CardShell
          title="AI assistant sessions"
          subtitle="Unique storefront opens attributed to each assistant family."
          action={
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
              title="Full funnel report coming soon"
            >
              View report
            </button>
          }
        >
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums tracking-tight text-foreground">
              {formatInt(assistantSessions.total)}
            </span>
            <DeltaBadge pct={assistantSessions.deltaPct} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">vs previous period · deduped per shopper per day</p>
          <ul className="mt-5 space-y-3 border-t border-border pt-4">
            {assistantSessions.byChannel.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ background: channelDot[row.id] ?? "var(--border)" }}
                    aria-hidden
                  />
                  <span className="truncate font-medium text-foreground">{row.label}</span>
                </div>
                <div className="shrink-0 text-right tabular-nums">
                  <span className="font-semibold text-foreground">{formatInt(row.sessions)}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{row.pct}%</span>
                </div>
              </li>
            ))}
          </ul>
        </CardShell>

        <div className="xl:col-span-2">
          <LineChartCard
            title="Prompt & turn volume"
            subtitle="Shopper messages and assistant turns hitting your MCP tools."
            data={promptData}
            xKey="label"
            lines={[
              { key: "current", label: "This period", color: STROKE_PRIMARY },
              { key: "previous", label: "Previous", color: STROKE_COMPARE },
            ]}
            height={220}
            formatValue={(v) => formatInt(v)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CardShell
          title="MCP uptime"
          subtitle="Availability of catalogue & checkout tools AI assistants call."
          action={<DeltaBadge pct={mcpUptime.deltaPct} />}
        >
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums text-foreground">{mcpUptime.pct.toFixed(2)}%</span>
            <span className="text-xs text-muted-foreground">rolling window</span>
          </div>
          <div className="mt-4 h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={uptimeData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="uptimeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={STROKE_PRIMARY} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={STROKE_PRIMARY} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "var(--chart-tick)" }}
                />
                <YAxis
                  domain={[98, 100.5]}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                  tick={{ fontSize: 10, fill: "var(--chart-tick)" }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                    fontSize: 12,
                    background: "var(--popover)",
                    color: "var(--popover-foreground)",
                  }}
                  formatter={(v) => [`${Number(v).toFixed(2)}%`, "Uptime"]}
                />
                <Area
                  type="monotone"
                  dataKey="pct"
                  stroke={STROKE_PRIMARY}
                  strokeWidth={2}
                  fill="url(#uptimeFill)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardShell>

        <LineChartCard
          title="MCP tool latency (P95)"
          subtitle="Round-trip for browse_cart, get_product, and checkout handoff tools."
          data={latencyData}
          xKey="label"
          lines={[
            { key: "current", label: "This period", color: STROKE_PRIMARY },
            { key: "previous", label: "Previous", color: STROKE_COMPARE },
          ]}
          height={220}
          formatValue={(v) => `${Math.round(v)} ms`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <CardShell
          className="lg:col-span-3"
          title="Chat → checkout funnel"
          subtitle="End-to-end drop-off from first open to PayGlocal checkout (attributed to AI sessions only)."
          action={
            <div className="text-right">
              <p className="text-lg font-bold tabular-nums text-foreground">{funnel.overallConversionPct}%</p>
              <DeltaBadge pct={funnel.deltaPct} />
            </div>
          }
        >
          <ul className="space-y-4">
            {funnel.stages.map((stage, i) => {
              const widthPct = maxFunnel > 0 ? Math.max(8, (stage.count / maxFunnel) * 100) : 0;
              const next = funnel.stages[i + 1];
              const stepRate =
                next && stage.count > 0 ? Math.round((next.count / stage.count) * 1000) / 10 : null;
              return (
                <li key={stage.key}>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium text-foreground">{stage.label}</span>
                    <span className="tabular-nums text-muted-foreground">{formatInt(stage.count)}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary/85 transition-all"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  {stepRate != null ? (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {stepRate}% continue to next step
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </CardShell>

        {toolUsage ? (
          <CardShell
            className="lg:col-span-2"
            title="Estimated tool usage"
            subtitle="Aggregated MCP / model token proxy (input vs output). Used for capacity planning."
            action={<DeltaBadge pct={toolUsage.deltaPct} />}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Input</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                  {formatInt(toolUsage.inputTokensThousands)}K
                </p>
                <p className="text-xs text-muted-foreground">tokens (est.)</p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Output</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                  {formatInt(toolUsage.outputTokensThousands)}K
                </p>
                <p className="text-xs text-muted-foreground">tokens (est.)</p>
              </div>
            </div>
            <div className="mt-5 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
              Billed usage may differ by assistant provider. PayGlocal reconciles checkout events independently of token
              counts.
            </div>
          </CardShell>
        ) : null}
      </div>
    </section>
  );
}
