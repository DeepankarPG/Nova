"use client";

import { useState } from "react";
import { LayoutGroup } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { EchoPanelProvider } from "@/components/echo/EchoPanelContext";
import { EchoPanel } from "@/components/echo/EchoPanel";
import { EchoLaunchBanner } from "@/components/echo/EchoLaunchBanner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <EchoPanelProvider>
      <div className="flex h-dvh min-h-0 w-full max-w-[100vw] overflow-hidden bg-background">
        <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <Header onMenuClick={() => setMobileNavOpen(true)} />
          <main className="flex min-h-0 flex-1 flex-col overflow-hidden overflow-x-hidden overscroll-y-contain">
            <LayoutGroup id="dashboard-routes">
              <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-y-contain p-4 md:p-6 page-enter">
                {children}
              </div>
            </LayoutGroup>
          </main>
        </div>
        <EchoPanel />
        <EchoLaunchBanner />
      </div>
    </EchoPanelProvider>
  );
}
