import {
  LayoutDashboard,
  ArrowLeftRight,
  FileText,
  AlertTriangle,
  Receipt,
  BadgeCheck,
  MoreHorizontal,
  BrainCircuit,
  Users,
  Shield,
  Link2,
  AppWindow,
  MousePointerClick,
  Zap,
  RefreshCw,
  Globe,
  ArrowDownToLine,
  HelpCircle,
  Key,
  CreditCard,
  BarChart3,
  CalendarClock,
  BookOpen,
  TrendingUp,
  Settings2,
  Package2,
  type LucideIcon,
} from "lucide-react";
import type { PortalRole, ProductTab } from "./workspace-types";

/** Child link; `exactMatch` = only highlight when pathname equals `href` (hub rows like /settings). */
export type NavChild = {
  label: string;
  href: string;
  exactMatch?: boolean;
};

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  children?: NavChild[];
  /**
   * When set, sidebar shows this raster/SVG mark in the 16x16 icon slot instead of `icon`.
   * `icon` remains for fallbacks and typing.
   */
  navMarkSrc?: string;
  /** undefined = visible to all roles */
  roles?: PortalRole[];
};

export type NavGroup = {
  label: string;
  items: NavItem[];
  /** undefined = visible to all roles */
  roles?: PortalRole[];
  /** Groups with the same sectionId are wrapped together in a visual box */
  sectionId?: string;
};

/**
 * Returns the navigation set for a given portal role and active product tab.
 * Each tab returns a completely distinct, purpose-built nav rather than a filtered subset.
 * Echo is always the first item regardless of tab.
 */
