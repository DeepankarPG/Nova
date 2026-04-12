"use client";

import { Fragment, useCallback, useMemo, useRef, useState } from "react";
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
import { ViewPortal } from "@/components/layout/ViewPortal";
import {
  navigation,
  resolveShortcutHref,
  type NavChild,
  type NavItem,
} from "@/lib/navigation";
import { NavShortcuts } from "@/components/layout/NavShortcuts";
import { useNavShortcuts } from "@/hooks/useNavShortcuts";
import { useProfileAvatar } from "@/hooks/useProfileAvatar";

const SIDEBAR_USER_NAME = "Deepankar Raj";

function profileInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0] + parts[parts.length - 1]![0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function pathnameMatchesNavHref(
  pathname: string,
  href: string,
  exactMatch?: boolean,
): boolean {
  if (href === "/") return pathname === "/";
  if (exactMatch) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function childDefinesOpenSubtree(pathname: string, child: NavChild): boolean {
  return pathnameMatchesNavHref(pathname, child.href, child.exactMatch);
}

/** Primary nav row is “selected” unless the same href is shown as selected via Shortcuts. */
function primaryLinkActive(
  href: string,
  pathname: string,
  shortcutPreferredHref: string | null,
  shortcutHrefSet: Set<string>,
  exactMatch?: boolean,
): boolean {
  const matches = pathnameMatchesNavHref(pathname, href, exactMatch);
  if (!matches) return false;
  if (shortcutPreferredHref === href && shortcutHrefSet.has(href)) return false;
  return true;
}

/* ── Expandable nav item with branch-line children ───────────────────────── */
function ExpandableItem({
  item,
  pathname,
  collapsed,
  onNavClick,
  shortcutPreferredHref,
  shortcutHrefSet,
  onPrimaryNavLinkClick,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
  onNavClick?: () => void;
  shortcutPreferredHref: string | null;
  shortcutHrefSet: Set<string>;
  onPrimaryNavLinkClick: () => void;
}) {
  const Icon = item.icon;

  const childActive =
    item.children?.some((c) => childDefinesOpenSubtree(pathname, c)) ?? false;

  const [open, setOpen] = useState(childActive);
  const childPrimaryActive =
    item.children?.some((c) =>
      primaryLinkActive(
        c.href,
        pathname,
        shortcutPreferredHref,
        shortcutHrefSet,
        c.exactMatch
      )
    ) ?? false;
  const parentSelfActive = primaryLinkActive(
    item.href,
    pathname,
    shortcutPreferredHref,
    shortcutHrefSet
  );
  const isParentActive = parentSelfActive || childPrimaryActive;

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
            <div className="ml-[18px] mt-0.5 mb-1 pl-3 border-l-2 border-sidebar-border/90">
              {item.children!.map((child) => {
                const isChildActive = primaryLinkActive(
                  child.href,
                  pathname,
                  shortcutPreferredHref,
                  shortcutHrefSet,
                  child.exactMatch
                );
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={() => {
                      onPrimaryNavLinkClick();
                      onNavClick?.();
                    }}
                    className={cn(
                      "relative flex items-center py-1.5 pl-1 pr-2 text-[13px] rounded-md transition-colors duration-100",
                      isChildActive
                        ? "text-primary font-semibold"
                        : "text-sidebar-foreground/95 font-medium hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                    )}
                  >
                    <span className="absolute -left-3 top-1/2 -translate-y-1/2 h-px w-2 bg-sidebar-border/90" />
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
  const { avatarUrl, setFromFile } = useProfileAvatar();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { hydrated, rows, pinHref, unpinHref } = useNavShortcuts();
  const shortcutHrefSet = useMemo(() => new Set(rows.map((r) => r.href)), [rows]);
  const [shortcutPreferredHref, setShortcutPreferredHref] = useState<string | null>(null);
  const canonicalHref = resolveShortcutHref(pathname);
  const displayShortcutPref =
    shortcutPreferredHref != null && canonicalHref === shortcutPreferredHref
      ? shortcutPreferredHref
      : null;

  const clearShortcutSelection = () => setShortcutPreferredHref(null);

  const handleLogout = useCallback(() => {
    onNavClick?.();
    toast.success("Signed out");
    router.push("/");
  }, [onNavClick, router]);

  return (
    <>
      <nav className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-2.5 py-3">
        {navigation.map((group) => (
          <Fragment key={group.label || "more"}>
            {group.label === "Finance" && (
              <NavShortcuts
                collapsed={collapsed}
                pathname={pathname}
                onNavClick={onNavClick}
                hydrated={hydrated}
                rows={rows}
                pinHref={pinHref}
                unpinHref={unpinHref}
                shortcutPreferredHref={displayShortcutPref}
                onShortcutNavigate={setShortcutPreferredHref}
              />
            )}
            <div className="mb-4">
              {!collapsed && group.label.trim() ? (
                <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground px-2 mb-1.5">
                  {group.label}
                </p>
              ) : null}
              {collapsed ? (
                <div className="h-px bg-sidebar-border my-2 mx-1" />
              ) : null}

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
                      shortcutPreferredHref={displayShortcutPref}
                      shortcutHrefSet={shortcutHrefSet}
                      onPrimaryNavLinkClick={clearShortcutSelection}
                    />
                  );
                }

                const isActive = primaryLinkActive(
                  item.href,
                  pathname,
                  displayShortcutPref,
                  shortcutHrefSet
                );
                const Icon = item.icon;

                return (
                  <Link key={item.href} href={item.href}
                    onClick={() => {
                      clearShortcutSelection();
                      onNavClick?.();
                    }}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[14px] font-medium transition-all duration-100",
                      isActive
                        ? "bg-card text-foreground border border-border shadow-sm"
                        : "text-sidebar-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                    )}
                  >
                    {item.navMarkSrc ? (
                      <img
                        src={item.navMarkSrc}
                        alt=""
                        width={16}
                        height={16}
                        className={cn(
                          "h-4 w-4 shrink-0 object-contain",
                          !isActive &&
                            "opacity-[0.72] saturate-[0.92] dark:opacity-[0.78]",
                          isActive && "opacity-100"
                        )}
                        draggable={false}
                      />
                    ) : (
                    <Icon
                      className={cn(
                        "flex-shrink-0",
                        !isActive && "text-muted-foreground",
                        isActive && "text-primary"
                      )}
                      style={{ width: 16, height: 16 }}
                    />
                    )}
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
          </Fragment>
        ))}
      </nav>

      {/* Profile: row 1 = profile + settings; row 2 = log out */}
      <div className="flex-shrink-0 border-t border-sidebar-border px-2.5 py-2.5">
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            void setFromFile(file)
              .then(() => toast.success("Profile photo updated"))
              .catch(() => toast.error("Could not use that image. Try a JPG or PNG."));
          }}
        />
        <div
          className={cn(
            "rounded-lg px-2 py-1.5",
            collapsed ? "flex flex-col items-center gap-2" : "flex flex-col gap-2"
          )}
        >
          {!collapsed ? (
            <>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className={cn(
                    "group flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1.5 py-1 text-left",
                    "transition-colors hover:bg-black/5 dark:hover:bg-white/5",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                  aria-label="Change profile photo"
                  title="Change profile photo"
                >
                  <span
                    className={cn(
                      "relative flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full",
                      "ring-2 ring-transparent transition-[box-shadow] group-hover:ring-primary/35"
                    )}
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-muted-foreground text-[11px] font-bold text-background">
                        {profileInitials(SIDEBAR_USER_NAME)}
                      </span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium leading-tight text-foreground">
                      {SIDEBAR_USER_NAME}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Admin</p>
                  </div>
                </button>
                <Link
                  href="/settings"
                  onClick={onNavClick}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Settings"
                  title="Settings"
                >
                  <Settings className="h-4 w-4" strokeWidth={2} />
                </Link>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-lg border border-sidebar-border",
                  "bg-black/[0.04] px-3 py-2 text-[12px] font-semibold text-sidebar-foreground",
                  "transition-colors hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1]"
                )}
              >
                <LogOut className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                Log out
              </button>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className={cn(
                    "relative flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full",
                    "ring-2 ring-transparent transition-[box-shadow,background-color]",
                    "hover:bg-black/5 hover:ring-primary/35 dark:hover:bg-white/5",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                  aria-label="Change profile photo"
                  title="Change profile photo"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile photo" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-muted-foreground text-[11px] font-bold text-background">
                      {profileInitials(SIDEBAR_USER_NAME)}
                    </span>
                  )}
                </button>
                <Link
                  href="/settings"
                  onClick={onNavClick}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Settings"
                  title="Settings"
                >
                  <Settings className="h-4 w-4" strokeWidth={2} />
                </Link>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Log out"
                title="Log out"
              >
                <LogOut className="h-4 w-4" strokeWidth={2} aria-hidden />
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
        className="relative z-20 hidden h-full min-h-0 flex-shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar md:flex"
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

      {/* ── Mobile nav: portaled so fixed layers cover full viewport (no transform ancestors) ── */}
      <ViewPortal>
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-30 min-h-[100dvh] w-full bg-black/40 md:hidden"
                onClick={onClose}
              />
              <motion.aside
                key="mobile-drawer"
                initial={{ x: -260 }}
                animate={{ x: 0 }}
                exit={{ x: -260 }}
                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                className="fixed left-0 top-0 z-40 flex h-screen min-h-[100dvh] w-[232px] flex-col overflow-hidden border-r border-sidebar-border bg-sidebar md:hidden"
              >
                {/* Logo + close button */}
                <div className="flex h-[57px] flex-shrink-0 items-center justify-between border-b border-sidebar-border px-3.5">
                  <Image
                    src="/payglocal-logo.png"
                    alt="PayGlocal"
                    width={120}
                    height={28}
                    className="object-contain"
                    priority
                  />
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <SidebarBody collapsed={false} pathname={pathname} onNavClick={onClose} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </ViewPortal>
    </>
  );
}
