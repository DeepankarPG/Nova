"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import { PaymentFlowSankeyWidget } from "./PaymentFlowSankeyWidget";
import { AbandonmentRadarWidget } from "./AbandonmentRadarWidget";
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
import { BarChartCard } from "@/components/charts/BarChartCard";
import { StandardChartTooltip } from "@/components/charts/StandardChartTooltip";
import { CountryInsightsMap } from "@/components/dashboard/CountryInsightsMap";
import { ChartSkeleton } from "@/components/ui/skeleton";
import { useChartBarTrackFill } from "@/hooks/useChartBarTrackFill";
import { cn } from "@/lib/utils";
import type { WidgetId } from "@/lib/dashboard-widget-catalog";
import {
  countryInsights,
  dashboardStats,
  dashboardWidgetKpis,
  hourlyTraffic,
  indiaStateInsights,
  inrVsFxSplit,
  monthlyVolume,
  netVsGrossWeekly,
  paymentFailureReasons,
  paymentMethodSplit,
  settlementSpeedBuckets,
  todaysAnalytics,
  topCustomersBySpend,
  walletStats,
  weeklyUpiVsCard,
} from "@/lib/mock-data";
import { StateInsightsList } from "./StateInsightsList";

const BRAND = "#0061E3";
const BRAND_SOFT = "#93c5fd";

const cardClass =
  "bg-card text-card-foreground rounded-xl border border-border shadow-sm";

