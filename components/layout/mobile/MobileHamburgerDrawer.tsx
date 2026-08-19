"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AccountManagerSheet } from "./AccountManagerSheet";
import {
  X,
  LayoutDashboard,
  Globe,
  FileText,
  AlertTriangle,
  Users,
  UserCog,
  BadgeCheck,
  Settings2,
  MessageCircle,
  MessageSquarePlus,
  LogOut,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useProfileAvatar } from "@/hooks/useProfileAvatar";
import { useWorkspace } from "@/lib/workspace-context";

const USER_NAME = "Deepankar Raj";
const USER_ROLE = "Admin · Instamart";

function getInitials(name: string) {
  return name.trim().split(/\s+/).map(p => p[0]).join("").slice(0, 2).toUpperCase();
}

const DRAWER_NAV = [
  {
    label: "Home",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "Business",
    items: [
      { label: "International Accounts", href: "/payment-products/international-accounts", icon: Globe },
      { label: "Settlement Reports",     href: "/settlement-reports",                       icon: FileText },
      { label: "Client Management",      href: "/client-management",                        icon: Users },
      { label: "Team Management",        href: "/team-management",                          icon: UserCog },
      { label: "Dispute Management",     href: "/dispute-management", icon: AlertTriangle,   badge: "NEW" },
      { label: "eBRC",                   href: "/ebrc",               icon: BadgeCheck },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Settings",         href: "/settings/app",      icon: Settings2        },
      { label: "Contact Support",  href: "/contact-support",   icon: MessageCircle    },
      { label: "Add feedback",     href: "/add-feedback",      icon: MessageSquarePlus },
    ],
  },
] as const;

interface MobileHamburgerDrawerProps {
  open: boolean;
  onClose: () => void;
  contained?: boolean;
  onSettlementTap?: () => void;
  onEbrcTap?: () => void;
  onDisputesTap?: () => void;
  onClientManagementTap?: () => void;
  onTeamManagementTap?: () => void;
  onAppSettingsTap?: () => void;
  onContactSupportTap?: () => void;
  onAddFeedbackTap?:    () => void;
}

