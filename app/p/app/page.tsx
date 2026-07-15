"use client";

/**
 * /p/app -- Full-screen iPad experience for real devices (no frame wrapper).
 * Open on your iPad: http://[mac-ip]:3000/p/app
 *
 * TODO: Add process.env.NODE_ENV === "production" redirect if needed.
 */

import { useEffect, useRef, useState } from "react";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import Image from "next/image";
import {
  House, ArrowUpDown, ArrowLeft, BarChart3, Globe,
  Bell, Eye, EyeClosed, Plus, Link2, FilePlus2, Zap,
  ChevronDown, Check, X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { MobileSplashScreen }        from "@/components/layout/mobile/MobileSplashScreen";
import { MobileLoginFlow }           from "@/components/layout/mobile/MobileLoginFlow";
import { MobileHamburgerDrawer }     from "@/components/layout/mobile/MobileHamburgerDrawer";
import { MobileMoreSheet }           from "@/components/layout/mobile/MobileMoreSheet";
import { MobileEchoSheet }           from "@/components/layout/mobile/MobileEchoSheet";
import { MobileNotifications }       from "@/components/layout/mobile/MobileNotifications";
import { MobileCreatePaymentLink }   from "@/components/layout/mobile/MobileCreatePaymentLink";
import { MobileTapToPay }            from "@/components/layout/mobile/MobileTapToPay";
import { MobileFilterSheet }         from "@/components/layout/mobile/MobileFilterSheet";
import { MobileDashboardHome, BannerCarousel, CriticalNotificationsSheet } from "@/components/dashboard/mobile/MobileDashboardHome";
import { MobileTransactionDetail }   from "@/components/dashboard/mobile/MobileTransactionDetail";
import type { RecentTxnItem }        from "@/components/dashboard/mobile/MobileTransactionDetail";
import {
  MobileAnalytics, AnalyticsEditOverlay,
  loadAnalyticsCharts, saveAnalyticsCharts,
} from "@/components/dashboard/mobile/MobileAnalytics";
import { MobileTransactions }        from "@/components/dashboard/mobile/MobileTransactions";
import { MobilePaymentLinks }        from "@/components/dashboard/mobile/MobilePaymentLinks";
import { MobileInvoices }            from "@/components/dashboard/mobile/MobileInvoices";
import { MobileMcaLinks }            from "@/components/dashboard/mobile/MobileMcaLinks";
import { MobileCreateMcaLink }       from "@/components/layout/mobile/MobileCreateMcaLink";
import { MobilePaymentLinkDetail }   from "@/components/dashboard/mobile/MobilePaymentLinkDetail";
import { MobileInvoicePreview }      from "@/components/dashboard/mobile/MobileInvoicePreview";
import { MobileEditInvoice }         from "@/components/dashboard/mobile/MobileEditInvoice";
import { MobileInvoiceStatus }       from "@/components/dashboard/mobile/MobileInvoiceStatus";
import { MobileSettlementReports }   from "@/components/dashboard/mobile/MobileSettlementReports";
import { MobileEbrc }               from "@/components/dashboard/mobile/MobileEbrc";
import { MobileDisputes }           from "@/components/dashboard/mobile/MobileDisputes";
import { MobileAppSettings }        from "@/components/dashboard/mobile/MobileAppSettings";
import { MobileAccountSettings }   from "@/components/dashboard/mobile/MobileAccountSettings";
import {
  MobileInternational, CountrySheet, COUNTRIES,
} from "@/components/dashboard/mobile/MobileInternational";
import type { Country as IntlCountry } from "@/components/dashboard/mobile/MobileInternational";
import { HideAmountsProvider, useHideAmounts } from "@/lib/hide-amounts-context";
import { WorkspaceProvider, useWorkspace }      from "@/lib/workspace-context";
import type { FilterId }            from "@/components/dashboard/mobile/MobileTransactions";
import { MobileFilterDrawer, emptyFilters } from "@/components/dashboard/mobile/MobileFilterDrawer";
import type { FilterState, FilterCat }      from "@/components/dashboard/mobile/MobileFilterDrawer";
import { cn } from "@/lib/utils";

const PAYMENTS_SUB_TABS = ["transactions", "payment-links", "invoice", "mca-links"] as const;
const slideVariants = {
  enter: (dir: number) => ({ x: dir >= 0 ? "100%" : "-100%" }),
  center: { x: "0%" },
  exit:  (dir: number) => ({ x: dir >= 0 ? "-100%" : "100%" }),
};

type TabId = "home" | "analytics" | "txns" | "intl";
const TABS: { id: TabId; icon: React.ElementType }[] = [
  { id: "home",      icon: House       },
  { id: "analytics", icon: BarChart3   },
  { id: "txns",      icon: ArrowUpDown },
  { id: "intl",      icon: Globe       },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}
function getSubtitle() {
  const h = new Date().getHours();
  if (h < 12) return "Here's your morning overview";
  if (h < 17) return "Here's how today is going";
  return "Here's your end-of-day recap";
}

function AppBody() {
  const [drawerOpen,       setDrawerOpen]       = useState(false);
  const [moreOpen,         setMoreOpen]         = useState(false);
  const [echoOpen,         setEchoOpen]         = useState(false);
  const [notifsOpen,       setNotifsOpen]       = useState(false);
  const [paymentLinkOpen,  setPaymentLinkOpen]  = useState(false);
  const [mcaLinkOpen,      setMcaLinkOpen]      = useState(false);
  const [tapToPayOpen,     setTapToPayOpen]     = useState(false);
  const [filterOpen,       setFilterOpen]       = useState<FilterId | null>(null);
  const [appliedFilters,   setAppliedFilters]   = useState<Partial<Record<FilterId, string>>>({});
  const [txnFilterOpen,    setTxnFilterOpen]    = useState(false);
  const [txnFilterCat,     setTxnFilterCat]     = useState<FilterCat | null>(null);
  const [txnFilterApplied, setTxnFilterApplied] = useState<FilterState>(emptyFilters());
  const [plusOpen,         setPlusOpen]         = useState(false);
  const [activeTab,        setActiveTab]        = useState<TabId>("home");
  const [intlMidSheetOpen, setIntlMidSheetOpen] = useState(false);
  const { mids }                                = useWorkspace();
  const [intlSelectedMidId, setIntlSelectedMidId] = useState(mids[0]?.id ?? "");
  const [paymentsSubTab,       setPaymentsSubTab]       = useState<"transactions" | "payment-links" | "invoice" | "mca-links">("transactions");
  const [swipeDir,             setSwipeDir]             = useState(0);
  const [selectedPaymentLink,  setSelectedPaymentLink]  = useState<string | null>(null);
  const [selectedInvoice,      setSelectedInvoice]      = useState<string | null>(null);
  const [invoicePreviewFromEdit, setInvoicePreviewFromEdit] = useState(false);
  const [editInvoiceId,        setEditInvoiceId]        = useState<string | null>(null);
  const [statusInvoiceId,      setStatusInvoiceId]      = useState<string | null>(null);
  const [statusToast,          setStatusToast]          = useState(false);
  const [analyticsChartIds,    setAnalyticsChartIds]    = useState<string[]>(() => loadAnalyticsCharts());
  const [analyticsEditOpen,    setAnalyticsEditOpen]    = useState(false);
  const [intlSheetOpen,       setIntlSheetOpen]       = useState(false);
  const [intlCountry,         setIntlCountry]         = useState<IntlCountry>(COUNTRIES[0]);
  const [criticalSheetOpen,   setCriticalSheetOpen]   = useState(false);
  const [selectedTxn,         setSelectedTxn]         = useState<RecentTxnItem | null>(null);
  const [settlementOpen,      setSettlementOpen]       = useState(false);
  const [settlementFilter,    setSettlementFilter]     = useState<string | null>(null);
  const [ebrcOpen,            setEbrcOpen]             = useState(false);
  const [disputesOpen,        setDisputesOpen]         = useState(false);
  const [appSettingsOpen,     setAppSettingsOpen]      = useState(false);
  const [accountSettingsOpen, setAccountSettingsOpen]  = useState(false);
  const [accountSettingsDirectDetail, setAccountSettingsDirectDetail] = useState<"contact_support" | "add_feedback" | undefined>(undefined);
  const { hidden, toggle } = useHideAmounts();

  type FrameToast = { id: number; message: string; type: "success" | "error" };
  const [frameToasts, setFrameToasts] = useState<FrameToast[]>([]);
  const toastCounter = useRef(0);
  function showFrameToast(message: string, type: "success" | "error") {
    const id = ++toastCounter.current;
    setFrameToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setFrameToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }

  const [mcaDisable, setMcaDisable] = useState<{ id: string; onConfirm: () => void } | null>(null);
  const subTabsScrollRef = useHorizontalScroll<HTMLDivElement>();

  useEffect(() => {
    const t = setTimeout(() => setCriticalSheetOpen(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="relative flex flex-col w-full bg-no-repeat"
      style={{
        height: "100dvh",
        backgroundColor: "#f6f8fa",
        backgroundImage: activeTab === "home" ? "linear-gradient(to bottom, #f6f8fa 24px, #dbeafe 180px, #f6f8fa 380px)" : "none",
        backgroundSize: "100% 380px",
      }}
    >
      {/* 20px top spacer for iPad status bar (no notch) */}
      <div style={{ height: 20, flexShrink: 0 }} />

      {/* Header */}
      {activeTab === "home" ? (
        <div className="flex items-center gap-3 px-4 py-3 bg-transparent shrink-0">
          <button type="button" onClick={() => setDrawerOpen(true)}
            className="h-10 w-10 rounded-full overflow-hidden shrink-0 ring-2 ring-white/60 shadow-sm">
            <Image src="/pexels-santhosh-shanbhag-564865255-16826482.jpg" alt="Profile"
              width={40} height={40} className="h-full w-full object-cover" priority />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-foreground leading-tight truncate whitespace-nowrap">
              {getGreeting()}, Deep{" "}
              <span className="inline-block animate-[wave_2s_ease-in-out_infinite] origin-[70%_70%]">👋</span>
            </p>
            <p className="text-[12px] text-muted-foreground leading-tight mt-0.5">{getSubtitle()}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={() => setNotifsOpen(true)}
              className="relative h-9 w-9 flex items-center justify-center rounded-full text-foreground">
              <Bell className="h-[19px] w-[19px]" strokeWidth={1.75} />
              <span className="absolute top-[9px] right-[9px] h-[7px] w-[7px] rounded-full bg-red-500 border-[1.5px] border-background" aria-hidden />
            </button>
            <button type="button" onClick={toggle}
              className="h-9 w-9 flex items-center justify-center rounded-full text-foreground">
              {hidden ? <EyeClosed className="h-[18px] w-[18px]" strokeWidth={1.75} />
                      : <Eye      className="h-[18px] w-[18px]" strokeWidth={1.75} />}
            </button>
          </div>
        </div>
      ) : activeTab === "txns" ? (
        <div className="px-5 bg-transparent shrink-0" style={{ paddingBottom: 12 }}>
          <h1 className="text-[20px] font-bold text-foreground tracking-tight">Payments</h1>
        </div>
      ) : activeTab === "analytics" ? (
        <div className="px-5 bg-transparent shrink-0 flex items-center justify-between" style={{ paddingBottom: 12 }}>
          <h1 className="text-[20px] font-bold text-foreground tracking-tight">Analytics</h1>
          <button type="button" onClick={() => setAnalyticsEditOpen(true)}
            className="text-[14px] font-medium text-primary active:opacity-60">Edit</button>
        </div>
      ) : (
        <div className="px-5 bg-transparent shrink-0 flex items-center justify-between" style={{ paddingBottom: 12 }}>
          <h1 className="text-[20px] font-bold text-foreground tracking-tight">International</h1>
          {(() => {
            const selectedMid = mids.find(m => m.id === intlSelectedMidId) ?? mids[0];
            return (
              <button type="button" onClick={() => setIntlMidSheetOpen(true)}
                className="flex items-center gap-1.5 h-7.5 px-3 rounded-full bg-[#F5F5F5] dark:bg-muted"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <span className="text-[12px] font-semibold text-primary leading-none">
                  {"••••" + (selectedMid?.maskedId ?? "")}
                </span>
                <ChevronDown className="h-3 w-3 text-primary" strokeWidth={2.5} />
              </button>
            );
          })()}
        </div>
      )}

      {/* Payments sub-tab bar */}
      {activeTab === "txns" && (
        <div className="shrink-0 bg-transparent border-b border-border/50">
          <div ref={subTabsScrollRef} className="[&::-webkit-scrollbar]:hidden" style={{ overflowX: "scroll", scrollbarWidth: "none", WebkitOverflowScrolling: "touch", cursor: "grab" } as React.CSSProperties}>
            <div className="flex w-max">
              {[
                { id: "transactions",  label: "Transactions"  },
                { id: "payment-links", label: "Payment Links" },
                { id: "invoice",       label: "Invoice"       },
                { id: "mca-links",     label: "MCA Links"     },
              ].map((tab) => {
                const active = tab.id === paymentsSubTab;
                return (
                  <button key={tab.id} type="button"
                    onClick={() => {
                      if (tab.id === "transactions" || tab.id === "payment-links" || tab.id === "invoice" || tab.id === "mca-links") {
                        const newIdx = PAYMENTS_SUB_TABS.indexOf(tab.id);
                        const oldIdx = PAYMENTS_SUB_TABS.indexOf(paymentsSubTab);
                        setSwipeDir(newIdx >= oldIdx ? 1 : -1);
                        setPaymentsSubTab(tab.id);
                      }
                    }}
                    className={cn(
                      "relative shrink-0 px-4 h-10 text-[13.5px] whitespace-nowrap transition-colors",
                      active ? "font-semibold text-primary" : "font-normal text-muted-foreground"
                    )}
                  >
                    {tab.label}
                    {active && <span className="absolute inset-x-4 bottom-0 h-[2.5px] bg-primary rounded-full" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Scrollable content */}
      {activeTab !== "txns" && (
        <div
          className={cn(
            "flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden",
            activeTab === "home" ? "pb-[160px]" : "pb-[76px]"
          )}
          style={{ scrollbarWidth: "none" }}
        >
          {activeTab === "analytics" ? (
            <MobileAnalytics chartIds={analyticsChartIds} onEditOpen={() => setAnalyticsEditOpen(true)} />
          ) : activeTab === "intl" ? (
            <MobileInternational
              onOpenCountrySheet={() => setIntlSheetOpen(true)}
              externalCountry={intlCountry}
              onCountryChange={setIntlCountry}
            />
          ) : (
            <MobileDashboardHome
              onCreatePaymentLink={() => setPaymentLinkOpen(true)}
              onTapToPay={() => setTapToPayOpen(true)}
              onTxnTap={setSelectedTxn}
              onSeeAllTransactions={() => setActiveTab("txns")}
              onSettlementsOpen={() => setSettlementOpen(true)}
              onDisputesOpen={() => setDisputesOpen(true)}
            />
          )}
        </div>
      )}

      {/* Payments tab content */}
      {activeTab === "txns" && (
        <div className="flex-1 min-h-0 relative overflow-hidden">
          <AnimatePresence initial={false} custom={swipeDir}>
            <motion.div
              key={paymentsSubTab}
              custom={swipeDir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="absolute inset-0 overflow-y-auto [&::-webkit-scrollbar]:hidden pb-[76px]"
              style={{ scrollbarWidth: "none" }}
            >
              {paymentsSubTab === "payment-links"
                ? <MobilePaymentLinks onCardTap={setSelectedPaymentLink} onCreatePaymentLink={() => setPaymentLinkOpen(true)} />
                : paymentsSubTab === "invoice"
                ? <MobileInvoices onPreview={setSelectedInvoice} onEdit={setEditInvoiceId} onCreateInvoice={() => setEditInvoiceId("new")} onStatus={setStatusInvoiceId} />
                : paymentsSubTab === "mca-links"
                ? <MobileMcaLinks
                    onCreateMcaLink={() => setMcaLinkOpen(true)}
                    onDisableRequest={(id, onConfirm) => setMcaDisable({ id, onConfirm })}
                    onToast={showFrameToast}
                  />
                : (
                  <MobileTransactions
                    externalFilterState={txnFilterApplied}
                    onFilterButtonTap={() => { setTxnFilterCat(null); setTxnFilterOpen(true); }}
                    onChipTap={(cat) => { setTxnFilterCat(cat); setTxnFilterOpen(true); }}
                    onTxnTap={setSelectedTxn}
                    settlementFilter={settlementFilter}
                    onClearSettlementFilter={() => setSettlementFilter(null)}
                  />
                )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Echo FAB */}
      <button type="button" onClick={() => setEchoOpen(true)} aria-label="Open Echo"
        className="fixed z-40 flex items-center justify-center h-14 w-14 rounded-full transition-transform duration-150 active:scale-95"
        style={{
          bottom: activeTab === "home" ? "calc(160px + 8px)" : "calc(72px + 6px)",
          right: "16px",
          background: "linear-gradient(135deg, #4f46e5, #1e40af, #2563eb, #60a5fa)",
          boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/echo_logo copy.svg" alt="Echo" width={26} height={26}
          style={{ filter: "brightness(0) invert(1)" }} />
      </button>

      {/* Plus action card */}
      <AnimatePresence>
        {plusOpen && (
          <>
            <motion.div key="plus-bd" className="fixed inset-0 z-[45]" onClick={() => setPlusOpen(false)} />
            <motion.div key="plus-card"
              className="fixed z-[46] bg-card rounded-2xl overflow-hidden"
              style={{
                left: "50%",
                bottom: "calc(64px + 16px + 12px)",
                translateX: "-50%",
                width: 240,
                boxShadow: "0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)",
                border: "1px solid var(--border)",
              }}
              initial={{ opacity: 0, scale: 0.88, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 12 }}
              transition={{ type: "spring", stiffness: 460, damping: 34 }}
            >
              {[
                { label: "Payment link",    Icon: Link2,     iconBg: "bg-primary/10", iconColor: "text-primary",    action: () => { setPaymentLinkOpen(true); setPlusOpen(false); } },
                { label: "Create Invoice",  Icon: FilePlus2, iconBg: "bg-violet-50",  iconColor: "text-violet-500", action: () => { setEditInvoiceId("new"); setPlusOpen(false); } },
                { label: "Create MCA link", Icon: Zap,       iconBg: "bg-amber-50",   iconColor: "text-amber-500",  action: () => { setMcaLinkOpen(true); setPlusOpen(false); } },
              ].map((item, i) => {
                const Icon = item.Icon;
                return (
                  <button key={item.label} type="button" onClick={item.action}
                    className={cn("w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-muted/60 transition-colors", i > 0 && "border-t border-border/50")}>
                    <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center shrink-0", item.iconBg)}>
                      <Icon className={cn("h-4 w-4", item.iconColor)} strokeWidth={1.75} />
                    </div>
                    <span className="text-[13.5px] font-semibold text-foreground">{item.label}</span>
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        {activeTab === "home" && <BannerCarousel onOpen={() => setNotifsOpen(true)} />}
        <div className="bg-background border-t border-border/60">
          <div className="flex items-center h-[64px] px-2">
            {TABS.slice(0, 2).map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} type="button"
                  onClick={() => { setActiveTab(tab.id); setPlusOpen(false); }}
                  className={cn("flex-1 flex items-center justify-center h-full transition-colors",
                    active ? "text-primary" : "text-muted-foreground")}>
                  <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.25 : 1.75} />
                </button>
              );
            })}
            <div className="flex-1 flex items-center justify-center h-full">
              <button type="button" onClick={() => setPlusOpen(p => !p)}>
                <motion.div
                  className={cn("h-9.5 w-9.5 rounded-full flex items-center justify-center transition-colors",
                    plusOpen ? "bg-muted/80 border border-border/60" : "bg-primary")}
                  animate={{ rotate: plusOpen ? 45 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 32 }}
                >
                  <Plus className={cn("h-5 w-5", plusOpen ? "text-muted-foreground" : "text-white")} strokeWidth={2} />
                </motion.div>
              </button>
            </div>
            {TABS.slice(2).map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} type="button"
                  onClick={() => { setActiveTab(tab.id); setPlusOpen(false); }}
                  className={cn("flex-1 flex items-center justify-center h-full transition-colors",
                    active ? "text-primary" : "text-muted-foreground")}>
                  <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.25 : 1.75} />
                </button>
              );
            })}
          </div>
          <div className="flex justify-center pb-1.5">
            <div className="h-1 w-28 rounded-full bg-foreground/20" aria-hidden />
          </div>
        </div>
      </div>

      {/* Sheets -- fixed positioning for real device */}
      <MobileMoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} onSettlementTap={() => { setMoreOpen(false); setSettlementOpen(true); }} />
      <MobileEchoSheet open={echoOpen} onClose={() => setEchoOpen(false)} />
      <MobileNotifications open={notifsOpen} onClose={() => setNotifsOpen(false)} />
      <CriticalNotificationsSheet open={criticalSheetOpen} onClose={() => setCriticalSheetOpen(false)} />
      <MobileCreatePaymentLink open={paymentLinkOpen} onClose={() => setPaymentLinkOpen(false)} />
      <MobileCreateMcaLink open={mcaLinkOpen} onClose={() => setMcaLinkOpen(false)} />
      <MobileTapToPay open={tapToPayOpen} onClose={() => setTapToPayOpen(false)} />
      <CountrySheet open={intlSheetOpen} selected={intlCountry} onSelect={setIntlCountry} onClose={() => setIntlSheetOpen(false)} />
      <MobileFilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(null)}
        onApply={(id, summary) => { setAppliedFilters(prev => ({ ...prev, [id]: summary })); setFilterOpen(null); }}
      />
      <MobileHamburgerDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSettlementTap={() => { setDrawerOpen(false); setSettlementOpen(true); }}
        onEbrcTap={() => { setDrawerOpen(false); setEbrcOpen(true); }}
        onDisputesTap={() => { setDrawerOpen(false); setDisputesOpen(true); }}
        onAppSettingsTap={() => { setDrawerOpen(false); setAccountSettingsOpen(true); }}
        onContactSupportTap={() => { setDrawerOpen(false); setAccountSettingsDirectDetail("contact_support"); setAccountSettingsOpen(true); }}
        onAddFeedbackTap={() => { setDrawerOpen(false); setAccountSettingsDirectDetail("add_feedback"); setAccountSettingsOpen(true); }}
      />
      <MobileEbrc open={ebrcOpen} onClose={() => setEbrcOpen(false)} />
      <MobileDisputes open={disputesOpen} onClose={() => setDisputesOpen(false)} />
      <MobileAppSettings open={appSettingsOpen} onClose={() => setAppSettingsOpen(false)} />
      <MobileAccountSettings
        open={accountSettingsOpen}
        onClose={() => { setAccountSettingsOpen(false); setAccountSettingsDirectDetail(undefined); setDrawerOpen(true); }}
        directDetail={accountSettingsDirectDetail}
      />
      <MobileSettlementReports
        open={settlementOpen}
        onClose={() => setSettlementOpen(false)}
        onTxnLinkTap={(id) => {
          setSettlementOpen(false);
          setActiveTab("txns");
          const newIdx = PAYMENTS_SUB_TABS.indexOf("transactions");
          const oldIdx = PAYMENTS_SUB_TABS.indexOf(paymentsSubTab);
          setSwipeDir(newIdx >= oldIdx ? 1 : -1);
          setPaymentsSubTab("transactions");
          setSettlementFilter(id);
        }}
      />

      {/* MID selector sheet */}
      <AnimatePresence>
        {intlMidSheetOpen && (
          <>
            <motion.div key="mid-sheet-bd" className="fixed inset-0 z-50 bg-black/40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }} onClick={() => setIntlMidSheetOpen(false)} />
            <motion.div key="mid-sheet" className="fixed inset-x-0 bottom-0 z-51 bg-background rounded-t-3xl overflow-hidden"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}>
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-foreground/20" />
              </div>
              <div className="flex items-center justify-between px-5 pt-3 pb-4 border-b border-border/50">
                <p className="text-[17px] font-bold text-foreground">Select merchant</p>
                <button type="button" onClick={() => setIntlMidSheetOpen(false)}
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground" aria-label="Close">
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: "55vh" }}>
                {mids.map((mid, i) => {
                  const isSelected = mid.id === intlSelectedMidId;
                  return (
                    <button key={mid.id} type="button"
                      onClick={() => { setIntlSelectedMidId(mid.id); setIntlMidSheetOpen(false); }}
                      className={cn("w-full flex items-center justify-between px-5 text-left transition-colors active:bg-muted/40", i > 0 && "border-t border-border/50")}
                      style={{ minHeight: 56 }}>
                      <div className="py-3">
                        <p className={cn("text-[15px] font-semibold leading-snug", isSelected ? "text-primary" : "text-foreground")}>{mid.name}</p>
                        <p className="text-[12px] text-muted-foreground mt-0.5">{"MID ••••" + mid.maskedId}</p>
                      </div>
                      {isSelected && (
                        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <div style={{ height: "env(safe-area-inset-bottom, 16px)" }} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Filter drawer */}
      <AnimatePresence>
        {txnFilterOpen && (
          <motion.div key="filter-backdrop" className="fixed inset-0 z-[69]"
            style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", background: "rgba(0,0,0,0.3)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }} onClick={() => setTxnFilterOpen(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {txnFilterOpen && (
          <motion.div key="filter-sheet" className="fixed inset-x-0 bottom-0 z-[70] flex flex-col bg-background overflow-hidden"
            style={{ height: "calc(100% - 44px)", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: "env(safe-area-inset-bottom)" }}
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}>
            <MobileFilterDrawer
              initialFilters={txnFilterApplied}
              initialCategory={txnFilterCat ?? undefined}
              onApply={(filters) => { setTxnFilterApplied(filters); setTxnFilterOpen(false); setTxnFilterCat(null); }}
              onReset={() => setTxnFilterApplied(emptyFilters())}
              onClose={() => { setTxnFilterOpen(false); setTxnFilterCat(null); }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction detail */}
      <AnimatePresence>
        {selectedTxn && (
          <motion.div key="txn-backdrop" className="fixed inset-0 z-[79]"
            style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", background: "rgba(0,0,0,0.2)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }} onClick={() => setSelectedTxn(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedTxn && (
          <motion.div key={selectedTxn.id} className="fixed inset-x-0 bottom-0 z-[80] flex flex-col bg-background overflow-hidden"
            style={{ height: "93%", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: "env(safe-area-inset-bottom)" }}
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}>
            <MobileTransactionDetail txn={selectedTxn} onClose={() => setSelectedTxn(null)} onOpenTransaction={setSelectedTxn} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analytics edit overlay */}
      <AnalyticsEditOverlay
        open={analyticsEditOpen}
        chartIds={analyticsChartIds}
        onClose={() => setAnalyticsEditOpen(false)}
        onApply={(ids) => { setAnalyticsChartIds(ids); saveAnalyticsCharts(ids); setAnalyticsEditOpen(false); }}
      />

      {/* In-frame toasts */}
      <div className="fixed inset-x-3 top-4 z-120 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {frameToasts.map(t => (
            <motion.div key={t.id}
              className="flex items-center gap-2.5 px-3.5 py-3 rounded-2xl border border-border shadow-lg bg-popover text-popover-foreground"
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.22, ease: "easeOut" }}>
              <span className="text-[13px] font-medium flex-1">{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function PadAppPage() {
  return (
    <WorkspaceProvider>
      <HideAmountsProvider>
        <AppBody />
      </HideAmountsProvider>
    </WorkspaceProvider>
  );
}
