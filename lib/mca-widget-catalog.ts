import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  BarChart3,
  Clock,
  DollarSign,
  FileText,
  Globe,
  LineChart,
  PieChart,
  Receipt,
  RefreshCw,
  TrendingUp,
  Users,
  Wallet,
  AlertTriangle,
  BadgeCheck,
  CalendarClock,
} from "lucide-react";

export const MCA_DASHBOARD_LAYOUT_STORAGE_KEY = "payglocal_mca_dashboard_layout";
export const MIN_MCA_DASHBOARD_WIDGETS = 2;

export type McaWidgetCategory =
  | "Invoices"
  | "Payments"
  | "FX & Currency"
  | "Clients"
  | "Compliance"
  | "Charts";

export type McaWidgetId =
  | "mca_total_invoiced_kpi"
  | "mca_outstanding_kpi"
  | "mca_avg_invoice_kpi"
  | "mca_invoices_count_kpi"
  | "mca_overdue_kpi"
  | "mca_collection_rate_kpi"
  | "mca_avg_pay_time_kpi"
  | "mca_fx_realized_kpi"
  | "mca_top_currency_kpi"
  | "mca_pending_conversion_kpi"
  | "mca_fx_gain_loss_kpi"
  | "mca_active_clients_kpi"
  | "mca_new_clients_kpi"
  | "mca_client_concentration_kpi"
  | "mca_ebrc_pending_kpi"
  | "mca_next_settlement_kpi"
  | "mca_charts_invoice_origins"
  | "mca_charts_invoice_trend"
  | "mca_charts_currency_split"
  | "mca_charts_client_revenue"
  | "mca_charts_invoice_aging"
  | "mca_charts_fx_rate_trend"
  | "mca_charts_monthly_receipts";

export type McaWidgetCatalogEntry = {
  id: McaWidgetId;
  name: string;
  category: McaWidgetCategory;
  icon: LucideIcon;
  lgColSpan: 3 | 4 | 5 | 6 | 7 | 8 | 12;
};

export const MCA_WIDGET_CATALOG: McaWidgetCatalogEntry[] = [
  // Invoices KPIs
  { id: "mca_total_invoiced_kpi",       name: "Total Invoiced",           category: "Invoices",     icon: Receipt,       lgColSpan: 4 },
  { id: "mca_outstanding_kpi",          name: "Outstanding Amount",       category: "Invoices",     icon: Wallet,        lgColSpan: 4 },
  { id: "mca_invoices_count_kpi",       name: "Active Invoices",          category: "Invoices",     icon: FileText,      lgColSpan: 4 },
  { id: "mca_overdue_kpi",             name: "Overdue Invoices",          category: "Invoices",     icon: AlertTriangle, lgColSpan: 4 },
  { id: "mca_collection_rate_kpi",      name: "Collection Rate",          category: "Invoices",     icon: TrendingUp,    lgColSpan: 4 },
  { id: "mca_avg_invoice_kpi",          name: "Avg Invoice Value",        category: "Invoices",     icon: DollarSign,    lgColSpan: 4 },
  // Payments KPIs
  { id: "mca_avg_pay_time_kpi",         name: "Avg Payment Time",         category: "Payments",     icon: Clock,         lgColSpan: 4 },
  { id: "mca_next_settlement_kpi",      name: "Next Settlement",          category: "Payments",     icon: CalendarClock, lgColSpan: 4 },
  // FX & Currency KPIs
  { id: "mca_fx_realized_kpi",          name: "FX Rate Realized",         category: "FX & Currency", icon: ArrowLeftRight, lgColSpan: 4 },
  { id: "mca_top_currency_kpi",         name: "Top Currency",             category: "FX & Currency", icon: Globe,         lgColSpan: 4 },
  { id: "mca_pending_conversion_kpi",   name: "Pending Conversion",       category: "FX & Currency", icon: RefreshCw,     lgColSpan: 4 },
  { id: "mca_fx_gain_loss_kpi",         name: "FX Gain / Loss",           category: "FX & Currency", icon: TrendingUp,    lgColSpan: 4 },
  // Clients KPIs
  { id: "mca_active_clients_kpi",       name: "Active Clients",           category: "Clients",      icon: Users,         lgColSpan: 4 },
  { id: "mca_new_clients_kpi",          name: "New Clients",              category: "Clients",      icon: Users,         lgColSpan: 4 },
  { id: "mca_client_concentration_kpi", name: "Client Concentration",     category: "Clients",      icon: BarChart3,     lgColSpan: 4 },
  // Compliance KPIs
  { id: "mca_ebrc_pending_kpi",         name: "eBRC Pending",             category: "Compliance",   icon: BadgeCheck,    lgColSpan: 4 },
  // Charts
  { id: "mca_charts_invoice_origins",   name: "Invoice Origins (Globe)",  category: "Charts",       icon: Globe,         lgColSpan: 12 },
  { id: "mca_charts_invoice_trend",     name: "Invoice Trend",            category: "Charts",       icon: LineChart,     lgColSpan: 7 },
  { id: "mca_charts_currency_split",    name: "Currency Split",           category: "Charts",       icon: PieChart,      lgColSpan: 5 },
  { id: "mca_charts_client_revenue",    name: "Client Revenue Breakdown", category: "Charts",       icon: BarChart3,     lgColSpan: 6 },
  { id: "mca_charts_invoice_aging",     name: "Invoice Aging Buckets",    category: "Charts",       icon: BarChart3,     lgColSpan: 6 },
  { id: "mca_charts_fx_rate_trend",     name: "FX Rate Trend",            category: "Charts",       icon: LineChart,     lgColSpan: 6 },
  { id: "mca_charts_monthly_receipts",  name: "Monthly Receipts",         category: "Charts",       icon: BarChart3,     lgColSpan: 6 },
];

