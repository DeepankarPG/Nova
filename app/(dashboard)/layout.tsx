"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LayoutGroup } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { EchoPanelProvider } from "@/components/echo/EchoPanelContext";
import { EchoPanel } from "@/components/echo/EchoPanel";
import { EchoLaunchBanner } from "@/components/echo/EchoLaunchBanner";
import { MobileHeader } from "@/components/layout/mobile/MobileHeader";
import { MobileBottomNav } from "@/components/layout/mobile/MobileBottomNav";
import { MobileHamburgerDrawer } from "@/components/layout/mobile/MobileHamburgerDrawer";
import { HideAmountsProvider } from "@/lib/hide-amounts-context";
import { WorkspaceProvider, useWorkspace } from "@/lib/workspace-context";
import { ALL_BUSINESSES_ID } from "@/lib/workspace-types";

function WorkspaceUrlSync() {
  const searchParams = useSearchParams();
  const { setActiveBusiness, accessibleBusinesses } = useWorkspace();

  useEffect(() => {
    const mid = searchParams.get("mid");
    if (!mid) return;
    if (mid === ALL_BUSINESSES_ID) {
      setActiveBusiness(ALL_BUSINESSES_ID);
      return;
    }
    const match = accessibleBusinesses.find(
      (b) => b.id === mid || b.primaryAccount.mid === mid
    );
    if (match) setActiveBusiness(match.id);
  }, [searchParams]);

  return null;
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);

  return (
    <div className="flex h-dvh min-h-0 w-full max-w-[100vw] overflow-hidden bg-background">
      <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
        <div className="hidden md:block">
          <Header onMenuClick={() => setMobileNavOpen(true)} />
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 top-0 md:hidden"
          style={{ height: 380, backgroundImage: "linear-gradient(to bottom, #dbeafe 0%, #f6f8fa 100%)", zIndex: 0 }}
          aria-hidden
        />

        <MobileHeader onMenuClick={() => setHamburgerOpen(true)} />

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden overflow-x-hidden overscroll-y-contain">
          <LayoutGroup id="dashboard-routes">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-y-contain p-4 pb-24 md:p-6 md:pb-6 page-enter">
              {children}
            </div>
          </LayoutGroup>
        </main>
      </div>

      <EchoPanel />
      <EchoLaunchBanner />

      <MobileBottomNav />
      <MobileHamburgerDrawer open={hamburgerOpen} onClose={() => setHamburgerOpen(false)} />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <HideAmountsProvider>
        <EchoPanelProvider>
          <WorkspaceUrlSync />
          <DashboardShell>{children}</DashboardShell>
        </EchoPanelProvider>
      </HideAmountsProvider>
    </WorkspaceProvider>
  );
}
