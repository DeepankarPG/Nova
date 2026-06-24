"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  House, ArrowUpDown, ArrowLeft, BarChart3, Globe,
  Bell, Eye, EyeClosed, Plus, Link2, Nfc, Settings2,
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
import { MobileTransactionDetail } from "@/components/dashboard/mobile/MobileTransactionDetail";
import type { RecentTxnItem } from "@/components/dashboard/mobile/MobileTransactionDetail";
import { MobileAnalytics }           from "@/components/dashboard/mobile/MobileAnalytics";
import { MobileTransactions }        from "@/components/dashboard/mobile/MobileTransactions";
import {
  MobileInternational,
  CountrySheet,
  COUNTRIES,
} from "@/components/dashboard/mobile/MobileInternational";
import type { Country as IntlCountry } from "@/components/dashboard/mobile/MobileInternational";
import { HideAmountsProvider, useHideAmounts } from "@/lib/hide-amounts-context";
import type { FilterId } from "@/components/dashboard/mobile/MobileTransactions";
import { MobileFilterDrawer, emptyFilters } from "@/components/dashboard/mobile/MobileFilterDrawer";
import type { FilterState } from "@/components/dashboard/mobile/MobileFilterDrawer";
import { cn } from "@/lib/utils";

/* ── Phone dimensions ── */
const PHONE_W = 393;
const PHONE_H = 780;

/* ── Carousel slides for login screen ── */
const slides = [
  {
    id: "settlements",
    // eslint-disable-next-line @next/next/no-img-element
    illustration: <img src="/Card_1.png" alt="" width="78%" height="210" style={{ objectFit: "contain", display: "block" }} />,
    header: "Complete visibility into every payment",
  },
  {
    id: "analytics",
    // eslint-disable-next-line @next/next/no-img-element
    illustration: <img src="/Card_2.png" alt="" width="78%" height="210" style={{ objectFit: "contain", display: "block" }} />,
    header: "Understand your business with real-time insights",
  },
  {
    id: "payment-links",
    // eslint-disable-next-line @next/next/no-img-element
    illustration: <img src="/Card_3.png" alt="" width="78%" height="210" style={{ objectFit: "contain", display: "block" }} />,
    header: "Share a link, get paid instantly",
  },
  {
    id: "echo",
    // eslint-disable-next-line @next/next/no-img-element
    illustration: <img src="/Card_4.png" alt="" width="78%" height="210" style={{ objectFit: "contain", display: "block" }} />,
    header: "Meet Echo, your payment assistant",
  },
];

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  );
}


/* ── Status bar — used across all stages ── */
function StatusBar() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        pointerEvents: "none",
      }}
    >
      <span style={{ fontSize: 15, fontWeight: 600, color: "white", letterSpacing: -0.3, fontVariantNumeric: "tabular-nums" }}>9:41</span>
      <div
        style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: 5, background: "black", width: 120, height: 34, borderRadius: 20 }}
        aria-hidden
      />
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none" aria-hidden>
          <rect x="0"    y="8"    width="3" height="4"   rx="1" fill="white" />
          <rect x="4.5"  y="5.5"  width="3" height="6.5" rx="1" fill="white" />
          <rect x="9"    y="3"    width="3" height="9"   rx="1" fill="white" />
          <rect x="13.5" y="0"    width="3" height="12"  rx="1" fill="white" opacity="0.3" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden>
          <path d="M8 9.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" fill="white" />
          <path d="M3.5 6.5C4.9 5.1 6.35 4.4 8 4.4s3.1.7 4.5 2.1" stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none" />
          <path d="M1 4C3.1 1.9 5.4 1 8 1s4.9.9 7 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.5" />
        </svg>
        <svg width="25" height="13" viewBox="0 0 25 13" fill="none" aria-hidden>
          <rect x="0.5" y="1" width="21" height="11" rx="3.5" stroke="white" strokeWidth="1.2" />
          <rect x="22" y="4.5" width="2.5" height="4" rx="1" fill="white" opacity="0.4" />
          <rect x="2" y="2.5" width="17" height="8" rx="2" fill="white" />
        </svg>
      </div>
    </div>
  );
}

