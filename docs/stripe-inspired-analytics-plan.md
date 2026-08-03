# Dashboard Analytics — Stripe-Inspired Enhancements

## Context

The user shared the Stripe dashboard as a reference and asked what analytics we can take inspiration from or have missed. After auditing our 31 existing widgets against the Stripe screenshot, 5 meaningful gaps were identified — all payment-gateway relevant, none of the subscription-specific ones (MRR, churn, subscriber retention). The goal is to add these as optional widgets in the customise-dashboard system so they don't clutter the default view.

---

## What Stripe has that we're missing

| Stripe widget | PayGlocal equivalent to build |
|---|---|
| Successful payments — trend chart (line, over weeks) | `charts_successful_payments_trend` |
| Failed payments — live feed (recent rows with customer + amount) | `charts_failed_payments_feed` |
| New customers — trend chart | `charts_new_customers_trend` |
| Spend per customer — trend (avg ticket over weeks) | `charts_avg_ticket_trend` |
| Dispute activity — trend chart (not just KPI count) | `charts_dispute_trend` |
| Period comparison selector on widget grid | Header toggle: "vs. yesterday / last week / last month" |

Stripe items **not relevant** for a payment gateway: MRR, subscriber retention, revenue retention, trial conversion, churn rate — these are billing/SaaS metrics.

---

## Implementation Plan

### 1. Mock data additions — `lib/mock-data/index.ts`

Add the following time-series arrays (weekly cadence, 8 data points each — matches `monthlyVolume` pattern):

```ts
// Successful payments over 8 weeks
export const successfulPaymentsTrend = [
  { week: "W1", count: 812, volume: 680000 },
  ...
]

// Failed payments over 8 weeks
export const failedPaymentsTrend = [
  { week: "W1", count: 28 },
  ...
]

// New customers over 8 weeks
export const newCustomersTrend = [
  { week: "W1", count: 34 },
  ...
]

// Avg ticket over 8 weeks
export const avgTicketTrend = [
  { week: "W1", avg: 2210 },
  ...
]

// Dispute activity over 8 weeks
export const disputeTrend = [
  { week: "W1", count: 2, rate: 0.7 },
  ...
]

// Recent failed payments feed (last 5 failed txns)
export const recentFailedPayments = [
  { id, customerName, amount, currency, reason, date },
  ...
]
```

### 2. Add 5 new widget IDs — `lib/dashboard-widget-catalog.ts`

```ts
// New WidgetId union members:
| "charts_successful_payments_trend"
| "charts_failed_payments_feed"
| "charts_new_customers_trend"
| "charts_avg_ticket_trend"
| "charts_dispute_trend"

// WIDGET_CATALOG entries:
{ id: "charts_successful_payments_trend", name: "Successful Payments Trend", category: "Payments", icon: TrendingUp, lgColSpan: 6 }
{ id: "charts_failed_payments_feed",      name: "Failed Payments Feed",      category: "Risk & Disputes", icon: AlertTriangle, lgColSpan: 6 }
{ id: "charts_new_customers_trend",       name: "New Customers Trend",       category: "Customers", icon: Users, lgColSpan: 6 }
{ id: "charts_avg_ticket_trend",          name: "Avg. Ticket Size Trend",    category: "Payments", icon: Wallet, lgColSpan: 6 }
{ id: "charts_dispute_trend",             name: "Dispute Activity Trend",    category: "Risk & Disputes", icon: ShieldAlert, lgColSpan: 6 }
```

### 3. Render cases — `components/dashboard/widgets/DashboardWidgetRenderer.tsx`

Add 5 new `case` blocks before `default`. All use existing Recharts components already imported (`AreaChart`, `Area`, `BarChart`, `Bar`, `LineChart`, `Line`, `ResponsiveContainer`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`), the existing `StandardChartTooltip`, `BarChartCard`, `cardClass`, and `ChartSkeleton`.

**`charts_successful_payments_trend`**
- Layout: cardClass, title "Successful payments", sub-headline with total count + % change chip
- Chart: `AreaChart` with gradient fill (emerald `#10b981`), `Area` for count, dashed `Line` for volume on secondary axis — same pattern as `charts_monthly_volume`
- Bottom stat row: total this period, vs last period delta

**`charts_failed_payments_feed`**
- Layout: cardClass, title "Failed payments", count badge
- Content: list of 5 recent failed txns — each row has customer name (truncated), amount+currency right-aligned, reason as a muted sub-label, relative time
- Style: `divide-y divide-border/60`, each row `px-5 py-3`, same pattern as dispute rows
- Footer: "View all" link to `/transactions?status=failed`

**`charts_new_customers_trend`**
- Layout: cardClass, title "New customers", count + change chip
- Chart: `AreaChart`, `Area` with `#6366f1` fill gradient — 8-week trend
- Same skeleton pattern as other chart widgets

**`charts_avg_ticket_trend`**
- Layout: cardClass, title "Avg. ticket size"
- Chart: `LineChart` with `Line` stroke `#0061e3`, no fill — shows weekly avg ticket in ₹
- Bottom: current avg vs prior period delta

**`charts_dispute_trend`**
- Layout: cardClass, title "Dispute activity"
- Chart: `BarChart` with `Bar` fill `#f59e0b` (amber) for count, thin `Line` overlay for dispute rate %
- Bottom stat row: open count, rate %, vs prior period

### 4. Period comparison toggle — `app/(dashboard)/page.tsx`

Add a small segmented control in the widget grid section header (above `DashboardWidgetCustomization`):

```tsx
type ComparePeriod = "yesterday" | "last_week" | "last_month"
const [comparePeriod, setComparePeriod] = useState<ComparePeriod>("yesterday")
```

Render a 3-option pill toggle: `Yesterday | Last week | Last month` — same segmented control pattern used in `DeveloperApiKeysPanel` (3 buttons, active = `bg-primary text-white`). Pass `comparePeriod` as a prop to `DashboardWidgetCustomization` → forwarded to `DashboardWidgetRenderer` as an optional hint. Initially cosmetic only (widgets can use it to label their "vs." text).

---

## Files to Modify

| File | Change |
|---|---|
| `lib/mock-data/index.ts` | Add 6 new exports (5 trend arrays + failed payments feed) |
| `lib/dashboard-widget-catalog.ts` | Add 5 WidgetId members + 5 WIDGET_CATALOG entries; import missing icons |
| `components/dashboard/widgets/DashboardWidgetRenderer.tsx` | Add 5 case blocks; import new mock data |
| `app/(dashboard)/page.tsx` | Add period comparison toggle above widget grid |

## Reuse

- Recharts components (`AreaChart`, `Area`, `BarChart`, `Bar`, `LineChart`, `Line`) — already imported in `DashboardWidgetRenderer`
- `StandardChartTooltip` — `components/charts/StandardChartTooltip.tsx`
- `BarChartCard` — `components/charts/BarChartCard.tsx`
- `ChartSkeleton` — `components/ui/skeleton.tsx`
- `cardClass` constant — already defined at top of `DashboardWidgetRenderer.tsx`
- Segmented control pattern — `components/settings/DeveloperApiKeysPanel.tsx`

## Verification

1. `npm run dev` → open `/` → click "Customise dashboard"
2. Verify all 5 new widgets appear in the widget library under the correct categories
3. Add each widget to the dashboard and confirm it renders with data and loading skeleton
4. Confirm period toggle renders and switches label text in widget "vs." lines
5. Click "View all" on Failed payments feed → navigates to `/transactions`
