"use client";

import { useState } from "react";
import Image from "next/image";
import { House, ArrowUpDown, BarChart3, Globe, Bell, Eye, EyeClosed, Plus, Link2, Nfc, Settings2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { MobileHamburgerDrawer } from "@/components/layout/mobile/MobileHamburgerDrawer";
import { MobileMoreSheet } from "@/components/layout/mobile/MobileMoreSheet";
import { MobileEchoSheet } from "@/components/layout/mobile/MobileEchoSheet";
import { MobileDashboardHome } from "@/components/dashboard/mobile/MobileDashboardHome";
import { MobileAnalytics } from "@/components/dashboard/mobile/MobileAnalytics";
import { MobileTransactions } from "@/components/dashboard/mobile/MobileTransactions";
import { MobileInternational, CountrySheet, COUNTRIES } from "@/components/dashboard/mobile/MobileInternational";
import type { Country as IntlCountry } from "@/components/dashboard/mobile/MobileInternational";
import { HideAmountsProvider, useHideAmounts } from "@/lib/hide-amounts-context";
import { MobileNotifications } from "@/components/layout/mobile/MobileNotifications";
import { MobileCreatePaymentLink } from "@/components/layout/mobile/MobileCreatePaymentLink";
import { MobileTapToPay } from "@/components/layout/mobile/MobileTapToPay";
import { MobileFilterSheet } from "@/components/layout/mobile/MobileFilterSheet";
import type { FilterId } from "@/components/dashboard/mobile/MobileTransactions";
import { MobileSplashScreen } from "@/components/layout/mobile/MobileSplashScreen";
import { MobileLoginFlow } from "@/components/layout/mobile/MobileLoginFlow";
import { cn } from "@/lib/utils";

const PHONE_W = 393;
const PHONE_H = 780;

type TabId = "home" | "analytics" | "txns" | "intl";
const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "home",      label: "Home",      icon: House       },
  { id: "analytics", label: "Analytics", icon: BarChart3   },
  { id: "txns",      label: "Txns",      icon: ArrowUpDown },
  { id: "intl",      label: "Intl",      icon: Globe       },
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