export const MCA_WIDGET_BY_ID: Record<McaWidgetId, McaWidgetCatalogEntry> = MCA_WIDGET_CATALOG.reduce(
  (acc, e) => { acc[e.id] = e; return acc; },
  {} as Record<McaWidgetId, McaWidgetCatalogEntry>
);

export const DEFAULT_MCA_DASHBOARD_LAYOUT: McaWidgetId[] = [
  "mca_charts_invoice_origins",
  "mca_total_invoiced_kpi",
  "mca_outstanding_kpi",
  "mca_collection_rate_kpi",
  "mca_charts_invoice_trend",
  "mca_charts_currency_split",
];

export const MCA_CATEGORY_ORDER: McaWidgetCategory[] = [
  "Invoices",
  "Payments",
  "FX & Currency",
  "Clients",
  "Compliance",
  "Charts",
];

const ALL_MCA_IDS = new Set<string>(MCA_WIDGET_CATALOG.map((w) => w.id));

function isMcaWidgetId(id: string): id is McaWidgetId {
  return ALL_MCA_IDS.has(id);
}

export function parseMcaStoredLayout(raw: string | null): McaWidgetId[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const out: McaWidgetId[] = [];
    const seen = new Set<string>();
    for (const item of parsed) {
      if (typeof item !== "string" || !isMcaWidgetId(item) || seen.has(item)) continue;
      seen.add(item);
      out.push(item);
    }
    if (out.length < MIN_MCA_DASHBOARD_WIDGETS) return null;
    return out;
  } catch { return null; }
}

export function readMcaDashboardLayout(): McaWidgetId[] {
  if (typeof window === "undefined") return [...DEFAULT_MCA_DASHBOARD_LAYOUT];
  const parsed = parseMcaStoredLayout(localStorage.getItem(MCA_DASHBOARD_LAYOUT_STORAGE_KEY));
  return parsed ?? [...DEFAULT_MCA_DASHBOARD_LAYOUT];
}

export function writeMcaDashboardLayout(layout: McaWidgetId[]): void {
  if (typeof window === "undefined") return;
  if (layout.length < MIN_MCA_DASHBOARD_WIDGETS) return;
  localStorage.setItem(MCA_DASHBOARD_LAYOUT_STORAGE_KEY, JSON.stringify(layout));
}
