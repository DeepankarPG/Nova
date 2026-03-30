"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, PauseCircle, AlertTriangle, Download, RefreshCw } from "lucide-react";
import { StatCard, type DrillDownData } from "@/components/dashboard/StatCard";
import { RecentActivityTable } from "@/components/dashboard/RecentActivityTable";
import { PayGlocalAdvantageBanner } from "@/components/dashboard/PayGlocalAdvantageBanner";
import { QuickAccess } from "@/components/dashboard/QuickAccess";
import { InviteTeammateModal } from "@/components/dashboard/quick-actions/InviteTeammateModal";
import { InternationalAccountsQuickModal } from "@/components/dashboard/quick-actions/InternationalAccountsQuickModal";
import type { QuickActionId } from "@/components/dashboard/quick-actions/types";
import {
  CreatePaymentLinkModal,
  PaymentLinkSuccessModal,
} from "@/components/payment-links/CreatePaymentLinkModal";
import type { PaymentLink } from "@/components/payment-links/types";
import { ForexCalculatorModal } from "@/components/international-accounts/ForexCalculatorModal";
import { Button } from "@/components/shared/Button";
import { DashboardWidgetCustomization } from "@/components/dashboard/configurable/DashboardWidgetCustomization";
import {
  DEFAULT_DASHBOARD_LAYOUT,
  readDashboardLayout,
  writeDashboardLayout,
  type WidgetId,
} from "@/lib/dashboard-widget-catalog";
import { dashboardStats, recentTransactions, recentSettlements } from "@/lib/mock-data";
import { toast } from "sonner";

const ADMIN_NAME = "Deepankar";

/** Illustrative INR per 1 USD for dashboard FX quick action (no MCA context). */
const QUICK_FX_INR_PER_USD = 88.35;

/* ─── Drill-down breakdown data for each stat card ───────────────────────── */
const DRILL_DOWNS: Record<number, DrillDownData> = {
  0: {
    heading: "Payment breakdown",
    period:  "Last 30 days",
    items: [
      { label: "UPI",             value: "₹3,81,262", pct: 45, color: "#0061E3" },
      { label: "Debit / Credit",  value: "₹2,96,537", pct: 35, color: "#7c3aed" },
      { label: "Net Banking",     value: "₹1,69,450", pct: 20, color: "#0891b2" },
    ],
    stats: [
      { label: "Success rate", value: "94.2%" },
      { label: "Avg. ticket",  value: "₹2,340" },
      { label: "Transactions", value: "362"    },
    ],
    note: "Capture rate is above the industry average of 91%.",
    cta:  "View all transactions",
  },
  1: {
    heading: "Pending settlements",
    period:  "Next 3 banking days",
    items: [
      { label: "HDFC ****4521",    value: "₹85,000", badge: "Mar 18",   badgeVariant: "blue"  },
      { label: "Citibank ****2210", value: "$450",    badge: "Mar 19",   badgeVariant: "gray"  },
      { label: "SBI ****7843",     value: "€280",    badge: "Mar 20",   badgeVariant: "gray"  },
    ],
    stats: [
      { label: "Total pending", value: "₹1.24L" },
      { label: "Next settle",   value: "Mar 18"  },
    ],
    note: "Auto-settles daily at 11:00 AM IST at mid-market FX rates.",
    cta:  "View settlement schedule",
  },
  2: {
    heading: "Funds on hold",
    period:  "Current breakdown",
    items: [
      { label: "Risk review",    value: "₹24,500", badge: "~3 days",  badgeVariant: "amber" },
      { label: "Compliance",     value: "₹18,200", badge: "~5 days",  badgeVariant: "amber" },
      { label: "Active dispute", value: "₹9,640",  badge: "Pending",  badgeVariant: "red"   },
    ],
    stats: [
      { label: "Avg. release", value: "4.1 days" },
      { label: "Cases open",   value: "3"         },
    ],
    note: "Funds are released automatically once each review is resolved.",
    cta:  "Contact support",
  },
  3: {
    heading: "Dispute status",
    period:  "Active cases",
    items: [
      { label: "Needs your response", value: "2 cases · ₹8,400", badge: "Act now",    badgeVariant: "red"   },
      { label: "Under review",        value: "1 case  · ₹3,200", badge: "In review",  badgeVariant: "blue"  },
      { label: "Deadline: Mar 19",    value: "1 case  · ₹2,600", badge: "2 days left",badgeVariant: "amber" },
    ],
    stats: [
      { label: "Win rate",    value: "68%"    },
      { label: "Avg resolve", value: "4.2d"   },
      { label: "Total at risk", value: "₹14.2K" },
    ],
    note: "Respond before the deadline to maximise your chances of winning.",
    cta:  "View all disputes",
  },
};

