"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BarChart2, ChevronRight, Clock, Copy, ExternalLink, PlayCircle, Plus, Share2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/shared/Button";
import { StatCard } from "@/components/dashboard/StatCard";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { BankDetailRow } from "@/components/international-accounts/BankDetailRow";
import { McaSavingsCard } from "@/components/international-accounts/McaSavingsCard";
import {
  getPlatformPayoutGuide,
  platformPayoutGuides,
  recentPayoutsForPlatform,
  type BankDetailRow as BankDetailRowData,
  type PlatformRecentPayout,
} from "@/lib/mock-data";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";

function copyRows(rows: BankDetailRowData[]) {
  const text = rows.map((r) => `${r.label}: ${r.value}`).join("\n");
  void navigator.clipboard.writeText(text);
  toast.success("All banking details copied");
}

function sharePlaceholder() {
  toast.message("Share with finance", {
    description: "Branded payout instructions can be enabled from your account settings.",
  });
}

function requestAnotherPlatform() {
  toast.success("Request received", {
    description: "We’ll reach out about additional marketplace or payroll connections.",
  });
}

function fmtPayoutAmt(amount: number, currency: string) {
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

const payoutColumns: Column<PlatformRecentPayout>[] = [
  {
    key: "amount",
    header: "Amount",
    minWidth: 120,
    render: (row) => (
      <div className="flex items-baseline gap-1.5 whitespace-nowrap">
        <span className="font-semibold text-gray-900 tabular-nums text-[13px]">
          {fmtPayoutAmt(row.amount, row.currency)}
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
    key: "reference",
    header: "Reference",
    minWidth: 160,
    render: (row) => (
      <span className="text-[13px] font-medium text-gray-800 whitespace-nowrap">{row.reference}</span>
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

export default function PlatformWithdrawalDetailPage() {
  const params = useParams();
  const platformId = params.platformId as string;
  const platform = useMemo(() => getPlatformPayoutGuide(platformId), [platformId]);
  const [regionId, setRegionId] = useState("");

  useEffect(() => {
    if (platform?.regions[0]) {
      setRegionId(platform.regions[0].id);
    }
  }, [platform]);

  const region = useMemo(
    () => platform?.regions.find((r) => r.id === regionId),
    [platform, regionId]
  );

  const recentPayouts = useMemo(
    () => (platform ? recentPayoutsForPlatform(platform.id, 5) : []),
    [platform]
  );

  if (!platform) {
    return (
      <div className="space-y-6">
        <div
          className="rounded-xl bg-white p-10 text-center"
          style={{ border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}
        >
          <p className="text-base font-semibold text-gray-900">Platform not found</p>
          <p className="text-sm text-gray-500 mt-2">Choose a platform from the list.</p>
          <Link
            href={`/payment-products/international-accounts/platform-withdrawals/${platformPayoutGuides[0]?.id ?? "amazon"}`}
            className="inline-block mt-6"
          >
            <Button variant="primary" size="lg">
              Go to platforms
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const analytics = platform.payoutAnalytics;

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
      <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-4 space-y-3">
        <p className="text-[13px] font-medium text-gray-500">Your platform</p>
        <div
          className="rounded-xl overflow-hidden bg-white"
          style={{ border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
        >
          <nav aria-label="Platforms">
            {platformPayoutGuides.map((p) => {
              const active = p.id === platform.id;
              return (
                <Link
                  key={p.id}
                  href={`/payment-products/international-accounts/platform-withdrawals/${p.id}`}
                  className={cn(
                    "flex items-center gap-3 min-h-11 px-4 py-2.5 text-[14px] transition-colors border-b border-gray-100",
                    active
                      ? "font-semibold text-gray-900 bg-[#eff4ff]"
                      : "font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <span className="text-lg leading-none shrink-0" aria-hidden>
                    {p.navIcon}
                  </span>
                  <span className="flex-1 text-left leading-snug">
                    <span className="block">{p.name}</span>
                    <span className="block text-[11px] font-normal text-gray-500">{p.category}</span>
                  </span>
                  {active && <ChevronRight className="w-4 h-4 text-[#0061E3] shrink-0" aria-hidden />}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-100 p-3 bg-gray-50/50">
            <button
              type="button"
              onClick={requestAnotherPlatform}
              className="w-full flex items-center justify-start gap-2 min-h-10 px-3 py-2 rounded-lg text-[13px] font-semibold text-[#0061E3] hover:bg-white/90 transition-colors text-left"
            >
              <Plus className="w-4 h-4 shrink-0" aria-hidden />
              <span>Connect another platform</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 space-y-4">
        <PageHeader
          className="!mb-2"
          titleAriaLabel={`${platform.name} payouts`}
          title={
            <span className="inline-flex items-center gap-2 flex-wrap">
              <span>{platform.name} payouts</span>
              <span className="text-[1.35rem] leading-none shrink-0" aria-hidden>
                {platform.navIcon}
              </span>
            </span>
          }
          subtitle={platform.headline}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {!platform.connected && (
                <span
                  className="inline-flex items-center min-h-9 px-2.5 rounded-lg text-[12px] font-semibold text-amber-800"
                  style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
                >
                  Setup required
                </span>
              )}
              <Button
                variant="outline"
                size="lg"
                leftIcon={<ExternalLink className="w-4 h-4" />}
                onClick={() => toast.message("Opening help center…")}
              >
                Payout help
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard
            title="Total earning"
            value={analytics.totalRevenue}
            suffix={` ${platform.statsCurrency}`}
            change={analytics.changeRevenue}
            changeLabel="vs last month"
            icon={BarChart2}
            iconPreset="brand"
            index={0}
            sparkline={analytics.sparkRevenue}
            tooltip="Gross payouts received from this platform in the period (illustrative)."
          />
          <StatCard
            title="Outstanding"
            value={analytics.outstanding}
            suffix={` ${platform.statsCurrency}`}
            subtitle={analytics.outstandingContext}
            icon={Clock}
            iconPreset="amber"
            index={1}
            tooltip="Amounts initiated by the platform but not yet credited to your virtual account (illustrative)."
          />
          <McaSavingsCard
            thisMonthInr={analytics.savingsThisMonthInr}
            vsBankPct={analytics.savingsVsBankPct}
            index={2}
          />
        </div>

        {platform.regions.length > 1 && (
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="inline-flex p-0.5 rounded-lg bg-gray-100 flex-wrap gap-0.5"
              style={{ border: "1px solid #e5e7eb" }}
              role="tablist"
              aria-label="Payout region"
            >
              {platform.regions.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  role="tab"
                  aria-selected={regionId === r.id}
                  onClick={() => setRegionId(r.id)}
                  className={cn(
                    "min-h-10 px-3 rounded-md text-[12px] font-semibold transition-all max-w-[220px] text-left leading-snug",
                    regionId === r.id
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                  style={regionId === r.id ? { border: "1px solid #e5e7eb" } : undefined}
                >
                  <span className="mr-1" aria-hidden>
                    {r.flag}
                  </span>
                  {r.currencyLabel.split("·")[0]?.trim() ?? r.currencyLabel}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 pt-1">
          <div className="xl:col-span-7 min-w-0 space-y-4 order-2 xl:order-1">
            <div
              className="rounded-xl bg-white p-4 sm:p-5"
              style={{ border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
            >
              <h3 className="text-[14px] font-semibold text-gray-900 mb-4">How to receive your payout</h3>
              <ol className="space-y-5">
                {platform.steps.map((step, i) => (
                  <li key={step.title} className="flex gap-3">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ background: "#0061E3" }}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-[13px] font-semibold text-gray-900 leading-snug">{step.title}</p>
                      <p className="text-[12px] text-gray-600 mt-1.5 leading-relaxed">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              {platform.helpHint && (
                <p className="text-[12px] text-gray-500 mt-5 pt-4 border-t border-gray-100 leading-relaxed">
                  {platform.helpHint}
                </p>
              )}
            </div>

            {region && (
              <div
                className="rounded-xl bg-white p-4 sm:p-5 relative overflow-hidden"
                style={{ border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
              >
                <div className="mb-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Virtual account</p>
                  <p className="text-[13px] font-semibold text-gray-900 mt-1">{region.currencyLabel}</p>
                  <p className="text-[13px] text-gray-600 mt-1 leading-snug">{region.label}</p>
                </div>

                <dl className="border-t border-gray-100 pt-1">
                  {region.detailRows.map((row) => (
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
                  Use exactly these details in {platform.name}&apos;s payout settings for this region.
                </p>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-[11px] text-gray-500 leading-snug mb-3">
                    Share instructions or copy all fields for your finance team.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    <Button
                      variant="outline"
                      size="md"
                      className="min-h-11 px-4 text-[13px] font-semibold w-full justify-center"
                      leftIcon={<Share2 className="w-4 h-4" />}
                      onClick={sharePlaceholder}
                    >
                      Share with team
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      className="min-h-11 px-4 text-[13px] font-semibold w-full justify-center"
                      leftIcon={<Copy className="w-4 h-4" />}
                      onClick={() => copyRows(region.detailRows)}
                    >
                      Copy all details
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {platform.videoGuideTitle && (
              <button
                type="button"
                onClick={() =>
                  toast.message("Video guides", {
                    description: "Tutorial playback will be available in your live environment.",
                  })
                }
                className="w-full flex items-center gap-4 min-h-[68px] px-4 py-3 rounded-xl text-left transition-colors hover:bg-gray-50 bg-white"
                style={{ border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl shrink-0"
                  style={{ background: "#fef2f2" }}
                >
                  <PlayCircle className="w-6 h-6 text-red-600" />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-gray-900">{platform.videoGuideTitle}</p>
                  <p className="text-[12px] text-gray-500 mt-0.5">Watch walkthrough</p>
                </div>
              </button>
            )}
          </div>

          <div className="xl:col-span-5 min-w-0 space-y-3 order-1 xl:order-2">
            <h3 className="text-[14px] font-semibold text-gray-900 tracking-tight px-0.5">
              Recent payouts from {platform.name}
            </h3>
            <DataTable<PlatformRecentPayout>
              columns={payoutColumns}
              data={recentPayouts}
              rowKey={(row) => row.id}
              pageSize={10}
              skeletonRows={4}
              emptyTitle="No recent payouts"
              emptyDescription="When the platform sends funds, they will appear here."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
