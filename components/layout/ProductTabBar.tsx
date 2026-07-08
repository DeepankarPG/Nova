"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/workspace-context";
import type { ProductTab } from "@/lib/workspace-types";

type TabDef = { key: ProductTab; label: string };

interface ProductTabBarProps {
  inHeader?: boolean;
}

export function ProductTabBar({ inHeader = false }: ProductTabBarProps) {
  const {
    activeBusiness,
    accessibleBusinesses,
    activeProductTab,
    setActiveProductTab,
  } = useWorkspace();

  const tabs = useMemo<TabDef[]>(() => {
    const t: TabDef[] = [{ key: "home", label: "Home" }];

    // Determine which product tabs to show based on accessible businesses
    const businesses = activeBusiness ? [activeBusiness] : accessibleBusinesses;
    const hasPG  = businesses.some((b) => b.primaryAccount.products.includes("pg"));
    const hasMCA = businesses.some((b) => b.primaryAccount.products.includes("mca"));

    if (hasPG)  t.push({ key: "pg",  label: "Payments" });
    if (hasMCA) t.push({ key: "mca", label: "Multi-Currency Accounts" });
    t.push({ key: "partner", label: "Partners" });

    return t;
  }, [activeBusiness, accessibleBusinesses]);

  if (!inHeader) return null;

  return (
    <div className="hidden md:flex items-end self-stretch -ml-4 md:-ml-5">
      {tabs.map((tab) => {
        const isActive = activeProductTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveProductTab(tab.key)}
            className={cn(
              "relative px-5 text-[13.5px] font-medium whitespace-nowrap transition-all duration-100 select-none border border-b-0",
              isActive
                ? "h-[57px] bg-background border-border text-primary mb-[-1px] z-10"
                : "h-[57px] bg-transparent border-none text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
