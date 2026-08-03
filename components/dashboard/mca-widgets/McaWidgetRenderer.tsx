"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import { McaCountryInsightsWidget } from "./McaCountryInsightsWidget";
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
import { StandardChartTooltip } from "@/components/charts/StandardChartTooltip";
import { ChartSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { McaWidgetId } from "@/lib/mca-widget-catalog";

const BRAND      = "#0061E3";
const BRAND_SOFT = "#93c5fd";
const PURPLE     = "#7c3aed";
const EMERALD    = "#10b981";
const AMBER      = "#f59e0b";

const cardClass = "bg-card text-card-foreground rounded-xl border border-border shadow-sm";

/* ── Sparkline ─────────────────────────────────────────────────────────────── */
function Sparkline({ data, color = BRAND, uid }: { data: number[]; color?: string; uid: string }) {
  const gradId = `mca-spark-${uid}`;
  const d = data.map((v, i) => ({ i, v }));
  return (
    <div className="flex-shrink-0 rounded-lg" style={{ width: "44%", height: 52, minWidth: 88 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={d} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.22} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip contentStyle={{ display: "none" }} cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "3 3", opacity: 0.3 }} />
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#${gradId})`}
            dot={false} activeDot={{ r: 3, fill: color, strokeWidth: 0 }}
            animationDuration={650} animationEasing="ease-out" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── KPI block ─────────────────────────────────────────────────────────────── */
function KpiBlock({
  title, valueLabel, change, changeUnit = "percent", changeLabel = "vs last month",
  subtitle, spark, sparkColor, preview, isLoading,
}: {
  title: string; valueLabel: string; change?: number; changeUnit?: "percent" | "pts";
  changeLabel?: string; subtitle?: string; spark: number[]; sparkColor?: string;
  preview?: boolean; isLoading?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  if (isLoading && !preview) {
    return (
      <div className={cn(cardClass, "p-5 flex flex-col gap-2")}>
        <div className="h-3 w-32 bg-muted rounded animate-pulse" />
        <div className="h-9 w-40 bg-muted rounded-md animate-pulse mt-3" />
        <div className="flex justify-between gap-2 mt-1">
          <div className="h-4 w-28 bg-muted rounded animate-pulse" />
          <div className="h-[52px] flex-1 max-w-[44%] bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }
  const isPositive = change !== undefined && change >= 0;
  return (
    <motion.div
      initial={preview ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(cardClass, "p-5 flex flex-col gap-2 h-full")}
    >
      <span className="text-[13px] font-normal text-muted-foreground">{title}</span>
      <div className="text-[1.5rem] sm:text-[1.9rem] font-bold text-foreground leading-none tracking-tight tabular-nums mt-3">
        {valueLabel}
      </div>
      <div className="flex items-end gap-2 mt-1 min-h-[52px]">
        <div className="flex flex-col gap-1 flex-1 min-w-0 justify-end pb-0.5">
          {change !== undefined ? (
            <div className={cn("flex items-center gap-1 text-[12px] font-semibold whitespace-nowrap flex-wrap",
              isPositive ? "text-emerald-600" : "text-red-500")}>
              {isPositive
                ? <TrendingUp style={{ width: 13, height: 13 }} className="shrink-0" />
                : <TrendingDown style={{ width: 13, height: 13 }} className="shrink-0" />}
              <span>{isPositive && change > 0 ? "+" : ""}{change}{changeUnit === "percent" ? "%" : " pts"}</span>
              <span className="text-muted-foreground font-normal text-[11px]">{changeLabel}</span>
            </div>
          ) : subtitle ? (
            <span className="text-[11px] text-muted-foreground">{subtitle}</span>
          ) : null}
        </div>
        <Sparkline data={spark} color={sparkColor ?? BRAND} uid={uid} />
      </div>
    </motion.div>
  );
}

/* ── Chart card frame ──────────────────────────────────────────────────────── */
function ChartFrame({ title, subtitle, children, minHeight, className }: {
  title: string; subtitle?: string; children: React.ReactNode; minHeight?: string; className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      className={cn("rounded-xl px-5 pt-4 pb-3", cardClass, minHeight, className)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </motion.div>
  );
}

/* ── Mock data ─────────────────────────────────────────────────────────────── */
const invoiceTrendData = [
  { month: "Jan", paid: 48, outstanding: 12 },
  { month: "Feb", paid: 62, outstanding: 8  },
  { month: "Mar", paid: 55, outstanding: 14 },
  { month: "Apr", paid: 74, outstanding: 10 },
  { month: "May", paid: 81, outstanding: 7  },
  { month: "Jun", paid: 68, outstanding: 11 },
  { month: "Jul", paid: 9,  outstanding: 4  },
];

const currencySplitData = [
  { key: "usd", label: "USD", value: 52, color: BRAND },
  { key: "eur", label: "EUR", value: 22, color: PURPLE },
  { key: "gbp", label: "GBP", value: 13, color: EMERALD },
  { key: "sgd", label: "SGD", value: 8,  color: AMBER },
  { key: "other", label: "Other", value: 5, color: "#94a3b8" },
];

const clientRevenueData = [
  { name: "Acme Corp",        revenue: 1631 },
  { name: "GlobalTech",       revenue: 1233 },
  { name: "Nordic Solutions", revenue: 978  },
  { name: "Pacific Trade",    revenue: 880  },
  { name: "Meridian",         revenue: 614  },
];

const invoiceAgingData = [
  { bucket: "0-15d",  count: 14, color: EMERALD },
  { bucket: "16-30d", count: 8,  color: AMBER   },
  { bucket: "31-60d", count: 5,  color: "#f97316"},
  { bucket: "60d+",   count: 3,  color: "#ef4444"},
];

const fxRateData = [
  { date: "Jun 1",  usd: 83.2, eur: 89.8 },
  { date: "Jun 8",  usd: 83.5, eur: 90.1 },
  { date: "Jun 15", usd: 84.1, eur: 90.8 },
  { date: "Jun 22", usd: 83.8, eur: 90.3 },
  { date: "Jun 29", usd: 84.4, eur: 91.2 },
  { date: "Jul 1",  usd: 84.2, eur: 91.0 },
];

const monthlyReceiptsData = [
  { month: "Feb", received: 2.1, settled: 1.9 },
  { month: "Mar", received: 2.8, settled: 2.6 },
  { month: "Apr", received: 3.2, settled: 3.0 },
  { month: "May", received: 3.9, settled: 3.7 },
  { month: "Jun", received: 2.4, settled: 2.2 },
  { month: "Jul", received: 0.7, settled: 0.5 },
];

/* ── Main renderer ─────────────────────────────────────────────────────────── */
export function McaWidgetRenderer({ widgetId, preview, isLoading }: {
  widgetId: McaWidgetId; preview?: boolean; isLoading?: boolean;
}) {
  switch (widgetId) {

    /* ── Invoice KPIs ── */
    case "mca_total_invoiced_kpi":
      return <KpiBlock preview={preview} isLoading={isLoading}
        title="Total invoiced" valueLabel={preview ? "$298K" : "$2,97,600"}
        change={18} changeLabel="vs last month"
        spark={[120, 145, 138, 162, 175, 168, 190, 210, 205, 225, 240, 298]} />;

    case "mca_outstanding_kpi":
      return <KpiBlock preview={preview} isLoading={isLoading}
        title="Outstanding amount" valueLabel={preview ? "$41K" : "$41,500"}
        change={-8} changeLabel="vs last month" sparkColor="#f59e0b"
        spark={[60, 55, 58, 52, 50, 48, 52, 45, 44, 43, 42, 41]} />;

    case "mca_invoices_count_kpi":
      return <KpiBlock preview={preview} isLoading={isLoading}
        title="Active invoices" valueLabel={preview ? "34" : "34"}
        change={6} changeLabel="vs last month"
        spark={[22, 24, 26, 25, 28, 27, 30, 29, 31, 32, 33, 34]} />;

    case "mca_overdue_kpi":
      return <KpiBlock preview={preview} isLoading={isLoading}
        title="Overdue invoices" valueLabel={preview ? "5" : "5"}
        change={-2} changeLabel="vs last month" sparkColor="#ef4444"
        spark={[9, 8, 8, 7, 7, 8, 6, 7, 6, 6, 5, 5]} />;

    case "mca_collection_rate_kpi":
      return <KpiBlock preview={preview} isLoading={isLoading}
        title="Collection rate" valueLabel={preview ? "88%" : "88.2%"}
        change={3.1} changeUnit="pts" changeLabel="vs last month"
        spark={[80, 81, 82, 81, 83, 84, 84, 85, 86, 87, 88, 88]} />;

    case "mca_avg_invoice_kpi":
      return <KpiBlock preview={preview} isLoading={isLoading}
        title="Avg invoice value" valueLabel={preview ? "$4.2K" : "$4,200"}
        subtitle="Per issued invoice"
        spark={[38, 39, 40, 39, 41, 40, 42, 41, 42, 43, 42, 42]} />;

    /* ── Payments KPIs ── */
    case "mca_avg_pay_time_kpi":
      return <KpiBlock preview={preview} isLoading={isLoading}
        title="Avg payment time" valueLabel={preview ? "11d" : "11 days"}
        change={-1} changeUnit="pts" changeLabel="faster vs last month"
        spark={[15, 14, 14, 13, 13, 12, 13, 12, 12, 11, 11, 11]} />;

    case "mca_next_settlement_kpi":
      return <KpiBlock preview={preview} isLoading={isLoading}
        title="Next settlement" valueLabel={preview ? "₹1.2L" : "₹1,24,890"}
        subtitle="Settles Jul 3, 12:00 AM IST"
        spark={[80, 90, 95, 100, 105, 110, 112, 115, 118, 120, 122, 125]} />;

    /* ── FX & Currency KPIs ── */
    case "mca_fx_realized_kpi":
      return <KpiBlock preview={preview} isLoading={isLoading}
        title="FX rate realized" valueLabel={preview ? "84.2" : "84.22"}
        subtitle="USD/INR blended this month" sparkColor={PURPLE}
        spark={[83.2, 83.5, 83.8, 84.1, 83.9, 84.2, 84.0, 84.3, 84.1, 84.4, 84.2, 84.22]} />;

    case "mca_top_currency_kpi":
      return <KpiBlock preview={preview} isLoading={isLoading}
        title="Top currency" valueLabel={preview ? "USD" : "USD"}
        subtitle="52% of total received volume"
        spark={[48, 50, 51, 49, 52, 51, 53, 52, 52, 53, 52, 52]} />;

    case "mca_pending_conversion_kpi":
      return <KpiBlock preview={preview} isLoading={isLoading}
        title="Pending conversion" valueLabel={preview ? "$18K" : "$18,200"}
        change={-12} changeLabel="vs last week" sparkColor={AMBER}
        spark={[30, 28, 26, 24, 22, 25, 23, 21, 20, 19, 18, 18]} />;

    case "mca_fx_gain_loss_kpi":
      return <KpiBlock preview={preview} isLoading={isLoading}
        title="FX gain / loss" valueLabel={preview ? "+₹8.4K" : "+₹8,420"}
        change={2.3} changeLabel="of total received" sparkColor={EMERALD}
        spark={[2, 3, 4, 3, 5, 4, 6, 5, 7, 7, 8, 8]} />;

    /* ── Clients KPIs ── */
    case "mca_active_clients_kpi":
      return <KpiBlock preview={preview} isLoading={isLoading}
        title="Active clients" valueLabel={preview ? "26" : "26"}
        change={4} changeLabel="vs last month"
        spark={[18, 19, 20, 20, 21, 22, 22, 23, 24, 25, 25, 26]} />;

    case "mca_new_clients_kpi":
      return <KpiBlock preview={preview} isLoading={isLoading}
        title="New clients" valueLabel={preview ? "3" : "3"}
        subtitle="Added this month"
        spark={[1, 2, 1, 2, 2, 3, 2, 3, 3, 2, 3, 3]} />;

    case "mca_client_concentration_kpi":
      return <KpiBlock preview={preview} isLoading={isLoading}
        title="Client concentration" valueLabel={preview ? "40%" : "40%"}
        subtitle="Top client's share of revenue"
        spark={[44, 43, 42, 43, 41, 42, 41, 40, 41, 40, 40, 40]} />;

    /* ── Compliance KPIs ── */
    case "mca_ebrc_pending_kpi":
      return <KpiBlock preview={preview} isLoading={isLoading}
        title="eBRC pending" valueLabel={preview ? "7" : "7"}
        change={-3} changeLabel="resolved this month" sparkColor={AMBER}
        spark={[14, 13, 12, 12, 11, 10, 10, 9, 9, 8, 7, 7]} />;

    /* ── Charts ── */
    case "mca_charts_invoice_trend": {
      if (isLoading && !preview) return <div className={cn(cardClass, "px-5 pt-4 pb-3 min-h-[260px]")}><ChartSkeleton /></div>;
      const data = preview ? invoiceTrendData.map((d) => ({ ...d, paid: Math.round(d.paid * 0.5), outstanding: Math.round(d.outstanding * 0.5) })) : invoiceTrendData;
      return (
        <ChartFrame title="Invoice trend" subtitle="Paid vs outstanding invoices by month" minHeight="min-h-[260px]">
          <div className="h-[200px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #e5e7eb)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--chart-tick, #9ca3af)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--chart-tick, #9ca3af)" }} axisLine={false} tickLine={false} />
                <Tooltip content={(props) => <StandardChartTooltip {...props} />} cursor={{ fill: "rgba(0,97,227,0.04)" }} />
                <Bar dataKey="paid" name="Paid" fill={BRAND} radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="outstanding" name="Outstanding" fill={BRAND_SOFT} radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartFrame>
      );
    }

    case "mca_charts_currency_split": {
      if (isLoading && !preview) return <div className={cn(cardClass, "px-5 pt-4 pb-3 min-h-[220px]")}><ChartSkeleton /></div>;
      return (
        <ChartFrame title="Currency split" subtitle="Share of total received by currency" minHeight="min-h-[220px]">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="w-[120px] h-[120px] shrink-0 mx-auto sm:mx-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={(props) => <StandardChartTooltip {...props} formatValue={(v) => `${v}%`} />} cursor={false} />
                  <Pie data={currencySplitData} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius={34} outerRadius={54} paddingAngle={2}>
                    {currencySplitData.map((e) => <Cell key={e.key} fill={e.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 min-w-[120px] space-y-2 text-xs">
              {currencySplitData.map((e) => (
                <li key={e.key} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: e.color }} />
                    {e.label}
                  </span>
                  <span className="font-semibold text-foreground tabular-nums">{e.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </ChartFrame>
      );
    }

    case "mca_charts_client_revenue": {
      if (isLoading && !preview) return <div className={cn(cardClass, "px-5 pt-4 pb-3 min-h-[240px]")}><ChartSkeleton /></div>;
      const data = preview ? clientRevenueData.map((d) => ({ ...d, revenue: Math.round(d.revenue * 0.5) })) : clientRevenueData;
      return (
        <ChartFrame title="Client revenue" subtitle="Total billed per client ($K)" minHeight="min-h-[240px]">
          <div className="h-[185px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--chart-tick, #9ca3af)" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--chart-tick, #9ca3af)" }} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={(props) => <StandardChartTooltip {...props} formatValue={(v) => `$${v}K`} />} cursor={{ fill: "rgba(0,97,227,0.04)" }} />
                <Bar dataKey="revenue" name="Revenue ($K)" fill={BRAND} radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartFrame>
      );
    }

    case "mca_charts_invoice_aging": {
      if (isLoading && !preview) return <div className={cn(cardClass, "px-5 pt-4 pb-3 min-h-[240px]")}><ChartSkeleton /></div>;
      return (
        <ChartFrame title="Invoice aging" subtitle="Overdue bucket distribution" minHeight="min-h-[240px]">
          <div className="h-[185px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={invoiceAgingData} margin={{ top: 4, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #e5e7eb)" vertical={false} />
                <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: "var(--chart-tick, #9ca3af)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--chart-tick, #9ca3af)" }} axisLine={false} tickLine={false} />
                <Tooltip content={(props) => <StandardChartTooltip {...props} />} cursor={{ fill: "rgba(0,97,227,0.04)" }} />
                <Bar dataKey="count" name="Invoices" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {invoiceAgingData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartFrame>
      );
    }

    case "mca_charts_fx_rate_trend": {
      if (isLoading && !preview) return <div className={cn(cardClass, "px-5 pt-4 pb-3 min-h-[240px]")}><ChartSkeleton /></div>;
      return (
        <ChartFrame title="FX rate trend" subtitle="USD/INR and EUR/INR — last 30 days" minHeight="min-h-[240px]">
          <div className="h-[185px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fxRateData} margin={{ top: 4, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #e5e7eb)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--chart-tick, #9ca3af)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[82, 92]} tick={{ fontSize: 11, fill: "var(--chart-tick, #9ca3af)" }} axisLine={false} tickLine={false} />
                <Tooltip content={(props) => <StandardChartTooltip {...props} formatValue={(v) => `₹${v}`} />}
                  cursor={{ stroke: BRAND, strokeWidth: 1, strokeDasharray: "3 3", opacity: 0.35 }} />
                <Line type="monotone" dataKey="usd" name="USD/INR" stroke={BRAND} strokeWidth={2.25} dot={false}
                  activeDot={{ r: 4, strokeWidth: 0, fill: BRAND }} />
                <Line type="monotone" dataKey="eur" name="EUR/INR" stroke={PURPLE} strokeWidth={2} strokeDasharray="5 4"
                  dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: PURPLE }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartFrame>
      );
    }

    case "mca_charts_monthly_receipts": {
      if (isLoading && !preview) return <div className={cn(cardClass, "px-5 pt-4 pb-3 min-h-[240px]")}><ChartSkeleton /></div>;
      const data = preview ? monthlyReceiptsData.map((d) => ({ ...d, received: +(d.received * 0.5).toFixed(1), settled: +(d.settled * 0.5).toFixed(1) })) : monthlyReceiptsData;
      return (
        <ChartFrame title="Monthly receipts" subtitle="Received vs settled ($M)" minHeight="min-h-[240px]">
          <div className="h-[185px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #e5e7eb)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--chart-tick, #9ca3af)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--chart-tick, #9ca3af)" }} axisLine={false} tickLine={false} />
                <Tooltip content={(props) => <StandardChartTooltip {...props} formatValue={(v) => `$${v}M`} />} cursor={{ fill: "rgba(0,97,227,0.04)" }} />
                <Bar dataKey="received" name="Received" fill={BRAND} radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="settled" name="Settled" fill={BRAND_SOFT} radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartFrame>
      );
    }

    case "mca_charts_invoice_origins":
      return <McaCountryInsightsWidget preview={preview} />;

    default:
      return null;
  }
}