function useGreeting() {
  return useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return { greeting: "Good morning" };
    if (h < 17) return { greeting: "Good afternoon" };
    if (h < 21) return { greeting: "Good evening" };
    return { greeting: "Good night" };
  }, []);
}

function useContextLine() {
  return useMemo(() => {
    const now  = new Date();
    const day  = now.getDay(); // 0=Sun
    const h    = now.getHours();
    const date = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

    if (day === 1 && h < 11)  return `Here's everything lined up for the week ahead 🗓️`;
    if (day === 5 && h >= 15) return `Great work this week — here's your final summary 🎉`;
    if (day === 0 || day === 6) return `Taking a weekend peek at your numbers 📊`;
    if (h >= 5  && h < 9)    return `Early bird! Here's what's waiting for you ☕`;
    if (h >= 9  && h < 12)   return `Here's your morning briefing for ${date} 🌤️`;
    if (h >= 12 && h < 14)   return `Midday check-in — things are moving along 📈`;
    if (h >= 14 && h < 17)   return `Here’s your overview for ${date}`;    if (h >= 17 && h < 20)   return `End of day — here's how ${date} shaped up today`;
    if (h >= 20)              return `Winding down — a quick look before you log off 🌙`;
    return `Your business overview for ${date} 🚀`;
  }, []);
}

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [layout, setLayout] = useState<WidgetId[]>(DEFAULT_DASHBOARD_LAYOUT);
  const layoutSnapshot = useRef<WidgetId[]>(DEFAULT_DASHBOARD_LAYOUT);
  const [paymentLinkUI, setPaymentLinkUI] = useState<
    null | { phase: "create" } | { phase: "success"; link: PaymentLink }
  >(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [fxOpen, setFxOpen] = useState(false);
  const [intlAccountsOpen, setIntlAccountsOpen] = useState(false);
  const { greeting } = useGreeting();
  const contextLine = useContextLine();

  const handleQuickAction = (id: QuickActionId) => {
    switch (id) {
      case "payment-link":
        setPaymentLinkUI({ phase: "create" });
        break;
      case "invoice":
        router.push("/payment-products/invoice-links?create=1");
        break;
      case "invite-teammate":
        setInviteOpen(true);
        break;
      case "fx-calculator":
        setFxOpen(true);
        break;
      case "international-accounts":
        setIntlAccountsOpen(true);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const stored = readDashboardLayout();
    setLayout(stored);
    layoutSnapshot.current = stored;
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1300);
    return () => clearTimeout(t);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsRefreshing(false);
    }, 1300);
  };

  const handleCustomise = () => {
    layoutSnapshot.current = [...layout];
    setEditMode(true);
    toast.message("Customise your dashboard", {
      description: "Drag widgets from the library on the right onto your dashboard.",
    });
  };

  const handleDoneCustomise = () => {
    writeDashboardLayout(layout);
    layoutSnapshot.current = [...layout];
    setEditMode(false);
    toast.success("Dashboard updated", {
      description: "Changes saved and edit mode closed.",
    });
  };

  const handleDiscardCustomise = () => {
    setLayout([...layoutSnapshot.current]);
    setEditMode(false);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">

      {/* ── Page header + tab switcher ──────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-[1.35rem] font-bold text-foreground tracking-tight leading-snug">
              {greeting}, {ADMIN_NAME}{" "}
              <span
                className="inline-block origin-bottom-right"
                style={{ animation: "wave 2.4s ease-in-out infinite" }}
              >👋</span>
            </h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">{contextLine}</p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <CheckCircle2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <span>Amount received at mid-market rate</span>
            </div>
            <div className="hidden sm:block h-3.5 w-px bg-border" />
            <Button
              variant="outline"
              size="sm"
              isLoading={isRefreshing}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export
            </Button>
          </div>
        </div>

        {/* Tab switcher — sits flush below header */}
        <div className="flex items-center gap-1 bg-muted/60 dark:bg-muted/40 p-1 rounded-xl w-fit border border-border/70 dark:border-border">
        {["Payment Gateway", "Multi-Currency Accounts"].map((tab, i) => (
          <button
            key={tab}
            type="button"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              i === 0
                ? "bg-card text-foreground shadow-sm dark:bg-muted dark:border dark:border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
        </div>
      </div>

      <PayGlocalAdvantageBanner />

      {/* ── Stat cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Successful Payments"
          value={dashboardStats.successfulPayments.value}
          currency="INR"
          change={dashboardStats.successfulPayments.change}
          icon={CheckCircle2}
          iconPreset="green"
          isLoading={isLoading}
          index={0}
          action={{ label: "View All Transactions", onClick: () => {} }}
          sparkline={[42, 55, 48, 60, 53, 70, 65, 78, 72, 88, 84, 95, 100]}
          tooltip="Total value of all fully captured and settled payment transactions in the selected period."
          drillDown={DRILL_DOWNS[0]}
        />
        <StatCard
          title="Settlements Due"
          value={dashboardStats.settlementsDue.value}
          currency="INR"
          change={dashboardStats.settlementsDue.change}
          subtitle="Auto-settles everyday"
          icon={Clock}
          iconPreset="blue"
          isLoading={isLoading}
          index={1}
          action={{ label: "View All Settlements", onClick: () => {} }}
          sparkline={[80, 75, 82, 70, 74, 68, 72, 65, 70, 63, 68, 60, 58]}
          tooltip="Funds collected from customers that are pending transfer to your bank account, processed at mid-market FX rates."
          drillDown={DRILL_DOWNS[1]}
        />
        <StatCard
          title="Funds on Hold"
          value={dashboardStats.fundsOnHold.value}
          currency="INR"
          change={dashboardStats.fundsOnHold.change}
          subtitle="No funds currently on hold"
          icon={PauseCircle}
          iconPreset="amber"
          isLoading={isLoading}
          index={2}
          action={{ label: "Know More", onClick: () => {} }}
          sparkline={[30, 35, 32, 38, 36, 42, 40, 45, 43, 50, 48, 52, 54]}
          tooltip="Payments temporarily withheld due to risk reviews, compliance checks, or active dispute investigations."
          drillDown={DRILL_DOWNS[2]}
        />
        <StatCard
          title="Open Disputes"
          value={dashboardStats.openDisputes.value}
          currency="INR"
          change={dashboardStats.openDisputes.change}
          icon={AlertTriangle}
          iconPreset="red"
          isLoading={isLoading}
          index={3}
          action={{ label: "Know More", onClick: () => {} }}
          sparkline={[10, 14, 12, 18, 15, 20, 16, 22, 18, 16, 14, 12, 10]}
          tooltip="Total value of transactions currently under chargeback or dispute. Respond before the due date to protect your revenue."
          drillDown={DRILL_DOWNS[3]}
        />
      </div>

      {/* ── Quick access + dashboard edit (Stripe-style) ───────────── */}
      <QuickAccess
        editMode={editMode}
        onEditDashboard={handleCustomise}
        onAction={handleQuickAction}
      />

      <AnimatePresence>
        {paymentLinkUI?.phase === "create" && (
          <CreatePaymentLinkModal
            key="pl-create"
            onClose={() => setPaymentLinkUI(null)}
            onCreate={(link) => setPaymentLinkUI({ phase: "success", link })}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {paymentLinkUI?.phase === "success" && (
          <PaymentLinkSuccessModal
            key="pl-success"
            link={paymentLinkUI.link}
            onClose={() => setPaymentLinkUI(null)}
          />
        )}
      </AnimatePresence>
      <InviteTeammateModal open={inviteOpen} onOpenChange={setInviteOpen} />
      <ForexCalculatorModal
        open={fxOpen}
        onOpenChange={setFxOpen}
        localCurrency="USD"
        fxInrPerUnit={QUICK_FX_INR_PER_USD}
        flag="🇺🇸"
      />
      <InternationalAccountsQuickModal open={intlAccountsOpen} onOpenChange={setIntlAccountsOpen} />

      {/* ── Configurable charts & insights ─────────────────────────── */}
      <DashboardWidgetCustomization
        layout={layout}
        onLayoutChange={setLayout}
        editMode={editMode}
        isLoading={isLoading}
        onDiscardEdit={handleDiscardCustomise}
        onDoneEdit={handleDoneCustomise}
      />

      {/* ── Recent Activity ─────────────────────────────────────────── */}
      <RecentActivityTable
        transactions={recentTransactions}
        settlements={recentSettlements}
        isLoading={isLoading}
      />
    </div>
  );
}
