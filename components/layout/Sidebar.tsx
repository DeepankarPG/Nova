"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Settings, X } from "lucide-react";
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
            ? "bg-white text-gray-900"
            : "text-gray-600 hover:bg-black/5 hover:text-gray-900"
        )}
        style={isParentActive
          ? { border: "1px solid #d0d4db", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }
          : {}}
      >
        <Icon
          className={cn("flex-shrink-0", !isParentActive && "text-gray-400")}
          style={{ width: 16, height: 16, color: isParentActive ? "#0061E3" : undefined }}
        />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            <span className="text-gray-400 flex-shrink-0">
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
            <div className="ml-[18px] mt-0.5 mb-1 pl-3 border-l-2"
              style={{ borderColor: "#c8ccd4" }}>
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
                        ? "text-gray-900 font-semibold"
                        : "text-gray-500 font-normal hover:text-gray-800 hover:bg-black/5"
                    )}
                  >
                    <span
                      className="absolute -left-3 top-1/2 -translate-y-1/2 w-2 h-px"
                      style={{ background: "#c8ccd4" }}
                    />
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
  return (
    <>
      <nav className="flex-1 overflow-y-auto py-3 px-2.5">
        {navigation.map((group) => (
          <div key={group.label} className="mb-4">
            {!collapsed ? (
              <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 px-2 mb-1.5">
                {group.label}
              </p>
            ) : (
              <div className="h-px bg-gray-200 my-2 mx-1" />
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
                        ? "bg-white text-gray-900"
                        : "text-gray-600 hover:bg-black/5 hover:text-gray-900"
                    )}
                    style={isActive
                      ? { border: "1px solid #d0d4db", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }
                      : {}}
                  >
                    <Icon
                      className={cn("flex-shrink-0", !isActive && "text-gray-400")}
                      style={{ width: 16, height: 16, color: isActive ? "#0061E3" : undefined }}
                    />
                    {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full tracking-widest text-white"
                        style={{ background: "#0061E3", letterSpacing: "0.06em" }}>
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
      <div className="px-2.5 py-2.5 flex-shrink-0" style={{ borderTop: "1px solid #d8dce3" }}>
        <div className={cn(
          "flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-200/60 transition-colors cursor-pointer",
          collapsed && "justify-center"
        )}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "#374151" }}>
            <span className="text-white text-[11px] font-bold">N</span>
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 text-[13px] font-medium truncate leading-tight">Deepankar Raj</p>
                <p className="text-gray-400 text-[11px]">Admin</p>
              </div>
              <button className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors flex-shrink-0">
                <Settings style={{ width: 16, height: 16 }} />
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

  const sidebarStyle = { background: "#e8eaee", borderRight: "1px solid #d8dce3" } as const;

  return (
    <>
      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <motion.aside
        animate={{ width: collapsed ? 60 : 232 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="relative hidden md:flex flex-col h-screen flex-shrink-0 z-20 overflow-hidden"
        style={sidebarStyle}
      >
        {/* Logo + collapse toggle */}
        <div className="flex items-center justify-between px-3.5 h-[57px] flex-shrink-0"
          style={{ borderBottom: "1px solid #d8dce3" }}>
          <AnimatePresence mode="wait">
            {!collapsed ? (
              <motion.div key="full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }} className="flex items-center">
                <Image src="/payglocal-logo.png" alt="PayGlocal"
                  width={120} height={28} className="object-contain" priority />
              </motion.div>
            ) : (
              <motion.div key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden"
                style={{ background: "#0061E3" }}>
                <Image src="/payglocal-logo.png" alt="P"
                  width={20} height={20}
                  className="object-contain brightness-0 invert scale-[2] translate-x-[-6px]" priority />
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={() => setCollapsed(!collapsed)}
            className="w-6 h-6 rounded-md flex items-center justify-center transition-colors flex-shrink-0 text-gray-400 hover:text-gray-600 hover:bg-gray-200">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
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
            className="fixed left-0 top-0 flex flex-col h-screen w-[232px] z-40 overflow-hidden md:hidden"
            style={sidebarStyle}
          >
            {/* Logo + close button */}
            <div className="flex items-center justify-between px-3.5 h-[57px] flex-shrink-0"
              style={{ borderBottom: "1px solid #d8dce3" }}>
              <Image src="/payglocal-logo.png" alt="PayGlocal"
                width={120} height={28} className="object-contain" priority />
              <button onClick={onClose}
                className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors">
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
