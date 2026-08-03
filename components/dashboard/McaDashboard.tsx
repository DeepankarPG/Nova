"use client";

import React, { useState, useId, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Area, CartesianGrid, ComposedChart, Line,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  ArrowUpRight, Plus, FileText, Globe, ArrowDownToLine,
  Users, TrendingUp, TrendingDown, Receipt, Calculator, Sliders,
} from "lucide-react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChartSkeleton } from "@/components/ui/skeleton";
import { McaWidgetCustomization } from "@/components/dashboard/mca-widgets/McaWidgetCustomization";
import {
  readMcaDashboardLayout,
  writeMcaDashboardLayout,
  DEFAULT_MCA_DASHBOARD_LAYOUT,
  type McaWidgetId,
} from "@/lib/mca-widget-catalog";

/* ── Mock data ───────────────────────────────────────────────────────────── */

// Cumulative daily revenue series (same shape as PG hourly - values in ₹L)
const REVENUE_SERIES = [
  { label: "Feb", paidL: 0.52, outstandingL: 0.08 },
  { label: "Mar", paidL: 1.34, outstandingL: 0.22 },
  { label: "Apr", paidL: 1.51, outstandingL: 0.18 },
  { label: "May", paidL: 3.91, outstandingL: 0.34 },
  { label: "Jun", paidL: 1.72, outstandingL: 0.29 },
  { label: "Jul", paidL: 0.09, outstandingL: 0.14 },
  { label: "Aug", paidL: 0.21, outstandingL: 0.18 },
];

// Invoice count series
const INVOICE_SERIES = REVENUE_SERIES.map((d) => ({
  label:       d.label,
  paidL:       Math.round(d.paidL * 8),   // reuse field name so chart keys match
  outstandingL: Math.round(d.outstandingL * 8),
}));

const CLIENT_REVENUE = [
  { name: "Acme Corp",        total: 1631000 },
  { name: "GlobalTech Ltd",   total: 1233000 },
  { name: "Nordic Solutions", total: 978000  },
  { name: "Pacific Trade Co", total: 880000  },
  { name: "Meridian Exports", total: 614000  },
];
const MAX_CLIENT_TOTAL = CLIENT_REVENUE[0]!.total;

const PENDING_INVOICES = [
  { id: "INV-2026-0087", client: "Nordic Solutions", amount: "EUR 850",   dueIn: "Overdue", flag: "🇪🇺", overdue: true  },
  { id: "INV-2026-0091", client: "Acme Corp",        amount: "USD 1,200", dueIn: "2 days",  flag: "🇺🇸", overdue: false },
];

