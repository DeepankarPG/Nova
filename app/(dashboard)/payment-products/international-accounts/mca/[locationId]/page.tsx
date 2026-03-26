"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BarChart2, ChevronRight, Clock, Copy, Info, Plus, Share2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/shared/Button";
import { StatCard } from "@/components/dashboard/StatCard";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  ForexCalculatorBanner,
  ForexCalculatorModal,
} from "@/components/international-accounts/ForexCalculatorModal";
import { BankDetailRow } from "@/components/international-accounts/BankDetailRow";
import { McaSavingsCard } from "@/components/international-accounts/McaSavingsCard";
import {
  clientReceivingLocations,
  getClientReceivingLocation,
  recentInboundsForLocation,
  type BankDetailRow as BankDetailRowData,
  type ClientReceivingLocation,
  type McaRecentInbound,
} from "@/lib/mock-data";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";

type AccountMode = "local" | "others";

function copyRows(rows: BankDetailRowData[]) {
  const text = rows.map((r) => `${r.label}: ${r.value}`).join("\n");
  void navigator.clipboard.writeText(text);
  toast.success("All banking details copied");
}

function sharePlaceholder() {
  toast.message("Share with client", {
    description: "Branded payment pages can be enabled from your account settings.",
  });
}

function requestMoreAccounts() {
  toast.success("Request received", {
    description: "We’ll reach out about additional collection corridors.",
  });
}

/** Short place name for “Recent MCA transactions from …” (e.g. USA, the UK). */
function recentMcaTransactionsPlace(loc: ClientReceivingLocation): string {
  switch (loc.id) {
    case "usa":
      return "USA";
    case "uk":
      return "the UK";
    case "uae":
      return "the UAE";
    case "europe":
      return "Europe (SEPA)";
    case "canada":
      return "Canada";
    case "australia":
      return "Australia";
    case "singapore":
      return "Singapore";
    case "rest-of-world":
      return "rest of the world";
    default:
      return loc.label;
  }
}

