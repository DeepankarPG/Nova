"use client";

import { Fragment, useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Copy,
  LogOut,
  PanelLeftOpen,
  Settings,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ViewPortal } from "@/components/layout/ViewPortal";
import {
  getNavigation,
  resolveShortcutHref,
  type NavChild,
  type NavItem,
} from "@/lib/navigation";
import { NavShortcuts } from "@/components/layout/NavShortcuts";
import { useNavShortcuts } from "@/hooks/useNavShortcuts";
import { useProfileAvatar } from "@/hooks/useProfileAvatar";
import { useWorkspace } from "@/lib/workspace-context";
import { ALL_BUSINESSES_ID, type PortalRole, type ProductType } from "@/lib/workspace-types";
import Image from "next/image";

const WORDMARK_SRC = "/payglocal-logo.png";

/* ── Entity avatar ────────────────────────────────────────────────────────── */
function entityInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function profileInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function EntityAvatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const colors = [
    ["#e0f2fe", "#0369a1"],
    ["#fce7f3", "#9d174d"],
    ["#d1fae5", "#065f46"],
    ["#ede9fe", "#5b21b6"],
    ["#fef9c3", "#854d0e"],
    ["#fee2e2", "#991b1b"],
  ];
  const [bg, text] = colors[name.charCodeAt(0) % colors.length]!;
  const cls =
    size === "lg" ? "w-10 h-10 rounded-xl text-[15px] font-bold"
    : size === "md" ? "w-7 h-7 rounded-lg text-[12px] font-bold"
    : "w-5 h-5 rounded-md text-[9.5px] font-bold";
  return (
    <div className={cn("flex items-center justify-center flex-shrink-0", cls)}
      style={{ background: bg, color: text }}>
      {entityInitials(name)}
    </div>
  );
}

function ProductPill({ type }: { type: ProductType }) {
  return (
    <span
      className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide"
      style={type === "pg"
        ? { background: "#eff4ff", color: "#0047b0" }
        : { background: "#f0fdf4", color: "#166534" }}
    >
      {type === "pg" ? "PG" : "MCA"}
    </span>
  );
}