const CHART_PRIMARY   = "#0061e3";
const CHART_YESTERDAY = "#94a3b8";
const cardClass       = "rounded-xl border border-border bg-card text-card-foreground shadow-sm";

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function fmtL(v: number) {
  if (v >= 10_00_000) return `${(v / 10_00_000).toFixed(2)}L`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(1)}K`;
  return String(v);
}

/* ── Chart tooltip (same style as PG) ───────────────────────────────────── */
/* eslint-disable @typescript-eslint/no-explicit-any */
function McaChartTooltip({ active, payload, label, isInvoices }: any) {
  if (!active || !payload?.length) return null;
  const fmt = (v: number) => isInvoices ? String(Math.round(v)) : `₹${v.toFixed(2)}L`;
  return (
    <div className="bg-popover border border-border rounded-xl px-3 py-2.5 shadow-lg text-[12px] max-w-[180px]">
      <p className="font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-muted-foreground min-w-0">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: entry.color ?? entry.fill ?? CHART_PRIMARY }} />
            <span className="truncate">{entry.name}:</span>
          </span>
          <span className="shrink-0 text-[12px] font-semibold tabular-nums text-foreground">
            {entry.value !== undefined ? fmt(Number(entry.value)) : "-"}
          </span>
        </div>
      ))}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* ── Custom axis ticks (same shape as TodaysAnalyticsSection) ────────────── */
/* eslint-disable @typescript-eslint/no-explicit-any */
function XTick({ x, y, payload }: any) {
  return (
    <text x={x} y={y} dy={10} textAnchor="middle"
      className="fill-muted-foreground/80 text-[11px] font-medium tabular-nums">
      {payload.value}
    </text>
  );
}
function YTick({ y, payload, isInvoices }: any) {
  const text = isInvoices ? String(payload.value) : `₹${payload.value}L`;
  return (
    <text x={0} y={y} dy={3} textAnchor="start"
      className="fill-muted-foreground/80 text-[11px] font-medium tabular-nums">
      {text}
    </text>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* ── Left panel ──────────────────────────────────────────────────────────── */
type RevenueTab = "revenue" | "invoices";
const REVENUE_TABS: { id: RevenueTab; label: string }[] = [
  { id: "revenue",  label: "Revenue" },
  { id: "invoices", label: "Invoice volume" },
];

function LeftPanel({ isLoading }: { isLoading?: boolean }) {
  const router  = useRouter();
  const gradId  = useId().replace(/:/g, "");
  const [tab, setTab] = useState<RevenueTab>("revenue");

  const data = tab === "revenue" ? REVENUE_SERIES : INVOICE_SERIES;
  const isInvoices = tab === "invoices";

  const totalPaid = data.reduce((s, d) => s + d.paidL, 0);
  const paidLabel = isInvoices ? String(Math.round(totalPaid)) : `₹${totalPaid.toFixed(2)}L`;

  const changePct = 14.1;
  const changePos = true;

  const yDomain: [number, number] = isInvoices ? [0, 40] : [0, 4.5];
  const yTicks = isInvoices ? [0, 10, 20, 30, 40] : [0, 1, 2, 3, 4];

  if (isLoading) {
    return (
      <div className={cn(cardClass, "flex min-h-[300px] flex-col p-3 lg:col-span-8")}>
        <div className="mb-3 flex justify-between gap-3">
          <div className="h-[4.5rem] w-48 shimmer rounded-lg" />
          <div className="h-9 w-40 shrink-0 shimmer rounded-lg" />
        </div>
        <ChartSkeleton height="h-[232px]" />
      </div>
    );
  }

  return (
    <div className={cn(cardClass, "flex min-h-[300px] flex-col p-3 lg:col-span-8 lg:min-h-[316px]")}>

      {/* Header: headline left, tabs right */}
      <div className="flex flex-col gap-3 pt-0.5 sm:flex-row sm:items-start sm:justify-between">
        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="min-w-0 flex-1 px-1 pt-1 sm:px-2 sm:pt-1.5"
          >
            <p className="text-sm font-semibold text-foreground">
              {tab === "revenue" ? "Revenue" : "Invoice volume"}
            </p>
            <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="font-sans text-[1.75rem] font-bold leading-none tracking-[-0.02em] text-foreground tabular-nums">
                {paidLabel}
              </span>
              {!isInvoices && (
                <span className="text-[13px] font-normal leading-none text-muted-foreground">INR</span>
              )}
            </div>
            <div className={cn("mt-1 flex flex-wrap items-center gap-1 text-[12px] font-semibold",
              changePos ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
            )}>
              {changePos
                ? <TrendingUp className="h-[13px] w-[13px] shrink-0" strokeWidth={2} />
                : <TrendingDown className="h-[13px] w-[13px] shrink-0" strokeWidth={2} />}
              <span className="tabular-nums">{changePos ? "+" : ""}{changePct}%</span>
              <span className="text-[11px] font-normal text-muted-foreground">vs last month</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Tabs - right-aligned, no wrap */}
        <LayoutGroup id="mca-revenue-tabs">
          <div className="flex shrink-0 rounded-lg border border-border bg-muted/45 p-1 mt-1"
            role="tablist" aria-label="Chart metric">
            {REVENUE_TABS.map((t) => (
              <button key={t.id} type="button" role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className="relative rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-[13px]"
              >
                {tab === t.id && (
                  <motion.span layoutId="mca-tab-pill"
                    className="absolute inset-0 z-0 rounded-md bg-card shadow-sm ring-1 ring-border dark:ring-border"
                    transition={{ type: "spring", stiffness: 520, damping: 38 }}
                    aria-hidden />
                )}
                <span className={cn("relative z-10",
                  tab === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </LayoutGroup>
      </div>

      {/* Chart - same area+line composition as PG */}
      <div className="mt-2 flex min-h-0 flex-1 flex-col">
        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex min-h-[220px] flex-1 flex-col sm:min-h-[236px]"
          >
            <div className="min-h-[220px] w-full flex-1 px-1 pb-0.5 pt-1 sm:min-h-[236px] sm:px-2 sm:pb-1 sm:pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 4, right: 10, left: 0, bottom: 12 }}>
                  <defs>
                    <linearGradient id={`mca-fill-${gradId}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={CHART_PRIMARY} stopOpacity={0.28} />
                      <stop offset="40%"  stopColor={CHART_PRIMARY} stopOpacity={0.14} />
                      <stop offset="100%" stopColor={CHART_PRIMARY} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 6" stroke="var(--border)"
                    strokeOpacity={0.45} vertical={false} />
                  <XAxis dataKey="label"
                    axisLine={{ stroke: "var(--border)", strokeOpacity: 0.55 }}
                    tickLine={false} tick={<XTick />} interval="preserveStartEnd" height={26} />
                  <YAxis domain={yDomain} ticks={yTicks}
                    axisLine={false} tickLine={false} width={44}
                    tick={<YTick isInvoices={isInvoices} />} />
                  <Tooltip content={(props) => <McaChartTooltip {...props} isInvoices={isInvoices} />} />
                  <Area type="monotone" dataKey="paidL" name="Paid"
                    stroke={CHART_PRIMARY} strokeWidth={2.25}
                    fill={`url(#mca-fill-${gradId})`}
                    dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: CHART_PRIMARY }} />
                  <Line type="monotone" dataKey="outstandingL" name="Outstanding"
                    stroke={CHART_YESTERDAY} strokeWidth={1.75} strokeDasharray="5 4"
                    dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: CHART_YESTERDAY }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Upcoming settlement strip - identical to PG */}
      <div className="mt-4 -mx-3 -mb-3 overflow-hidden rounded-b-xl border-t border-border/60 bg-muted/35 dark:bg-muted/20">
        <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground">Upcoming settlement</p>
            <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-lg font-semibold leading-snug tracking-tight text-foreground tabular-nums sm:text-xl">
                ₹1,24,890
              </span>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                T+1
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
              <span>Settles at 12:00AM IST</span>
              <span className="tabular-nums">Bank ••••4521</span>
            </div>
          </div>
          <Button variant="outline" size="sm" type="button"
            className="h-9 shrink-0 self-start px-3 text-sm sm:self-center"
            onClick={() => router.push("/settlement-reports")}
            rightIcon={<ArrowUpRight className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />}
          >
            View settlements
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Right panel ─────────────────────────────────────────────────────────── */
function RightPanel({ isLoading }: { isLoading?: boolean }) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 lg:col-span-4">
        <div className={cn(cardClass, "p-3")}><div className="h-48 shimmer rounded-lg" /></div>
        <div className={cn(cardClass, "p-3")}><div className="h-32 shimmer rounded-lg" /></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 lg:col-span-4">

      {/* Client analytics */}
      <div className={cn(cardClass, "flex flex-col p-3")}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Client analytics</h3>
          <button type="button" onClick={() => router.push("/client-management")}
            className="flex items-center gap-0.5 text-[12px] font-medium text-primary hover:opacity-75 transition-opacity">
            View all <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {CLIENT_REVENUE.map((client, i) => {
            const pct = (client.total / MAX_CLIENT_TOTAL) * 100;
            return (
              <div key={client.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] font-medium text-foreground truncate max-w-[60%]">{client.name}</span>
                  <span className="text-[12px] font-semibold text-foreground tabular-nums shrink-0 ml-2">₹{fmtL(client.total)}</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <motion.div className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Needs attention - pending invoices */}
      <div className={cn(cardClass, "flex flex-col p-3")}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Needs attention</h3>
          <button type="button" onClick={() => router.push("/invoice-management")}
            className="flex items-center gap-0.5 text-[12px] font-medium text-primary hover:opacity-75 transition-opacity">
            View all <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="mt-3 space-y-1.5">
          {PENDING_INVOICES.map((inv) => (
            <div key={inv.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 p-2.5 dark:bg-muted/15"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-base leading-none">{inv.flag}</span>
                  <p className="text-[13px] font-semibold leading-snug text-foreground truncate">{inv.client}</p>
                </div>
                <p className={cn("mt-1 font-sans text-sm font-bold tabular-nums tracking-tight",
                  inv.overdue ? "text-red-700 dark:text-red-400" : "text-amber-700 dark:text-amber-400"
                )}>
                  {inv.amount}
                </p>
                <p className="mt-0.5 text-[11px] font-normal text-muted-foreground">
                  {inv.id} · {inv.overdue ? "Overdue" : `Due in ${inv.dueIn}`}
                </p>
              </div>
              <Button variant="outline" size="sm" type="button"
                className="h-7 shrink-0 px-2.5 text-xs"
                onClick={() => router.push("/invoice-management")}
                rightIcon={<ArrowUpRight className="h-3 w-3 shrink-0" strokeWidth={2} />}
              >
                {inv.overdue ? "Remind" : "View"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Quick access ────────────────────────────────────────────────────────── */
type McaActionId = "invoice-links" | "intl-accounts" | "platform-withdrawal" | "clients" | "forex-calculator" | "customise-dashboard";

const MCA_QUICK_ACTIONS: { id: McaActionId; label: string; icon: React.ElementType; href?: string }[] = [
  { id: "invoice-links",        label: "Invoice links",          icon: FileText,        href: "/payment-products/invoice-links"          },
  { id: "intl-accounts",        label: "International accounts", icon: Globe,           href: "/payment-products/international-accounts" },
  { id: "platform-withdrawal",  label: "Platform withdrawal",    icon: ArrowDownToLine, href: "/platform-withdrawal"                     },
  { id: "clients",              label: "Client management",      icon: Users,           href: "/client-management"                       },
  { id: "forex-calculator",     label: "Forex calculator",       icon: Calculator                                                        },
  { id: "customise-dashboard",  label: "Customise dashboard",    icon: Sliders                                                           },
];

function McaQuickAccess({ onForex, onCustomise }: { onForex?: () => void; onCustomise?: () => void }) {
  const router = useRouter();

  const handleClick = (action: typeof MCA_QUICK_ACTIONS[number]) => {
    if (action.id === "forex-calculator") { onForex?.(); return; }
    if (action.id === "customise-dashboard") { onCustomise?.(); return; }
    if (action.href) router.push(action.href);
  };

  return (
    <div>
      <h2 className="mb-3 text-[15px] font-semibold tracking-[-0.02em] text-foreground">Quick access</h2>
      <div className="flex flex-wrap gap-2.5">
        {MCA_QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button key={action.id} type="button" onClick={() => handleClick(action)}
              className={cn(
                "group flex shrink-0 flex-col items-start gap-2 rounded-xl border border-border bg-card text-left",
                "px-3.5 pb-2.5 pt-3.5 shadow-sm transition-all duration-150",
                "hover:border-primary/30 hover:shadow-md w-[9rem] sm:w-[9.25rem]"
              )}
            >
              <Icon className="h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
              <span className="text-left text-[11px] font-medium leading-snug text-foreground sm:text-xs">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Root ────────────────────────────────────────────────────────────────── */
export function McaDashboard({
  greeting, firstName, contextLine, onForex,
}: {
  greeting: string;
  firstName: string;
  contextLine: string;
  onForex?: () => void;
  /** @deprecated No longer used - MCA has its own internal customise flow */
  onCustomise?: () => void;
}) {
  const router = useRouter();
  const [isLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [mcaLayout, setMcaLayout] = useState<McaWidgetId[]>(DEFAULT_MCA_DASHBOARD_LAYOUT);
  const layoutSnapshot = useRef<McaWidgetId[]>(DEFAULT_MCA_DASHBOARD_LAYOUT);

  useEffect(() => {
    const stored = readMcaDashboardLayout();
    setMcaLayout(stored);
    layoutSnapshot.current = stored;
  }, []);

  const handleCustomise = useCallback(() => {
    layoutSnapshot.current = [...mcaLayout];
    setEditMode(true);
    toast.message("Customise your MCA dashboard", {
      description: "Add, remove, or reorder widgets for your multi-currency account overview.",
    });
  }, [mcaLayout]);

  const handleDoneEdit = useCallback(() => {
    writeMcaDashboardLayout(mcaLayout);
    layoutSnapshot.current = [...mcaLayout];
    setEditMode(false);
    toast.success("Dashboard updated", { description: "MCA widget layout saved." });
  }, [mcaLayout]);

  const handleDiscardEdit = useCallback(() => {
    setMcaLayout([...layoutSnapshot.current]);
    setEditMode(false);
  }, []);

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-4">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-[1.35rem] font-bold text-foreground tracking-tight leading-snug">
            {greeting}, {firstName}{" "}
            <span className="inline-block origin-bottom-right" style={{ animation: "wave 2.4s ease-in-out infinite" }}>👋</span>
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">{contextLine}</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button variant="outline" size="sm"
            leftIcon={<Receipt className="w-3.5 h-3.5" />}
            onClick={() => router.push("/invoice-management/create")}
          >
            Create invoice
          </Button>
          <Button size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => router.push("/payment-products/invoice-links?create=1")}
          >
            Invoice link
          </Button>
        </div>
      </div>

      {/* Main two-panel - exact same grid structure as PG TodaysAnalyticsSection */}
      <section className="grid w-full gap-2 lg:grid-cols-12 lg:items-stretch lg:gap-3" aria-label="MCA analytics">
        <LeftPanel isLoading={isLoading} />
        <RightPanel isLoading={isLoading} />
      </section>

      {/* Quick access */}
      <McaQuickAccess onForex={onForex} onCustomise={handleCustomise} />

      {/* Customizable widget section — includes invoice origins globe as first default widget */}
      <McaWidgetCustomization
        layout={mcaLayout}
        onLayoutChange={setMcaLayout}
        editMode={editMode}
        isLoading={isLoading}
        onDiscardEdit={handleDiscardEdit}
        onDoneEdit={handleDoneEdit}
      />

    </div>
  );
}
