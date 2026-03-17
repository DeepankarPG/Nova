"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, PauseCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { CountryInsightsMap } from "@/components/dashboard/CountryInsightsMap";
import { RecentActivityTable } from "@/components/dashboard/RecentActivityTable";
import { QuickAccess } from "@/components/dashboard/QuickAccess";
import { BarChartCard } from "@/components/charts/BarChartCard";
import { Button } from "@/components/shared/Button";
import {
  dashboardStats,
  countryInsights,
  monthlyVolume,
  recentTransactions,
  recentSettlements,
} from "@/lib/mock-data";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  return (
    <div className="max-w-[1400px] mx-auto space-y-4">

      {/* ── Page header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Business Overview</h1>
          <p className="text-sm text-gray-400 mt-0.5">Your settlement activity and business insights</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Mid-market rate note */}
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span>Amount received at mid-market rate</span>
          </div>
          <div className="h-4 w-px bg-gray-200" />
          <Button
            variant="outline"
            size="sm"
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Button variant="primary" size="sm">Export</Button>
        </div>
      </div>

      {/* ── Tab switcher ───────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-xl w-fit shadow-sm border border-black/[0.05]">
        {["Payment Gateway", "Multi-Currency Accounts"].map((tab, i) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              i === 0
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

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
        />
      </div>

      {/* ── Quick access ───────────────────────────────────────────── */}
      <QuickAccess />

      {/* ── Charts ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3">
          <BarChartCard
            title="Monthly Volume"
            subtitle="Payment volume vs settlements"
            data={monthlyVolume}
            xKey="month"
            bars={[
              { key: "volume",      label: "Volume",   color: "#0061E3" },
              { key: "settlements", label: "Settled",  color: "#93c5fd" },
            ]}
            formatValue={(v) => `₹${(v / 100000).toFixed(1)}L`}
            isLoading={isLoading}
            height={220}
          />
        </div>
        <div className="xl:col-span-2">
          <CountryInsightsMap data={countryInsights} isLoading={isLoading} className="h-full" />
        </div>
      </div>

      {/* ── Recent Activity ─────────────────────────────────────────── */}
      <RecentActivityTable
        transactions={recentTransactions}
        settlements={recentSettlements}
        isLoading={isLoading}
      />
    </div>
  );
}
