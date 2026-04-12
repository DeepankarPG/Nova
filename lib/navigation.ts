import {
  LayoutDashboard,
  ArrowLeftRight,
  ShoppingCart,
  FileText,
  AlertTriangle,
  Receipt,
  BadgeCheck,
  MoreHorizontal,
  Store,
  BrainCircuit,
  type LucideIcon,
} from "lucide-react";

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
   * When set, sidebar shows this raster/SVG mark in the 16×16 icon slot instead of `icon`
   * (e.g. Echo wordmark bars). `icon` remains for fallbacks / typing.
   */
  navMarkSrc?: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navigation: NavGroup[] = [
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
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "Payments",
    items: [
      { label: "Transactions",          href: "/transactions",          icon: ArrowLeftRight },
      {
        label: "Payment Products",
        href:  "/payment-products",
        icon:  ShoppingCart,
        children: [
          { label: "International accounts", href: "/payment-products/international-accounts" },
          { label: "Payment Links",           href: "/payment-products/payment-links"   },
          { label: "Invoice Links",           href: "/payment-products/invoice-links"   },
          { label: "Payment Button",          href: "/payment-products/payment-button"  },
        ],
      },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Settlement Reports",  href: "/settlement-reports",  icon: FileText  },
      { label: "Invoice Management",  href: "/invoice-management",  icon: Receipt,  badge: "NEW" },
      { label: "eBRC",                href: "/ebrc",                icon: BadgeCheck },
    ],
  },
  {
    label: "Risk",
    items: [
      { label: "Dispute Management", href: "/dispute-management", icon: AlertTriangle, badge: "NEW" },
    ],
  },
  {
    label: "AI Storefront",
    items: [
      {
        label: "AI Storefront",
        href: "/ai-storefront",
        icon: Store,
        badge: "NEW",
        children: [
          { label: "Overview", href: "/ai-storefront", exactMatch: true },
          { label: "Setup", href: "/ai-storefront/setup", exactMatch: true },
          { label: "Catalogue", href: "/ai-storefront/catalogue" },
          { label: "Inventory", href: "/ai-storefront/inventory" },
          { label: "Store & AI", href: "/ai-storefront/settings" },
          { label: "Preview", href: "/ai-storefront/preview" },
        ],
      },
    ],
  },
  {
    label: "",
    items: [
      {
        label: "More",
        href:  "/settings",
        icon:  MoreHorizontal,
        children: [
          { label: "Client Management", href: "/client-management" },
          { label: "Developer", href: "/settings/developer" },
          { label: "Payments", href: "/settings/payments" },
          { label: "Security", href: "/settings/security" },
          { label: "Branding", href: "/settings/business/branding" },
        ],
      },
    ],
  },
];

/** Sidebar “Shortcuts”: flat routes (parent + children) for recent/pinned links. */
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

const shortcutRoutes = buildShortcutRoutes(navigation);

const shortcutRouteByHref = new Map<string, ShortcutRoute>(
  shortcutRoutes.map((r) => [r.href, r])
);

/** Longest nav href that matches `pathname` (for storing a single canonical shortcut). */
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
 * Uses the same longest-prefix rules as shortcuts so nested routes map to the right nav label.
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
