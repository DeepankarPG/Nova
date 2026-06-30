"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { WorkspaceSection, MerchantSwitcherBottomSheet } from "./WorkspaceSection";
import {
  X,
  LayoutDashboard,
  Globe,
  FileText,
  AlertTriangle,
  Users,
  BadgeCheck,
  UserCog,
  Settings2,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useProfileAvatar } from "@/hooks/useProfileAvatar";

const USER_NAME = "Deepankar Raj";
const USER_ROLE = "Admin · Instamart";

const DRAWER_NAV = [
  {
    label: "Home",
    items: [
      { label: "Dashboard",              href: "/",                                          icon: LayoutDashboard },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "International Accounts", href: "/payment-products/international-accounts",  icon: Globe },
      { label: "Settlement Reports",     href: "/settlement-reports",                        icon: FileText },
    ],
  },
  {
    label: "Customer",
    items: [
      { label: "Client Management",      href: "/client-management",                         icon: Users },
    ],
  },
  {
    label: "Risk & Compliance",
    items: [
      { label: "Dispute Management",     href: "/dispute-management",  icon: AlertTriangle,  badge: "NEW" },
      { label: "eBRC",                   href: "/ebrc",                icon: BadgeCheck },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Account settings",       href: "/settings/account",    icon: UserCog },
      { label: "App settings",           href: "/settings/app",        icon: Settings2 },
    ],
  },
] as const;

interface MobileHamburgerDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Use absolute positioning (for preview frame). Default: fixed. */
  contained?: boolean;
  /** When provided, intercepts the Settlement Reports nav item and fires this instead of navigating. */
  onSettlementTap?: () => void;
  /** When provided, intercepts the eBRC nav item and fires this instead of navigating. */
  onEbrcTap?: () => void;
  /** When provided, intercepts the Dispute Management nav item and fires this instead of navigating. */
  onDisputesTap?: () => void;
}

function getInitials(name: string) {
  return name.trim().split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export function MobileHamburgerDrawer({ open, onClose, contained = false, onSettlementTap, onEbrcTap, onDisputesTap }: MobileHamburgerDrawerProps) {
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const pathname = usePathname();
  const router   = useRouter();
  const pos      = contained ? "absolute" : "fixed";
  const { avatarUrl } = useProfileAvatar();

  useEffect(() => {
    if (!open) setSwitcherOpen(false);
  }, [open]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              className={`${pos} inset-0 z-50 bg-black/45`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={onClose}
            />

            {/* Drawer — slides from left */}
            <motion.aside
              key="drawer"
              className={`${pos} left-0 top-0 bottom-0 z-51 w-70 bg-card flex flex-col shadow-2xl`}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            >
              {/* Profile section */}
              <div className="flex items-center gap-3 px-4 pt-5 pb-4 border-b border-border shrink-0">
                <div className="h-11 w-11 rounded-full overflow-hidden shrink-0 ring-2 ring-border bg-muted flex items-center justify-center">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[13px] font-bold text-foreground">{getInitials(USER_NAME)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-foreground truncate">{USER_NAME}</p>
                  <p className="text-[12px] text-muted-foreground truncate">{USER_ROLE}</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close menu"
                  className="h-7 w-7 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Workspace section */}
              <WorkspaceSection onOpenSwitcher={() => setSwitcherOpen(true)} />

              {/* Nav */}
              <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
                {DRAWER_NAV.map((section) => (
                  <div key={section.label}>
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground px-3 mb-1">
                      {section.label}
                    </p>
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const Icon   = item.icon;
                        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                        const sharedClass = cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors w-full text-left",
                          active ? "bg-primary/8 text-primary" : "text-foreground hover:bg-muted"
                        );
                        const inner = (
                          <>
                            <Icon
                              className={cn("h-4.25 w-4.25 shrink-0", active ? "text-primary" : "text-muted-foreground")}
                              strokeWidth={1.75}
                            />
                            <span className={cn("text-[13.5px] flex-1 min-w-0 truncate", active ? "font-semibold" : "font-medium")}>
                              {item.label}
                            </span>
                            {"badge" in item && item.badge ? (
                              <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">
                                {item.badge}
                              </span>
                            ) : null}
                          </>
                        );
                        if (item.href === "/settlement-reports" && onSettlementTap) {
                          return (
                            <button key={item.href} type="button"
                              onClick={() => { onClose(); onSettlementTap(); }}
                              className={sharedClass}
                            >
                              {inner}
                            </button>
                          );
                        }
                        if (item.href === "/ebrc" && onEbrcTap) {
                          return (
                            <button key={item.href} type="button"
                              onClick={() => { onClose(); onEbrcTap(); }}
                              className={sharedClass}
                            >
                              {inner}
                            </button>
                          );
                        }
                        if (item.href === "/dispute-management" && onDisputesTap) {
                          return (
                            <button key={item.href} type="button"
                              onClick={() => { onClose(); onDisputesTap(); }}
                              className={sharedClass}
                            >
                              {inner}
                            </button>
                          );
                        }
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={sharedClass}
                          >
                            {inner}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              {/* Logout */}
              <div className="px-2 py-3 border-t border-border shrink-0">
                <button
                  type="button"
                  onClick={() => { onClose(); toast.success("Signed out"); router.push("/"); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-destructive hover:bg-destructive/6 transition-colors"
                >
                  <LogOut className="h-4.25 w-4.25 shrink-0" strokeWidth={1.75} />
                  <span className="text-[13.5px] font-medium">Sign out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Merchant switcher — rendered outside the drawer so it spans the full frame width */}
      <MerchantSwitcherBottomSheet
        open={switcherOpen}
        onClose={() => setSwitcherOpen(false)}
        contained={contained}
      />
    </>
  );
}