export function MobileHamburgerDrawer({
  open,
  onClose,
  contained = false,
  onSettlementTap,
  onEbrcTap,
  onDisputesTap,
  onClientManagementTap,
  onTeamManagementTap,
  onAppSettingsTap,
  onContactSupportTap,
  onAddFeedbackTap,
}: MobileHamburgerDrawerProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const pathname       = usePathname();
  const router         = useRouter();
  const pos            = contained ? "absolute" : "fixed";
  const { avatarUrl }  = useProfileAvatar();
  const { selectedMid } = useWorkspace();

  useEffect(() => {
    if (!open) setSheetOpen(false);
  }, [open]);

  const handleSignOut = () => {
    setSheetOpen(false);
    onClose();
    toast.success("Signed out");
    router.push("/");
  };

  const itemStyle: React.CSSProperties = { minHeight: 52 };

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              className={`${pos} inset-0 z-50 bg-black/40`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={onClose}
            />

            {/* Drawer */}
            <motion.aside
              key="drawer"
              className={`${pos} left-0 top-0 bottom-0 z-51 w-72 bg-card flex flex-col`}
              style={{ boxShadow: "4px 0 40px rgba(0,0,0,0.12)" }}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            >
              {/* Status bar spacer */}
              <div style={{ height: 44, flexShrink: 0 }} />

              {/* ── Profile header ── */}
              <div className="flex items-center gap-3 px-4 pt-3 pb-4 shrink-0">
                <div className="h-11 w-11 rounded-full overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[14px] font-bold text-foreground">{getInitials(USER_NAME)}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[17px] font-bold text-foreground leading-tight truncate">{USER_NAME}</p>
                  <p className="text-[12px] text-muted-foreground leading-tight mt-0.5">{USER_ROLE}</p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close menu"
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-muted/60 text-muted-foreground active:bg-muted transition-colors shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* ── Workspace selector ── */}
              <div className="px-4 pb-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setSheetOpen(true)}
                  className="w-full flex items-center gap-3 rounded-xl px-3.5 py-3 text-left active:opacity-70 transition-opacity"
                  style={{ backgroundColor: "#F5F5F5" }}
                >
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-bold text-primary leading-none">
                      {selectedMid.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-foreground truncate leading-tight">{selectedMid.name}</p>
                    <p className="text-[11.5px] text-muted-foreground leading-tight mt-0.5">MID ····{selectedMid.maskedId}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground/50 shrink-0" strokeWidth={2} />
                </button>
              </div>

              {/* ── Nav — scrollable ── */}
              <nav
                className="flex-1 overflow-y-auto px-3 pb-3 space-y-5 [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: "none" }}
              >
                {DRAWER_NAV.map(section => (
                  <div key={section.label}>
                    <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/50 px-3 mb-1.5">
                      {section.label}
                    </p>
                    <div>
                      {section.items.map(item => {
                        const Icon   = item.icon;
                        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                        const rowClass = cn(
                          "flex items-center gap-3.5 px-3 w-full text-left transition-colors rounded-xl",
                          active ? "text-primary" : "active:bg-muted/50"
                        );
                        const inner = (
                          <>
                            <Icon
                              className={cn("shrink-0", active ? "text-primary" : "text-[#666666]")}
                              style={{ height: 22, width: 22 }}
                              strokeWidth={1.75}
                            />
                            <span className={cn(
                              "flex-1 min-w-0 truncate text-[15px]",
                              active ? "font-semibold text-primary" : "font-medium text-foreground"
                            )}>
                              {item.label}
                            </span>
                            {"badge" in item && item.badge ? (
                              <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                                {item.badge}
                              </span>
                            ) : null}
                            <ChevronRight
                              className={cn("h-4 w-4 shrink-0", active ? "text-primary/40" : "text-foreground/20")}
                              strokeWidth={2}
                            />
                          </>
                        );

                        if (item.href === "/settlement-reports" && onSettlementTap) {
                          return (
                            <button key={item.href} type="button"
                              onClick={() => { onClose(); onSettlementTap(); }}
                              className={rowClass} style={itemStyle}
                            >{inner}</button>
                          );
                        }
                        if (item.href === "/ebrc" && onEbrcTap) {
                          return (
                            <button key={item.href} type="button"
                              onClick={() => { onClose(); onEbrcTap(); }}
                              className={rowClass} style={itemStyle}
                            >{inner}</button>
                          );
                        }
                        if (item.href === "/dispute-management" && onDisputesTap) {
                          return (
                            <button key={item.href} type="button"
                              onClick={() => { onClose(); onDisputesTap(); }}
                              className={rowClass} style={itemStyle}
                            >{inner}</button>
                          );
                        }
                        if (item.href === "/client-management" && onClientManagementTap) {
                          return (
                            <button key={item.href} type="button"
                              onClick={() => { onClose(); onClientManagementTap(); }}
                              className={rowClass} style={itemStyle}
                            >{inner}</button>
                          );
                        }
                        if (item.href === "/team-management" && onTeamManagementTap) {
                          return (
                            <button key={item.href} type="button"
                              onClick={() => { onClose(); onTeamManagementTap(); }}
                              className={rowClass} style={itemStyle}
                            >{inner}</button>
                          );
                        }
                        if (item.href === "/settings/app" && onAppSettingsTap) {
                          return (
                            <button key={item.href} type="button"
                              onClick={() => { onClose(); onAppSettingsTap(); }}
                              className={rowClass} style={itemStyle}
                            >{inner}</button>
                          );
                        }
                        if (item.href === "/contact-support" && onContactSupportTap) {
                          return (
                            <button key={item.href} type="button"
                              onClick={() => { onClose(); onContactSupportTap(); }}
                              className={rowClass} style={itemStyle}
                            >{inner}</button>
                          );
                        }
                        if (item.href === "/add-feedback" && onAddFeedbackTap) {
                          return (
                            <button key={item.href} type="button"
                              onClick={() => { onClose(); onAddFeedbackTap(); }}
                              className={rowClass} style={itemStyle}
                            >{inner}</button>
                          );
                        }
                        return (
                          <Link key={item.href} href={item.href} onClick={onClose}
                            className={rowClass} style={itemStyle}>
                            {inner}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              {/* ── Sign out — pinned outside scroll ── */}
              <div className="shrink-0 border-t border-border/30">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3.5 px-6 text-left text-destructive active:bg-destructive/5 transition-colors"
                  style={{ minHeight: 52 }}
                >
                  <LogOut style={{ height: 22, width: 22 }} className="shrink-0" strokeWidth={1.75} />
                  <span className="text-[15px] font-medium">Sign out</span>
                </button>
                <div style={{ height: 24, flexShrink: 0 }} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AccountManagerSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        contained={contained}
        onSignOut={handleSignOut}
      />
    </>
  );
}
