"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { navigation, type NavItem } from "@/lib/navigation";

/* ── Expandable nav item with branch-line children ───────────────────────── */
function ExpandableItem({
  item, pathname, collapsed, onNavClick,
}: { item: NavItem; pathname: string; collapsed: boolean; onNavClick?: () => void }) {
  const Icon = item.icon;

  const childActive = item.children?.some(c =>
    c.href === pathname || pathname.startsWith(c.href + "/")
  ) ?? false;

  const [open, setOpen] = useState(childActive);
  const isParentActive = pathname === item.href || childActive;

  return (
    <div>
      <button
        onClick={() => !collapsed && setOpen(o => !o)}
        title={collapsed ? item.label : undefined}
        className={cn(
          "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[14px] font-medium transition-all duration-100 text-left",
          isParentActive
            ? "bg-card text-foreground border border-border shadow-sm"
            : "text-sidebar-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
        )}
      >
        <Icon
          className={cn("flex-shrink-0", !isParentActive && "text-muted-foreground", isParentActive && "text-primary")}
          style={{ width: 16, height: 16 }}
        />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            <span className="text-muted-foreground flex-shrink-0">
              {open
                ? <ChevronUp  style={{ width: 13, height: 13 }} />
                : <ChevronDown style={{ width: 13, height: 13 }} />
              }
            </span>
          </>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && !collapsed && (
          <motion.div
            key="children"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="ml-[18px] mt-0.5 mb-1 pl-3 border-l-2 border-border">
              {item.children!.map((child) => {
                const isChildActive = pathname === child.href || pathname.startsWith(child.href + "/");
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={onNavClick}
                    className={cn(
                      "relative flex items-center py-1.5 pl-1 pr-2 text-[13px] rounded-md transition-colors duration-100",
                      isChildActive
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground font-normal hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                    )}
                  >
                    <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-2 h-px bg-border" />
                    {child.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Shared sidebar body ─────────────────────────────────────────────────── */
function SidebarBody({
  collapsed, pathname, onNavClick,
}: { collapsed: boolean; pathname: string; onNavClick?: () => void }) {
  const router = useRouter();

  return (
    <>
      <nav className="flex-1 overflow-y-auto py-3 px-2.5">
        {navigation.map((group) => (
          <div key={group.label} className="mb-4">
            {!collapsed ? (
              <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground px-2 mb-1.5">
                {group.label}
              </p>
            ) : (
              <div className="h-px bg-sidebar-border my-2 mx-1" />
            )}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                if (item.children) {
                  return (
                    <ExpandableItem
                      key={item.href}
                      item={item}
                      pathname={pathname}
                      collapsed={collapsed}
                      onNavClick={onNavClick}
                    />
                  );
                }

                const isActive = item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link key={item.href} href={item.href}
                    onClick={onNavClick}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[14px] font-medium transition-all duration-100",
                      isActive
                        ? "bg-card text-foreground border border-border shadow-sm"
                        : "text-sidebar-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "flex-shrink-0",
                        !isActive && "text-muted-foreground",
                        isActive && "text-primary"
                      )}
                      style={{ width: 16, height: 16 }}
                    />
                    {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span
                        className="text-[9.5px] font-bold px-2 py-0.5 rounded-full tracking-widest text-primary-foreground bg-primary"
                        style={{ letterSpacing: "0.06em" }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Profile */}
      <div className="px-2.5 py-2.5 flex-shrink-0 border-t border-sidebar-border">
        <div
          className={cn(
            "flex gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5",
            collapsed ? "flex-col items-center justify-center gap-1" : "cursor-pointer items-center"
          )}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-muted-foreground">
            <span className="text-background text-[11px] font-bold">N</span>
          </div>
          {!collapsed ? (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-[13px] font-medium truncate leading-tight">Deepankar Raj</p>
                <p className="text-muted-foreground text-[11px]">Admin</p>
              </div>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <Link
                  href="/settings"
                  onClick={onNavClick}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Settings"
                  title="Settings"
                >
                  <Settings style={{ width: 16, height: 16 }} strokeWidth={2} />
                </Link>
                <button
                  type="button"
                  className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Log out"
                  onClick={() => {
                    onNavClick?.();
                    toast.success("Signed out");
                    router.push("/");
                  }}
                >
                  <LogOut style={{ width: 16, height: 16 }} strokeWidth={2} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/settings"
                onClick={onNavClick}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Settings"
                title="Settings"
              >
                <Settings style={{ width: 16, height: 16 }} strokeWidth={2} />
              </Link>
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Log out"
                title="Log out"
                onClick={() => {
                  onNavClick?.();
                  toast.success("Signed out");
                  router.push("/");
                }}
              >
                <LogOut style={{ width: 16, height: 16 }} strokeWidth={2} />
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Sidebar ──────────────────────────────────────────────────────────────── */
interface SidebarProps {
  mobileOpen?: boolean;
  onClose?:    () => void;
}

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname  = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <motion.aside
        animate={{ width: collapsed ? 60 : 232 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="relative hidden md:flex flex-col h-screen flex-shrink-0 z-20 overflow-hidden bg-sidebar border-r border-sidebar-border"
      >
        {/* Logo (expanded only) + collapse toggle */}
        <div
          className={cn(
            "flex h-[57px] flex-shrink-0 items-center border-b border-sidebar-border",
            collapsed ? "justify-center px-2" : "justify-between px-3.5"
          )}
        >
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                key="full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="flex min-w-0 items-center"
              >
                <Image
                  src="/payglocal-logo.png"
                  alt="PayGlocal"
                  width={120}
                  height={28}
                  className="object-contain"
                  priority
                />
              </motion.div>
            )}
          </AnimatePresence>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex flex-shrink-0 items-center justify-center rounded-lg transition-colors",
              "text-muted-foreground hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10",
              collapsed ? "h-9 w-9" : "h-8 w-8"
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
            ) : (
              <PanelLeftClose className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
            )}
          </button>
        </div>

        <SidebarBody collapsed={collapsed} pathname={pathname} />
      </motion.aside>

      {/* ── Mobile overlay backdrop ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            key="mobile-drawer"
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-0 top-0 flex flex-col h-screen w-[232px] z-40 overflow-hidden md:hidden bg-sidebar border-r border-sidebar-border"
          >
            {/* Logo + close button */}
            <div className="flex items-center justify-between px-3.5 h-[57px] flex-shrink-0 border-b border-sidebar-border">
              <Image src="/payglocal-logo.png" alt="PayGlocal"
                width={120} height={28} className="object-contain" priority />
              <button
                type="button"
                onClick={onClose}
                className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <SidebarBody collapsed={false} pathname={pathname} onNavClick={onClose} />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