/** Matches StatCard sparkline: gradient area, dashed cursor, brand stroke */
function StatStyleSparkline({ data, lineColor = BRAND, uid }: { data: number[]; lineColor?: string; uid: string }) {
  const sparkData = data.map((v, i) => ({ i, v }));
  const gradId = `w-spark-${uid}`;
  return (
    <div className="flex-shrink-0 rounded-lg" style={{ width: "44%", height: 52, minWidth: 88 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={sparkData} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity={0.22} />
              <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
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
            fill={`url(#${gradId})`}
            dot={false}
            activeDot={{ r: 3, fill: lineColor, strokeWidth: 0 }}
            animationDuration={650}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function KpiBlock({
  title,
  valueLabel,
  change,
  changeUnit = "percent",
  changeLabel = "vs last period",
  subtitle,
  spark,
  preview,
  isLoading,
}: {
  title: string;
  valueLabel: string;
  change?: number;
  changeUnit?: "percent" | "pts";
  changeLabel?: string;
  subtitle?: string;
  spark: number[];
  preview?: boolean;
  isLoading?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const sparkData = spark;

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
      className={cn(cardClass, "p-5 flex flex-col gap-2 cursor-inherit h-full")}
    >
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-normal text-muted-foreground">{title}</span>
      </div>

      <div className="text-[1.5rem] sm:text-[1.9rem] font-bold text-foreground leading-none tracking-tight tabular-nums mt-3">
        {valueLabel}
      </div>

      <div className="flex items-end gap-2 mt-1 min-h-[52px]">
        <div className="flex flex-col gap-1 flex-1 min-w-0 justify-end pb-0.5">
          {change !== undefined ? (
            <div
              className={cn(
                "flex items-center gap-1 text-[12px] font-semibold whitespace-nowrap flex-wrap",
                isPositive ? "text-emerald-600" : "text-red-500"
              )}
            >
              {isPositive ? (
                <TrendingUp style={{ width: 13, height: 13 }} className="shrink-0" />
              ) : (
                <TrendingDown style={{ width: 13, height: 13 }} className="shrink-0" />
              )}
              <span>
                {isPositive && change > 0 ? "+" : ""}
                {change}
                {changeUnit === "percent" ? "%" : " pts"}
              </span>
              <span className="text-muted-foreground font-normal text-[11px]">{changeLabel}</span>
            </div>
          ) : subtitle ? (
            <span className="text-[11px] text-muted-foreground">{subtitle}</span>
          ) : null}
        </div>
        <StatStyleSparkline data={sparkData} uid={uid} />
      </div>
    </motion.div>
  );
}

function fmtInr(n: number) {
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function ChartCardFrame({
  title,
  subtitle,
  children,
  className,
  minHeight,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  minHeight?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
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

function PieSplitCard({
  title,
  subtitle,
  data,
  preview,
  isLoading,
}: {
  title: string;
  subtitle?: string;
  data: { key: string; label: string; value: number; color: string }[];
  preview?: boolean;
  isLoading?: boolean;
}) {
  if (isLoading && !preview) {
    return (
      <div className={cn(cardClass, "px-5 pt-4 pb-3 min-h-[220px]")}>
        <ChartSkeleton />
      </div>
    );
  }
  return (
    <ChartCardFrame title={title} subtitle={subtitle} minHeight="min-h-[220px]">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="w-[128px] h-[128px] shrink-0 mx-auto sm:mx-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={(props) => <StandardChartTooltip {...props} formatValue={(v) => `${v}%`} />}
                cursor={false}
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={56}
                paddingAngle={2}
              >
                {data.map((e) => (
                  <Cell key={e.key} fill={e.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="flex-1 min-w-[140px] space-y-2 text-xs">
          {data.map((e) => (
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
    </ChartCardFrame>
  );
}

export function DashboardWidgetRenderer({
  widgetId,
  preview,
  isLoading,
}: {
  widgetId: WidgetId;
  preview?: boolean;
  isLoading?: boolean;
}) {
  const chartBarTrackFill = useChartBarTrackFill();
  switch (widgetId) {
    case "payments_successful_kpi":
      return (
        <KpiBlock
          preview={preview}
          isLoading={isLoading}
          title="Successful Payments"
          valueLabel={preview ? "₹8.2L" : fmtInr(dashboardStats.successfulPayments.value)}
          change={preview ? 12.4 : dashboardStats.successfulPayments.change}
          spark={[42, 55, 48, 60, 53, 70, 65, 78, 72, 88, 84, 95]}
        />
      );
    case "payments_attempts_kpi":
      return (
        <KpiBlock
          preview={preview}
          isLoading={isLoading}
          title="Payment Attempts"
          valueLabel={preview ? "364" : String(dashboardWidgetKpis.paymentAttempts.value)}
          change={preview ? 4.8 : dashboardWidgetKpis.paymentAttempts.change}
          spark={[30, 38, 42, 40, 48, 52, 50, 58, 55, 60, 62, 64]}
        />
      );
    case "payments_success_rate_kpi":
      return (
        <KpiBlock
          preview={preview}
          isLoading={isLoading}
          title="Success rate"
          valueLabel={preview ? "94.2%" : `${dashboardWidgetKpis.successRate.value}%`}
          change={preview ? 1.1 : dashboardWidgetKpis.successRate.change}
          changeUnit="pts"
          changeLabel="vs prior"
          spark={[88, 89, 90, 91, 92, 93, 93, 94, 94, 94, 94, 94]}
        />
      );
    case "payments_avg_ticket_kpi":
      return (
        <KpiBlock
          preview={preview}
          isLoading={isLoading}
          title="Average ticket size"
          valueLabel={preview ? "₹2.5K" : fmtInr(dashboardWidgetKpis.avgTicket.value)}
          subtitle="Per successful capture"
          spark={[22, 23, 24, 23, 25, 24, 26, 25, 27, 26, 28, 25]}
        />
      );
    case "payments_refunds_kpi":
      return (
        <KpiBlock
          preview={preview}
          isLoading={isLoading}
          title="Refunds"
          valueLabel={preview ? "₹18.4K" : fmtInr(dashboardWidgetKpis.refunds.value)}
          change={preview ? -2.3 : dashboardWidgetKpis.refunds.change}
          spark={[20, 22, 21, 23, 22, 20, 19, 18, 18, 17, 18, 18]}
        />
      );
    case "payments_failed_kpi":
      return (
        <KpiBlock
          preview={preview}
          isLoading={isLoading}
          title="Failed payments"
          valueLabel={preview ? "22" : String(dashboardWidgetKpis.failedPayments.value)}
          change={preview ? -8 : dashboardWidgetKpis.failedPayments.change}
          spark={[35, 32, 30, 28, 26, 24, 23, 22, 22, 22, 21, 22]}
        />
      );
    case "charts_monthly_volume":
      if (isLoading && !preview) {
        return (
          <div className={cn(cardClass, "px-5 pt-4 pb-3 min-h-[260px]")}>
            <ChartSkeleton />
          </div>
        );
      }
      return (
        <BarChartCard
          title="Monthly Volume"
          subtitle="Payment volume vs settlements"
          data={preview ? monthlyVolume.map((m) => ({ ...m, volume: m.volume * 0.3 + 100000 })) : monthlyVolume}
          xKey="month"
          bars={[
            { key: "volume", label: "Volume", color: BRAND },
            { key: "settlements", label: "Settled", color: BRAND_SOFT },
          ]}
          formatValue={(v) => `₹${(v / 100000).toFixed(1)}L`}
          isLoading={false}
          height={220}
          className="h-full"
        />
      );
    case "charts_gross_volume_split": {
      if (isLoading && !preview) {
        return (
          <div className={cn(cardClass, "px-5 pt-4 pb-3 min-h-[260px]")}>
            <ChartSkeleton />
          </div>
        );
      }
      const base = preview ? monthlyVolume.map((m) => ({ ...m, volume: m.volume * 0.3 + 100000 })) : monthlyVolume;
      const splitData = base.map((m, i) => {
        const internationalShare = 0.22 + (i % 3) * 0.015;
        const international = Math.round(m.volume * internationalShare);
        const domestic = Math.max(0, Math.round(m.volume - international));
        return { month: m.month, domestic, international };
      });
      return (
        <BarChartCard
          title="Gross volume split"
          subtitle="International vs domestic capture volume"
          data={splitData}
          xKey="month"
          bars={[
            { key: "domestic", label: "Domestic", color: BRAND_SOFT },
            { key: "international", label: "International", color: BRAND },
          ]}
          formatValue={(v) => `₹${(v / 100000).toFixed(1)}L`}
          isLoading={false}
          height={220}
          className="h-full"
        />
      );
    }
    case "charts_hourly_traffic":
      if (isLoading && !preview) {
        return (
          <div className={cn(cardClass, "px-5 pt-4 pb-3 min-h-[240px]")}>
            <ChartSkeleton />
          </div>
        );
      }
      const ht = preview
        ? hourlyTraffic.map((d) => ({ ...d, v: Math.round(d.v * 0.4 + 5) }))
        : hourlyTraffic;
      return (
        <ChartCardFrame title="Hourly traffic" subtitle="Sessions by hour (IST)" minHeight="min-h-[240px]">
          <div className="h-[188px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ht}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis
                  dataKey="t"
                  tick={{ fontSize: 11, fill: "var(--chart-tick)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  content={(props) => <StandardChartTooltip {...props} />}
                  cursor={{ stroke: BRAND, strokeWidth: 1, strokeDasharray: "3 3", opacity: 0.35 }}
                />
                <Line
                  type="monotone"
                  dataKey="v"
                  name="Sessions"
                  stroke={BRAND}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: BRAND, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCardFrame>
      );
    case "charts_payment_split":
      return (
        <PieSplitCard
          title="Payment method split"
          subtitle="Share of successful volume"
          data={paymentMethodSplit}
          preview={preview}
          isLoading={isLoading}
        />
      );
    case "charts_upi_vs_card_weekly":
      if (isLoading && !preview) {
        return (
          <div className={cn(cardClass, "px-5 pt-4 pb-3 min-h-[260px]")}>
            <ChartSkeleton />
          </div>
        );
      }
      return (
        <BarChartCard
          title="UPI vs Card (weekly)"
          subtitle="Rail mix — SMB India view"
          data={weeklyUpiVsCard}
          xKey="week"
          bars={[
            { key: "upi", label: "UPI", color: BRAND },
            { key: "card", label: "Card", color: BRAND_SOFT },
          ]}
          formatValue={(v) => `₹${(v / 1000).toFixed(0)}K`}
          isLoading={false}
          height={200}
          className="h-full"
        />
      );
    case "charts_net_vs_gross":
      if (isLoading && !preview) {
        return (
          <div className={cn(cardClass, "px-5 pt-4 pb-3 min-h-[260px]")}>
            <ChartSkeleton />
          </div>
        );
      }
      return (
        <BarChartCard
          title="Net vs gross"
          subtitle="After MDR & taxes vs captured volume"
          data={netVsGrossWeekly}
          xKey="label"
          bars={[
            { key: "gross", label: "Gross", color: BRAND_SOFT },
            { key: "net", label: "Net", color: BRAND },
          ]}
          formatValue={(v) => `₹${(v / 1000).toFixed(0)}K`}
          isLoading={false}
          height={200}
          className="h-full"
        />
      );
    case "charts_inr_fx_split":
      return (
        <PieSplitCard
          title="INR vs FX volume"
          subtitle="Domestic settlements vs multi-currency"
          data={inrVsFxSplit}
          preview={preview}
          isLoading={isLoading}
        />
      );
    case "charts_settlement_lag":
      if (isLoading && !preview) {
        return (
          <div className={cn(cardClass, "px-5 pt-4 pb-3 min-h-[240px]")}>
            <ChartSkeleton />
          </div>
        );
      }
      return (
        <ChartCardFrame
          title="Settlement speed (T+N)"
          subtitle="% of volume by working-day lag"
          minHeight="min-h-[240px]"
        >
          <div className="h-[188px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={settlementSpeedBuckets}
                barCategoryGap="18%"
                margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis
                  dataKey="bucket"
                  tick={{ fontSize: 11, fill: "var(--chart-tick)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "var(--chart-tick)" }}
                  tickFormatter={(v) => `${v}%`}
                  width={36}
                />
                <Tooltip
                  content={(props) => <StandardChartTooltip {...props} formatValue={(v) => `${v}%`} />}
                  cursor={{ fill: "var(--chart-cursor)", radius: 4 }}
                />
                <Bar
                  dataKey="pct"
                  name="Share"
                  fill={BRAND}
                  radius={[5, 5, 0, 0]}
                  background={{ fill: chartBarTrackFill }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCardFrame>
      );
    case "charts_decline_reasons": {
      if (isLoading && !preview) {
        return (
          <div className={cn(cardClass, "px-5 pt-4 pb-3 min-h-[260px]")}>
            <ChartSkeleton />
          </div>
        );
      }
      const maxCount = Math.max(...paymentFailureReasons.map((d) => d.count), 1);
      return (
        <ChartCardFrame title="Decline reasons" subtitle="Top failure codes — last 30 days" minHeight="min-h-[260px]">
          <div className="h-[220px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={paymentFailureReasons}
                margin={{ left: 4, right: 16, top: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
                <XAxis type="number" domain={[0, maxCount]} hide />
                <YAxis
                  type="category"
                  dataKey="reason"
                  width={124}
                  tick={{ fontSize: 10, fill: "var(--chart-tick)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={(props) => <StandardChartTooltip {...props} />}
                  cursor={{ fill: "var(--chart-cursor)", radius: 4 }}
                />
                <Bar
                  dataKey="count"
                  name="Count"
                  fill={BRAND}
                  radius={[0, 4, 4, 0]}
                  barSize={14}
                  background={{ fill: chartBarTrackFill }}
                  isAnimationActive={!preview}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCardFrame>
      );
    }
    case "settlements_due_kpi":
      return (
        <KpiBlock
          preview={preview}
          isLoading={isLoading}
          title="Settlements due"
          valueLabel={preview ? "₹1.2L" : fmtInr(dashboardStats.settlementsDue.value)}
          change={preview ? -3.2 : dashboardStats.settlementsDue.change}
          spark={[80, 75, 82, 70, 74, 68, 72, 65, 70, 63, 68, 58]}
        />
      );
    case "settlements_today_kpi":
      return (
        <KpiBlock
          preview={preview}
          isLoading={isLoading}
          title="Settled today"
          valueLabel={preview ? "₹4.1L" : fmtInr(dashboardWidgetKpis.settledToday.value)}
          subtitle="Cleared to bank"
          spark={[20, 28, 35, 40, 48, 52, 55, 50, 58, 62, 60, 65]}
        />
      );
    case "settlements_next_date":
      if (isLoading && !preview) {
        return (
          <div className={cn(cardClass, "p-5 min-h-[120px]")}>
            <div className="h-20 bg-muted rounded-lg animate-pulse" />
          </div>
        );
      }
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={cn(cardClass, "p-5 flex flex-col gap-2 h-full")}
        >
          <span className="text-[13px] font-normal text-muted-foreground">Next settlement</span>
          <p className="text-xs text-muted-foreground -mt-1">Auto-settlement schedule</p>
          <p className="text-[1.35rem] sm:text-[1.65rem] font-bold text-foreground leading-tight tracking-tight mt-2">
            {preview ? "Mar 21 · 11:00 AM" : dashboardWidgetKpis.nextSettlementLabel}
          </p>
          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
            Auto-settlement at mid-market FX. Funds typically arrive same business day.
          </p>
        </motion.div>
      );
    case "customers_active_kpi":
      return (
        <KpiBlock
          preview={preview}
          isLoading={isLoading}
          title="Active customers"
          valueLabel={preview ? "1,284" : dashboardWidgetKpis.activeCustomers.value.toLocaleString("en-IN")}
          change={preview ? 6.2 : dashboardWidgetKpis.activeCustomers.change}
          spark={[900, 950, 980, 1010, 1040, 1080, 1120, 1150, 1180, 1220, 1260, 1284]}
        />
      );
    case "customers_new_kpi":
      return (
        <KpiBlock
          preview={preview}
          isLoading={isLoading}
          title="New customers"
          valueLabel={preview ? "42" : String(dashboardWidgetKpis.newCustomers.value)}
          change={preview ? 12 : dashboardWidgetKpis.newCustomers.change}
          spark={[12, 15, 18, 20, 22, 25, 28, 30, 34, 36, 40, 42]}
        />
      );
    case "customers_repeat_kpi":
      return (
        <KpiBlock
          preview={preview}
          isLoading={isLoading}
          title="Repeat rate"
          valueLabel={preview ? "38.5%" : `${dashboardWidgetKpis.repeatRate.value}%`}
          change={preview ? 0.4 : dashboardWidgetKpis.repeatRate.change}
          changeUnit="pts"
          changeLabel="vs prior"
          spark={[32, 33, 34, 35, 35, 36, 36, 37, 37, 38, 38, 39]}
        />
      );
    case "customers_country_insights":
      return (
        <CountryInsightsMap
          data={countryInsights}
          isLoading={isLoading && !preview}
          className="h-full min-h-[280px]"
          staticPeriodControl={preview}
        />
      );
    case "customers_state_insights":
      return (
        <StateInsightsList
          data={indiaStateInsights}
          isLoading={isLoading && !preview}
          className="h-full min-h-[280px]"
          staticPeriodControl={preview}
        />
      );
    case "customers_top_table":
      if (isLoading && !preview) {
        return (
          <div className={cn(cardClass, "p-5 min-h-[200px]")}>
            <div className="h-4 w-40 bg-muted rounded mb-4 animate-pulse" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
        );
      }
      const rows = preview
        ? topCustomersBySpend.map((r, i) => ({ ...r, total: r.total * 0.2 + i * 1000 }))
        : topCustomersBySpend;
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={cn("rounded-xl p-5 overflow-x-auto", cardClass)}
        >
          <span className="text-[13px] font-normal text-muted-foreground">Top customers by spend</span>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">Last 90 days</p>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="pb-2 font-medium">Customer</th>
                <th className="pb-2 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.email} className="border-b border-border/60 last:border-0">
                  <td className="py-2 pr-2">
                    <div className="font-medium text-foreground">{r.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">{r.email}</div>
                  </td>
                  <td className="py-2 text-right font-semibold text-foreground whitespace-nowrap">{fmtInr(r.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      );
    case "risk_open_disputes_kpi":
      return (
        <KpiBlock
          preview={preview}
          isLoading={isLoading}
          title="Open disputes"
          valueLabel={preview ? "₹14.2K" : fmtInr(dashboardStats.openDisputes.value)}
          subtitle="At risk"
          spark={[10, 14, 12, 18, 15, 20, 16, 22, 18, 16, 14, 12]}
        />
      );
    case "risk_dispute_rate_kpi":
      return (
        <KpiBlock
          preview={preview}
          isLoading={isLoading}
          title="Dispute rate"
          valueLabel={preview ? "0.82%" : `${dashboardWidgetKpis.disputeRate.value}%`}
          change={preview ? -0.15 : dashboardWidgetKpis.disputeRate.change}
          changeUnit="pts"
          changeLabel="vs prior"
          spark={[1.2, 1.1, 1.05, 1, 0.95, 0.9, 0.88, 0.86, 0.85, 0.84, 0.83, 0.82]}
        />
      );
    case "risk_blocked_kpi":
      return (
        <KpiBlock
          preview={preview}
          isLoading={isLoading}
          title="Blocked transactions"
          valueLabel={preview ? "7" : String(dashboardWidgetKpis.blockedTx.value)}
          subtitle="Risk holds"
          spark={[12, 11, 10, 9, 9, 8, 8, 7, 7, 7, 7, 7]}
        />
      );
    case "charts_wallet_split": {
      const appleLogoSvg = (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden style={{ color: "#1c1c1e" }}>
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
      );
      const googleLogoSvg = (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
          <path d="M20.66 12.2c0-.61-.06-1.21-.16-1.79H12v3.38h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.7-3.88 2.7-6.57z" fill="#4285F4"/>
          <path d="M12 21c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.55-1.84.87-3.04.87-2.34 0-4.32-1.58-5.03-3.7H3.96v2.33A9 9 0 0 0 12 21z" fill="#34A853"/>
          <path d="M6.97 13.73A5.42 5.42 0 0 1 6.68 12c0-.6.1-1.18.29-1.73V7.94H3.96A9 9 0 0 0 3 12c0 1.45.35 2.82.96 4.06l3.01-2.33z" fill="#FBBC05"/>
          <path d="M12 6.58c1.32 0 2.5.45 3.43 1.35l2.57-2.57C16.46 3.89 14.43 3 12 3a9 9 0 0 0-8.04 4.94l3.01 2.33C7.68 8.16 9.66 6.58 12 6.58z" fill="#EA4335"/>
        </svg>
      );
      const wallets = [
        { label: "Apple Pay",  stats: walletStats.applePay,  successRate: 97.2, avgTime: "1.2s", color: "#1c1c1e", accentBg: "#1c1c1e", logo: appleLogoSvg },
        { label: "Google Pay", stats: walletStats.googlePay, successRate: 95.8, avgTime: "0.9s", color: "#4285F4", accentBg: "#4285F4", logo: googleLogoSvg },
      ] as const;

      const totalVol = walletStats.applePay.volume + walletStats.googlePay.volume;
      const appleShare = Math.round((walletStats.applePay.volume / totalVol) * 100);

      return (
        <div className={cn(cardClass, "flex flex-col p-0 h-full overflow-hidden")}>
          {isLoading ? (
            <div className="space-y-4 p-5">
              <div className="h-4 w-32 shimmer rounded" />
              <div className="h-36 shimmer rounded-xl" />
              <div className="h-36 shimmer rounded-xl" />
            </div>
          ) : (
            <>
              {/* Card header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border/60">
                <div>
                  <p className="text-[13px] font-semibold text-foreground">Digital Wallets</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {(walletStats.applePay.pctOfTotal + walletStats.googlePay.pctOfTotal).toFixed(1)}% of total volume today
                  </p>
                </div>
              </div>

              {/* Wallet rows */}
              <div className="divide-y divide-border/60 flex-1">
                {wallets.map(({ label, stats, successRate, avgTime, accentBg, logo }) => (
                  <div key={label} className="flex items-start gap-3 px-5 py-4">
                    <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded-md border border-border bg-card shadow-sm">
                      {logo}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-semibold text-foreground">{label}</span>
                        <span className="text-[13px] font-semibold tabular-nums text-foreground">
                          ₹{(stats.volume / 1000).toFixed(1)}K
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{stats.transactions} transactions</span>
                        <span className="tabular-nums">{stats.pctOfTotal}% of total</span>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-[11px]">
                        <span className="text-muted-foreground">Success <span className="font-medium text-foreground">{successRate}%</span></span>
                        <span className="text-border">·</span>
                        <span className="text-muted-foreground">Avg time <span className="font-medium text-foreground">{avgTime}</span></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer split bar */}
              <div className="px-5 pb-4 pt-3 border-t border-border/60">
                <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Apple Pay {appleShare}%</span>
                  <span>Google Pay {100 - appleShare}%</span>
                </div>
                <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full transition-all duration-700 bg-primary" style={{ width: `${appleShare}%` }} />
                </div>
              </div>
            </>
          )}
        </div>
      );
    }
    case "charts_psr_by_mode": {
      const modes = [
        { label: "UPI",         key: "upi"        as const, color: "#0061e3" },
        { label: "Card",        key: "card"        as const, color: "#3b82f6" },
        { label: "Net banking", key: "netbanking"  as const, color: "#93c5fd" },
        { label: "Wallets",     key: "wallets"     as const, color: "#bfdbfe" },
      ] as const;
      const byMode = todaysAnalytics.successRate.byMode;
      const overall = todaysAnalytics.successRate.pct;
      return (
        <div className={cn(cardClass, "flex flex-col p-0 h-full overflow-hidden")}>
          {isLoading ? (
            <div className="space-y-4 p-5">
              <div className="h-4 w-40 shimmer rounded" />
              <div className="h-32 shimmer rounded-xl" />
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-5 pt-5 pb-4 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-semibold text-foreground">Success rate by mode</p>
                  <p className="text-[1.25rem] font-bold tabular-nums text-foreground leading-none">
                    {overall}%
                    <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">avg</span>
                  </p>
                </div>
                {/* Stacked segment bar */}
                <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full gap-0.5">
                  {modes.map(({ key, color }) => (
                    <div
                      key={key}
                      className="h-full transition-all duration-700"
                      style={{ flex: byMode[key], background: color }}
                    />
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-3 flex-wrap">
                  {modes.map(({ label, key, color }) => (
                    <span key={key} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <span className="inline-block h-1.5 w-1.5 rounded-full shrink-0" style={{ background: color }} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mode rows — simple list */}
              <div className="divide-y divide-border/60 flex-1 px-5">
                {modes.map(({ label, key, color }) => {
                  const pct = byMode[key];
                  const barWidth = Math.round((pct / 100) * 100);
                  return (
                    <div key={key} className="flex items-center gap-3 py-3">
                      <span className="w-[76px] text-[12px] text-muted-foreground shrink-0">{label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${barWidth}%`, background: color }} />
                      </div>
                      <span className="w-10 text-right text-[12px] font-semibold tabular-nums text-foreground">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      );
    }
    case "charts_decline_breakdown": {
      const { issuer, general } = todaysAnalytics.declineBreakdown;
      return (
        <div className={cn(cardClass, "flex flex-col gap-0 p-5 h-full")}>
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-4 w-36 shimmer rounded" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-24 shimmer rounded-xl" />
                <div className="h-24 shimmer rounded-xl" />
              </div>
            </div>
          ) : (
            <>
              <p className="text-[13px] font-normal text-muted-foreground">Decline breakdown</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground/70">Issuer vs general failures today</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-amber-200/70 bg-amber-50/60 px-3 py-3 dark:bg-amber-950/20 dark:border-amber-700/30">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Issuer</p>
                  <p className="mt-1 text-[1.25rem] font-bold tabular-nums text-amber-900 dark:text-amber-200 leading-none">
                    {issuer.count}
                    <span className="ml-1 text-[11px] font-normal text-amber-600 dark:text-amber-400">({issuer.pct}%)</span>
                  </p>
                  <div className="mt-2 space-y-0.5">
                    {issuer.reasons.slice(0, 3).map(r => (
                      <p key={r.reason} className="flex items-center justify-between text-[10px] text-amber-700 dark:text-amber-400">
                        <span className="truncate pr-1">{r.reason}</span>
                        <span className="shrink-0 font-semibold tabular-nums">{r.count}</span>
                      </p>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 px-3 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">General</p>
                  <p className="mt-1 text-[1.25rem] font-bold tabular-nums text-foreground leading-none">
                    {general.count}
                    <span className="ml-1 text-[11px] font-normal text-muted-foreground">({general.pct}%)</span>
                  </p>
                  <div className="mt-2 space-y-0.5">
                    {general.reasons.map(r => (
                      <p key={r.reason} className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="truncate pr-1">{r.reason}</span>
                        <span className="shrink-0 font-semibold tabular-nums">{r.count}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
              {/* Proportional bar */}
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-700"
                  style={{ width: `${issuer.pct}%` }}
                />
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
                <span>Issuer {issuer.pct}%</span>
                <span>General {general.pct}%</span>
              </div>
            </>
          )}
        </div>
      );
    }
    case "charts_payment_flow_sankey":
      return <PaymentFlowSankeyWidget preview={preview} />;

    case "charts_abandonment_radar":
      return <AbandonmentRadarWidget preview={preview} />;

    default: {
      const _exhaustive: never = widgetId;
      return _exhaustive;
    }
  }
}