/* ── Tab types ── */
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

/* ── App stage: full dashboard inside the phone frame ── */
function AppStage() {
  const [drawerOpen,       setDrawerOpen]       = useState(false);
  const [moreOpen,         setMoreOpen]         = useState(false);
  const [echoOpen,         setEchoOpen]         = useState(false);
  const [notifsOpen,       setNotifsOpen]       = useState(false);
  const [paymentLinkOpen,  setPaymentLinkOpen]  = useState(false);
  const [tapToPayOpen,     setTapToPayOpen]     = useState(false);
  const [filterOpen,       setFilterOpen]       = useState<FilterId | null>(null);
  const [appliedFilters,   setAppliedFilters]   = useState<Partial<Record<FilterId, string>>>({});
  const [txnFilterOpen,    setTxnFilterOpen]    = useState(false);
  const [txnFilterApplied, setTxnFilterApplied] = useState<FilterState>(emptyFilters());
  const [plusOpen,         setPlusOpen]         = useState(false);
  const [activeTab,        setActiveTab]        = useState<TabId>("home");
  const [intlSheetOpen,       setIntlSheetOpen]       = useState(false);
  const [intlCountry,         setIntlCountry]         = useState<IntlCountry>(COUNTRIES[0]);
  const [criticalSheetOpen,   setCriticalSheetOpen]   = useState(false);
  const [selectedTxn,         setSelectedTxn]         = useState<RecentTxnItem | null>(null);
  const { hidden, toggle } = useHideAmounts();

  useEffect(() => {
    const t = setTimeout(() => setCriticalSheetOpen(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="relative flex flex-col w-full h-full overflow-hidden bg-no-repeat"
      style={{
        backgroundColor: "#f6f8fa",
        backgroundImage: activeTab === "home" ? "linear-gradient(to bottom, #dbeafe 0%, #f6f8fa 380px)" : "none",
        backgroundSize: "100% 380px",
      }}
    >
      {/* 44px top spacer — clears the status bar overlay */}
      <div style={{ height: 44, flexShrink: 0 }} />

      {/* Header */}
      {activeTab === "home" ? (
        <div className="flex items-center gap-3 px-4 py-3 bg-transparent shrink-0">
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
        <div className="px-5 bg-transparent shrink-0" style={{ paddingBottom: 12 }}>
          <h1 className="text-[20px] font-bold text-foreground tracking-tight">
            {activeTab === "analytics" ? "Analytics" : activeTab === "txns" ? "Payments" : "International"}
          </h1>
        </div>
      )}

      {/* Payments sub-tab bar */}
      {activeTab === "txns" && (
        <div className="shrink-0 bg-transparent border-b border-border/50">
          <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
            {[
              { id: "transactions",  label: "Transactions"  },
              { id: "payment-links", label: "Payment Links" },
              { id: "invoice",       label: "Invoice"       },
              { id: "mca-links",     label: "MCA Links"     },
            ].map((tab) => {
              const active = tab.id === "transactions";
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={cn(
                    "relative shrink-0 px-4 h-10 text-[13.5px] whitespace-nowrap transition-colors",
                    active ? "font-semibold text-primary" : "font-normal text-muted-foreground"
                  )}
                >
                  {tab.label}
                  {active && (
                    <span className="absolute inset-x-4 bottom-0 h-[2.5px] bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Scrollable content — extra bottom padding on Home tab to clear sticky banner */}
      <div
        className={cn(
          "flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden",
          activeTab === "home" ? "pb-[180px]" : "pb-[76px]"
        )}
        style={{ scrollbarWidth: "none" }}
      >
        {activeTab === "analytics" ? <MobileAnalytics /> :
         activeTab === "txns" ? (
           <MobileTransactions
             externalFilterState={txnFilterApplied}
             onFilterButtonTap={() => setTxnFilterOpen(true)}
             onTxnTap={setSelectedTxn}
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
           onTxnTap={setSelectedTxn}
         />}
      </div>

      {/* Echo FAB — absolute so it stays inside the phone frame */}
      <button type="button" onClick={() => setEchoOpen(true)} aria-label="Open Echo"
        className="absolute z-40 flex items-center justify-center h-14 w-14 rounded-full transition-transform duration-150 active:scale-95"
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

      {/* Plus action card — absolute */}
      <AnimatePresence>
        {plusOpen && (
          <>
            <motion.div key="plus-bd"
              className="absolute inset-0 z-[45]"
              onClick={() => setPlusOpen(false)}
            />
            <motion.div key="plus-card"
              className="absolute z-[46] bg-card rounded-2xl overflow-hidden"
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
                { label: "Payment link", Icon: Link2,     iconBg: "bg-primary/10", iconColor: "text-primary",          action: () => { setPaymentLinkOpen(true); setPlusOpen(false); } },
                { label: "Tap to Pay",   Icon: Nfc,       iconBg: "bg-sky-50",     iconColor: "text-sky-500",          action: () => { setTapToPayOpen(true);    setPlusOpen(false); } },
                { label: "Settings",     Icon: Settings2, iconBg: "bg-muted",      iconColor: "text-muted-foreground", action: () => { setMoreOpen(true);        setPlusOpen(false); } },
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

      {/* Bottom nav — absolute so it stays inside the phone frame.
          On Home tab, the sticky banner carousel is rendered above the nav bar
          inside this same container so they form one fixed unit. */}
      <div className="absolute bottom-0 left-0 right-0 z-40">
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
                  active ? "text-primary" : "text-muted-foreground")}
              >
                <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.25 : 1.75} />
              </button>
            );
          })}
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
        </div>{/* /bg-background nav wrapper */}
      </div>{/* /absolute bottom-0 z-40 */}

      {/* Sheets — all with contained so they stay inside the phone frame */}
      <MobileMoreSheet             open={moreOpen}            onClose={() => setMoreOpen(false)}            contained />
      <MobileEchoSheet             open={echoOpen}            onClose={() => setEchoOpen(false)}            contained />
      <MobileNotifications         open={notifsOpen}          onClose={() => setNotifsOpen(false)}          contained />
      <CriticalNotificationsSheet  open={criticalSheetOpen}   onClose={() => setCriticalSheetOpen(false)}   contained />
      <MobileCreatePaymentLink open={paymentLinkOpen} onClose={() => setPaymentLinkOpen(false)}  contained />
      <MobileTapToPay          open={tapToPayOpen}    onClose={() => setTapToPayOpen(false)}     contained />
      <CountrySheet
        open={intlSheetOpen}
        selected={intlCountry}
        onSelect={setIntlCountry}
        onClose={() => setIntlSheetOpen(false)}
        contained
      />
      <MobileFilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(null)}
        onApply={(id, summary) => { setAppliedFilters(prev => ({ ...prev, [id]: summary })); setFilterOpen(null); }}
        contained
      />
      <MobileHamburgerDrawer   open={drawerOpen}      onClose={() => setDrawerOpen(false)}       contained />

      {/* ── Filter Drawer — backdrop ── */}
      <AnimatePresence>
        {txnFilterOpen && (
          <motion.div
            key="filter-backdrop"
            className="absolute inset-0 z-[69]"
            style={{
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              background: "rgba(0,0,0,0.3)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setTxnFilterOpen(false)}
          />
        )}
      </AnimatePresence>
      {/* ── Filter Drawer — sheet ── */}
      <AnimatePresence>
        {txnFilterOpen && (
          <motion.div
            key="filter-sheet"
            className="absolute inset-x-0 bottom-0 z-[70] flex flex-col bg-background overflow-hidden"
            style={{
              height: "calc(100% - 44px)",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          >
            <MobileFilterDrawer
              initialFilters={txnFilterApplied}
              onApply={(filters) => { setTxnFilterApplied(filters); setTxnFilterOpen(false); }}
              onReset={() => setTxnFilterApplied(emptyFilters())}
              onClose={() => setTxnFilterOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Transaction Detail — blur backdrop ── */}
      <AnimatePresence>
        {selectedTxn && (
          <motion.div
            key="txn-backdrop"
            className="absolute inset-0 z-[79]"
            style={{
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              background: "rgba(0,0,0,0.2)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setSelectedTxn(null)}
          />
        )}
      </AnimatePresence>
      {/* ── Transaction Detail — bottom sheet ── */}
      <AnimatePresence>
        {selectedTxn && (
          <motion.div
            key={selectedTxn.id}
            className="absolute inset-x-0 bottom-0 z-[80] flex flex-col bg-background overflow-hidden"
            style={{
              height: "93%",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          >
            <MobileTransactionDetail
              txn={selectedTxn}
              onClose={() => setSelectedTxn(null)}
              onOpenTransaction={setSelectedTxn}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── LoginFormScreen: email + password form ── */
function LoginFormScreen({ onSubmit, onBack }: { onSubmit: () => void; onBack: () => void }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit  = emailValid && password.length > 0 && !loading;

  function handleSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onSubmit(); }, 1100);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    fontSize: 15,
    color: "#0A0A0A",
    background: "#F9FAFB",
    border: "1px solid #E5E7EB",
    borderRadius: 10,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto" style={{ background: "white" }}>
      {/* Status bar spacer */}
      <div style={{ height: 44, flexShrink: 0 }} />

      {/* Back button */}
      <div style={{ padding: "4px 20px 0", flexShrink: 0 }}>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1"
          style={{ background: "none", border: "none", cursor: "pointer", color: "#007AFF", fontSize: 15, fontWeight: 500, fontFamily: "inherit", padding: "6px 0" }}
        >
          <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2.5} />
          Back
        </button>
      </div>

      {/* Logo */}
      <div style={{ display: "flex", justifyContent: "center", padding: "16px 24px 0", flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/PG_blue.svg" alt="PayGlocal" width={115} height={21} />
      </div>

      {/* Title + subtitle */}
      <div style={{ padding: "20px 24px 0", flexShrink: 0 }}>
        <p style={{ fontSize: 22, fontWeight: 700, color: "#0A0A0A", margin: 0, lineHeight: 1.2 }}>
          Sign in to your Account
        </p>
        <p style={{ fontSize: 13, color: "#6B7280", margin: "6px 0 0", lineHeight: 1.5 }}>
          Enter your email and password to log in
        </p>
      </div>

      {/* Form fields */}
      <div style={{ padding: "24px 24px 0", flexShrink: 0 }}>
        {/* Email */}
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="preview-email" style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
            Email
          </label>
          <input
            id="preview-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canSubmit && handleSubmit()}
            placeholder="name@company.com"
            autoComplete="email"
            style={inputStyle}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 14 }}>
          <label htmlFor="preview-password" style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="preview-password"
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canSubmit && handleSubmit()}
              placeholder="Enter password"
              autoComplete="current-password"
              style={{ ...inputStyle, paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPwd(v => !v)}
              aria-label={showPwd ? "Hide password" : "Show password"}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 2, display: "flex", alignItems: "center" }}
            >
              {showPwd
                ? <EyeClosed className="h-[18px] w-[18px]" />
                : <Eye       className="h-[18px] w-[18px]" />}
            </button>
          </div>
        </div>

        {/* Remember me + Forgot Password */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#374151", userSelect: "none" }}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: "#007AFF", cursor: "pointer", flexShrink: 0 }}
            />
            Remember me
          </label>
          <button
            type="button"
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#007AFF", fontWeight: 500, fontFamily: "inherit", padding: 0 }}
          >
            Forgot Password?
          </button>
        </div>

        {/* Login button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            width: "100%",
            background: "#007AFF",
            opacity: canSubmit ? 1 : 0.38,
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            fontWeight: 600,
            color: "white",
            border: "none",
            cursor: canSubmit ? "pointer" : "not-allowed",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "opacity 180ms ease",
          }}
        >
          {loading ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-label="Loading">
              <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" />
              <path d="M12 3a9 9 0 0 1 9 9" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.75s" repeatCount="indefinite" />
              </path>
            </svg>
          ) : "Login"}
        </button>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1, minHeight: 16 }} />

      {/* Sign up link */}
      <div style={{ padding: "0 24px 28px", flexShrink: 0 }}>
        <p style={{ textAlign: "center", margin: 0, fontSize: 13, color: "#6B7280" }}>
          Don&apos;t have an account?{" "}
          <span style={{ color: "#007AFF", fontWeight: 500, cursor: "pointer" }}>Sign up</span>
        </p>
      </div>
    </div>
  );
}

/* ── PreviewScreen: stage machine — splash → login carousel → app ── */
function PreviewScreen() {
  type Stage = "splash" | "login" | "form" | "app";
  const [stage, setStage] = useState<Stage>("splash");

  /* Carousel state (login stage) */
  const [activeIdx, setActiveIdx] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (stage !== "login") return;
    const t = setInterval(() => {
      if (!pausedRef.current) setActiveIdx((i) => (i + 1) % slides.length);
    }, 4000);
    return () => clearInterval(t);
  }, [stage]);

  return (
    <div className="relative w-full h-full" style={{ background: "white" }}>

      {/* Status bar — always visible, floats above all stages */}
      <StatusBar />

      {/* Splash — not animated, handles its own exit bloom */}
      {stage === "splash" && (
        <MobileSplashScreen contained onDone={() => setStage("login")} />
      )}

      {/* Animated stage transitions: login → form → app */}
      <AnimatePresence>

        {stage === "login" && (
          <motion.div
            key="login"
            className="absolute inset-0 flex flex-col"
            style={{ background: "white" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Gradient carousel — illustration + dots at bottom */}
            <div
              style={{
                height: 455,
                flexShrink: 0,
                overflow: "hidden",
                background:
  "linear-gradient(to bottom, #006FFD 0%, #BFD2F3 80%, #FFFFFF 100%)",
                display: "flex",
                flexDirection: "column",
              }}
              onTouchStart={() => { pausedRef.current = true; }}
              onTouchEnd={() => setTimeout(() => { pausedRef.current = false; }, 3000)}
            >
              {/* Logo */}
              <div style={{ height: 156, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.svg" alt="PayGlocal" width={115} height={21} />
              </div>

              {/* Illustration slides */}
              <div style={{ flex: 1, position: "relative" }}>
                {slides.map((slide, i) => (
                  <div
                    key={slide.id}
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: i === activeIdx ? 1 : 0,
                      transition: "opacity 300ms ease-in-out",
                    }}
                  >
                    {slide.illustration}
                  </div>
                ))}
              </div>

              {/* Pagination dots — centred, inside blue gradient */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "24px 24px 26px" }}>
                {slides.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    style={{
                      width: i === activeIdx ? 20 : 6,
                      height: 6,
                      borderRadius: 999,
                      background: i === activeIdx ? "#1D4ED8" : "#B8CCE8",
                      transition: "width 300ms ease, background 300ms ease",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Below-carousel: text + buttons */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px 24px 24px" }}>
              <div style={{ flex: 0.4 }} />

              {/* Slide headline only — no description */}
              <div style={{ position: "relative", minHeight: 90, flexShrink: 0 }}>
                {slides.map((slide, i) => (
                  <div
                    key={slide.id}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      opacity: i === activeIdx ? 1 : 0,
                      transition: "opacity 300ms ease-in-out",
                      pointerEvents: i === activeIdx ? "auto" : "none",
                    }}
                  >
                    <p style={{ fontSize: 24, fontWeight: 700, color: "#0A0A0A", margin: 0, lineHeight: 1.25, textAlign: "center" }}>
                      {slide.header}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ flex: 0.35 }} />

              {/* Button block */}
              <div>
                {/* Login → opens form screen */}
                <button
                  type="button"
                  onClick={() => setStage("form")}
                  style={{
                    width: "100%",
                    background: "#007AFF",
                    borderRadius: 14,
                    padding: "15px 16px",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Login
                </button>

                <div style={{ display: "flex", alignItems: "center", margin: "10px 0" }}>
                  <hr style={{ flex: 1, border: "none", borderTop: "1px solid #E5E7EB" }} />
                  <span style={{ fontSize: 13, color: "#9CA3AF", margin: "0 14px" }}>Or</span>
                  <hr style={{ flex: 1, border: "none", borderTop: "1px solid #E5E7EB" }} />
                </div>

                {/* Google + Meta — side by side */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setStage("app")}
                    style={{
                      background: "white",
                      border: "1px solid #E5E7EB",
                      borderRadius: 14,
                      padding: "14px 16px",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#0A0A0A",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <GoogleIcon />
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => setStage("app")}
                    style={{
                      background: "white",
                      border: "1px solid #E5E7EB",
                      borderRadius: 14,
                      padding: "14px 16px",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#0A0A0A",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/meta_logo.svg" alt="Meta" width={22} height={13} />
                    Meta
                  </button>
                </div>

                <p style={{ textAlign: "center", margin: "12px 0 0", fontSize: 13, color: "#6B7280" }}>
                  Don&apos;t have an account?{" "}
                  <span style={{ color: "#007AFF", fontWeight: 500, cursor: "pointer" }}>Sign up</span>
                </p>
              </div>

              <div style={{ flex: 1 }} />
            </div>
          </motion.div>
        )}

        {stage === "form" && (
          <motion.div
            key="form"
            className="absolute inset-0"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
          >
            <LoginFormScreen
              onSubmit={() => setStage("app")}
              onBack={() => setStage("login")}
            />
          </motion.div>
        )}

        {stage === "app" && (
          <motion.div
            key="app"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AppStage />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

/* ── Outer page — iPhone 15 Pro frame (restored exactly from original) ── */
export default function MobilePreviewPage() {
  return (
    <div className="min-h-screen bg-[#f0f0f0] dark:bg-zinc-900 flex items-center justify-center py-10">

      {/* iPhone 15 Pro frame */}
      <div
        aria-label="Mobile preview"
        className="relative shrink-0 select-none"
        style={{
          width: PHONE_W,
          height: PHONE_H,
          borderRadius: 52,
          background: "linear-gradient(160deg, #3a3a3c 0%, #1c1c1e 40%, #2a2a2c 100%)",
          boxShadow: [
            "0 0 0 1px rgba(255,255,255,0.13)",
            "0 0 0 2px #080808",
            "0 50px 100px -24px rgba(0,0,0,0.55)",
            "0 16px 40px -8px rgba(0,0,0,0.35)",
            "inset 0 1px 0 rgba(255,255,255,0.1)",
          ].join(", "),
          padding: 12,
        }}
      >
        {/* Side buttons */}
        <div className="pointer-events-none absolute left-[-3px] top-[22%] w-[3px] h-8 rounded-l-full bg-gradient-to-b from-zinc-500 to-zinc-600" aria-hidden />
        <div className="pointer-events-none absolute left-[-3px] top-[33%] w-[3px] h-10 rounded-l-full bg-gradient-to-b from-zinc-500 to-zinc-600" aria-hidden />
        <div className="pointer-events-none absolute left-[-3px] top-[44%] w-[3px] h-10 rounded-l-full bg-gradient-to-b from-zinc-500 to-zinc-600" aria-hidden />
        <div className="pointer-events-none absolute right-[-3px] top-[32%] w-[3px] h-14 rounded-r-full bg-gradient-to-b from-zinc-500 to-zinc-600" aria-hidden />

        {/* Inner screen */}
        <div
          className="relative flex flex-col w-full h-full overflow-hidden"
          style={{ borderRadius: 42 }}
        >
          <HideAmountsProvider>
            <PreviewScreen />
          </HideAmountsProvider>
        </div>
      </div>
    </div>
  );
}
