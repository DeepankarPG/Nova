"use client";

import { MobileAnalytics } from "@/components/dashboard/mobile/MobileAnalytics";

export default function AnalyticsPage() {
  return (
    <>
      {/* Mobile — full-bleed, escape layout padding */}
      <div className="md:hidden -mx-4 -mt-4">
        <MobileAnalytics />
      </div>

      {/* Desktop placeholder — analytics charts live in the main dashboard on desktop */}
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold text-foreground mb-2">Analytics</h1>
        <p className="text-muted-foreground">Use the desktop dashboard for full analytics.</p>
      </div>
    </>
  );
}