function fmtInboundAmt(amount: number, currency: string) {
  const sym =
    currency === "INR"
      ? "₹"
      : currency === "USD"
        ? "$"
        : currency === "EUR"
          ? "€"
          : currency === "GBP"
            ? "£"
            : `${currency} `;
  return `${sym}${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

const recentInboundColumns: Column<McaRecentInbound>[] = [
  {
    key: "amount",
    header: "Amount",
    minWidth: 120,
    render: (row) => (
      <div className="flex items-baseline gap-1.5 whitespace-nowrap">
        <span className="font-semibold text-gray-900 tabular-nums text-[13px]">
          {fmtInboundAmt(row.amount, row.currency)}
        </span>
        <span className="text-[11px] text-gray-600 font-medium">{row.currency}</span>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    minWidth: 150,
    render: (row) => <StatusBadge status={row.status} size="sm" />,
  },
  {
    key: "remitter",
    header: "Remitter name",
    minWidth: 150,
    render: (row) => (
      <span className="text-[13px] font-medium text-gray-800 whitespace-nowrap">{row.remitterName}</span>
    ),
  },
  {
    key: "date",
    header: "Date and time",
    minWidth: 148,
    render: (row) => (
      <span className="text-[13px] text-gray-700 whitespace-nowrap">{formatDate(row.date)}</span>
    ),
  },
];

export default function McaLocationPage() {
  const params = useParams();
  const locationId = params.locationId as string;
  const location = useMemo(() => getClientReceivingLocation(locationId), [locationId]);
  const [mode, setMode] = useState<AccountMode>("local");

  useEffect(() => {
    setMode("local");
  }, [locationId]);

  const recentInbounds = useMemo(
    () => recentInboundsForLocation(locationId, 5),
    [locationId]
  );
  const showToggle = location && location.id !== "rest-of-world";

  const activeRows = useMemo(() => {
    if (!location) return [];
    if (!showToggle || mode === "local") return location.localRows;
    return location.swiftRows;
  }, [location, mode, showToggle]);

  const activeTitle = useMemo(() => {
    if (!location) return "";
    if (!showToggle || mode === "local") return location.localAccountTitle;
    return location.swiftAccountTitle;
  }, [location, mode, showToggle]);

  const activeSubtitle = useMemo(() => {
    if (!location) return "";
    if (!showToggle || mode === "local") return location.localAccountSubtitle;
    return `Currencies: ${location.swiftCurrenciesNote}.`;
  }, [location, mode, showToggle]);

  const rowsForCopy = useMemo(() => {
    if (!location) return [];
    if (!showToggle || mode === "local") {
      return [{ label: "Payment method", value: location.paymentMethodLocal }, ...location.localRows];
    }
    return location.swiftRows;
  }, [location, mode, showToggle]);

  const [forexModalOpen, setForexModalOpen] = useState(false);

  if (!location) {
    return (
      <div className="space-y-6">
        <div
          className="rounded-xl bg-white p-10 text-center"
          style={{ border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}
        >
          <p className="text-base font-semibold text-gray-900">Region not found</p>
          <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
            Pick a valid region from Multi-currency accounts.
          </p>
          <Link
            href={`/payment-products/international-accounts/mca/${clientReceivingLocations[0]?.id ?? "usa"}`}
            className="inline-block mt-6"
          >
            <Button variant="primary" size="lg">
              Back to accounts
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
      {/* Left rail — regions + request more in one card */}
      <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-4 space-y-3">
        <p className="text-[13px] font-medium text-gray-500">Your client location</p>
        <div
          className="rounded-xl overflow-hidden bg-white"
          style={{ border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
        >
          <nav aria-label="Your client locations">
            {clientReceivingLocations.map((loc) => {
              const active = loc.id === location.id;
              return (
                <Link
                  key={loc.id}
                  href={`/payment-products/international-accounts/mca/${loc.id}`}
                  className={cn(
                    "flex items-center gap-3 min-h-11 px-4 py-2.5 text-[14px] transition-colors border-b border-gray-100",
                    active
                      ? "font-semibold text-gray-900 bg-[#eff4ff]"
                      : "font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <span className="text-lg leading-none shrink-0" aria-hidden>
                    {loc.flag}
                  </span>
                  <span className="flex-1 text-left leading-snug">{loc.label}</span>
                  {active && <ChevronRight className="w-4 h-4 text-[#0061E3] shrink-0" aria-hidden />}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-100 p-3 bg-gray-50/50">
            <button
              type="button"
              onClick={requestMoreAccounts}
              title="Request more locations"
              className="w-full flex items-center justify-start gap-2 min-h-10 px-3 py-2 rounded-lg text-[13px] font-semibold text-[#0061E3] hover:bg-white/90 transition-colors text-left"
            >
              <Plus className="w-4 h-4 shrink-0" aria-hidden />
              <span>Request more locations</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 space-y-4">
        <PageHeader
          className="!mb-2"
          titleAriaLabel={`Receive payments from ${location.receiveTitle}`}
          title={
            <span className="inline-flex items-center gap-2 flex-wrap">
              <span>Receive payments from {location.receiveTitle}</span>
              <span className="text-[1.35rem] leading-none shrink-0" aria-hidden>
                {location.flag}
              </span>
            </span>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard
            title="Total earning"
            value={location.corridorAnalytics.totalRevenue}
            suffix={` ${location.localCurrency}`}
            change={location.corridorAnalytics.changeRevenue}
            changeLabel="vs last month"
            icon={BarChart2}
            iconPreset="brand"
            index={0}
            sparkline={location.corridorAnalytics.sparkRevenue}
            tooltip="Earnings from payers in this corridor over the last 30 days (illustrative)."
          />
          <StatCard
            title="Outstanding"
            value={location.corridorAnalytics.outstanding}
            suffix={` ${location.localCurrency}`}
            subtitle={location.corridorAnalytics.outstandingContext}
            icon={Clock}
            iconPreset="amber"
            index={1}
            tooltip="Inbound amounts credited but not yet cleared or available to settle (illustrative)."
          />
          <McaSavingsCard
            thisMonthInr={location.corridorAnalytics.savingsThisMonthInr}
            vsBankPct={location.corridorAnalytics.savingsVsBankPct}
            index={2}
          />
        </div>

        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-3">
            {showToggle ? (
              <div
                className="inline-flex p-0.5 rounded-lg bg-gray-100"
                style={{ border: "1px solid #e5e7eb" }}
              >
                <button
                  type="button"
                  onClick={() => setMode("local")}
                  className={cn(
                    "min-h-10 px-3.5 rounded-md text-[13px] font-semibold transition-all",
                    mode === "local" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  )}
                  style={mode === "local" ? { border: "1px solid #e5e7eb" } : undefined}
                >
                  {location.localCurrency}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("others")}
                  className={cn(
                    "min-h-10 px-3.5 rounded-md text-[13px] font-semibold transition-all",
                    mode === "others" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  )}
                  style={mode === "others" ? { border: "1px solid #e5e7eb" } : undefined}
                >
                  Other
                </button>
              </div>
            ) : (
              <span className="text-[13px] font-medium text-gray-500">Other account</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 pt-1">
          <div className="xl:col-span-7 min-w-0 order-2 xl:order-1">
            <div
              className="rounded-xl bg-white p-4 sm:p-5 relative overflow-hidden"
              style={{ border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
            >
              {location.preferredRibbon && mode === "local" && (
                <div
                  className="absolute top-0 right-0 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-bl-lg"
                  style={{ background: "#059669" }}
                >
                  {location.preferredRibbon}
                </div>
              )}
              <div className="pr-20 mb-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{activeTitle}</p>
                <p className="text-[13px] text-gray-600 mt-1 leading-snug">{activeSubtitle}</p>
              </div>

              {mode === "others" && location.swiftWarning && (
                <div
                  className="flex gap-2 rounded-md px-2.5 py-2 mb-3 text-[12px] leading-snug"
                  style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
                >
                  <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <p className="text-amber-950">{location.swiftWarning}</p>
                </div>
              )}
              {mode === "local" && location.payerNote && (
                <div
                  className="flex gap-2 rounded-md px-2.5 py-2 mb-3 text-[12px] leading-snug"
                  style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}
                >
                  <Info className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
                  <p className="text-gray-700">{location.payerNote}</p>
                </div>
              )}

              <dl className="border-t border-gray-100 pt-1">
                {mode === "local" && (
                  <BankDetailRow
                    label="Payment method"
                    value={location.paymentMethodLocal}
                    onCopy={() => {
                      void navigator.clipboard.writeText(location.paymentMethodLocal);
                      toast.success("Copied");
                    }}
                  />
                )}
                {activeRows.map((row) => (
                  <BankDetailRow
                    key={row.label}
                    label={row.label}
                    value={row.value}
                    onCopy={() => {
                      void navigator.clipboard.writeText(row.value);
                      toast.success(`${row.label} copied`);
                    }}
                  />
                ))}
              </dl>
              <p className="text-[11px] text-gray-400 mt-3 leading-snug">
                Typical settlement: {location.estimatedSettlementDays}. FX ref {formatDate(location.fxUpdatedAt)}.
              </p>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-[11px] text-gray-500 leading-snug mb-3">
                  Share a link or copy all fields for your client.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  <Button
                    variant="outline"
                    size="md"
                    className="min-h-11 px-4 text-[13px] font-semibold w-full justify-center"
                    leftIcon={<Share2 className="w-4 h-4" />}
                    onClick={sharePlaceholder}
                  >
                    Share with client
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    className="min-h-11 px-4 text-[13px] font-semibold w-full justify-center"
                    leftIcon={<Copy className="w-4 h-4" />}
                    onClick={() => copyRows(rowsForCopy)}
                  >
                    Copy all details
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-5 min-w-0 space-y-3 order-1 xl:order-2">
            <h3 className="text-[14px] font-semibold text-gray-900 tracking-tight px-0.5">
              Recent MCA transactions from {recentMcaTransactionsPlace(location)}
            </h3>
            <DataTable<McaRecentInbound>
              columns={recentInboundColumns}
              data={recentInbounds}
              rowKey={(row) => row.id}
              pageSize={10}
              skeletonRows={5}
              emptyTitle="No recent inbounds"
              emptyDescription="When payers send funds here, they will appear in this list."
            />
            <ForexCalculatorBanner onOpen={() => setForexModalOpen(true)} />
          </div>
        </div>

        <ForexCalculatorModal
          open={forexModalOpen}
          onOpenChange={setForexModalOpen}
          localCurrency={location.localCurrency}
          fxInrPerUnit={location.fxRateToInr}
          flag={location.flag}
        />
      </div>
    </div>
  );
}
