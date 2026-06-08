"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { House, ArrowUpDown, BarChart3, Globe, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileMoreSheet } from "./MobileMoreSheet";
import { MobileEchoSheet } from "./MobileEchoSheet";

const TABS = [
  { id: "home",      label: "Home",      icon: House,      href: "/"                                           },
  { id: "analytics", label: "Analytics", icon: BarChart3,  href: "/analytics"                                  },
  { id: "txns",      label: "Txns",      icon: ArrowUpDown,href: "/transactions"                               },
  { id: "intl",      label: "Intl",      icon: Globe,      href: "/payment-products/international-accounts"    },
] as const;

interface MobileBottomNavProps {
  /** Override visibility. Default: "md:hidden". Pass "" to always show (preview). */
  className?: string;
}

export function MobileBottomNav({ className = "md:hidden" }: MobileBottomNavProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [echoOpen, setEchoOpen] = useState(false);

  return (
    <>
      {/* ── Floating Echo FAB — gradient fill + white echo logo ── */}
      <button
        type="button"
        onClick={() => setEchoOpen(true)}
        aria-label="Open Echo AI assistant"
        className={cn(
          "fixed z-40 flex items-center justify-center h-14 w-14 rounded-full echo-fab-gradient",
          "transition-transform duration-150 active:scale-95",
          className
        )}
        style={{
          bottom: "calc(64px + env(safe-area-inset-bottom) + 12px)",
          right: "16px",
          
          background: "linear-gradient(135deg, #4f46e5, #1e40af, #2563eb, #60a5fa)", boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/echo_logo copy.svg"
          alt="Echo"
          width={28}
          height={28}
          style={{ filter: "brightness(0) invert(1)" }}
        />
      </button>

      <nav
        className={cn("fixed bottom-0 left-0 right-0 z-40", className)}
        aria-label="Mobile navigation"
      >
        <div
          className="bg-background border-t border-border/60 flex items-center h-[64px] px-2"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {TABS.map((tab) => {
            const Icon   = tab.icon;
            const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 h-full min-w-0 select-none",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  className="h-[22px] w-[22px] shrink-0 transition-colors"
                  strokeWidth={active ? 2.25 : 1.75}
                />
                {active && (
                  <span className="text-[10.5px] font-semibold leading-none tracking-tight">
                    {tab.label}
                  </span>
                )}
              </Link>
            );
          })}

          {/* ── More — opens MobileMoreSheet ── */}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 h-full min-w-0 select-none",
              moreOpen ? "text-foreground" : "text-muted-foreground"
            )}
            aria-label="More options"
          >
            <MoreHorizontal
              className="h-[22px] w-[22px] shrink-0 transition-colors"
              strokeWidth={moreOpen ? 2.25 : 1.75}
            />
            {moreOpen && (
              <span className="text-[10.5px] font-semibold leading-none tracking-tight">
                More
              </span>
            )}
          </button>
        </div>
      </nav>

      <MobileMoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
      <MobileEchoSheet open={echoOpen} onClose={() => setEchoOpen(false)} />
    </>
  );
}