/* ── Entity Switcher Panel ─────────────────────────────────────────────────── */
function EntitySwitcherPanel({
  onClose,
  onLogout,
}: {
  onClose: () => void;
  onLogout: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    user, group, accessibleBusinesses, activeBusinessId, activeBusiness,
    setActiveBusiness,
  } = useWorkspace();
  const { avatarUrl } = useProfileAvatar();

  function selectBusiness(id: string | typeof ALL_BUSINESSES_ID) {
    setActiveBusiness(id);
    router.replace(`${pathname}?mid=${id}`);
    onClose();
  }

  const showAllOption = accessibleBusinesses.length > 1;

  return (
    <div
      className="absolute left-0 right-0 top-[calc(57px+64px+1px)] z-50 mx-2 rounded-2xl border border-border bg-popover text-popover-foreground overflow-hidden"
      style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.14), 0 2px 10px rgba(0,0,0,0.08)" }}
    >
      {/* ── Business list ── */}
      <div className="py-1.5">

        {showAllOption && (
          <button
            type="button"
            onClick={() => selectBusiness(ALL_BUSINESSES_ID)}
            className={cn(
              "w-full flex items-center gap-3 px-3.5 py-2.5 transition-colors text-left",
              activeBusinessId === ALL_BUSINESSES_ID ? "bg-muted/70" : "hover:bg-muted/40"
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <div className="w-3 h-3 rounded-full bg-primary/60" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground leading-tight">All Businesses</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{accessibleBusinesses.length} businesses</p>
            </div>
            {activeBusinessId === ALL_BUSINESSES_ID && (
              <Check className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={2.5} />
            )}
          </button>
        )}

        {accessibleBusinesses.map((biz) => {
          const isSelected = activeBusinessId === biz.id;
          return (
            <button
              key={biz.id}
              type="button"
              onClick={() => selectBusiness(biz.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3.5 py-2.5 transition-colors text-left",
                isSelected ? "bg-muted/70" : "hover:bg-muted/40"
              )}
            >
              <EntityAvatar name={biz.name} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[13px] font-semibold text-foreground truncate leading-tight">
                    {biz.name}
                  </p>
                  {biz.primaryAccount.products.map((p) => (
                    <ProductPill key={p} type={p} />
                  ))}
                </div>
                <p className="text-[10.5px] text-muted-foreground font-mono mt-0.5 truncate">
                  {biz.primaryAccount.mid}
                </p>
              </div>
              {isSelected && (
                <Check className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={2.5} />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div className="border-t border-border px-3 py-2.5">
        <button
          type="button"
          onClick={onClose}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-[12.5px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          + Create new MID
        </button>
      </div>
    </div>
  );
}

/* ── Nav helpers ─────────────────────────────────────────────────────────── */
function pathnameMatchesNavHref(pathname: string, href: string, exactMatch?: boolean): boolean {
  if (href === "/") return pathname === "/";
  if (exactMatch) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function childDefinesOpenSubtree(pathname: string, child: NavChild): boolean {
  return pathnameMatchesNavHref(pathname, child.href, child.exactMatch);
}

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

/* ── Expandable nav item ─────────────────────────────────────────────────── */
function ExpandableItem({
  item, pathname, collapsed, onNavClick,
  shortcutPreferredHref, shortcutHrefSet, onPrimaryNavLinkClick,
}: {
  item: NavItem; pathname: string; collapsed: boolean; onNavClick?: () => void;
  shortcutPreferredHref: string | null; shortcutHrefSet: Set<string>; onPrimaryNavLinkClick: () => void;
}) {
  const Icon = item.icon;
  const childActive = item.children?.some((c) => childDefinesOpenSubtree(pathname, c)) ?? false;
  const [open, setOpen] = useState(childActive);
  const childPrimaryActive =
    item.children?.some((c) =>
      primaryLinkActive(c.href, pathname, shortcutPreferredHref, shortcutHrefSet, c.exactMatch)
    ) ?? false;
  const parentSelfActive = primaryLinkActive(item.href, pathname, shortcutPreferredHref, shortcutHrefSet);
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
              {open ? <ChevronUp style={{ width: 13, height: 13 }} /> : <ChevronDown style={{ width: 13, height: 13 }} />}
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
                  child.href, pathname, shortcutPreferredHref, shortcutHrefSet, child.exactMatch
                );
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={() => { onPrimaryNavLinkClick(); onNavClick?.(); }}
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

/* ── Sidebar nav body (nav + profile footer) ─────────────────────────────── */
function SidebarBody({
  collapsed, pathname, onNavClick,
}: { collapsed: boolean; pathname: string; onNavClick?: () => void }) {
  const router = useRouter();
  const { hydrated, rows, pinHref, unpinHref } = useNavShortcuts();
  const shortcutHrefSet = useMemo(() => new Set(rows.map((r) => r.href)), [rows]);
  const [shortcutPreferredHref, setShortcutPreferredHref] = useState<string | null>(null);
  const canonicalHref = resolveShortcutHref(pathname);
  const displayShortcutPref =
    shortcutPreferredHref != null && canonicalHref === shortcutPreferredHref
      ? shortcutPreferredHref : null;
  const clearShortcutSelection = () => setShortcutPreferredHref(null);

  const { user, setRole, activeProductTab } = useWorkspace();
  const filteredNav = useMemo(
    () => getNavigation(user.role, activeProductTab),
    [user.role, activeProductTab]
  );
  const { avatarUrl, setFromFile } = useProfileAvatar();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = useCallback(() => {
    onNavClick?.();
    toast.success("Signed out");
    router.push("/");
  }, [onNavClick, router]);

  function renderGroup(group: typeof filteredNav[number]) {
    return (
      <Fragment key={group.label || "more"}>
        {group.label === "Operations" && activeProductTab === "home" && (
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
        <div className="mb-3">
          {!collapsed && group.label.trim() ? (
            <p className="text-[10.5px] font-semibold tracking-widest uppercase text-muted-foreground mb-1 px-2">
              {group.label}
            </p>
          ) : null}
          {collapsed ? <div className="h-px bg-sidebar-border my-2 mx-1" /> : null}
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

                  const isActive = primaryLinkActive(item.href, pathname, displayShortcutPref, shortcutHrefSet);
                  const Icon = item.icon;

                  return (
                    <Link key={item.href} href={item.href}
                      onClick={() => { clearShortcutSelection(); onNavClick?.(); }}
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
                            !isActive && "opacity-[0.72] saturate-[0.92] dark:opacity-[0.78]",
                            isActive && "opacity-100"
                          )}
                          draggable={false}
                        />
                      ) : (
                        <Icon
                          className={cn("flex-shrink-0", !isActive && "text-muted-foreground", isActive && "text-primary")}
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
        );
  }

  return (
    <>
      <nav className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-2.5 py-2.5 space-y-1.5">
        {filteredNav.map((group) => renderGroup(group))}
      </nav>

      {/* ── Profile footer (restored) ── */}
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
        <div className={cn(
          "rounded-lg px-2 py-1.5",
          collapsed ? "flex flex-col items-center gap-2" : "flex flex-col gap-2"
        )}>
          {!collapsed ? (
            <>
              <div className="flex items-center gap-1 group/profile rounded-lg px-1.5 py-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                {/* Avatar — click to change photo */}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  aria-label="Change profile photo"
                  title="Change profile photo"
                  className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-transparent hover:ring-primary/35 transition-[box-shadow]"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-muted-foreground text-[11px] font-bold text-background">
                      {profileInitials(user.name)}
                    </span>
                  )}
                </button>

                {/* Name + email */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium leading-tight text-foreground">{user.name}</p>
                  <div className="flex items-center gap-1 min-w-0">
                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                    <button
                      type="button"
                      onClick={() => { void navigator.clipboard.writeText(user.email); toast.success("Email copied"); }}
                      title="Copy email"
                      className="opacity-0 group-hover/profile:opacity-100 transition-opacity flex-shrink-0"
                    >
                      <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors" strokeWidth={2} />
                    </button>
                  </div>
                </div>

                {/* Settings */}
                <Link
                  href="/settings"
                  onClick={onNavClick}
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
                  "bg-card px-3 py-2 text-[12px] font-semibold",
                  "text-red-700 dark:text-red-400",
                  "transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                )}
              >
                <LogOut className="h-4 w-4 shrink-0 text-red-700 dark:text-red-400" strokeWidth={2} aria-hidden />
                Log out
              </button>
              <button
                type="button"
                onClick={() => { setRole("partner"); }}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-lg border border-sidebar-border",
                  "bg-card px-3 py-2 text-[12px] font-semibold text-sidebar-foreground",
                  "transition-colors hover:bg-muted dark:bg-card dark:hover:bg-muted"
                )}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted-foreground">
                  <path d="M18 21a8 8 0 0 0-16 0"/>
                  <circle cx="10" cy="8" r="5"/>
                  <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/>
                </svg>
                Switch to Partner view
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
                      {profileInitials(user.name)}
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
  onClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  const { user, group, activeBusiness } = useWorkspace();
  const businessLabel = activeBusiness ? activeBusiness.name : "All Businesses";

  const handleOutsideClick = useCallback((e: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
      setPanelOpen(false);
      document.removeEventListener("mousedown", handleOutsideClick);
    }
  }, []);

  const openPanel = () => {
    setPanelOpen(true);
    document.addEventListener("mousedown", handleOutsideClick);
  };

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    document.removeEventListener("mousedown", handleOutsideClick);
  }, [handleOutsideClick]);

  const togglePanel = () => { if (panelOpen) closePanel(); else openPanel(); };

  const handleLogout = useCallback(() => {
    closePanel();
    onClose?.();
    toast.success("Signed out");
    router.push("/");
  }, [closePanel, onClose, router]);

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <motion.aside
        ref={sidebarRef}
        animate={{ width: collapsed ? 60 : 232 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-20 hidden h-full min-h-0 flex-shrink-0 flex-col overflow-visible border-r border-sidebar-border bg-sidebar md:flex"
      >
        {/* ── Row 1: Branding + collapse ── */}
        <div
          className={cn(
            "flex h-[57px] flex-shrink-0 items-center border-b border-sidebar-border",
            collapsed ? "justify-center px-2" : "justify-between px-3.5"
          )}
        >
          {collapsed ? (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              title="Expand sidebar"
              aria-label="Expand sidebar"
              className="flex items-center justify-center"
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Image src="/PG-logo.svg" alt="PayGlocal" width={18} height={20} className="object-contain" />
              </div>
            </button>
          ) : (
            <>
              <Image
                src={WORDMARK_SRC}
                alt="PayGlocal"
                width={120}
                height={28}
                className="flex-shrink-0 object-contain"
                priority
                draggable={false}
              />
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect width="18" height="18" x="3" y="3" rx="2"/>
                  <path d="M9 3v18"/>
                </svg>
              </button>
            </>
          )}
        </div>

        {/* ── Row 2: Business selector pill ── */}
        <div className={cn("px-2.5 py-2.5 border-b border-sidebar-border")}>
          <button
            type="button"
            onClick={togglePanel}
            className={cn(
              "w-full flex items-center gap-2.5 rounded-lg border bg-card shadow-sm",
              "transition-colors border-border hover:border-border/80 hover:shadow-md",
              panelOpen ? "border-primary/30 shadow-md" : "",
              collapsed ? "justify-center p-2" : "px-3 py-2.5"
            )}
          >
            <EntityAvatar
              name={activeBusiness ? activeBusiness.name : group.name}
              size="md"
            />
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[13px] font-semibold text-foreground truncate leading-tight">
                    {businessLabel}
                  </p>
                  {activeBusiness && (
                    <p className="text-[10.5px] text-muted-foreground font-mono truncate mt-0.5">
                      {activeBusiness.primaryAccount.mid}
                    </p>
                  )}
                </div>
                <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" strokeWidth={2} />
              </>
            )}
          </button>
        </div>

        {/* ── Entity switcher panel ── */}
        <AnimatePresence>
          {panelOpen && (
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <EntitySwitcherPanel onClose={closePanel} onLogout={handleLogout} />
            </motion.div>
          )}
        </AnimatePresence>

        <SidebarBody collapsed={collapsed} pathname={pathname} />
      </motion.aside>

      {/* ── Mobile nav drawer ── */}
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
                <div className="flex h-[57px] flex-shrink-0 items-center justify-between border-b border-sidebar-border px-3.5">
                  <Image
                    src={WORDMARK_SRC}
                    alt="PayGlocal"
                    width={120}
                    height={28}
                    className="object-contain"
                    priority
                    draggable={false}
                  />
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2.5 border-b border-sidebar-border px-3.5 py-2.5">
                  <EntityAvatar name={activeBusiness ? activeBusiness.name : group.name} size="sm" />
                  <span className="text-[13px] font-semibold text-foreground truncate">{businessLabel}</span>
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