export function getNavigation(role: PortalRole, productTab: ProductTab = "home"): NavGroup[] {
  if (role === "partner") return partnerNav;
  if (role === "internal") return internalNav;

  switch (productTab) {
    case "pg":      return pgNav;
    case "mca":     return mcaNav;
    case "partner": return partnerNav;
    default:        return homeNav;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   HOME  (tab: "home")
   Cross-product hub. Shortcuts are shown here only.
   Shows aggregate view, operational tools, and account configuration.
───────────────────────────────────────────────────────────────────────────── */
export const homeNav: NavGroup[] = [
  {
    label: "Assistant",
    items: [
      {
        label: "Echo",
        href: "/echo",
        icon: BrainCircuit,
        badge: "AI",
        navMarkSrc: "/echo_logo.svg",
      },
    ],
  },
  {
    label: "Overview",
    sectionId: "main",
    items: [
      { label: "Dashboard",    href: "/",         icon: LayoutDashboard },
      { label: "All Products", href: "/products", icon: BarChart3 },
      { label: "Reports",      href: "/reports",  icon: FileText },
    ],
  },
  {
    label: "Operations",
    sectionId: "main",
    items: [
      { label: "Mandates",           href: "/mandates",           icon: CalendarClock },
      { label: "Dispute Management", href: "/dispute-management", icon: AlertTriangle, badge: "NEW" },
      { label: "Scheduler",          href: "/scheduler",          icon: RefreshCw },
    ],
  },
  {
    label: "Configure",
    sectionId: "main",
    items: [
      { label: "Users & Roles",  href: "/settings/users",     icon: Users },
      { label: "Key Management", href: "/settings/developer", icon: Key },
      { label: "MID Management", href: "/settings/payments",  icon: CreditCard },
    ],
  },
  {
    label: "",
    sectionId: "main",
    items: [
      {
        label: "More",
        href:  "/settings",
        icon:  MoreHorizontal,
        children: [
          { label: "Branding",  href: "/settings/business/branding" },
          { label: "Security",  href: "/settings/security" },
          { label: "Tax",       href: "/settings/business/tax" },
          { label: "Support",   href: "/settings/support" },
        ],
      },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   PAYMENT GATEWAY  (tab: "pg")
   Transaction-first. Merchants processing online payments.
───────────────────────────────────────────────────────────────────────────── */
export const pgNav: NavGroup[] = [
  {
    label: "Assistant",
    items: [
      {
        label: "Echo",
        href: "/echo",
        icon: BrainCircuit,
        badge: "AI",
        navMarkSrc: "/echo_logo.svg",
      },
    ],
  },
  {
    label: "Overview",
    sectionId: "main",
    items: [
      { label: "Overview",     href: "/",                  icon: LayoutDashboard },
      { label: "Transactions", href: "/transactions",      icon: ArrowLeftRight },
      { label: "Settlements",  href: "/settlement-reports", icon: ArrowDownToLine },
    ],
  },
  {
    label: "Payment Products",
    sectionId: "main",
    items: [
      { label: "Payment Links",  href: "/payment-products/payment-links",  icon: Link2 },
      { label: "Payment Pages",  href: "/payment-products/payment-pages",  icon: AppWindow },
      { label: "Payment Button", href: "/payment-products/payment-button", icon: MousePointerClick },
      { label: "Flash",          href: "/payment-products/flash",          icon: Zap,      badge: "NEW" },
      { label: "Subscriptions",  href: "/payment-products/subscriptions",  icon: RefreshCw },
    ],
  },
  {
    label: "Risk & Compliance",
    sectionId: "main",
    items: [
      { label: "Dispute Management", href: "/dispute-management", icon: AlertTriangle, badge: "NEW" },
      { label: "eBRC",               href: "/ebrc",               icon: BadgeCheck },
    ],
  },
  {
    label: "",
    sectionId: "main",
    items: [
      { label: "Customers",  href: "/customers",          icon: Users },
      { label: "Reports",    href: "/reports",            icon: FileText },
      { label: "Developer",  href: "/settings/developer", icon: Key },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   MULTI-CURRENCY ACCOUNTS  (tab: "mca")
   Invoice-first. Merchants receiving cross-border payments.
───────────────────────────────────────────────────────────────────────────── */
export const mcaNav: NavGroup[] = [
  {
    label: "Assistant",
    items: [
      {
        label: "Echo",
        href: "/echo",
        icon: BrainCircuit,
        badge: "AI",
        navMarkSrc: "/echo_logo.svg",
      },
    ],
  },
  {
    label: "Overview",
    sectionId: "main",
    items: [
      { label: "Overview", href: "/", icon: LayoutDashboard },
      {
        label: "Invoices",
        href:  "/invoice-management",
        icon:  Receipt,
        badge: "NEW",
        children: [
          { label: "Active",    href: "/invoice-management/active" },
          { label: "Drafts",    href: "/invoice-management/drafts" },
          { label: "Recurring", href: "/invoice-management/recurring" },
        ],
      },
      {
        label: "Invoice Links",
        href:  "/payment-products/invoice-links",
        icon:  FileText,
        children: [
          { label: "Invoice Links",   href: "/payment-products/invoice-links" },
          { label: "Create Invoice",  href: "/invoice-management/create", exactMatch: true },
        ],
      },
      { label: "Reports", href: "/reports", icon: FileText },
    ],
  },
  {
    label: "Accounts & Payments",
    sectionId: "main",
    items: [
      { label: "International Accounts", href: "/payment-products/international-accounts", icon: Globe },
      { label: "Platform Withdrawal",    href: "/platform-withdrawal",                     icon: ArrowDownToLine },
      { label: "Unmapped Payments",      href: "/unmapped-payments",                       icon: HelpCircle },
    ],
  },
  {
    label: "",
    sectionId: "main",
    items: [
      { label: "SKU management", href: "/sku-management", icon: Package2 },
      { label: "Clients", href: "/client-management", icon: Users },
      {
        label: "eBRC",
        href:  "/ebrc",
        icon:  BadgeCheck,
        children: [
          { label: "eBRC Generation", href: "/ebrc/generation" },
          { label: "IRM Repository",  href: "/ebrc/irm-repository" },
        ],
      },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   PARTNERS  (tab: "partner", role: "partner")
   Affiliate / reseller network view.
───────────────────────────────────────────────────────────────────────────── */
export const partnerNav: NavGroup[] = [
  {
    label: "Assistant",
    items: [
      {
        label: "Echo",
        href: "/echo",
        icon: BrainCircuit,
        badge: "AI",
        navMarkSrc: "/echo_logo.svg",
      },
    ],
  },
  {
    label: "Overview",
    sectionId: "partner",
    items: [
      { label: "Overview", href: "/partner/overview", icon: LayoutDashboard },
      { label: "Earnings",  href: "/partner/earnings", icon: TrendingUp },
    ],
  },
  {
    label: "Network",
    sectionId: "partner",
    items: [
      {
        label: "Affiliate Accounts",
        href:  "/partner/sub-merchants",
        icon:  Users,
        children: [
          { label: "Sub-merchants", href: "/partner/sub-merchants" },
          { label: "Monitoring",    href: "/partner/monitoring" },
        ],
      },
    ],
  },
  {
    label: "",
    sectionId: "partner",
    items: [
      { label: "Reports",          href: "/partner/reports",   icon: FileText },
      { label: "Partner Settings", href: "/partner/settings",  icon: Settings2 },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   INTERNAL  (role: "internal" only)
───────────────────────────────────────────────────────────────────────────── */
export const internalNav: NavGroup[] = [
  {
    label: "Assistant",
    items: [
      {
        label: "Echo",
        href: "/echo",
        icon: BrainCircuit,
        badge: "AI",
        navMarkSrc: "/echo_logo.svg",
      },
    ],
  },
  {
    label: "Overview",
    sectionId: "main",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "Admin",
    sectionId: "main",
    items: [
      { label: "All Merchants", href: "/internal/merchants", icon: Users },
      { label: "Admin",         href: "/internal/admin",     icon: Shield },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   SHORTCUTS  (shown on Home tab only)
   Flat route index for recent/pinned links.
───────────────────────────────────────────────────────────────────────────── */
export type ShortcutRoute = {
  href: string;
  label: string;
  icon: LucideIcon;
};

function buildShortcutRoutes(groups: NavGroup[]): ShortcutRoute[] {
  const out: ShortcutRoute[] = [];
  for (const group of groups) {
    for (const item of group.items) {
      out.push({ href: item.href, label: item.label, icon: item.icon });
      if (item.children) {
        for (const child of item.children) {
          out.push({ href: child.href, label: child.label, icon: item.icon });
        }
      }
    }
  }
  return out;
}

// Build a unified shortcut index across all nav sets so shortcuts resolve
// regardless of which product tab the link was last visited from.
const allNavForShortcuts = [...homeNav, ...pgNav, ...mcaNav, ...partnerNav, ...internalNav];
const shortcutRoutes = buildShortcutRoutes(allNavForShortcuts);

const shortcutRouteByHref = new Map<string, ShortcutRoute>(
  shortcutRoutes.map((r) => [r.href, r])
);

/** Longest nav href that matches `pathname`. */
export function resolveShortcutHref(pathname: string): string | null {
  const sorted = [...shortcutRoutes].sort((a, b) => b.href.length - a.href.length);
  for (const { href } of sorted) {
    if (href === "/") {
      if (pathname === "/") return "/";
      continue;
    }
    if (pathname === href || pathname.startsWith(`${href}/`)) return href;
  }
  return null;
}

export function getShortcutRoute(href: string): ShortcutRoute | undefined {
  return shortcutRouteByHref.get(href);
}

/**
 * Human-readable screen name for the current pathname (Echo context chip, etc.).
 */
export function getEchoPageContextLabel(pathname: string): string {
  const path = pathname?.split("?")[0]?.trim() || "/";
  const href = resolveShortcutHref(path);
  if (href !== null) {
    const route = getShortcutRoute(href);
    if (route?.label) return route.label;
  }
  if (path === "/" || path === "") return "Dashboard";
  const segments = path.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last) return "Dashboard";
  return last
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Keep a legacy `navigation` export so any existing imports don't break.
export const navigation = homeNav;
