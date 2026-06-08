"use client";

import { useState } from "react";
import { LayoutGroup } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { EchoPanelProvider } from "@/components/echo/EchoPanelContext";
import { EchoPanel } from "@/components/echo/EchoPanel";
import { EchoLaunchBanner } from "@/components/echo/EchoLaunchBanner";
import { MobileHeader } from "@/components/layout/mobile/MobileHeader";
import { MobileBottomNav } from "@/components/layout/mobile/MobileBottomNav";
import { MobileHamburgerDrawer } from "@/components/layout/mobile/MobileHamburgerDrawer";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen,  setMobileNavOpen]  = useState(false);
  const [hamburgerOpen,  setHamburgerOpen]  = useState(false);

  return (
    <EchoPanelProvider>
      <div className="flex h-dvh min-h-0 w-full max-w-[100vw] overflow-hidden bg-background">
        {/* Desktop sidebar — hidden on mobile */}
        <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {/* Desktop header */}
          <div className="hidden md:block">
            <Header onMenuClick={() => setMobileNavOpen(true)} />
          </div>

          {/* Mobile header — hamburger triggers left drawer */}
          <MobileHeader onMenuClick={() => setHamburgerOpen(true)} />

          <main className="flex min-h-0 flex-1 flex-col overflow-hidden overflow-x-hidden overscroll-y-contain">
            <LayoutGroup id="dashboard-routes">
              {/* pb-24 on mobile clears the fixed bottom nav */}
              <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-y-contain p-4 pb-24 md:p-6 md:pb-6 page-enter">
                {children}
              </div>
            </LayoutGroup>
          </main>
        </div>

        {/* Echo panel + launch banner */}
        <EchoPanel />
        <EchoLaunchBanner />

        {/* Mobile nav + hamburger drawer — fixed, outside flex flow */}
        <MobileBottomNav />
        <MobileHamburgerDrawer open={hamburgerOpen} onClose={() => setHamburgerOpen(false)} />
      </div>
    </EchoPanelProvider>
  );
}
