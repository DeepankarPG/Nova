"use client";

/**
 * /m/app — Full mobile experience for real devices (no phone-frame wrapper).
 * Open on your phone: http://[mac-ip]:3000/m/app
 */

import { useState } from "react";
import Image from "next/image";
import {
  House, ArrowUpDown, BarChart3, Globe, Bell, Eye, EyeClosed,
  Plus, Link2, Nfc, Settings2, FilePlus2, Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { MobileCreateMcaLink }      from "@/components/layout/mobile/MobileCreateMcaLink";
import { MobileEditInvoice }        from "@/components/dashboard/mobile/MobileEditInvoice";
import { MobileSettlementReports }  from "@/components/dashboard/mobile/MobileSettlementReports";
import { MobileEbrc }              from "@/components/dashboard/mobile/MobileEbrc";
import { MobileHamburgerDrawer }    from "@/components/layout/mobile/MobileHamburgerDrawer";
import { MobileMoreSheet }          from "@/components/layout/mobile/MobileMoreSheet";
import { MobileEchoSheet }          from "@/components/layout/mobile/MobileEchoSheet";
import { MobileNotifications }      from "@/components/layout/mobile/MobileNotifications";
import { MobileCreatePaymentLink }  from "@/components/layout/mobile/MobileCreatePaymentLink";
import { MobileTapToPay }           from "@/components/layout/mobile/MobileTapToPay";
import { MobileFilterSheet }        from "@/components/layout/mobile/MobileFilterSheet";
import { MobileSplashScreen }       from "@/components/layout/mobile/MobileSplashScreen";
import { MobileLoginFlow }          from "@/components/layout/mobile/MobileLoginFlow";
import { MobileDashboardHome }      from "@/components/dashboard/mobile/MobileDashboardHome";
import {
  MobileAnalytics, AnalyticsEditOverlay,
  loadAnalyticsCharts, saveAnalyticsCharts,
} from "@/components/dashboard/mobile/MobileAnalytics";
import { MobileTransactions }       from "@/components/dashboard/mobile/MobileTransactions";
import { MobileInternational, CountrySheet, COUNTRIES } from "@/components/dashboard/mobile/MobileInternational";
import type { Country as IntlCountry } from "@/components/dashboard/mobile/MobileInternational";
import { HideAmountsProvider, useHideAmounts } from "@/lib/hide-amounts-context";
import type { FilterId }            from "@/components/dashboard/mobile/MobileTransactions";
import { cn } from "@/lib/utils";

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

function AppScreen() {
  const [splashDone,       setSplashDone]       = useState(false);
  const [loginDone,        setLoginDone]        = useState(false);
  const [drawerOpen,       setDrawerOpen]       = useState(false);
  const [moreOpen,         setMoreOpen]         = useState(false);
  const [echoOpen,         setEchoOpen]         = useState(false);
  const [notifsOpen,       setNotifsOpen]       = useState(false);
  const [paymentLinkOpen,  setPaymentLinkOpen]  = useState(false);
  const [tapToPayOpen,     setTapToPayOpen]     = useState(false);
  const [filterOpen,       setFilterOpen]       = useState<FilterId | null>(null);
  const [appliedFilters,   setAppliedFilters]   = useState<Partial<Record<FilterId, string>>>({});
  const [plusOpen,         setPlusOpen]         = useState(false);
  const [activeTab,        setActiveTab]        = useState<TabId>("home");
  const [intlSheetOpen,    setIntlSheetOpen]    = useState(false);
  const [intlCountry,      setIntlCountry]      = useState<IntlCountry>(COUNTRIES[0]);
  const [analyticsChartIds, setAnalyticsChartIds] = useState<string[]>(() => loadAnalyticsCharts());
  const [analyticsEditOpen, setAnalyticsEditOpen] = useState(false);
  const [mcaLinkOpen,       setMcaLinkOpen]       = useState(false);
  const [editInvoiceId,     setEditInvoiceId]     = useState<string | null>(null);
  const [settlementOpen,    setSettlementOpen]    = useState(false);
  const [settlementFilter,  setSettlementFilter]  = useState<string | null>(null);
  const [ebrcOpen,          setEbrcOpen]          = useState(false);
  const { hidden, toggle } = useHideAmounts();

  return (
    <div className="relative flex flex-col w-full overflow-hidden bg-no-repeat"
      style={{
        height: "100dvh",
        backgroundColor: "#f6f8fa",
        backgroundImage: "linear-gradient(to bottom, #dbeafe 0%, #f6f8fa 380px)",
        backgroundSize: "100% 380px",
      }}
    >
      {/* ── Header ── */}
      {activeTab === "home" ? (
        <div className="flex items-center gap-3 px-4 py-3 bg-transparent shrink-0"
          style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}>
          <button type="button" onClick={() => setDrawerOpen(true)}
            className="h-10 w-10 rounded-full overflow-hidden shrink-0 ring-2 ring-white/60 shadow-sm">
            <Image src="/pexels-santhosh-shanbhag-564865255-16826482.jpg" alt="Profile"
              width={40} height={40} className="h-full w-full object-cover" priority />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-foreground leading-tight">
              {getGreeting()}, Deep{" "}
              <span className="inline-block animate-[wave_2s_ease-in-out_infinite] origin-[70%_70%]">👋</span>
            </p>
            <p className="text-[12px] text-muted-foreground leading-tight mt-0.5">{getSubtitle()}</p>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button type="button" onClick={toggle}
              className="h-9 w-9 flex items-center justify-center rounded-full text-foreground">
              {hidden ? <EyeClosed className="h-[18px] w-[18px]" strokeWidth={1.75} />
                      : <Eye       className="h-[18px] w-[18px]" strokeWidth={1.75} />}
            </button>
            <button type="button" onClick={() => setNotifsOpen(true)}
              className="relative h-9 w-9 flex items-center justify-center rounded-full text-foreground">
              <Bell className="h-[19px] w-[19px]" strokeWidth={1.75} />
              <span className="absolute top-[9px] right-[9px] h-[7px] w-[7px] rounded-full bg-red-500 border-[1.5px] border-background" aria-hidden />
            </button>
          </div>
        </div>
      ) : (
        <div className="px-5 bg-transparent shrink-0 flex items-center justify-between"
          style={{ paddingTop: "max(12px, env(safe-area-inset-top))", paddingBottom: 12 }}>
          <h1 className="text-[20px] font-bold text-foreground tracking-tight">
            {activeTab === "analytics" ? "Analytics" : activeTab === "txns" ? "Transactions" : "International"}
          </h1>
          {activeTab === "analytics" && (
            <button type="button" onClick={() => setAnalyticsEditOpen(true)}
              className="text-[14px] font-medium text-primary active:opacity-60"
            >
              Edit
            </button>
          )}
        </div>
      )}

      {/* ── Scrollable content ── */}
      <div className="flex-1 min-h-0 overflow-y-auto pb-[108px]">
        {activeTab === "analytics" ? <MobileAnalytics chartIds={analyticsChartIds} onEditOpen={() => setAnalyticsEditOpen(true)} /> :
         activeTab === "txns" ? (
           <MobileTransactions
             appliedFilters={appliedFilters}
             onOpenFilter={setFilterOpen}
             onClearFilter={(id) => setAppliedFilters(prev => { const n = {...prev}; delete n[id]; return n; })}
             settlementFilter={settlementFilter}
             onClearSettlementFilter={() => setSettlementFilter(null)}
           />
         ) :
         activeTab === "intl" ? (
           <MobileInternational
             onOpenCountrySheet={() => setIntlSheetOpen(true)}
             externalCountry={intlCountry}
             onCountryChange={setIntlCountry}
           />
         ) :
         <MobileDashboardHome
           onCreatePaymentLink={() => setPaymentLinkOpen(true)}
           onTapToPay={() => setTapToPayOpen(true)}
         />}
      </div>

      {/* ── Echo FAB ── */}
      <button type="button" onClick={() => setEchoOpen(true)} aria-label="Open Echo"
        className="fixed z-40 flex items-center justify-center h-14 w-14 rounded-full transition-transform duration-150 active:scale-95"
        style={{
          bottom: "calc(72px + env(safe-area-inset-bottom) + 6px)",
          right: "16px",
          background: "linear-gradient(135deg, #4f46e5, #1e40af, #2563eb, #60a5fa)",
          boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/echo_logo copy.svg" alt="Echo" width={26} height={26}
          style={{ filter: "brightness(0) invert(1)" }} />
      </button>

      {/* ── Centered + overlay ── */}
      <AnimatePresence>
        {plusOpen && (
          <>
            {/* No backdrop — transparent dismiss layer */}
            <motion.div key="plus-bd-app"
              className="fixed inset-0 z-[45]"
              onClick={() => setPlusOpen(false)}
            />
            <motion.div key="plus-card-app"
              className="fixed z-[46] bg-card rounded-2xl overflow-hidden"
              style={{
                left: "50%",
                bottom: "calc(env(safe-area-inset-bottom) + 64px + 16px + 12px)",
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
                { label: "Payment link",    Icon: Link2,     iconBg: "bg-primary/10",  iconColor: "text-primary",          action: () => { setPaymentLinkOpen(true);  setPlusOpen(false); } },
                { label: "Create Invoice",  Icon: FilePlus2, iconBg: "bg-violet-50",  iconColor: "text-violet-500",       action: () => { setEditInvoiceId("new");   setPlusOpen(false); } },
                { label: "Create MCA link", Icon: Zap,       iconBg: "bg-amber-50",   iconColor: "text-amber-500",        action: () => { setMcaLinkOpen(true);      setPlusOpen(false); } },
                { label: "Tap to Pay",      Icon: Nfc,       iconBg: "bg-sky-50",     iconColor: "text-sky-500",          action: () => { setTapToPayOpen(true);     setPlusOpen(false); } },
                { label: "Settings",        Icon: Settings2, iconBg: "bg-muted",      iconColor: "text-muted-foreground", action: () => { setMoreOpen(true);         setPlusOpen(false); } },
              ].map((item, i) => {
                const Icon = item.Icon;
                return (
                  <button key={item.label} type="button" onClick={item.action}
                    className={cn("w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-muted/60 transition-colors", i > 0 && "border-t border-border/50")}
                  >
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

      {/* ── Bottom nav: [Home][Analytics][+][Txns][Intl] — no text labels ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border/60"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex items-center h-[64px] px-2">
          {/* Home, Analytics */}
          {TABS.slice(0, 2).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} type="button"
                onClick={() => { setActiveTab(tab.id); setPlusOpen(false); }}
                className={cn("flex-1 flex items-center justify-center h-full transition-colors",
                  active ? "text-primary" : "text-muted-foreground")}
              >
                <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.25 : 1.75} />
              </button>
            );
          })}
          {/* + center */}
          <div className="flex-1 flex items-center justify-center h-full">
            <button type="button" onClick={() => setPlusOpen(p => !p)}>
              <motion.div
                className={cn("h-[38px] w-[38px] rounded-full flex items-center justify-center transition-colors",
                  plusOpen ? "bg-primary" : "bg-muted/80 border border-border/60")}
                animate={{ rotate: plusOpen ? 45 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
              >
                <Plus className={cn("h-5 w-5", plusOpen ? "text-white" : "text-muted-foreground")} strokeWidth={2} />
              </motion.div>
            </button>
          </div>
          {/* Txns, Intl */}
          {TABS.slice(2).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} type="button"
                onClick={() => { setActiveTab(tab.id); setPlusOpen(false); }}
                className={cn("flex-1 flex items-center justify-center h-full transition-colors",
                  active ? "text-primary" : "text-muted-foreground")}
              >
                <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.25 : 1.75} />
              </button>
            );
          })}
        </div>
        <div className="flex justify-center pb-1.5">
          <div className="h-1 w-28 rounded-full bg-foreground/20" aria-hidden />
        </div>
      </div>

      {/* ── Sheets ── */}
      <MobileMoreSheet         open={moreOpen}        onClose={() => setMoreOpen(false)}         onSettlementTap={() => { setMoreOpen(false); setSettlementOpen(true); }} />
      <MobileEchoSheet         open={echoOpen}        onClose={() => setEchoOpen(false)}         />
      <MobileNotifications     open={notifsOpen}      onClose={() => setNotifsOpen(false)}       />
      <MobileCreatePaymentLink open={paymentLinkOpen} onClose={() => setPaymentLinkOpen(false)}  />
      <MobileTapToPay          open={tapToPayOpen}    onClose={() => setTapToPayOpen(false)}     />
      {/* Country sheet — fixed on device, covers full screen natively */}
      <CountrySheet
        open={intlSheetOpen}
        selected={intlCountry}
        onSelect={setIntlCountry}
        onClose={() => setIntlSheetOpen(false)}
      />
      <MobileFilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(null)}
        onApply={(id, summary) => { setAppliedFilters(prev => ({ ...prev, [id]: summary })); setFilterOpen(null); }}
      />
      <MobileHamburgerDrawer   open={drawerOpen}      onClose={() => setDrawerOpen(false)}        onSettlementTap={() => { setDrawerOpen(false); setSettlementOpen(true); }} onEbrcTap={() => { setDrawerOpen(false); setEbrcOpen(true); }} />
      <MobileSettlementReports
        open={settlementOpen}
        onClose={() => setSettlementOpen(false)}
        onTxnLinkTap={(id) => {
          setSettlementOpen(false);
          setActiveTab("txns");
          setSettlementFilter(id);
        }}
      />
      <MobileEbrc              open={ebrcOpen}        onClose={() => setEbrcOpen(false)}         />
      <MobileCreateMcaLink     open={mcaLinkOpen}     onClose={() => setMcaLinkOpen(false)}      />

      {/* ── Login (after splash) ── */}
      {splashDone && !loginDone && <MobileLoginFlow onDone={() => setLoginDone(true)} />}

      {/* ── Splash ── */}
      {!splashDone && <MobileSplashScreen onDone={() => setSplashDone(true)} />}

      {/* ── Edit Invoice — blur backdrop ── */}
      <AnimatePresence>
        {editInvoiceId && (
          <motion.div
            key="edit-inv-backdrop"
            className="absolute inset-0 z-79"
            style={{ backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)", background:"rgba(0,0,0,0.2)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setEditInvoiceId(null)}
          />
        )}
      </AnimatePresence>
      {/* ── Edit Invoice — bottom sheet ── */}
      <AnimatePresence>
        {editInvoiceId && (
          <motion.div
            key={`edit-${editInvoiceId}`}
            className="absolute inset-x-0 bottom-0 z-80 flex flex-col bg-background overflow-hidden"
            style={{ height:"93%", borderTopLeftRadius:24, borderTopRightRadius:24, paddingBottom:"env(safe-area-inset-bottom)" }}
            initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }}
            transition={{ duration:0.3, ease:[0.32,0.72,0,1] }}
          >
            <MobileEditInvoice
              invId={null}
              onClose={() => setEditInvoiceId(null)}
              onPreview={() => setEditInvoiceId(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Analytics Edit overlay ── */}
      <AnalyticsEditOverlay
        open={analyticsEditOpen}
        chartIds={analyticsChartIds}
        onClose={() => setAnalyticsEditOpen(false)}
        onApply={(ids) => {
          setAnalyticsChartIds(ids);
          saveAnalyticsCharts(ids);
          setAnalyticsEditOpen(false);
        }}
      />
    </div>
  );
}

export default function MobileAppPage() {
  return (
    <HideAmountsProvider>
      <AppScreen />
    </HideAmountsProvider>
  );
}