/* ── Everything inside the phone screen — needs HideAmountsProvider as ancestor ── */
function PreviewScreen() {
  const [splashDone, setSplashDone] = useState(false);
  const [loginDone, setLoginDone]   = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [echoOpen, setEchoOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [paymentLinkOpen, setPaymentLinkOpen] = useState(false);
  const [tapToPayOpen, setTapToPayOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState<FilterId | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<Partial<Record<FilterId, string>>>({});
  const [plusOpen, setPlusOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [intlSheetOpen, setIntlSheetOpen] = useState(false);
  const [intlCountry, setIntlCountry] = useState<IntlCountry>(COUNTRIES[0]);
  const { hidden, toggle } = useHideAmounts();

  return (
    <>
      {/* Status bar */}
      <div className="relative flex-shrink-0 flex items-center justify-between px-6 pt-3 pb-1 bg-transparent">
        <span className="text-[15px] font-semibold tabular-nums tracking-tight text-foreground">9:41</span>
        <div className="absolute left-1/2 -translate-x-1/2 top-2 bg-black" style={{ width: 120, height: 34, borderRadius: 20 }} aria-hidden />
        <div className="flex items-center gap-[5px]">
          <svg width="17" height="12" viewBox="0 0 17 12" fill="none" className="text-foreground" aria-hidden>
            <rect x="0"    y="8"    width="3" height="4"   rx="1" fill="currentColor" />
            <rect x="4.5"  y="5.5"  width="3" height="6.5" rx="1" fill="currentColor" />
            <rect x="9"    y="3"    width="3" height="9"   rx="1" fill="currentColor" />
            <rect x="13.5" y="0"    width="3" height="12"  rx="1" fill="currentColor" opacity="0.3" />
          </svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" className="text-foreground" aria-hidden>
            <path d="M8 9.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" fill="currentColor"/>
            <path d="M3.5 6.5C4.9 5.1 6.35 4.4 8 4.4s3.1.7 4.5 2.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
            <path d="M1 4C3.1 1.9 5.4 1 8 1s4.9.9 7 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.5"/>
          </svg>
          <svg width="25" height="13" viewBox="0 0 25 13" fill="none" className="text-foreground" aria-hidden>
            <rect x="0.5" y="1" width="21" height="11" rx="3.5" stroke="currentColor" strokeWidth="1.2" />
            <rect x="22" y="4.5" width="2.5" height="4" rx="1" fill="currentColor" opacity="0.4" />
            <rect x="2" y="2.5" width="17" height="8" rx="2" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Header — home shows profile greeting; other tabs show page title */}
      {activeTab === "home" ? (
        <div className="flex items-center gap-3 px-4 py-3 bg-transparent shrink-0">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="h-10 w-10 rounded-full overflow-hidden shrink-0 ring-2 ring-white/60 shadow-sm"
            aria-label="Open menu"
          >
            <Image
              src="/pexels-santhosh-shanbhag-564865255-16826482.jpg"
              alt="Profile"
              width={40}
              height={40}
              className="h-full w-full object-cover"
              priority
            />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-foreground leading-tight">
              {getGreeting()}, Deep{" "}
              <span className="inline-block animate-[wave_2s_ease-in-out_infinite] origin-[70%_70%]">👋</span>
            </p>
            <p className="text-[12px] text-muted-foreground leading-tight mt-0.5">{getSubtitle()}</p>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={toggle}
              aria-label={hidden ? "Show amounts" : "Hide amounts"}
              className="h-9 w-9 flex items-center justify-center rounded-full text-foreground hover:bg-muted/60 transition-colors"
            >
              {hidden ? <EyeClosed className="h-[18px] w-[18px]" strokeWidth={1.75} /> : <Eye className="h-[18px] w-[18px]" strokeWidth={1.75} />}
            </button>
            <button type="button" onClick={() => setNotifsOpen(true)} className="relative h-9 w-9 flex items-center justify-center rounded-full text-foreground hover:bg-muted/60 transition-colors">
              <Bell className="h-[19px] w-[19px]" strokeWidth={1.75} />
              <span className="absolute top-[9px] right-[9px] h-[7px] w-[7px] rounded-full bg-red-500 border-[1.5px] border-background" aria-hidden />
            </button>
          </div>
        </div>
      ) : (
        /* Page header for Analytics / Txns / Intl — title only */
        <div className="px-5 pt-3 pb-3 bg-transparent shrink-0">
          <h1 className="text-[20px] font-bold text-foreground tracking-tight">
            {activeTab === "analytics" ? "Analytics"
             : activeTab === "txns"    ? "Transactions"
             :                           "International"}
          </h1>
        </div>
      )}

      {/* Scrollable content — switches by active tab */}
      <div className="flex-1 overflow-y-auto pb-[108px] min-h-0 flex flex-col">
        {activeTab === "analytics"  ? <MobileAnalytics />    :
         activeTab === "txns"       ? (
           <MobileTransactions
             appliedFilters={appliedFilters}
             onOpenFilter={setFilterOpen}
             onClearFilter={(id) => setAppliedFilters(prev => { const n = {...prev}; delete n[id]; return n; })}
           />
         ) :
         activeTab === "intl"       ? (
           <MobileInternational
             onOpenCountrySheet={() => setIntlSheetOpen(true)}
             externalCountry={intlCountry}
             onCountryChange={setIntlCountry}
           />
         ) :
         <MobileDashboardHome onCreatePaymentLink={() => setPaymentLinkOpen(true)} onTapToPay={() => setTapToPayOpen(true)} />}
      </div>

      {/* Floating Echo FAB — gradient fill + white logo */}
      <button
        type="button"
        onClick={() => setEchoOpen(true)}
        aria-label="Open Echo AI assistant"
        className="absolute z-40 flex items-center justify-center h-14 w-14 rounded-full echo-fab-gradient transition-transform duration-150 active:scale-95"
        style={{
          bottom: "calc(64px + 20px + 12px)",
          right: "12px",
          
          background: "linear-gradient(135deg, #4f46e5, #1e40af, #2563eb, #60a5fa)", boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
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
            {/* No backdrop — tap anywhere outside card to dismiss */}
            <motion.div key="plus-bd"
              className="absolute inset-0 z-[45]"
              onClick={() => setPlusOpen(false)}
            />
            {/* Card — centred above nav, no dark overlay */}
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
                { label: "Payment link", Icon: Link2,    iconBg: "bg-primary/10", iconColor: "text-primary",          action: () => { setPaymentLinkOpen(true); setPlusOpen(false); } },
                { label: "Tap to Pay",   Icon: Nfc,      iconBg: "bg-sky-50",     iconColor: "text-sky-500",          action: () => { setTapToPayOpen(true);    setPlusOpen(false); } },
                { label: "Settings",     Icon: Settings2, iconBg: "bg-muted",     iconColor: "text-muted-foreground", action: () => { setMoreOpen(true);        setPlusOpen(false); } },
              ].map((item, i) => {
                const Icon = item.Icon;
                return (
                  <button key={item.label} type="button" onClick={item.action}
                    className={cn("w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-muted/60 transition-colors",
                      i > 0 && "border-t border-border/50")}
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

      {/* ── Bottom nav: [Home][Analytics][+][Txns][Intl] ── */}
      <div className="absolute bottom-0 left-0 right-0 bg-background border-t border-border/60">
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
                <Icon className="h-[22px] w-[22px] shrink-0" strokeWidth={active ? 2.25 : 1.75} />
              </button>
            );
          })}

          {/* + in center */}
          <div className="flex-1 flex items-center justify-center h-full">
            <button type="button" onClick={() => setPlusOpen(p => !p)}
              className="flex items-center justify-center"
            >
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
                <Icon className="h-[22px] w-[22px] shrink-0" strokeWidth={active ? 2.25 : 1.75} />
              </button>
            );
          })}
        </div>

        <div className="flex justify-center py-1.5 bg-background">
          <div className="h-1 w-28 rounded-full bg-foreground/20" aria-hidden />
        </div>
      </div>

      <MobileMoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} contained />
      <MobileEchoSheet open={echoOpen} onClose={() => setEchoOpen(false)} contained />
      <MobileNotifications open={notifsOpen} onClose={() => setNotifsOpen(false)} contained />
      <MobileCreatePaymentLink open={paymentLinkOpen} onClose={() => setPaymentLinkOpen(false)} contained />
      <MobileTapToPay open={tapToPayOpen} onClose={() => setTapToPayOpen(false)} contained />
      <MobileHamburgerDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} contained />
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
        onApply={(id, summary) => {
          setAppliedFilters(prev => ({ ...prev, [id]: summary }));
          setFilterOpen(null);
        }}
        contained
      />
      {/* Login — appears after splash, before dashboard */}
      {splashDone && !loginDone && (
        <MobileLoginFlow onDone={() => setLoginDone(true)} contained />
      )}
      {/* Splash — sits on top of everything, auto-dismisses after animation */}
      {!splashDone && <MobileSplashScreen onDone={() => setSplashDone(true)} contained />}
    </>
  );
}

export default function MobilePreviewPage() {
  return (
    <div className="min-h-screen bg-[#f0f0f0] dark:bg-zinc-900 flex items-center justify-center py-10">

      {/* ── iPhone 15 Pro frame ── */}
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

        {/* ── Inner screen ── */}
        <div
          className="relative flex flex-col w-full h-full overflow-hidden bg-no-repeat"
          style={{ borderRadius: 42, backgroundColor: "#f6f8fa", backgroundImage: "linear-gradient(to bottom, #dbeafe 0%, #f6f8fa 300px)", backgroundSize: "100% 300px" }}
        >
          <HideAmountsProvider>
            <PreviewScreen />
          </HideAmountsProvider>
        </div>
      </div>
    </div>
  );
}
